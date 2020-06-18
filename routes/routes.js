'use strict';

const express = require('express');
const router = express.Router();
const user = require('../auth/models/user-schema');
const basicAuth = require('../auth/middleware/basic');
const bearerMiddleware = require('../auth/middleware/bearer-auth');
const permissions = require('../auth/middleware/authorize');

// ***************--- The Signin/Signup Routes ---***************

router.post('/signup', signup);
router.post('/signin',basicAuth, signin);
router.get('/users',bearerMiddleware,permissions('delete'),getUsers);




// ***************--- The Sign up Functions ---***************

function signup (req,res,next){
  user
    .create(req.body)
    .then(result =>{
      let answer = {};
      answer.token = user.generateToken(result);
      answer.user = {username:result.username, password:result.password};
      res.status(201).json(answer);
    }).catch(next);
}
  
function signin(req,res,next){
  console.log(req.token);
  res.cookie('token',req.token);
  let answer = {};
  answer.token = req.token;
  answer.user = {username: req.theUserInfo.username,password:req.theUserInfo.password};
  res.status(200).json(answer);
}

function getUsers(req,res,next){
  user.find({})
    .then(result=>{
      res.status(200).json(result);
    }).catch(next);
}

module.exports = router;

