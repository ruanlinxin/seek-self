#!/bin/bash

# 极空间 NAS 配置设置脚本
# 帮助用户快速配置 NAS 备份

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAS_BACKUP_SCRIPT="$SCRIPT_DIR/backup-to-nas.sh"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

show_title() {
    echo -e "${CYAN}${BOLD}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  极空间 NAS 备份配置向导                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检测极空间 NAS
detect_nas() {
    echo -e "${BLUE}🔍 正在扫描网络中的极空间 NAS...${NC}"
    echo ""
    
    # 获取本机网段
    local network=$(ip route | grep -E '192\.168\.|10\.|172\.' | head -1 | awk '{print $1}' | sed 's/\.[0-9]*\//.0\//')
    
    if [ -z "$network" ]; then
        network="192.168.1.0/24"
    fi
    
    echo "扫描网段: $network"
    
    # 扫描常见端口
    local found_devices=()
    
    for ip in $(nmap -sn $network 2>/dev/null | grep -E 'Nmap scan report for' | awk '{print $5}' | head -20); do
        # 检查是否是极空间设备
        if nmap -p 22,80,443,8080,9000 $ip 2>/dev/null | grep -q "open"; then
            # 尝试检测极空间特征
            local http_response=$(curl -s --connect-timeout 3 "http://$ip" 2>/dev/null || echo "")
            if echo "$http_response" | grep -iq "zspace\|极空间"; then
                found_devices+=("$ip")
                echo -e "${GREEN}✓${NC} 发现极空间设备: $ip"
            else
                echo "  检查设备: $ip (未确认为极空间)"
            fi
        fi
    done
    
    if [ ${#found_devices[@]} -eq 0 ]; then
        echo -e "${YELLOW}未自动发现极空间 NAS，请手动输入 IP 地址${NC}"
        return 1
    else
        echo ""
        echo -e "${GREEN}发现 ${#found_devices[@]} 个可能的极空间设备${NC}"
        return 0
    fi
}

# 配置 NAS 基本信息
configure_nas_basic() {
    echo -e "${BLUE}${BOLD}📡 配置 NAS 基本信息${NC}"
    echo ""
    
    # IP 地址配置
    local current_ip=$(grep 'NAS_IP=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    echo "当前配置的 IP: $current_ip"
    echo ""
    
    read -p "请输入极空间 NAS 的 IP 地址 [$current_ip]: " nas_ip
    if [ -z "$nas_ip" ]; then
        nas_ip="$current_ip"
    fi
    
    # 验证 IP 格式
    if [[ ! $nas_ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        echo -e "${RED}❌ IP 地址格式不正确${NC}"
        return 1
    fi
    
    # 测试连通性
    echo ""
    echo "🔄 测试 NAS 连通性..."
    if ping -c 1 -W 3 "$nas_ip" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} NAS 网络连通正常"
    else
        echo -e "${YELLOW}⚠️${NC}  NAS 网络连通测试失败，但仍可继续配置"
    fi
    
    # 用户名配置
    local current_user=$(grep 'NAS_USER=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    read -p "请输入 NAS 用户名 [$current_user]: " nas_user
    if [ -z "$nas_user" ]; then
        nas_user="$current_user"
    fi
    
    # 更新配置文件
    sed -i "s/NAS_IP=\".*\"/NAS_IP=\"$nas_ip\"/" "$NAS_BACKUP_SCRIPT"
    sed -i "s/NAS_USER=\".*\"/NAS_USER=\"$nas_user\"/" "$NAS_BACKUP_SCRIPT"
    
    echo -e "${GREEN}✓${NC} 基本信息配置完成"
    return 0
}

# 选择连接方式
choose_connection_type() {
    echo ""
    echo -e "${BLUE}${BOLD}🔗 选择连接方式${NC}"
    echo ""
    
    echo "极空间 NAS 支持多种连接方式："
    echo ""
    echo -e "${GREEN}1) SFTP/SSH${NC} (推荐)"
    echo "   - 安全性高，支持密钥认证"
    echo "   - 需要在极空间启用 SSH 服务"
    echo "   - 适合技术用户"
    echo ""
    echo -e "${YELLOW}2) SMB/CIFS${NC}"
    echo "   - Windows 风格的文件共享"
    echo "   - 配置相对简单"
    echo "   - 需要安装 samba-client"
    echo ""
    echo -e "${BLUE}3) rsync${NC}"
    echo "   - 高效的增量同步"
    echo "   - 需要在极空间启用 rsync 服务"
    echo "   - 适合大量文件同步"
    echo ""
    
    read -p "请选择连接方式 (1-3): " choice
    
    case $choice in
        1)
            sed -i 's/CONNECTION_TYPE=".*"/CONNECTION_TYPE="sftp"/' "$NAS_BACKUP_SCRIPT"
            echo -e "${GREEN}✓${NC} 选择了 SFTP/SSH 连接方式"
            configure_ssh_connection
            ;;
        2)
            sed -i 's/CONNECTION_TYPE=".*"/CONNECTION_TYPE="smb"/' "$NAS_BACKUP_SCRIPT"
            echo -e "${GREEN}✓${NC} 选择了 SMB/CIFS 连接方式"
            configure_smb_connection
            ;;
        3)
            sed -i 's/CONNECTION_TYPE=".*"/CONNECTION_TYPE="rsync"/' "$NAS_BACKUP_SCRIPT"
            echo -e "${GREEN}✓${NC} 选择了 rsync 连接方式"
            configure_rsync_connection
            ;;
        *)
            echo -e "${RED}❌ 无效选择${NC}"
            return 1
            ;;
    esac
}

# 配置 SSH 连接
configure_ssh_connection() {
    echo ""
    echo -e "${BLUE}🔑 配置 SSH/SFTP 连接${NC}"
    echo ""
    
    local nas_ip=$(grep 'NAS_IP=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    local nas_user=$(grep 'NAS_USER=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    
    # SSH 端口配置
    local current_port=$(grep 'NAS_PORT=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    read -p "SSH 端口 [$current_port]: " ssh_port
    if [ -n "$ssh_port" ]; then
        sed -i "s/NAS_PORT=\".*\"/NAS_PORT=\"$ssh_port\"/" "$NAS_BACKUP_SCRIPT"
    else
        ssh_port="$current_port"
    fi
    
    echo ""
    echo "SSH 认证方式："
    echo "1) 密钥认证 (推荐)"
    echo "2) 密码认证"
    read -p "请选择 (1-2): " auth_choice
    
    if [ "$auth_choice" = "1" ]; then
        setup_ssh_key_auth "$nas_ip" "$nas_user" "$ssh_port"
    else
        echo ""
        echo -e "${YELLOW}⚠️${NC}  密码认证安全性较低，建议使用密钥认证"
        read -s -p "请输入 NAS 密码: " nas_password
        echo ""
        sed -i "s/NAS_PASSWORD=\".*\"/NAS_PASSWORD=\"$nas_password\"/" "$NAS_BACKUP_SCRIPT"
    fi
    
    # 测试 SSH 连接
    echo ""
    echo "🔄 测试 SSH 连接..."
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$nas_user@$nas_ip" -p "$ssh_port" "echo 'SSH connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} SSH 连接测试成功"
    else
        echo -e "${RED}❌ SSH 连接测试失败${NC}"
        echo ""
        echo "请检查："
        echo "1. 极空间是否启用了 SSH 服务"
        echo "2. 防火墙设置"
        echo "3. 用户权限"
    fi
}

# 设置 SSH 密钥认证
setup_ssh_key_auth() {
    local nas_ip="$1"
    local nas_user="$2"
    local ssh_port="$3"
    
    echo ""
    echo -e "${BLUE}🔐 设置 SSH 密钥认证${NC}"
    echo ""
    
    # 检查本地密钥
    if [ ! -f ~/.ssh/id_rsa ]; then
        echo "本地没有 SSH 密钥，正在生成..."
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        echo -e "${GREEN}✓${NC} SSH 密钥对已生成"
    else
        echo -e "${GREEN}✓${NC} 发现现有 SSH 密钥"
    fi
    
    # 复制公钥到 NAS
    echo ""
    echo "正在复制公钥到 NAS..."
    echo "（可能需要输入 NAS 密码）"
    
    if ssh-copy-id -p "$ssh_port" "$nas_user@$nas_ip" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} 公钥复制成功"
    else
        echo -e "${YELLOW}⚠️${NC}  自动复制失败，请手动复制公钥："
        echo ""
        echo "1. 复制以下公钥内容："
        echo "----------------------------------------"
        cat ~/.ssh/id_rsa.pub
        echo "----------------------------------------"
        echo ""
        echo "2. 登录极空间 Web 界面"
        echo "3. 进入 SSH 设置，添加授权密钥"
        echo "4. 粘贴上述公钥内容"
    fi
}

# 配置 SMB 连接
configure_smb_connection() {
    echo ""
    echo -e "${BLUE}🗂️  配置 SMB/CIFS 连接${NC}"
    echo ""
    
    # 检查 SMB 客户端
    if ! command -v smbclient >/dev/null 2>&1; then
        echo -e "${RED}❌ 未安装 smbclient${NC}"
        echo ""
        echo "请安装 SMB 客户端："
        echo "Ubuntu/Debian: sudo apt-get install samba-client cifs-utils"
        echo "CentOS/RHEL:   sudo yum install samba-client cifs-utils"
        echo "macOS:         brew install samba"
        return 1
    fi
    
    local nas_ip=$(grep 'NAS_IP=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    
    # SMB 共享配置
    echo "配置 SMB 共享路径："
    local current_share=$(grep 'SMB_SHARE=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    read -p "SMB 共享路径 [$current_share]: " smb_share
    if [ -n "$smb_share" ]; then
        sed -i "s|SMB_SHARE=\".*\"|SMB_SHARE=\"$smb_share\"|" "$NAS_BACKUP_SCRIPT"
    fi
    
    # 挂载点配置
    local current_mount=$(grep 'SMB_MOUNT_POINT=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    read -p "本地挂载点 [$current_mount]: " mount_point
    if [ -n "$mount_point" ]; then
        sed -i "s|SMB_MOUNT_POINT=\".*\"|SMB_MOUNT_POINT=\"$mount_point\"|" "$NAS_BACKUP_SCRIPT"
    fi
    
    # 测试 SMB 连接
    echo ""
    echo "🔄 测试 SMB 连接..."
    local nas_user=$(grep 'NAS_USER=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    if smbclient -L "$nas_ip" -U "$nas_user" 2>/dev/null | grep -q "Sharename"; then
        echo -e "${GREEN}✓${NC} SMB 连接测试成功"
    else
        echo -e "${RED}❌ SMB 连接测试失败${NC}"
    fi
}

# 配置 rsync 连接
configure_rsync_connection() {
    echo ""
    echo -e "${BLUE}🔄 配置 rsync 连接${NC}"
    echo ""
    
    # 检查 rsync
    if ! command -v rsync >/dev/null 2>&1; then
        echo -e "${RED}❌ 未安装 rsync${NC}"
        echo "请安装 rsync"
        return 1
    fi
    
    echo "rsync 配置需要在极空间 NAS 上启用 rsync 服务"
    echo "并配置相应的模块和用户权限"
    echo ""
    
    # rsync 用户配置
    local current_rsync_user=$(grep 'RSYNC_USER=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    read -p "rsync 用户名 [$current_rsync_user]: " rsync_user
    if [ -n "$rsync_user" ]; then
        sed -i "s/RSYNC_USER=\".*\"/RSYNC_USER=\"$rsync_user\"/" "$NAS_BACKUP_SCRIPT"
    fi
    
    # rsync 模块配置
    local current_module=$(grep 'RSYNC_MODULE=' "$NAS_BACKUP_SCRIPT" | cut -d'"' -f2)
    read -p "rsync 模块名 [$current_module]: " rsync_module
    if [ -n "$rsync_module" ]; then
        sed -i "s/RSYNC_MODULE=\".*\"/RSYNC_MODULE=\"$rsync_module\"/" "$NAS_BACKUP_SCRIPT"
    fi
}

# 配置备份策略
configure_backup_policy() {
    echo ""
    echo -e "${BLUE}${BOLD}📅 配置备份策略${NC}"
    echo ""
    
    echo "当前备份保留策略："
    echo "- 本地保留: $(grep 'KEEP_LOCAL_BACKUPS=' "$NAS_BACKUP_SCRIPT" | cut -d'=' -f2) 天"
    echo "- NAS 保留: $(grep 'KEEP_NAS_BACKUPS=' "$NAS_BACKUP_SCRIPT" | cut -d'=' -f2) 天"
    echo "- NAS 最大文件数: $(grep 'MAX_NAS_BACKUPS=' "$NAS_BACKUP_SCRIPT" | cut -d'=' -f2) 个"
    echo ""
    
    read -p "是否修改备份保留策略? (y/N): " modify_policy
    if [[ $modify_policy =~ ^[Yy]$ ]]; then
        read -p "本地保留天数 [7]: " local_days
        read -p "NAS 保留天数 [90]: " nas_days
        read -p "NAS 最大文件数 [200]: " max_files
        
        [ -n "$local_days" ] && sed -i "s/KEEP_LOCAL_BACKUPS=.*/KEEP_LOCAL_BACKUPS=$local_days/" "$NAS_BACKUP_SCRIPT"
        [ -n "$nas_days" ] && sed -i "s/KEEP_NAS_BACKUPS=.*/KEEP_NAS_BACKUPS=$nas_days/" "$NAS_BACKUP_SCRIPT"
        [ -n "$max_files" ] && sed -i "s/MAX_NAS_BACKUPS=.*/MAX_NAS_BACKUPS=$max_files/" "$NAS_BACKUP_SCRIPT"
        
        echo -e "${GREEN}✓${NC} 备份策略已更新"
    fi
}

# 设置定时任务
setup_scheduled_sync() {
    echo ""
    echo -e "${BLUE}${BOLD}⏰ 设置定时同步${NC}"
    echo ""
    
    echo "选择同步频率："
    echo "1) 每天凌晨 3 点同步到 NAS"
    echo "2) 每天备份后立即同步"
    echo "3) 每周同步一次"
    echo "4) 手动同步（不设置定时任务）"
    echo ""
    
    read -p "请选择 (1-4): " sync_choice
    
    case $sync_choice in
        1)
            CRON_EXPR="0 3 * * *"
            DESCRIPTION="每天凌晨 3 点"
            ;;
        2)
            CRON_EXPR="30 2 * * *"
            DESCRIPTION="每天凌晨 2:30（备份后）"
            ;;
        3)
            CRON_EXPR="0 3 * * 0"
            DESCRIPTION="每周日凌晨 3 点"
            ;;
        4)
            echo -e "${YELLOW}选择手动同步，跳过定时任务设置${NC}"
            return 0
            ;;
        *)
            echo -e "${RED}❌ 无效选择${NC}"
            return 1
            ;;
    esac
    
    # 添加到 crontab
    CRON_JOB="$CRON_EXPR cd $(dirname "$NAS_BACKUP_SCRIPT") && $NAS_BACKUP_SCRIPT >> $(dirname "$NAS_BACKUP_SCRIPT")/nas_sync.log 2>&1"
    
    (
        crontab -l 2>/dev/null | grep -v "$NAS_BACKUP_SCRIPT"
        echo "# Seek-Self NAS 同步 - $DESCRIPTION"
        echo "$CRON_JOB"
    ) | crontab -
    
    echo -e "${GREEN}✓${NC} 定时同步任务设置完成: $DESCRIPTION"
}

# 最终测试
final_test() {
    echo ""
    echo -e "${BLUE}${BOLD}🧪 最终测试${NC}"
    echo ""
    
    echo "正在测试配置..."
    if "$NAS_BACKUP_SCRIPT" --test; then
        echo -e "${GREEN}✓${NC} 配置测试通过"
        echo ""
        echo "🎉 极空间 NAS 备份配置完成！"
        echo ""
        echo "后续操作："
        echo "1. 运行立即同步测试: $NAS_BACKUP_SCRIPT --sync"
        echo "2. 查看同步日志: tail -f $(dirname "$NAS_BACKUP_SCRIPT")/nas_sync.log"
        echo "3. 管理备份: $(dirname "$NAS_BACKUP_SCRIPT")/backup-manager.sh"
        return 0
    else
        echo -e "${RED}❌ 配置测试失败${NC}"
        echo "请检查配置并重新运行向导"
        return 1
    fi
}

# 主流程
main() {
    show_title
    
    echo "此向导将帮助您配置极空间 NAS 的自动备份功能"
    echo ""
    read -p "按回车键开始配置..."
    
    # 检测 NAS
    detect_nas
    
    # 配置基本信息
    if ! configure_nas_basic; then
        echo -e "${RED}基本配置失败${NC}"
        exit 1
    fi
    
    # 选择连接方式
    if ! choose_connection_type; then
        echo -e "${RED}连接配置失败${NC}"
        exit 1
    fi
    
    # 配置备份策略
    configure_backup_policy
    
    # 设置定时任务
    setup_scheduled_sync
    
    # 最终测试
    final_test
}

# 检查脚本文件
if [ ! -f "$NAS_BACKUP_SCRIPT" ]; then
    echo -e "${RED}❌ 备份脚本不存在: $NAS_BACKUP_SCRIPT${NC}"
    exit 1
fi

# 设置执行权限
chmod +x "$NAS_BACKUP_SCRIPT"

# 运行主程序
main
