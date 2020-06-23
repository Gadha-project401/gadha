'use strict';

// Outside modules
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// My modules
const timeStamp = require('../middleware/timestamp');
const logger = require('../middleware/logger');
const errorHandler = require('../middleware/500');
const notFoundHandler = require('../middleware/404');
const routes = require('../routes/routes');

// Global Middleware
app.use(express.static('./public'));
app.use(express.json());
app.use(cors());
app.use(timeStamp);
app.use(logger);

// Using the Routers modules
app.use(routes);

//chat rout
app.get('/chat',(req,res)=>{
  res.sendFile(__dirname + '/chat.html');
});

//socket for chat server
let users =[];
let connections = [];

io.sockets.on('connection',(socket)=>{
  connections.push(socket);
  console.log('connected %s sockets connected ', connections.length);

  //disconnect
  socket.on('disconnect',(data)=>{
    // if(!socket.username) return;
    users.splice(users.indexOf(socket.username),1);
    updateUserNames();
    connections.splice(connections.indexOf(socket),1);
    console.log('Disconnected : %s sockets connected' , connections.length);
  });

  //send message
  socket.on('send message',(data)=>{
    io.sockets.emit('new message', {msg:data , user:socket.username});
  });
    
  // New user 
  socket.on('new user',(data,callback)=>{
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUserNames();
  });

  socket.on('send post',data=>{
    io.sockets.emit('not',data);
  });

  function updateUserNames(){
    io.sockets.emit('get users', users);
  }
});


// Not found handler
app.use('*',notFoundHandler);

//Error handler
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port)=>{
    const PORT = port || process.env.PORT || 3000;
    server.listen(PORT, ()=>{console.log(`Listening to port ${PORT}`);});
  },
};