'use strict';

const basic = require('../auth/middleware/basic');
let res = {};
let next = jest.fn();

describe('basic auth', () => {

  it('should give an error', () => {
    let req = { headers: { authorization: null } };
    basic(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should give an error', () => {
    let req = { headers: { authorization: 'Basic ssssaaa' } };
    basic(req, res, next);
    expect(next).toHaveBeenCalled();
  });

});