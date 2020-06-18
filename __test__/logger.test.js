'use strict';

const logger = require('../middleware/logger');

describe('Testing the logger middleware', () => {

  let spy;
  let req = {};
  let res = {};
  let next = jest.fn();
    
  beforeEach(()=> {
    spy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(()=> {
    spy.mockRestore();
  });

  it ('log the output', ()=> {
    logger(req, res, next);
    expect(spy).toHaveBeenCalled();
  });

  it('executing the next function', ()=> {
    logger(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
