// 认证相关功能
// API_BASE_URL 已在 app.js 中定义，这里不需要重复声明

// 等待 DOM 加载完成后再绑定事件
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔐 认证模块已加载");
  
  // ==================== 模态框控制 ====================

  // 登录按钮 - 打开登录模态框
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      console.log("点击登录按钮");
      openModal("loginModal");
    });
  }

  // 注册按钮 - 打开注册模态框
  const registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      console.log("点击注册按钮");
      openModal("registerModal");
    });
  }

  // 关闭登录模态框
  const closeLoginModal = document.getElementById("closeLoginModal");
  if (closeLoginModal) {
    closeLoginModal.addEventListener("click", () => {
      closeModal("loginModal");
    });
  }

  // 关闭注册模态框
  const closeRegisterModal = document.getElementById("closeRegisterModal");
  if (closeRegisterModal) {
    closeRegisterModal.addEventListener("click", () => {
      closeModal("registerModal");
    });
  }

  // 切换到注册
  const switchToRegister = document.getElementById("switchToRegister");
  if (switchToRegister) {
    switchToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal("loginModal");
      openModal("registerModal");
    });
  }

  // 切换到登录
  const switchToLogin = document.getElementById("switchToLogin");
  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal("registerModal");
      openModal("loginModal");
    });
  }

  // 点击模态框外部关闭
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });

  // 打开模态框
  function openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
  }

  // 关闭模态框
  function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
  }

  // ==================== 登录功能 ====================

  // 登录表单提交
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("请输入邮箱和密码");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "登录失败");
    }

    // 保存用户信息
    const userData = {
      user_id: data.user_id,
      email: data.email,
      token: data.access_token,
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));
    currentUser = userData;

    // 更新UI
    updateUIForLoggedInUser();
    closeModal("loginModal");

    // 清空表单
    document.getElementById("loginForm").reset();

    alert("登录成功！");
  } catch (error) {
    console.error("登录错误:", error);
      alert("登录失败: " + error.message);
    }
    });
  }

  // ==================== 注册功能 ====================

  // 注册表单提交
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const passwordConfirm = document.getElementById("registerPasswordConfirm").value;

  // 验证
  if (!email || !password || !passwordConfirm) {
    alert("请填写所有字段");
    return;
  }

  if (password.length < 6) {
    alert("密码至少需要6位");
    return;
  }

  if (password !== passwordConfirm) {
    alert("两次输入的密码不一致");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "注册失败");
    }

    // 注册成功后自动登录
    const userData = {
      user_id: data.user_id,
      email: data.email,
      token: data.access_token,
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));
    currentUser = userData;

    // 更新UI
    updateUIForLoggedInUser();
    closeModal("registerModal");

    // 清空表单
    document.getElementById("registerForm").reset();

    alert("注册成功！欢迎使用AI旅行规划师！");
  } catch (error) {
    console.error("注册错误:", error);
      alert("注册失败: " + error.message);
    }
    });
  }

  // ==================== 退出登录 ====================

  // 退出登录
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("确定要退出登录吗？")) {
        localStorage.removeItem("currentUser");
        currentUser = null;
        updateUIForLoggedOutUser();
        showSection("home");
        alert("已退出登录");
      }
    });
  }
}); // 关闭 DOMContentLoaded

// ==================== 工具函数 ====================

// 获取当前用户（导出到全局作用域供其他模块使用）
window.getCurrentUser = async function () {
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
};


