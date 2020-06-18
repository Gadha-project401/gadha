'use strict';

const mongoose = require('mongoose');


const motivation = mongoose.Schema({
  createdBy : { type: String, required: true , default:'anonymous' },
  title : { type: String, required: true },
  story : { type: String, required: true },
  createdAt:{type:String, default:new Date().toLocaleString()},
  
});

module.exports = mongoose.model('motivation', motivation);