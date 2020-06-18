'use strict';

const express = require('express');
const router = express.Router();
const user = require('../auth/models/user-schema');
const motivation = require('../lib/models/motivation/motivation-model');
const basicAuth = require('../auth/middleware/basic');
const bearerMiddleware = require('../auth/middleware/bearer-auth');
const permissions = require('../auth/middleware/authorize');

// ***************--- The Signin/Signup Routes ---***************

router.post('/signup', signup);
router.post('/signin',basicAuth, signin);
router.get('/users',bearerMiddleware,permissions('delete'),getUsers);

// ***************--- The API Routes ---***************

router.get('/motivation', getMotivation);
router.get('/motivation/:user', getMotivationUser);
router.post('/motivation', bearerMiddleware, postMotivation);
router.put('/motivation/:id', bearerMiddleware, permissions('update'), putMotivation);
router.delete('/motivation/:id', bearerMiddleware, permissions('delete'), deleteMotivation);

// ***************--- The API Functions ---***************

function getMotivation(req, res, next){
  motivation
    .get()
    .then(data => {res.status(200).json(data);})
    .catch(next);
}

function getMotivationUser(req, res, next){
  motivation
    .get(req.params.user)
    .then((data) => res.status(200).json(data))
    .catch(next);
}
    
function postMotivation(req, res, next){
//   console.log('----->>>>I am inisde post route !');
  req.body.createdBy = req.user.username;
  motivation
    .post(req.body)
    .then(data => {res.status(201).json(data);})
    .catch(next);
}
    
function putMotivation(req, res, next){
//   console.log('----->>>> testing update route ');
  motivation
    .put(req.params.id, req.body)
    .then(data => res.status(200).json(data))
    .catch(next);
  
}

function deleteMotivation(req, res, next){
//   console.log('----->>>> testing delete route ');
  motivation
    .delete(req.params.id)
    .then(data => { res.status(200).json(data);})
    .catch(next);

}   


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

