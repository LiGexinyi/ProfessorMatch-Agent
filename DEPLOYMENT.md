# ProfessorMatch Agent 部署指南

## 概述

ProfessorMatch Agent 是一个为留学申请者设计的 AI 套磁助手平台，帮助用户快速找到匹配的海外导师并生成专业套磁邮件。本文档提供了完整的部署和使用说明。

## 系统要求

- Node.js 22.13.0 或更高版本
- MySQL 5.7 或更高版本
- npm 或 pnpm 包管理器

## 本地开发部署

### 1. 克隆项目

```bash
cd /home/ubuntu/ProfessorMatchAgent
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

项目使用以下环境变量（由 Manus 平台自动注入）：

- `DATABASE_URL` - MySQL 数据库连接字符串
- `JWT_SECRET` - 会话 Cookie 签名密钥
- `VITE_APP_ID` - Manus OAuth 应用 ID
- `OAUTH_SERVER_URL` - Manus OAuth 服务器 URL
- `VITE_OAUTH_PORTAL_URL` - Manus 登录门户 URL
- `BUILT_IN_FORGE_API_URL` - Manus 内置 API 基础 URL
- `BUILT_IN_FORGE_API_KEY` - Manus 内置 API 密钥

### 4. 初始化数据库

```bash
pnpm drizzle-kit push
```

### 5. 启动开发服务器

```bash
pnpm dev
```

开发服务器将在 `http://localhost:3000` 启动。

## 生产部署

### 构建项目

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 项目结构

```
ProfessorMatchAgent/
├── client/                    # 前端 React 应用
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 可复用组件
│   │   ├── lib/              # 工具函数
│   │   └── App.tsx           # 主应用组件
│   └── index.html
├── server/                    # 后端 Express 应用
│   ├── routers/              # tRPC 路由定义
│   ├── db.ts                 # 数据库查询函数
│   ├── routers.ts            # 路由聚合
│   └── _core/                # 核心基础设施
├── drizzle/                   # 数据库模式和迁移
├── shared/                    # 共享类型和常量
└── package.json
```

## 核心功能

### 1. 个人背景管理

用户可以填写和管理个人档案，包括研究方向、目标学校、学历、GPA 和语言成绩等信息。这些信息用于后续的教授匹配和邮件生成。

**相关页面：** `/profile`

### 2. 教授信息浏览

平台提供了优雅的教授信息卡片展示，用户可以浏览、搜索和筛选教授。每张卡片展示教授的基本信息、研究方向和近期成果摘要。

**相关页面：** `/professors`

### 3. AI 教授抓取

用户可以通过 AI 自动抓取功能，输入学校、部门和研究方向，系统将自动搜索并添加相关教授信息到数据库。

**相关页面：** `/scraper`

### 4. 套磁邮件生成

基于用户背景和教授信息，AI 自动生成专业、个性化的英文套磁邮件草稿。用户可以在线编辑和优化邮件内容。

**相关页面：** `/email`

### 5. 收藏夹管理

用户可以收藏感兴趣的教授，并在收藏夹中快速访问和管理已收藏的教授列表。

**相关页面：** `/favorites`

### 6. 联系进度追踪

平台记录用户与每位教授的联系状态（待联系、已联系、已回复），帮助用户管理申请进度。

**相关页面：** `/tracker`

### 7. AI 对话助手

用户可以与 AI 对话，获取个性化的申请策略、选校建议和其他申请相关的指导。

**相关页面：** `/assistant`

## API 端点

### 用户档案 API

- `POST /api/trpc/profile.create` - 创建用户档案
- `GET /api/trpc/profile.get` - 获取用户档案
- `PUT /api/trpc/profile.update` - 更新用户档案

### 教授信息 API

- `GET /api/trpc/professors.list` - 获取教授列表
- `GET /api/trpc/professors.getById` - 获取单个教授信息
- `POST /api/trpc/professors.create` - 创建教授信息
- `POST /api/trpc/professors.favorite` - 收藏/取消收藏教授
- `POST /api/trpc/professors.updateContactStatus` - 更新联系状态

### AI 抓取 API

- `POST /api/trpc/scraper.fetchProfessors` - 抓取教授信息
- `POST /api/trpc/scraper.generateMatchScore` - 生成匹配评分

### 邮件 API

- `POST /api/trpc/email.generate` - 生成套磁邮件
- `POST /api/trpc/email.optimize` - 优化邮件内容

## 数据库架构

### 用户表 (users)

存储用户基本信息和认证数据。

### 用户档案表 (userProfiles)

存储用户的学术背景和申请信息。

### 教授表 (professors)

存储教授的基本信息、研究方向和联系方式。

### 邮件草稿表 (emailDrafts)

存储生成的套磁邮件草稿。

### 用户-教授互动表 (userProfessorInteractions)

记录用户与教授的互动，包括收藏状态和联系进度。

## 常见问题

### Q: 如何添加新的教授信息？

A: 您可以通过以下两种方式添加教授信息：

1. 使用 AI 抓取功能（`/scraper`）自动搜索并添加
2. 通过 API 直接创建教授信息

### Q: 如何生成套磁邮件？

A: 在教授浏览页面（`/professors`）点击"生成邮件"按钮，系统将基于您的档案和教授信息自动生成邮件。您可以在邮件编辑页面进行修改和优化。

### Q: 如何追踪申请进度？

A: 访问进度追踪页面（`/tracker`）可以查看所有教授的联系状态。您可以更新每位教授的状态为"待联系"、"已联系"或"已回复"。

### Q: 如何获取 AI 建议？

A: 访问 AI 助手页面（`/assistant`）与 AI 对话，获取个性化的申请策略和选校建议。

## 技术栈

- **前端框架：** React 19 + Tailwind CSS 4
- **后端框架：** Express 4 + tRPC 11
- **数据库：** MySQL + Drizzle ORM
- **认证：** Manus OAuth
- **AI 集成：** Manus 内置 LLM API

## 支持

如有任何问题或建议，请联系我们的支持团队。

## 许可证

本项目采用 MIT 许可证。
