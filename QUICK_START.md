# 快速开始指南

5 分钟快速启动 AI 旅行规划师！

## 前置要求

- Python 3.8+
- 现代浏览器（Chrome、Edge、Firefox、Safari）
- Git

## 快速安装

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-travel-planner
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
# 复制模板文件
cp .env.template .env

# 编辑 .env 文件，填入你的 API 密钥
notepad .env  # Windows
nano .env     # Linux/Mac
```

最小配置（仅核心功能）：

```env
SUPABASE_URL=你的Supabase项目URL
SUPABASE_KEY=你的Supabase密钥
DASHSCOPE_API_KEY=你的阿里云百炼密钥
```

### 4. 初始化数据库

1. 登录 [Supabase](https://supabase.com)
2. 进入 SQL Editor
3. 运行 `database_setup.sql` 中的 SQL 代码

### 5. 启动服务

```bash
python run.py
```

### 6. 访问应用

打开浏览器访问：

```
http://localhost:8000/static/index.html
```

## 快速测试

### 测试 1: 创建账号

1. 点击右上角"注册"
2. 填写邮箱和密码
3. 点击注册

### 测试 2: 生成旅行计划

1. 填写表单：
   - 目的地: `日本东京`
   - 天数: `5`
   - 预算: `10000`
   - 人数: `2`
   - 偏好: `美食、动漫`

2. 点击"生成旅行计划"

3. 等待 AI 生成计划（约 10-30 秒）

### 测试 3: 保存计划

1. 查看生成的计划
2. 点击"保存计划"
3. 到"我的计划"查看

## 获取 API 密钥

### Supabase（必需）

1. 访问 https://supabase.com
2. 创建新项目
3. 在 Settings > API 获取 URL 和 Key

🔗 [详细教程](SETUP_GUIDE.md#1-supabase-配置)

### 阿里云百炼（必需）

1. 访问 https://dashscope.aliyun.com
2. 开通服务
3. 创建 API Key

🔗 [详细教程](SETUP_GUIDE.md#2-阿里云百炼配置)

### 高德地图（可选）

1. 访问 https://lbs.amap.com
2. 注册开发者
3. 创建应用获取 Key
4. 在 `frontend/index.html` 中替换 Key

🔗 [详细教程](SETUP_GUIDE.md#4-高德地图配置)

### 阿里云语音（可选）

1. 访问阿里云控制台
2. 开通智能语音服务
3. 获取 AppKey 和 AccessKey

🔗 [详细教程](SETUP_GUIDE.md#3-阿里云语音识别配置)

## 常见问题

### Q: 启动失败

**A:** 检查是否安装了所有依赖：

```bash
pip install -r requirements.txt
```

### Q: 数据库连接失败

**A:** 检查 `.env` 中的 Supabase URL 和 Key 是否正确。

### Q: API 调用失败

**A:** 
1. 检查 API 密钥是否有效
2. 检查是否有免费额度
3. 查看浏览器控制台错误信息

### Q: 语音功能不工作

**A:** 
1. 确保使用 HTTPS 或 localhost
2. 检查浏览器麦克风权限
3. 尝试使用 Chrome 浏览器

### Q: 生成计划很慢

**A:** 
- AI 生成通常需要 10-30 秒
- 可以尝试切换到 `qwen-turbo` 模型（更快但效果稍差）
- 检查网络连接

## 下一步

- 📖 阅读 [完整文档](README.md)
- 🔧 查看 [配置指南](SETUP_GUIDE.md)
- 🚀 了解 [部署方法](DEPLOYMENT.md)
- 📡 查看 [API 文档](API_DOCUMENTATION.md)

## 获取帮助

- 查看 [GitHub Issues](https://github.com/your-repo/issues)
- 阅读 [常见问题](README.md#常见问题)
- 提交问题反馈

---

**开始你的智能旅行规划之旅吧！** 🌍✈️



