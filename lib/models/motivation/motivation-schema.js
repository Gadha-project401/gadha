'use strict';

/**
 * schema for motivation
 * @module motivationSchema
 */

/**
  * @property {String} createdBy - The user who created the post
  * @property {String} title - The post title
  * @property {String} story - The mtivational story
  * @property {String} createdAt - The time the post was created
  */


const mongoose = require('mongoose');


const motivation = mongoose.Schema({
  createdBy : { type: String, required: true , default:'anonymous' },
  title : { type: String, required: true },
  story : { type: String, required: true },
  likes : {type:number, default:0},
  createdAt:{type:String, default:new Date().toLocaleString()},
},
{toObject: {virtuals: true}, toJSON: {virtuals:true}}
);

motivation.virtual('virtualOwner',{
  ref: 'users',
  localField:'createdBy',
  foreignField:'username',
  justOne:true
})

motivation.pre('find', async function (){
  this.populate('virtualOwner');
})

motivation.post('save', async function (){
  await this.populate('virtualOwner').execPopulate();
})


module.exports = mongoose.model('motivation', motivation);