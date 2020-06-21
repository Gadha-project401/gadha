'use strict';

const bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const TOKEN_TIMEOUT = process.env.TOKEN_TIMEOUT || '7d';
const SECRET = process.env.SECRET || 'sd5346dg8adDhZ56w4e';

const users = mongoose.Schema({
  username: { type :String , unique : true, required : true,lowercase:true},
  fullName: {type:String,required:true},
  password:{type:String,required:true},
  gender: {type:String, required:true, lowercase:true, enum:['female','male','unspecified']},
  role:{type:String,lowercase:true, enum:['user', 'admin'], default:'user'},
  country:{type:String,lowercase:true,required:true,default:'jordan'},
  birthday:{type:String, required:true},
  createdAt:{type:String, default:new Date().toLocaleString()},
});

let roles = {
  admin: ['read','create','update','delete'],
  user: ['read','create','update','delete'],
};



users.pre('save',async function(){
  this.password = await bcrypt.hash(this.password,10);
  let birthDate = this.birthday.split('/');
  if(birthDate[1] > 12 || birthDate[1] < 0 || birthDate[0] > 31 || birthDate[0] < 1 || birthDate[2] > 2020 || birthDate[2] < 1900){
    throw new Error('Please use a valid birthday, with DD/MM/YYYY Format.');
  }
  this.birthday = new Date(birthDate[2],birthDate[1],birthDate[0]).toLocaleDateString();
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