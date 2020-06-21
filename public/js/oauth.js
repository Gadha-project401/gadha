'use strict';

// Google OAuth
let URL = 'https://accounts.google.com/o/oauth2/v2/auth';
let options = {
  scope: 'email profile',
  response_type: 'code',
  redirect_uri: 'http://localhost:3000/oauth',
  client_id: '198802182058-hkdf775258tu1ch58721ghinja5audfc.apps.googleusercontent.com',
};
let QueryString = Object.keys(options).map((key) => {
  return `${key}=` + encodeURIComponent(options[key]);
}).join('&');
let authURL = `${URL}?${QueryString}`;
let link = document.getElementById('oauth');
link.setAttribute('href', authURL);

// LinkedIn OAuth

let linkedinURL = 'https://www.linkedin.com/oauth/v2/authorization';
let optionsLi = {
  scope: 'r_liteprofile r_emailaddress',
  response_type: 'code',
  redirect_uri: 'http://localhost:3000/oauthlinkedin',
  client_id: '77jtgcl3okd9b0',
};
let linkedinQueryString = Object.keys(optionsLi).map((key) => {
  return `${key}=` + encodeURIComponent(optionsLi[key]);
}).join('&');
let linkedinAuthURL = `${linkedinURL}?${linkedinQueryString}`;
let linkedinLink = document.getElementById('oauthLI');
linkedinLink.setAttribute('href', linkedinAuthURL);
