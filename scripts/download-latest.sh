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

# 提取 tag 与 tar.gz 资源链接（优先使用 jq）
if command -v jq >/dev/null 2>&1; then
  TAG=$(echo "$RESPONSE" | jq -r '.tag_name // empty')
  TAR_URL=$(echo "$RESPONSE" | jq -r '.assets[] | select(.name | endswith(".tar.gz")) | .browser_download_url' | head -n1)
else
  TAG=$(echo "$RESPONSE" | grep -oE '"tag_name"\s*:\s*"[^"]+' | sed 's/.*:"//')
  TAR_URL=$(echo "$RESPONSE" | grep -oE 'https://[^"]+\.tar\.gz' | head -n1)
fi

if [[ -z "${TAG:-}" || -z "${TAR_URL:-}" ]]; then
  echo "未找到最新版本的 tar.gz 资产，或 API 响应异常。" >&2
  exit 1
fi

echo "最新版本: ${TAG}"
echo "下载地址: ${TAR_URL}"

ARCHIVE_PATH="${ARCHIVE_DIR}/seek-self-panel-${TAG}.tar.gz"
echo "下载到: ${ARCHIVE_PATH}"
curl -fL --retry 3 -o "$ARCHIVE_PATH" "$TAR_URL"

# 清空解压目标目录（保持目录存在）
rm -rf "${EXTRACT_DIR:?}"/*

# 直接把归档的第一层目录去掉解压到 EXTRACT_DIR
#（release-* 为顶层目录，--strip-components=1 可去掉该层）
echo "解压到: ${EXTRACT_DIR}（去掉顶层目录）"
tar -xzf "$ARCHIVE_PATH" -C "$EXTRACT_DIR" --strip-components=1

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