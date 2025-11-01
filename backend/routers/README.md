# API 路由模块 (Routers)

后端 API 的各个功能模块。

## 📁 模块说明

### 🔐 auth.py - 用户认证
**功能**：用户注册、登录、认证

**主要端点**：
- `POST /api/auth/signup` - 用户注册
- `POST /api/auth/signin` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

**技术**：
- Supabase Authentication
- JWT Token 验证
- 密码加密存储

---

### 🤖 travel.py - AI 旅行规划
**功能**：智能生成旅行行程

**主要端点**：
- `POST /api/travel/generate` - 生成旅行计划（流式）
- `POST /api/travel/plans` - 保存旅行计划
- `GET /api/travel/plans` - 获取用户的所有计划
- `GET /api/travel/plans/{plan_id}` - 获取单个计划详情
- `DELETE /api/travel/plans/{plan_id}` - 删除计划

**核心功能**：
- 🧠 调用阿里云百炼大模型（Qwen）
- 📅 生成详细的每日行程
- 💰 智能费用估算
- 🔄 SSE 流式响应（实时进度）
- 📊 JSON 数据验证和解析

**AI Prompt 工程**：
- 明确指定当前年份（2025）
- 结构化 JSON 输出
- 包含活动、餐饮、住宿建议
- 费用估算和总预算

---

### 🗺️ geocode.py - 地理编码服务
**功能**：地理位置查询和路线规划

**主要端点**：
- `GET /api/geocode/search` - POI 搜索
- `GET /api/geocode/driving-route` - 驾车路线规划

**技术**：
- 高德地图 Web 服务 API
- Polyline 编码/解码
- 多点路线规划
- 错误处理和降级

---

### 🎤 voice.py - 语音识别
**功能**：语音转文字

**主要端点**：
- `POST /api/voice/recognize` - 语音识别

**技术**：
- 阿里云智能语音服务
- WebSocket 实时识别
- 音频格式转换
- 流式结果处理

---

### 📖 parse.py - 语音内容解析
**功能**：解析语音文本，提取旅行信息

**主要端点**：
- `POST /api/parse/voice` - 解析语音文本

**核心功能**：
- 🧠 使用 AI 理解自然语言
- 📊 提取结构化数据：
  - 目的地
  - 天数
  - 预算
  - 人数
  - 日期
  - 偏好

**示例输入**：
```
"我想2025年12月去东京，5天，预算1万元，2人，喜欢美食和动漫"
```

**示例输出**：
```json
{
  "destination": "东京",
  "days": 5,
  "budget": 10000,
  "travelers": 2,
  "start_date": "2025-12-01",
  "preferences": "美食、动漫"
}
```

---

### 💰 budget.py - 预算管理
**功能**：费用记录和分析

**主要端点**：
- `POST /api/budget/expenses` - 添加费用记录
- `GET /api/budget/expenses/{plan_id}` - 获取计划的所有费用
- `DELETE /api/budget/expenses/{expense_id}` - 删除费用记录
- `POST /api/budget/analyze` - AI 预算分析

**核心功能**：
- 📊 分类统计（交通、住宿、餐饮等）
- 📈 预算使用率计算
- 💡 AI 优化建议
- 🎤 支持语音添加费用

---

## 🔧 通用特性

### 错误处理
所有模块统一使用 HTTPException 处理错误：
- 400 - 请求参数错误
- 401 - 未授权
- 404 - 资源不存在
- 500 - 服务器错误

### 认证中间件
除了公开端点（注册、登录），所有 API 都需要：
- Bearer Token 认证
- 用户身份验证
- 数据权限隔离

### 数据验证
使用 Pydantic 模型验证所有输入输出：
- 类型检查
- 必填字段验证
- 数据格式规范

### 异步处理
所有 API 使用 `async/await`：
- 非阻塞 I/O
- 并发请求支持
- 性能优化

## 📝 添加新模块

创建新路由模块的步骤：

1. 在 `routers/` 目录创建新文件
2. 定义 APIRouter
3. 编写端点函数
4. 在 `main.py` 中注册路由

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/your-module", tags=["YourModule"])

@router.get("/endpoint")
async def your_endpoint():
    return {"message": "Hello"}
```

