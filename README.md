# ProfessorMatch Agent v2.0 - Python Edition

AI 套磁助手平台 - 帮助留学申请者快速找到匹配的海外导师并生成专业套磁邮件。

> v2.0 完全使用 Python 重写，使用 FastAPI + SQLAlchemy + Jinja2，更简洁、更易部署。

## 核心功能

### 1. 个人背景管理
- 填写研究方向、目标学校、学历、GPA、语言成绩等信息
- 系统自动保存用户档案，作为后续匹配的依据

### 2. 教授信息浏览
- 优雅的卡片界面展示教授信息
- 支持按研究方向、学校搜索和筛选
- 一键收藏感兴趣的教授

### 3. 从 URL 自动提取教授信息
- 输入教授主页 URL（个人主页、Google Scholar、实验室网站等）
- AI 自动提取研究方向、近期论文、联系信息等
- 支持直接添加到教授数据库

### 4. AI 自动抓取教授信息
- 输入学校、部门、研究方向
- 系统自动搜索并添加相关教授信息

### 5. 一键生成套磁邮件
- 基于用户背景和教授研究内容
- AI 自动生成专业英文邮件草稿

### 6. 邮件编辑与优化
- 在线编辑邮件内容
- 获取 AI 优化建议（语气、结构、个性化程度等）

### 7. 进度追踪
- 记录与每位教授的联系状态（待联系、已联系、已回复）

### 8. AI 对话助手
- 获取个性化的申请策略建议

## 技术栈 (v2.0)

### 后端
- **框架**: FastAPI
- **数据库 ORM**: SQLAlchemy 2.0 (async)
- **数据库**: SQLite (可切换为 MySQL/PostgreSQL)
- **AI 集成**: OpenAI-compatible API (httpx)
- **模板引擎**: Jinja2

### 前端
- **样式**: 自定义 CSS (无框架依赖)
- **交互**: 原生 JavaScript + HTMX
- **字体**: Inter (Google Fonts)

## 项目结构

```
ProfessorMatch-Agent/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py             # 配置管理
│   ├── database.py           # 数据库连接
│   ├── models.py             # SQLAlchemy 模型
│   ├── schemas.py            # Pydantic 数据模式
│   ├── routers/              # API 路由
│   │   ├── profile.py        # 用户档案
│   │   ├── professors.py     # 教授管理
│   │   ├── email.py          # 邮件生成
│   │   ├── scraper.py        # AI 抓取
│   │   └── url_extractor.py  # URL 提取
│   ├── services/             # 业务服务
│   │   └── llm.py            # LLM 调用服务
│   ├── templates/            # Jinja2 HTML 模板
│   │   ├── base.html
│   │   ├── home.html
│   │   ├── profile.html
│   │   ├── professors.html
│   │   ├── email.html
│   │   ├── scraper.html
│   │   ├── url_extractor.html
│   │   ├── favorites.html
│   │   ├── tracker.html
│   │   └── assistant.html
│   └── static/               # 静态资源
│       ├── css/style.css
│       └── js/app.js
├── requirements.txt
├── .env.example
├── run.py                    # 启动脚本
└── README.md
```

## 快速开始

### 环境要求
- Python 3.10+
- pip

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/LiGexinyi/ProfessorMatch-Agent.git
cd ProfessorMatch-Agent
```

2. **创建虚拟环境**
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 LLM API 密钥
```

5. **启动应用**
```bash
python run.py
```

访问 `http://localhost:8000` 查看应用。

## API 端点

### 用户档案
- `GET /api/profile` - 获取用户档案
- `PUT /api/profile` - 更新用户档案

### 教授管理
- `GET /api/professors` - 获取教授列表
- `GET /api/professors/{id}` - 获取教授详情
- `POST /api/professors` - 创建教授
- `POST /api/professors/favorite` - 收藏/取消收藏
- `POST /api/professors/contact-status` - 更新联系状态
- `GET /api/professors/user/interactions` - 获取用户互动
- `GET /api/professors/user/favorites` - 获取收藏列表

### 邮件生成
- `POST /api/email/generate` - 生成套磁邮件
- `GET /api/email/{draft_id}` - 获取邮件草稿
- `POST /api/email/optimize` - 优化邮件
- `POST /api/email/update` - 更新邮件

### AI 抓取
- `POST /api/scraper/fetch` - 抓取教授信息
- `POST /api/scraper/match-score` - 生成匹配评分

### URL 提取
- `POST /api/url-extractor/extract` - 从 URL 提取信息
- `POST /api/url-extractor/extract-and-create` - 提取并创建教授

## v2.0 vs v1.0 对比

| 特性 | v1.0 (TypeScript) | v2.0 (Python) |
|------|-------------------|---------------|
| 后端框架 | Express + tRPC | FastAPI |
| 数据库 | MySQL + Drizzle | SQLAlchemy + SQLite |
| 前端 | React 19 + Tailwind | Jinja2 + CSS |
| AI 集成 | Manus API | OpenAI-compatible |
| 认证 | Manus OAuth | 简化认证 |
| 部署复杂度 | 高 (Node.js + MySQL) | 低 (Python + SQLite) |
| 启动命令 | pnpm dev | python run.py |

## 许可证

MIT License

## 联系方式

- 邮箱: gexy24@mails.tsinghua.edu.cn
- GitHub: [@LiGexinyi](https://github.com/LiGexinyi)

---

**版本**: 2.0.0  
**最后更新**: 2026 年 7 月 14 日
