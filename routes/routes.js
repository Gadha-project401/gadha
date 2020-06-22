'use strict';

const express = require('express');
const router = express.Router();
const user = require('../auth/models/user-schema');
const motivation = require('../lib/models/motivation/motivation-model');
const basicAuth = require('../auth/middleware/basic');
const bearerMiddleware = require('../auth/middleware/bearer-auth');
const permissions = require('../auth/middleware/authorize');
const oauth = require('../auth/middleware/oauth');
const linkedinOauth = require('../auth/middleware/linkedin-oauth');
const goals = require('../lib/models/goals/goals-model');
const io = require('socket.io-client');
const socket = io.connect('http://gadha-dev.herokuapp.com/',{secure: false});


// ***************--- The Signin/Signup Routes ---***************

router.post('/signup', signup);
router.post('/signin',basicAuth, signin);
router.get('/users',bearerMiddleware,permissions('delete'),getUsers);
router.get('/oauth', oauth, oauthHandler);
router.get('/oauthlinkedin', linkedinOauth, oauthHandler);


// ***************--- The API Routes ---***************

router.get('/motivation', getMotivation);
router.get('/motivation/:user', getMotivationUser);
router.post('/motivation', bearerMiddleware, postMotivation);
router.put('/motivation/:id', bearerMiddleware, permissions('update'), putMotivation);
router.delete('/motivation/:id', bearerMiddleware, permissions('delete'), deleteMotivation);

router.get('/goals', getGoals);
router.get('/goals/mine', bearerMiddleware, permissions('read'), getGoalsUser);
router.get('/goals/progress', bearerMiddleware, permissions('read'), getProgress);
router.post('/goals', bearerMiddleware, postGoals);
router.put('/goals/:id', bearerMiddleware, permissions('update'), putGoals);
router.delete('/goals/:id', bearerMiddleware,permissions('delete'), deleteGoals);


// ***************--- The API Functions motivation ---***************


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
    .then(data => {
      socket.emit('send post',data.title);
      res.status(201).json(data);})
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

// ***************--- The API Functions goals ---***************

function getGoals(req, res, next){
  goals
    .get()
    .then(data => {res.status(200).json(data);})
    .catch(next);
}

function getGoalsUser(req, res, next){  
  goals
    .get(req.user.username)
    .then((data) => res.status(200).json(data))
    .catch(next);
}
    
function postGoals(req, res, next){

  req.body.createdBy = req.user.username;
  goals
    .post(req.body)
    .then(data => {res.status(201).json(data);})
    .catch(next);
}
    
function putGoals(req, res, next){

  goals
    .put(req.params.id, req.body)
    .then(data => res.status(200).json(data))
    .catch(next);
}

function deleteGoals(req, res, next){

  goals
    .delete(req.params.id)
    .then(data => { res.status(200).json(data);})
    .catch(next);
}   

function getProgress(req,res,next){
  goals
    .get(req.user.username)
    .then((data) => {
      let count = 0;
      let complete = 0;
      let completedTasks = [];
      let incompleteTasks = [];
      if(data[0]){
        data.forEach((value,number)=>{
          if(value.status === 'complete'){
            complete+=1;
            completedTasks.push({title:value.title,doneAt: value.dueBy});
          } else {incompleteTasks.push({title:value.title,dueBy: value.dueBy});}
          count += 1;
        });
      }
      let progress = ((complete / count) * 100).toFixed(2) +'%';
      res.status(200).json({
        progress: progress,
        completed: completedTasks,
        incomplete: incompleteTasks,
      });
    })
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
function oauthHandler (req,res,next){
  res.status(200).send(req.token);
}
module.exports = router;

