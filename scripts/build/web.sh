#!/bin/bash

# Web端构建脚本
# 版本号格式: 分支-构建时间-web

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录的根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PANEL_DIR="$ROOT_DIR/panel"
DIST_DIR="$ROOT_DIR/dist"

# 生成版本号: 分支-构建时间-web
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BUILD_TIME=$(date '+%Y%m%d-%H%M%S')
VERSION="${BRANCH_NAME}-${BUILD_TIME}-web"

log_info "项目根目录: $ROOT_DIR"
log_info "Web端目录: $PANEL_DIR"
log_info "输出目录: $DIST_DIR"
log_info "版本号: $VERSION"

# 检查Web端目录是否存在
if [ ! -d "$PANEL_DIR" ]; then
    log_error "Web端目录不存在: $PANEL_DIR"
    exit 1
fi

# 创建输出目录
if [ ! -d "$DIST_DIR" ]; then
    log_info "创建输出目录: $DIST_DIR"
    mkdir -p "$DIST_DIR"
fi

# 安装依赖 (在根目录执行，支持 monorepo)
install_dependencies() {
    log_info "安装项目依赖 (使用 Yarn Workspaces)..."
    cd "$ROOT_DIR"
    
    # 启用最新版 Yarn
    if command -v corepack &> /dev/null; then
        log_info "启用 Corepack 和最新版 Yarn..."
        corepack enable
        yarn set version stable
    fi
    
    # 显示 Yarn 版本
    YARN_VERSION=$(yarn --version)
    log_info "Yarn 版本: $YARN_VERSION"
    
    if [ -f "yarn.lock" ]; then
        log_info "使用 Yarn Workspaces 安装依赖..."
        yarn install --immutable
        
        # 显示工作区信息
        log_info "工作区列表:"
        yarn workspaces list
    elif [ -f "package-lock.json" ]; then
        log_info "使用 NPM 安装依赖..."
        npm install
    else
        log_info "未找到锁文件，使用 Yarn 安装依赖..."
        yarn install
    fi
    
    log_success "依赖安装完成"
}

# 构建 Web 应用
build_web() {
    log_info "开始构建 Web 应用..."
    
    # 在根目录执行构建 (使用 Yarn Workspace)
    cd "$ROOT_DIR"
    if [ -f ".yarnrc.yml" ] || [ -f "yarn.lock" ]; then
        log_info "使用 Yarn Workspace 执行构建..."
        yarn workspace panel build
    elif [ -f "lerna.json" ]; then
        log_info "使用 Lerna 执行构建..."
        npx lerna exec --scope panel -- yarn build
    else
        log_info "直接在Web端目录执行构建..."
        cd "$PANEL_DIR"
        yarn build
    fi
    
    log_success "Web 应用构建完成"
}

# 复制构建产物到输出目录
copy_artifacts() {
    log_info "复制构建产物到输出目录..."
    
    # 创建Web端输出子目录
    WEB_DIST_DIR="$DIST_DIR/web"
    mkdir -p "$WEB_DIST_DIR"
    
    # 复制Web构建产物
    if [ -d "$PANEL_DIR/dist" ]; then
        cp -r "$PANEL_DIR/dist" "$WEB_DIST_DIR/"
        log_success "Web 静态文件已复制到: $WEB_DIST_DIR/dist"
    else
        log_error "未找到 Web 构建产物: $PANEL_DIR/dist"
        exit 1
    fi
    
    # 复制 Docker 相关文件
    if [ -f "$PANEL_DIR/Dockerfile" ]; then
        cp "$PANEL_DIR/Dockerfile" "$WEB_DIST_DIR/"
        log_info "Dockerfile 已复制"
    fi
    
    if [ -f "$PANEL_DIR/nginx.conf" ]; then
        cp "$PANEL_DIR/nginx.conf" "$WEB_DIST_DIR/"
        log_info "nginx.conf 已复制"
    fi
    
    # 复制服务配置文件到根输出目录
    if [ -f "$ROOT_DIR/docker-compose.yml" ]; then
        cp "$ROOT_DIR/docker-compose.yml" "$DIST_DIR/"
        log_info "docker-compose.yml 已复制"
    fi
    
    if [ -d "$ROOT_DIR/nginx" ]; then
        cp -r "$ROOT_DIR/nginx" "$DIST_DIR/"
        log_info "nginx 配置目录已复制"
    fi
    
    # 计算构建产物大小
    DIST_SIZE=$(du -sh "$WEB_DIST_DIR/dist" | cut -f1)
    
    # 复制构建信息
    BUILD_INFO="$WEB_DIST_DIR/build-info.txt"
    cat > "$BUILD_INFO" << EOF
Web端构建信息
=============
版本号: $VERSION
构建时间: $(date '+%Y-%m-%d %H:%M:%S UTC')
分支: $BRANCH_NAME
构建目录: $PANEL_DIR
输出目录: $WEB_DIST_DIR
Git 提交: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

构建产物:
- Web 静态文件: dist/ ($DIST_SIZE)
- Docker 配置: Dockerfile, nginx.conf
- 服务配置: docker-compose.yml, nginx/

部署说明:
1. 解压构建包到服务器
2. 运行: docker-compose up -d
3. 访问: http://localhost:10000

构建状态: 成功
EOF
    
    log_success "构建信息已保存到: $BUILD_INFO"
}

# 创建部署包
create_deployment_package() {
    log_info "创建部署包..."
    
    cd "$DIST_DIR"
    
    # 创建压缩包
    PACKAGE_NAME="web-${VERSION}.tar.gz"
    tar -czf "$PACKAGE_NAME" web/ docker-compose.yml nginx/
    
    PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
    log_success "部署包已创建: $DIST_DIR/$PACKAGE_NAME ($PACKAGE_SIZE)"
    
    # 创建部署说明
    DEPLOY_README="$DIST_DIR/DEPLOY-README.txt"
    cat > "$DEPLOY_README" << EOF
Web端部署说明
=============
版本: $VERSION
包名: $PACKAGE_NAME
大小: $PACKAGE_SIZE

部署步骤:
1. 上传部署包到服务器
   scp $PACKAGE_NAME user@server:/path/to/deploy/

2. 解压部署包
   tar -xzf $PACKAGE_NAME

3. 启动服务
   cd web/
   docker-compose up -d

4. 验证部署
   curl http://localhost:10000

5. 查看日志
   docker-compose logs -f

目录结构:
web/
├── dist/           # Web 静态文件
├── Dockerfile      # Web 容器配置
├── nginx.conf      # Nginx 配置
└── build-info.txt  # 构建信息

docker-compose.yml  # 服务编排配置
nginx/              # 全局 Nginx 配置

注意事项:
- 确保服务器已安装 Docker 和 Docker Compose
- 检查端口 10000 是否被占用
- 首次部署可能需要下载 Docker 镜像
EOF
    
    log_success "部署说明已创建: $DEPLOY_README"
}

# 显示构建结果
show_build_result() {
    log_success "Web端构建完成！"
    echo ""
    echo "构建信息:"
    echo "  🌐 版本号: $VERSION"
    echo "  📅 构建时间: $(date '+%Y-%m-%d %H:%M:%S UTC')"
    echo "  🌿 分支: $BRANCH_NAME"
    echo ""
    echo "构建产物位置:"
    echo "  🌐 Web 文件: $DIST_DIR/web/dist/"
    echo "  📦 部署包: $DIST_DIR/web-${VERSION}.tar.gz"
    echo "  📋 构建信息: $DIST_DIR/web/build-info.txt"
    echo "  📖 部署说明: $DIST_DIR/DEPLOY-README.txt"
    echo ""
    echo "部署命令:"
    echo "  cd $DIST_DIR && tar -xzf web-${VERSION}.tar.gz && cd web && docker-compose up -d"
}

# 主函数
main() {
    log_info "开始Web端构建流程..."
    echo ""
    
    # 安装依赖 (在根目录)
    install_dependencies
    
    # 构建 Web 应用
    build_web
    
    # 复制构建产物
    copy_artifacts
    
    # 创建部署包
    create_deployment_package
    
    # 显示结果
    show_build_result
}

# 错误处理
trap 'log_error "构建过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"
