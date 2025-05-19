const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
const users = new Set();

wss.on('connection', (ws) => {
    console.log('A new client connected!');
    let username = '';

    // Broadcast to all clients
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        const data = JSON.parse(message);

        if (data.type === 'login') {
            if (users.has(data.username)) {
                ws.send(JSON.stringify({
                    type: 'login_error',
                    message: 'Username already exists'
                }));
            } else {
                username = data.username;
                users.add(username);
                ws.send(JSON.stringify({
                    type: 'login_success',
                    username: username
                }));
                broadcastMessage({
                    type: 'system',
                    message: `${username} has joined the chat`
                });
            }
        } else if (data.type === 'message') {
            broadcastMessage({
                type: 'message',
                username: username,
                message: data.message
            });
        }
    });

    ws.on('close', () => {
        if (username) {
            users.delete(username);
            broadcastMessage({
                type: 'system',
                message: `${username} has left the chat`
            });
        }
    });

    function broadcastMessage(message) {
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
});

console.log('WebSocket server is running on ws://localhost:8080');