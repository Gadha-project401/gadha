'use strict';
/**
 * @module basic
 * @requires base-64
 * @requires user-schema
 */

const users = require('../models/user-schema');
const base64 = require('base-64');

/**
 * This checks the user login and validates it.
 * @param {object} req The request object.
 * @param {object} res The response object.
 * @param {function} next The next function.
 * 
 * @property {string} user This is the passed user from header.
 * @property {string} pass This is the password from the header.
 * @returns {function} Either gives an "Invalid Login" error if the login is wrong, or goes to the next step if the login is right
 */

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