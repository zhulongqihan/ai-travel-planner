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
      (plan) => `
        <div class="plan-card" onclick="viewPlan('${plan.id}')">
            <h3>${plan.destination}</h3>
            <div class="plan-meta">
                <span>📅 ${plan.days}天</span>
                <span>💰 ¥${plan.budget}</span>
                <span>👥 ${plan.travelers}人</span>
            </div>
            <p>${plan.preferences || ""}</p>
            <div class="plan-actions">
                <button class="btn btn-secondary" onclick="event.stopPropagation(); deletePlan('${
                  plan.id
                }')">删除</button>
            </div>
        </div>
    `
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
  }
});

// 更新登录后的UI
function updateUIForLoggedInUser() {
  const userInfo = document.getElementById("userInfo");
  const userEmail = document.getElementById("userEmail");

  if (userInfo && userEmail) {
    userInfo.style.display = "flex";
    userEmail.textContent = currentUser.email;
  }
}

// 更新登出后的UI
function updateUIForLoggedOutUser() {
  const userInfo = document.getElementById("userInfo");
  const userEmail = document.getElementById("userEmail");

  if (userInfo && userEmail) {
    userInfo.style.display = "none";
    userEmail.textContent = "";
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
