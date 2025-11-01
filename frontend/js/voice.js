// 语音识别功能 - 使用浏览器内置 Web Speech API
console.log("✅ 语音识别模块加载成功 - 使用浏览器原生API + AI智能解析");

let recognition = null;
let isRecording = false;

const voiceBtn = document.getElementById("voiceBtn");

// 创建识别状态提示框
function createRecognitionDialog() {
  // 检查是否已存在
  let dialog = document.getElementById("recognitionDialog");
  if (dialog) {
    return dialog;
  }

  dialog = document.createElement("div");
  dialog.id = "recognitionDialog";
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 10000;
    min-width: 400px;
    max-width: 600px;
    display: none;
  `;

  dialog.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">🎤</div>
      <h3 style="margin: 0 0 10px 0; color: #333;">语音识别中...</h3>
      <div id="recognitionStatus" style="color: #666; margin-bottom: 15px;">请开始说话</div>
      
      <!-- 语音输入提示 -->
      <div style="
        background: #e3f2fd;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #1976d2;
        text-align: left;
      ">
        <strong>📝 建议格式：</strong><br>
        我想去<strong>[目的地]</strong>，<strong>[天数]</strong>天，预算<strong>[金额]</strong>元，<strong>[人数]</strong>人，喜欢<strong>[偏好]</strong><br><br>
        <strong>✅ 示例：</strong><br>
        "我想去<span style="color:#e91e63">日本</span>，<span style="color:#e91e63">5</span>天，预算<span style="color:#e91e63">1万</span>元，<span style="color:#e91e63">2</span>人，喜欢<span style="color:#e91e63">美食和动漫</span>"
      </div>
      
      <div id="recognitionText" style="
        background: #f5f5f5;
        padding: 15px;
        border-radius: 8px;
        min-height: 60px;
        color: #333;
        font-size: 16px;
        margin-bottom: 15px;
        font-weight: 500;
      ">等待识别...</div>
      <button id="stopRecognitionBtn" style="
        background: #ff4444;
        color: white;
        border: none;
        padding: 10px 30px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      ">停止识别</button>
    </div>
  `;

  document.body.appendChild(dialog);
  return dialog;
}

// 显示/隐藏识别对话框
function showRecognitionDialog(show) {
  const dialog = createRecognitionDialog();
  dialog.style.display = show ? "block" : "none";

  if (show) {
    document.getElementById("recognitionText").textContent = "等待识别...";
    document.getElementById("recognitionStatus").textContent = "请开始说话";
  }
}

// 更新识别内容
function updateRecognitionText(text, isFinal = false) {
  const textElement = document.getElementById("recognitionText");
  const statusElement = document.getElementById("recognitionStatus");

  if (textElement) {
    textElement.textContent = text || "等待识别...";
    statusElement.textContent = isFinal ? "识别完成" : "正在识别...";
    console.log(`📝 ${isFinal ? "最终" : "临时"}识别结果:`, text);
  }
}

// 初始化语音识别
function initSpeechRecognition() {
  console.log("🔍 检查浏览器语音识别支持...");

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    console.log("✅ 浏览器支持语音识别");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.lang = "zh-CN"; // 中文识别
    recognition.continuous = false; // 单次识别
    recognition.interimResults = true; // 启用中间结果，实时显示
    recognition.maxAlternatives = 1;

    console.log("⚙️ 语音识别配置:", {
      lang: recognition.lang,
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
    });

    recognition.onstart = () => {
      console.log("▶️ 语音识别已启动");
      isRecording = true;
      voiceBtn.textContent = "🔴 正在听...";
      voiceBtn.classList.add("recording");
      showRecognitionDialog(true);
    };

    recognition.onresult = (event) => {
      console.log("📊 收到识别结果事件:", event);

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;

        console.log(`结果 ${i}:`, {
          text: transcript,
          isFinal: isFinal,
          confidence: event.results[i][0].confidence,
        });

        updateRecognitionText(transcript, isFinal);

        if (isFinal) {
          console.log("✅ 最终识别结果:", transcript);
          setTimeout(() => {
            showRecognitionDialog(false);
            parseVoiceInput(transcript);
          }, 1000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ 语音识别错误:", event.error, event);
      isRecording = false;
      voiceBtn.textContent = "🎤 点击开始语音输入";
      voiceBtn.classList.remove("recording");
      showRecognitionDialog(false);

      let errorMsg = "语音识别失败";
      switch (event.error) {
        case "no-speech":
          errorMsg = "没有检测到语音，请重试";
          break;
        case "audio-capture":
          errorMsg = "无法访问麦克风";
          break;
        case "not-allowed":
          errorMsg = "麦克风权限被拒绝，请在浏览器设置中允许麦克风访问";
          break;
        case "network":
          errorMsg = "网络错误，请检查网络连接";
          break;
        default:
          errorMsg = `语音识别错误: ${event.error}`;
      }
      alert(errorMsg);
    };

    recognition.onend = () => {
      console.log("⏹️ 语音识别已结束");
      isRecording = false;
      voiceBtn.textContent = "🎤 点击开始语音输入";
      voiceBtn.classList.remove("recording");

      // 延迟隐藏对话框，让用户看到最终结果
      setTimeout(() => {
        showRecognitionDialog(false);
      }, 1500);
    };

    return true;
  } else {
    console.error("❌ 浏览器不支持语音识别");
    return false;
  }
}

// 初始化语音识别
const speechSupported = initSpeechRecognition();

// 绑定停止按钮
document.addEventListener("click", (e) => {
  if (e.target.id === "stopRecognitionBtn") {
    console.log("🛑 用户点击停止按钮");
    if (recognition && isRecording) {
      recognition.stop();
    }
  }
});

voiceBtn.addEventListener("click", async () => {
  console.log("🖱️ 语音按钮被点击, speechSupported:", speechSupported);

  if (!speechSupported) {
    alert(
      "您的浏览器不支持语音识别功能\n\n请使用以下浏览器：\n• Chrome (推荐)\n• Edge\n• Safari"
    );
    return;
  }

  if (!isRecording) {
    try {
      console.log("▶️ 尝试启动语音识别...");
      recognition.start();
    } catch (error) {
      console.error("❌ 启动语音识别失败:", error);
      // 如果已经在运行，先停止再启动
      if (error.message && error.message.includes("started")) {
        console.log("⚠️ 识别已在运行，先停止再启动");
        recognition.stop();
        setTimeout(() => {
          recognition.start();
        }, 100);
      } else {
        alert("启动语音识别失败，请重试: " + error.message);
      }
    }
  } else {
    console.log("⏹️ 停止语音识别");
    recognition.stop();
  }
});

// AI智能解析语音识别文本
async function parseVoiceInput(text) {
  console.log("🤖 开始AI智能解析识别结果:", text);

  try {
    // 调用后端AI解析API
    const response = await fetch(`${API_BASE_URL}/parse/voice-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error("AI解析失败");
    }

    const parsedData = await response.json();
    console.log("✅ AI解析结果:", parsedData);

    let fieldsFound = [];

    // 填充目的地
    if (parsedData.destination) {
      document.getElementById("destination").value = parsedData.destination;
      fieldsFound.push(`目的地: ${parsedData.destination}`);
      console.log("📍 目的地:", parsedData.destination);
    }

    // 填充天数
    if (parsedData.days) {
      document.getElementById("days").value = parsedData.days;
      fieldsFound.push(`天数: ${parsedData.days}天`);
      console.log("📅 天数:", parsedData.days);
    }

    // 填充预算
    if (parsedData.budget) {
      document.getElementById("planBudget").value = parsedData.budget;
      fieldsFound.push(`预算: ${parsedData.budget}元`);
      console.log("💰 预算:", parsedData.budget);
    }

    // 填充人数
    if (parsedData.travelers) {
      document.getElementById("travelers").value = parsedData.travelers;
      fieldsFound.push(`人数: ${parsedData.travelers}人`);
      console.log("👥 人数:", parsedData.travelers);
    }

    // 填充偏好
    if (parsedData.preferences) {
      document.getElementById("preferences").value = parsedData.preferences;
      fieldsFound.push(`偏好: ${parsedData.preferences}`);
      console.log("❤️ 偏好:", parsedData.preferences);
    }

    // 填充出发日期
    if (parsedData.start_date) {
      document.getElementById("start_date").value = parsedData.start_date;
      fieldsFound.push(`出发日期: ${parsedData.start_date}`);
      console.log("📅 出发日期:", parsedData.start_date);
    }

    console.log("✅ AI解析完成，提取字段:", fieldsFound);

    // 显示识别的原始文本和提取结果
    let resultMessage;

    if (fieldsFound.length > 0) {
      resultMessage = `✅ AI智能解析完成！\n\n🎤 您说的内容：\n"${text}"\n\n🤖 AI提取的信息：\n${fieldsFound.join(
        "\n"
      )}\n\n✨ 已自动填充表单，请检查并补充缺失信息后生成旅行计划！`;
    } else {
      resultMessage = `⚠️ 语音识别完成，但AI未能提取有效信息\n\n🎤 您说的内容：\n"${text}"\n\n💡 建议格式：\n"我想[出发日期]去[目的地]，[天数]天，预算[金额]元，[人数]人，喜欢[偏好]"\n\n📝 完整示例：\n"我想2025年12月25号去日本，五天，预算一万元，两人，喜欢美食和动漫"\n\n📝 简短示例：\n"明天去北京玩三天，预算五千"\n\n💭 提示：\n• AI可理解中文数字（五天、一万、两人）\n• 日期请明确年月日\n• 尽量说完整的句子，AI会智能提取信息`;
    }

    alert(resultMessage);
  } catch (error) {
    console.error("❌ AI解析错误:", error);
    alert(
      `AI解析失败：${error.message}\n\n识别内容："${text}"\n\n请手动填写表单或重新尝试语音输入`
    );
  }
}
