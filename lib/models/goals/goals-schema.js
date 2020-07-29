'use strict';

/**
 * schema for motivation
 * @module goalsSchema
 */
/**
 * @requires mongoose
 */
/**
  * @property {String} createdBy - The user who created the post
  * @property {String} title - The post title
  * @property {String} image - Attach an image to your post
  * @property {String} story - The goal's description
  * @property {String} createdAt - The time the post was created
  * @property {Boolean} private - Choose your post privacy (Public, Private)
  * @property {String} dueBy - Set an estimated time to achieve your goal
  * @property {String} status - The goal's current status (complete, inprogress, failed)
  */

const mongoose = require('mongoose');

const goals = mongoose.Schema({
  createdBy : { type: String, required: true , default:'anonymous' },
  title : { type: String, required: true },
  image: { type: String, required: true , default: 'https://lunawood.com/wp-content/uploads/2018/02/placeholder-image.png' },
  story : { type: String, required: true },
  createdAt: { type: String, default: new Date().toLocaleString() },
  private: { type: Boolean, default: true },
  dueBy: { type: String, required: true },
  status: { type: String, required:true, enum: ['complete', 'inprogress', 'todo'], default: 'inprogress' },
},
{toObject: {virtuals: true}, toJSON: {virtuals:true}}
);

goals.virtual('virtualOwner',{
  ref: 'users',
  localField:'createdBy',
  foreignField:'username',
  justOne:true
})

goals.pre('find', async function (){
  this.populate('virtualOwner');
})

goals.post('save', async function (){
  await this.populate('virtualOwner').execPopulate();
})

/**
 * @method pre - Data Validation
 * @param {Date} dueByValue - Date Validation
 */

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