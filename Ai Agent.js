// Interactive Chat Widget for n8n - Re-architected with Live Agent Takeover
(function() {
    // 1. Core State & Initialization Check
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // Load font resource
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);

    // Apply widget styles (CSS is unchanged from original for brevity, but still applied)
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .chat-assist-widget {
            --chat-color-primary: var(--chat-widget-primary, #10b981);
            --chat-color-secondary: var(--chat-widget-secondary, #059669);
            --chat-color-tertiary: var(--chat-widget-tertiary, #047857);
            --chat-color-light: var(--chat-widget-light, #d1fae5);
            --chat-color-surface: var(--chat-widget-surface, #ffffff);
            --chat-color-text: var(--chat-widget-text, #1f2937);
            --chat-color-text-light: var(--chat-widget-text-light, #6b7280);
            --chat-color-border: var(--chat-widget-border, #e5e7eb);
            --chat-shadow-sm: 0 1px 3px rgba(16, 185, 129, 0.1);
            --chat-shadow-md: 0 4px 6px rgba(16, 185, 129, 0.15);
            --chat-shadow-lg: 0 10px 15px rgba(16, 185, 129, 0.2);
            --chat-radius-sm: 8px;
            --chat-radius-md: 12px;
            --chat-radius-lg: 20px;
            --chat-radius-full: 9999px;
            --chat-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Poppins', sans-serif;
        }

        .chat-assist-widget .chat-window {
            position: fixed;
            bottom: 90px;
            z-index: 1000;
            width: 380px;
            height: 580px;
            background: var(--chat-color-surface);
            border-radius: var(--chat-radius-lg);
            box-shadow: var(--chat-shadow-lg);
            border: 1px solid var(--chat-color-light);
            overflow: hidden;
            display: none;
            flex-direction: column;
            transition: var(--chat-transition);
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }

        .chat-assist-widget .chat-window.right-side {
            right: 20px;
        }

        .chat-assist-widget .chat-window.left-side {
            left: 20px;
        }

        .chat-assist-widget .chat-window.visible {
            display: flex;
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .chat-assist-widget .chat-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            position: relative;
        }

        .chat-assist-widget .chat-header-logo {
            width: 32px;
            height: 32px;
            border-radius: var(--chat-radius-sm);
            object-fit: contain;
            background: white;
            padding: 4px;
        }

        .chat-assist-widget .chat-header-title {
            font-size: 16px;
            font-weight: 600;
            color: white;
        }

        .chat-assist-widget .chat-close-btn {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--chat-transition);
            font-size: 18px;
            border-radius: var(--chat-radius-full);
            width: 28px;
            height: 28px;
        }

        .chat-assist-widget .chat-close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-50%) scale(1.1);
        }

        .chat-assist-widget .chat-welcome {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 24px;
            text-align: center;
            width: 100%;
            max-width: 320px;
        }

        .chat-assist-widget .chat-welcome-title {
            font-size: 20px; /* Reduced for better fit with two buttons */
            font-weight: 700;
            color: var(--chat-color-text);
            margin-bottom: 24px;
            line-height: 1.3;
        }
        
        /* Two button container */
        .chat-assist-widget .chat-start-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .chat-assist-widget .chat-start-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 14px 20px;
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            border: none;
            border-radius: var(--chat-radius-md);
            cursor: pointer;
            font-size: 15px;
            transition: var(--chat-transition);
            font-weight: 600;
            font-family: inherit;
            box-shadow: var(--chat-shadow-md);
        }
        
        .chat-assist-widget .chat-start-btn.secondary-btn {
            background: #f3f4f6;
            color: var(--chat-color-text);
            border: 1px solid var(--chat-color-border);
            box-shadow: none;
        }

        .chat-assist-widget .chat-start-btn.secondary-btn:hover {
            background: var(--chat-color-light);
            border-color: var(--chat-color-primary);
        }

        .chat-assist-widget .chat-start-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--chat-shadow-lg);
        }

        .chat-assist-widget .chat-response-time {
            font-size: 14px;
            color: var(--chat-color-text-light);
            margin-top: 16px;
        }

        .chat-assist-widget .chat-body {
            display: none;
            flex-direction: column;
            height: 100%;
        }

        .chat-assist-widget .chat-body.active {
            display: flex;
        }
        
        .chat-assist-widget .chat-body.human-pending .chat-controls {
            pointer-events: none;
            opacity: 0.5;
        }

        .chat-assist-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar-thumb {
            background-color: rgba(16, 185, 129, 0.3);
            border-radius: var(--chat-radius-full);
        }

        .chat-assist-widget .chat-bubble {
            padding: 14px 18px;
            border-radius: var(--chat-radius-md);
            max-width: 85%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.6;
            position: relative;
            white-space: pre-line;
        }

        .chat-assist-widget .chat-bubble.user-bubble {
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            box-shadow: var(--chat-shadow-sm);
        }

        .chat-assist-widget .chat-bubble.bot-bubble {
            background: white;
            color: var(--chat-color-text);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: var(--chat-shadow-sm);
            border: 1px solid var(--chat-color-light);
        }
        
        .chat-assist-widget .chat-bubble.system-message {
            background: var(--chat-color-light);
            color: var(--chat-color-secondary);
            text-align: center;
            align-self: center;
            max-width: 95%;
            font-style: italic;
            font-size: 13px;
            padding: 8px 14px;
        }
        
        .chat-assist-widget .chat-escalation-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
            margin-top: 10px;
            background: #ffffff;
            border: 1px solid var(--chat-color-light);
            border-radius: var(--chat-radius-md);
        }

        /* Typing animation styles (unchanged) */
        .chat-assist-widget .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 14px 18px;
            background: white;
            border-radius: var(--chat-radius-md);
            border-bottom-left-radius: 4px;
            max-width: 80px;
            align-self: flex-start;
            box-shadow: var(--chat-shadow-sm);
            border: 1px solid var(--chat-color-light);
        }

        .chat-assist-widget .typing-dot {
            width: 8px;
            height: 8px;
            background: var(--chat-color-primary);
            border-radius: var(--chat-radius-full);
            opacity: 0.7;
            animation: typingAnimation 1.4s infinite ease-in-out;
        }

        .chat-assist-widget .typing-dot:nth-child(1) {
            animation-delay: 0s;
        }

        .chat-assist-widget .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .chat-assist-widget .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typingAnimation {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-4px);
            }
        }

        .chat-assist-widget .chat-controls {
            padding: 16px;
            background: var(--chat-color-surface);
            border-top: 1px solid var(--chat-color-light);
            display: flex;
            gap: 10px;
        }
        
        /* Input/Submit styles (unchanged) */
        .chat-assist-widget .chat-textarea {
            flex: 1;
            padding: 14px 16px;
            border: 1px solid var(--chat-color-light);
            border-radius: var(--chat-radius-md);
            background: var(--chat-color-surface);
            color: var(--chat-color-text);
            resize: none;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.5;
            max-height: 120px;
            min-height: 48px;
            transition: var(--chat-transition);
        }

        .chat-assist-widget .chat-textarea:focus {
            outline: none;
            border-color: var(--chat-color-primary);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        .chat-assist-widget .chat-textarea::placeholder {
            color: var(--chat-color-text-light);
        }

        .chat-assist-widget .chat-submit {
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            border: none;
            border-radius: var(--chat-radius-md);
            width: 48px;
            height: 48px;
            cursor: pointer;
            transition: var(--chat-transition);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: var(--chat-shadow-sm);
        }

        .chat-assist-widget .chat-submit:hover {
            transform: scale(1.05);
            box-shadow: var(--chat-shadow-md);
        }

        .chat-assist-widget .chat-submit svg {
            width: 22px;
            height: 22px;
        }

        .chat-assist-widget .chat-launcher {
            position: fixed;
            bottom: 20px;
            height: 56px;
            border-radius: var(--chat-radius-full);
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: var(--chat-shadow-md);
            z-index: 999;
            transition: var(--chat-transition);
            display: flex;
            align-items: center;
            padding: 0 20px 0 16px;
            gap: 8px;
        }

        .chat-assist-widget .chat-launcher.right-side {
            right: 20px;
        }

        .chat-assist-widget .chat-launcher.left-side {
            left: 20px;
        }

        .chat-assist-widget .chat-launcher:hover {
            transform: scale(1.05);
            box-shadow: var(--chat-shadow-lg);
        }

        .chat-assist-widget .chat-launcher svg {
            width: 24px;
            height: 24px;
        }
            
        .chat-assist-widget .chat-launcher-text {
            font-weight: 600;
            font-size: 15px;
            white-space: nowrap;
        }

        .chat-assist-widget .chat-footer {
            padding: 10px;
            text-align: center;
            background: var(--chat-color-surface);
            border-top: 1px solid var(--chat-color-light);
        }

        .chat-assist-widget .chat-footer-link {
            color: var(--chat-color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: var(--chat-transition);
            font-family: inherit;
        }

        .chat-assist-widget .chat-footer-link:hover {
            opacity: 1;
        }

        .chat-assist-widget .suggested-questions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 12px 0;
            align-self: flex-start;
            max-width: 85%;
        }

        .chat-assist-widget .suggested-question-btn {
            background: #f3f4f6;
            border: 1px solid var(--chat-color-light);
            border-radius: var(--chat-radius-md);
            padding: 10px 14px;
            text-align: left;
            font-size: 13px;
            color: var(--chat-color-text);
            cursor: pointer;
            transition: var(--chat-transition);
            font-family: inherit;
            line-height: 1.4;
        }

        .chat-assist-widget .suggested-question-btn:hover {
            background: var(--chat-color-light);
            border-color: var(--chat-color-primary);
        }

        .chat-assist-widget .chat-link {
            color: var(--chat-color-primary);
            text-decoration: underline;
            word-break: break-all;
            transition: var(--chat-transition);
        }

        .chat-assist-widget .chat-link:hover {
            color: var(--chat-color-secondary);
            text-decoration: underline;
        }

        .chat-assist-widget .user-registration {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 24px;
            text-align: center;
            width: 100%;
            max-width: 320px;
            display: none;
        }

        .chat-assist-widget .user-registration.active {
            display: block;
        }

        .chat-assist-widget .registration-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--chat-color-text);
            margin-bottom: 16px;
            line-height: 1.3;
        }

        .chat-assist-widget .registration-form {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
        }

        .chat-assist-widget .form-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
            text-align: left;
        }

        .chat-assist-widget .form-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--chat-color-text);
        }

        .chat-assist-widget .form-input {
            padding: 12px 14px;
            border: 1px solid var(--chat-color-border);
            border-radius: var(--chat-radius-md);
            font-family: inherit;
            font-size: 14px;
            transition: var(--chat-transition);
        }

        .chat-assist-widget .form-input:focus {
            outline: none;
            border-color: var(--chat-color-primary);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        .chat-assist-widget .form-input.error {
            border-color: #ef4444;
        }

        .chat-assist-widget .error-text {
            font-size: 12px;
            color: #ef4444;
            margin-top: 2px;
        }

        .chat-assist-widget .submit-registration {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 14px 20px;
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            border: none;
            border-radius: var(--chat-radius-md);
            cursor: pointer;
            font-size: 15px;
            transition: var(--chat-transition);
            font-weight: 600;
            font-family: inherit;
            box-shadow: var(--chat-shadow-md);
        }

        .chat-assist-widget .submit-registration:hover {
            transform: translateY(-2px);
            box-shadow: var(--chat-shadow-lg);
        }

        .chat-assist-widget .submit-registration:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }
    `;
    document.head.appendChild(widgetStyles);

    // 2. Configuration & State Variables
    const defaultSettings = {
        webhook: { url: '', route: '' },
        branding: {
            logo: '',
            name: 'Omni Existence AI',
            welcomeText: 'Welcome to Omni Existence Support. How would you like to start?',
            responseTimeText: 'Typically responds in a few seconds.',
            poweredBy: { text: 'Powered by OmniExistence', link: 'https://omniexistence.com/' }
        },
        style: { primaryColor: '#10b981', secondaryColor: '#059669', position: 'right', backgroundColor: '#ffffff', fontColor: '#1f2937' },
        suggestedQuestions: []
    };

    const settings = window.ChatWidgetConfig ?
        {
            webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
            style: {
                ...defaultSettings.style,
                ...window.ChatWidgetConfig.style,
                primaryColor: (window.ChatWidgetConfig.style?.primaryColor || '#10b981'), // Force green logic removed for simplicity, using provided color or default
                secondaryColor: (window.ChatWidgetConfig.style?.secondaryColor || '#059669')
            },
            suggestedQuestions: window.ChatWidgetConfig.suggestedQuestions || defaultSettings.suggestedQuestions
        } : defaultSettings;

    // Persisted User/Session Data
    let conversationId = localStorage.getItem('n8n_chat_sessionId') || '';
    let userName = localStorage.getItem('n8n_chat_userName') || '';
    let userEmail = localStorage.getItem('n8n_chat_userEmail') || '';

    // Live Agent State Management
    let currentChatMode = localStorage.getItem('n8n_chat_mode') || 'LLM'; // LLM | HUMAN_PENDING | HUMAN_ACTIVE
    let isWaitingForResponse = false;
    let pollingInterval = null;
    const POLLING_RATE = 5000; // 5 seconds

    // 3. DOM Structure & Injection
    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'chat-assist-widget';

    widgetRoot.style.setProperty('--chat-widget-primary', settings.style.primaryColor);
    widgetRoot.style.setProperty('--chat-widget-secondary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-tertiary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-surface', settings.style.backgroundColor);
    widgetRoot.style.setProperty('--chat-widget-text', settings.style.fontColor);

    const chatWindow = document.createElement('div');
    chatWindow.className = `chat-window ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;

    // Updated Welcome Screen with Two Buttons
    const welcomeScreenHTML = `
        <div class="chat-header">
            <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
            <span class="chat-header-title">${settings.branding.name}</span>
            <button class="chat-close-btn">×</button>
        </div>
        <div class="chat-welcome">
            <h2 class="chat-welcome-title">${settings.branding.welcomeText}</h2>
            <div class="chat-start-options">
                <button class="chat-start-btn" id="start-omni-chat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Chat with Omni Agent
                </button>
                <button class="chat-start-btn secondary-btn" id="start-human-chat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Chat with a Human Agent
                </button>
            </div>
            <p class="chat-response-time">${settings.branding.responseTimeText}</p>
        </div>
        <div class="user-registration">
            <h2 class="registration-title">Please enter your details to start chatting</h2>
            <form class="registration-form">
                <div class="form-field">
                    <label class="form-label" for="chat-user-name">Name</label>
                    <input type="text" id="chat-user-name" class="form-input" placeholder="Your name" required value="${userName}">
                    <div class="error-text" id="name-error"></div>
                </div>
                <div class="form-field">
                    <label class="form-label" for="chat-user-email">Email</label>
                    <input type="email" id="chat-user-email" class="form-input" placeholder="Your email address" required value="${userEmail}">
                    <div class="error-text" id="email-error"></div>
                </div>
                <button type="submit" class="submit-registration">Continue to Chat</button>
            </form>
        </div>
    `;

    const chatInterfaceHTML = `
        <div class="chat-body">
            <div class="chat-messages"></div>
            <div class="chat-controls">
                <textarea class="chat-textarea" placeholder="Type your message here..." rows="1"></textarea>
                <button class="chat-submit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 2L11 13"></path>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                </button>
            </div>
            <div class="chat-footer">
                <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank">${settings.branding.poweredBy.text}</a>
            </div>
        </div>
    `;

    chatWindow.innerHTML = welcomeScreenHTML + chatInterfaceHTML;

    const launchButton = document.createElement('button');
    launchButton.className = `chat-launcher ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    launchButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <span class="chat-launcher-text">Need help?</span>`;

    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(launchButton);
    document.body.appendChild(widgetRoot);

    // 4. DOM Element References
    const elements = {
        chatWindow: chatWindow,
        chatBody: chatWindow.querySelector('.chat-body'),
        messagesContainer: chatWindow.querySelector('.chat-messages'),
        messageTextarea: chatWindow.querySelector('.chat-textarea'),
        sendButton: chatWindow.querySelector('.chat-submit'),
        registrationForm: chatWindow.querySelector('.registration-form'),
        userRegistration: chatWindow.querySelector('.user-registration'),
        chatWelcome: chatWindow.querySelector('.chat-welcome'),
        nameInput: chatWindow.querySelector('#chat-user-name'),
        emailInput: chatWindow.querySelector('#chat-user-email'),
        nameError: chatWindow.querySelector('#name-error'),
        emailError: chatWindow.querySelector('#email-error'),
        startOmniChatBtn: chatWindow.querySelector('#start-omni-chat'),
        startHumanChatBtn: chatWindow.querySelector('#start-human-chat'),
        closeButtons: chatWindow.querySelectorAll('.chat-close-btn')
    };
    
    // 5. Utility Functions
    
    function createSessionId() {
        const id = crypto.randomUUID();
        localStorage.setItem('n8n_chat_sessionId', id);
        return id;
    }

    function createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
        return indicator;
    }

    function updateChatMode(newMode) {
        currentChatMode = newMode;
        localStorage.setItem('n8n_chat_mode', newMode);
        
        // Update UI state
        elements.chatBody.classList.toggle('human-pending', newMode === 'HUMAN_PENDING');
        elements.messageTextarea.placeholder = (newMode === 'HUMAN_PENDING') ? 
            'Please wait, connecting you to a human agent...' : 
            'Type your message here...';
    }

    function linkifyTextSafely(text) {
        // 1. HTML Escape to prevent XSS
        const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // 2. Safely replace URLs with legitimate <a> tags
        const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        
        // This is safe because the rest of the content is HTML-escaped
        return escapedText.replace(urlPattern, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function appendMessage(text, type = 'bot', metadata = {}) {
        const message = document.createElement('div');
        message.className = `chat-bubble ${type}-bubble`;
        
        if (type === 'bot' || type === 'system') {
            message.innerHTML = linkifyTextSafely(text);
        } else {
            message.textContent = text;
        }
        
        elements.messagesContainer.appendChild(message);
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
        
        // Check for escalation request only if it's a bot message
        if (type === 'bot' && metadata.actionType === 'LLM_ESCALATION') {
            const container = document.createElement('div');
            container.className = 'chat-escalation-container';
            
            const escalateBtn = document.createElement('button');
            escalateBtn.className = 'chat-start-btn';
            escalateBtn.textContent = 'Speak to a Human Agent';
            escalateBtn.addEventListener('click', () => {
                // Clear all elements and start human takeover process
                container.parentNode.removeChild(container);
                initiateHumanTakeover('ESCALATE_REQUEST');
            });
            
            container.appendChild(escalateBtn);
            elements.messagesContainer.appendChild(container);
            elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
        }
    }

    // 6. Polling & Live Agent Handover Logic
    
    function startPolling() {
        if (pollingInterval) clearInterval(pollingInterval);
        
        pollingInterval = setInterval(checkAgentStatus, POLLING_RATE);
        console.log("Polling started...");
    }
    
    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
            console.log("Polling stopped.");
        }
    }

    async function checkAgentStatus() {
        if (currentChatMode !== 'HUMAN_PENDING' || isWaitingForResponse) return;
        
        isWaitingForResponse = true;
        
        const requestData = {
            actionType: 'STATUS_CHECK',
            sessionId: conversationId,
            chatInput: 'Checking agent status...',
            metadata: { userId: userEmail, userName: userName }
        };
        
        try {
            const response = await fetch(settings.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            
            const responseData = await response.json();
            const newMode = responseData.chatMode;
            
            if (newMode === 'HUMAN_ACTIVE') {
                stopPolling();
                updateChatMode('HUMAN_ACTIVE');
                
                // Add system message indicating takeover
                appendMessage(responseData.output || 'A human agent has joined the chat and is ready to assist you!', 'system');
            } else if (newMode !== 'HUMAN_PENDING') {
                // Failsafe: if status reverts unexpectedly
                stopPolling();
                updateChatMode('LLM'); 
                appendMessage('Connection error: Agent request failed or timed out. Falling back to Omni Agent.', 'system');
            }
            
        } catch (error) {
            console.error('Polling Error:', error);
            // Optionally, stop polling after several errors
        } finally {
            isWaitingForResponse = false;
        }
    }

    async function initiateHumanTakeover(actionType) {
        // Clear old messages and set pending state
        elements.messagesContainer.innerHTML = ''; 
        updateChatMode('HUMAN_PENDING');

        appendMessage('Connecting you to a human agent. Please wait...', 'system');
        
        const typingIndicator = createTypingIndicator();
        elements.messagesContainer.appendChild(typingIndicator);
        
        // Send initial human request payload
        const requestData = {
            actionType: actionType, // HUMAN_REQUEST or ESCALATE_REQUEST
            sessionId: conversationId,
            chatInput: 'User requested a human agent.',
            metadata: { userId: userEmail, userName: userName }
        };

        try {
            const response = await fetch(settings.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            
            const responseData = await response.json();
            
            elements.messagesContainer.removeChild(typingIndicator);
            
            // Check the mode immediately after the request
            if (responseData.chatMode === 'HUMAN_ACTIVE') {
                updateChatMode('HUMAN_ACTIVE');
                appendMessage(responseData.output || 'A human agent has joined the chat!', 'system');
            } else if (responseData.chatMode === 'HUMAN_PENDING') {
                updateChatMode('HUMAN_PENDING');
                appendMessage(responseData.output || 'Your request has been sent. We will connect you shortly.', 'system');
                startPolling(); // Start polling if still pending
            } else {
                 // Failsafe if the request immediately fails
                updateChatMode('LLM');
                appendMessage(responseData.output || 'Sorry, we failed to connect you to an agent. Please try again later or chat with the Omni Agent.', 'system');
            }
            
        } catch (error) {
            console.error('Initial Human Request Error:', error);
            updateChatMode('LLM');
            elements.messagesContainer.removeChild(typingIndicator);
            appendMessage("Server error during connection. Please check the webhook configuration.", 'system');
        }
    }

    // 7. Message Submission Handler

    async function submitMessage(messageText) {
        if (isWaitingForResponse) return;
        
        isWaitingForResponse = true;
        
        const actionType = (currentChatMode === 'HUMAN_ACTIVE' || currentChatMode === 'HUMAN_PENDING') ? 'HUMAN_MESSAGE' : 'LLM';

        const requestData = {
            actionType: actionType,
            sessionId: conversationId,
            route: settings.webhook.route,
            chatInput: messageText,
            metadata: { userId: userEmail, userName: userName }
        };

        // Display user message
        appendMessage(messageText, 'user');
        
        // Show typing indicator
        const typingIndicator = createTypingIndicator();
        elements.messagesContainer.appendChild(typingIndicator);

        try {
            const response = await fetch(settings.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            
            const responseData = await response.json();
            
            elements.messagesContainer.removeChild(typingIndicator);
            
            const responseText = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            const newMode = responseData.chatMode || currentChatMode;
            
            // Handle bot response and potential escalation signal
            let escalationTrigger = false;
            
            if (newMode !== currentChatMode) {
                updateChatMode(newMode);
            }
            
            // Check for explicit escalation action type from the LLM
            if (responseData.actionType === 'LLM_ESCALATION') {
                 escalationTrigger = true;
            }

            // Display bot/agent response
            appendMessage(responseText, (currentChatMode === 'HUMAN_ACTIVE' ? 'bot' : 'bot'), { actionType: escalationTrigger ? 'LLM_ESCALATION' : 'LLM' });

        } catch (error) {
            console.error('Message submission error:', error);
            
            const indicator = elements.messagesContainer.querySelector('.typing-indicator');
            if (indicator) elements.messagesContainer.removeChild(indicator);
            
            appendMessage("Sorry, I couldn't send your message. Please try again.", 'system');
        } finally {
            isWaitingForResponse = false;
        }
    }

    // 8. View Control & Registration Logic

    function showRegistrationForm(mode) {
        elements.chatWelcome.style.display = 'none';
        elements.userRegistration.classList.add('active');
        // Store the intended initial chat mode for after registration
        elements.registrationForm.dataset.initialMode = mode;
    }
    
    function startChatSession(initialMode, initialMessage) {
        // Hide registration form, show chat interface
        elements.userRegistration.classList.remove('active');
        elements.chatBody.classList.add('active');
        
        // Set persistence
        localStorage.setItem('n8n_chat_userName', userName);
        localStorage.setItem('n8n_chat_userEmail', userEmail);
        
        if (!conversationId) {
            conversationId = createSessionId();
        }
        
        if (initialMode === 'HUMAN_REQUEST') {
            initiateHumanTakeover('HUMAN_REQUEST');
        } else {
             // For LLM mode, send a welcome/session load message
             submitMessage(initialMessage);
        }
        
    }

    function handleRegistration(event) {
        event.preventDefault();

        // Reset error messages
        elements.nameError.textContent = '';
        elements.emailError.textContent = '';
        elements.nameInput.classList.remove('error');
        elements.emailInput.classList.remove('error');

        // Get values
        userName = elements.nameInput.value.trim();
        userEmail = elements.emailInput.value.trim();
        const initialMode = elements.registrationForm.dataset.initialMode;

        // Validate
        let isValid = true;
        if (!userName) { elements.nameError.textContent = 'Please enter your name'; elements.nameInput.classList.add('error'); isValid = false; }
        if (!userEmail) { elements.emailError.textContent = 'Please enter your email'; elements.emailInput.classList.add('error'); isValid = false; }
        else if (!isValidEmail(userEmail)) { elements.emailError.textContent = 'Please enter a valid email address'; elements.emailInput.classList.add('error'); isValid = false; }

        if (!isValid) return;
        
        // Use user info as the first "message" to load the session
        const initialMessage = `Name: ${userName}\nEmail: ${userEmail}`;
        
        startChatSession(initialMode, initialMessage);
    }
    
    function autoResizeTextarea() {
        elements.messageTextarea.style.height = 'auto';
        elements.messageTextarea.style.height = (elements.messageTextarea.scrollHeight > 120 ? 120 : elements.messageTextarea.scrollHeight) + 'px';
    }

    // 9. Initial Load Check
    if (userName && userEmail && conversationId) {
        // If user data exists, skip the welcome screen and show registration to confirm
        elements.chatWelcome.style.display = 'none';
        elements.userRegistration.classList.add('active');
        
        // Pre-fill the mode to LLM if resuming a chat
        elements.registrationForm.dataset.initialMode = currentChatMode; 
        
        // Auto-start chat history loading
        // For a seamless experience, we can auto-submit the registration form here, but showing it ensures mode context is clear.
        
        // Instead of auto-starting, change the button text to "Resume Chat"
        const submitBtn = elements.userRegistration.querySelector('.submit-registration');
        submitBtn.textContent = (currentChatMode === 'HUMAN_ACTIVE') ? 'Resume Human Chat' : 'Resume Omni Chat';
    }


    // 10. Event Listeners

    elements.startOmniChatBtn.addEventListener('click', () => showRegistrationForm('LLM'));
    elements.startHumanChatBtn.addEventListener('click', () => showRegistrationForm('HUMAN_REQUEST'));
    
    elements.registrationForm.addEventListener('submit', handleRegistration);
    
    elements.sendButton.addEventListener('click', () => {
        const messageText = elements.messageTextarea.value.trim();
        if (messageText && !isWaitingForResponse) {
            submitMessage(messageText);
            elements.messageTextarea.value = '';
            elements.messageTextarea.style.height = 'auto';
        }
    });
    
    elements.messageTextarea.addEventListener('input', autoResizeTextarea);
    
    elements.messageTextarea.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const messageText = elements.messageTextarea.value.trim();
            if (messageText && !isWaitingForResponse) {
                submitMessage(messageText);
                elements.messageTextarea.value = '';
                elements.messageTextarea.style.height = 'auto';
            }
        }
    });
    
    launchButton.addEventListener('click', () => {
        elements.chatWindow.classList.toggle('visible');
        if (currentChatMode === 'HUMAN_PENDING' && elements.chatWindow.classList.contains('visible')) {
            startPolling();
        } else {
            stopPolling();
        }
    });

    elements.closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            elements.chatWindow.classList.remove('visible');
            stopPolling(); // Stop polling when widget is closed
        });
    });
})();
