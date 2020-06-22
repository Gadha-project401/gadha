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

goals.pre('save',async function(){
  // Data validation, check if the entered value was a number and not over 3650 days (10 years)

  let dueByValue = parseInt(this.dueBy);
  if(isNaN(dueByValue) || dueByValue > 3650 || dueByValue <= 0){
    throw new Error('DueBy date error, please enter number of days which are less than 3650 and more than 0.');
  }
  // Add the entered days to the due by date.
  
  let date = new Date();
  date.setDate(date.getDate()+ dueByValue);
  this.dueBy = date.toLocaleDateString();
});

 
module.exports = mongoose.model('goals', goals);