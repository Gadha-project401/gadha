'use strict';
const { server } = require('../lib/server');
const supergoose = require('@code-fellows/supergoose');
const mockRequest = supergoose(server);

jest.spyOn(global.console, 'log');

let token = null;
let adminUser = null;
   
it('should /signup as an admin role', () => {
  let testData = {
    username: 'adminUser',
    fullName: 'anaszain',
    password: '66',
    role: 'admin',
    gender: 'male',
    country: 'jordan',
    birthday: '1/1/2000',
  };
  return mockRequest
    .post('/signup')
    .send(testData)
    .then(data => {
      adminUser = data.body.user.username;
        
      expect(data.status).toBe(201);
    });
});

it('should  /signin as an admin role', () => {
    
  return mockRequest
    .get('/signin')
    .set('Authorization', `Basic YWRtaW5Vc2VyOjY2`)
    .then(data => {
      token = data.body.token;
      expect(data.status).toBe(200);
    });
});

it('should get /users', () => {
  return mockRequest
    .get(`/users`)
    .set('Authorization', `Bearer ${token}`)
    .then(results => {
      expect(results.status).toBe(200);
    });
});
  

it('should get /motivation/:user', () => {
  return mockRequest
    .get(`/motivation/${adminUser}`)
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
