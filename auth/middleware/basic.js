'use strict';

const users = require('../models/user-schema');
const base64 = require('base-64');

module.exports = (req,res,next)=>{
  if(!req.headers.authorization){
    next('Invalid Login');
    return;
  }
  let basic = req.headers.authorization.split(' ').pop();
  let [user,pass] = base64.decode(basic).split(':');
  users.authenticateBasic(user,pass).then(validUser=>{
    req.theUserInfo = validUser[0];
    req.token = users.generateToken(validUser[0]);
    next();
  })
    .catch(err => next('invalid login'));
};