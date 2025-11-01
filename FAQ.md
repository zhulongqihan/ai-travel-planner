# 常见问题解答 (FAQ)

## 安装和配置

### Q1: 如何安装项目依赖？

**A:** 运行以下命令：

```bash
pip install -r requirements.txt
```

如果是 Windows 系统，也可以直接运行 `scripts/setup.bat`。

---

### Q2: .env 文件应该放在哪里？

**A:** `.env` 文件应该放在项目根目录下，与 `run.py` 同级。

```
ai-travel-planner/
├── .env              <- 这里
├── run.py
├── backend/
└── frontend/
```

---

### Q3: 必须配置所有的 API 密钥吗？

**A:** 不是。最小配置只需要：

- `SUPABASE_URL` 和 `SUPABASE_KEY` (数据库和认证)
- `DASHSCOPE_API_KEY` (AI 功能)

其他是可选的：
- 阿里云语音识别 (可用浏览器自带的 Web Speech API 替代)
- 高德地图 (地图功能可选)

---

## 运行问题

### Q4: 启动后显示 "ModuleNotFoundError"

**A:** 确保已安装所有依赖：

```bash
pip install -r requirements.txt
```

如果使用虚拟环境，确保已激活：

```bash
# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

---

### Q5: 访问 http://localhost:8000 显示 404

**A:** 正确的访问地址是：

```
http://localhost:8000/static/index.html
```

或查看 FastAPI 文档：

```
http://localhost:8000/docs
```

---

### Q6: 数据库连接失败

**A:** 检查以下几点：

1. Supabase URL 和 Key 是否正确
2. 是否已在 Supabase 中运行 `database_setup.sql`
3. 网络连接是否正常
4. Supabase 项目是否处于活动状态

---

## 功能问题

### Q7: 语音识别不工作

**A:** 可能的原因：

1. **没有 HTTPS**: 浏览器语音 API 需要 HTTPS 或 localhost
2. **权限未授予**: 检查浏览器麦克风权限
3. **浏览器不支持**: 推荐使用 Chrome、Edge
4. **API 未配置**: 如果使用阿里云语音，需配置相关密钥

解决方案：
- 在 localhost 上测试
- 检查浏览器控制台是否有错误
- 尝试手动输入代替语音

---

### Q8: AI 生成计划失败

**A:** 检查：

1. `DASHSCOPE_API_KEY` 是否正确
2. 是否有足够的 API 额度
3. 网络是否可以访问阿里云服务
4. 查看浏览器控制台和后端日志错误信息

---

### Q9: 生成计划需要很长时间

**A:** 正常情况下需要 10-30 秒。如果太慢：

1. 可以在 `backend/routers/travel.py` 中切换到更快的模型：
   ```python
   model="qwen-turbo"  # 更快，效果稍差
   ```

2. 检查网络延迟
3. 查看 API 服务状态

---

### Q10: 地图不显示

**A:** 

1. 检查是否配置了高德地图 API Key
2. 在 `frontend/index.html` 中替换 Key：
   ```html
   <script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_KEY"></script>
   ```

3. 检查 API Key 是否有调用限制
4. 查看浏览器控制台错误

---

## 账号和数据

### Q11: 如何重置密码？

**A:** 目前需要通过 Supabase 控制台重置：

1. 登录 Supabase 控制台
2. 进入 Authentication > Users
3. 找到用户并重置密码

未来版本会添加前端重置功能。

---

### Q12: 如何删除账号？

**A:** 

1. 登录 Supabase 控制台
2. Authentication > Users
3. 删除对应用户

注意：删除用户会自动删除其所有旅行计划（级联删除）。

---

### Q13: 数据存储在哪里？

**A:** 

- 用户数据：Supabase (云端)
- 登录状态：浏览器 localStorage
- 临时数据：浏览器内存

---

## API 和限制

### Q14: API 调用有限制吗？

**A:** 是的，各服务都有限制：

- **Supabase**: 免费版有请求数限制
- **阿里云百炼**: 按 token 计费
- **高德地图**: 每日调用次数限制
- **语音识别**: 每月免费额度

建议：
- 开发时使用免费额度
- 生产环境监控使用量
- 设置预算告警

---

### Q15: 如何查看 API 使用量？

**A:** 

- **Supabase**: Dashboard > Settings > Usage
- **阿里云**: 费用中心 > 使用明细
- **高德地图**: 控制台 > 数据统计

---

## 部署问题

### Q16: 如何部署到生产环境？

**A:** 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 完整指南。

推荐方案：
- 后端: Railway / Render
- 前端: Vercel / Netlify
- 数据库: Supabase

---

### Q17: 部署后 CORS 错误

**A:** 在 `backend/main.py` 中更新 CORS 配置：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # 替换为实际域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 安全问题

### Q18: API 密钥安全吗？

**A:** 

✅ 安全做法：
- 使用 `.env` 文件存储
- `.env` 已在 `.gitignore` 中
- 不要将 `.env` 提交到 Git

❌ 不安全：
- 直接写在代码中
- 提交到公开仓库
- 在前端暴露密钥

---

### Q19: 如何保护用户数据？

**A:** 

项目已实现：
- Supabase 行级安全 (RLS)
- 用户只能访问自己的数据
- HTTPS 加密传输（生产环境）

---

## 开发问题

### Q20: 如何添加新功能？

**A:** 

1. 后端 API：在 `backend/routers/` 添加新路由
2. 前端：在 `frontend/js/` 添加逻辑
3. 数据库：在 Supabase 添加表或字段
4. 更新文档

查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

---

### Q21: 如何运行测试？

**A:** 

```bash
pytest tests/
```

或使用 VSCode 测试面板。

---

### Q22: 支持哪些浏览器？

**A:** 

推荐：
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

注意：语音功能在某些浏览器可能受限。

---

## 其他问题

### Q23: 项目是开源的吗？

**A:** 是的，采用 MIT 许可证。你可以：

- ✅ 免费使用
- ✅ 修改代码
- ✅ 商业使用
- ✅ 分发

---

### Q24: 可以用于商业项目吗？

**A:** 可以，但需要注意：

- 遵守各 API 服务的使用条款
- 可能需要付费 API 计划
- 建议添加自己的服务条款和隐私政策

---

### Q25: 如何获取更多帮助？

**A:** 

1. 查看项目文档
2. 搜索已有 Issues
3. 创建新 Issue
4. 查看各 API 官方文档

---

## 错误代码

### 常见错误及解决方案

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 401 | 未授权 | 检查登录状态，重新登录 |
| 404 | 资源不存在 | 检查 URL 和资源 ID |
| 422 | 验证错误 | 检查请求参数格式 |
| 500 | 服务器错误 | 查看后端日志 |

---

### 找不到答案？

欢迎在 GitHub Issues 提问！

1. 描述问题
2. 提供错误信息
3. 说明环境（系统、浏览器等）
4. 附上相关日志

---

**更新时间**: 2024-01-15



