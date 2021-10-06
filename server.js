const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const roomRoutes = require('./routes/room');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  findUser
} = require('./utils/users');




const app = express();
const server = http.createServer(app);
const io = socketio(server);



app.use(bodyParser.json());
app.use(cors());
app.use(roomRoutes);
// error service
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message || "error found";
  res.status(status).json({
      message: message,
  });
});




const botName = "System Bot"
// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', async ({ username, room, token }) => {
      if(!token) token =jwt.sign(
          {
            roomId: "fsdhk",
            random: "gdhkef"
          },
          "Arat3cgfaRnWEfyj95PREzBDgUbmPm"
        );
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, "Arat3cgfaRnWEfyj95PREzBDgUbmPm");
      } catch (err) {
        err.statusCode = 500;
        throw err;
      }
      if (!decodedToken) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
      }
      const obj = await userJoin(socket.id, username, room);
      socket.join(obj.room);
  
      // Welcome current user
      socket.emit('message', formatMessage("text", botName, `Welcome to "${room}" Room`, 'bot'));
  
      // Broadcast when a user connects
      setTimeout(async function () {
        socket.broadcast
          .to(obj.room)
          .emit(
            'message',
            formatMessage('text', botName, `"${obj.user.username}" has joined the chat`, 'bot')
            );
        // Send users and room info
        io.to(obj.room).emit('roomUsers', {
          room: obj.room,
          users: await getRoomUsers(obj.room)
        });
      }, 1500);
  
    });

  // Listen for chatMessage
  socket.on('chatMessage', async ({type ,content, token, room}) => {
    // verify token
    if(!token) token =jwt.sign(
        {
          roomId: "fsdhk",
          random: "gdhkef"
        },
        "Arat3cgfaRnWEfyj95PREzBDgUbmPm"
      );
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "Arat3cgfaRnWEfyj95PREzBDgUbmPm");
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }
    if (!decodedToken) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const obj = await getCurrentUser(socket.id, room, token);
    if(obj.user){
      io.to(obj.room).emit('message', formatMessage(type, obj.user.username, content ,socket.id));
    }
  });
  socket.on('deleteMessage', async ({msgId, room, token }) => {
    // verify token
    if(!token) token =jwt.sign(
      {
        roomId: "fsdhk",
        random: "gdhkef"
      },
      "Arat3cgfaRnWEfyj95PREzBDgUbmPm"
    );
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "Arat3cgfaRnWEfyj95PREzBDgUbmPm");
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }
    if (!decodedToken) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const obj = await getCurrentUser(socket.id, room, token);
    if(obj.user){
      io.to(obj.room).emit('deleteMessage', {messageId:msgId});
    }
  });

  socket.on('left', async (room) => {

    const user = await userLeave(socket.id, room);
    
    if (user) {
      io.to(room).emit(
        'message',
        formatMessage("text", botName, `"${user.username}" has left the chat`, 'bot')
      );

      // Send users and room info
      io.to(room).emit('roomUsers', {
        room: room,
        users: await getRoomUsers(room)
      });
    }
  });
  // Runs when client disconnects
  socket.on('disconnect', async () => {
    //pending
    setTimeout(async function () {
      
      let room = await findUser(socket.id)
      
        const user = await userLeave(socket.id, room);
        if (user) {
          io.to(room).emit(
            'message',
            formatMessage("text", botName, `"${user.username}" has left the chat`, 'bot')
          );
    
          // Send users and room info
          io.to(room).emit('roomUsers', {
            room: room,
            users: await getRoomUsers(room)
          });
        }
 }, 1000);
      
  });
});










const PORT = process.env.PORT || 8080;
const DB_STRING = process.env.DB_HOST;
// database connection
mongoose
  .connect(
    DB_STRING,
    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then((result) => server.listen(PORT, ()=> console.log("Started!!!")))
  .catch((err) => console.log(err));

