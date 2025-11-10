// 主应用逻辑
const API_BASE_URL = "http://localhost:8000/api";

// 全局状态
let currentUser = null;
let currentPlan = null;

// 页面导航
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = e.target.getAttribute("href").substring(1);
    showSection(targetId);

    // 更新活动状态
    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("active"));
    e.target.classList.add("active");
  });
});

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");

  // 加载相应数据
  if (sectionId === "plans" && currentUser) {
    loadUserPlans();
  }
}

// 监听目的地输入，自动定位地图（添加错误处理）
document
  .getElementById("destination")
  .addEventListener("blur", async function () {
    const destination = this.value.trim();
    console.log("🗺️ 目的地输入框失焦，值为:", destination);

    if (destination) {
      console.log("📍 准备定位到:", destination);
      try {
        await locateDestinationOnMap(destination);
        console.log("✅ 地图定位成功:", destination);
      } catch (error) {
        console.log("❌ 地图定位失败:", error);
      }
    } else {
      console.log("⚠️ 目的地为空，跳过定位");
    }
  });

// 旅行计划表单提交
document.getElementById("travelForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("请先登录");
    return;
  }

  const formData = {
    destination: document.getElementById("destination").value,
    days: parseInt(document.getElementById("days").value),
    budget: parseFloat(document.getElementById("planBudget").value),
    travelers: parseInt(document.getElementById("travelers").value),
    preferences: document.getElementById("preferences").value,
    start_date: document.getElementById("start_date").value,
  };

  await generateTravelPlan(formData);
});

// 生成旅行计划
async function generateTravelPlan(formData) {
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const progressMessage = document.getElementById("progressMessage");
  const generateBtn = document.getElementById("generateBtn");

  // 显示进度条，隐藏结果区域
  progressContainer.style.display = "block";
  document.getElementById("resultSection").style.display = "none";
  generateBtn.disabled = true;
  progressBar.style.width = "0%";

  try {
    // 构建查询参数
    const params = new URLSearchParams({
      user_id: currentUser.user_id,
      destination: formData.destination,
      days: formData.days.toString(),
      budget: formData.budget.toString(),
      travelers: formData.travelers.toString(),
      preferences: formData.preferences,
    });

    if (formData.start_date) {
      params.append("start_date", formData.start_date);
    }

    // 使用 EventSource 接收 SSE
    const eventSource = new EventSource(
      `${API_BASE_URL}/travel/plan-stream?${params.toString()}`
    );

    eventSource.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          throw new Error(data.message || data.error);
        }

        if (data.progress !== undefined) {
          progressBar.style.width = data.progress + "%";
          progressMessage.textContent =
            data.message || `进度 ${data.progress}%`;
        }

        if (data.result) {
          // 生成完成
          currentPlan = data.result;
          displayTravelPlan(data.result);
          eventSource.close();
          progressContainer.style.display = "none";
          generateBtn.disabled = false;
        }
      } catch (parseError) {
        console.error("解析错误:", parseError);
        console.error("原始数据:", event.data);
        alert(
          "生成旅行计划失败：" +
            parseError.message +
            "\n请检查控制台查看详细信息"
        );
        eventSource.close();
        progressContainer.style.display = "none";
        generateBtn.disabled = false;
      }
    };

    eventSource.onerror = function (error) {
      console.error("SSE错误:", error);
      alert("生成旅行计划失败，请重试");
      eventSource.close();
      progressContainer.style.display = "none";
      generateBtn.disabled = false;
    };
  } catch (error) {
    console.error("Error:", error);
    alert("生成旅行计划失败：" + error.message);
    progressContainer.style.display = "none";
    generateBtn.disabled = false;
  }
}

// 显示旅行计划
function displayTravelPlan(plan) {
  const resultSection = document.getElementById("resultSection");
  const planResult = document.getElementById("planResult");

  // 获取预估费用（从多个可能的位置获取）
  const estimatedCost =
    plan.estimated_cost || plan.itinerary?.cost_breakdown?.total || "待计算";

  // 计算总天数和总景点数
  let totalActivities = 0;
  let totalRestaurants = 0;
  if (plan.itinerary && plan.itinerary.days) {
    plan.itinerary.days.forEach((day) => {
      if (day.activities) totalActivities += day.activities.length;
      if (day.meals) totalRestaurants += day.meals.length;
    });
  }

  // 提取旅行偏好作为特色标签
  const preferences = plan.preferences || "";
  const featureTags = preferences.split(/[,，、]/).filter(tag => tag.trim()).slice(0, 5);

  // 生成整体计划概览卡片
  let html = `
        <!-- 整体计划概览 -->
        <div class="plan-summary-card">
            <div class="plan-summary-header">
                <div class="plan-summary-title">
                    <h2>✈️ ${plan.destination}精彩之旅</h2>
                    <p>${plan.days}天${plan.days - 1}晚 · ${plan.travelers}人同行</p>
                </div>
                <div class="plan-summary-badge">
                    ${plan.start_date || '待定日期'}
                </div>
            </div>
            
            <div class="plan-summary-stats">
                <div class="stat-item">
                    <span class="stat-icon">📅</span>
                    <div class="stat-label">行程天数</div>
                    <div class="stat-value">${plan.days}天</div>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">💰</span>
                    <div class="stat-label">预算总额</div>
                    <div class="stat-value">¥${plan.budget.toLocaleString()}</div>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">💳</span>
                    <div class="stat-label">预估费用</div>
                    <div class="stat-value">¥${typeof estimatedCost === 'number' ? estimatedCost.toLocaleString() : estimatedCost}</div>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🎯</span>
                    <div class="stat-label">精选景点</div>
                    <div class="stat-value">${totalActivities}个</div>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🍽️</span>
                    <div class="stat-label">美食推荐</div>
                    <div class="stat-value">${totalRestaurants}家</div>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">👥</span>
                    <div class="stat-label">同行人数</div>
                    <div class="stat-value">${plan.travelers}人</div>
                </div>
            </div>
            
            ${featureTags.length > 0 ? `
            <div class="plan-summary-features">
                ${featureTags.map(tag => `<span class="feature-tag">🏷️ ${tag.trim()}</span>`).join('')}
            </div>
            ` : ''}
        </div>

        <!-- 详细行程分割线 -->
        <div style="text-align: center; margin: 2rem 0; color: var(--text-secondary); font-size: 1.1rem; font-weight: 600;">
            📋 详细行程安排
        </div>
    `;

  // 显示每日行程
  if (plan.itinerary && plan.itinerary.days) {
    plan.itinerary.days.forEach((day) => {
      html += `
                <div class="itinerary-day">
                    <h4>第${day.day}天 - ${day.date || ""}</h4>
            `;

      if (day.activities) {
        day.activities.forEach((activity) => {
          html += `
                        <div class="activity">
                            <div class="activity-time">${activity.time}</div>
                            <div class="activity-name">${activity.name}</div>
                            <div class="activity-description">${activity.description}</div>
                            <div class="activity-cost">预估费用：¥${activity.estimated_cost}</div>
                        </div>
                    `;
        });
      }

      if (day.meals) {
        day.meals.forEach((meal) => {
          html += `
                        <div class="activity">
                            <div class="activity-time">${meal.time}</div>
                            <div class="activity-name">${meal.type}: ${meal.restaurant}</div>
                            <div class="activity-description">${meal.cuisine}</div>
                            <div class="activity-cost">预估费用：¥${meal.estimated_cost}</div>
                        </div>
                    `;
        });
      }

      if (day.accommodation) {
        html += `
                    <div class="activity">
                        <div class="activity-name">住宿: ${day.accommodation.name}</div>
                        <div class="activity-description">${day.accommodation.type}</div>
                        <div class="activity-cost">预估费用：¥${day.accommodation.estimated_cost}</div>
                    </div>
                `;
      }

      html += `</div>`;
    });
  }

  // 显示费用明细
  if (plan.itinerary && plan.itinerary.cost_breakdown) {
    const costs = plan.itinerary.cost_breakdown;
    html += `
            <div class="cost-summary">
                <h4>费用明细</h4>
                <div class="cost-item">
                    <span>交通</span>
                    <span>¥${costs.transportation || 0}</span>
                </div>
                <div class="cost-item">
                    <span>住宿</span>
                    <span>¥${costs.accommodation || 0}</span>
                </div>
                <div class="cost-item">
                    <span>餐饮</span>
                    <span>¥${costs.food || 0}</span>
                </div>
                <div class="cost-item">
                    <span>活动</span>
                    <span>¥${costs.activities || 0}</span>
                </div>
                <div class="cost-item">
                    <span>购物</span>
                    <span>¥${costs.shopping || 0}</span>
                </div>
                <div class="cost-item">
                    <span>总计</span>
                    <span>¥${costs.total || 0}</span>
                </div>
            </div>
        `;
  }

  // 显示建议
  if (plan.itinerary && plan.itinerary.tips) {
    html += `
            <div class="tips">
                <h4>旅行建议</h4>
                <ul>
                    ${plan.itinerary.tips
                      .map((tip) => `<li>${tip}</li>`)
                      .join("")}
                </ul>
            </div>
        `;
  }

  planResult.innerHTML = html;
  resultSection.style.display = "block";

  // 通知工具栏计划已更新
  window.dispatchEvent(new CustomEvent('planUpdated', { 
    detail: plan 
  }));

  // 延迟调用地图显示，避免影响主流程（添加错误处理）
  setTimeout(async () => {
    try {
      await showPlanOnMap();
    } catch (error) {
      console.log("地图显示失败，不影响主流程:", error);
    }
  }, 500);
}

// 保存计划
document.getElementById("saveBtn").addEventListener("click", () => {
  if (currentPlan && currentPlan.id) {
    alert("计划已保存！");
    showSection("plans");
    loadUserPlans();
  }
});

// 加载用户计划
async function loadUserPlans() {
  if (!currentUser) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/travel/plans?user_id=${currentUser.user_id}`
    );

    if (!response.ok) {
      throw new Error("加载计划失败");
    }

    const data = await response.json();
    displayUserPlans(data.plans);
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("plansList").innerHTML =
      '<p class="hint">加载计划失败</p>';
  }
}

// 生成计划封面（使用渐变背景，不依赖外部图片）
function generatePlanCoverImage(destination) {
  // 返回 null，让CSS处理渐变背景
  return null;
}

/**
 * 为目的地生成独特的渐变色背景
 * @param {string} destination - 目的地名称
 * @returns {string} CSS渐变背景
 */
function getDestinationGradient(destination) {
  // 精美的渐变色方案库
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 紫色梦幻
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // 粉红浪漫
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // 蓝色清新
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // 绿色生机
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // 橙粉活力
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // 蓝紫神秘
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // 清新糖果
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // 温柔粉色
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // 暖阳橙色
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // 粉蓝渐变
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // 紫蓝渐变
    'linear-gradient(135deg, #f77062 0%, #fe5196 100%)', // 热情红色
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // 金紫渐变
    'linear-gradient(135deg, #e94057 0%, #f27121 100%)', // 火焰橙红
    'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', // 翠绿生机
  ];
  
  // 根据目的地名称生成一个稳定的索引
  const index = destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  
  return gradients[index];
}

/**
 * 为目的地返回代表性的emoji图标
 * @param {string} destination - 目的地名称
 * @returns {string} Emoji图标
 */
function getDestinationIcon(destination) {
  // 特定城市的图标映射
  const iconMap = {
    // 国内城市
    '北京': '🏯',
    '上海': '🏙️',
    '广州': '🌆',
    '深圳': '🏢',
    '杭州': '🌊',
    '南京': '🏛️',
    '成都': '🐼',
    '西安': '🏺',
    '重庆': '🌃',
    '武汉': '🌉',
    '苏州': '🏞️',
    '厦门': '🏖️',
    '青岛': '⛵',
    '大连': '🌅',
    '桂林': '⛰️',
    '三亚': '🏝️',
    '丽江': '🏔️',
    '拉萨': '🕌',
    '哈尔滨': '❄️',
    '昆明': '🌸',
    
    // 国际城市
    '东京': '🗼',
    '京都': '⛩️',
    '大阪': '🏯',
    '首尔': '🏛️',
    '曼谷': '🛕',
    '新加坡': '🦁',
    '巴厘岛': '🌴',
    '巴黎': '🗼',
    '伦敦': '🏰',
    '纽约': '🗽',
    '洛杉矶': '🎬',
    '悉尼': '🎭',
    '罗马': '🏛️',
    '威尼斯': '🚣',
    '迪拜': '🕌',
  };
  
  // 清理名称
  const cleanName = destination.replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, '').trim();
  
  // 查找特定图标
  if (iconMap[cleanName]) {
    return iconMap[cleanName];
  }
  
  // 模糊匹配
  for (const [key, value] of Object.entries(iconMap)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return value;
    }
  }
  
  // 默认图标
  return '✈️';
}

/**
 * 获取精选城市图片（使用真实可访问的图片URL）
 * @param {string} cityName - 城市名称
 * @returns {string|null} 图片URL或null
 */
function getCuratedCityImage(cityName) {
  // 精选图片库 - 使用公开的图片CDN（Unsplash Random API）
  // 这些URL使用Unsplash的特定图片ID，确保图片相关性和稳定性
  const cityImages = {
    // 国内热门城市 - 使用Unsplash的真实照片
    '北京': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&h=600&fit=crop', // 故宫
    '上海': 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=1200&h=600&fit=crop', // 上海外滩
    '广州': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=1200&h=600&fit=crop', // 广州塔
    '深圳': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=1200&h=600&fit=crop', // 现代城市
    '杭州': 'https://images.unsplash.com/photo-1559564484-e48fc5580e39?w=1200&h=600&fit=crop', // 西湖
    '南京': 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1200&h=600&fit=crop', // 南京城市风光
    '成都': 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1200&h=600&fit=crop', // 成都
    '西安': 'https://images.unsplash.com/photo-1604112030934-2f9e7fa8e9c0?w=1200&h=600&fit=crop', // 西安古城
    '重庆': 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1200&h=600&fit=crop', // 重庆夜景
    '武汉': 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1200&h=600&fit=crop', // 武汉
    '苏州': 'https://images.unsplash.com/photo-1589726363344-dddb74c9d8d5?w=1200&h=600&fit=crop', // 苏州园林
    '厦门': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1200&h=600&fit=crop', // 厦门海景
    '青岛': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1200&h=600&fit=crop', // 青岛海滨
    '大连': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1200&h=600&fit=crop', // 大连
    '桂林': 'https://images.unsplash.com/photo-1589726363344-dddb74c9d8d5?w=1200&h=600&fit=crop', // 桂林山水
    '三亚': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop', // 三亚海滩
    '丽江': 'https://images.unsplash.com/photo-1584555684040-bad07f5a8f5e?w=1200&h=600&fit=crop', // 丽江古城
    '拉萨': 'https://images.unsplash.com/photo-1584555684040-bad07f5a8f5e?w=1200&h=600&fit=crop', // 布达拉宫
    
    // 国际城市
    '东京': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop', // 东京城市
    '京都': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=600&fit=crop', // 京都寺庙
    '大阪': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1200&h=600&fit=crop', // 大阪城
    '首尔': 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=1200&h=600&fit=crop', // 首尔
    '曼谷': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&h=600&fit=crop', // 曼谷
    '新加坡': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=600&fit=crop', // 新加坡
    '巴厘岛': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop', // 巴厘岛海滩
    '巴黎': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=600&fit=crop', // 巴黎埃菲尔铁塔
    '伦敦': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=600&fit=crop', // 伦敦
    '纽约': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=600&fit=crop', // 纽约
    '洛杉矶': 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=1200&h=600&fit=crop', // 洛杉矶
    '悉尼': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=600&fit=crop', // 悉尼歌剧院
    '罗马': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=600&fit=crop', // 罗马斗兽场
    '威尼斯': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&h=600&fit=crop', // 威尼斯
    '迪拜': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=600&fit=crop', // 迪拜
  };
  
  // 清理城市名称
  const cleanName = cityName.replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, '').trim();
  
  // 精确匹配
  if (cityImages[cleanName]) {
    return cityImages[cleanName];
  }
  
  // 模糊匹配
  for (const [key, value] of Object.entries(cityImages)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return value;
    }
  }
  
  return null;
}

/**
 * 获取智能关键词（支持中文地名/景点的英文映射）
 * @param {string} name - 地名或景点名称
 * @param {string} context - 上下文 ('destination' 或 'attraction')
 * @returns {string} 编码后的关键词字符串
 */
function getSmartKeywords(name, context = 'destination') {
  // 常见中国城市和景点的英文映射
  const locationMap = {
    // 直辖市
    '北京': 'Beijing,China,Forbidden City,Great Wall',
    '上海': 'Shanghai,China,Bund,Oriental Pearl Tower',
    '天津': 'Tianjin,China',
    '重庆': 'Chongqing,China,mountain city',
    
    // 省会城市
    '南京': 'Nanjing,China,Ming Dynasty,Confucius Temple',
    '杭州': 'Hangzhou,China,West Lake,tea',
    '苏州': 'Suzhou,China,classical gardens,water town',
    '广州': 'Guangzhou,China,Canton Tower',
    '深圳': 'Shenzhen,China,modern city',
    '成都': 'Chengdu,China,panda,Sichuan',
    '西安': 'Xian,China,Terracotta Warriors,ancient city',
    '武汉': 'Wuhan,China,Yangtze River',
    '厦门': 'Xiamen,China,Gulangyu Island,seaside',
    '青岛': 'Qingdao,China,seaside,beer',
    '大连': 'Dalian,China,coastal city',
    '哈尔滨': 'Harbin,China,ice festival,Russian',
    '昆明': 'Kunming,China,spring city,Yunnan',
    '长沙': 'Changsha,China,Hunan',
    '郑州': 'Zhengzhou,China,Henan',
    '济南': 'Jinan,China,springs',
    '合肥': 'Hefei,China,Anhui',
    '南昌': 'Nanchang,China,Jiangxi',
    '福州': 'Fuzhou,China,Fujian',
    '南宁': 'Nanning,China,Guangxi',
    '贵阳': 'Guiyang,China,Guizhou',
    '兰州': 'Lanzhou,China,Yellow River,noodles',
    '西宁': 'Xining,China,Qinghai',
    '银川': 'Yinchuan,China,Ningxia',
    '乌鲁木齐': 'Urumqi,China,Xinjiang',
    '拉萨': 'Lhasa,Tibet,Potala Palace,Buddhism',
    
    // 热门旅游城市
    '丽江': 'Lijiang,China,Old Town,Naxi',
    '桂林': 'Guilin,China,karst landscape,Li River',
    '三亚': 'Sanya,China,tropical beach,Hainan',
    '张家界': 'Zhangjiajie,China,Avatar mountains',
    '黄山': 'Huangshan,Yellow Mountains,China',
    '九寨沟': 'Jiuzhaigou,China,colorful lakes',
    '峨眉山': 'Mount Emei,China,Buddhist',
    
    // 国际城市
    '东京': 'Tokyo,Japan,Shibuya,cherry blossom',
    '京都': 'Kyoto,Japan,temple,traditional',
    '大阪': 'Osaka,Japan,castle,food',
    '首尔': 'Seoul,South Korea,palace',
    '釜山': 'Busan,South Korea,beach',
    '曼谷': 'Bangkok,Thailand,temple,market',
    '清迈': 'Chiang Mai,Thailand,temple',
    '新加坡': 'Singapore,Marina Bay,Gardens',
    '吉隆坡': 'Kuala Lumpur,Malaysia,Petronas Towers',
    '巴厘岛': 'Bali,Indonesia,beach,temple',
    '巴黎': 'Paris,France,Eiffel Tower,Louvre',
    '伦敦': 'London,UK,Big Ben,Tower Bridge',
    '纽约': 'New York,USA,Statue of Liberty,Times Square',
    '洛杉矶': 'Los Angeles,USA,Hollywood',
    '旧金山': 'San Francisco,USA,Golden Gate Bridge',
    '悉尼': 'Sydney,Australia,Opera House,Harbour Bridge',
    '墨尔本': 'Melbourne,Australia',
    '罗马': 'Rome,Italy,Colosseum,Vatican',
    '威尼斯': 'Venice,Italy,canal,gondola',
    '巴塞罗那': 'Barcelona,Spain,Gaudi,Sagrada Familia',
    '阿姆斯特丹': 'Amsterdam,Netherlands,canal',
    '迪拜': 'Dubai,UAE,Burj Khalifa,luxury',
  };
  
  // 清理名称
  const cleanName = name.replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, '').trim();
  
  // 查找映射
  let keywords = '';
  let found = false;
  
  // 精确匹配
  if (locationMap[cleanName]) {
    keywords = locationMap[cleanName];
    found = true;
  } else {
    // 模糊匹配（检查是否包含）
    for (const [key, value] of Object.entries(locationMap)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        keywords = value;
        found = true;
        break;
      }
    }
  }
  
  // 如果没有找到映射，使用原名称+通用关键词
  if (!found) {
    if (context === 'destination') {
      keywords = `${cleanName},travel,city,landscape,architecture,tourism`;
    } else {
      keywords = `${cleanName},attraction,landmark,tourist,scenic`;
    }
  } else {
    // 如果找到映射，添加通用关键词
    if (context === 'destination') {
      keywords += ',travel,landscape';
    } else {
      keywords += ',attraction,landmark';
    }
  }
  
  return encodeURIComponent(keywords);
}

// 显示用户计划列表
function displayUserPlans(plans) {
  const plansList = document.getElementById("plansList");

  if (!plans || plans.length === 0) {
    plansList.innerHTML =
      '<p class="hint">还没有旅行计划，快去创建一个吧！</p>';
    return;
  }

  plansList.innerHTML = plans
    .map(
      (plan) => {
        // 为每个目的地生成独特的渐变色
        const gradient = getDestinationGradient(plan.destination);
        return `
        <div class="plan-card" onclick="viewPlan('${plan.id}')">
            <div class="plan-card-image" style="background: ${gradient}">
                <div class="plan-card-overlay">
                    <div class="destination-icon">${getDestinationIcon(plan.destination)}</div>
                    <h3>${plan.destination}</h3>
                    <p class="destination-subtitle">${plan.days}天 · ${plan.travelers}人同行</p>
                </div>
            </div>
            <div class="plan-card-content">
                <div class="plan-meta">
                    <span>📅 ${plan.days}天</span>
                    <span>💰 ¥${plan.budget}</span>
                    <span>👥 ${plan.travelers}人</span>
                </div>
                ${plan.preferences ? `<p class="plan-preferences">${plan.preferences}</p>` : ''}
                <div class="plan-actions">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); deletePlan('${
                      plan.id
                    }')">删除</button>
                </div>
            </div>
        </div>
    `;
      }
    )
    .join("");
}

// 查看计划详情
async function viewPlan(planId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/travel/plans/${planId}?user_id=${currentUser.user_id}`
    );

    if (!response.ok) {
      throw new Error("加载计划详情失败");
    }

    const plan = await response.json();
    currentPlan = plan;

    displayTravelPlan(plan);
    showSection("home");
  } catch (error) {
    console.error("Error:", error);
    alert("加载计划详情失败");
  }
}

// 删除计划
async function deletePlan(planId) {
  if (!confirm("确定要删除这个计划吗？")) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/travel/plans/${planId}?user_id=${currentUser.user_id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("删除失败");
    }

    alert("删除成功");
    loadUserPlans();
  } catch (error) {
    console.error("Error:", error);
    alert("删除失败");
  }
}

// 显示/隐藏加载动画
function showLoading(show) {
  document.getElementById("loading").style.display = show ? "flex" : "none";
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  // 检查本地存储的登录状态
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForLoggedInUser();
  } else {
    // 未登录时显示登录/注册按钮
    updateUIForLoggedOutUser();
  }
});

// 更新登录后的UI
function updateUIForLoggedInUser() {
  const userInfo = document.getElementById("userInfo");
  const userEmail = document.getElementById("userEmail");
  const authButtons = document.getElementById("authButtons");

  if (userInfo && userEmail) {
    userInfo.style.display = "flex";
    userEmail.textContent = currentUser.email;
  }
  
  // 隐藏登录/注册按钮
  if (authButtons) {
    authButtons.style.display = "none";
  }
}

// 更新登出后的UI
function updateUIForLoggedOutUser() {
  const userInfo = document.getElementById("userInfo");
  const userEmail = document.getElementById("userEmail");
  const authButtons = document.getElementById("authButtons");

  if (userInfo && userEmail) {
    userInfo.style.display = "none";
    userEmail.textContent = "";
  }
  
  // 显示登录/注册按钮
  if (authButtons) {
    authButtons.style.display = "flex";
  }

  currentUser = null;
  localStorage.removeItem("currentUser");
}

// 在主地图上显示旅行计划
async function showPlanOnMap() {
  if (!currentPlan) {
    console.log("没有可显示的旅行计划");
    return;
  }

  // 提取所有景点和活动
  const locations = [];
  const destination = currentPlan.destination;

  // 遍历每一天的行程
  if (currentPlan.itinerary && currentPlan.itinerary.days) {
    for (const day of currentPlan.itinerary.days) {
      // 提取活动
      if (day.activities) {
        day.activities.forEach((activity) => {
          locations.push({
            name: activity.name,
            description: activity.description || "",
            estimated_cost: activity.estimated_cost || 0,
            // 修复：加空格分隔，确保正确搜索地点
            address: `${destination} ${activity.name}`,
            type: "activity",
          });
        });
      }

      // 提取餐厅
      if (day.meals) {
        day.meals.forEach((meal) => {
          locations.push({
            name: meal.restaurant,
            description: `${meal.type}: ${meal.cuisine}`,
            estimated_cost: meal.estimated_cost || 0,
            // 修复：加空格分隔，确保正确搜索地点
            address: `${destination} ${meal.restaurant}`,
            type: "restaurant",
          });
        });
      }

      // 提取住宿
      if (day.accommodation) {
        locations.push({
          name: day.accommodation.name,
          description: day.accommodation.type || "住宿",
          estimated_cost: day.accommodation.estimated_cost || 0,
          // 修复：加空格分隔，确保正确搜索地点
          address: `${destination} ${day.accommodation.name}`,
          type: "hotel",
        });
      }
    }
  }

  if (locations.length === 0) {
    console.log("该旅行计划中没有可显示的地点");
    return;
  }

  // 去重
  const uniqueLocations = [];
  const seenNames = new Set();
  locations.forEach((loc) => {
    if (!seenNames.has(loc.name)) {
      seenNames.add(loc.name);
      uniqueLocations.push(loc);
    }
  });

  console.log(`准备在主地图上显示 ${uniqueLocations.length} 个地点`);

  // 显示地图加载进度条
  const mapProgressContainer = document.getElementById("progressContainer");
  const mapProgressBar = document.getElementById("progressBar");
  const mapProgressMessage = document.getElementById("progressMessage");

  mapProgressContainer.style.display = "block";
  mapProgressMessage.textContent = "正在定位地点...";

  try {
    // 为每个地点获取坐标（使用智能方案）
    const locationsWithCoords = [];
    for (let i = 0; i < uniqueLocations.length; i++) {
      const location = uniqueLocations[i];

      // 更新进度
      const progress = ((i + 1) / uniqueLocations.length) * 100;
      mapProgressBar.style.width = `${progress}%`;
      mapProgressMessage.textContent = `正在定位地点 ${i + 1}/${
        uniqueLocations.length
      }: ${location.name}`;

      try {
        // 使用新的 getLocationCoords 函数（支持三重保障）
        const coords = await getLocationCoords(location.address);
        locationsWithCoords.push({
          ...location,
          location: coords,
        });
        console.log(`✓ ${location.name} - 坐标已获取`);
      } catch (error) {
        console.warn(`❌ 无法定位: ${location.name}`, error.message);
        // 继续处理其他地点，不中断
      }
    }

    // 隐藏进度条
    mapProgressContainer.style.display = "none";

    if (locationsWithCoords.length > 0) {
      // 在主地图上显示
      showLocationsOnMainMap(
        locationsWithCoords,
        `${currentPlan.destination} 旅行路线`
      );
      console.log(`✅ 成功在地图上显示 ${locationsWithCoords.length} 个地点`);

      // 绘制旅行路线
      await drawTravelRoute(locationsWithCoords);
    } else {
      console.warn("⚠️ 没有任何地点成功定位，无法显示地图");
    }
  } catch (error) {
    console.error("❌ 显示地图失败:", error);
    mapProgressContainer.style.display = "none";
  }
}
