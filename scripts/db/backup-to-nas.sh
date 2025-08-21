#!/bin/bash

# 备份到极空间 NAS 脚本
# 支持多种连接方式：SMB/CIFS、SFTP、rsync

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOCAL_BACKUP_DIR="$PROJECT_ROOT/backups/mysql"

# ===========================================
# 🔧 NAS 配置区域 - 请根据你的实际情况修改
# ===========================================

# 极空间 NAS 基本信息
NAS_IP="192.168.1.100"                    # 替换为你的极空间 IP 地址
NAS_PORT="22"                             # SSH/SFTP 端口，默认 22
NAS_USER="admin"                          # 极空间用户名
NAS_PASSWORD=""                           # 密码（建议使用密钥认证）

# 备份目录配置
NAS_BACKUP_ROOT="/volume1/backup"         # NAS 上的备份根目录
NAS_PROJECT_DIR="$NAS_BACKUP_ROOT/seek-self"  # 项目专用目录
NAS_DB_DIR="$NAS_PROJECT_DIR/mysql"       # 数据库备份目录

# 连接方式选择 (sftp/smb/rsync)
CONNECTION_TYPE="sftp"                    # 默认使用 SFTP

# SMB/CIFS 配置（如果选择 smb）
SMB_SHARE="//192.168.1.100/backup"       # SMB 共享路径
SMB_MOUNT_POINT="/mnt/nas_backup"         # 本地挂载点

# rsync 配置（如果选择 rsync）
RSYNC_USER="backup"                       # rsync 用户
RSYNC_MODULE="backup"                     # rsync 模块

# 备份保留策略
KEEP_LOCAL_BACKUPS=7                      # 本地保留天数
KEEP_NAS_BACKUPS=90                       # NAS 保留天数
MAX_NAS_BACKUPS=200                       # NAS 最大备份数

# ===========================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志文件
LOG_FILE="$LOCAL_BACKUP_DIR/nas_backup.log"

# 日志函数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
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

# 检查本地备份目录
check_local_backup_dir() {
    if [ ! -d "$LOCAL_BACKUP_DIR" ]; then
        log "ERROR" "本地备份目录不存在: $LOCAL_BACKUP_DIR"
        return 1
    fi
    
    local backup_count=$(find "$LOCAL_BACKUP_DIR" -name "seek_self_backup_*.sql*" | wc -l)
    if [ $backup_count -eq 0 ]; then
        log "WARN" "本地备份目录中没有找到备份文件"
        return 1
    fi
    
    log "INFO" "找到 $backup_count 个本地备份文件"
    return 0
}

# 测试 NAS 连接
test_nas_connection() {
    log "INFO" "测试 NAS 连接..."
    
    case $CONNECTION_TYPE in
        "sftp"|"ssh")
            if command -v ssh >/dev/null 2>&1; then
                if ssh -o ConnectTimeout=10 -o BatchMode=yes "$NAS_USER@$NAS_IP" -p "$NAS_PORT" "echo 'Connection successful'" 2>/dev/null; then
                    log "SUCCESS" "SSH/SFTP 连接测试成功"
                    return 0
                else
                    log "ERROR" "SSH/SFTP 连接测试失败"
                    log "INFO" "请检查："
                    log "INFO" "1. NAS IP 地址: $NAS_IP"
                    log "INFO" "2. SSH 端口: $NAS_PORT"
                    log "INFO" "3. 用户名: $NAS_USER"
                    log "INFO" "4. SSH 密钥认证是否已配置"
                    return 1
                fi
            else
                log "ERROR" "SSH 命令不可用"
                return 1
            fi
            ;;
        "smb")
            if command -v smbclient >/dev/null 2>&1; then
                if smbclient -L "$NAS_IP" -U "$NAS_USER" >/dev/null 2>&1; then
                    log "SUCCESS" "SMB 连接测试成功"
                    return 0
                else
                    log "ERROR" "SMB 连接测试失败"
                    return 1
                fi
            else
                log "ERROR" "smbclient 命令不可用，请安装 samba-client"
                return 1
            fi
            ;;
        "rsync")
            if command -v rsync >/dev/null 2>&1; then
                if rsync --list-only "$RSYNC_USER@$NAS_IP::$RSYNC_MODULE/" >/dev/null 2>&1; then
                    log "SUCCESS" "rsync 连接测试成功"
                    return 0
                else
                    log "ERROR" "rsync 连接测试失败"
                    return 1
                fi
            else
                log "ERROR" "rsync 命令不可用"
                return 1
            fi
            ;;
        *)
            log "ERROR" "不支持的连接类型: $CONNECTION_TYPE"
            return 1
            ;;
    esac
}

# 创建 NAS 备份目录
create_nas_backup_dir() {
    log "INFO" "创建 NAS 备份目录..."
    
    case $CONNECTION_TYPE in
        "sftp"|"ssh")
            ssh "$NAS_USER@$NAS_IP" -p "$NAS_PORT" "mkdir -p '$NAS_DB_DIR'" 2>/dev/null
            if [ $? -eq 0 ]; then
                log "SUCCESS" "NAS 备份目录创建成功: $NAS_DB_DIR"
                return 0
            else
                log "ERROR" "创建 NAS 备份目录失败"
                return 1
            fi
            ;;
        "smb")
            # SMB 方式需要先挂载
            mount_smb_share
            if [ $? -eq 0 ]; then
                mkdir -p "$SMB_MOUNT_POINT/seek-self/mysql"
                log "SUCCESS" "SMB 备份目录创建成功"
                return 0
            else
                return 1
            fi
            ;;
        "rsync")
            # rsync 通常不需要预创建目录
            log "INFO" "rsync 方式不需要预创建目录"
            return 0
            ;;
    esac
}

# 挂载 SMB 共享
mount_smb_share() {
    if [ ! -d "$SMB_MOUNT_POINT" ]; then
        sudo mkdir -p "$SMB_MOUNT_POINT"
    fi
    
    if mountpoint -q "$SMB_MOUNT_POINT"; then
        log "INFO" "SMB 共享已挂载"
        return 0
    fi
    
    log "INFO" "挂载 SMB 共享..."
    if [ -n "$NAS_PASSWORD" ]; then
        sudo mount -t cifs "$SMB_SHARE" "$SMB_MOUNT_POINT" \
            -o username="$NAS_USER",password="$NAS_PASSWORD",uid=$(id -u),gid=$(id -g)
    else
        sudo mount -t cifs "$SMB_SHARE" "$SMB_MOUNT_POINT" \
            -o username="$NAS_USER",uid=$(id -u),gid=$(id -g)
    fi
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "SMB 共享挂载成功"
        return 0
    else
        log "ERROR" "SMB 共享挂载失败"
        return 1
    fi
}

# 卸载 SMB 共享
umount_smb_share() {
    if mountpoint -q "$SMB_MOUNT_POINT"; then
        sudo umount "$SMB_MOUNT_POINT"
        log "INFO" "SMB 共享已卸载"
    fi
}

# 同步备份文件到 NAS
sync_backups_to_nas() {
    log "INFO" "开始同步备份文件到 NAS..."
    
    # 获取需要同步的文件
    local files_to_sync=($(find "$LOCAL_BACKUP_DIR" -name "seek_self_backup_*.sql*" -type f -newer "$LOCAL_BACKUP_DIR/.last_nas_sync" 2>/dev/null || find "$LOCAL_BACKUP_DIR" -name "seek_self_backup_*.sql*" -type f))
    
    if [ ${#files_to_sync[@]} -eq 0 ]; then
        log "INFO" "没有新的备份文件需要同步"
        return 0
    fi
    
    log "INFO" "找到 ${#files_to_sync[@]} 个文件需要同步"
    
    local sync_count=0
    local failed_count=0
    
    case $CONNECTION_TYPE in
        "sftp"|"ssh")
            for file in "${files_to_sync[@]}"; do
                local filename=$(basename "$file")
                log "INFO" "同步文件: $filename"
                
                if scp -P "$NAS_PORT" "$file" "$NAS_USER@$NAS_IP:$NAS_DB_DIR/" 2>/dev/null; then
                    log "SUCCESS" "文件同步成功: $filename"
                    ((sync_count++))
                else
                    log "ERROR" "文件同步失败: $filename"
                    ((failed_count++))
                fi
            done
            ;;
        "smb")
            if mount_smb_share; then
                for file in "${files_to_sync[@]}"; do
                    local filename=$(basename "$file")
                    log "INFO" "复制文件: $filename"
                    
                    if cp "$file" "$SMB_MOUNT_POINT/seek-self/mysql/"; then
                        log "SUCCESS" "文件复制成功: $filename"
                        ((sync_count++))
                    else
                        log "ERROR" "文件复制失败: $filename"
                        ((failed_count++))
                    fi
                done
                umount_smb_share
            else
                log "ERROR" "SMB 挂载失败，无法同步文件"
                return 1
            fi
            ;;
        "rsync")
            if rsync -avz --progress "$LOCAL_BACKUP_DIR/" "$RSYNC_USER@$NAS_IP::$RSYNC_MODULE/seek-self/mysql/"; then
                sync_count=${#files_to_sync[@]}
                log "SUCCESS" "rsync 同步完成"
            else
                log "ERROR" "rsync 同步失败"
                failed_count=${#files_to_sync[@]}
            fi
            ;;
    esac
    
    log "INFO" "同步完成: 成功 $sync_count 个, 失败 $failed_count 个"
    
    # 更新同步标记文件
    if [ $sync_count -gt 0 ]; then
        touch "$LOCAL_BACKUP_DIR/.last_nas_sync"
    fi
    
    return 0
}

# 清理 NAS 上的旧备份
cleanup_nas_backups() {
    log "INFO" "清理 NAS 上的旧备份..."
    
    case $CONNECTION_TYPE in
        "sftp"|"ssh")
            # 按时间清理
            if [ "$KEEP_NAS_BACKUPS" -gt 0 ]; then
                ssh "$NAS_USER@$NAS_IP" -p "$NAS_PORT" "find '$NAS_DB_DIR' -name 'seek_self_backup_*.sql*' -type f -mtime +$KEEP_NAS_BACKUPS -delete" 2>/dev/null
            fi
            
            # 按数量清理
            if [ "$MAX_NAS_BACKUPS" -gt 0 ]; then
                ssh "$NAS_USER@$NAS_IP" -p "$NAS_PORT" "cd '$NAS_DB_DIR' && ls -t seek_self_backup_*.sql* 2>/dev/null | tail -n +$((MAX_NAS_BACKUPS + 1)) | xargs -r rm -f" 2>/dev/null
            fi
            
            # 获取清理后的统计
            local remaining_count=$(ssh "$NAS_USER@$NAS_IP" -p "$NAS_PORT" "find '$NAS_DB_DIR' -name 'seek_self_backup_*.sql*' -type f | wc -l" 2>/dev/null)
            log "INFO" "NAS 上剩余备份文件: $remaining_count 个"
            ;;
        "smb")
            if mount_smb_share; then
                # 按时间清理
                if [ "$KEEP_NAS_BACKUPS" -gt 0 ]; then
                    find "$SMB_MOUNT_POINT/seek-self/mysql" -name "seek_self_backup_*.sql*" -type f -mtime +$KEEP_NAS_BACKUPS -delete 2>/dev/null
                fi
                
                # 按数量清理
                if [ "$MAX_NAS_BACKUPS" -gt 0 ]; then
                    cd "$SMB_MOUNT_POINT/seek-self/mysql"
                    ls -t seek_self_backup_*.sql* 2>/dev/null | tail -n +$((MAX_NAS_BACKUPS + 1)) | xargs -r rm -f
                fi
                
                umount_smb_share
            fi
            ;;
        "rsync")
            log "INFO" "rsync 方式的清理需要在 NAS 端配置"
            ;;
    esac
    
    log "SUCCESS" "NAS 备份清理完成"
}

# 显示同步统计
show_sync_stats() {
    log "INFO" "========== 同步统计信息 =========="
    
    # 本地统计
    local local_count=$(find "$LOCAL_BACKUP_DIR" -name "seek_self_backup_*.sql*" | wc -l)
    local local_size=$(du -sh "$LOCAL_BACKUP_DIR" | cut -f1)
    log "INFO" "本地备份: $local_count 个文件, 总大小 $local_size"
    
    # NAS 统计
    case $CONNECTION_TYPE in
        "sftp"|"ssh")
            local nas_count=$(ssh "$NAS_USER@$NAS_IP" -p "$NAS_PORT" "find '$NAS_DB_DIR' -name 'seek_self_backup_*.sql*' -type f | wc -l" 2>/dev/null || echo "0")
            log "INFO" "NAS 备份: $nas_count 个文件"
            ;;
        "smb")
            if mount_smb_share; then
                local nas_count=$(find "$SMB_MOUNT_POINT/seek-self/mysql" -name "seek_self_backup_*.sql*" 2>/dev/null | wc -l)
                log "INFO" "NAS 备份: $nas_count 个文件"
                umount_smb_share
            fi
            ;;
        "rsync")
            log "INFO" "rsync 统计信息需要登录 NAS 查看"
            ;;
    esac
}

# 主函数
main() {
    log "INFO" "========== 开始备份到极空间 NAS =========="
    
    # 检查本地备份
    if ! check_local_backup_dir; then
        log "ERROR" "本地备份检查失败"
        exit 1
    fi
    
    # 测试 NAS 连接
    if ! test_nas_connection; then
        log "ERROR" "NAS 连接测试失败"
        exit 1
    fi
    
    # 创建 NAS 备份目录
    if ! create_nas_backup_dir; then
        log "ERROR" "创建 NAS 备份目录失败"
        exit 1
    fi
    
    # 同步备份文件
    if sync_backups_to_nas; then
        # 清理旧备份
        cleanup_nas_backups
        
        # 显示统计信息
        show_sync_stats
        
        log "SUCCESS" "========== NAS 备份任务完成 =========="
    else
        log "ERROR" "========== NAS 备份任务失败 =========="
        exit 1
    fi
}

# 帮助信息
show_help() {
    echo "极空间 NAS 备份工具"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help      显示帮助信息"
    echo "  --test          测试 NAS 连接"
    echo "  --sync          仅同步文件（不清理）"
    echo "  --cleanup       仅清理 NAS 旧备份"
    echo "  --stats         显示统计信息"
    echo "  --setup         配置向导"
    echo ""
    echo "配置信息:"
    echo "  NAS IP:     $NAS_IP"
    echo "  连接方式:   $CONNECTION_TYPE"
    echo "  备份目录:   $NAS_DB_DIR"
    echo ""
}

# 配置向导
setup_wizard() {
    echo -e "${BLUE}极空间 NAS 备份配置向导${NC}"
    echo ""
    
    # NAS IP 配置
    read -p "请输入极空间 NAS 的 IP 地址 [$NAS_IP]: " input_ip
    if [ -n "$input_ip" ]; then
        sed -i "s/NAS_IP=\".*\"/NAS_IP=\"$input_ip\"/" "$0"
        echo "✓ NAS IP 已更新为: $input_ip"
    fi
    
    # 连接方式选择
    echo ""
    echo "选择连接方式:"
    echo "1) SFTP/SSH (推荐)"
    echo "2) SMB/CIFS"
    echo "3) rsync"
    read -p "请选择 (1-3): " conn_choice
    
    case $conn_choice in
        1) 
            sed -i 's/CONNECTION_TYPE=".*"/CONNECTION_TYPE="sftp"/' "$0"
            echo "✓ 连接方式设置为: SFTP"
            ;;
        2) 
            sed -i 's/CONNECTION_TYPE=".*"/CONNECTION_TYPE="smb"/' "$0"
            echo "✓ 连接方式设置为: SMB"
            ;;
        3) 
            sed -i 's/CONNECTION_TYPE=".*"/CONNECTION_TYPE="rsync"/' "$0"
            echo "✓ 连接方式设置为: rsync"
            ;;
    esac
    
    echo ""
    echo "配置完成！请编辑脚本文件进行详细配置:"
    echo "  $0"
    echo ""
    echo "然后运行测试:"
    echo "  $0 --test"
}

# 处理命令行参数
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    --test)
        test_nas_connection
        ;;
    --sync)
        check_local_backup_dir
        test_nas_connection
        create_nas_backup_dir
        sync_backups_to_nas
        ;;
    --cleanup)
        test_nas_connection
        cleanup_nas_backups
        ;;
    --stats)
        show_sync_stats
        ;;
    --setup)
        setup_wizard
        ;;
    *)
        main
        ;;
esac
