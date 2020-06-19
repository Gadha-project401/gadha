'use strict';

const mongoose = require('mongoose');

const goals = mongoose.Schema({
  createdBy : { type: String, required: true , default:'anonymous' },
  title : { type: String, required: true },
  image: { type: String, required: true , default: 'https://lunawood.com/wp-content/uploads/2018/02/placeholder-image.png' },
  story : { type: String, required: true },
  createdAt: { type: String, default: new Date().toLocaleString() },
  private: { type: Boolean, default: true },
  dueBy: { type: String, required: true },
  status: { type: String, required:true, enum: ['complete', 'inprogress', 'failed'], default: 'inprogress' },
});
 
module.exports = mongoose.model('goals', goals);