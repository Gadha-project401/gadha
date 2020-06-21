'use strict';

require('@code-fellows/supergoose');

const Model = require('../lib/models/goals/model');
const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
  name: { type: String, required: true },
});

let testModel = mongoose.model('testSchema', testSchema);
let testClass = new Model(testModel);



describe('models', () => {

  afterEach(async () => {
    await testModel.deleteMany();
  });
  
  
  it('should post() ', () => {
    let testObj = { name: 'test 3' };
    return testClass.post(testObj)
      .then(data => {
        Object.keys(testObj).forEach(key => {
          expect(data[key]).toEqual(testObj[key]);
        });
      });
  });

  it('should put() ', () => {
    let testObj = { name: 'test 4 ' };
    let updateTestObj = { name: 'test 4 updated' };
    return testClass.post(testObj)
      .then(postedData => {
        return testClass.put(postedData._id, updateTestObj)
          .then(data => {
            Object.keys(testObj).forEach(key => {
              expect(data[key]).toEqual(updateTestObj[key]);
            });
          });
      });
  });

  it('should delete() ', () => {
    let testObj = { name: 'test 5 updated' };
    return testClass.post(testObj)
      .then(postedData => {
        return testClass.delete(postedData._id)
          .then(() => {
            return testClass.get()
              .then(data => {
                data.forEach(element => {
                  Object.keys(testObj).forEach(key => {
                    expect(element[key]).not.toEqual(testObj[key]);
                  });
                });
              });
          });
      });
  });
});