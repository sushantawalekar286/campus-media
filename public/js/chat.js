// Chat functionality
let socket;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        initializeChat();
    } else {
        // Show authentication warning
        document.getElementById('authCheck').style.display = 'block';
        document.getElementById('chatCard').style.display = 'none';
    }
});

function initializeChat() {
    // Connect to Socket.IO
    socket = io();
    
    // Socket event listeners
    socket.on('connect', function() {
        console.log('Connected to chat server');
        updateOnlineCount();
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from chat server');
    });
    
    socket.on('userConnected', function(data) {
        updateOnlineCount();
        addSystemMessage(`${data.username} joined the chat`);
    });
    
    socket.on('userDisconnected', function(data) {
        updateOnlineCount();
        addSystemMessage(`${data.username} left the chat`);
    });
    
    socket.on('newMessage', function(data) {
        addMessage(data);
    });
    
    // Chat form submission
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (message && currentUser) {
            // Send message to server
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: currentUser.fullName,
                    message: message
                })
            });
            
            messageInput.value = '';
        }
    });
    
    // Auto-scroll to bottom
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addMessage(data) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message mb-3';
    
    messageDiv.innerHTML = `
        <div class="d-flex">
            <div class="avatar me-2">
                <span class="avatar-text">${data.username.charAt(0).toUpperCase()}</span>
            </div>
            <div class="message-content flex-grow-1">
                <div class="message-header">
                    <strong class="username">${data.username}</strong>
                    <small class="text-muted ms-2">${new Date(data.createdAt).toLocaleString()}</small>
                </div>
                <div class="message-text">
                    ${data.message}
                </div>
            </div>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addSystemMessage(message) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message mb-3 text-center';
    
    messageDiv.innerHTML = `
        <small class="text-muted">
            <i class="fas fa-info-circle"></i> ${message}
        </small>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function updateOnlineCount() {
    // This would be updated by the server
    // For now, we'll just show a placeholder
    const onlineCount = document.getElementById('onlineCount');
    if (onlineCount) {
        onlineCount.textContent = '1'; // Placeholder
    }
}
