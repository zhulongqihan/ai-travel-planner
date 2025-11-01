# 前端应用 (Frontend)

AI 旅行规划师的前端界面，采用原生 HTML/CSS/JavaScript 开发。

## 📋 核心文件

### index.html
- 主页面结构
- 包含所有 UI 组件
- 集成高德地图 API

## 🎨 样式文件 (css/)

### style.css
- **2700+ 行**完整样式系统
- 🎨 现代化 UI 设计（玻璃态、渐变、阴影）
- 🌓 深色/浅色模式支持
- 📱 响应式布局（桌面端和移动端）
- ✨ 丰富的动画效果
- 🎭 CSS 变量设计系统

## 📜 JavaScript 模块 (js/)

### app.js - 主应用逻辑
- 📋 表单处理和验证
- 🤖 调用后端 API 生成旅行计划
- 📊 行程数据展示和渲染
- 🎯 页面导航和状态管理
- 📢 全局事件分发（planUpdated）

### map.js - 地图功能
- 🗺️ 高德地图初始化和控制
- 📍 景点、餐厅、住宿标记
- 🚗 路线规划和绘制
- 🌍 **四层智能地理编码**：
  1. 高德地图 JS API（快速，国内优先）
  2. 内置坐标库（精确匹配知名城市）
  3. 高德地图后端 API（更全面的 POI 搜索）
  4. OpenStreetMap API（国际地点支持）
- 🔍 模糊搜索和智能匹配

### toolbar.js - 工具栏功能
- 📄 导出 PDF（使用浏览器打印）
- 📋 复制行程到剪贴板
- 🖨️ 打印行程单
- 🔗 生成分享链接
- ⬆️ 返回顶部（平滑滚动）
- ❓ 帮助文档弹窗

### auth.js - 用户认证
- 🔐 登录/注册表单处理
- 🔑 Token 管理（LocalStorage）
- 👤 用户状态显示
- 🚪 登出功能

### voice.js - 语音识别
- 🎤 Web Speech API 集成
- 🔊 实时语音转文字
- 📝 自动填充表单
- 🎙️ 录音状态管理

### budget.js - 预算管理
- 💰 费用记录表单
- 📊 分类统计可视化
- 📈 预算进度条
- 💡 AI 分析建议展示

## 🎨 设计特色

### 玻璃态效果 (Glassmorphism)
- 毛玻璃背景
- 半透明卡片
- 模糊滤镜

### 渐变系统
- 主题渐变（紫色系）
- 海洋渐变（蓝色系）
- 日落渐变（橙粉系）

### 动画系统
- `slideInUp` - 从下滑入
- `slideInDown` - 从上滑入
- `slideInRight` - 从右滑入
- `fadeIn` - 淡入
- `shimmer` - 光泽扫过

### 阴影层级
- `shadow-xs` 到 `shadow-2xl`
- `shadow-colored` - 彩色阴影

## 📦 外部依赖

- **高德地图 API 2.0** - 地图展示和路线规划
- **阿里云语音服务** - 语音识别（通过后端）
- **OpenStreetMap Nominatim** - 国际地理编码

## 🔧 配置

### 高德地图 API Key

在 `index.html` 第 17 行：

```html
<script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_KEY"></script>
```

需要配置两个 Key：
1. **JavaScript API Key** - 前端地图显示
2. **Web 服务 Key** - 后端路线规划（在 .env 中）

## 🚀 开发说明

### 文件版本管理

各文件 URL 使用版本参数强制刷新缓存：

```html
<link rel="stylesheet" href="css/style.css?v=32" />
<script src="js/app.js?v=27"></script>
```

修改文件后记得更新版本号！

### 浏览器兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+

### 语音功能限制

- 需要 HTTPS 或 localhost 环境
- 部分浏览器需要用户授权麦克风权限

## 📱 响应式断点

- **桌面端**: > 1024px
- **平板端**: 768px - 1024px
- **移动端**: < 768px

## 🎯 性能优化

- 异步加载地图 API
- 延迟初始化地图（500ms）
- 防抖处理用户输入
- 懒加载计划列表

