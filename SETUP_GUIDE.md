# 配置指南

本文档详细说明如何获取和配置所需的各项 API 密钥。

## 目录

1. [Supabase 配置](#1-supabase-配置)
2. [阿里云百炼配置](#2-阿里云百炼配置)
3. [阿里云语音识别配置](#3-阿里云语音识别配置)
4. [高德地图配置](#4-高德地图配置)
5. [完整配置清单](#5-完整配置清单)

---

## 1. Supabase 配置

Supabase 提供数据库和用户认证服务。

### 步骤：

1. **注册账号**
   - 访问 [https://supabase.com](https://supabase.com)
   - 点击 "Start your project" 注册账号

2. **创建项目**
   - 登录后点击 "New Project"
   - 填写项目名称和数据库密码
   - 选择区域（建议选择距离你最近的区域）
   - 等待项目创建完成（约1-2分钟）

3. **获取 API 密钥**
   - 进入项目后，点击左侧的 ⚙️ Settings
   - 选择 "API"
   - 复制以下信息：
     - `URL`: 项目 URL
     - `anon public`: 匿名公钥

4. **设置数据库**
   - 点击左侧的 SQL Editor
   - 点击 "+ New query"
   - 复制并运行项目中的 `database_setup.sql` 脚本
   - 执行成功后会创建必要的表和安全策略

5. **配置环境变量**
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 2. 阿里云百炼配置

阿里云百炼提供大语言模型服务，用于生成旅行计划。

### 步骤：

1. **注册阿里云账号**
   - 访问 [https://www.aliyun.com](https://www.aliyun.com)
   - 注册并完成实名认证

2. **开通百炼服务**
   - 访问 [https://dashscope.aliyun.com](https://dashscope.aliyun.com)
   - 点击 "立即开通"
   - 选择按量付费（新用户通常有免费额度）

3. **创建 API Key**
   - 登录百炼控制台
   - 点击右上角头像 > API-KEY 管理
   - 点击 "创建新的API-KEY"
   - 复制生成的 API Key（只显示一次，请妥善保存）

4. **配置环境变量**
   ```env
   DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **模型选择**
   项目中使用的模型：
   - `qwen-plus`: 性价比高，适合大多数场景
   - `qwen-turbo`: 速度快，成本低
   - `qwen-max`: 效果最好，成本较高

   可在 `backend/routers/travel.py` 中修改模型名称。

### 费用说明：
- 新用户通常有免费额度
- 按 token 计费，1000 tokens ≈ 750 个中文字
- qwen-plus: 约 0.008 元/1000 tokens（输入）

---

## 3. 阿里云语音识别配置

用于将语音转换为文字。

### 步骤：

1. **开通智能语音服务**
   - 登录阿里云控制台
   - 搜索 "智能语音交互"
   - 点击 "立即开通"

2. **创建项目**
   - 进入智能语音交互控制台
   - 选择 "一句话识别"
   - 创建项目，获取 AppKey

3. **创建 AccessKey**
   - 点击右上角头像 > AccessKey 管理
   - 创建 AccessKey（建议使用 RAM 用户）
   - 获取 AccessKeyId 和 AccessKeySecret

4. **配置环境变量**
   ```env
   ALIYUN_SPEECH_APP_KEY=your-app-key
   ALIYUN_ACCESS_KEY_ID=LTAI5t...
   ALIYUN_ACCESS_KEY_SECRET=xxxxxxxxxxxxx
   ```

### 注意：
- 语音识别功能是可选的
- 如果不配置，可以使用浏览器自带的 Web Speech API（仅部分浏览器支持）
- 阿里云语音服务有免费额度，超出后按量计费

---

## 4. 高德地图配置

用于地图显示、地理编码和路线规划。

### 步骤：

1. **注册开发者账号**
   - 访问 [https://lbs.amap.com](https://lbs.amap.com)
   - 注册并登录

2. **创建应用**
   - 进入控制台
   - 点击 "应用管理" > "我的应用"
   - 点击 "创建新应用"
   - 填写应用名称和类型

3. **添加 Key**
   - 在应用下点击 "添加"
   - 服务平台选择 "Web端(JS API)"
   - 填写应用名称
   - 提交后获得 Key

4. **配置安全密钥**（可选但推荐）
   - 在 Key 设置中启用 "数字签名"
   - 获取 security.jscode

5. **配置环境变量**
   ```env
   AMAP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx
   AMAP_WEB_KEY=xxxxxxxxxxxxxxxxxxxxxxx
   ```

6. **修改前端代码**
   在 `frontend/index.html` 中替换 Key：
   ```html
   <script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_WEB_KEY"></script>
   ```

   如果启用了安全密钥：
   ```javascript
   window._AMapSecurityConfig = {
       securityJsCode: 'your_security_js_code',
   }
   ```

### 费用说明：
- 个人开发者：每天 10 万次调用免费配额
- 超出部分按量计费
- 基础功能免费额度通常足够使用

---

## 5. 完整配置清单

创建 `.env` 文件，包含所有配置：

```env
# Supabase 配置
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 阿里云百炼配置
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# 阿里云语音识别配置（可选）
ALIYUN_SPEECH_APP_KEY=your-app-key
ALIYUN_ACCESS_KEY_ID=LTAI5t...
ALIYUN_ACCESS_KEY_SECRET=xxxxxxxxxxxxx

# 高德地图配置
AMAP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx
AMAP_WEB_KEY=xxxxxxxxxxxxxxxxxxxxxxx

# 应用配置
APP_ENV=development
APP_PORT=8000
```

---

## 常见问题

### Q1: API 密钥泄露了怎么办？
- 立即在对应平台删除该密钥
- 创建新的密钥并更新配置
- 检查是否有异常调用或费用

### Q2: 如何限制 API 使用量？
- Supabase: 在项目设置中设置配额
- 阿里云: 设置费用预警
- 高德地图: 设置 IP 白名单或流量控制

### Q3: 能否使用其他服务替代？
可以，项目支持替换：
- **数据库**: 可替换为 Firebase、MongoDB
- **AI**: 可使用 OpenAI、通义千问等
- **语音**: 可使用讯飞、腾讯云等
- **地图**: 可使用百度地图、腾讯地图

### Q4: 免费额度用完了怎么办？
- 大部分服务支持按量付费
- 建议先用小额充值测试
- 可以申请学生优惠或新用户优惠

---

## 安全建议

1. ✅ **不要将 `.env` 提交到 Git**
2. ✅ **使用环境变量管理敏感信息**
3. ✅ **定期轮换 API 密钥**
4. ✅ **为每个环境使用不同的密钥**
5. ✅ **设置 API 调用限制和监控**
6. ✅ **在生产环境启用 HTTPS**
7. ✅ **配置 CORS 只允许特定域名**

---

## 支持

如果在配置过程中遇到问题：
1. 查看各平台的官方文档
2. 检查控制台的错误日志
3. 在项目 Issue 中提问

祝配置顺利！🎉



