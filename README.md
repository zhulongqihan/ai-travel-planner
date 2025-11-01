# 🌍 AI 旅行规划师 (AI Travel Planner)

一个功能强大、界面现代的 AI 智能旅行规划 Web 应用，帮助用户轻松规划旅行行程、管理预算，并提供全球地点支持。

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)

## ✨ 核心功能

### 🤖 智能行程规划
- **🎤 语音输入**：支持自然语言语音输入，AI 自动识别旅行需求
- **📝 表单输入**：手动填写详细的旅行信息（目的地、天数、预算等）
- **🧠 AI 生成**：使用阿里云百炼大语言模型自动生成个性化旅行路线
- **📅 详细行程**：包括每日活动、景点、餐厅、住宿等完整信息
- **💰 费用估算**：智能估算各项费用，帮助控制预算
- **🎨 整体计划概览**：美观的统计卡片展示行程核心信息

### 🗺️ 智能地图导航
- **📍 全球地点支持**：支持国内外旅行地点
  - 国内：高德地图 API（主要）
  -国际：OpenStreetMap Nominatim API（自动切换）
- **🚗 路线规划**：自动规划景点间的驾车路线
- **🏷️ 景点标记**：在地图上标记所有活动、餐厅、住宿
- **📋 路线详情**：单独展示区域显示完整路线信息
- **🔍 智能搜索**：四层地理编码策略，模糊搜索增强

### 💼 实用工具栏
- **📄 导出 PDF**：将行程导出为精美的 PDF 文档
- **📋 快速复制**：一键复制行程文本到剪贴板
- **🖨️ 打印行程**：直接打印行程单
- **🔗 分享功能**：生成分享链接，支持邮件分享
- **⬆️ 返回顶部**：快速滚动到页面顶部
- **❓ 帮助中心**：详细的使用说明和功能介绍

### 💰 预算管理
- **📊 预算追踪**：记录实际旅行开销
- **📈 统计分析**：分类统计各项费用（交通、住宿、餐饮等）
- **💡 AI 建议**：智能预算优化建议
- **🎤 语音记账**：支持语音添加费用记录
- **📉 实时对比**：预算与实际花费的实时对比

### 🎨 现代化 UI/UX
- **🌓 深色模式**：支持浅色/深色主题切换
- **✨ 玻璃态设计**：现代化的毛玻璃效果
- **🎬 流畅动画**：丰富的交互动画和过渡效果
- **📱 响应式布局**：完美适配桌面端和移动端
- **🎨 渐变色系**：精心设计的配色方案
- **💎 卡片式布局**：清晰的信息层次结构

### 👤 用户系统
- **🔐 安全认证**：基于 Supabase 的用户认证系统
- **☁️ 云端存储**：旅行计划自动云端保存
- **📱 多设备同步**：随时随地访问和管理计划
- **🔒 数据隔离**：行级安全策略保护用户隐私

## 🛠️ 技术栈

### 后端
- **框架**：FastAPI (Python 3.8+)
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Authentication
- **AI 模型**：阿里云百炼 (DashScope) - Qwen 系列
- **语音识别**：阿里云智能语音服务
- **HTTP 客户端**：HTTPX (异步)

### 前端
- **基础**：HTML5, CSS3, ES6+ JavaScript
- **地图服务**：
  - 高德地图 API 2.0（国内）
  - OpenStreetMap Nominatim（国际）
- **语音**：Web Speech API + 阿里云语音识别
- **动画**：CSS Keyframes + Transitions

### 地理编码策略
四层智能地理编码系统：
1. 高德地图 JS API（快速，国内优先）
2. 内置坐标库（精确匹配知名城市）
3. 高德地图后端 API（更全面的POI搜索）
4. OpenStreetMap API（国际地点支持）

## 📦 快速开始

### 前置要求
- Python 3.8 或更高版本
- Git

### 1. 克隆项目

```bash
git clone https://github.com/zhulongqihan/ai-travel-planner.git
cd ai-travel-planner
```

### 2. 创建虚拟环境

```bash
python -m venv venv
```

### 3. 激活虚拟环境

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. 安装依赖

```bash
pip install -r requirements.txt
```

### 5. 配置环境变量

复制 `.env.template` 为 `.env`：

```bash
# Windows
copy .env.template .env

# macOS/Linux
cp .env.template .env
```

编辑 `.env` 文件，填写以下配置：

```env
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# 阿里云百炼配置
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx

# 阿里云语音识别配置（可选）
ALIYUN_SPEECH_APP_KEY=your-app-key
ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret

# 高德地图配置
AMAP_API_KEY=your-amap-backend-key
AMAP_WEB_KEY=your-amap-web-key
```

### 6. 配置 Supabase 数据库

在 Supabase 控制台执行以下 SQL：

#### 创建 travel_plans 表

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

-- 创建安全策略
CREATE POLICY "Users can view own travel plans" ON travel_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own travel plans" ON travel_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel plans" ON travel_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel plans" ON travel_plans
    FOR DELETE USING (auth.uid() = user_id);
```

#### 创建 expenses 表

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

-- 创建安全策略
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);
```

### 7. 配置高德地图

在 `frontend/index.html` 中更新高德地图 API Key（第17行）：

```html
<script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_WEB_KEY"></script>
```

### 8. 运行应用

```bash
python run.py
```

服务将启动在 `http://localhost:8000`

在浏览器中访问显示的链接即可开始使用！🎉

## 📖 使用指南

### 创建旅行计划

#### 方式一：语音输入（推荐）

1. 点击 **"🎤 点击开始语音输入"** 按钮
2. 说出你的旅行需求，例如：
   ```
   "我想2025年12月25号去南京，5天，预算1万元，2人，喜欢美食和动漫"
   ```
3. AI 会自动识别并填充表单
4. 点击 **"生成旅行计划"** 按钮

#### 方式二：手动输入

1. 填写表单：
   - **目的地**：例如"日本东京"（支持国际地点）
   - **旅行天数**：例如"5"
   - **预算**：例如"10000"
   - **同行人数**：例如"2"
   - **出发日期**：选择日期
   - **旅行偏好**：例如"喜欢美食、动漫文化、需要舒适的住宿"
2. 点击 **"生成旅行计划"**

### 查看行程

- **整体概览**：顶部卡片显示行程统计信息
- **详细行程**：逐日展示活动、餐厅、住宿
- **地图导航**：右侧地图显示所有地点和路线
- **路线详情**：底部单独展示每条路线的详细信息

### 使用工具栏

侧边浮动工具栏提供以下功能：

- **📄 导出**：将行程导出为 PDF 文件
- **📋 复制**：快速复制行程文本
- **🖨️ 打印**：打印行程单
- **🔗 分享**：生成分享链接
- **⬆️ 顶部**：快速返回页面顶部
- **❓ 帮助**：查看详细使用说明

### 管理预算

1. 点击导航栏的 **"预算管理"**
2. 选择一个旅行计划
3. 添加费用记录（支持语音输入）
4. 查看分类统计和 AI 分析

### 切换主题

点击右下角的 **🌙/☀️** 按钮切换深色/浅色模式

## 🔑 获取 API 密钥

### Supabase

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 在 **Settings → API** 中获取：
   - `Project URL`（SUPABASE_URL）
   - `anon public` key（SUPABASE_KEY）

### 阿里云百炼

1. 访问 [阿里云百炼平台](https://dashscope.aliyun.com/)
2. 登录并开通服务
3. 创建 API Key
4. 推荐模型：`qwen-plus` 或 `qwen-max`

### 阿里云语音识别（可选）

1. 访问 [阿里云](https://www.aliyun.com/)
2. 开通 **智能语音交互** 服务
3. 创建应用获取：
   - AppKey
   - AccessKey ID
   - AccessKey Secret

### 高德地图

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册开发者账号
3. 创建应用，申请两个 Key：
   - **Web 服务 Key**（AMAP_API_KEY）：用于后端路线规划
   - **JavaScript API Key**（AMAP_WEB_KEY）：用于前端地图显示

**重要提示**：确保为 **Web 服务 Key** 开通 **路线规划** 服务！

## 📁 项目结构

```
ai-travel-planner/
├── backend/                     # 后端代码
│   ├── main.py                 # FastAPI 主程序
│   ├── database.py             # 数据库操作
│   ├── routers/                # API 路由模块
│   │   ├── auth.py            # 用户认证
│   │   ├── travel.py          # 旅行规划（AI 生成）
│   │   ├── voice.py           # 语音识别
│   │   ├── budget.py          # 预算管理
│   │   ├── geocode.py         # 地理编码和路线规划
│   │   └── parse.py           # 语音内容解析
│   └── requirements.txt        # Python 依赖
├── frontend/                    # 前端代码
│   ├── index.html              # 主页面
│   ├── css/
│   │   └── style.css          # 样式文件（2700+ 行）
│   └── js/
│       ├── app.js             # 主应用逻辑
│       ├── auth.js            # 认证逻辑
│       ├── voice.js           # 语音识别
│       ├── map.js             # 地图功能（四层地理编码）
│       ├── budget.js          # 预算管理
│       └── toolbar.js         # 工具栏功能（新增）
├── run.py                      # 应用启动入口
├── .env.template               # 环境变量模板
├── .gitignore                  # Git 忽略文件
├── requirements.txt            # 项目依赖
└── README.md                   # 项目文档（本文件）
```

## 🎨 UI/UX 特色

### 设计系统
- **配色方案**：精心设计的渐变色和主题色
- **玻璃态效果**：毛玻璃背景和透明度
- **阴影系统**：多层次阴影增强立体感
- **圆角系统**：统一的圆角大小规范
- **动画系统**：流畅的过渡和关键帧动画

### 交互优化
- **加载动画**：AI 生成时的进度条和状态提示
- **悬停效果**：按钮和卡片的悬停反馈
- **点击反馈**：按钮点击时的缩放动画
- **滚动优化**：平滑滚动和返回顶部
- **响应式设计**：自适应不同屏幕尺寸

## ⚠️ 注意事项

### 安全性
- ❌ **切勿将 `.env` 文件提交到 Git**
- ✅ 始终使用环境变量存储敏感信息
- ✅ `.env` 已添加到 `.gitignore`
- ✅ 使用 HTTPS 部署生产环境

### API 使用限制
- **阿里云百炼**：按 token 计费，注意控制使用量
- **阿里云语音**：有免费额度，超出后计费
- **高德地图**：
  - Web 服务 API：日调用量限制
  - JavaScript API：并发请求限制
- **OpenStreetMap**：请遵守使用政策，避免过度请求

### 浏览器兼容性
- **语音功能**：需要 HTTPS 或 localhost 环境
- **推荐浏览器**：
  - ✅ Chrome 90+
  - ✅ Edge 90+
  - ✅ Safari 14+
  - ✅ Firefox 88+

### 地图功能限制
- **国际路线规划**：由于高德地图限制，国际地点暂不支持路线显示（仅显示标记点）
- **地理编码**：偏远地区可能无法精确定位

## 🚀 部署建议

### 后端部署

#### Railway（推荐）
1. 连接 GitHub 仓库
2. 设置环境变量
3. 自动部署

#### Render
1. 创建 Web Service
2. 选择 Python 环境
3. 设置启动命令：`python run.py`

#### 腾讯云/阿里云
- 使用云函数（Serverless）
- 或容器服务（Docker）

### 前端部署

#### Vercel（推荐）
- 快速部署静态文件
- 自动 HTTPS
- 全球 CDN 加速

#### Netlify
- 支持自动构建
- 表单处理
- 环境变量管理

### 环境变量配置
部署时需要在平台上配置所有环境变量（与 `.env` 文件内容相同）

## 🆕 版本更新日志

### v2.0（当前版本）
- ✨ 新增侧边浮动工具栏（导出、复制、打印、分享等）
- ✨ 新增整体计划概览卡片
- ✨ 新增深色模式支持
- ✨ 新增国际地点支持（OpenStreetMap）
- 🔧 优化地理编码策略（四层智能切换）
- 🔧 优化路线显示（单独展示区域）
- 🎨 UI 全面现代化升级
- 🐛 修复年份识别问题（2024→2025）
- 🐛 修复地址搜索精度问题
- 📱 改进响应式布局

### v1.0（初始版本）
- 基础旅行规划功能
- AI 行程生成
- 地图导航
- 预算管理
- 用户认证

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发建议
1. Fork 本仓库
2. 创建新分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 反馈与支持

- 🐛 **Bug 反馈**：通过 [GitHub Issues](https://github.com/zhulongqihan/ai-travel-planner/issues) 提交
- 💡 **功能建议**：欢迎在 Issues 中讨论
- 📧 **联系方式**：通过 GitHub 私信联系

## 🙏 致谢

感谢以下开源项目和服务：
- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的 Python Web 框架
- [Supabase](https://supabase.com/) - 开源的 Firebase 替代方案
- [阿里云百炼](https://dashscope.aliyun.com/) - 强大的 AI 模型服务
- [高德地图](https://lbs.amap.com/) - 优秀的地图服务
- [OpenStreetMap](https://www.openstreetmap.org/) - 开放的地图数据

---

**✨ 祝你旅行愉快！🌍✈️**

如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！
