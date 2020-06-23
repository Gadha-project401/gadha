'use strict';

/**
 * schema for motivation
 * @module motivationModel
 */

class Model{
  /**
   * Model Constructor
   * @param {Object} schema - Mongo motivation schema
   */
  
  constructor(schema){
    this.schema = schema;
  }
  /**
   * 
   * @param {String} user - Mongo record of user
   * @returns {Object}
   */

  get(user){
    let queryObject = user ? {createdBy: user} : {};
    return this.schema.find(queryObject);
  }
  /**
   * 
   * @param {String} _id - Mongo record of _id
   * @returns {String} 
   */

  getID(_id){
    return this.schema.find({_id:_id});
  }
  /**
   * 
   * @param {Object} record - Matching schema format
   * @returns {Object}
   */

  post(record) {
    let newRecord = new this.schema(record);
    // console.log(record);
    // console.log('here qw ajajaj',newRecord);
    
    return newRecord.save();
  }
  /**
   * 
   * @param {String} _id - Mongo recors of _id
   * @param {Object} record - Schema record of the object
   * @returns {Object}
   */

  put(_id, record) {
    return this.schema.findByIdAndUpdate(_id, record, {new: true});
  }
  /**
   * 
   * @param {String} _id - Mongo record of _id
   * @returns {String}
   */
  
  delete(_id) {
    return this.schema.findByIdAndDelete(_id);
  }

}


module.exports = Model;
