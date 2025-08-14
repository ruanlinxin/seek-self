FROM node:18-alpine

# 安装必要的工具
RUN apk add --no-cache curl

# 设置工作目录
WORKDIR /app

# 安装 PeerJS 服务器
RUN npm install -g peer

# 复制配置文件
COPY config.js /app/config.js

# 创建启动脚本
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'peerjs --port 9000 --host 0.0.0.0 --key seek-self-peerjs-key --allow_discovery --proxied --debug' >> /app/start.sh && \
    chmod +x /app/start.sh

# 暴露端口
EXPOSE 9000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9000/ || exit 1

# 启动命令
CMD ["/app/start.sh"]
