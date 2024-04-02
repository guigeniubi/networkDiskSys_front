const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 当有新的WebSocket客户端连接时
wss.on('connection', (ws) => {
    console.log('Client connected');

    // 当接收到来自客户端的消息时
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);

        // 广播消息到所有客户端
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // 当客户端断开连接时
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// 启动HTTP和WebSocket服务器
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
