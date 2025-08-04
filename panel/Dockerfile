# 生产阶段
FROM nginx:alpine

# 复制构建结果到 Nginx
COPY ./dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 3000

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
