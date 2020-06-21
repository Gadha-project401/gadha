'use strict';

const { server } = require('../lib/server');
const supergoose = require('@code-fellows/supergoose');
const mockRequest = supergoose(server);

jest.spyOn(global.console, 'log');
let idMOtivation = null;
let idGoals = null;
let userMotivation = 'undifined';
let token = null;


require('dotenv').config();

describe('server.js', () => {
  
    
  it('should get /', () => {
    return mockRequest
      .get('/')
      .then(results => {
        expect(results.status).toBe(200);
      });
  });
    
    
    
    
  it('should /signup as a user role', () => {
    let testData = {
      username: 'testuser',
      fullName: 'shshshsh',
      password: '55',
      gender: 'male',
      country: 'jordan',
      birthday: '1/1/2000',
    };
    return mockRequest
      .post('/signup')
      .send(testData)
      .then(data => {
        userMotivation = data.body.user.username;
        expect(data.status).toBe(201);
      });
  });

  it('should  /signin as a user role', () => {
    
    return mockRequest
      .post('/signin')
      .set('Authorization', `Basic dGVzdHVzZXI6NTU=`)
      .then(data => {
        token = data.body.token;
        expect(data.status).toBe(200);
      });
  });

  

  it('should  /signin as a user role', () => {
    
    return mockRequest
      .post('/signin')
      .set('Authorization', `Basic dhkhdfjkdhkdkh`)
      .then(data => {
        expect(data.status).toBe(500);
      });
  });


  it('should get /motivation', () => {
    return mockRequest
      .get('/motivation')
      .then(results => {
        expect(results.status).toBe(200);
      });
  });

  it('should post /motivation', () => {
    let testObj = {  title: 'anas', story: 'anas' };
    return mockRequest
      .post('/motivation')
      .set('Authorization', `Bearer ${token}`)  
      .send(testObj)
      .then(results => {
        idMOtivation = results.body._id;
        expect(results.status).toBe(201);
        Object.keys(testObj).forEach(key => {
          expect(results.body[key]).toEqual(testObj[key]);
        });
      });
  });
    
  it('should get /motivation/:id', () => {
    return mockRequest
      .get(`/motivation/${idMOtivation}`)
      .then(results => {
        expect(results.status).toBe(200);
      });
  });

  it('post() failure /motivation', ()=> {
    let obj = {title: 'test-post-1'};
    return mockRequest
      .post('/motivation')
      .send(obj)
      .then(data => {
        expect(data.status).toBe(500);
      });
  });

  it('should PUT /motivation/:id', () => {
    let testObj = { title: 'test user', story: 'test test 1 updated' };
    return mockRequest
      .put(`/motivation/${idMOtivation}`, testObj)
      .set('Authorization', `Bearer ${token}`)  
      .send(testObj)
      .then(results => {
        expect(results.status).toBe(200);
        Object.keys(testObj).forEach(key => {
          expect(results.body[key]).toEqual(testObj[key]);
        });
      });
  });

  it('should delete /motivation/:id', () => { 
    return mockRequest
      .delete(`/motivation/${idMOtivation}`)
      .set('Authorization', `Bearer ${token}`) 
      .then(results => {
        expect(results.status).toBe(200);
      });
  });


  
  it('should get /motivation/:user', () => {
    return mockRequest
      .get(`/motivation/${userMotivation}`)
      .then(results => {
        expect(results.status).toBe(200);
      });
  });

 

  // *******************************************************************

  it('should respond properly /goals', () => {
    return mockRequest
      .get('/goals')
      .set('Authorization', `Bearer ${token}`)
      .then(results => {
        expect(results.status).toBe(200);
      });
  });
 
  it('should respond properly /goals/mine', () => {
    return mockRequest
      .get('/goals/mine')
      .set('Authorization', `Bearer ${token}`)
      .then(results => {
        expect(results.status).toBe(200);
      });
  });


  it('should post /goals', () => {
    let testObj = { title: 'anas', story: 'anas', image: 'hhh', private: true, dueBy: '1/1/2022', status: 'inprogress' };
    return mockRequest
      .post('/goals')
      .set('Authorization', `Bearer ${token}`)  
      .send(testObj)
      .then(results => {
        idGoals = results.body._id;
        expect(results.status).toBe(201);
        Object.keys(testObj).forEach(key => {
          expect(results.body[key]).toEqual(testObj[key]);
        });
      });
  });

  it('should PUT /goals/:id', () => {
    let testObj = { title: 'anas', story: 'anas', image: 'hhh', private: true, dueBy: '1/1/2022', status: 'inprogress' };
    return mockRequest
      .put(`/goals/${idGoals}`)
      .set('Authorization', `Bearer ${token}`)  
      .send(testObj)
      .then(results => {
        expect(results.status).toBe(200);
        Object.keys(testObj).forEach(key => {
          expect(results.body[key]).toEqual(testObj[key]);
        });
      });
  });

  it('TEST post() failure /goals ', ()=> {
    let obj = {title: 'test-post-1'};
    return mockRequest
      .post('/goals')
      .send(obj)
      .then(data => {
 
        expect(data.status).toBe(500);
      });
  });

  it('should delete /goals/:id', () => { 
    return mockRequest
      .delete(`/goals/${idGoals}`)
      .set('Authorization', `Bearer ${token}`) 
      .then(results => {
        expect(results.status).toBe(200);
      });
  });

  it('should return an error because birthday is invalid', () => {
    let testData = {
      username: 'errorUser',
      fullName: 'shshshsh',
      password: '55',
      gender: 'male',
      country: 'jordan',
      birthday: '33/33/3333',
    };
    return mockRequest
      .post('/signup')
      .send(testData)
      .then(data => {
        expect(data.status).toBe(500);
      });
  });


});