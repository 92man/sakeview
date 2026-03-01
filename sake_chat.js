// sake_chat.js - 사케 소믈리에 AI 채팅 위젯
(function () {
    'use strict';

    // === CONFIGURATION ===
    const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
    const OLLAMA_BASE = isLocal
        ? 'http://localhost:11434'
        : 'https://ai.sakeview.com';
    const CONFIG = {
        API_URL: OLLAMA_BASE + '/api/generate',
        API_TAGS_URL: OLLAMA_BASE + '/api/tags',
        MODEL: 'sake-ai',
        MAX_HISTORY: 50,
        STORAGE_KEY: 'sakeChatHistory',
    };

    // === STATE ===
    const state = {
        isOpen: false,
        isLoading: false,
        messages: [],
        abortController: null,
    };

    // === DOM REFERENCES ===
    let els = {};

    // === INITIALIZATION ===
    function init() {
        buildDOM();
        bindEvents();
        loadHistory();
    }

    // === DOM CONSTRUCTION ===
    function buildDOM() {
        // FAB Button
        const fab = document.createElement('button');
        fab.id = 'sake-chat-fab';
        fab.setAttribute('aria-label', '사케 AI 채팅 열기');
        fab.innerHTML = '<span class="sake-chat-fab-icon">\u{1F376}</span>';
        document.body.appendChild(fab);

        // Chat Window
        const win = document.createElement('div');
        win.id = 'sake-chat-window';
        win.innerHTML =
            '<div class="sake-chat-header">' +
                '<div class="sake-chat-header-left">' +
                    '<span class="sake-chat-avatar">\u{1F376}</span>' +
                    '<div class="sake-chat-header-info">' +
                        '<h3>사케 소믈리에 AI</h3>' +
                        '<span class="sake-chat-status" id="sakeChatStatus">\uC5F0\uACB0 \uD655\uC778 \uC911...</span>' +
                    '</div>' +
                '</div>' +
                '<div class="sake-chat-header-actions">' +
                    '<button class="sake-chat-clear-btn" title="\uB300\uD654 \uCD08\uAE30\uD654">' +
                        '<span class="material-symbols-outlined">delete_sweep</span>' +
                    '</button>' +
                    '<button class="sake-chat-close-btn" title="\uB2EB\uAE30">' +
                        '<span class="material-symbols-outlined">close</span>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="sake-chat-body" id="sakeChatBody">' +
                '<div class="sake-chat-messages" id="sakeChatMessages"></div>' +
                '<div class="sake-chat-typing" id="sakeChatTyping" style="display:none;">' +
                    '<div class="sake-chat-typing-dots">' +
                        '<span></span><span></span><span></span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="sake-chat-footer">' +
                '<div class="sake-chat-input-wrap">' +
                    '<textarea class="sake-chat-input" id="sakeChatInput" placeholder="\uC0AC\uCF00\uC5D0 \uB300\uD574 \uBB3C\uC5B4\uBCF4\uC138\uC694..." rows="1"></textarea>' +
                    '<button class="sake-chat-send-btn" id="sakeChatSendBtn" disabled>' +
                        '<span class="material-symbols-outlined">send</span>' +
                    '</button>' +
                '</div>' +
                '<div class="sake-chat-disclaimer">\uB85C\uCEEC AI (Ollama) \xB7 sake-ai \uBAA8\uB378</div>' +
            '</div>';
        document.body.appendChild(win);

        // Cache references
        els = {
            fab: fab,
            win: win,
            body: document.getElementById('sakeChatBody'),
            messages: document.getElementById('sakeChatMessages'),
            input: document.getElementById('sakeChatInput'),
            sendBtn: document.getElementById('sakeChatSendBtn'),
            typing: document.getElementById('sakeChatTyping'),
            status: document.getElementById('sakeChatStatus'),
            closeBtn: win.querySelector('.sake-chat-close-btn'),
            clearBtn: win.querySelector('.sake-chat-clear-btn'),
        };
    }

    // === EVENT HANDLERS ===
    function bindEvents() {
        els.fab.addEventListener('click', toggleChat);
        els.closeBtn.addEventListener('click', closeChat);
        els.clearBtn.addEventListener('click', clearHistory);
        els.sendBtn.addEventListener('click', handleSend);
        els.input.addEventListener('input', handleInputChange);
        els.input.addEventListener('keydown', handleKeyDown);

        document.addEventListener('click', function (e) {
            if (state.isOpen && !els.win.contains(e.target) && !els.fab.contains(e.target)) {
                closeChat();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && state.isOpen) {
                closeChat();
            }
        });
    }

    function toggleChat() {
        state.isOpen ? closeChat() : openChat();
    }

    function openChat() {
        state.isOpen = true;
        els.win.classList.add('sake-chat-open');
        els.fab.classList.add('sake-chat-fab-active');
        els.input.focus();
        scrollToBottom(false);
        checkConnection();

        if (state.messages.length === 0) {
            showWelcome();
        }
    }

    function closeChat() {
        state.isOpen = false;
        els.win.classList.remove('sake-chat-open');
        els.fab.classList.remove('sake-chat-fab-active');
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleInputChange() {
        els.input.style.height = 'auto';
        els.input.style.height = Math.min(els.input.scrollHeight, 120) + 'px';
        els.sendBtn.disabled = !els.input.value.trim() && !state.isLoading;
    }

    // === API / STREAMING ===
    async function handleSend() {
        const text = els.input.value.trim();

        // If loading, abort current stream
        if (state.isLoading) {
            if (state.abortController) state.abortController.abort();
            return;
        }

        if (!text) return;

        // Add user message
        addMessage('user', text);
        els.input.value = '';
        els.input.style.height = 'auto';
        handleInputChange();

        // Remove welcome if present
        var welcomeEl = els.messages.querySelector('.sake-chat-welcome');
        if (welcomeEl) welcomeEl.remove();

        await streamResponse(text);
    }

    async function streamResponse(userMessage) {
        state.isLoading = true;
        state.abortController = new AbortController();
        updateSendButton(true);
        showTyping(true);

        // Create placeholder for assistant message
        var msgEl = createMessageElement('assistant', '');
        els.messages.appendChild(msgEl);
        showTyping(false);

        var contentEl = msgEl.querySelector('.sake-chat-msg-content');
        var fullResponse = '';

        try {
            var response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: state.abortController.signal,
                body: JSON.stringify({
                    model: CONFIG.MODEL,
                    prompt: userMessage,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }

            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var buffer = '';

            while (true) {
                var result = await reader.read();
                if (result.done) break;

                buffer += decoder.decode(result.value, { stream: true });
                var lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (!line) continue;
                    try {
                        var parsed = JSON.parse(line);
                        if (parsed.response) {
                            fullResponse += parsed.response;
                            contentEl.textContent = fullResponse;
                            scrollToBottom();
                        }
                    } catch (e) {
                        // skip malformed JSON
                    }
                }
            }

            // Save completed message
            state.messages.push({ role: 'assistant', content: fullResponse, timestamp: Date.now() });
            trimHistory();
            saveHistory();

        } catch (err) {
            if (err.name === 'AbortError') {
                fullResponse += '\n\n(\uC911\uB2E8\uB428)';
                contentEl.textContent = fullResponse;
                state.messages.push({ role: 'assistant', content: fullResponse, timestamp: Date.now() });
                saveHistory();
            } else {
                msgEl.remove();
                showError(getErrorMessage(err));
            }
        } finally {
            state.isLoading = false;
            state.abortController = null;
            updateSendButton(false);
            showTyping(false);
        }
    }

    async function checkConnection() {
        try {
            var controller = new AbortController();
            var timeout = setTimeout(function () { controller.abort(); }, isLocal ? 3000 : 10000);
            var res = await fetch(CONFIG.API_TAGS_URL, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
                var data = await res.json();
                var hasModel = data.models && data.models.some(function (m) {
                    return m.name.indexOf(CONFIG.MODEL) === 0;
                });
                els.status.textContent = hasModel ? '\uC628\uB77C\uC778' : '\uBAA8\uB378 \uC5C6\uC74C';
                els.status.className = 'sake-chat-status ' + (hasModel ? 'online' : 'warning');
            } else {
                setOffline();
            }
        } catch (e) {
            setOffline();
        }
    }

    function setOffline() {
        els.status.textContent = '\uC624\uD504\uB77C\uC778';
        els.status.className = 'sake-chat-status offline';
    }

    function getErrorMessage(err) {
        var msg = err.message || '';
        if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
            return 'Ollama \uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB85C\uCEEC\uC5D0\uC11C Ollama\uAC00 \uC2E4\uD589 \uC911\uC778\uC9C0 \uD655\uC778\uD574\uC8FC\uC138\uC694.';
        }
        if (msg.indexOf('404') !== -1) {
            return 'sake-ai \uBAA8\uB378\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. Ollama\uC5D0 \uBAA8\uB378\uC774 \uB4F1\uB85D\uB418\uC5B4 \uC788\uB294\uC9C0 \uD655\uC778\uD574\uC8FC\uC138\uC694.';
        }
        if (msg.indexOf('500') !== -1) {
            return '\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. Ollama\uB97C \uC7AC\uC2DC\uC791\uD574\uC8FC\uC138\uC694.';
        }
        return '\uC624\uB958: ' + msg;
    }

    // === RENDERING ===
    function addMessage(role, content) {
        var msg = { role: role, content: content, timestamp: Date.now() };
        state.messages.push(msg);
        trimHistory();

        var el = createMessageElement(role, content);
        els.messages.appendChild(el);
        scrollToBottom();
    }

    function createMessageElement(role, content) {
        var wrap = document.createElement('div');
        wrap.className = 'sake-chat-msg sake-chat-msg-' + role;

        if (role === 'assistant' || role === 'error') {
            var avatar = document.createElement('span');
            avatar.className = 'sake-chat-msg-avatar';
            avatar.textContent = role === 'error' ? '\u26A0\uFE0F' : '\u{1F376}';
            wrap.appendChild(avatar);
        }

        var bubble = document.createElement('div');
        bubble.className = 'sake-chat-msg-bubble';

        var contentDiv = document.createElement('div');
        contentDiv.className = 'sake-chat-msg-content';
        contentDiv.textContent = content;
        bubble.appendChild(contentDiv);

        if (role !== 'error') {
            var time = document.createElement('span');
            time.className = 'sake-chat-msg-time';
            time.textContent = formatTime(new Date());
            bubble.appendChild(time);
        }

        wrap.appendChild(bubble);
        return wrap;
    }

    function showWelcome() {
        els.messages.innerHTML =
            '<div class="sake-chat-welcome">' +
                '<div class="sake-chat-welcome-icon">\u{1F376}</div>' +
                '<h4>사케 소믈리에 AI</h4>' +
                '<p>\uC0AC\uCF00\uC5D0 \uAD00\uD55C \uC9C8\uBB38\uC744 \uC790\uC720\uB86D\uAC8C \uD574\uC8FC\uC138\uC694!</p>' +
                '<div class="sake-chat-suggestions">' +
                    '<button class="sake-chat-suggest-btn">\uC900\uB9C8\uC774\uB2E4\uC774\uAE34\uC870\uB780?</button>' +
                    '<button class="sake-chat-suggest-btn">스테이크랑 잘 어울리는 사케는?</button>' +
                    '<button class="sake-chat-suggest-btn">시작하는 연인들을 위한 사케는?</button>' +
                '</div>' +
            '</div>';

        els.messages.querySelectorAll('.sake-chat-suggest-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                els.input.value = this.textContent;
                handleSend();
            });
        });
    }

    function showError(message) {
        var el = createMessageElement('error', message);
        els.messages.appendChild(el);
        scrollToBottom();
    }

    // === PERSISTENCE ===
    function saveHistory() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.messages));
        } catch (e) { /* storage full */ }
    }

    function loadHistory() {
        try {
            var saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                state.messages = JSON.parse(saved);
                renderAllMessages();
            }
        } catch (e) {
            state.messages = [];
        }
    }

    function clearHistory() {
        if (!confirm('\uB300\uD654 \uAE30\uB85D\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) return;
        state.messages = [];
        els.messages.innerHTML = '';
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        showWelcome();
    }

    function renderAllMessages() {
        els.messages.innerHTML = '';
        state.messages.forEach(function (msg) {
            var el = createMessageElement(msg.role, msg.content);
            els.messages.appendChild(el);
        });
    }

    // === UTILITIES ===
    function scrollToBottom(smooth) {
        if (smooth === undefined) smooth = true;
        els.body.scrollTo({
            top: els.body.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto',
        });
    }

    function formatTime(date) {
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }

    function showTyping(show) {
        els.typing.style.display = show ? 'flex' : 'none';
        if (show) scrollToBottom();
    }

    function updateSendButton(loading) {
        var icon = els.sendBtn.querySelector('.material-symbols-outlined');
        if (loading) {
            icon.textContent = 'stop';
            els.sendBtn.disabled = false;
            els.sendBtn.classList.add('sake-chat-stop-mode');
        } else {
            icon.textContent = 'send';
            els.sendBtn.disabled = !els.input.value.trim();
            els.sendBtn.classList.remove('sake-chat-stop-mode');
        }
    }

    function trimHistory() {
        if (state.messages.length > CONFIG.MAX_HISTORY) {
            state.messages = state.messages.slice(-CONFIG.MAX_HISTORY);
        }
    }

    // === BOOT ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
