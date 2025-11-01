# 🐳 AI 旅行规划师 - Docker 部署指南

本文档提供完整的 Docker 镜像构建、运行和部署说明。

## 📦 快速开始

### 方式一：直接使用预构建镜像（推荐）

```bash
# 1. 下载配置文件
wget https://raw.githubusercontent.com/zhulongqihan/ai-travel-planner/main/docker-compose.yml
wget https://raw.githubusercontent.com/zhulongqihan/ai-travel-planner/main/.env.docker.example

# 2. 配置环境变量
cp .env.docker.example .env.docker
# 编辑 .env.docker 文件，填写你的 API Keys

# 3. 启动服务
docker-compose --env-file .env.docker up -d

# 4. 访问应用
# 浏览器打开 http://localhost:8000
```

### 方式二：从源码构建

```bash
# 1. 克隆项目
git clone https://github.com/zhulongqihan/ai-travel-planner.git
cd ai-travel-planner

# 2. 配置环境变量
cp .env.docker.example .env.docker
# 编辑 .env.docker 文件

# 3. 构建镜像
docker build -t ai-travel-planner:latest .

# 4. 运行容器
docker run -d \
  --name ai-travel-planner \
  -p 8000:8000 \
  --env-file .env.docker \
  ai-travel-planner:latest

# 5. 访问应用
# 浏览器打开 http://localhost:8000
```

## 🔑 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `SUPABASE_URL` | Supabase 项目 URL | https://supabase.com → 项目设置 → API |
| `SUPABASE_KEY` | Supabase 匿名密钥 | 同上 |
| `DASHSCOPE_API_KEY` | 阿里云百炼 API Key | https://dashscope.aliyun.com/ → API-KEY管理 |
| `AMAP_API_KEY` | 高德地图后端 Key | https://lbs.amap.com/ → 应用管理 |
| `AMAP_WEB_KEY` | 高德地图前端 Key | 同上，需要单独创建 |

### 可选的环境变量

| 变量名 | 说明 |
|--------|------|
| `ALIYUN_SPEECH_APP_KEY` | 阿里云语音识别 AppKey |
| `ALIYUN_ACCESS_KEY_ID` | 阿里云 AccessKey ID |
| `ALIYUN_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret |

## 🚀 部署到阿里云镜像仓库

### 1. 创建阿里云镜像仓库

1. 访问 [阿里云容器镜像服务](https://cr.console.aliyun.com/)
2. 创建命名空间（例如：`ai-travel`）
3. 创建镜像仓库（例如：`ai-travel-planner`）
4. 记录仓库地址：`crpi-6mppr7h5m3b03dk6.cn-hangzhou.personal.cr.aliyuncs.com/aitravel/ai-travel-planner`

### 2. 配置 GitHub Secrets

在 GitHub 仓库中设置以下 Secrets：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 添加以下 Secrets：
   - `ALIYUN_REGISTRY_USERNAME`：阿里云账号（用于登录镜像仓库）
   - `ALIYUN_REGISTRY_PASSWORD`：阿里云密码或访问令牌

### 3. 修改 GitHub Actions 配置

编辑 `.github/workflows/docker-build.yml`：

```yaml
env:
  REGISTRY: crpi-6mppr7h5m3b03dk6.cn-hangzhou.personal.cr.aliyuncs.com
  IMAGE_NAME: aitravel/ai-travel-planner
```

### 4. 自动构建和推送

提交代码到 `main` 分支，GitHub Actions 会自动：
- 构建 Docker 镜像
- 推送到阿里云镜像仓库
- 打上版本标签

```bash
git add .
git commit -m "feat: 配置 Docker 自动构建"
git push origin main
```

### 5. 使用发布的镜像

更新 `docker-compose.yml`：

```yaml
services:
  ai-travel-planner:
    image: crpi-6mppr7h5m3b03dk6.cn-hangzhou.personal.cr.aliyuncs.com/aitravel/ai-travel-planner:latest
```

## 📝 Docker 命令参考

### 构建镜像

```bash
# 基础构建
docker build -t ai-travel-planner:latest .

# 指定标签
docker build -t ai-travel-planner:v1.0 .

# 构建并推送到阿里云
docker build -t crpi-6mppr7h5m3b03dk6.cn-hangzhou.personal.cr.aliyuncs.com/aitravel/ai-travel-planner:latest .
docker push crpi-6mppr7h5m3b03dk6.cn-hangzhou.personal.cr.aliyuncs.com/aitravel/ai-travel-planner:latest
```

### 运行容器

```bash
# 基础运行
docker run -d -p 8000:8000 --name ai-travel-planner ai-travel-planner:latest

# 使用环境变量文件
docker run -d -p 8000:8000 --env-file .env.docker --name ai-travel-planner ai-travel-planner:latest

# 挂载日志目录
docker run -d -p 8000:8000 -v ./logs:/app/logs --name ai-travel-planner ai-travel-planner:latest
```

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看容器日志
docker logs ai-travel-planner
docker logs -f ai-travel-planner  # 实时查看

# 进入容器
docker exec -it ai-travel-planner /bin/bash

# 停止容器
docker stop ai-travel-planner

# 启动容器
docker start ai-travel-planner

# 重启容器
docker restart ai-travel-planner

# 删除容器
docker rm ai-travel-planner

# 删除镜像
docker rmi ai-travel-planner:latest
```

### Docker Compose 命令

```bash
# 启动服务
docker-compose --env-file .env.docker up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs
docker-compose logs -f  # 实时查看

# 停止服务
docker-compose stop

# 停止并删除服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build

# 查看服务资源使用
docker-compose stats
```

## 🔍 健康检查

容器内置健康检查，每30秒检查一次服务状态：

```bash
# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' ai-travel-planner

# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' ai-travel-planner | jq
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker logs ai-travel-planner --tail 100

# 检查环境变量
docker exec ai-travel-planner env

# 检查端口占用
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Linux/Mac
```

### 服务无法访问

1. 检查容器是否运行：`docker ps`
2. 检查端口映射：`docker port ai-travel-planner`
3. 检查防火墙设置
4. 检查环境变量配置是否正确

### 镜像构建失败

```bash
# 清理构建缓存
docker builder prune

# 重新构建（不使用缓存）
docker build --no-cache -t ai-travel-planner:latest .

# 查看构建过程
docker build --progress=plain -t ai-travel-planner:latest .
```

## 📊 镜像信息

### 镜像大小优化

当前镜像使用 `python:3.11-slim` 基础镜像，已做以下优化：
- ✅ 使用轻量级基础镜像
- ✅ 多阶段构建
- ✅ 清理 apt 缓存
- ✅ 使用 `.dockerignore` 排除不必要文件

最终镜像大小约：**300-400 MB**

### 查看镜像信息

```bash
# 查看镜像大小
docker images ai-travel-planner

# 查看镜像详细信息
docker inspect ai-travel-planner:latest

# 查看镜像层级
docker history ai-travel-planner:latest
```

## 🌐 生产环境部署建议

### 1. 使用反向代理

```nginx
# Nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 配置 HTTPS

使用 Let's Encrypt 获取免费 SSL 证书：

```bash
certbot --nginx -d your-domain.com
```

### 3. 资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  ai-travel-planner:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### 4. 日志管理

配置日志轮转：

```yaml
services:
  ai-travel-planner:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 📞 技术支持

- 🐛 **问题反馈**：[GitHub Issues](https://github.com/zhulongqihan/ai-travel-planner/issues)
- 📖 **项目文档**：[README.md](https://github.com/zhulongqihan/ai-travel-planner)
- 💬 **讨论交流**：[GitHub Discussions](https://github.com/zhulongqihan/ai-travel-planner/discussions)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**✨ 祝你部署顺利！🚀**

