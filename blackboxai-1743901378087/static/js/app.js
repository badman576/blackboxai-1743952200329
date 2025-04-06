// Voice recognition functionality
let recognition;
let isListening = false;

function startVoiceInput() {
    const voiceBtn = document.getElementById('voice-btn');
    
    if (!('webkitSpeechRecognition' in window)) {
        alert('Your browser does not support speech recognition. Try Chrome or Edge.');
        return;
    }

    if (!recognition) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isListening = true;
            voiceBtn.classList.add('voice-active');
            voiceBtn.innerHTML = '<i class="fas fa-microphone-alt"></i> Listening...';
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('command-input').value = transcript;
            sendCommand();
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            alert('Error: ' + event.error);
        };

        recognition.onend = function() {
            isListening = false;
            voiceBtn.classList.remove('voice-active');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
    }

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Command history management
function loadCommandHistory() {
    const history = JSON.parse(localStorage.getItem('commandHistory') || '[]');
    const historyContainer = document.getElementById('command-history');
    
    historyContainer.innerHTML = '';
    history.slice(0, 5).forEach(item => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer hover:text-primary-light dark:hover:text-primary-dark';
        el.textContent = item.command;
        el.addEventListener('click', () => {
            document.getElementById('command-input').value = item.command;
        });
        historyContainer.appendChild(el);
    });
}

// Save command to history
function saveToHistory(command) {
    const history = JSON.parse(localStorage.getItem('commandHistory') || '[]');
    history.unshift({
        command: command,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('commandHistory', JSON.stringify(history.slice(0, 10)));
    loadCommandHistory();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadCommandHistory();
    
    // Theme switcher for demo purposes
    const themeToggle = document.createElement('button');
    themeToggle.className = 'fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-700 shadow-lg';
    themeToggle.innerHTML = '<i class="fas fa-moon dark:hidden"></i><i class="fas fa-sun hidden dark:inline"></i>';
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    document.body.appendChild(themeToggle);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
});

// Enhanced sendCommand function
function sendCommand() {
    const input = document.getElementById('command-input');
    const command = input.value.trim();
    
    if (command) {
        const socket = io();
        socket.emit('user_command', { command: command });
        addMessage(command, 'Processing...');
        saveToHistory(command);
        input.value = '';
    }
}

// Enhanced addMessage function
function addMessage(command, response) {
    const chatContainer = document.getElementById('chat-container');
    
    // Clear initial placeholder if present
    if (chatContainer.children.length === 1 && chatContainer.children[0].classList.contains('text-center')) {
        chatContainer.innerHTML = '';
    }
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'flex justify-end mb-3';
    userMsg.innerHTML = `
        <div class="max-w-xs md:max-w-md bg-primary-light dark:bg-primary-dark text-white rounded-lg p-3 shadow">
            ${command}
            <div class="text-xs text-primary-lighter dark:text-primary-darker mt-1 text-right">
                ${new Date().toLocaleTimeString()}
            </div>
        </div>
    `;
    chatContainer.appendChild(userMsg);
    
    // Add AI response
    const aiMsg = document.createElement('div');
    aiMsg.className = 'flex justify-start mb-3';
    aiMsg.innerHTML = `
        <div class="max-w-xs md:max-w-md bg-gray-200 dark:bg-gray-700 rounded-lg p-3 shadow">
            ${response}
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ${new Date().toLocaleTimeString()}
            </div>
        </div>
    `;
    chatContainer.appendChild(aiMsg);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Handle settings form submission
if (document.getElementById('settings-form')) {
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const settings = Object.fromEntries(formData.entries());
        
        fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/';
            }
        });
    });
}