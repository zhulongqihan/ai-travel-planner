# 🌍 AI 旅行规划师 (AI Travel Planner)

## 项目地址：https://github.com/zhulongqihan/ai-travel-planner

github中包含有相关运行截图

测试账号：admin@nju.edu.cn

测试密码：123456

> 
>
> 一个功能完善、界面现代的 AI 智能旅行规划 Web 应用，基于阿里云百炼大模型，提供智能行程生成、地图导航、语音识别、预算管理等功能。

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)

---

## 📦 Docker 快速部署（推荐）

### 🚀 一键启动

```bash
# 1. 拉取 Docker 镜像
docker pull crpi-6mppr7h5m3b03dk6.cn-hangzhou.personal.cr.aliyuncs.com/aitravel/ai-travel-planner:latest

# 2. 克隆项目（获取配置文件）
git clone https://github.com/zhulongqihan/ai-travel-planner.git
cd ai-travel-planner

# 3. 配置环境变量
cp env.docker.example .env.docker
# 编辑 .env.docker 文件，填入以下配置：
# - DASHSCOPE_API_KEY: 您的阿里云百炼 API Key（必填）
# - SUPABASE_URL 和 SUPABASE_KEY: 已提供测试账号
# - AMAP_API_KEY 和 AMAP_WEB_KEY: 已提供测试密钥

# 4. 运行容器
docker run -d \
  -p 8000:8000 \
  --name ai-travel-planner \
  --env-file .env.docker \
  crpi-6mppr7h5m3b03dk6.cn-hangzhou.personal.cr.aliyuncs.com/aitravel/ai-travel-planner:latest

# 5. 访问应用
# 浏览器打开 http://localhost:8000
```

### 🔑 配置说明（供评审使用）

#### 📌 助教请注意

本项目需要以下 API 配置才能正常运行：

| 配置项 | 获取方式 | 说明 |
|--------|---------|------|
| `DASHSCOPE_API_KEY` | **请使用您自己的 Key**<br/>https://dashscope.aliyun.com/ | 阿里云百炼大模型 API |
| `SUPABASE_URL`<br/>`SUPABASE_KEY` | **作业提交平台提供** | 数据库和认证服务 |
| `AMAP_API_KEY`<br/>`AMAP_WEB_KEY` | **作业提交平台提供** | 高德地图服务 |
| `ALIYUN_SPEECH_*` | **作业提交平台提供**<br/>（可选） | 语音识别功能 |

#### 🎯 快速配置流程

1. **克隆项目**
   ```bash
   git clone https://github.com/zhulongqihan/ai-travel-planner.git
   cd ai-travel-planner
   ```

2. **复制配置模板**
   ```bash
   # Windows
   copy env.docker.example .env.docker
   
   # Linux/Mac
   cp env.docker.example .env.docker
   ```

3. **编辑 `.env.docker`**
   - 从作业提交平台获取完整的 API Keys
   - 填入您自己的 `DASHSCOPE_API_KEY`

4. **一键启动**
   ```bash
   docker-compose up -d
   ```

5. **访问应用**
   - 浏览器打开：http://localhost:8000
   - 测试账号：`admin@nju.edu.cn` / `123456`

> 📚 **详细配置指南**：请查看 [助教配置指南.md](助教配置指南.md)



### 📚 详细文档

- 🐳 [Docker 完整部署文档](DOCKER_README.md) - 详细的 Docker 使用说明
- 🚀 [快速部署指南](快速部署指南.md) - 5分钟快速上手
- 👨‍🏫 [助教评审说明](助教评审说明.md) - 面向助教的完整评审指南

---

## ✨ 核心功能

### 🤖 AI 智能行程生成
- **语音输入识别**：支持自然语言语音输入，AI 自动解析旅行需求
- **智能行程规划**：使用阿里云百炼大模型（Qwen）生成个性化旅行路线
- **详细行程安排**：包含每日景点、餐厅、住宿、交通等完整信息
- **费用智能估算**：自动计算各项费用，帮助控制预算
- **实时进度显示**：SSE 流式响应，实时显示生成进度

### 🗺️ 全球地图导航
- **四层智能地理编码**：
  1. 高德地图 JS API（快速，国内优先）
  2. 内置坐标库（精确匹配知名城市）
  3. 高德地图后端 API（全面的 POI 搜索）
  4. OpenStreetMap Nominatim（国际地点支持）
- **全球地点支持**：支持国内外旅行目的地
- **路线自动规划**：自动规划景点间的驾车路线
- **地图交互展示**：点击查看景点详情、路线信息

### 💼 实用工具集
- **📄 导出 PDF**：将行程导出为精美文档
- **📋 快速复制**：一键复制行程文本
- **🖨️ 打印功能**：直接打印行程单
- **🔗 分享链接**：生成分享链接，支持邮件分享
- **⬆️ 返回顶部**：快速滚动导航
- **❓ 帮助中心**：详细的功能使用说明

### 💰 智能预算管理
- **实时预算追踪**：记录实际旅行开销
- **分类统计分析**：按交通、住宿、餐饮等分类统计
- **AI 优化建议**：智能预算分析和节省建议
- **语音记账**：支持语音添加费用记录
- **预算对比**：预算与实际花费的实时对比

### 🎨 现代化 UI/UX
- **🌓 深色模式**：支持浅色/深色主题切换
- **✨ 玻璃态设计**：现代化的毛玻璃效果
- **🎬 流畅动画**：丰富的交互动画和过渡效果
- **📱 响应式布局**：完美适配桌面端和移动端
- **🎨 设计系统**：完整的色彩、阴影、圆角、动画系统（2700+ 行 CSS）

### 👤 用户系统
- **🔐 安全认证**：基于 Supabase 的用户认证系统
- **☁️ 云端存储**：旅行计划自动云端保存
- **📱 多设备同步**：随时随地访问和管理计划
- **🔒 数据隔离**：行级安全策略保护用户隐私

---

## 🛠️ 技术栈

### 后端技术
- **框架**：FastAPI (Python 3.11)
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Authentication + JWT
- **AI 模型**：阿里云百炼 DashScope (Qwen-Plus)
- **语音识别**：阿里云智能语音服务
- **HTTP 客户端**：HTTPX (异步)
- **数据验证**：Pydantic

### 前端技术
- **基础**：HTML5 + CSS3 + ES6+ JavaScript
- **地图服务**：
  - 高德地图 API 2.0（国内地点）
  - OpenStreetMap Nominatim（国际地点）
- **语音**：Web Speech API + 阿里云语音识别
- **UI 设计**：玻璃态设计 + 渐变色系 + 流畅动画

### DevOps
- **容器化**：Docker + Docker Compose
- **CI/CD**：GitHub Actions
- **镜像仓库**：阿里云容器镜像服务
- **版本控制**：Git + GitHub

---

## 📸 功能展示

### 主界面
现代化的主界面，支持语音和手动输入，右侧实时显示地图

### 智能规划
<table>
  <tr>
    <td width="50%">
      <strong>语音识别</strong><br/>
      自然语言语音输入，AI 自动识别并填充表单
    </td>
    <td width="50%">
      <strong>详细行程</strong><br/>
      完整的每日行程安排，包含景点、餐厅、住宿
    </td>
  </tr>
  <tr>
    <td>
      <strong>地图导航</strong><br/>
      支持国内外地点标记和路线规划
    </td>
    <td>
      <strong>预算管理</strong><br/>
      实时追踪花费，AI 智能分析建议
    </td>
  </tr>
</table>

> 📸 更多截图请查看 `界面功能截图/` 目录

---

## 🚀 本地开发部署

### 前置要求
- Python 3.8+
- Git

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/zhulongqihan/ai-travel-planner.git
cd ai-travel-planner

# 2. 创建虚拟环境
python -m venv venv

# 3. 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. 安装依赖
pip install -r requirements.txt

# 5. 配置环境变量
cp .env.template .env
# 编辑 .env 文件，填入 API Keys

# 6. 运行应用
python run.py

# 7. 访问应用
# 浏览器打开 http://localhost:8000
```

### 环境变量配置

创建 `.env` 文件并填入以下配置：

```env
# Supabase 配置
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# 阿里云百炼配置
DASHSCOPE_API_KEY=your-dashscope-api-key

# 阿里云语音识别（可选）
ALIYUN_SPEECH_APP_KEY=your-app-key
ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret

# 高德地图配置
AMAP_API_KEY=your-amap-backend-key
AMAP_WEB_KEY=your-amap-web-key
```

---

## 📁 项目结构

```
ai-travel-planner/
├── backend/                      # 后端服务
│   ├── main.py                  # FastAPI 主程序
│   ├── database.py              # Supabase 数据库操作
│   ├── routers/                 # API 路由模块
│   │   ├── auth.py             # 用户认证
│   │   ├── travel.py           # 旅行规划（AI 生成）
│   │   ├── geocode.py          # 地理编码和路线规划
│   │   ├── voice.py            # 语音识别
│   │   ├── parse.py            # 语音内容解析
│   │   └── budget.py           # 预算管理
│   └── requirements.txt         # Python 依赖
├── frontend/                     # 前端应用
│   ├── index.html               # 主页面
│   ├── css/
│   │   └── style.css           # 样式文件（2700+ 行）
│   └── js/
│       ├── app.js              # 主应用逻辑
│       ├── map.js              # 地图功能（四层地理编码）
│       ├── auth.js             # 用户认证
│       ├── voice.js            # 语音识别
│       ├── budget.js           # 预算管理
│       └── toolbar.js          # 工具栏功能
├── Dockerfile                    # Docker 镜像构建
├── docker-compose.yml            # Docker Compose 配置
├── .github/workflows/            # GitHub Actions
│   └── docker-build.yml         # 自动构建和推送
├── run.py                        # 应用启动入口
├── requirements.txt              # 项目依赖
├── README.md                     # 项目文档（本文件）
├── DOCKER_README.md              # Docker 详细文档
├── 助教评审说明.md                # 助教评审指南
└── 快速部署指南.md                # 快速部署说明
```

---

## 🧪 功能测试

### 基础测试

**测试数据**：
- 目的地：东京
- 天数：5
- 预算：10000
- 人数：2
- 偏好：美食、动漫

**预期结果**：
- ✅ 生成完整的 5 天行程
- ✅ 包含景点、餐厅、住宿推荐
- ✅ 显示费用估算
- ✅ 地图显示所有地点标记
- ✅ 显示路线规划

### 语音识别测试

说出：
```
"我想明年三月去杭州，三天，预算五千元，两个人，喜欢美食"
```

预期：自动填充表单并可生成计划

### 国际地点测试

测试目的地：
- 日本东京
- 法国巴黎
- 美国纽约

预期：能正确显示地图标记（使用 OpenStreetMap）

---

## 🎯 项目亮点

### 1. 四层智能地理编码系统
创新性的地理编码策略，解决国内外地点统一支持问题：
- **第一层**：高德地图 JS API（快速响应）
- **第二层**：内置坐标库（精确匹配）
- **第三层**：高德地图后端 API（全面搜索）
- **第四层**：OpenStreetMap API（国际覆盖）

### 2. 完整的 AI Prompt 工程
- 明确时间上下文（自动识别当前年份）
- 结构化 JSON 输出
- 健壮的错误处理和降级策略

### 3. 现代化 UI 设计系统
- 2700+ 行精心设计的 CSS
- 完整的设计变量系统
- 玻璃态效果 + 流畅动画
- 深色模式支持

### 4. 实用的工具栏集成
- 一键导出 PDF
- 快速复制分享
- 完善的帮助文档

### 5. 完整的容器化部署
- Docker 镜像构建
- GitHub Actions 自动化
- 阿里云镜像仓库托管

---

## 📊 技术指标

- **代码量**：约 15,000 行
- **Docker 镜像大小**：约 350 MB
- **构建时间**：约 5-8 分钟
- **启动时间**：< 5 秒
- **响应时间**：< 500ms（API 调用）

---

## 🔧 开发工具

### 推荐 IDE
- Visual Studio Code
- PyCharm Professional

### 推荐插件
- Python
- Pylance
- Docker
- ESLint
- Prettier

---

## 📖 API 文档

启动服务后访问：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/signup` | POST | 用户注册 |
| `/api/auth/signin` | POST | 用户登录 |
| `/api/travel/generate` | POST | 生成旅行计划（流式） |
| `/api/travel/plans` | GET | 获取用户计划列表 |
| `/api/geocode/search` | GET | POI 搜索 |
| `/api/geocode/driving-route` | GET | 路线规划 |
| `/api/voice/recognize` | POST | 语音识别 |
| `/api/budget/expenses` | POST | 添加费用记录 |

---

## 🐛 已知限制

1. **国际路线规划**：国际地点仅支持标记，不支持路线规划（高德地图 API 限制）
2. **语音识别**：需要 HTTPS 或 localhost 环境
3. **浏览器兼容性**：推荐 Chrome 90+、Edge 90+、Safari 14+

---

## 🚢 部署说明

### Docker 部署（推荐）

详见 [DOCKER_README.md](DOCKER_README.md)

### 传统部署

详见 [DEPLOYMENT.md](DEPLOYMENT.md)（如有）

### GitHub Actions 自动构建

本项目配置了 GitHub Actions，每次推送到 `main` 分支时自动：
1. 构建 Docker 镜像
2. 推送到阿里云镜像仓库
3. 标记 `latest` 和分支名标签

配置文件：`.github/workflows/docker-build.yml`

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

---

## 📞 技术支持

- 🐛 **问题反馈**：[GitHub Issues](https://github.com/zhulongqihan/ai-travel-planner/issues)
- 📖 **项目文档**：本 README 及相关文档
- 💬 **讨论交流**：[GitHub Discussions](https://github.com/zhulongqihan/ai-travel-planner/discussions)

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

感谢以下开源项目和服务：

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的 Python Web 框架
- [Supabase](https://supabase.com/) - 开源的 Firebase 替代方案
- [阿里云百炼](https://dashscope.aliyun.com/) - 强大的 AI 模型服务
- [高德地图](https://lbs.amap.com/) - 优秀的地图服务
- [OpenStreetMap](https://www.openstreetmap.org/) - 开放的地图数据

---

## 📈 项目统计

- **开发周期**：2024年10月 - 2025年1月
- **提交次数**：100+ commits
- **功能模块**：8 个主要模块
- **代码文件**：50+ 文件
- **文档页数**：2000+ 行文档

---

## ⭐ Star History

如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！

---

<div align="center">

**✨ 祝你旅行愉快！🌍✈️**

Made with ❤️ by [zhulongqihan](https://github.com/zhulongqihan)

[返回顶部](#-ai-旅行规划师-ai-travel-planner)

</div>
