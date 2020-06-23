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
  createdAt:{type:String, default:new Date().toLocaleString()},
  
});

module.exports = mongoose.model('motivation', motivation);