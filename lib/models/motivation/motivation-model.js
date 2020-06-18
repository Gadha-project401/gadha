'use strict';

const schema = require('./motivation-schema');
const Model = require('./model');

class Motivation extends Model{
  constructor(){
    super(schema);
  }
}

module.exports = new Motivation(schema);