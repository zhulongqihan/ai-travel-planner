/**
 * 预算管理模块
 * 支持费用记录、预算分析、语音输入等功能
 */

// API_BASE_URL 已在 app.js 中声明，这里不需要重复声明
// 预算模块的局部变量（避免与全局变量冲突）
let budgetCurrentPlanId = null;
let budgetCurrentPlan = null;
let budgetExpenses = [];
let budgetRecognition = null;
let budgetIsRecordingExpense = false;

// 类别图标映射
const CATEGORY_ICONS = {
  交通: "🚗",
  住宿: "🏨",
  餐饮: "🍽️",
  门票: "🎫",
  购物: "🛍️",
  其他: "📦",
};

// 类别颜色映射
const CATEGORY_COLORS = {
  交通: "#3b82f6",
  住宿: "#8b5cf6",
  餐饮: "#f59e0b",
  门票: "#10b981",
  购物: "#ec4899",
  其他: "#6b7280",
};

// 页面加载时初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBudgetPage);
} else {
  // DOM已经加载完成
  initBudgetPage();
}

// 监听导航切换到预算管理页面
document.addEventListener("sectionChanged", (e) => {
  if (e.detail && e.detail.section === "budget") {
    console.log("切换到预算管理页面，刷新数据");
    loadTravelPlansForBudget();
  }
});

// 初始化预算管理页面
async function initBudgetPage() {
  console.log("初始化预算管理页面");

  // 检查必要的DOM元素是否存在
  const budgetPlanSelect = document.getElementById("budgetPlanSelect");
  const expenseForm = document.getElementById("expenseForm");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const voiceBtnExpense = document.getElementById("voiceBtnExpense");

  if (!budgetPlanSelect || !expenseForm || !analyzeBtn || !voiceBtnExpense) {
    console.error("预算管理页面DOM元素未找到，延迟初始化");
    setTimeout(initBudgetPage, 500);
    return;
  }

  // 加载旅行计划列表
  await loadTravelPlansForBudget();

  // 绑定计划选择事件（避免重复绑定）
  if (!budgetPlanSelect.dataset.bound) {
    budgetPlanSelect.addEventListener("change", onPlanSelected);
    budgetPlanSelect.dataset.bound = "true";
  }

  // 绑定费用表单提交（避免重复绑定）
  if (!expenseForm.dataset.bound) {
    expenseForm.addEventListener("submit", handleExpenseSubmit);
    expenseForm.dataset.bound = "true";
  }

  // 绑定AI分析按钮（避免重复绑定）
  if (!analyzeBtn.dataset.bound) {
    analyzeBtn.addEventListener("click", analyzeBudget);
    analyzeBtn.dataset.bound = "true";
  }

  // 初始化语音识别（费用）
  initExpenseVoiceRecognition();
}

// 加载旅行计划列表到下拉框
async function loadTravelPlansForBudget() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("用户未登录");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/travel/plans?user_id=${user.user_id}`
    );

    if (!response.ok) {
      throw new Error("获取旅行计划失败");
    }

    const data = await response.json();
    const plans = data.plans || [];

    const selectElement = document.getElementById("budgetPlanSelect");
    selectElement.innerHTML =
      '<option value="">-- 请选择一个旅行计划 --</option>';

    plans.forEach((plan) => {
      const option = document.createElement("option");
      option.value = plan.id;
      option.textContent = `${plan.destination} - ${plan.days}天 (预算: ¥${plan.budget})`;
      option.dataset.plan = JSON.stringify(plan);
      selectElement.appendChild(option);
    });

    console.log(`加载了 ${plans.length} 个旅行计划`);
  } catch (error) {
    console.error("加载旅行计划失败:", error);
  }
}

// 当选择计划时
async function onPlanSelected(event) {
  const selectElement = event.target;
  const selectedOption = selectElement.options[selectElement.selectedIndex];

  if (!selectedOption.value) {
    // 未选择计划
    document.getElementById("budgetContent").style.display = "none";
    document.getElementById("budgetEmptyState").style.display = "block";
    budgetCurrentPlanId = null;
    budgetCurrentPlan = null;
    return;
  }

  budgetCurrentPlanId = selectedOption.value;
  budgetCurrentPlan = JSON.parse(selectedOption.dataset.plan);

  console.log("选择的计划:", budgetCurrentPlan);

  // 显示预算内容，隐藏空状态
  document.getElementById("budgetContent").style.display = "block";
  document.getElementById("budgetEmptyState").style.display = "none";

  // 加载该计划的费用数据
  await loadExpenses();

  // 刷新预算总览
  refreshBudgetOverview();
}

// 加载费用记录
async function loadExpenses() {
  try {
    const user = await getCurrentUser();
    if (!user || !budgetCurrentPlanId) return;

    const response = await fetch(
      `${API_BASE_URL}/budget/expenses/${budgetCurrentPlanId}?user_id=${user.user_id}`
    );

    if (!response.ok) {
      throw new Error("获取费用记录失败");
    }

    const data = await response.json();
    budgetExpenses = data.expenses || [];

    console.log(`加载了 ${budgetExpenses.length} 条费用记录`);

    // 渲染费用列表
    renderExpensesList();

    // 渲染分类统计
    renderCategoryChart();
  } catch (error) {
    console.error("加载费用记录失败:", error);
    budgetExpenses = [];
  }
}

// 刷新预算总览
function refreshBudgetOverview() {
  if (!budgetCurrentPlan) return;

  const totalBudget = budgetCurrentPlan.budget || 0;
  const totalSpent = budgetExpenses.reduce(
    (sum, exp) => sum + (exp.amount || 0),
    0
  );
  const remaining = totalBudget - totalSpent;

  // 更新显示
  document.getElementById(
    "totalBudget"
  ).textContent = `¥${totalBudget.toLocaleString()}`;
  document.getElementById(
    "totalSpent"
  ).textContent = `¥${totalSpent.toLocaleString()}`;
  document.getElementById(
    "remainingBudget"
  ).textContent = `¥${remaining.toLocaleString()}`;

  // 更新进度条
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const progressFill = document.getElementById("budgetProgressFill");
  progressFill.style.width = `${Math.min(percentage, 100)}%`;

  // 如果超过90%显示警告色
  if (percentage > 90) {
    progressFill.classList.add("warning");
  } else {
    progressFill.classList.remove("warning");
  }

  document.getElementById(
    "budgetProgressText"
  ).textContent = `已使用 ${percentage.toFixed(1)}%`;
}

// 渲染费用列表
function renderExpensesList() {
  const container = document.getElementById("expensesList");

  if (budgetExpenses.length === 0) {
    container.innerHTML = '<p class="hint">暂无费用记录</p>';
    return;
  }

  container.innerHTML = budgetExpenses
    .map((expense) => {
      const icon = CATEGORY_ICONS[expense.category] || "📦";
      const date = expense.date
        ? new Date(expense.date).toLocaleDateString()
        : "未知日期";

      return `
        <div class="expense-item">
          <div class="expense-item-left">
            <div class="expense-category-icon">${icon}</div>
            <div class="expense-details">
              <div class="expense-description">${expense.description}</div>
              <div class="expense-meta">${expense.category} · ${date}</div>
            </div>
          </div>
          <div class="expense-amount">-¥${expense.amount.toLocaleString()}</div>
        </div>
      `;
    })
    .join("");
}

// 渲染分类统计图表
function renderCategoryChart() {
  const container = document.getElementById("categoryChart");

  if (budgetExpenses.length === 0) {
    container.innerHTML = '<p class="hint">暂无统计数据</p>';
    return;
  }

  // 计算各类别总和
  const categoryTotals = {};
  budgetExpenses.forEach((exp) => {
    const category = exp.category || "其他";
    categoryTotals[category] =
      (categoryTotals[category] || 0) + (exp.amount || 0);
  });

  // 找出最大值用于计算百分比
  const maxAmount = Math.max(...Object.values(categoryTotals));

  // 生成图表HTML
  container.innerHTML = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
      const color = CATEGORY_COLORS[category] || "#6b7280";

      return `
        <div class="category-item">
          <div class="category-item-label">${
            CATEGORY_ICONS[category] || "📦"
          } ${category}</div>
          <div class="category-item-bar-container">
            <div class="category-item-bar" style="width: ${percentage}%; background-color: ${color};">
              ¥${amount.toLocaleString()}
            </div>
          </div>
          <div class="category-item-value">¥${amount.toLocaleString()}</div>
        </div>
      `;
    })
    .join("");
}

// 处理费用表单提交
async function handleExpenseSubmit(event) {
  event.preventDefault();

  const user = await getCurrentUser();
  if (!user || !budgetCurrentPlanId) {
    alert("请先登录并选择旅行计划");
    return;
  }

  const category = document.getElementById("expenseCategory").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const description = document.getElementById("expenseDescription").value;
  const date =
    document.getElementById("expenseDate").value ||
    new Date().toISOString().split("T")[0];

  if (!category || !amount || !description) {
    alert("请填写完整的费用信息");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/budget/expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: budgetCurrentPlanId,
        category,
        amount,
        description,
        date,
      }),
    });

    const params = new URLSearchParams({ user_id: user.user_id });
    const fullUrl = `${API_BASE_URL}/budget/expense?${params}`;

    const finalResponse = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: budgetCurrentPlanId,
        category,
        amount,
        description,
        date,
      }),
    });

    if (!finalResponse.ok) {
      throw new Error("添加费用失败");
    }

    alert("费用添加成功！");

    // 清空表单
    document.getElementById("expenseForm").reset();

    // 重新加载费用数据
    await loadExpenses();
    refreshBudgetOverview();
  } catch (error) {
    console.error("添加费用失败:", error);
    alert("添加费用失败: " + error.message);
  }
}

// AI预算分析
async function analyzeBudget() {
  const user = await getCurrentUser();
  if (!user || !budgetCurrentPlanId) {
    alert("请先登录并选择旅行计划");
    return;
  }

  const btn = document.getElementById("analyzeBtn");
  btn.disabled = true;
  btn.textContent = "🤖 AI分析中...";

  try {
    const response = await fetch(
      `${API_BASE_URL}/budget/analysis/${budgetCurrentPlanId}?user_id=${user.user_id}`
    );

    if (!response.ok) {
      throw new Error("获取预算分析失败");
    }

    const analysis = await response.json();

    // 渲染建议列表
    const container = document.getElementById("recommendationsList");

    if (analysis.recommendations && analysis.recommendations.length > 0) {
      container.innerHTML = analysis.recommendations
        .map(
          (rec) => `
          <div class="recommendation-item">
            <div class="recommendation-icon">💡</div>
            <div class="recommendation-text">${rec}</div>
          </div>
        `
        )
        .join("");
    } else {
      container.innerHTML =
        '<p class="hint">暂无AI建议，请先添加一些费用记录</p>';
    }
  } catch (error) {
    console.error("获取预算分析失败:", error);
    alert("获取AI分析失败: " + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "🔍 获取AI分析";
  }
}

// 初始化语音识别（费用）
function initExpenseVoiceRecognition() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    budgetRecognition = new SpeechRecognition();

    budgetRecognition.lang = "zh-CN";
    budgetRecognition.continuous = false;
    budgetRecognition.interimResults = false;

    budgetRecognition.onstart = () => {
      console.log("费用语音识别开始");
      budgetIsRecordingExpense = true;
      const btn = document.getElementById("voiceBtnExpense");
      btn.textContent = "🎤 正在录音...";
      btn.classList.add("recording");
    };

    budgetRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("费用语音识别结果:", transcript);
      parseExpenseVoiceInput(transcript);
    };

    budgetRecognition.onerror = (event) => {
      console.error("费用语音识别错误:", event.error);
      alert("语音识别失败: " + event.error);
    };

    budgetRecognition.onend = () => {
      console.log("费用语音识别结束");
      budgetIsRecordingExpense = false;
      const btn = document.getElementById("voiceBtnExpense");
      btn.textContent = "🎤 语音添加费用";
      btn.classList.remove("recording");
    };

    // 绑定按钮（避免重复绑定）
    const voiceBtn = document.getElementById("voiceBtnExpense");
    if (voiceBtn && !voiceBtn.dataset.voiceInit) {
      voiceBtn.addEventListener("click", () => {
        if (!budgetIsRecordingExpense) {
          try {
            budgetRecognition.start();
          } catch (e) {
            console.error("启动识别失败:", e);
          }
        } else {
          budgetRecognition.stop();
        }
      });
      voiceBtn.dataset.voiceInit = "true";
      console.log("语音识别初始化成功");
    }
  } else {
    console.log("浏览器不支持语音识别");
    const voiceBtn = document.getElementById("voiceBtnExpense");
    if (voiceBtn) {
      voiceBtn.disabled = true;
      voiceBtn.textContent = "🎤 不支持语音识别";
    }
  }
}

// 解析费用语音输入
function parseExpenseVoiceInput(text) {
  console.log("解析费用语音:", text);

  // 简单的正则匹配
  // 示例："吃饭花了200元"、"住宿1000块"、"门票500"

  let category = "其他";
  let amount = null;
  let description = text;

  // 识别类别
  if (text.includes("交通") || text.includes("打车") || text.includes("车费")) {
    category = "交通";
  } else if (
    text.includes("住宿") ||
    text.includes("酒店") ||
    text.includes("宾馆")
  ) {
    category = "住宿";
  } else if (
    text.includes("吃") ||
    text.includes("饭") ||
    text.includes("餐") ||
    text.includes("喝")
  ) {
    category = "餐饮";
  } else if (text.includes("门票") || text.includes("票")) {
    category = "门票";
  } else if (
    text.includes("买") ||
    text.includes("购物") ||
    text.includes("shopping")
  ) {
    category = "购物";
  }

  // 识别金额
  const amountMatch = text.match(/(\d+\.?\d*)\s*(元|块|rmb)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
  }

  // 填充表单
  if (category) {
    document.getElementById("expenseCategory").value = category;
  }

  if (amount) {
    document.getElementById("expenseAmount").value = amount;
  }

  document.getElementById("expenseDescription").value = text;

  // 提示用户
  if (amount && category) {
    alert(
      `✅ 语音识别成功！\n\n类别: ${category}\n金额: ¥${amount}\n说明: ${text}\n\n请检查信息并提交`
    );
  } else {
    alert(`⚠️ 部分识别成功\n\n识别内容: ${text}\n\n请手动补充完整信息后提交`);
  }
}

// 获取当前用户 - 直接使用全局函数，避免递归
async function getCurrentUser() {
  // 直接从 localStorage 获取，不调用全局函数避免递归
  const userStr = localStorage.getItem("currentUser");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("解析用户信息失败:", e);
      return null;
    }
  }
  return null;
}
