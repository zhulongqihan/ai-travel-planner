# 贡献指南

感谢你对 AI 旅行规划师项目的关注！我们欢迎所有形式的贡献。

## 如何贡献

### 报告 Bug

如果发现 Bug，请创建 Issue 并包含：

1. Bug 的详细描述
2. 复现步骤
3. 预期行为
4. 实际行为
5. 环境信息（浏览器、操作系统等）
6. 错误日志或截图

### 提出功能建议

1. 创建 Issue，标题以 `[Feature Request]` 开头
2. 详细描述功能需求和使用场景
3. 如果可能，提供设计方案或示例

### 提交代码

#### 1. Fork 项目

点击项目页面的 Fork 按钮。

#### 2. 克隆仓库

```bash
git clone https://github.com/your-username/ai-travel-planner.git
cd ai-travel-planner
```

#### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
```

分支命名规范：
- `feature/xxx`: 新功能
- `fix/xxx`: Bug 修复
- `docs/xxx`: 文档更新
- `refactor/xxx`: 代码重构

#### 4. 进行修改

- 遵循项目代码风格
- 添加必要的注释
- 更新相关文档

#### 5. 提交更改

```bash
git add .
git commit -m "feat: 添加新功能描述"
```

提交信息规范：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

#### 6. 推送到 GitHub

```bash
git push origin feature/your-feature-name
```

#### 7. 创建 Pull Request

1. 访问你的 Fork 仓库
2. 点击 "New Pull Request"
3. 填写 PR 标题和描述
4. 等待审核

## 代码规范

### Python 代码

- 遵循 PEP 8 规范
- 使用类型注解
- 添加文档字符串
- 函数名使用 snake_case
- 类名使用 PascalCase

示例：

```python
from typing import List, Optional

def calculate_total_cost(items: List[dict], discount: Optional[float] = None) -> float:
    """
    计算总费用
    
    Args:
        items: 费用项目列表
        discount: 折扣比例（可选）
    
    Returns:
        总费用
    """
    total = sum(item.get('amount', 0) for item in items)
    
    if discount:
        total *= (1 - discount)
    
    return round(total, 2)
```

### JavaScript 代码

- 使用 ES6+ 语法
- 使用 const/let 而非 var
- 函数使用驼峰命名
- 添加 JSDoc 注释

示例：

```javascript
/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    // 实现...
}
```

### CSS 代码

- 使用有意义的类名
- 遵循 BEM 命名规范
- 使用 CSS 变量定义颜色和尺寸

## 项目结构

```
ai-travel-planner/
├── backend/              # 后端代码
│   ├── main.py          # 入口文件
│   ├── database.py      # 数据库操作
│   ├── config.py        # 配置管理
│   └── routers/         # API 路由
├── frontend/            # 前端代码
│   ├── index.html       # 主页面
│   ├── css/             # 样式文件
│   └── js/              # JavaScript 文件
├── docs/                # 文档
└── tests/               # 测试文件
```

## 开发环境设置

### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 运行

```bash
python run.py
```

### 测试

```bash
pytest tests/
```

## 文档

所有新功能都应该更新相关文档：

- README.md: 项目概述和快速开始
- API_DOCUMENTATION.md: API 接口文档
- SETUP_GUIDE.md: 配置指南
- DEPLOYMENT.md: 部署指南

## 审核标准

Pull Request 会根据以下标准审核：

1. ✅ 代码质量和风格
2. ✅ 功能完整性
3. ✅ 测试覆盖
4. ✅ 文档更新
5. ✅ 无冲突和错误
6. ✅ 提交信息清晰

## 行为准则

- 尊重所有贡献者
- 提供建设性的反馈
- 接受不同的观点
- 专注于对项目最有利的方案

## 获得帮助

如有问题，可以：

1. 查看现有 Issues
2. 阅读项目文档
3. 创建新的 Issue 提问

## 许可证

贡献的代码将采用项目相同的 MIT 许可证。

感谢你的贡献！🎉



