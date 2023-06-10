const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require('./utils/messages.js');
const { Userjoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users.js');

const PORT = process.env.PORT || 5001;

// set public static file
app.use(express.static(path.join(__dirname, 'public')));

var botname = 'mybot';

// io
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = Userjoin(socket.id, username, room);
    socket.join(user.room);
    // welcome all current user
    socket.broadcast.to(user.room).emit('notif', formatMessage(botname, `${user.username} has joined the chat`));

    io.to(user.room).emit('roomUsers',{
      room:user.room,
      users: getRoomUsers(user.room)
    })
  });

  // listen for chat message
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    socket.broadcast.to(user.room).emit('message', formatMessage(user.username, msg));

  });

  // run on disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)

    if (user) {
      io.to(user.room).emit('notif', formatMessage(botname, `${user.username} has disconnected`));
      console.log(`${user.username} has disconnected`);
      io.to(user.room).emit('roomUsers',{
        room:user.room,
        users: getRoomUsers(user.room)
      })
    }

  });
});

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});