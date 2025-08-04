FROM node:20-alpine
# 设置工作目录
WORKDIR /app
# 复制源代码
COPY . .

# 安装依赖
RUN yarn install

# 暴露端口
EXPOSE 20000

# 启动应用
CMD ["npm","run","start"]
