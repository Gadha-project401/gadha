'use strict';

/**
 * schema for motivation
 * @module goalsModel
 */


class Model{
  /**
   * Model Constructor
   * @param {Object} schema - mongo goals schema
   */

  constructor(schema){
    this.schema = schema;
  }
  /**
   * 
   * @param {String} user - mongo record of user
   * @returns {String}
   */

  get(user){
    let queryObject = user ? {createdBy: user} : {private:false};
    return this.schema.find(queryObject);
  }
  /**
   * 
   * @param {Object} record - matching schema format
   * @returns {Object}
   */
  
  post(record) {
    let newRecord = new this.schema(record);
    // console.log(record);
    return newRecord.save();
  }
  /**
   * 
   * @param {String} _id - mongo recors of _id
   * @param {Object} record - schema record of the object
   * @returns {Object}
   */
  
  put(_id, record) {
    return this.schema.findByIdAndUpdate(_id, record, {new: true});
  }
  /**
   * 
   * @param {String} _id - mongo record of _id
   * @returns {String}
   */
  
  delete(_id) {
    return this.schema.findByIdAndDelete(_id);
  }

}


module.exports = Model;
