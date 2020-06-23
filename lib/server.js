'use strict';
/**
 * express server  
 * @module server 
 * @requires dotenv
 * @requires cors
 * @requires express
 * @requires http
 * @requires socket.io
 */

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
app.use('/docs', express.static('./docs'));
app.use(express.json());
app.use(cors());
app.use(timeStamp);
app.use(logger);

// Using the Routers modules 
app.use(routes);

// chat rout 
app.get('/chat',(req,res)=>{
  res.sendFile(__dirname + '/chat.html');
  // res.redirect()
});

// socket for chat server 
let users =[];
let connections = [];

/**
 * @method on 
 * @param {string} connection A new Socket was connected.
 * 
 */
io.sockets.on('connection',function(socket){
  connections.push(socket);
  console.log('connected %s sockets connected ', connections.length);

  /**
   * @method on 
   * 
   * @param {string} disconnect A Socket was disconnected.
   */

  /**
    * @function disconnect
    * @param {string} data
    */

  socket.on('disconnect',(data)=>{
    users.splice(users.indexOf(socket.username),1);
    updateUserNames();
    connections.splice(connections.indexOf(socket),1);
    console.log('Disconnected : %s sockets connected' , connections.length);
  });

  /**
   * @method on 
   * @param {string} sendmessage received message from clients.
   */
  /**
   * @method emit 
   * @param {string} newmessage broadcast the message to all clients.
   * @param {object} obj
   */

  socket.on('send message',(data)=>{
    let obj =  {msg:data , user:socket.username};
    io.sockets.emit('new message',obj);
  });
   
  /**
   * @method on 
   * @param {string} newuser received username from client.
   */

  socket.on('new user',(data,callback)=>{
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUserNames();
  });

  /**
   * @method on 
   * @param {string} sendpost received notifications from clients.
   */
  /**
   * @method emit 
   * @param {string} not broadcast the notification to all clients.
   * @param {string} data
   */

  socket.on('send post',data=>{
    io.sockets.emit('not',data);
  });

  /**
   * @function updateUserNames
   */
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