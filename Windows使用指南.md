# Windows 系统详细操作指南

## 📋 准备工作

### 需要安装的软件

1. **Python 3.8 或更高版本**
   - 下载地址: https://www.python.org/downloads/
   - 安装时**务必勾选** "Add Python to PATH"
   
2. **浏览器**
   - 推荐 Chrome 或 Edge（已自带）

3. **文本编辑器**（可选）
   - 推荐 VSCode: https://code.visualstudio.com/

---

## 🚀 第一步：检查 Python 安装

打开 PowerShell 或命令提示符：
- 按 `Win + R`
- 输入 `powershell` 或 `cmd`
- 回车

执行命令：
```bash
python --version
```

应该看到类似输出：
```
Python 3.11.x
```

如果显示"不是内部或外部命令"，说明 Python 未安装或未添加到 PATH。

---

## 🔧 第二步：初始化项目

### 方法 A：使用自动脚本（推荐）

1. 在项目文件夹中，找到 `scripts` 文件夹
2. 双击运行 `setup.bat`
3. 等待安装完成

**或者**在命令行中：
```bash
cd F:\LLMassist\Webai\ai-travel-planner
scripts\setup.bat
```

### 方法 B：手动安装

```bash
# 1. 进入项目目录
cd F:\LLMassist\Webai\ai-travel-planner

# 2. 创建虚拟环境（可选但推荐）
python -m venv venv

# 3. 激活虚拟环境
venv\Scripts\activate

# 4. 升级 pip
python -m pip install --upgrade pip

# 5. 安装依赖
pip install -r requirements.txt
```

安装过程可能需要 2-5 分钟，请耐心等待。

---

## 🔑 第三步：配置 API 密钥

### 3.1 创建配置文件

1. 在项目根目录找到 `.env.template` 文件
2. 复制它并重命名为 `.env`

**使用命令行**：
```bash
copy .env.template .env
```

**或者**：
- 右键 `.env.template`
- 选择"复制"
- 在空白处右键"粘贴"
- 重命名为 `.env`

### 3.2 编辑 .env 文件

用记事本或 VSCode 打开 `.env` 文件：

```bash
notepad .env
```

你会看到：
```env
# Supabase配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# 阿里云百炼配置
DASHSCOPE_API_KEY=your_dashscope_api_key

# 其他配置...
```

### 3.3 获取并填写 API 密钥

#### ① Supabase（必需）

**步骤**：
1. 访问 https://supabase.com
2. 点击 "Start your project" 注册（可用 GitHub 登录）
3. 点击 "New Project"
4. 填写信息：
   - Name: `ai-travel-planner`
   - Database Password: 设置一个密码（记住它）
   - Region: 选择 `Southeast Asia (Singapore)` 或最近的区域
5. 等待项目创建（约 1-2 分钟）
6. 创建完成后，点击左侧 ⚙️ **Settings**
7. 选择 **API**
8. 找到并复制：
   - **URL**: 类似 `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: 一长串以 `eyJ` 开头的密钥

**填写到 .env**：
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

#### ② 阿里云百炼（必需）

**步骤**：
1. 访问 https://dashscope.aliyun.com
2. 使用支付宝或淘宝账号登录
3. 如果是新用户，需要先完成实名认证
4. 点击 "立即开通" 百炼服务
5. 选择 "按量付费"（新用户通常有免费额度）
6. 点击右上角头像 → **API-KEY 管理**
7. 点击 "创建新的 API-KEY"
8. 复制生成的密钥（以 `sk-` 开头）

**填写到 .env**：
```env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### ③ 高德地图（可选）

**步骤**：
1. 访问 https://lbs.amap.com
2. 注册并登录（可用支付宝登录）
3. 进入控制台 → 应用管理 → 我的应用
4. 点击 "创建新应用"
5. 应用名称: `AI旅行规划师`
6. 应用类型: `Web端(JS API)`
7. 创建后点击 "添加 Key"
8. 服务平台选择: `Web端(JS API)`
9. 复制生成的 Key

**填写到 .env**：
```env
AMAP_WEB_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**还需要修改前端代码**：

打开 `frontend/index.html`，找到第 9-10 行：
```html
<script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_WEB_KEY"></script>
```

替换 `YOUR_AMAP_WEB_KEY` 为你的密钥。

#### ④ 阿里云语音（可选，可跳过）

这个功能可选，浏览器自带的语音识别也可以用。

如需配置，参考 `SETUP_GUIDE.md` 第3节。

### 3.4 保存 .env 文件

确保 `.env` 文件至少包含：
```env
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_KEY=你的密钥
DASHSCOPE_API_KEY=sk-你的密钥
```

**Ctrl + S** 保存文件。

---

## 🗄️ 第四步：初始化数据库

### 4.1 打开 Supabase 控制台

1. 访问 https://supabase.com
2. 登录并进入你的项目
3. 点击左侧的 **SQL Editor** 图标（数据库图标）

### 4.2 运行数据库脚本

1. 点击 **+ New query** 按钮
2. 打开项目文件夹中的 `database_setup.sql` 文件
3. 复制**所有内容**（Ctrl + A，然后 Ctrl + C）
4. 粘贴到 Supabase 的 SQL 编辑器中（Ctrl + V）
5. 点击右下角的 **Run** 按钮（或按 Ctrl + Enter）

### 4.3 确认执行成功

应该看到：
```
Success. No rows returned
```

这表示数据库表已成功创建。

你可以点击左侧的 **Table Editor** 查看：
- `travel_plans` 表（旅行计划）
- `expenses` 表（费用记录）

---

## ▶️ 第五步：启动项目

### 方法 A：使用启动脚本（推荐）

1. 双击 `scripts\start.bat`

**或者**在命令行：
```bash
scripts\start.bat
```

### 方法 B：使用 Python 命令

```bash
# 1. 进入项目目录
cd F:\LLMassist\Webai\ai-travel-planner

# 2. 如果使用了虚拟环境，先激活它
venv\Scripts\activate

# 3. 启动项目
python run.py
```

### 看到以下输出表示成功：

```
============================================================
🌍 AI 旅行规划师
============================================================

后端服务启动中...
API 文档地址: http://localhost:8000/docs
前端访问地址: http://localhost:8000/static/index.html

按 Ctrl+C 停止服务
============================================================

INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🌐 第六步：打开浏览器使用

### 6.1 访问应用

打开 Chrome 或 Edge 浏览器，访问：

```
http://localhost:8000/static/index.html
```

### 6.2 注册账号

1. 点击右上角 **"注册"** 按钮
2. 填写：
   - 姓名（可选）
   - 邮箱（例如：test@example.com）
   - 密码（至少6位）
3. 点击"注册"

注册成功后会自动登录。

### 6.3 创建第一个旅行计划

#### 方式 1：语音输入

1. 点击 🎤 **"点击开始语音输入"** 按钮
2. 浏览器会请求麦克风权限，点击"允许"
3. 对着麦克风说：
   > "我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
4. 点击停止录音
5. 等待识别和填充表单

#### 方式 2：手动输入（推荐新手）

填写表单：
- **目的地**: `日本东京`
- **旅行天数**: `5`
- **预算（元）**: `10000`
- **同行人数**: `2`
- **出发日期**: 选择一个日期
- **旅行偏好**: `喜欢美食、动漫文化、带孩子、需要舒适的住宿`

点击 **"生成旅行计划"** 按钮。

### 6.4 等待 AI 生成

- 会出现"AI正在为您规划旅行..."的加载提示
- 通常需要 **10-30 秒**
- 请耐心等待，不要刷新页面

### 6.5 查看计划

生成完成后，右侧会显示：
- 每天的详细行程
- 景点、餐厅、住宿建议
- 预估费用明细
- 旅行建议

### 6.6 保存计划

点击 **"保存计划"** 按钮，计划会保存到云端。

在"我的计划"页面可以查看所有保存的计划。

---

## 🎯 功能使用指南

### 1. 查看我的计划

1. 点击顶部导航栏的 **"我的计划"**
2. 查看所有保存的旅行计划
3. 点击任意计划卡片可查看详情
4. 点击"删除"按钮可删除计划

### 2. 预算管理

1. 选择一个计划
2. 点击顶部的 **"预算管理"**
3. 添加实际费用记录
4. 查看预算分析和 AI 建议

### 3. 地图查看（需配置高德地图）

如果配置了高德地图 API：
1. 在计划详情中
2. 点击景点名称
3. 在地图上查看位置

---

## ⚠️ 常见问题解决

### 问题 1：打不开网页

**原因**：可能访问了错误的地址

**解决**：确保访问的是：
```
http://localhost:8000/static/index.html
```
不是 `http://localhost:8000`

---

### 问题 2：pip 安装依赖失败

**错误信息**：`'pip' 不是内部或外部命令`

**解决**：
```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

---

### 问题 3：数据库连接失败

**错误信息**：网页显示"获取旅行计划失败"

**检查**：
1. `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_KEY` 是否正确
2. 是否已在 Supabase 中运行了 `database_setup.sql`
3. Supabase 项目是否处于活动状态

**解决**：重新检查配置，确保复制的密钥没有多余空格。

---

### 问题 4：AI 生成失败

**错误信息**："生成旅行计划失败"

**检查**：
1. `.env` 中的 `DASHSCOPE_API_KEY` 是否正确
2. 阿里云账户是否有余额或免费额度
3. 网络能否访问阿里云服务

**解决**：
- 登录阿里云百炼控制台检查额度
- 查看浏览器控制台（F12）的错误信息

---

### 问题 5：语音不工作

**解决**：
1. 确保使用的是 **localhost**（不是 127.0.0.1）
2. 使用 **Chrome** 或 **Edge** 浏览器
3. 检查浏览器是否允许了麦克风权限
4. 如果还是不行，使用手动输入

---

### 问题 6：端口被占用

**错误信息**：`Address already in use`

**解决**：
```bash
# 查找占用 8000 端口的进程
netstat -ano | findstr :8000

# 记下最后一列的 PID（进程ID），例如 12345
# 结束该进程
taskkill /F /PID 12345

# 重新启动项目
python run.py
```

---

## 🛑 停止服务

在运行项目的命令行窗口中：
- 按 **Ctrl + C**
- 等待服务关闭
- 看到提示后可以关闭窗口

---

## 📱 使用技巧

### 1. 快速测试

最简单的测试方法：
- 目的地：`成都`
- 天数：`3`
- 预算：`3000`
- 人数：`1`
- 偏好：`美食、休闲`

这样生成更快，适合测试。

### 2. 提高生成质量

在"旅行偏好"中尽量详细：
```
喜欢自然风光和历史文化，不喜欢购物。
需要舒适的住宿环境，对美食有要求。
喜欢慢节奏的旅行，不喜欢赶行程。
带老人和小孩，需要考虑体力。
```

### 3. 费用记录

添加费用时可以使用语音：
- 点击麦克风图标
- 说："午餐花了150元"

### 4. 导出计划

目前可以：
- 复制文本内容
- 截图保存
- 未来版本会支持 PDF 导出

---

## 🔄 更新项目

如果项目有更新：

```bash
# 1. 进入项目目录
cd F:\LLMassist\Webai\ai-travel-planner

# 2. 激活虚拟环境（如果使用）
venv\Scripts\activate

# 3. 更新依赖
pip install -r requirements.txt --upgrade

# 4. 重启服务
python run.py
```

---

## 📊 API 使用量查看

### Supabase
1. 访问 https://supabase.com
2. 进入项目
3. 点击 Settings → Usage
4. 查看数据库使用情况

### 阿里云
1. 登录阿里云控制台
2. 进入"费用中心"
3. 查看"账单明细"

### 高德地图
1. 访问 https://console.amap.com
2. 查看"数据统计"

---

## 💡 优化建议

### 1. 加快 AI 生成速度

编辑 `backend/routers/travel.py`，找到第 94 行附近：
```python
model="qwen-plus",  # 改为 qwen-turbo 会更快
```

### 2. 修改界面样式

编辑 `frontend/css/style.css`，调整颜色和布局。

### 3. 添加更多功能

参考 `CONTRIBUTING.md` 了解如何扩展功能。

---

## 🎓 VSCode 使用（可选）

### 安装 VSCode

1. 下载：https://code.visualstudio.com/
2. 安装时选择"添加到 PATH"

### 打开项目

```bash
cd F:\LLMassist\Webai\ai-travel-planner
code .
```

### 推荐扩展

VSCode 会自动提示安装推荐扩展：
- Python
- Pylance
- Prettier

### 调试运行

按 **F5** 启动调试模式，可以设置断点调试。

---

## 📞 获取帮助

### 查看文档
1. `使用说明.md` - 中文使用指南
2. `FAQ.md` - 25+ 常见问题
3. `SETUP_GUIDE.md` - 详细配置教程
4. `README.md` - 完整项目说明

### 在线文档
启动项目后访问：
```
http://localhost:8000/docs
```
查看 API 交互式文档。

---

## ✅ 完整操作清单

- [ ] 安装 Python 3.8+
- [ ] 运行 `scripts\setup.bat`
- [ ] 注册 Supabase 账号
- [ ] 获取 Supabase URL 和 Key
- [ ] 注册阿里云百炼
- [ ] 获取阿里云 API Key
- [ ] 创建并编辑 `.env` 文件
- [ ] 在 Supabase 运行 `database_setup.sql`
- [ ] 运行 `python run.py`
- [ ] 打开浏览器访问 localhost:8000
- [ ] 注册账号
- [ ] 创建第一个旅行计划

---

## 🎉 完成！

现在你可以开始使用 AI 旅行规划师了！

**常用命令**：
```bash
# 启动项目
python run.py

# 或使用脚本
scripts\start.bat

# 停止项目
Ctrl + C
```

**访问地址**：
```
http://localhost:8000/static/index.html
```

---

**祝你使用愉快！有任何问题查看 FAQ.md 或项目文档！** 🌍✈️

**最后更新**：2024-01-15

