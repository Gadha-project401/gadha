'use strict';

/**
 * @module GoogleOAuth
 */
/**
 * @requires superagent
 */

require('dotenv').config();
const UserSchema = require('../models/user-schema');
const superagent = require('superagent');
const tokenServerUrl = process.env.TOKEN_SERVER;
const remoteAPI = process.env.REMOTE_API;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const API_SERVER = process.env.API_SERVER;
const OAUTH_PASS = process.env.OAUTH_PASS;

/**
 * @function awaitToken
 * @param {String} req - request token
 * @param {String} res - response to the server
 * @param {String} next - continue
 */

module.exports = async (req, res, next) => {
  try {
    let code = req.query.code;
    let remoteToken = await exchangeCodeForToken(code);
    let remoteUser = await getRemoteUserInfo(remoteToken);
    let [user, token] = await getUser(remoteUser);
    req.user = user;
    req.token = token;
    console.log('local user =======> ', token);
    next();
  } catch (e) {
    next(`ERROR: ${e.message}`);
  }
};

/**
 * @function exchangeCodeForToken
 * @param {String} client_id - The private application id
 * @param {String} client_secret - The private application password
 * @param {String} redirect_uri - The location that the authorization server will send the user to 
 * @param {String} code - The granted code from google
 * @param {String} grant_type - The granted authorization type
 */

async function exchangeCodeForToken(code) {
  let tokenResponse = await superagent.post(tokenServerUrl).send({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: API_SERVER,
    code: code,
    grant_type: 'authorization_code',
  });
  let access_token = tokenResponse.body.access_token;
  return access_token;
}

/**
 * @function getRemoteUserInfo
 * @param {String} token - Get the user information from google servers
 */

async function getRemoteUserInfo(token) {
  let userResponse = await superagent
    .get(remoteAPI)
    .set('Authorization', `Bearer ${token}`)
    .set('user-agent', 'express-app');
  let user = userResponse.body;
  return user;
}

/**
 * @function getUser
 * @param {String} remoteUser - Generate the token from google servers
 */

async function getUser(remoteUser) {
  let userRecord = {
    username: remoteUser.name,
    password: OAUTH_PASS,
    fullName: remoteUser.name,
    gender: 'unspecified',
    role: 'user', 
    birthday: '1/1/1990',
  };

  let checkUser = await UserSchema.find({username:userRecord.username});
  if (checkUser[0]){
    let myToken = UserSchema.generateToken(userRecord);
    return [checkUser[0],myToken];
  } else {
    const users = new UserSchema(userRecord);
    let savedUser = await users.save();
    let serverToken = UserSchema.generateToken(userRecord);
    return [savedUser, serverToken];
  }
}