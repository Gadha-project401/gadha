'use strict';
require('dotenv').config();
const UserSchema = require('../models/user-schema');
const superagent = require('superagent');
const tokenServerUrl = process.env.TOKEN_SERVER;
const remoteAPI = process.env.REMOTE_API;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const API_SERVER = process.env.API_SERVER;
module.exports = async (req, res, next) => {
  try {
    let code = req.query.code;
    console.log('CODE =======> ', code);
    let remoteToken = await exchangeCodeForToken(code);
    let remoteUser = await getRemoteUserInfo(remoteToken);
    let [user, token] = await getUser(remoteUser);
    req.user = user;
    req.token = token;
    console.log('local user =======> ', token);
    next();
  } catch (e) {
    console.log(`ERROR ========> ${e}`);
    next(`ERROR: ${e.message}`);
  }
};
async function exchangeCodeForToken(code) {
  let tokenResponse = await superagent.post(tokenServerUrl).send({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: API_SERVER,
    code: code,
    grant_type: 'authorization_code',
  });
  let access_token = tokenResponse.body.access_token;
  console.log('============>', access_token);
  return access_token;
}
async function getRemoteUserInfo(token) {
  let userResponse = await superagent
    .get(remoteAPI)
    .set('Authorization', `Bearer ${token}`)
    .set('user-agent', 'express-app');
  let user = userResponse.body;
  console.log('==========>', user);
  return user;
}
async function getUser(remoteUser) {
  let userRecord = {
    username: remoteUser.name,
    password: 'ltrtioyeoierdfsfdpotpr',
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
    console.log('=========>',users);
    let savedUser = await users.save();
    let serverToken = UserSchema.generateToken(userRecord);
    return [savedUser, serverToken];
  }
}