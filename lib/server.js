'use strict';

// Outside modules
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();

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


// Not found handler
app.use('*',notFoundHandler);

//Error handler
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port)=>{
    const PORT = port || process.env.PORT || 3000;
    app.listen(PORT, ()=>{console.log(`Listening to port ${PORT}`);});
  },
};