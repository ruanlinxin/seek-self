#!/bin/bash

# 设置定时备份任务
# 用于配置 crontab 定时执行数据库备份

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-advanced.sh"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== 数据库定时备份设置 ==========${NC}"

# 检查备份脚本是否存在
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo -e "${RED}错误: 备份脚本不存在: $BACKUP_SCRIPT${NC}"
    exit 1
fi

# 给备份脚本执行权限
chmod +x "$BACKUP_SCRIPT"
echo -e "${GREEN}✓${NC} 已设置备份脚本执行权限"

# 预定义的 cron 配置
echo ""
echo -e "${YELLOW}选择备份频率:${NC}"
echo "1) 每天凌晨 2 点备份"
echo "2) 每天凌晨 2 点和下午 2 点备份（每 12 小时）"
echo "3) 每 6 小时备份一次"
echo "4) 每周日凌晨 2 点备份"
echo "5) 自定义 cron 表达式"
echo "6) 查看当前 cron 任务"
echo "7) 删除现有备份任务"

read -p "请选择 (1-7): " choice

case $choice in
    1)
        CRON_EXPR="0 2 * * *"
        DESCRIPTION="每天凌晨 2 点"
        ;;
    2)
        CRON_EXPR="0 2,14 * * *"
        DESCRIPTION="每天凌晨 2 点和下午 2 点"
        ;;
    3)
        CRON_EXPR="0 */6 * * *"
        DESCRIPTION="每 6 小时"
        ;;
    4)
        CRON_EXPR="0 2 * * 0"
        DESCRIPTION="每周日凌晨 2 点"
        ;;
    5)
        echo ""
        echo "Cron 表达式格式: 分 时 日 月 周"
        echo "示例: 0 2 * * * (每天凌晨 2 点)"
        read -p "请输入自定义 cron 表达式: " CRON_EXPR
        DESCRIPTION="自定义时间"
        ;;
    6)
        echo ""
        echo -e "${BLUE}当前 cron 任务:${NC}"
        crontab -l | grep -E "(backup|seek-self)" || echo "未找到相关的备份任务"
        exit 0
        ;;
    7)
        echo ""
        echo -e "${YELLOW}删除现有备份任务...${NC}"
        # 删除包含 backup-advanced.sh 的 cron 任务
        (crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT") | crontab -
        echo -e "${GREEN}✓${NC} 已删除现有备份任务"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选择${NC}"
        exit 1
        ;;
esac

# 验证 cron 表达式
if ! echo "$CRON_EXPR" | grep -qE '^[0-9\*\/\,\-]+ [0-9\*\/\,\-]+ [0-9\*\/\,\-]+ [0-9\*\/\,\-]+ [0-9\*\/\,\-]+$'; then
    echo -e "${RED}错误: 无效的 cron 表达式${NC}"
    exit 1
fi

# 创建完整的 cron 任务
CRON_JOB="$CRON_EXPR cd $PROJECT_ROOT && $BACKUP_SCRIPT >> $PROJECT_ROOT/backups/mysql/cron.log 2>&1"

echo ""
echo -e "${BLUE}将要添加的 cron 任务:${NC}"
echo "时间: $DESCRIPTION"
echo "表达式: $CRON_EXPR"
echo "命令: $BACKUP_SCRIPT"
echo ""

read -p "确认添加此定时任务? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

# 添加到 crontab
(
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" # 先删除已存在的同样任务
    echo "# Seek-Self 数据库自动备份 - $DESCRIPTION"
    echo "$CRON_JOB"
) | crontab -

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} 定时备份任务设置成功!"
    echo ""
    echo -e "${BLUE}任务详情:${NC}"
    echo "  备份频率: $DESCRIPTION"
    echo "  备份脚本: $BACKUP_SCRIPT"
    echo "  日志文件: $PROJECT_ROOT/backups/mysql/cron.log"
    echo "  备份目录: $PROJECT_ROOT/backups/mysql/"
    echo ""
    echo -e "${YELLOW}注意:${NC}"
    echo "1. 确保 Docker 服务正在运行"
    echo "2. 确保 seek-self-mysql 容器正在运行"
    echo "3. 定时任务日志保存在 backups/mysql/cron.log"
    echo "4. 可以使用 'crontab -l' 查看所有定时任务"
    echo ""
    echo -e "${GREEN}设置完成!${NC}"
else
    echo -e "${RED}错误: 设置定时任务失败${NC}"
    exit 1
fi
