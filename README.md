# Seek Self 项目

这是一个使用 Lerna 管理的 monorepo 项目，包含多个包和应用程序。

## 项目结构

```
seek-self/
├── packages/           # 共享包
│   ├── types/         # 类型定义包
│   ├── utils/         # 工具函数包
│   └── api/           # API 客户端包
├── web/               # Web 应用
├── mobile/            # 移动应用
├── server/            # 服务器应用
├── desktop-server/    # 桌面服务器应用
└── lerna.json         # Lerna 配置
```

## 包说明

### @seek-self/types
- 包含项目中使用的所有 TypeScript 类型定义
- 提供基础的用户、API 响应、分页等类型

### @seek-self/utils
- 提供通用的工具函数
- 依赖 @seek-self/types 包

### @seek-self/api
- 提供 API 客户端实现
- 依赖 @seek-self/types 和 @seek-self/utils 包

## 开发命令

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev:web          # 启动 Web 应用
yarn dev:mobile       # 启动移动应用
yarn dev:desktop      # 启动桌面服务器
yarn dev:server       # 启动服务器

# 构建所有包
yarn build:all

# 类型检查
yarn type-check

# 清理构建文件
yarn clean

# 重新安装依赖
yarn bootstrap
```

## 包开发

每个包都有自己的 TypeScript 配置和构建脚本：

```bash
# 进入包目录
cd packages/types

# 开发模式（监听文件变化）
yarn dev

# 构建
yarn build

# 类型检查
yarn type-check
```

## 注意事项

1. 所有包都使用 TypeScript 开发
2. 包之间的依赖通过 workspace 协议管理
3. 每个包都有独立的 tsconfig.json 配置
4. 构建输出到各包的 dist 目录

## 下一步

- 为 web、mobile、server、desktop-server 配置具体的开发环境
- 添加测试配置
- 配置 CI/CD 流程
- 添加代码质量工具（ESLint、Prettier 等）
