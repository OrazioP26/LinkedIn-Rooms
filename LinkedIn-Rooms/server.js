// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Create an Express app
const app = express();
// Create an HTTP server based on Express
const server = http.createServer(app);
// Attach socket.io to that server
const io = socketIO(server);

// Serve all files from the "public" folder
app.use(express.static('public'));

// When a new client connects via WebSocket
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Relay any "offer" sent by one peer to the other
  socket.on('offer', (payload) => {
    console.log('Offer from', socket.id);
    socket.broadcast.emit('offer', payload);
  });

  // Relay any "answer" sent by one peer to the other
  socket.on('answer', (payload) => {
    console.log('Answer from', socket.id);
    socket.broadcast.emit('answer', payload);
  });

  // Relay ICE candidates
  socket.on('ice-candidate', (candidate) => {
    console.log('ICE candidate from', socket.id);
    socket.broadcast.emit('ice-candidate', candidate);
  });

  // Relay chat messages
  socket.on('chat-message', (msg) => {
    console.log('Chat message from', socket.id, ': ', msg);
    socket.broadcast.emit('chat-message', msg);
  });

  // Notify when user disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
