'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const server = require('./lib/server');

const URI = process.env.MONGODB_URI;
mongoose.connect(URI,{
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

server.start();