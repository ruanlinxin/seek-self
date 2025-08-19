#!/bin/bash

# 服务端构建脚本
# 版本号格式: 分支-构建时间-server

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
SERVER_DIR="$ROOT_DIR/server"
DIST_DIR="$ROOT_DIR/dist"

# 生成版本号: 分支-构建时间-server
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BUILD_TIME=$(date '+%Y%m%d-%H%M%S')
VERSION="${BRANCH_NAME}-${BUILD_TIME}-server"

log_info "项目根目录: $ROOT_DIR"
log_info "服务端目录: $SERVER_DIR"
log_info "输出目录: $DIST_DIR"
log_info "版本号: $VERSION"

# 检查服务端目录是否存在
if [ ! -d "$SERVER_DIR" ]; then
    log_error "服务端目录不存在: $SERVER_DIR"
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

# 构建服务端应用
build_server() {
    log_info "开始构建服务端应用..."
    
    # 在根目录执行构建 (使用 Yarn Workspace)
    cd "$ROOT_DIR"
    if [ -f ".yarnrc.yml" ] || [ -f "yarn.lock" ]; then
        log_info "使用 Yarn Workspace 执行构建..."
        yarn workspace server build
    elif [ -f "lerna.json" ]; then
        log_info "使用 Lerna 执行构建..."
        npx lerna exec --scope server -- yarn build
    else
        log_info "直接在服务端目录执行构建..."
        cd "$SERVER_DIR"
        yarn build
    fi
    
    log_success "服务端应用构建完成"
}

# 复制构建产物到输出目录
copy_artifacts() {
    log_info "复制构建产物到输出目录..."
    
    # 创建服务端输出子目录
    SERVER_DIST_DIR="$DIST_DIR/server"
    mkdir -p "$SERVER_DIST_DIR"
    
    # 复制服务端构建产物
    if [ -d "$SERVER_DIR/dist" ]; then
        cp -r "$SERVER_DIR/dist" "$SERVER_DIST_DIR/"
        log_success "服务端构建文件已复制到: $SERVER_DIST_DIR/dist"
    else
        log_error "未找到服务端构建产物: $SERVER_DIR/dist"
        exit 1
    fi
    
    # 复制 package.json (生产依赖)
    if [ -f "$SERVER_DIR/package.json" ]; then
        cp "$SERVER_DIR/package.json" "$SERVER_DIST_DIR/"
        log_info "package.json 已复制"
    fi
    
    # 复制 Docker 相关文件
    if [ -f "$SERVER_DIR/Dockerfile" ]; then
        cp "$SERVER_DIR/Dockerfile" "$SERVER_DIST_DIR/"
        log_info "Dockerfile 已复制"
    fi
    
    # 复制环境配置文件
    if [ -f "$SERVER_DIR/.env.example" ]; then
        cp "$SERVER_DIR/.env.example" "$SERVER_DIST_DIR/"
        log_info ".env.example 已复制"
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
    DIST_SIZE=$(du -sh "$SERVER_DIST_DIR/dist" | cut -f1)
    
    # 复制构建信息
    BUILD_INFO="$SERVER_DIST_DIR/build-info.txt"
    cat > "$BUILD_INFO" << EOF
服务端构建信息
===============
版本号: $VERSION
构建时间: $(date '+%Y-%m-%d %H:%M:%S UTC')
分支: $BRANCH_NAME
构建目录: $SERVER_DIR
输出目录: $SERVER_DIST_DIR
Git 提交: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

构建产物:
- 服务端代码: dist/ ($DIST_SIZE)
- 生产依赖: package.json
- Docker 配置: Dockerfile (如果存在)
- 环境配置: .env.example (如果存在)
- 服务配置: docker-compose.yml, nginx/

部署说明:
1. 安装生产依赖: npm install --production
2. 设置环境变量: 复制 .env.example 为 .env 并配置
3. 启动服务: npm start 或 docker-compose up -d
4. 验证服务: curl http://localhost:3000/health

构建状态: 成功
EOF
    
    log_success "构建信息已保存到: $BUILD_INFO"
}

# 创建部署包
create_deployment_package() {
    log_info "创建部署包..."
    
    cd "$DIST_DIR"
    
    # 创建压缩包
    PACKAGE_NAME="server-${VERSION}.tar.gz"
    tar -czf "$PACKAGE_NAME" server/ docker-compose.yml nginx/
    
    PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
    log_success "部署包已创建: $DIST_DIR/$PACKAGE_NAME ($PACKAGE_SIZE)"
    
    # 创建部署说明
    DEPLOY_README="$DIST_DIR/SERVER-DEPLOY-README.txt"
    cat > "$DEPLOY_README" << EOF
服务端部署说明
===============
版本: $VERSION
包名: $PACKAGE_NAME
大小: $PACKAGE_SIZE

部署步骤:
1. 上传部署包到服务器
   scp $PACKAGE_NAME user@server:/path/to/deploy/

2. 解压部署包
   tar -xzf $PACKAGE_NAME

3. 安装生产依赖
   cd server/
   npm install --production

4. 配置环境变量
   cp .env.example .env
   # 编辑 .env 文件，配置数据库等

5. 启动服务 (选择一种方式)
   # 方式1: 直接启动
   npm start
   
   # 方式2: 使用 PM2
   npm install -g pm2
   pm2 start dist/main.js --name "seek-self-server"
   
   # 方式3: 使用 Docker
   docker-compose up -d

6. 验证部署
   curl http://localhost:3000/health
   curl http://localhost:3000/api/health

7. 查看日志
   # PM2 方式
   pm2 logs seek-self-server
   
   # Docker 方式
   docker-compose logs -f server

目录结构:
server/
├── dist/           # 编译后的 Node.js 代码
├── package.json    # 生产依赖配置
├── Dockerfile      # Docker 配置 (如果存在)
├── .env.example    # 环境变量模板
└── build-info.txt  # 构建信息

docker-compose.yml  # 服务编排配置
nginx/              # Nginx 配置

注意事项:
- 确保 Node.js 版本 >= 18
- 确保数据库服务已启动并可连接
- 检查端口 3000 是否被占用
- 生产环境建议使用 PM2 或 Docker 部署
EOF
    
    log_success "部署说明已创建: $DEPLOY_README"
}

# 显示构建结果
show_build_result() {
    log_success "服务端构建完成！"
    echo ""
    echo "构建信息:"
    echo "  🖥️  版本号: $VERSION"
    echo "  📅 构建时间: $(date '+%Y-%m-%d %H:%M:%S UTC')"
    echo "  🌿 分支: $BRANCH_NAME"
    echo ""
    echo "构建产物位置:"
    echo "  🖥️  服务端代码: $DIST_DIR/server/dist/"
    echo "  📦 部署包: $DIST_DIR/server-${VERSION}.tar.gz"
    echo "  📋 构建信息: $DIST_DIR/server/build-info.txt"
    echo "  📖 部署说明: $DIST_DIR/SERVER-DEPLOY-README.txt"
    echo ""
    echo "部署命令:"
    echo "  cd $DIST_DIR && tar -xzf server-${VERSION}.tar.gz && cd server && npm install --production && npm start"
}

# 主函数
main() {
    log_info "开始服务端构建流程..."
    echo ""
    
    # 安装依赖 (在根目录)
    install_dependencies
    
    # 构建服务端应用
    build_server
    
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
