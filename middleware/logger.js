'use strict';

module.exports = (req,res,next) => {
  console.log(`Path is ${req.path} , Method is ${req.method} , Request time is ${req.requestTime}`);
  next();
};
