'use strict';
/**
 * @module bearerAuth
 * @requires user-schema
 */
const users = require('../models/user-schema');

/**
 * This checks the user login and validates it.
 * @param {object} req The request object.
 * @param {object} res The response object.
 * @param {function} next The next function.
 * @returns {function} Either gives an invalid user token, user not logged in errors if the login is wrong, or goes to the next step if the login is right
 */
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