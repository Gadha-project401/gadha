'use strict';

const bearer = require('../auth/middleware/bearer-auth');
let res = {};
let next = jest.fn();

describe('bearer auth ', () => {

  it('should give error', () => {
    let req = { headers: { authorization: null } };
    bearer(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  it('should give error', () => {
    let req = { headers: { authorization: 'bearer saaassssa' } };
    bearer(req, res, next);
    expect(next).toHaveBeenCalled();
  });

});