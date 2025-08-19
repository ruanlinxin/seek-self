#!/bin/bash

# 移动端 APK 构建脚本
# 版本号格式: 分支-构建时间-mobile

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
MOBILE_DIR="$ROOT_DIR/mobile"
DIST_DIR="$ROOT_DIR/dist"

# 生成版本号: 分支-构建时间-mobile
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BUILD_TIME=$(date '+%Y%m%d-%H%M%S')
VERSION="${BRANCH_NAME}-${BUILD_TIME}-mobile"

log_info "项目根目录: $ROOT_DIR"
log_info "移动端目录: $MOBILE_DIR"
log_info "输出目录: $DIST_DIR"
log_info "版本号: $VERSION"

# 检查移动端目录是否存在
if [ ! -d "$MOBILE_DIR" ]; then
    log_error "移动端目录不存在: $MOBILE_DIR"
    exit 1
fi

# 创建输出目录
if [ ! -d "$DIST_DIR" ]; then
    log_info "创建输出目录: $DIST_DIR"
    mkdir -p "$DIST_DIR"
fi

# 检查 Android SDK 环境
check_android_env() {
    log_info "检查 Android 环境..."
    
    if [ -z "$ANDROID_HOME" ]; then
        log_warning "ANDROID_HOME 环境变量未设置，尝试自动检测..."
        if [ -d "$HOME/Library/Android/sdk" ]; then
            export ANDROID_HOME="$HOME/Library/Android/sdk"
            log_info "检测到 Android SDK: $ANDROID_HOME"
        elif [ -d "$HOME/Android/Sdk" ]; then
            export ANDROID_HOME="$HOME/Android/Sdk"
            log_info "检测到 Android SDK: $ANDROID_HOME"
        else
            log_error "未找到 Android SDK，请设置 ANDROID_HOME 环境变量"
            exit 1
        fi
    fi
    
    # 检查必要的工具
    if [ ! -f "$ANDROID_HOME/platform-tools/adb" ]; then
        log_error "Android SDK 工具不完整，请重新安装 Android SDK"
        exit 1
    fi
    
    log_success "Android 环境检查通过"
}

# 安装依赖 (在根目录执行，支持 monorepo)
install_dependencies() {
    log_info "安装项目依赖 (在根目录执行)..."
    cd "$ROOT_DIR"
    
    if [ -f "yarn.lock" ]; then
        log_info "使用 Yarn Workspaces 安装依赖..."
        yarn install
    elif [ -f "package-lock.json" ]; then
        log_info "使用 NPM 安装依赖..."
        npm install
    else
        log_info "未找到锁文件，使用 Yarn 安装依赖..."
        yarn install
    fi
    
    log_success "依赖安装完成"
}

# 预构建 Android 项目
prebuild_android() {
    log_info "检查 Android 项目状态..."
    
    # 检查是否已经预构建且文件完整
    if [ -d "$MOBILE_DIR/android" ] && [ -f "$MOBILE_DIR/android/app/build.gradle" ] && [ -f "$MOBILE_DIR/android/gradlew" ]; then
        log_success "Android 项目已存在且完整，跳过预构建"
        log_info "如需重新预构建，请手动删除 android/ 目录"
        return 0
    fi
    
    # 检查是否有预构建标记文件
    PREBUILD_MARKER="$MOBILE_DIR/.prebuild-complete"
    if [ -f "$PREBUILD_MARKER" ]; then
        log_info "检测到预构建标记文件，跳过预构建"
        log_info "如需重新预构建，请删除标记文件: $PREBUILD_MARKER"
        return 0
    fi
    
    log_info "Android 项目不存在或不完整，开始预构建..."
    log_warning "预构建过程可能需要 10-30 分钟，请耐心等待..."
    
    # 在根目录执行预构建 (支持 monorepo)
    cd "$ROOT_DIR"
    if [ -f "lerna.json" ]; then
        log_info "使用 Lerna 执行预构建..."
        npx lerna exec --scope mobile -- npx expo prebuild --platform android --clean
    elif [ -f ".yarnrc.yml" ]; then
        log_info "使用 Yarn Workspace 执行预构建..."
        yarn workspace mobile expo prebuild --platform android --clean
    else
        log_info "直接在移动端目录执行预构建..."
        cd "$MOBILE_DIR"
        npx expo prebuild --platform android --clean
    fi
    
    # 创建预构建完成标记
    echo "预构建完成时间: $(date '+%Y-%m-%d %H:%M:%S UTC')" > "$PREBUILD_MARKER"
    
    log_success "Android 项目预构建完成"
    log_info "已创建预构建标记文件，后续构建将跳过此步骤"
}

# 构建 APK
build_apk() {
    log_info "开始构建 APK..."
    
    if [ ! -d "$MOBILE_DIR/android" ]; then
        log_error "Android 项目不存在，请先执行预构建"
        exit 1
    fi
    
    cd "$MOBILE_DIR/android"
    
    # 创建 local.properties
    if [ ! -f "local.properties" ]; then
        log_info "创建 local.properties..."
        echo "sdk.dir=$ANDROID_HOME" > local.properties
    fi
    
    # 清理之前的构建
    log_info "清理之前的构建..."
    ./gradlew clean
    
    # 构建 Release APK
    log_info "构建 Release APK..."
    ./gradlew assembleRelease
    
    log_success "APK 构建完成"
}

# 复制构建产物到输出目录
copy_artifacts() {
    log_info "复制构建产物到输出目录..."
    
    # 创建移动端输出子目录
    MOBILE_DIST_DIR="$DIST_DIR/mobile"
    mkdir -p "$MOBILE_DIST_DIR"
    
    # 复制 APK 文件 (使用版本号命名)
    APK_SOURCE="$MOBILE_DIR/android/app/build/outputs/apk/release/app-release.apk"
    APK_DEST="$MOBILE_DIST_DIR/${VERSION}.apk"
    
    if [ -f "$APK_SOURCE" ]; then
        cp "$APK_SOURCE" "$APK_DEST"
        log_success "APK 已复制到: $APK_DEST"
        
        # 显示文件信息
        APK_SIZE=$(du -h "$APK_DEST" | cut -f1)
        log_info "APK 文件大小: $APK_SIZE"
    else
        log_error "未找到构建的 APK 文件: $APK_SOURCE"
        exit 1
    fi
    
    # 复制构建信息
    BUILD_INFO="$MOBILE_DIST_DIR/build-info.txt"
    cat > "$BUILD_INFO" << EOF
移动端 APK 构建信息
==================
版本号: $VERSION
构建时间: $(date '+%Y-%m-%d %H:%M:%S UTC')
分支: $BRANCH_NAME
构建目录: $MOBILE_DIR
输出目录: $MOBILE_DIST_DIR
Android SDK: $ANDROID_HOME
Git 提交: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

构建产物:
- APK 文件: ${VERSION}.apk
- 文件大小: $APK_SIZE

安装说明:
1. 下载 APK 文件到 Android 设备
2. 开启"未知来源"应用安装权限
3. 点击 APK 文件进行安装

构建状态: 成功
EOF
    
    log_success "构建信息已保存到: $BUILD_INFO"
}

# 显示构建结果
show_build_result() {
    log_success "移动端 APK 构建完成！"
    echo ""
    echo "构建信息:"
    echo "  📱 版本号: $VERSION"
    echo "  📅 构建时间: $(date '+%Y-%m-%d %H:%M:%S UTC')"
    echo "  🌿 分支: $BRANCH_NAME"
    echo ""
    echo "构建产物位置:"
    echo "  📱 APK 文件: $DIST_DIR/mobile/${VERSION}.apk"
    echo "  📋 构建信息: $DIST_DIR/mobile/build-info.txt"
    echo ""
    echo "你可以将 APK 文件安装到 Android 设备上进行测试"
}

# 主函数
main() {
    log_info "开始移动端 APK 构建流程..."
    echo ""
    
    # 检查环境
    check_android_env
    
    # 安装依赖 (在根目录)
    install_dependencies
    
    # 预构建 Android 项目
    prebuild_android
    
    # 构建 APK
    build_apk
    
    # 复制构建产物
    copy_artifacts
    
    # 显示结果
    show_build_result
}

# 错误处理
trap 'log_error "构建过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"