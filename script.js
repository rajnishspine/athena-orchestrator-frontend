/**
 * Athena Ultra-Minimal Interface - JavaScript Implementation
 * Greek-inspired design for Venus Remedies International Business Intelligence
 * Powered by Luna Intelligence
 */

// ===== GLOBAL STATE MANAGEMENT =====
class AthenaState {
  constructor() {
    this.messages = [];
    this.isLoading = false;
    this.connectionStatus = 'connected';
    this.currentState = 'welcome'; // 'welcome' or 'chat'
    this.user = {
      name: 'Seeker',
      role: 'Venus Remedies'
    };
    this.sessionId = this.generateSessionId();
    this.apiBaseUrl = 'http://10.0.33.97:8001'; // Default to localhost, can be configured
  }

  generateSessionId() {
    return 'athena_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addMessage(message) {
    this.messages.push({
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('athena_conversation', JSON.stringify({
        messages: this.messages,
        lastActivity: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Could not save conversation to localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('athena_conversation');
      if (saved) {
        const data = JSON.parse(saved);
        this.messages = data.messages || [];
        return true;
      }
    } catch (error) {
      console.warn('Could not load conversation from localStorage:', error);
    }
    return false;
  }
}

// Initialize global state
const athenaState = new AthenaState();

// ===== DOM ELEMENTS =====
const elements = {
  welcomeState: null,
  chatState: null,
  messagesArea: null,
  messageInput: null,
  sendButton: null,
  charCount: null,
  loadingOverlay: null,
  connectionDot: null
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  initializeEventListeners();
  initializeInterface();
  loadConfig();

  // Focus on input after brief delay
  setTimeout(() => {
    if (elements.messageInput) {
      elements.messageInput.focus();
    }
  }, 1000);
});

function initializeElements() {
  elements.welcomeState = document.getElementById('welcomeState');
  elements.chatState = document.getElementById('chatState');
  elements.messagesArea = document.getElementById('messagesArea');
  elements.messageInput = document.getElementById('messageInput');
  elements.sendButton = document.getElementById('sendButton');
  elements.charCount = document.getElementById('charCount');
  elements.loadingOverlay = document.getElementById('loadingOverlay');
  elements.connectionDot = document.querySelector('.connection-dot');
}

function initializeEventListeners() {
  // Input handling
  elements.messageInput?.addEventListener('input', handleInputChange);
  elements.messageInput?.addEventListener('keydown', handleKeyDown);

  // Send button
  elements.sendButton?.addEventListener('click', sendMessage);

  // Auto-resize textarea
  elements.messageInput?.addEventListener('input', autoResizeTextarea);

  // No localStorage persistence - fresh start each time
}

function initializeInterface() {
  // Initialize connection status
  updateConnectionStatus('connected');

  // Simple, visible Greek experience without hiding content
  setTimeout(() => {
    addSubtleGreekAnimations();
  }, 200);
}

// ===== STATE TRANSITIONS =====
function transitionToChat() {
  if (!elements.welcomeState || !elements.chatState) return;

  athenaState.currentState = 'chat';

  // Simple, fast transition
  gsap.timeline()
    .to(elements.welcomeState, {
      duration: 0.3,
      opacity: 0,
      ease: "power2.out"
    })
    .set(elements.welcomeState, { display: 'none' })
    .set(elements.chatState, { display: 'flex', opacity: 0 })
    .to(elements.chatState, {
      duration: 0.3,
      opacity: 1,
      ease: "power2.out"
    });
}

// ===== CHAT HISTORY LOADING =====
async function loadLatestChatHistory() {
  try {
    console.log('🔍 Loading latest chat history...');
    const response = await fetch(`${athenaState.apiBaseUrl}/sessions/latest`);
    const data = await response.json();
    
    if (data.session && data.messages && data.messages.length > 0) {
      console.log(`📚 Found ${data.messages.length} messages in session: ${data.session.title}`);
      
      // Update session ID to continue the conversation
      athenaState.sessionId = data.session.session_id;
      
      // Clear any existing messages
      athenaState.messages = [];
      elements.messagesArea.innerHTML = '';
      
      // Display all previous messages
      data.messages.forEach(message => {
        if (message.role === 'user') {
          const userMessage = {
            type: 'user',
            content: message.content,
            sender: athenaState.user.name,
            timestamp: message.created_at
          };
          athenaState.addMessage(userMessage);
          renderMessage(userMessage);
        } else if (message.role === 'assistant') {
          const assistantMessage = {
            type: 'assistant',
            content: message.content,
            sender: 'Athena',
            timestamp: message.created_at
          };
          athenaState.addMessage(assistantMessage);
          renderMessage(assistantMessage);
        }
      });
      
      // Scroll to bottom to show latest messages
      scrollToBottom();
      
      console.log('✅ Chat history loaded successfully');
    } else {
      console.log('📝 No previous chat history found - starting fresh');
    }
  } catch (error) {
    console.error('❌ Failed to load chat history:', error);
    // Continue with fresh session if loading fails
  }
}

function scrollToBottom() {
  if (elements.messagesArea) {
    elements.messagesArea.scrollTop = elements.messagesArea.scrollHeight;
  }
}

// ===== SESSIONS LIST MANAGEMENT =====
async function showSessionsList() {
  const modal = document.getElementById('sessionsModal');
  const sessionsList = document.getElementById('sessionsList');
  
  // Show modal
  modal.style.display = 'flex';
  
  // Show loading
  sessionsList.innerHTML = '<div class="sessions-loading">Loading conversations...</div>';
  
  try {
    console.log('🔍 Loading sessions list...');
    const response = await fetch(`${athenaState.apiBaseUrl}/sessions`);
    const data = await response.json();
    
    if (data.sessions && data.sessions.length > 0) {
      console.log(`📚 Found ${data.sessions.length} sessions`);
      
      // Create sessions HTML
      const sessionsHtml = data.sessions.map(session => {
        const date = new Date(session.updated_at).toLocaleDateString();
        const time = new Date(session.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const title = session.title || 'Untitled Chat';
        
        return `
          <div class="session-item" onclick="loadSession('${session.session_id}')">
            <div class="session-title">${title}</div>
            <div class="session-meta">
              <span class="session-date">${date} at ${time}</span>
            </div>
          </div>
        `;
      }).join('');
      
      sessionsList.innerHTML = sessionsHtml;
    } else {
      sessionsList.innerHTML = '<div class="sessions-empty">No previous conversations found</div>';
    }
  } catch (error) {
    console.error('❌ Failed to load sessions:', error);
    sessionsList.innerHTML = '<div class="sessions-error">Failed to load conversations</div>';
  }
}

function hideSessionsList() {
  const modal = document.getElementById('sessionsModal');
  modal.style.display = 'none';
}

async function loadSession(sessionId) {
  try {
    console.log(`🔍 Loading session: ${sessionId}`);
    
    // Hide sessions modal
    hideSessionsList();
    
    // Transition to chat if not already there
    if (athenaState.currentState === 'welcome') {
      transitionToChat();
    }
    
    // Load specific session messages
    const response = await fetch(`${athenaState.apiBaseUrl}/sessions/${sessionId}/messages`);
    const data = await response.json();
    
    if (data.messages) {
      console.log(`📚 Loading ${data.messages.length} messages from session`);
      
      // Update session ID
      athenaState.sessionId = sessionId;
      
      // Clear existing messages
      athenaState.messages = [];
      elements.messagesArea.innerHTML = '';
      
      // Display all messages
      data.messages.forEach(message => {
        if (message.role === 'user') {
          const userMessage = {
            type: 'user',
            content: message.content,
            sender: athenaState.user.name,
            timestamp: message.created_at
          };
          athenaState.addMessage(userMessage);
          renderMessage(userMessage);
        } else if (message.role === 'assistant') {
          const assistantMessage = {
            type: 'assistant',
            content: message.content,
            sender: 'Athena',
            timestamp: message.created_at
          };
          athenaState.addMessage(assistantMessage);
          renderMessage(assistantMessage);
        }
      });
      
      // Scroll to bottom
      scrollToBottom();
      
      console.log('✅ Session loaded successfully');
    }
  } catch (error) {
    console.error('❌ Failed to load session:', error);
  }
}

function startNewChat() {
  // Hide sessions modal
  hideSessionsList();
  
  // Generate new session ID
  athenaState.sessionId = athenaState.generateSessionId();
  
  // Clear messages
  athenaState.messages = [];
  elements.messagesArea.innerHTML = '';
  
  // Transition to chat
  if (athenaState.currentState === 'welcome') {
    transitionToChat();
  }
  
  console.log('🆕 Started new chat session:', athenaState.sessionId);
}

function transitionToWelcome() {
  if (!elements.welcomeState || !elements.chatState) return;

  athenaState.currentState = 'welcome';

  // Hide chat state
  elements.chatState.style.opacity = '0';
  elements.chatState.style.transform = 'translateY(20px)';

  setTimeout(() => {
    elements.chatState.style.display = 'none';
    elements.welcomeState.style.display = 'flex';

    // Show welcome state
    setTimeout(() => {
      elements.welcomeState.style.opacity = '1';
      elements.welcomeState.style.transform = 'translateY(0)';
    }, 50);
  }, 300);
}

// ===== WISDOM CARD INTERACTIONS =====
function askAthena(query) {
  if (!elements.messageInput) return;

  elements.messageInput.value = query;
  handleInputChange({ target: elements.messageInput });
  sendMessage();
}

// Make askAthena globally available for onclick handlers
window.askAthena = askAthena;

// ===== INPUT HANDLING =====
function autoResizeTextarea() {
  if (!elements.messageInput) return;

  elements.messageInput.style.height = 'auto';
  const newHeight = Math.min(elements.messageInput.scrollHeight, 120);
  elements.messageInput.style.height = newHeight + 'px';
}

function handleInputChange(event) {
  const value = event.target.value;
  const length = value.length;

  // Update character count
  if (elements.charCount) {
    elements.charCount.textContent = length;
  }

  // Update send button state
  updateSendButtonState(length > 0 && !athenaState.isLoading);
}

function handleKeyDown(event) {
  // Send message on Enter (but not Shift+Enter)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function handleKeyDown(event) {
  // Send message on Enter (but not Shift+Enter)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}


function updateSendButtonState(enabled) {
  if (!elements.sendButton) return;

  elements.sendButton.disabled = !enabled;
  elements.sendButton.style.opacity = enabled ? '1' : '0.6';
}

// ===== CORE MESSAGING FUNCTIONS =====
async function sendMessage() {
  if (athenaState.isLoading || !elements.messageInput) return;

  const messageText = elements.messageInput.value.trim();
  if (!messageText) return;

  // Transition to chat state if currently in welcome state
  if (athenaState.currentState === 'welcome') {
    transitionToChat();
  }

  // Add user message
  const userMessage = {
    type: 'user',
    content: messageText,
    sender: athenaState.user.name,
    timestamp: new Date().toISOString()
  };

  athenaState.addMessage(userMessage);
  renderMessage(userMessage);

  // Clear input
  elements.messageInput.value = '';
  elements.messageInput.style.height = 'auto';
  updateSendButtonState(false);
  if (elements.charCount) elements.charCount.textContent = '0';

  // Show loading
  setLoadingState(true);

  try {
    const athenaResponse = await generateAthenaResponse(messageText);
    athenaState.addMessage(athenaResponse);
    renderMessage(athenaResponse);

  } catch (error) {
    console.error('Error generating response:', error);

    const errorMessage = {
      type: 'athena',
      content: 'I apologize, seeker. I am experiencing a temporary disruption in my wisdom channels. Please try your query again in a moment.',
      sender: 'Athena',
      timestamp: new Date().toISOString(),
      isError: true
    };

    athenaState.addMessage(errorMessage);
    renderMessage(errorMessage);
  } finally {
    setLoadingState(false);
    elements.messageInput?.focus();
  }
}


// ===== MESSAGE RENDERING =====
function renderMessage(message) {
  if (!elements.messagesArea) return;

  const messageElement = createMessageElement(message);
  elements.messagesArea.appendChild(messageElement);

  // Greek-inspired message entrance animation
  animateMessageEntrance(messageElement, message.type);

  // Smooth scroll to bottom
  setTimeout(() => {
    elements.messagesArea.scrollTop = elements.messagesArea.scrollHeight;
  }, 100);
}

function animateMessageEntrance(messageElement, type) {
  // Simple, fast entrance - visible immediately
  gsap.set(messageElement, { opacity: 0 });
  gsap.to(messageElement, {
    duration: 0.3,
    opacity: 1,
    ease: "power2.out"
  });
}

function renderPreviousMessages() {
  if (!elements.messagesArea) return;

  // Render all previous messages
  athenaState.messages.forEach(message => {
    const messageElement = createMessageElement(message);
    elements.messagesArea.appendChild(messageElement);
  });

  // Scroll to bottom
  setTimeout(() => {
    elements.messagesArea.scrollTop = elements.messagesArea.scrollHeight;
  }, 100);
}

function createMessageElement(message) {
  const isUser = message.type === 'user';
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'athena-message'}`;

  const timestamp = new Date(message.timestamp || Date.now());
  const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let contentHtml = `
    <div class="message-avatar">
      ${isUser ?
        '<div class="user-avatar"><div class="user-icon"></div></div>' :
        '<div class="athena-avatar"><img src="./Athena Docs/Logo/Athena Face.png" alt="Athena" class="athena-face-small" /></div>'
      }
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="sender-name">${message.sender}</span>
        <span class="message-time">${timeString}</span>
        ${!isUser && message.latency_ms ? `<span class="latency-indicator">${message.latency_ms}ms</span>` : ''}
      </div>
      <div class="message-text ${message.isError ? 'error-message' : ''}">
        ${formatMessageContent(message.content)}
      </div>
  `;

  // Add data preview if available
  if (!isUser && message.data_preview && message.data_preview.rows && message.data_preview.rows.length > 0) {
    // contentHtml += createDataPreviewHtml(message.data_preview);
  }

  // Add clarification options if available
  if (!isUser && message.clarify && message.clarify.options) {
    contentHtml += createClarificationHtml(message.clarify);
  }

  contentHtml += `</div>`;
  messageDiv.innerHTML = contentHtml;

  // Add event listeners for clarification options
  if (!isUser && message.clarify && message.clarify.options) {
    addClarificationEventListeners(messageDiv, message.clarify);
  }

  return messageDiv;
}

// function formatMessageContent(content) {
//   // Basic markdown-style formatting for light theme
//   return content
//     // Headings
//     .replace(/^### (.*$)/gim, '<h3>$1</h3>')
//     .replace(/^## (.*$)/gim, '<h2>$1</h2>')
//     .replace(/^# (.*$)/gim, '<h1>$1</h1>')
//     // Bold & Italics
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     .replace(/\*(.*?)\*/g, '<em>$1</em>')
//     // Inline code
//     .replace(/`(.*?)`/g, '<code style="background: var(--color-primary-lighter); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
//     // Line breaks
//     .replace(/\n/g, '<br>');
// }

function formatMessageContent(content) {
  if (!content) return "";

  marked.setOptions({
    breaks: true,
    gfm: true,
    sanitize: true, // Changed to TRUE for security
    headerIds: false,
    // Add Athena-specific enhancements
    highlight: function(code, lang) {
      // Custom code highlighting for metrics
      return `<div class="metric-block">${code}</div>`;
    }
  });

  let html = marked.parse(content);
  
  // Additional Athena-specific processing
  html = html.replace(
    /(₹\s*\d[\d,]*)/g, 
    '<span class="currency-value">$1</span>'
  );
  
  return html;
}



function createDataPreviewHtml(dataPreview) {
  if (!dataPreview.columns || !dataPreview.rows || dataPreview.rows.length === 0) {
    return '';
  }

  const columns = dataPreview.columns;
  const rows = dataPreview.rows.slice(0, 10); // Limit to first 10 rows for preview
  const elapsedMs = dataPreview.elapsed_ms || 0;

  let tableHtml = `
    <div class="data-preview">
      <div class="data-preview-header">
        <span class="data-preview-title">Data Preview</span>
        <span class="data-preview-meta">${rows.length} rows • ${elapsedMs}ms</span>
      </div>
      <div class="data-preview-table-container">
        <table class="data-preview-table">
          <thead>
            <tr>
              ${columns.map(col => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${columns.map(col => `<td>${formatCellValue(row[col])}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return tableHtml;
}

function createClarificationHtml(clarify) {
  if (!clarify.options || clarify.options.length === 0) {
    return '';
  }

  let clarificationHtml = `
    <div class="clarification-section">
      <div class="clarification-question">
        <strong>${clarify.question}</strong>
      </div>
      <div class="clarification-options">
        ${clarify.options.map((option, index) => `
          <button class="clarification-option" data-option="${index}">
            ${option}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  return clarificationHtml;
}

function addClarificationEventListeners(messageElement, clarify) {
  const optionButtons = messageElement.querySelectorAll('.clarification-option');
  
  optionButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const selectedOption = clarify.options[index];
      
      // Add the selected option as a user message
      const userMessage = {
        type: 'user',
        content: selectedOption,
        sender: athenaState.user.name,
        timestamp: new Date().toISOString()
      };

      athenaState.addMessage(userMessage);
      renderMessage(userMessage);

      // Send the clarification response
      sendClarificationResponse(selectedOption);
    });
  });
}

function formatCellValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Format numbers with commas
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  // Truncate long strings
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 47) + '...';
  }
  
  return String(value);
}

async function sendClarificationResponse(selectedOption) {
  if (athenaState.isLoading) return;

  // Show loading
  setLoadingState(true);

  try {
    const athenaResponse = await generateAthenaResponse(selectedOption);
    athenaState.addMessage(athenaResponse);
    renderMessage(athenaResponse);

  } catch (error) {
    console.error('Error generating clarification response:', error);

    const errorMessage = {
      type: 'athena',
      content: 'I apologize, seeker. I encountered an issue processing your clarification. Please try again.',
      sender: 'Athena',
      timestamp: new Date().toISOString(),
      isError: true
    };

    athenaState.addMessage(errorMessage);
    renderMessage(errorMessage);
  } finally {
    setLoadingState(false);
    elements.messageInput?.focus();
  }
}



// ===== AI RESPONSE GENERATION =====
async function generateAthenaResponse(userMessage) {
  try {
    const response = await fetch(`${athenaState.apiBaseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: athenaState.sessionId,
        message: userMessage,
        title: null
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Create Athena response object with API data
    const athenaResponse = {
      type: 'athena',
      content: data.answer,
      sender: 'Athena',
      data_preview: data.data_preview,
      sql: data.sql,
      latency_ms: data.latency_ms,
      clarify: data.clarify
    };

    return athenaResponse;

  } catch (error) {
    console.error('API Error:', error);
    
    // Handle CORS errors specifically
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('CORS Error: Unable to connect to the API. Please check if the athena-orchestrator server is running and CORS is properly configured.');
    }
    
    // Handle network errors
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network Error: Unable to reach the API server. Please check the API URL and ensure the server is running.');
    }
    
    throw error;
  }
}

// Mock response function removed - now using real API

// ===== UI STATE MANAGEMENT =====
function setLoadingState(isLoading) {
  athenaState.isLoading = isLoading;

  if (!elements.loadingOverlay) return;

  if (isLoading) {
    elements.loadingOverlay.classList.add('show');
  } else {
    elements.loadingOverlay.classList.remove('show');
  }

  updateSendButtonState(!isLoading && elements.messageInput?.value.trim().length > 0);
}

function updateConnectionStatus(status) {
  athenaState.connectionStatus = status;

  if (!elements.connectionDot) return;

  // Update connection dot appearance
  elements.connectionDot.className = `connection-dot ${status}`;

  const tooltips = {
    connected: 'Connected to Luna Intelligence',
    connecting: 'Connecting...',
    disconnected: 'Disconnected',
    error: 'Connection Error'
  };

  elements.connectionDot.title = tooltips[status] || 'Unknown Status';
}

// ===== SUBTLE GREEK ANIMATIONS =====
function addSubtleGreekAnimations() {
  // Simple, subtle animations that don't hide content
  addHeaderLogoAnimation();
  addWisdomCardHoverEffects();
}

function addHeaderLogoAnimation() {
  const headerLogo = document.querySelector('.athena-logo');

  if (headerLogo) {
    // Very subtle continuous animation - visible immediately
    gsap.to(headerLogo, {
      duration: 6,
      rotationY: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });
  }
}

function addWisdomCardHoverEffects() {
  const wisdomCards = document.querySelectorAll('.wisdom-card');

  wisdomCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        duration: 0.3,
        scale: 1.02,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        duration: 0.3,
        scale: 1,
        ease: "power2.out"
      });
    });
  });
}



// ===== UTILITY FUNCTIONS =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}



// ===== ERROR HANDLING =====
window.addEventListener('error', function(event) {
  console.error('Athena Interface Error:', event.error);

  // Show user-friendly error message
  if (athenaState.isLoading) {
    setLoadingState(false);

    const errorMessage = {
      type: 'athena',
      content: 'I encountered an unexpected disruption in my wisdom channels. Let us try again, seeker.',
      sender: 'Athena',
      isError: true
    };

    athenaState.addMessage(errorMessage);
    renderMessage(errorMessage);
  }
});

// Handle promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});


// ===== CONFIGURATION FUNCTIONS =====
function toggleConfig() {
  const configPanel = document.getElementById('configPanel');
  const apiUrlInput = document.getElementById('apiUrl');
  
  if (configPanel.classList.contains('show')) {
    configPanel.classList.remove('show');
  } else {
    apiUrlInput.value = athenaState.apiBaseUrl;
    configPanel.classList.add('show');
    apiUrlInput.focus();
  }
}

function saveConfig() {
  const apiUrlInput = document.getElementById('apiUrl');
  const newUrl = apiUrlInput.value.trim();
  
  if (newUrl) {
    athenaState.apiBaseUrl = newUrl;
    localStorage.setItem('athena_api_url', newUrl);
    updateConnectionStatus('connected');
  }
  
  toggleConfig();
}

function loadConfig() {
  const savedUrl = localStorage.getItem('athena_api_url');
  if (savedUrl) {
    athenaState.apiBaseUrl = savedUrl;
  }
}

async function testConnection() {
  const statusDiv = document.getElementById('configStatus');
  const apiUrlInput = document.getElementById('apiUrl');
  const testUrl = apiUrlInput.value.trim() || athenaState.apiBaseUrl;
  
  if (statusDiv) {
    statusDiv.innerHTML = '<div class="config-testing">Testing connection...</div>';
  }
  
  try {
    const response = await fetch(`${testUrl}/healthz`);
    if (response.ok) {
      updateConnectionStatus('connected');
      if (statusDiv) {
        statusDiv.innerHTML = '<div class="config-success">✅ Connection successful!</div>';
      }
      return true;
    } else {
      updateConnectionStatus('error');
      if (statusDiv) {
        statusDiv.innerHTML = `<div class="config-error">❌ Connection failed: ${response.status} ${response.statusText}</div>`;
      }
      return false;
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    updateConnectionStatus('error');
    if (statusDiv) {
      let errorMsg = '❌ Connection failed: ';
      if (error.message.includes('CORS')) {
        errorMsg += 'CORS error - check server configuration';
      } else if (error.message.includes('Failed to fetch')) {
        errorMsg += 'Network error - check if server is running';
      } else {
        errorMsg += error.message;
      }
      statusDiv.innerHTML = `<div class="config-error">${errorMsg}</div>`;
    }
    return false;
  }
}

// ===== GLOBAL FUNCTIONS =====
// Make functions globally available
window.sendMessage = sendMessage;
window.toggleConfig = toggleConfig;
window.saveConfig = saveConfig;
window.testConnection = testConnection;

