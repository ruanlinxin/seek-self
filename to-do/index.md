# 部署包结构

```
deployment-package/
├── docker-compose.yml          # Docker Compose 配置文件
├── README.md                   # 部署说明文档
├── web/                        # Web 前端
│   ├── build-info.txt         # 构建信息
│   ├── dist/                  # 构建产物
│   └── Dockerfile             # Docker 配置
├── server/                     # 后端服务
│   ├── build-info.txt         # 构建信息
│   ├── dist/                  # 构建产物
│   ├── package.json           # 依赖配置
│   └── Dockerfile             # Docker 配置
├── nginx/                      # Nginx 配置
│   ├── nginx.conf
│   └── conf.d/
└── mysql/                      # MySQL 初始化脚本
    └── init/
```

## 快速部署

1. 下载部署包并解压
2. `cd deployment-package`
3. `docker-compose up -d`
4. 访问 http://localhost:10000