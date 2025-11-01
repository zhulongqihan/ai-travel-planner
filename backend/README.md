# 后端服务 (Backend)

AI 旅行规划师的后端 API 服务。

## 📋 核心文件

- **`main.py`** - FastAPI 主程序，定义所有路由和中间件
- **`database.py`** - Supabase 数据库连接和操作封装
- **`run.py`** - 应用启动入口（位于根目录）

## 🛣️ API 路由模块 (routers/)

### auth.py - 用户认证
- 用户注册和登录
- JWT Token 生成和验证
- 基于 Supabase Authentication

### travel.py - AI 旅行规划
- 🤖 调用阿里云百炼大模型生成行程
- 📅 智能规划每日活动、餐饮、住宿
- 💰 预算估算和费用分析
- 🔄 支持流式响应（SSE）

### geocode.py - 地理编码服务
- 🗺️ 高德地图 POI 搜索
- 🚗 驾车路线规划
- 📍 地址转坐标（地理编码）

### voice.py - 语音识别
- 🎤 阿里云语音识别集成
- 🔊 实时语音转文字
- 📝 语音数据处理

### parse.py - 语音内容解析
- 📖 使用 AI 解析语音文本
- 🧠 提取旅行需求信息
- 🔄 结构化数据输出

### budget.py - 预算管理
- 💰 费用记录管理
- 📊 分类统计和分析
- 💡 AI 预算优化建议

## 🔧 技术栈

- **框架**: FastAPI
- **数据库**: Supabase (PostgreSQL)
- **AI 模型**: 阿里云百炼 (DashScope)
- **HTTP 客户端**: HTTPX (异步)
- **数据验证**: Pydantic

## 📦 依赖管理

所有 Python 依赖定义在根目录的 `requirements.txt` 中。

## 🚀 启动服务

```bash
# 激活虚拟环境
venv\Scripts\activate

# 运行服务
python run.py
```

服务默认运行在 `http://localhost:8000`

## 📝 API 文档

启动服务后访问：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

