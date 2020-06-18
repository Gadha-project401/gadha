'use strict';

const bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const TOKEN_TIMEOUT = process.env.TOKEN_TIMEOUT || '7d';
const SECRET = process.env.SECRET || 'sd5346dg8adDhZ56w4e';

const users = mongoose.Schema({
  username: { type : String , unique : true, required : true},
  password:{type:String,required:true},
  role:{type:String, enum:['user', 'admin'], default:'user'},
});

let roles = {
  admin: ['read','create','update','delete'],
  user: ['read','create','update','delete'],
};



users.pre('save',async function(){
  this.password = await bcrypt.hash(this.password,10);
});

users.statics.authenticateBasic = async function(username,password){
  let theUser = await this.find({username:username});
  let valid = await bcrypt.compare(password,theUser[0].password);
  return valid ? theUser : Promise.reject();
};

users.statics.generateToken = function(user){
  let token = jwt.sign({username: user.username ,_id:user._id,userRole:user.role ,role:roles[user.role]},SECRET,{expiresIn:TOKEN_TIMEOUT});
  return token;
};

users.statics.verifyToken = function (token){
  return jwt.verify(token,SECRET, async function(err,decoded){
    if(err){
      console.log('This is not a valid token: ' + err);
      return Promise.reject(err);
    }

    // console.log('the decoded value is: ');
    // console.log(decoded);
    let username = decoded.username;
    let theUser = await mongoose.model('users',users).find({username:username});
    // console.log(theUser);

    if(theUser[0]){
      return Promise.resolve(decoded);
    }
    return Promise.reject();
  });
};

module.exports = mongoose.model('users',users);