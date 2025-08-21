#!/bin/bash

# 数据库备份管理工具
# 功能：管理数据库备份的完整生命周期

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/mysql"

# 备份脚本路径
BACKUP_SCRIPT="$SCRIPT_DIR/backup-advanced.sh"
RESTORE_SCRIPT="$SCRIPT_DIR/restore.sh"
CRON_SCRIPT="$SCRIPT_DIR/setup-cron.sh"
NAS_BACKUP_SCRIPT="$SCRIPT_DIR/backup-to-nas.sh"
NAS_CONFIG_SCRIPT="$SCRIPT_DIR/setup-nas-config.sh"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 显示标题
show_title() {
    echo -e "${CYAN}${BOLD}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Seek-Self 数据库备份管理                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 显示主菜单
show_menu() {
    echo -e "${BLUE}${BOLD}请选择操作:${NC}"
    echo ""
    echo "  📦 备份操作"
    echo "    1) 立即备份数据库"
    echo "    2) 设置定时备份"
    echo "    3) 查看备份状态"
    echo ""
    echo "  🔄 恢复操作"
    echo "    4) 恢复数据库"
    echo "    5) 列出备份文件"
    echo ""
    echo "  🧹 管理操作"
    echo "    6) 清理旧备份"
    echo "    7) 备份统计信息"
    echo "    8) 查看备份日志"
    echo ""
    echo "  📡 NAS 备份"
    echo "    9) 配置极空间 NAS"
    echo "   10) 同步到 NAS"
    echo "   11) NAS 备份状态"
    echo ""
    echo "  ⚙️  系统操作"
    echo "   12) 检查系统状态"
    echo "   13) 测试数据库连接"
    echo "   14) 查看定时任务"
    echo ""
    echo "   0) 退出"
    echo ""
    echo -n "请输入选择 (0-14): "
}

# 执行立即备份
do_immediate_backup() {
    echo -e "${YELLOW}正在执行立即备份...${NC}"
    echo ""
    
    if [ -x "$BACKUP_SCRIPT" ]; then
        "$BACKUP_SCRIPT"
    else
        echo -e "${RED}错误: 备份脚本不存在或没有执行权限${NC}"
        echo "脚本路径: $BACKUP_SCRIPT"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 设置定时备份
setup_scheduled_backup() {
    echo -e "${YELLOW}设置定时备份...${NC}"
    echo ""
    
    if [ -x "$CRON_SCRIPT" ]; then
        "$CRON_SCRIPT"
    else
        echo -e "${RED}错误: 定时任务设置脚本不存在或没有执行权限${NC}"
        echo "脚本路径: $CRON_SCRIPT"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 查看备份状态
show_backup_status() {
    echo -e "${BLUE}${BOLD}备份状态信息${NC}"
    echo ""
    
    # 检查备份目录
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${GREEN}✓${NC} 备份目录存在: $BACKUP_DIR"
        
        # 统计备份文件
        local total_backups=$(find "$BACKUP_DIR" -name "seek_self_backup_*.sql*" -type f | wc -l)
        echo -e "${GREEN}✓${NC} 备份文件总数: $total_backups"
        
        if [ $total_backups -gt 0 ]; then
            # 最新备份
            local latest_backup=$(find "$BACKUP_DIR" -name "seek_self_backup_*.sql*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
            local latest_date=$(stat -c %y "$latest_backup" | cut -d'.' -f1)
            echo -e "${GREEN}✓${NC} 最新备份: $(basename "$latest_backup")"
            echo -e "${GREEN}✓${NC} 备份时间: $latest_date"
            
            # 备份大小
            local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
            echo -e "${GREEN}✓${NC} 总备份大小: $total_size"
        fi
    else
        echo -e "${RED}✗${NC} 备份目录不存在: $BACKUP_DIR"
    fi
    
    echo ""
    
    # 检查定时任务
    echo -e "${BLUE}${BOLD}定时任务状态${NC}"
    if crontab -l 2>/dev/null | grep -q "backup-advanced.sh"; then
        echo -e "${GREEN}✓${NC} 定时备份任务已设置"
        echo ""
        echo "当前定时任务:"
        crontab -l | grep "backup-advanced.sh" | while read line; do
            echo "  $line"
        done
    else
        echo -e "${YELLOW}!${NC} 未设置定时备份任务"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 恢复数据库
restore_database() {
    echo -e "${YELLOW}数据库恢复...${NC}"
    echo ""
    
    if [ -x "$RESTORE_SCRIPT" ]; then
        "$RESTORE_SCRIPT"
    else
        echo -e "${RED}错误: 恢复脚本不存在或没有执行权限${NC}"
        echo "脚本路径: $RESTORE_SCRIPT"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 列出备份文件
list_backup_files() {
    echo -e "${BLUE}${BOLD}备份文件列表${NC}"
    echo ""
    
    if [ -x "$RESTORE_SCRIPT" ]; then
        "$RESTORE_SCRIPT" --list
    else
        # 手动列出
        if [ -d "$BACKUP_DIR" ]; then
            local backups=($(find "$BACKUP_DIR" -name "seek_self_backup_*.sql*" -type f -printf '%T@ %p\n' | sort -rn | cut -d' ' -f2-))
            
            if [ ${#backups[@]} -eq 0 ]; then
                echo -e "${YELLOW}未找到任何备份文件${NC}"
            else
                for backup_file in "${backups[@]}"; do
                    local file_date=$(stat -c %y "$backup_file" | cut -d'.' -f1)
                    local file_size=$(du -h "$backup_file" | cut -f1)
                    
                    echo "文件: $(basename "$backup_file")"
                    echo "时间: $file_date"
                    echo "大小: $file_size"
                    echo ""
                done
            fi
        else
            echo -e "${RED}备份目录不存在${NC}"
        fi
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 清理旧备份
cleanup_old_backups() {
    echo -e "${YELLOW}清理旧备份文件...${NC}"
    echo ""
    
    if [ -x "$BACKUP_SCRIPT" ]; then
        "$BACKUP_SCRIPT" --cleanup
    else
        echo -e "${RED}错误: 备份脚本不存在或没有执行权限${NC}"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 显示备份统计
show_backup_stats() {
    echo -e "${BLUE}${BOLD}备份统计信息${NC}"
    echo ""
    
    if [ -x "$BACKUP_SCRIPT" ]; then
        "$BACKUP_SCRIPT" --stats
    else
        echo -e "${RED}错误: 备份脚本不存在${NC}"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 查看备份日志
show_backup_logs() {
    echo -e "${BLUE}${BOLD}备份日志${NC}"
    echo ""
    
    local log_file="$BACKUP_DIR/backup.log"
    local cron_log="$BACKUP_DIR/cron.log"
    
    if [ -f "$log_file" ]; then
        echo -e "${GREEN}备份日志 (最新 20 行):${NC}"
        tail -20 "$log_file"
        echo ""
    fi
    
    if [ -f "$cron_log" ]; then
        echo -e "${GREEN}定时任务日志 (最新 10 行):${NC}"
        tail -10 "$cron_log"
        echo ""
    fi
    
    if [ ! -f "$log_file" ] && [ ! -f "$cron_log" ]; then
        echo -e "${YELLOW}未找到日志文件${NC}"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 检查系统状态
check_system_status() {
    echo -e "${BLUE}${BOLD}系统状态检查${NC}"
    echo ""
    
    # 检查 Docker
    if command -v docker >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Docker 已安装"
        if docker ps >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Docker 服务运行正常"
        else
            echo -e "${RED}✗${NC} Docker 服务未运行"
        fi
    else
        echo -e "${RED}✗${NC} Docker 未安装"
    fi
    
    # 检查 MySQL 容器
    if docker ps --format "table {{.Names}}" | grep -q "seek-self-mysql"; then
        echo -e "${GREEN}✓${NC} MySQL 容器运行正常"
    else
        echo -e "${RED}✗${NC} MySQL 容器未运行"
    fi
    
    # 检查 cron 服务
    if systemctl is-active --quiet cron 2>/dev/null || service cron status >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Cron 服务运行正常"
    else
        echo -e "${YELLOW}!${NC} Cron 服务状态未知"
    fi
    
    # 检查备份脚本
    if [ -x "$BACKUP_SCRIPT" ]; then
        echo -e "${GREEN}✓${NC} 备份脚本可执行"
    else
        echo -e "${RED}✗${NC} 备份脚本不存在或无执行权限"
    fi
    
    # 检查磁盘空间
    local backup_disk_usage=$(df -h "$BACKUP_DIR" 2>/dev/null | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ -n "$backup_disk_usage" ]; then
        if [ "$backup_disk_usage" -lt 80 ]; then
            echo -e "${GREEN}✓${NC} 磁盘空间充足 (${backup_disk_usage}% 已使用)"
        elif [ "$backup_disk_usage" -lt 90 ]; then
            echo -e "${YELLOW}!${NC} 磁盘空间紧张 (${backup_disk_usage}% 已使用)"
        else
            echo -e "${RED}✗${NC} 磁盘空间不足 (${backup_disk_usage}% 已使用)"
        fi
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 测试数据库连接
test_database_connection() {
    echo -e "${BLUE}${BOLD}数据库连接测试${NC}"
    echo ""
    
    if [ -x "$BACKUP_SCRIPT" ]; then
        "$BACKUP_SCRIPT" --dry-run
    else
        echo -e "${RED}错误: 备份脚本不存在${NC}"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 查看定时任务
show_cron_jobs() {
    echo -e "${BLUE}${BOLD}当前定时任务${NC}"
    echo ""
    
    if crontab -l 2>/dev/null | grep -q "backup"; then
        echo "备份相关的定时任务:"
        crontab -l | grep -E "(backup|seek-self)" | while read line; do
            echo "  $line"
        done
    else
        echo -e "${YELLOW}未找到备份相关的定时任务${NC}"
    fi
    
    echo ""
    echo "所有定时任务:"
    crontab -l 2>/dev/null || echo "无定时任务"
    
    echo ""
    read -p "按回车键继续..."
}

# 配置极空间 NAS
configure_nas() {
    echo -e "${YELLOW}配置极空间 NAS...${NC}"
    echo ""
    
    if [ -x "$NAS_CONFIG_SCRIPT" ]; then
        "$NAS_CONFIG_SCRIPT"
    else
        echo -e "${RED}错误: NAS 配置脚本不存在或没有执行权限${NC}"
        echo "脚本路径: $NAS_CONFIG_SCRIPT"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 同步到 NAS
sync_to_nas() {
    echo -e "${YELLOW}同步备份到 NAS...${NC}"
    echo ""
    
    if [ -x "$NAS_BACKUP_SCRIPT" ]; then
        "$NAS_BACKUP_SCRIPT"
    else
        echo -e "${RED}错误: NAS 备份脚本不存在或没有执行权限${NC}"
        echo "脚本路径: $NAS_BACKUP_SCRIPT"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# NAS 备份状态
show_nas_status() {
    echo -e "${BLUE}${BOLD}NAS 备份状态${NC}"
    echo ""
    
    if [ -x "$NAS_BACKUP_SCRIPT" ]; then
        # 检查 NAS 配置
        local nas_ip=$(grep 'NAS_IP=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
        local connection_type=$(grep 'CONNECTION_TYPE=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
        local nas_user=$(grep 'NAS_USER=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
        
        echo "NAS 配置信息:"
        echo "  IP 地址: $nas_ip"
        echo "  连接方式: $connection_type"
        echo "  用户名: $nas_user"
        echo ""
        
        # 测试连接
        echo "连接测试:"
        "$NAS_BACKUP_SCRIPT" --test
        echo ""
        
        # 显示统计
        echo "备份统计:"
        "$NAS_BACKUP_SCRIPT" --stats
    else
        echo -e "${RED}NAS 备份脚本不存在${NC}"
        echo "请先配置 NAS 备份"
    fi
    
    echo ""
    read -p "按回车键继续..."
}

# 主循环
main() {
    # 设置脚本权限
    chmod +x "$BACKUP_SCRIPT" 2>/dev/null
    chmod +x "$RESTORE_SCRIPT" 2>/dev/null
    chmod +x "$CRON_SCRIPT" 2>/dev/null
    
    while true; do
        clear
        show_title
        show_menu
        
        read choice
        echo ""
        
        case $choice in
            1) do_immediate_backup ;;
            2) setup_scheduled_backup ;;
            3) show_backup_status ;;
            4) restore_database ;;
            5) list_backup_files ;;
            6) cleanup_old_backups ;;
            7) show_backup_stats ;;
            8) show_backup_logs ;;
            9) configure_nas ;;
            10) sync_to_nas ;;
            11) show_nas_status ;;
            12) check_system_status ;;
            13) test_database_connection ;;
            14) show_cron_jobs ;;
            0)
                echo -e "${GREEN}再见!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效选择，请重试${NC}"
                sleep 2
                ;;
        esac
    done
}

# 运行主程序
main
