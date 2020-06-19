'use strict';

class Model{
  
  constructor(schema){
    this.schema = schema;
  }

  get(user){
    let queryObject = user ? {createdBy: user} : {private:false};
    return this.schema.find(queryObject);
  }
  
  post(record) {
    let newRecord = new this.schema(record);
    // console.log(record);
    return newRecord.save();
  }
  
  put(_id, record) {
    return this.schema.findByIdAndUpdate(_id, record, {new: true});
  }
  
  delete(_id) {
    return this.schema.findByIdAndDelete(_id);
  }

}


module.exports = Model;
