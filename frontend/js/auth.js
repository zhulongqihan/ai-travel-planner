// 认证相关功能

// 退出登录
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showSection("home");
  document.getElementById("userInfo").style.display = "none";
});

// 获取当前用户（导出到全局作用域供其他模块使用）
window.getCurrentUser = async function() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('解析用户信息失败:', e);
            return null;
        }
    }
    return null;
};


