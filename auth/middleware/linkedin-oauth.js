'use strict';
require('dotenv').config();
const UserSchema = require('../models/user-schema');
const superagent = require('superagent');
const tokenServerUrl = process.env.TOKEN_SERVER_LI;
const CLIENT_ID = process.env.CLIENT_ID_LI;
const CLIENT_SECRET = process.env.CLIENT_SECRET_LI;
const API_SERVER = process.env.API_SERVER_LI;
const LINKEDIN_REMOTE = process.env.LINKEDIN_REMOTE;
const OAUTH_PASS = process.env.OAUTH_PASS;
module.exports = async (req, res, next) => {
  try {
    let code = req.query.code;
    let remoteToken = await exchangeCodeForToken(code);
    let remoteUser = await getRemoteUserInfo(remoteToken);
    let [user, token] = await getUser(remoteUser);
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    next(`ERROR: ${e.message}`);
  }
};
async function exchangeCodeForToken(code) {
  let tokenResponse = await superagent
    .post(tokenServerUrl)
    .type('form')
    .send({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: API_SERVER,
      code: code,
      grant_type: 'authorization_code',
    });
  let access_token = tokenResponse.body.access_token;
  return access_token;
}
async function getRemoteUserInfo(token) {
  let userResponse = await superagent
    .get(LINKEDIN_REMOTE)
    .set('Authorization', `Bearer ${token}`)
    .set('user-agent', 'express-app');
  let user = userResponse.body;
  return user;
}
async function getUser(remoteUser) {
  let userRecord = {
    username: remoteUser.firstName.localized.en_US+remoteUser.lastName.localized.en_US,
    password: OAUTH_PASS,
    fullName: `${remoteUser.firstName.localized.en_US} ${remoteUser.lastName.localized.en_US}`,
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