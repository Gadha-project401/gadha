'use strict';

const notFoundHandler = require('../middleware/404');

describe('Check if the not found handler works fine',()=>{
  let req = {};
  let res = {status: function(status){
    this.status = status;
    return this;
  }, send: ()=>{}};
  let next;

  it('Testing if the not found handler returns a status code of 404',()=>{
    notFoundHandler(req,res,next);
    expect(res.status).toBe(404);
  });

});
