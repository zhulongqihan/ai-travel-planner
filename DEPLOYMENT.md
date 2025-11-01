# 部署指南

本文档介绍如何将 AI 旅行规划师部署到生产环境。

## 目录

1. [部署前准备](#部署前准备)
2. [后端部署](#后端部署)
3. [前端部署](#前端部署)
4. [环境变量配置](#环境变量配置)
5. [域名和 HTTPS](#域名和-https)
6. [监控和维护](#监控和维护)

---

## 部署前准备

### 1. 检查清单

- ✅ 所有 API 密钥已配置且有效
- ✅ 数据库已初始化（运行 `database_setup.sql`）
- ✅ 代码已提交到 Git 仓库
- ✅ `.env` 文件已添加到 `.gitignore`
- ✅ 在本地测试运行正常

### 2. 选择部署平台

#### 后端推荐平台
- **Railway** (推荐): 简单易用，自动部署
- **Render**: 免费额度较多
- **Fly.io**: 全球边缘部署
- **Heroku**: 传统稳定
- **阿里云/腾讯云**: 国内访问快

#### 前端推荐平台
- **Vercel** (推荐): 自动构建，CDN 加速
- **Netlify**: 功能丰富
- **GitHub Pages**: 免费简单
- **Cloudflare Pages**: 全球 CDN

---

## 后端部署

### 方案 1: Railway 部署（推荐）

#### 步骤：

1. **准备项目**

在项目根目录创建 `Procfile`:

```
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

或创建 `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **推送到 GitHub**

```bash
git add .
git commit -m "准备部署"
git push origin main
```

3. **在 Railway 上部署**

- 访问 [railway.app](https://railway.app)
- 登录并创建新项目
- 选择 "Deploy from GitHub repo"
- 选择你的仓库
- Railway 会自动检测并部署

4. **配置环境变量**

在 Railway 项目设置中添加所有环境变量（从 `.env` 复制）

5. **获取部署 URL**

部署成功后，Railway 会提供一个 URL，例如：
```
https://your-app.railway.app
```

---

### 方案 2: Docker 部署

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY backend ./backend
COPY frontend ./frontend
COPY .env .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - DASHSCOPE_API_KEY=${DASHSCOPE_API_KEY}
    env_file:
      - .env
    restart: unless-stopped
```

#### 3. 构建和运行

```bash
docker-compose up -d
```

---

### 方案 3: 传统服务器部署

#### 在 Linux 服务器上：

1. **安装依赖**

```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx
```

2. **克隆代码**

```bash
git clone <your-repo>
cd ai-travel-planner
```

3. **设置虚拟环境**

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. **配置 Systemd 服务**

创建 `/etc/systemd/system/travel-planner.service`:

```ini
[Unit]
Description=AI Travel Planner
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/ai-travel-planner
Environment="PATH=/path/to/ai-travel-planner/venv/bin"
ExecStart=/path/to/ai-travel-planner/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

5. **启动服务**

```bash
sudo systemctl daemon-reload
sudo systemctl start travel-planner
sudo systemctl enable travel-planner
```

6. **配置 Nginx 反向代理**

创建 `/etc/nginx/sites-available/travel-planner`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /path/to/ai-travel-planner/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/travel-planner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 前端部署

### 方案 1: Vercel 部署（推荐）

1. **准备配置文件**

创建 `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

2. **部署**

```bash
npm install -g vercel
vercel --prod
```

或直接在 Vercel 网站上导入 GitHub 仓库。

---

### 方案 2: Netlify 部署

1. **创建 netlify.toml**

```toml
[build]
  publish = "frontend"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **部署**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 环境变量配置

### 生产环境环境变量

在部署平台上设置以下环境变量：

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-production-key

# 阿里云百炼
DASHSCOPE_API_KEY=sk-production-key

# 阿里云语音（可选）
ALIYUN_SPEECH_APP_KEY=production-app-key
ALIYUN_ACCESS_KEY_ID=production-access-key
ALIYUN_ACCESS_KEY_SECRET=production-secret

# 高德地图
AMAP_API_KEY=production-amap-key
AMAP_WEB_KEY=production-web-key

# 应用配置
APP_ENV=production
APP_PORT=8000
```

### 安全建议

1. ✅ 生产环境使用独立的 API 密钥
2. ✅ 启用 API 密钥的 IP 白名单
3. ✅ 设置 API 调用限制
4. ✅ 启用 CORS 只允许特定域名
5. ✅ 定期轮换密钥

---

## 域名和 HTTPS

### 1. 配置域名

在域名提供商处添加 DNS 记录：

```
A    @       your-server-ip
A    www     your-server-ip
```

或使用 CNAME：

```
CNAME  @    your-app.railway.app
```

### 2. 启用 HTTPS

#### 使用 Let's Encrypt (服务器部署)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 使用平台自带 SSL

Railway、Vercel、Netlify 等平台会自动配置 HTTPS。

---

## 监控和维护

### 1. 日志监控

```bash
# Systemd 日志
sudo journalctl -u travel-planner -f

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 性能监控

推荐工具：
- **Sentry**: 错误追踪
- **New Relic**: 性能监控
- **Datadog**: 全面监控

### 3. 数据库备份

在 Supabase 控制台启用自动备份。

### 4. 更新部署

```bash
git pull origin main
sudo systemctl restart travel-planner
```

或使用 CI/CD 自动部署。

---

## 性能优化

### 1. 启用缓存

在 Nginx 配置中添加：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. 启用 Gzip

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 3. 使用 CDN

将静态文件部署到 CDN：
- Cloudflare
- AWS CloudFront
- 阿里云 CDN

---

## 故障排查

### 常见问题

1. **502 Bad Gateway**
   - 检查后端服务是否运行
   - 检查端口配置是否正确

2. **API 调用失败**
   - 检查 CORS 配置
   - 检查环境变量是否正确

3. **数据库连接失败**
   - 检查 Supabase URL 和 Key
   - 检查网络连接

4. **语音识别不工作**
   - 检查 HTTPS 是否启用
   - 检查浏览器权限

---

## 成本估算

### 免费方案（适合个人项目）

- **后端**: Railway 免费版 ($5/月额度)
- **前端**: Vercel 免费版
- **数据库**: Supabase 免费版
- **AI**: 阿里云百炼免费额度
- **地图**: 高德地图免费额度

**总计**: 约 $0-5/月

### 小型商用方案

- **后端**: Railway Pro ($20/月)
- **前端**: Vercel Pro ($20/月)
- **数据库**: Supabase Pro ($25/月)
- **AI**: 阿里云百炼按量计费 (~$50/月)
- **地图**: 高德地图按量计费 (~$20/月)

**总计**: 约 $135/月

---

## 下一步

- [ ] 设置 CI/CD 自动部署
- [ ] 配置监控告警
- [ ] 实施备份策略
- [ ] 性能测试和优化
- [ ] 安全审计

祝部署顺利！🚀



