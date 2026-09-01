# TCM Sleep Agent

TCM Sleep Agent 是一个面向中医失眠处方案例的智能辅助系统。项目使用 RAG 检索历史方剂与病例，通过动态 Few-shot 组织参考案例，再调用大模型生成分析结果。系统由 FastAPI 后端和 Next.js 前端组成，包含用户登录、会话管理、知识库检索、普通分析和流式分析接口。

这个仓库主要用于展示一个完整 AI 应用如何连接前端、API、向量检索、关键词检索、重排和模型生成。它是学习与研究项目，不提供医疗诊断，也不能替代医生的判断和处方。

## 项目能力

| 能力 | 说明 |
| --- | --- |
| 中医失眠案例分析 | 接收结构化案例信息并生成辅助分析结果 |
| RAG 检索 | 从失眠方剂知识库中检索相关案例 |
| 混合检索 | 结合向量检索与 BM25 关键词检索 |
| 动态 Few-shot | 根据当前输入选择相关案例作为生成参考 |
| 结果重排 | 可选用 `BAAI/bge-reranker-base` 对候选结果重排 |
| 流式进度 | `/analyze/stream` 通过 SSE 返回处理进度 |
| 用户与会话 | 提供注册、登录、用户信息和历史会话接口 |
| 知识库管理 | 支持查询知识库条目，并通过管理接口重建索引 |

## 处理流程

```text
用户填写案例
   ↓
Next.js 前端提交请求
   ↓
FastAPI 校验输入
   ↓
向量检索 + BM25 检索
   ↓
候选合并与可选重排
   ↓
动态 Few-shot 组装上下文
   ↓
DeepSeek 生成辅助分析
   ↓
前端展示结果并保存会话
```

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Next.js 16、React 19、TypeScript、Tailwind CSS、Zustand |
| 后端 | Python、FastAPI、Uvicorn、Pydantic |
| 检索 | ChromaDB、BM25、Sentence Transformers |
| 模型服务 | DeepSeek 生成、DashScope Embedding |
| 数据 | SQLAlchemy、本地 JSON、SQLite、Chroma 向量库 |
| 通信 | REST API、Server-Sent Events |

## 项目结构

```text
.
├─ frontend/                  # Next.js 前端
│  ├─ app/                   # 页面和路由
│  ├─ src/components/        # 表单、结果与 UI 组件
│  └─ public/                # 图片和视频资源
├─ tcm_sleep_agent/
│  ├─ backend/               # FastAPI 入口、路由和请求模型
│  ├─ config/                # 模型、检索和后端配置
│  ├─ src/db/                # SQLAlchemy 数据访问
│  ├─ src/services/          # 检索、重排、生成和安全检查
│  └─ data/                  # 方剂数据与运行时索引
└─ README.md
```

## 快速开始

以下命令以 Windows PowerShell 为例。项目根目录中的批处理脚本仍包含原开发电脑的绝对路径，因此建议使用下面的命令分别启动后端和前端。

### 启动后端

```powershell
Set-Location tcm_sleep_agent

python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

Copy-Item .env.example .env
```

如果目录中已有从其他电脑复制来的 `.venv`，不要直接复用。请先把旧目录移出项目，再用当前电脑的 Python 重新创建虚拟环境。

打开新生成的 `.env`，填写自己的模型服务配置。真实 API Key 已被 Git 忽略，不要提交或发给他人。

```dotenv
DEEPSEEK_API_KEY=在本机填写
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DASHSCOPE_API_KEY=在本机填写
BACKEND_BASE_URL=http://127.0.0.1:8000
BACKEND_TIMEOUT=120
```

启动 FastAPI。

```powershell
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

后端启动后可以检查健康接口和 API 文档。

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

PowerShell 健康检查命令如下。

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

预期响应中包含 `status` 为 `ok`，服务名为 `tcm-sleep-agent-backend`。

### 启动前端

打开另一个 PowerShell 窗口，在项目根目录执行以下命令。

```powershell
Set-Location frontend
npm ci
```

在 `frontend` 目录创建 `.env.local`。

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

启动开发服务器。

```powershell
npm.cmd run dev
```

浏览器访问以下地址。

```text
http://127.0.0.1:3000/app
```

Windows PowerShell 如果阻止执行 `npm.ps1`，直接使用上面的 `npm.cmd` 即可，不需要修改系统执行策略。

## 主要接口

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/health` | 后端健康检查 |
| `POST` | `/analyze` | 执行一次完整分析 |
| `POST` | `/analyze/stream` | 通过 SSE 返回分析进度 |
| `POST` | `/search` | 查询相关方剂或案例 |
| `POST` | `/auth/register` | 注册用户 |
| `POST` | `/auth/login` | 用户登录 |
| `GET` | `/auth/me` | 获取当前用户信息 |
| `GET` | `/conversations` | 查询历史会话 |
| `GET` | `/knowledge/list` | 查询知识库条目 |
| `POST` | `/admin/rebuild-index` | 重建检索索引 |

完整的请求参数和响应结构以启动后的 `/docs` 为准。

## 数据与 Git

`tcm_sleep_agent/data/insomnia_formulas.json` 和 `generated_cases.json` 是仓库中的数据文件。Chroma 向量库、SQLite 运行数据库、虚拟环境、前端依赖和真实环境变量均被 `.gitignore` 排除，可以在本机重新生成。

前端背景视频 `frontend/public/images/landing-bg.mp4` 使用 Git LFS 管理。克隆仓库前请确保本机已经安装 Git LFS。

```powershell
git lfs install
git clone https://github.com/1Arix1/tcm-sleep-agent.git
```

## 当前限制

项目依赖外部模型与 Embedding 服务，实际效果、速度和费用会受账号权限、网络与所选模型影响。首次启动时，ChromaDB 或重排模型可能需要下载依赖和模型文件。

当前 CORS 配置适合本地开发，不应直接作为公网生产配置。部署到服务器前需要限制允许的来源，并补充 HTTPS、访问控制、日志脱敏和持久化备份方案。

## 医疗免责声明

本项目只用于学习、研究和技术演示。系统输出可能不完整或存在错误，不构成诊断、治疗或用药建议。任何健康问题和处方决策都应由具备资质的医疗专业人员评估。

## License

仓库目前未提供独立的开源许可证。在添加许可证之前，请勿默认将代码用于再分发或商业发布。
