'use strict';

const schema = require('./goals-schema');
const Model = require('./model');

class Motivation extends Model{
  constructor(){
    super(schema);
  }
}

module.exports = new Motivation(schema);