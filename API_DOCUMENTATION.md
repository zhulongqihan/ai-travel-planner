# API 文档

AI 旅行规划师后端 API 接口文档。

## 基础信息

- **Base URL**: `http://localhost:8000/api`
- **返回格式**: JSON
- **认证方式**: Bearer Token (Supabase JWT)

## 目录

1. [认证接口](#认证接口)
2. [旅行规划接口](#旅行规划接口)
3. [语音识别接口](#语音识别接口)
4. [预算管理接口](#预算管理接口)

---

## 认证接口

### 1. 用户注册

**POST** `/auth/signup`

注册新用户账号。

#### 请求体

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三"
}
```

#### 响应

```json
{
  "user_id": "uuid-string",
  "email": "user@example.com",
  "access_token": "jwt-token",
  "refresh_token": "refresh-token"
}
```

---

### 2. 用户登录

**POST** `/auth/signin`

用户登录获取访问令牌。

#### 请求体

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 响应

```json
{
  "user_id": "uuid-string",
  "email": "user@example.com",
  "access_token": "jwt-token",
  "refresh_token": "refresh-token"
}
```

---

### 3. 用户登出

**POST** `/auth/signout`

登出当前用户。

#### 响应

```json
{
  "message": "登出成功"
}
```

---

## 旅行规划接口

### 1. 生成旅行计划

**POST** `/travel/plan`

使用 AI 生成个性化旅行计划。

#### 查询参数

- `user_id` (string, required): 用户 ID

#### 请求体

```json
{
  "destination": "日本东京",
  "days": 5,
  "budget": 10000,
  "travelers": 2,
  "preferences": "喜欢美食和动漫文化，带孩子",
  "start_date": "2024-05-01"
}
```

#### 响应

```json
{
  "id": "uuid-string",
  "destination": "日本东京",
  "days": 5,
  "budget": 10000,
  "travelers": 2,
  "preferences": "喜欢美食和动漫文化，带孩子",
  "estimated_cost": 12000,
  "itinerary": {
    "days": [
      {
        "day": 1,
        "date": "第一天",
        "activities": [
          {
            "time": "09:00",
            "type": "景点",
            "name": "浅草寺",
            "description": "东京最古老的寺庙",
            "estimated_cost": 0,
            "location": {
              "lat": 35.7148,
              "lng": 139.7967
            },
            "duration": "2小时"
          }
        ],
        "meals": [
          {
            "time": "12:00",
            "type": "午餐",
            "restaurant": "一兰拉面",
            "cuisine": "日式拉面",
            "estimated_cost": 100
          }
        ],
        "accommodation": {
          "name": "东京湾希尔顿酒店",
          "type": "四星级酒店",
          "estimated_cost": 800
        }
      }
    ],
    "transportation": {
      "outbound": {
        "method": "飞机",
        "cost": 3000
      },
      "local": {
        "method": "地铁+JR",
        "estimated_daily_cost": 100
      },
      "return": {
        "method": "飞机",
        "cost": 3000
      }
    },
    "cost_breakdown": {
      "transportation": 6500,
      "accommodation": 4000,
      "food": 1500,
      "activities": 1000,
      "shopping": 1000,
      "total": 14000
    },
    "tips": [
      "建议购买 JR Pass 通票",
      "提前预订热门餐厅"
    ]
  }
}
```

---

### 2. 获取用户的所有计划

**GET** `/travel/plans`

获取当前用户的所有旅行计划列表。

#### 查询参数

- `user_id` (string, required): 用户 ID

#### 响应

```json
{
  "plans": [
    {
      "id": "uuid-1",
      "destination": "日本东京",
      "days": 5,
      "budget": 10000,
      "travelers": 2,
      "preferences": "美食、动漫",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid-2",
      "destination": "泰国普吉岛",
      "days": 7,
      "budget": 8000,
      "travelers": 2,
      "preferences": "海滩、休闲",
      "created_at": "2024-01-10T10:00:00Z"
    }
  ]
}
```

---

### 3. 获取特定计划详情

**GET** `/travel/plans/{plan_id}`

获取指定旅行计划的详细信息。

#### 路径参数

- `plan_id` (string, required): 计划 ID

#### 查询参数

- `user_id` (string, required): 用户 ID

#### 响应

与"生成旅行计划"的响应格式相同。

---

### 4. 删除计划

**DELETE** `/travel/plans/{plan_id}`

删除指定的旅行计划。

#### 路径参数

- `plan_id` (string, required): 计划 ID

#### 查询参数

- `user_id` (string, required): 用户 ID

#### 响应

```json
{
  "message": "删除成功"
}
```

---

## 语音识别接口

### 1. 语音识别（文件上传）

**POST** `/voice/recognize`

上传音频文件进行语音识别。

#### 请求

Content-Type: `multipart/form-data`

- `audio` (file): 音频文件（支持 wav, mp3, pcm, opus, amr, ogg）

#### 响应

```json
{
  "text": "我想去日本，5天，预算1万元，喜欢美食和动漫",
  "confidence": 0.95
}
```

---

### 2. 语音识别（Base64）

**POST** `/voice/recognize-base64`

使用 Base64 编码的音频数据进行语音识别。

#### 请求体

```json
{
  "audio_base64": "base64-encoded-audio-data",
  "format": "wav"
}
```

#### 响应

```json
{
  "text": "我想去日本，5天，预算1万元，喜欢美食和动漫",
  "confidence": 0.95
}
```

---

## 预算管理接口

### 1. 添加费用记录

**POST** `/budget/expense`

为旅行计划添加实际费用记录。

#### 查询参数

- `user_id` (string, required): 用户 ID

#### 请求体

```json
{
  "plan_id": "uuid-string",
  "category": "交通",
  "amount": 350.00,
  "description": "机场到酒店出租车",
  "date": "2024-05-01"
}
```

#### 响应

```json
{
  "id": "uuid-string",
  "plan_id": "uuid-string",
  "category": "交通",
  "amount": 350.00,
  "description": "机场到酒店出租车",
  "date": "2024-05-01",
  "created_at": "2024-05-01T15:30:00Z"
}
```

---

### 2. 获取计划的所有费用

**GET** `/budget/expenses/{plan_id}`

获取指定计划的所有费用记录。

#### 路径参数

- `plan_id` (string, required): 计划 ID

#### 查询参数

- `user_id` (string, required): 用户 ID

#### 响应

```json
{
  "expenses": [
    {
      "id": "uuid-1",
      "plan_id": "plan-uuid",
      "category": "交通",
      "amount": 350.00,
      "description": "机场到酒店出租车",
      "date": "2024-05-01"
    },
    {
      "id": "uuid-2",
      "plan_id": "plan-uuid",
      "category": "餐饮",
      "amount": 280.00,
      "description": "晚餐",
      "date": "2024-05-01"
    }
  ]
}
```

---

### 3. 预算分析

**GET** `/budget/analysis/{plan_id}`

分析预算使用情况并获取 AI 建议。

#### 路径参数

- `plan_id` (string, required): 计划 ID

#### 查询参数

- `user_id` (string, required): 用户 ID

#### 响应

```json
{
  "total_budget": 10000,
  "total_spent": 6500,
  "remaining": 3500,
  "category_breakdown": {
    "交通": 3500,
    "住宿": 2000,
    "餐饮": 800,
    "活动": 200
  },
  "recommendations": [
    "您的住宿费用低于预算，可以考虑升级酒店或延长住宿时间",
    "餐饮开支较少，可以尝试更多当地特色美食",
    "建议为购物和纪念品预留至少1000元",
    "目前进度良好，剩余预算充足"
  ]
}
```

---

## 错误响应

所有接口在出错时返回以下格式：

```json
{
  "detail": "错误描述信息"
}
```

常见 HTTP 状态码：

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 在线 API 文档

启动服务后，访问以下地址查看交互式 API 文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 示例代码

### JavaScript (Fetch API)

```javascript
// 生成旅行计划
async function createTravelPlan() {
  const response = await fetch('http://localhost:8000/api/travel/plan?user_id=user-uuid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination: '日本东京',
      days: 5,
      budget: 10000,
      travelers: 2,
      preferences: '喜欢美食和动漫',
      start_date: '2024-05-01'
    })
  });
  
  const data = await response.json();
  console.log(data);
}
```

### Python (requests)

```python
import requests

# 生成旅行计划
response = requests.post(
    'http://localhost:8000/api/travel/plan',
    params={'user_id': 'user-uuid'},
    json={
        'destination': '日本东京',
        'days': 5,
        'budget': 10000,
        'travelers': 2,
        'preferences': '喜欢美食和动漫',
        'start_date': '2024-05-01'
    }
)

data = response.json()
print(data)
```

---

## 注意事项

1. 所有需要用户认证的接口都需要提供 `user_id` 参数
2. 日期格式统一使用 ISO 8601: `YYYY-MM-DD`
3. 金额单位统一为人民币元
4. API 调用有频率限制，请合理使用
5. 语音文件大小限制为 10MB

---

更多信息请访问项目 GitHub 仓库。



