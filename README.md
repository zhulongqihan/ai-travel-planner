# AI 旅行规划师 (AI Travel Planner)

一个基于 AI 的智能旅行规划 Web 应用，帮助用户轻松规划旅行行程和管理预算。

## ✨ 功能特性

### 1. 智能行程规划
- 🎤 **语音输入**：支持语音输入旅行需求
- 📝 **文字输入**：手动填写详细的旅行信息
- 🤖 **AI 生成**：使用阿里云百炼大语言模型自动生成个性化旅行路线
- 📅 **详细行程**：包括交通、住宿、景点、餐厅等完整信息

### 2. 费用预算与管理
- 💰 **预算分析**：AI 自动分析和估算各项费用
- 📊 **费用记录**：记录实际旅行开销
- 📈 **预算对比**：对比预算与实际花费
- 💡 **智能建议**：AI 提供预算优化建议

### 3. 用户管理与数据存储
- 🔐 **注册登录**：安全的用户认证系统
- ☁️ **云端同步**：旅行计划自动云端存储
- 📱 **多设备访问**：随时随地查看和修改计划

### 4. 地图导航
- 🗺️ **高德地图**：集成高德地图 API
- 📍 **景点标记**：在地图上标记旅行景点
- 🚗 **路线规划**：查看各景点间的导航路线

## 🛠️ 技术栈

### 后端
- **框架**：FastAPI (Python)
- **数据库**：Supabase
- **认证**：Supabase Authentication
- **AI**：阿里云百炼 (DashScope)
- **语音识别**：阿里云语音服务 API

### 前端
- **基础**：HTML5, CSS3, JavaScript
- **地图**：高德地图 API 2.0
- **语音**：Web Audio API + 阿里云语音识别

## 📦 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-travel-planner
```

### 2. 后端设置

#### 安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

#### 配置环境变量

复制 `.env.template` 为 `.env`，并填写以下 API 密钥：

```bash
cp ../.env.template ../.env
```

编辑 `.env` 文件：

```env
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# 阿里云百炼配置
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx

# 阿里云语音识别配置（可选）
ALIYUN_SPEECH_APP_KEY=your-app-key
ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret

# 高德地图配置
AMAP_API_KEY=your-amap-key
AMAP_WEB_KEY=your-amap-web-key
```

### 3. 配置 Supabase 数据库

在 Supabase 控制台创建以下表：

#### travel_plans 表

```sql
CREATE TABLE travel_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    destination TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    days INTEGER NOT NULL,
    budget NUMERIC(10, 2),
    travelers INTEGER,
    preferences TEXT,
    itinerary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的数据
CREATE POLICY "Users can view own travel plans" ON travel_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own travel plans" ON travel_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel plans" ON travel_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel plans" ON travel_plans
    FOR DELETE USING (auth.uid() = user_id);
```

#### expenses 表

```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);
```

### 4. 配置高德地图

1. 在 `frontend/index.html` 中替换高德地图 API Key：

```html
<script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_WEB_KEY"></script>
```

2. 根据需要配置安全密钥（securityJsCode）。

### 5. 运行应用

#### 启动后端服务

```bash
cd backend
python main.py
```

后端服务将运行在 `http://localhost:8000`

#### 访问前端

在浏览器中打开：
```
http://localhost:8000/static/index.html
```

或使用任何静态文件服务器：

```bash
cd frontend
python -m http.server 8080
```

然后访问 `http://localhost:8080`

## 📖 使用指南

### 1. 注册/登录
- 点击右上角"注册"按钮创建账户
- 或使用已有账户登录

### 2. 创建旅行计划

#### 方式一：语音输入
1. 点击"🎤 点击开始语音输入"按钮
2. 说出你的旅行需求，例如：
   > "我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
3. AI 会自动识别并填充表单

#### 方式二：手动输入
1. 填写目的地、天数、预算等信息
2. 点击"生成旅行计划"

### 3. 查看和管理计划
- 在"我的计划"页面查看所有保存的旅行计划
- 点击计划卡片查看详细信息
- 可以删除不需要的计划

### 4. 预算管理
- 选择一个旅行计划
- 添加实际花费记录
- 查看预算分析和 AI 建议

### 5. 地图查看
- 在行程详情中点击景点
- 在地图上查看位置和路线

## 🔑 获取 API 密钥

### Supabase
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 在 Settings > API 中获取 URL 和 anon key

### 阿里云百炼
1. 访问 [阿里云百炼平台](https://dashscope.aliyun.com/)
2. 开通服务并创建 API Key
3. 选择合适的模型（推荐 qwen-plus 或 qwen-max）

### 阿里云语音识别
1. 访问 [阿里云](https://www.aliyun.com/)
2. 开通语音服务
3. 创建应用获取 AppKey 和 AccessKey

### 高德地图
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册开发者账号
3. 创建应用获取 Web 服务 Key 和 JavaScript API Key

## ⚠️ 注意事项

### 安全性
- ❌ **切勿将 API 密钥提交到 Git**
- ✅ 始终使用 `.env` 文件存储敏感信息
- ✅ `.env` 已添加到 `.gitignore`
- ✅ 提供了 `.env.template` 作为配置模板

### API 使用限制
- 注意各服务的免费额度和调用限制
- 阿里云百炼：按 token 计费
- 阿里云语音：有免费额度
- 高德地图：有日调用量限制

### 浏览器兼容性
- 语音功能需要 HTTPS 或 localhost
- 推荐使用 Chrome、Edge 等现代浏览器

## 📁 项目结构

```
ai-travel-planner/
├── backend/                    # 后端代码
│   ├── main.py                # FastAPI 主程序
│   ├── database.py            # 数据库操作
│   ├── routers/               # API 路由
│   │   ├── auth.py           # 认证路由
│   │   ├── travel.py         # 旅行规划路由
│   │   ├── voice.py          # 语音识别路由
│   │   └── budget.py         # 预算管理路由
│   └── requirements.txt       # Python 依赖
├── frontend/                  # 前端代码
│   ├── index.html            # 主页面
│   ├── css/
│   │   └── style.css         # 样式文件
│   └── js/
│       ├── app.js            # 主应用逻辑
│       ├── auth.js           # 认证逻辑
│       ├── voice.js          # 语音识别
│       └── map.js            # 地图功能
├── .env.template             # 环境变量模板
├── .gitignore               # Git 忽略文件
└── README.md                # 项目文档
```

## 🚀 部署

### 后端部署（推荐平台）
- **Railway**：自动部署 FastAPI 应用
- **Heroku**：免费层适合小型项目
- **腾讯云/阿里云**：使用云函数或容器服务

### 前端部署
- **Vercel**：快速部署静态文件
- **Netlify**：支持自动构建
- **GitHub Pages**：免费静态网站托管

### 环境变量配置
部署时需要在平台上配置所有环境变量（与 `.env` 文件相同）。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请通过 Issue 反馈。

---

**祝你旅行愉快！🌍✈️**



