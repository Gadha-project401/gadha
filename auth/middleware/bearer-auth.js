'use strict';

const users = require('../models/user-schema');

module.exports = (req,res,next)=>{
  if(!req.headers.authorization){
    next('User not logged in');
    return;
  }

  let bearerToken = req.headers.authorization.split(' ').pop();


  users.verifyToken(bearerToken)
    .then(decodedUser =>{
      req.user = decodedUser;
      next();
    }).catch(err=> next('Invalid User Token: ' + err));
};