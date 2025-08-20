#!/usr/bin/env bash
set -euo pipefail

# 以脚本所在目录为基准
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# 归档（下载）目录 与 解压目录 分离
ARCHIVE_DIR="${SCRIPT_DIR}/downloads"
EXTRACT_DIR="${SCRIPT_DIR}/release"

REPO="ruanlinxin/seek-self"
API="https://api.github.com/repos/${REPO}/releases/latest"

# 可选：通过环境变量传入 GitHub Token 以减少限流
AUTH_HEADER=""
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH_HEADER="Authorization: token ${GITHUB_TOKEN}"
fi

mkdir -p "$ARCHIVE_DIR" "$EXTRACT_DIR"

echo "获取最新版本信息..."
RESPONSE=$(curl -sSL ${AUTH_HEADER:+-H "$AUTH_HEADER"} "$API")

# 提取 tag 与资源链接（优先使用 jq，支持 zip 和 tar.gz）
if command -v jq >/dev/null 2>&1; then
  TAG=$(echo "$RESPONSE" | jq -r '.tag_name // empty')
  # 优先查找 seek-self.zip，如果没有再找 tar.gz
  DOWNLOAD_URL=$(echo "$RESPONSE" | jq -r '.assets[] | select(.name == "seek-self.zip") | .browser_download_url' | head -n1)
  if [[ -z "$DOWNLOAD_URL" ]]; then
    DOWNLOAD_URL=$(echo "$RESPONSE" | jq -r '.assets[] | select(.name | endswith(".tar.gz")) | .browser_download_url' | head -n1)
  fi
else
  TAG=$(echo "$RESPONSE" | grep -oE '"tag_name"\s*:\s*"[^"]+' | sed 's/.*:"//')
  # 优先查找 seek-self.zip
  DOWNLOAD_URL=$(echo "$RESPONSE" | grep -oE 'https://[^"]+/seek-self\.zip' | head -n1)
  if [[ -z "$DOWNLOAD_URL" ]]; then
    DOWNLOAD_URL=$(echo "$RESPONSE" | grep -oE 'https://[^"]+\.tar\.gz' | head -n1)
  fi
fi

if [[ -z "${TAG:-}" || -z "${DOWNLOAD_URL:-}" ]]; then
  echo "未找到最新版本的部署包（zip 或 tar.gz），或 API 响应异常。" >&2
  exit 1
fi

echo "最新版本: ${TAG}"
echo "下载地址: ${DOWNLOAD_URL}"

# 根据文件类型确定文件名和解压方式
if [[ "$DOWNLOAD_URL" == *".zip" ]]; then
  ARCHIVE_PATH="${ARCHIVE_DIR}/seek-self-${TAG}.zip"
  echo "下载到: ${ARCHIVE_PATH}"
  curl -fL --retry 3 -o "$ARCHIVE_PATH" "$DOWNLOAD_URL"
  
  # 清空解压目标目录（保持目录存在）
  rm -rf "${EXTRACT_DIR:?}"/*
  
  echo "解压 ZIP 到: ${EXTRACT_DIR}"
  # 先解压到临时位置，然后检查结构
  TEMP_DIR="${EXTRACT_DIR}_temp"
  mkdir -p "$TEMP_DIR"
  unzip -q "$ARCHIVE_PATH" -d "$TEMP_DIR"
  
  # 检查解压结果
  echo "临时解压内容："
  ls -la "$TEMP_DIR"
  
  # 如果临时目录中直接是部署文件，则移动到目标目录
  if [[ -f "$TEMP_DIR/docker-compose.yml" ]]; then
    echo "发现部署文件在根目录，直接移动"
    mv "$TEMP_DIR"/* "$EXTRACT_DIR"/
  else
    # 查找包含 docker-compose.yml 的子目录
    DEPLOY_DIR=$(find "$TEMP_DIR" -name "docker-compose.yml" -type f | head -1 | xargs dirname)
    if [[ -n "$DEPLOY_DIR" ]]; then
      echo "发现部署目录: $DEPLOY_DIR"
      mv "$DEPLOY_DIR"/* "$EXTRACT_DIR"/
    else
      echo "未找到部署文件，移动所有内容"
      mv "$TEMP_DIR"/* "$EXTRACT_DIR"/
    fi
  fi
  
  # 清理临时目录
  rm -rf "$TEMP_DIR"
else
  ARCHIVE_PATH="${ARCHIVE_DIR}/seek-self-${TAG}.tar.gz"
  echo "下载到: ${ARCHIVE_PATH}"
  curl -fL --retry 3 -o "$ARCHIVE_PATH" "$DOWNLOAD_URL"
  
  # 清空解压目标目录（保持目录存在）
  rm -rf "${EXTRACT_DIR:?}"/*
  
  echo "解压 TAR.GZ 到: ${EXTRACT_DIR}（去掉顶层目录）"
  tar -xzf "$ARCHIVE_PATH" -C "$EXTRACT_DIR" --strip-components=1
fi

# 展示解压结果（直接展示 EXTRACT_DIR）
echo "顶层内容:"
ls -la "$EXTRACT_DIR" || true

echo
echo "完整目录结构:"
if command -v tree >/dev/null 2>&1; then
  tree -a "$EXTRACT_DIR" || true
else
  (cd "$EXTRACT_DIR" && { ls -laR . 2>/dev/null || find . -print; }) || true
fi