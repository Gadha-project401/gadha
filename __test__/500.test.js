'use strict';

const serverErrorHandler = require('../middleware/500');

describe('Check if the not found handler works fine',()=>{
  let req = {};
  let err;
  let res = {status: function(status){
    this.status = status;
    return this;
  }, send: ()=>{}};
  let next;

  it('Testing if the server error handler returns a status code of 500',()=>{
    serverErrorHandler(err,req,res,next);
    expect(res.status).toBe(500);
  });

});
