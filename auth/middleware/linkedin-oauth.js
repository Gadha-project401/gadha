'use strict';

/**
 * 
 * @module linkedInOAuth
 * @requires superagent
 * @requires user-schema
 * @requires dotenv
 */

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

/**
 * @async
 * @param {string} code This is the retrieved code from LinkedIn after a user signs in.
 * @property {string} client_id This is the client ID that was given in the linkedIn app.
 * @property {string} client_secret This is the client secret that was given in the linkedIn app.
 * @property {string} redirect_uri This is where the token will be redirected to.
 * @property {string} code This is the code that was given to us from linkedin after the user logged in.
 * @description After a user logs in, we post to the linkedIn token URL with properties so we can get a token back
 * @returns {string} It returns an access token that can be used to access user information from linkedin.
 */
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

/**
 * @async
 * @param {string} token This is the token that we got in the previous step.
 * @description After a user logs in, we can use that token to retrieve the user's data from linkedin database.
 * @returns {object} The user information like his name and E-mail.
 */
async function getRemoteUserInfo(token) {
  let userResponse = await superagent
    .get(LINKEDIN_REMOTE)
    .set('Authorization', `Bearer ${token}`)
    .set('user-agent', 'express-app');
  let user = userResponse.body;
  return user;
}

/**
 * @async
 * @param {object} remoteUser After we get the user information, we want to save it in our database.
 * @property {string} username We combine the first name and the last name without spaces to create our username.
 * @property {string} fullName This is the full name of the use that was provided to us by linkedin.
 * @property {string} gender This is the gender of the user, linkedin doesn't provide it so we store it as unspecified until the user wants to change his data.
 * @property {string} role This is the user's role, it's always user and not admin.
 * @property {string} birthday This is the users birthday, linkedin doesnt share this information so we use a filler until the user changes it himself.
 * @description After a user object has been created, we check if the user is already signed up, if yes we give him a user sign in token, if not we save that use to the database and give him a token after that.
 * @returns {object} Returns both user object and the token
 */
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