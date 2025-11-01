// 侧边工具栏功能
(function() {
  let currentPlan = null;

  // 监听全局事件，获取当前计划
  window.addEventListener('planUpdated', (e) => {
    currentPlan = e.detail;
    console.log('📋 工具栏已更新当前计划', currentPlan);
  });

  // ========== 导出为PDF ==========
  document.getElementById('exportPdfBtn').addEventListener('click', async () => {
    if (!currentPlan) {
      showToast('⚠️ 请先生成一个旅行计划', 'warning');
      return;
    }

    try {
      showToast('📄 正在生成PDF...', 'info');
      
      // 使用浏览器打印功能（模拟PDF导出）
      const printContent = generatePrintContent(currentPlan);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        showToast('✅ PDF已准备就绪，请在打印对话框中选择"另存为PDF"', 'success');
      }, 500);
    } catch (error) {
      console.error('导出PDF失败:', error);
      showToast('❌ 导出失败，请重试', 'error');
    }
  });

  // ========== 复制行程 ==========
  document.getElementById('copyPlanBtn').addEventListener('click', async () => {
    if (!currentPlan) {
      showToast('⚠️ 请先生成一个旅行计划', 'warning');
      return;
    }

    try {
      const text = generatePlanText(currentPlan);
      await navigator.clipboard.writeText(text);
      showToast('✅ 行程已复制到剪贴板', 'success');
      
      // 添加按钮动画反馈
      const btn = document.getElementById('copyPlanBtn');
      btn.style.transform = 'translateX(-5px) scale(1.2)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 300);
    } catch (error) {
      console.error('复制失败:', error);
      showToast('❌ 复制失败，请重试', 'error');
    }
  });

  // ========== 打印行程 ==========
  document.getElementById('printPlanBtn').addEventListener('click', () => {
    if (!currentPlan) {
      showToast('⚠️ 请先生成一个旅行计划', 'warning');
      return;
    }

    try {
      const printContent = generatePrintContent(currentPlan);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('打印失败:', error);
      showToast('❌ 打印失败，请重试', 'error');
    }
  });

  // ========== 分享行程 ==========
  document.getElementById('sharePlanBtn').addEventListener('click', () => {
    if (!currentPlan) {
      showToast('⚠️ 请先生成一个旅行计划', 'warning');
      return;
    }

    // 生成分享链接（实际项目中应该是服务器生成的唯一链接）
    const shareUrl = generateShareUrl(currentPlan);
    document.getElementById('shareLink').value = shareUrl;
    document.getElementById('shareModal').style.display = 'flex';
  });

  // 复制分享链接
  document.getElementById('copyShareLink').addEventListener('click', async () => {
    const shareLink = document.getElementById('shareLink').value;
    try {
      await navigator.clipboard.writeText(shareLink);
      showToast('✅ 分享链接已复制', 'success');
    } catch (error) {
      showToast('❌ 复制失败，请重试', 'error');
    }
  });

  // 通过邮件分享
  document.getElementById('shareViaEmail').addEventListener('click', () => {
    const subject = encodeURIComponent(`我的${currentPlan.destination}旅行计划`);
    const body = encodeURIComponent(`查看我的旅行计划：${document.getElementById('shareLink').value}\n\n${generatePlanText(currentPlan)}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  });

  // 二维码分享
  document.getElementById('shareViaQR').addEventListener('click', () => {
    showToast('📱 二维码功能开发中...', 'info');
  });

  // 关闭分享弹窗
  document.getElementById('closeShareModal').addEventListener('click', () => {
    document.getElementById('shareModal').style.display = 'none';
  });

  // 点击弹窗外部关闭
  document.getElementById('shareModal').addEventListener('click', (e) => {
    if (e.target.id === 'shareModal') {
      document.getElementById('shareModal').style.display = 'none';
    }
  });

  // ========== 返回顶部 ==========
  document.getElementById('backToTopBtn').addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // 添加按钮动画
    const btn = document.getElementById('backToTopBtn');
    btn.style.transform = 'translateX(-5px) scale(1.2)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 300);
  });

  // ========== 帮助中心 ==========
  document.getElementById('helpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').style.display = 'flex';
  });

  // 关闭帮助弹窗
  document.getElementById('closeHelpModal').addEventListener('click', () => {
    document.getElementById('helpModal').style.display = 'none';
  });

  // 点击弹窗外部关闭
  document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
      document.getElementById('helpModal').style.display = 'none';
    }
  });

  // ========== 工具函数 ==========

  // 生成行程文本
  function generatePlanText(plan) {
    let text = `🌍 ${plan.destination}旅行计划\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📅 出发日期：${plan.start_date || '待定'}\n`;
    text += `⏱️ 行程天数：${plan.days}天${plan.days - 1}晚\n`;
    text += `💰 预算：¥${plan.budget.toLocaleString()}\n`;
    text += `👥 同行人数：${plan.travelers}人\n\n`;

    if (plan.itinerary && plan.itinerary.length > 0) {
      plan.itinerary.forEach((day, index) => {
        text += `📍 第${index + 1}天 - ${day.date || ''}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        // 早餐
        if (day.meals && day.meals.breakfast) {
          text += `🍳 早餐：${day.meals.breakfast.restaurant}\n`;
          text += `   ${day.meals.breakfast.description}\n`;
          if (day.meals.breakfast.estimated_cost) {
            text += `   预估：¥${day.meals.breakfast.estimated_cost}\n`;
          }
          text += '\n';
        }

        // 活动
        if (day.activities && day.activities.length > 0) {
          day.activities.forEach((activity, i) => {
            text += `🎯 活动${i + 1}：${activity.name}\n`;
            if (activity.time) text += `   ⏰ ${activity.time}\n`;
            text += `   📝 ${activity.description}\n`;
            if (activity.estimated_cost) {
              text += `   💳 预估：¥${activity.estimated_cost}\n`;
            }
            text += '\n';
          });
        }

        // 午餐
        if (day.meals && day.meals.lunch) {
          text += `🍽️ 午餐：${day.meals.lunch.restaurant}\n`;
          text += `   ${day.meals.lunch.description}\n`;
          if (day.meals.lunch.estimated_cost) {
            text += `   预估：¥${day.meals.lunch.estimated_cost}\n`;
          }
          text += '\n';
        }

        // 晚餐
        if (day.meals && day.meals.dinner) {
          text += `🍜 晚餐：${day.meals.dinner.restaurant}\n`;
          text += `   ${day.meals.dinner.description}\n`;
          if (day.meals.dinner.estimated_cost) {
            text += `   预估：¥${day.meals.dinner.estimated_cost}\n`;
          }
          text += '\n';
        }

        // 住宿
        if (day.accommodation) {
          text += `🏨 住宿：${day.accommodation.name}\n`;
          text += `   📝 ${day.accommodation.description}\n`;
          if (day.accommodation.estimated_cost) {
            text += `   💳 预估：¥${day.accommodation.estimated_cost}\n`;
          }
          text += '\n';
        }

        text += '\n';
      });
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ 由 AI旅行规划师 生成\n`;
    text += `🌐 ${window.location.origin}\n`;

    return text;
  }

  // 生成打印内容
  function generatePrintContent(plan) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${plan.destination}旅行计划</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 3px solid #667eea;
    }
    .header h1 {
      font-size: 2rem;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    .header .meta {
      color: #666;
      font-size: 0.9rem;
    }
    .summary {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .summary-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .summary-item strong {
      color: #667eea;
    }
    .day-section {
      margin-bottom: 2rem;
      page-break-inside: avoid;
    }
    .day-title {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .activity-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .activity-title {
      font-size: 1.1rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 0.5rem;
    }
    .activity-description {
      color: #666;
      margin-bottom: 0.5rem;
    }
    .activity-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #999;
    }
    .footer {
      text-align: center;
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
      color: #999;
      font-size: 0.9rem;
    }
    @media print {
      body {
        padding: 1rem;
      }
      .activity-card {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌍 ${plan.destination}旅行计划</h1>
    <div class="meta">由 AI旅行规划师 生成 | ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="summary">
    <div class="summary-item">
      <span>📅</span>
      <span><strong>出发日期：</strong>${plan.start_date || '待定'}</span>
    </div>
    <div class="summary-item">
      <span>⏱️</span>
      <span><strong>行程天数：</strong>${plan.days}天${plan.days - 1}晚</span>
    </div>
    <div class="summary-item">
      <span>💰</span>
      <span><strong>预算：</strong>¥${plan.budget.toLocaleString()}</span>
    </div>
    <div class="summary-item">
      <span>👥</span>
      <span><strong>同行人数：</strong>${plan.travelers}人</span>
    </div>
  </div>

  ${plan.itinerary && plan.itinerary.length > 0 ? plan.itinerary.map((day, index) => `
    <div class="day-section">
      <div class="day-title">📍 第${index + 1}天 ${day.date || ''}</div>
      
      ${day.meals && day.meals.breakfast ? `
        <div class="activity-card">
          <div class="activity-title">🍳 早餐：${day.meals.breakfast.restaurant}</div>
          <div class="activity-description">${day.meals.breakfast.description}</div>
          ${day.meals.breakfast.estimated_cost ? `<div class="activity-meta"><span>💳 预估：¥${day.meals.breakfast.estimated_cost}</span></div>` : ''}
        </div>
      ` : ''}

      ${day.activities && day.activities.length > 0 ? day.activities.map((activity, i) => `
        <div class="activity-card">
          <div class="activity-title">🎯 ${activity.name}</div>
          <div class="activity-description">${activity.description}</div>
          <div class="activity-meta">
            ${activity.time ? `<span>⏰ ${activity.time}</span>` : ''}
            ${activity.estimated_cost ? `<span>💳 预估：¥${activity.estimated_cost}</span>` : ''}
          </div>
        </div>
      `).join('') : ''}

      ${day.meals && day.meals.lunch ? `
        <div class="activity-card">
          <div class="activity-title">🍽️ 午餐：${day.meals.lunch.restaurant}</div>
          <div class="activity-description">${day.meals.lunch.description}</div>
          ${day.meals.lunch.estimated_cost ? `<div class="activity-meta"><span>💳 预估：¥${day.meals.lunch.estimated_cost}</span></div>` : ''}
        </div>
      ` : ''}

      ${day.meals && day.meals.dinner ? `
        <div class="activity-card">
          <div class="activity-title">🍜 晚餐：${day.meals.dinner.restaurant}</div>
          <div class="activity-description">${day.meals.dinner.description}</div>
          ${day.meals.dinner.estimated_cost ? `<div class="activity-meta"><span>💳 预估：¥${day.meals.dinner.estimated_cost}</span></div>` : ''}
        </div>
      ` : ''}

      ${day.accommodation ? `
        <div class="activity-card">
          <div class="activity-title">🏨 住宿：${day.accommodation.name}</div>
          <div class="activity-description">${day.accommodation.description}</div>
          ${day.accommodation.estimated_cost ? `<div class="activity-meta"><span>💳 预估：¥${day.accommodation.estimated_cost}</span></div>` : ''}
        </div>
      ` : ''}
    </div>
  `).join('') : '<p>暂无行程信息</p>'}

  <div class="footer">
    ✨ 祝您旅途愉快！| 🌐 ${window.location.origin}
  </div>
</body>
</html>
    `;
  }

  // 生成分享链接
  function generateShareUrl(plan) {
    // 实际项目中应该调用后端API生成唯一链接
    const planId = Date.now().toString(36);
    return `${window.location.origin}/?share=${planId}`;
  }

  // 显示提示消息
  function showToast(message, type = 'info') {
    // 检查是否有全局的showToast函数
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }

    // 如果没有，创建一个简单的提示
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideInDown 0.3s ease-out;
      font-weight: 600;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutUp 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  console.log('✅ 侧边工具栏已初始化');
})();

