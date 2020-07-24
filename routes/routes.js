'use strict';

/**
 * @module Routes
 * @requires express
 * @requires socket.io-client
 * @requires basicAuth
 * @requires motivation-model
 * @requires authorize
 * @requires beare-auth
 * @requires goals-model
 * @requires linkedin-oauth
 * 
 */
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
const socket = io.connect('https://gadha-dev.herokuapp.com/');


const fs = require('fs'); 
const path = require('path'); 
const multer = require('multer'); 

const storage = multer.diskStorage({ 
  destination: (req, file, cb) => { 
      cb(null, __dirname +  '/uploads') 
  }, 
  filename: (req, file, cb) => { 
      cb(null, file.fieldname + '-' + Date.now()) 
  } 
}); 

const upload = multer({ storage: storage }); 


// ***************--- The Signin/Signup Routes ---***************

router.post('/signup', upload.single('image') , signup);
router.get('/signin',basicAuth, signin);
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

/**
 * @function getMotivation
 * @param {object} req The request object that will ask for the list of motivation.
 * @param {object} res The response object with the list of motivation.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function getMotivation(req, res, next){
  motivation
    .get()
    .then(data => {res.status(200).json(data);})
    .catch(next);
}

/**
 * @function getMotivationUser
 * @param {object} req The request object that will ask for the list of motivation from one user.
 * @param {object} res The response object with the list of motivation from one user.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function getMotivationUser(req, res, next){
  motivation
    .get(req.params.user)
    .then((data) => res.status(200).json(data))
    .catch(next);
}
    
/**
 * @function postMotivation
 * @param {object} req The request object that will create a new post in motivation.
 * @param {object} res The response object with the new post in motivation.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function postMotivation(req, res, next){
  req.body.createdBy = req.user.username;
  motivation
    .post(req.body)
    .then(data => {
      socket.emit('send post',data.title);
      res.status(201).json(data);})
    .catch(next);
}
   
/**
 * @function putMotivation
 * @param {object} req The request object that will update a post.
 * @param {object} res The response object with the updated post.
 * @param {function} next The next function that is responsible for the middlewares.
 * @description The users are only allowed to update their own posts, while admins can update anyone's post, pass the ID in the route.
 */
function putMotivation(req, res, next){
  motivation
    .put(req.params.id, req.body)
    .then(data => res.status(200).json(data))
    .catch(next);
  
}

/**
 * @function deleteMotivation
 * @param {object} req The request object that will delete a post.
 * @param {object} res The response object with the deleted post.
 * @param {function} next The next function that is responsible for the middlewares.
 * @description The users are only allowed to delete their own posts, while admins can delete anyone's post, pass the ID in the route.
 */

function deleteMotivation(req, res, next){
  motivation
    .delete(req.params.id)
    .then(data => { res.status(200).json(data);})
    .catch(next);

}   

// ***************--- The API Functions goals ---***************

/**
 * @function getGoals
 * @param {object} req The request object that will ask for the list of public goals.
 * @param {object} res The response object with the list of public goals.
 * @param {function} next The next function that is responsible for the middlewares.
 * @description Only public posts will be provided, private goals won't be shared.
 */
function getGoals(req, res, next){
  goals
    .get()
    .then(data => {res.status(200).json(data);})
    .catch(next);
}

/**
 * @function getGoalsUser
 * @param {object} req The request object that will ask for the list of motivation of the logged in user.
 * @param {object} res The response object with the list of goals of the logged in user.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function getGoalsUser(req, res, next){  
  goals
    .get(req.user.username)
    .then((data) => res.status(200).json(data))
    .catch(next);
}

/**
 * @function postGoals
 * @param {object} req The request object that will create a new post in goals.
 * @param {object} res The response object with the new post in goals.
 * @param {function} next The next function that is responsible for the middlewares.
 */    
function postGoals(req, res, next){

  req.body.createdBy = req.user.username;
  goals
    .post(req.body)
    .then(data => {res.status(201).json(data);})
    .catch(next);
}
    
/**
 * @function putGoals
 * @param {object} req The request object that will update a goal.
 * @param {object} res The response object with the updated goal.
 * @param {function} next The next function that is responsible for the middlewares.
 * @description The users are only allowed to update their own goals, while admins can update anyone's goals, pass the ID in the route.
 */
function putGoals(req, res, next){

  goals
    .put(req.params.id, req.body)
    .then(data => res.status(200).json(data))
    .catch(next);
}

/**
 * @function deleteGoals
 * @param {object} req The request object that will delete a goal.
 * @param {object} res The response object with the deleted goal.
 * @param {function} next The next function that is responsible for the middlewares.
 * @description The users are only allowed to delete their own posts, while admins can delete anyone's post, pass the ID in the route.
 */
function deleteGoals(req, res, next){

  goals
    .delete(req.params.id)
    .then(data => { res.status(200).json(data);})
    .catch(next);
}   

/**
 * @function getProgress
 * @param {object} req The request object that will ask for the list of public goals.
 * @param {object} res The response object with the list of public goals.
 * @param {function} next The next function that is responsible for the middlewares.
 * @description Only public posts will be provided, private goals won't be shared.
 */
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

/**
 * @function signup
 * @param {object} req The request object that will create a new user.
 * @param {object} res The response object with the username and the token.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function signup (req,res,next){
  let newUser = {
    username: req.body.username,
    fullName : req.body.fullName,
    password : req.body.password,
    gender : req.body.gender,
    country: req.body.country,
    birthday: req.body.birthday,
    createdAt: req.body.createdAt,
    img: { 
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
      contentType: 'image/png'
  } 
  }
  user
    .create(newUser)
    .then(result =>{
      let answer = {};
      answer.token = user.generateToken(result);
      answer.user = {username:result.username, password:result.password , profilePic : result.img};
      res.status(201).json(answer);
    }).catch(next);
}
  
/**
 * @function signin
 * @param {object} req The request object that will login to an account using basic authentication.
 * @param {object} res The response object with the JSON web token.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function signin(req,res,next){
  console.log(req.token);
  res.cookie('token',req.token);
  let answer = {};
  answer.token = req.token;
  answer.user = {username: req.theUserInfo.username,password:req.theUserInfo.password};
  res.status(200).json(answer);
}

/**
 * @function getUsers
 * @param {object} req The request object that will ask for list of users.
 * @param {object} res The response object with the new post in goals.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function getUsers(req,res,next){
  user.find({})
    .then(result=>{
      res.status(200).json(result);
    }).catch(next);
}

/**
 * @function oauthHandler
 * @param {object} req The request object that will be responsible for the OAuth handshakes.
 * @param {object} res The response object with the token to login.
 * @param {function} next The next function that is responsible for the middlewares.
 */
function oauthHandler (req,res,next){
  res.status(200).send(req.token);
}
module.exports = router;

