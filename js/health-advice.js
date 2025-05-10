// 移除所有import语句，改为使用全局对象
document.addEventListener('DOMContentLoaded', function() {
    // 从全局对象获取函数
    const { initAIPersonality } = window.chatFunctions || {};
    
    if (initAIPersonality) {
      initAIPersonality();
      setupChat();
    } else {
      console.error('初始化函数未找到！');
    }
  });
  
  // 导出setupChat以便调试
  export function setupChat() {
    // ...原有代码...
  }

import { aiPersonality } from './personality.js';

// 初始化聊天界面
document.addEventListener('DOMContentLoaded', function() {
    initAIPersonality();
    setupChat();
});

// 设置聊天功能
function setupChat() {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    
    // 发送消息
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // 添加用户消息
        addUserMessage(message);
        userInput.value = '';
        
        // 显示AI正在输入
        showTypingIndicator();
        
        // 模拟AI响应延迟
        setTimeout(() => {
            removeTypingIndicator();
            generateAIResponse(message);
        }, 1500);
    }
    
    // 点击发送按钮
    sendBtn.addEventListener('click', sendMessage);
    
    // 按Enter键发送
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// 添加用户消息
function addUserMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// 添加AI消息
function addAIMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = formatAIText(text);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// 格式化AI回复文本
function formatAIText(text) {
    // 将数字列表转换为HTML列表
    text = text.replace(/\n\d+\./g, '\n•');
    // 保留换行
    return text.replace(/\n/g, '<br>');
}

// 显示AI正在输入
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = 'AI正在输入 <span></span><span></span><span></span>';
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

// 移除AI正在输入指示器
function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) typingDiv.remove();
}

// 滚动到底部
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 生成AI响应
async function generateAIResponse(userMessage) {
    try {
        // 构建API请求
        const response = await callDeepSeekAPI(userMessage);
        addAIMessage(response);
    } catch (error) {
        console.error('API调用失败:', error);
        addAIMessage(aiPersonality.predefinedResponses.unknown);
    }
}

// 调用DeepSeek API
async function callDeepSeekAPI(userMessage) {
    // 构建提示词
    const prompt = `${aiPersonality.expertisePrompt.replace('{context}', userMessage)}
    
    用户问题: ${userMessage}
    
    请以${aiPersonality.traits.tone}的语气回答，保持${aiPersonality.traits.formality}的风格，回答不超过${aiPersonality.responseStyle.maxLength}个字符。`;
    
    // 实际API调用
    const response = await fetch('https://api.deepseek.com/v1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-026e7b8cd7834b86b895a3046665f8f4'
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: prompt
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        })
    });
    
    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}