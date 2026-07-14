# ProfessorMatch Agent - AI 套磁助手平台

一个功能完整、设计优雅的 AI 套磁助手平台，帮助留学申请者快速找到匹配的海外导师并生成专业套磁邮件。

## 🎯 核心功能

### 1. **个人背景管理**
- 填写研究方向、目标学校、学历、GPA、语言成绩等信息
- 系统自动保存用户档案，作为后续匹配的依据

### 2. **教授信息浏览**
- 优雅的卡片界面展示教授信息
- 支持按研究方向、学校搜索和筛选
- 一键收藏感兴趣的教授

### 3. **从 URL 自动提取教授信息** ✨ 新功能
- 输入教授主页 URL（个人主页、Google Scholar、实验室网站等）
- AI 自动提取研究方向、近期论文、联系信息等
- 支持直接添加到教授数据库

### 4. **AI 自动抓取教授信息**
- 输入学校、部门、研究方向
- 系统自动搜索并添加相关教授信息

### 5. **一键生成套磁邮件**
- 基于用户背景和教授研究内容
- AI 自动生成专业英文邮件草稿
- 支持多种邮件风格和语调

### 6. **邮件编辑与优化**
- 在线编辑邮件内容
- 获取 AI 优化建议（语气、结构、个性化程度等）
- 支持多版本管理

### 7. **进度追踪**
- 记录与每位教授的联系状态
- 支持三种状态：待联系、已联系、已回复
- 便捷的进度管理界面

### 8. **收藏夹管理**
- 管理已收藏的教授
- 快速生成邮件
- 批量操作支持

### 9. **AI 对话助手**
- 获取个性化的申请策略建议
- 选校建议和导师匹配指导
- 邮件撰写技巧分享

## 🛠️ 技术栈

### 前端
- **框架**: React 19
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui
- **状态管理**: TanStack Query + tRPC
- **路由**: Wouter

### 后端
- **框架**: Express 4
- **RPC**: tRPC 11
- **数据库**: MySQL/TiDB
- **ORM**: Drizzle ORM
- **认证**: Manus OAuth

### AI 集成
- **LLM**: Manus 内置 API（gpt-4o-mini）
- **功能**: 邮件生成、教授信息提取、优化建议

## 📦 项目结构

```
ProfessorMatchAgent/
├── client/                    # 前端应用
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   │   ├── Home.tsx              # 首页
│   │   │   ├── ProfileSetup.tsx      # 个人背景表单
│   │   │   ├── ProfessorBrowser.tsx  # 教授浏览
│   │   │   ├── URLExtractor.tsx      # URL 提取 ✨
│   │   │   ├── EmailComposer.tsx     # 邮件编辑
│   │   │   ├── ContactTracker.tsx    # 进度追踪
│   │   │   ├── Favorites.tsx         # 收藏夹
│   │   │   ├── AIAssistant.tsx       # AI 助手
│   │   │   └── ProfessorScraper.tsx  # AI 抓取
│   │   ├── components/       # 可复用组件
│   │   └── lib/              # 工具函数
│   └── public/               # 静态资源
├── server/                    # 后端应用
│   ├── routers/              # tRPC 路由
│   │   ├── profile.ts        # 用户档案
│   │   ├── professors.ts     # 教授管理
│   │   ├── email.ts          # 邮件生成
│   │   ├── scraper.ts        # AI 抓取
│   │   └── urlExtractor.ts   # URL 提取 ✨
│   ├── db.ts                 # 数据库查询
│   └── _core/                # 核心框架
├── drizzle/                   # 数据库模式
│   ├── schema.ts             # 表定义
│   └── migrations/           # 迁移文件
└── shared/                    # 共享代码
```

## 🗄️ 数据库模式

### 用户表 (users)
- id: 主键
- openId: Manus OAuth ID
- name, email: 用户信息
- role: 用户角色（user/admin）
- createdAt, updatedAt, lastSignedIn: 时间戳

### 用户档案表 (userProfiles)
- userId: 外键
- researchArea: 研究方向
- targetUniversities: 目标学校
- education: 学历
- gpa: GPA
- languageScores: 语言成绩
- 其他背景信息

### 教授表 (professors)
- id: 主键
- name: 教授姓名
- university, department: 所在机构
- researchAreas: 研究方向
- recentPublications: 近期论文
- homepageUrl, googleScholarUrl, labWebsiteUrl: 相关链接

### 邮件草稿表 (emailDrafts)
- id: 主键
- userId, professorId: 外键
- subject, content: 邮件内容
- status: 草稿状态
- createdAt, updatedAt: 时间戳

### 用户-教授互动表 (userProfessorInteractions)
- userId, professorId: 复合主键
- isFavorited: 是否收藏
- contactStatus: 联系状态（pending/contacted/replied）
- lastInteractionDate: 最后互动时间

## 🚀 快速开始

### 环境要求
- Node.js 22+
- pnpm 10+
- MySQL 8.0+ 或 TiDB

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/LiGexinyi/Find-ur-mentor-agent.git
cd Find-ur-mentor-agent
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
创建 `.env.local` 文件：
```env
# 数据库
DATABASE_URL=mysql://user:password@localhost:3306/professor_match

# OAuth
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# JWT
JWT_SECRET=your_jwt_secret

# Manus API
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# 其他
OWNER_NAME=your_name
OWNER_OPEN_ID=your_open_id
```

4. **初始化数据库**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

5. **启动开发服务器**
```bash
pnpm dev
```

访问 `http://localhost:3000` 查看应用。

## 📖 使用指南

### 工作流程

1. **注册登录** - 使用 Manus OAuth 登录
2. **填写档案** - 在"个人背景"页面填写您的研究方向和背景信息
3. **添加教授** - 通过以下方式添加教授：
   - 手动输入教授信息
   - 使用 URL 提取功能（输入教授主页链接）
   - 使用 AI 自动抓取功能
4. **浏览和收藏** - 在"教授浏览"页面搜索和收藏感兴趣的教授
5. **生成邮件** - 选择教授，一键生成套磁邮件
6. **编辑优化** - 在邮件编辑器中修改邮件，获取 AI 优化建议
7. **追踪进度** - 在"进度追踪"页面记录与教授的沟通状态

### URL 提取功能使用

1. 点击导航栏的"URL 提取"按钮
2. 输入教授的主页链接（支持个人主页、Google Scholar、实验室网站等）
3. 点击"提取信息"，系统自动解析页面内容
4. 预览提取结果，确认无误后点击"添加到数据库"
5. 教授信息将自动添加到系统中

## 🔧 开发指南

### 添加新功能

1. **后端**：在 `server/routers/` 中创建新的路由文件
2. **前端**：在 `client/src/pages/` 中创建新的页面组件
3. **数据库**：如需新表，在 `drizzle/schema.ts` 中定义，然后运行迁移

### 运行测试

```bash
pnpm test
```

### 代码格式化

```bash
pnpm format
```

### 类型检查

```bash
pnpm check
```

## 📝 API 文档

### tRPC 路由

#### Profile (用户档案)
- `profile.create` - 创建用户档案
- `profile.get` - 获取用户档案
- `profile.update` - 更新用户档案

#### Professors (教授管理)
- `professors.list` - 获取教授列表
- `professors.getById` - 获取教授详情
- `professors.create` - 创建教授
- `professors.favorite` - 收藏/取消收藏
- `professors.updateContactStatus` - 更新联系状态
- `professors.getFavorites` - 获取收藏列表

#### Email (邮件生成)
- `email.generate` - 生成邮件草稿
- `email.optimize` - 获取邮件优化建议
- `email.save` - 保存邮件草稿
- `email.list` - 获取邮件列表

#### URLExtractor (URL 提取) ✨
- `urlExtractor.extractProfessorInfo` - 从 URL 提取教授信息
- `urlExtractor.extractAndCreateProfessor` - 从 URL 提取并创建教授

#### Scraper (AI 抓取)
- `scraper.searchProfessors` - 搜索并添加教授

## 🎨 设计风格

- **配色**: 蓝色渐变主题（#3B82F6 - #1E40AF）
- **字体**: Inter（通过 Google Fonts）
- **组件**: shadcn/ui 组件库
- **动画**: Framer Motion（精细的交互动画）
- **响应式**: 移动优先设计

## 📱 浏览器支持

- Chrome/Edge 最新版本
- Firefox 最新版本
- Safari 最新版本

## 🔒 安全性

- OAuth 2.0 认证
- JWT 会话管理
- HTTPS 加密传输
- SQL 注入防护（Drizzle ORM）
- CORS 配置

## 📄 许可证

MIT License

## 👨‍💻 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- 邮箱: gexy24@mails.tsinghua.edu.cn
- GitHub: [@LiGexinyi](https://github.com/LiGexinyi)

## 🙏 致谢

感谢 Manus 平台提供的 AI 和基础设施支持。

---

**最后更新**: 2026 年 7 月 14 日

**版本**: 1.0.0

**状态**: 生产就绪 ✅
