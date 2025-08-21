#!/bin/bash

# 数据库恢复脚本
# 功能：从备份文件恢复 MySQL 数据库

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/mysql"

# 数据库配置
DB_CONTAINER="seek-self-mysql"
DB_NAME="seek_self"
DB_USER="root"
DB_PASSWORD="root123456"
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
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
    esac
}

# 检查 Docker 容器状态
check_container() {
    if ! docker ps --format "table {{.Names}}" | grep -q "$DB_CONTAINER"; then
        log "ERROR" "数据库容器 $DB_CONTAINER 未运行"
        return 1
    fi
    
    if ! docker exec "$DB_CONTAINER" mysqladmin ping -h localhost -u "$DB_USER" -p"$DB_PASSWORD" >/dev/null 2>&1; then
        log "ERROR" "无法连接到数据库"
        return 1
    fi
    
    log "INFO" "数据库容器状态正常"
    return 0
}

# 列出可用的备份文件
list_backups() {
    log "INFO" "可用的备份文件:"
    echo ""
    
    local backups=($(find "$BACKUP_DIR" -name "${BACKUP_NAME_PREFIX}_*.sql*" -type f -printf '%T@ %p\n' | sort -rn | cut -d' ' -f2-))
    
    if [ ${#backups[@]} -eq 0 ]; then
        log "WARN" "未找到任何备份文件"
        return 1
    fi
    
    for i in "${!backups[@]}"; do
        local backup_file="${backups[$i]}"
        local file_date=$(stat -c %y "$backup_file" | cut -d'.' -f1)
        local file_size=$(du -h "$backup_file" | cut -f1)
        
        printf "%2d) %s\n" $((i+1)) "$(basename "$backup_file")"
        printf "     时间: %s, 大小: %s\n" "$file_date" "$file_size"
        echo ""
    done
    
    return 0
}

# 选择备份文件
select_backup() {
    if ! list_backups; then
        return 1
    fi
    
    local backups=($(find "$BACKUP_DIR" -name "${BACKUP_NAME_PREFIX}_*.sql*" -type f -printf '%T@ %p\n' | sort -rn | cut -d' ' -f2-))
    
    echo -n "请选择要恢复的备份文件 (1-${#backups[@]}): "
    read choice
    
    if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#backups[@]} ]; then
        log "ERROR" "无效的选择"
        return 1
    fi
    
    selected_backup="${backups[$((choice-1))]}"
    log "INFO" "选择的备份文件: $(basename "$selected_backup")"
    return 0
}

# 创建数据库备份（恢复前）
create_pre_restore_backup() {
    log "INFO" "恢复前创建当前数据库备份..."
    
    local pre_restore_date=$(date '+%Y%m%d_%H%M%S')
    local pre_restore_file="$BACKUP_DIR/${BACKUP_NAME_PREFIX}_pre_restore_${pre_restore_date}.sql"
    
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
        --databases "$DB_NAME" > "$pre_restore_file" 2>/dev/null; then
        
        log "SUCCESS" "恢复前备份创建成功: $(basename "$pre_restore_file")"
        
        # 压缩备份文件
        if gzip "$pre_restore_file" 2>/dev/null; then
            log "INFO" "备份文件已压缩"
        fi
        
        return 0
    else
        log "ERROR" "恢复前备份创建失败"
        return 1
    fi
}

# 恢复数据库
restore_database() {
    local backup_file="$1"
    
    log "INFO" "开始恢复数据库..."
    log "INFO" "备份文件: $(basename "$backup_file")"
    
    # 检查文件是否为压缩文件
    local restore_file="$backup_file"
    local temp_file=""
    
    if [[ "$backup_file" == *.gz ]]; then
        log "INFO" "检测到压缩文件，正在解压..."
        temp_file="/tmp/restore_$(date +%s).sql"
        if gunzip -c "$backup_file" > "$temp_file"; then
            restore_file="$temp_file"
            log "INFO" "文件解压成功"
        else
            log "ERROR" "文件解压失败"
            return 1
        fi
    fi
    
    # 执行恢复
    log "INFO" "正在恢复数据库..."
    if docker exec -i "$DB_CONTAINER" mysql -u "$DB_USER" -p"$DB_PASSWORD" < "$restore_file"; then
        log "SUCCESS" "数据库恢复成功"
        
        # 清理临时文件
        if [ -n "$temp_file" ] && [ -f "$temp_file" ]; then
            rm -f "$temp_file"
        fi
        
        return 0
    else
        log "ERROR" "数据库恢复失败"
        
        # 清理临时文件
        if [ -n "$temp_file" ] && [ -f "$temp_file" ]; then
            rm -f "$temp_file"
        fi
        
        return 1
    fi
}

# 验证恢复结果
verify_restore() {
    log "INFO" "验证恢复结果..."
    
    # 检查数据库连接
    if ! docker exec "$DB_CONTAINER" mysqladmin ping -h localhost -u "$DB_USER" -p"$DB_PASSWORD" >/dev/null 2>&1; then
        log "ERROR" "恢复后无法连接到数据库"
        return 1
    fi
    
    # 检查表数量
    local table_count=$(docker exec "$DB_CONTAINER" mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | wc -l)
    if [ "$table_count" -gt 1 ]; then # 减去表头
        log "SUCCESS" "数据库恢复验证成功，共有 $((table_count-1)) 个表"
        return 0
    else
        log "ERROR" "数据库恢复验证失败，未找到表"
        return 1
    fi
}

# 主函数
main() {
    log "INFO" "========== 数据库恢复工具 =========="
    
    # 检查备份目录
    if [ ! -d "$BACKUP_DIR" ]; then
        log "ERROR" "备份目录不存在: $BACKUP_DIR"
        exit 1
    fi
    
    # 检查容器状态
    if ! check_container; then
        exit 1
    fi
    
    # 选择备份文件
    if ! select_backup; then
        exit 1
    fi
    
    echo ""
    log "WARN" "警告: 此操作将覆盖当前数据库!"
    log "INFO" "将要恢复的文件: $(basename "$selected_backup")"
    echo ""
    
    read -p "是否继续? (输入 'YES' 确认): " confirm
    if [ "$confirm" != "YES" ]; then
        log "INFO" "操作已取消"
        exit 0
    fi
    
    echo ""
    
    # 创建恢复前备份
    if ! create_pre_restore_backup; then
        log "ERROR" "恢复前备份失败，操作中止"
        exit 1
    fi
    
    echo ""
    
    # 执行恢复
    if restore_database "$selected_backup"; then
        # 验证恢复结果
        if verify_restore; then
            log "SUCCESS" "========== 数据库恢复完成 =========="
        else
            log "ERROR" "========== 数据库恢复验证失败 =========="
            exit 1
        fi
    else
        log "ERROR" "========== 数据库恢复失败 =========="
        exit 1
    fi
}

# 帮助信息
show_help() {
    echo "用法: $0 [选项] [备份文件]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -l, --list     列出可用的备份文件"
    echo "  -f, --file     指定备份文件路径"
    echo ""
    echo "示例:"
    echo "  $0                                    # 交互式选择备份文件"
    echo "  $0 -l                                 # 列出可用备份"
    echo "  $0 -f /path/to/backup.sql             # 从指定文件恢复"
}

# 处理命令行参数
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    -l|--list)
        check_container
        list_backups
        ;;
    -f|--file)
        if [ -z "$2" ]; then
            log "ERROR" "请指定备份文件路径"
            exit 1
        fi
        if [ ! -f "$2" ]; then
            log "ERROR" "备份文件不存在: $2"
            exit 1
        fi
        selected_backup="$2"
        check_container
        create_pre_restore_backup
        restore_database "$selected_backup"
        verify_restore
        ;;
    *)
        main
        ;;
esac
