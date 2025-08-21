#!/bin/bash

# 高级数据库备份脚本
# 功能：
# - 定时备份 MySQL 数据库
# - 自动压缩备份文件
# - 清理旧备份文件
# - 备份成功/失败通知
# - 支持多种备份策略

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/mysql"
LOG_FILE="$BACKUP_DIR/backup.log"

# 数据库配置
DB_CONTAINER="seek-self-mysql"
DB_NAME="seek_self"
DB_USER="root"
DB_PASSWORD="root123456"

# 备份配置
MAX_BACKUP_DAYS=30        # 保留备份天数
MAX_BACKUP_COUNT=100      # 最大备份文件数
COMPRESS_BACKUP=true      # 是否压缩备份
BACKUP_NAME_PREFIX="seek_self_backup"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message"
            echo "[$timestamp] [INFO] $message" >> "$LOG_FILE"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            echo "[$timestamp] [WARN] $message" >> "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            echo "[$timestamp] [ERROR] $message" >> "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            echo "[$timestamp] [SUCCESS] $message" >> "$LOG_FILE"
            ;;
    esac
}

# 创建备份目录
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "INFO" "创建备份目录: $BACKUP_DIR"
    fi
}

# 检查 Docker 容器状态
check_container() {
    if ! docker ps --format "table {{.Names}}" | grep -q "$DB_CONTAINER"; then
        log "ERROR" "数据库容器 $DB_CONTAINER 未运行"
        return 1
    fi
    
    # 检查数据库连接
    if ! docker exec "$DB_CONTAINER" mysqladmin ping -h localhost -u "$DB_USER" -p"$DB_PASSWORD" >/dev/null 2>&1; then
        log "ERROR" "无法连接到数据库"
        return 1
    fi
    
    log "INFO" "数据库容器状态正常"
    return 0
}

# 执行数据库备份
backup_database() {
    local backup_date=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/${BACKUP_NAME_PREFIX}_${backup_date}.sql"
    local compressed_file="${backup_file}.gz"
    
    log "INFO" "开始备份数据库: $DB_NAME"
    log "INFO" "备份文件: $backup_file"
    
    # 执行备份
    if docker exec "$DB_CONTAINER" mysqldump \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --no-tablespaces \
        --skip-lock-tables \
        --add-drop-database \
        --databases "$DB_NAME" > "$backup_file" 2>/dev/null; then
        
        log "SUCCESS" "数据库备份成功"
        
        # 压缩备份文件
        if [ "$COMPRESS_BACKUP" = true ]; then
            log "INFO" "正在压缩备份文件..."
            if gzip "$backup_file"; then
                log "SUCCESS" "备份文件压缩成功: $compressed_file"
                backup_file="$compressed_file"
            else
                log "WARN" "备份文件压缩失败，保留原文件"
            fi
        fi
        
        # 显示备份文件信息
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "INFO" "备份文件大小: $file_size"
        
        return 0
    else
        log "ERROR" "数据库备份失败"
        # 清理失败的备份文件
        [ -f "$backup_file" ] && rm -f "$backup_file"
        return 1
    fi
}

# 清理旧备份文件
cleanup_old_backups() {
    log "INFO" "开始清理旧备份文件..."
    
    # 按时间清理（保留指定天数内的备份）
    if [ "$MAX_BACKUP_DAYS" -gt 0 ]; then
        local files_removed=0
        while IFS= read -r -d '' file; do
            rm -f "$file"
            ((files_removed++))
        done < <(find "$BACKUP_DIR" -name "${BACKUP_NAME_PREFIX}_*.sql*" -type f -mtime +$MAX_BACKUP_DAYS -print0)
        
        if [ $files_removed -gt 0 ]; then
            log "INFO" "按时间清理了 $files_removed 个旧备份文件（超过 $MAX_BACKUP_DAYS 天）"
        fi
    fi
    
    # 按数量清理（保留最新的N个备份）
    if [ "$MAX_BACKUP_COUNT" -gt 0 ]; then
        local total_backups=$(find "$BACKUP_DIR" -name "${BACKUP_NAME_PREFIX}_*.sql*" -type f | wc -l)
        if [ $total_backups -gt $MAX_BACKUP_COUNT ]; then
            local files_to_remove=$((total_backups - MAX_BACKUP_COUNT))
            find "$BACKUP_DIR" -name "${BACKUP_NAME_PREFIX}_*.sql*" -type f -printf '%T@ %p\n' | \
                sort -n | head -n $files_to_remove | cut -d' ' -f2- | \
                while IFS= read -r file; do
                    rm -f "$file"
                done
            log "INFO" "按数量清理了 $files_to_remove 个旧备份文件（保留最新 $MAX_BACKUP_COUNT 个）"
        fi
    fi
}

# 显示备份统计信息
show_backup_stats() {
    log "INFO" "备份统计信息:"
    
    local total_backups=$(find "$BACKUP_DIR" -name "${BACKUP_NAME_PREFIX}_*.sql*" -type f | wc -l)
    log "INFO" "  - 备份文件总数: $total_backups"
    
    if [ $total_backups -gt 0 ]; then
        local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
        log "INFO" "  - 备份目录大小: $total_size"
        
        local latest_backup=$(find "$BACKUP_DIR" -name "${BACKUP_NAME_PREFIX}_*.sql*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
        if [ -n "$latest_backup" ]; then
            local latest_date=$(stat -c %y "$latest_backup" | cut -d'.' -f1)
            log "INFO" "  - 最新备份时间: $latest_date"
        fi
    fi
}

# 发送通知（可扩展）
send_notification() {
    local status=$1
    local message=$2
    
    # 这里可以添加邮件、Slack、钉钉等通知方式
    # 示例：发送到日志
    if [ "$status" = "success" ]; then
        log "SUCCESS" "备份通知: $message"
    else
        log "ERROR" "备份通知: $message"
    fi
    
    # TODO: 添加实际的通知发送逻辑
    # 例如：curl 发送到 webhook
    # curl -X POST -H 'Content-type: application/json' \
    #     --data '{"text":"'"$message"'"}' \
    #     YOUR_WEBHOOK_URL
}

# 主函数
main() {
    log "INFO" "========== 开始数据库备份任务 =========="
    
    # 创建备份目录
    create_backup_dir
    
    # 检查容器状态
    if ! check_container; then
        send_notification "error" "数据库容器检查失败"
        exit 1
    fi
    
    # 执行备份
    if backup_database; then
        # 清理旧备份
        cleanup_old_backups
        
        # 显示统计信息
        show_backup_stats
        
        send_notification "success" "数据库备份成功完成"
        log "SUCCESS" "========== 数据库备份任务完成 =========="
    else
        send_notification "error" "数据库备份失败"
        log "ERROR" "========== 数据库备份任务失败 =========="
        exit 1
    fi
}

# 帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  --dry-run      测试运行（不执行实际备份）"
    echo "  --cleanup      仅执行清理操作"
    echo "  --stats        显示备份统计信息"
    echo ""
    echo "示例:"
    echo "  $0              # 执行完整备份"
    echo "  $0 --cleanup    # 仅清理旧备份"
    echo "  $0 --stats      # 显示统计信息"
}

# 处理命令行参数
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    --dry-run)
        log "INFO" "测试运行模式 - 不执行实际备份"
        create_backup_dir
        check_container
        show_backup_stats
        ;;
    --cleanup)
        log "INFO" "仅执行清理操作"
        create_backup_dir
        cleanup_old_backups
        show_backup_stats
        ;;
    --stats)
        create_backup_dir
        show_backup_stats
        ;;
    *)
        main
        ;;
esac
