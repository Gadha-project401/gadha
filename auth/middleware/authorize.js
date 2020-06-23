'use strict';

/**
 * This is the authorization module that is responsible for allowing users passage depending on their roles, user or admin
 * @module authorization
 */

// This is the AC (Access Control) middleware

/**
 * @function authorize
 * @param {string} role takes in the user specific role like (update,delete,read etc...)
 * @param {object} req The request object.
 * @param {object} res The response object.
 * @param {function} next The next function.
 * @property {string} model It's the destination of the schema file when it's required.
 * @property {string} path Determines the path of the request.
 * @property {string} req.user.userRole Contains information wether the user is an admin or a user
 */
module.exports = (role) => {
  return (req,res,next) => {
    
    // In order to have modular file that accepts entries from both goals and motivations schemas
    let model;
    let path = req.path.split('/')[1];
    if (path === 'goals' || path === 'motivation' || path === 'users'){
      if (path === 'users'){
        console.log('Users path, admins only');
      } else {
        model = require(`../../lib/models/${path}/${path}-schema`);
      }
    } else {
      next('Path is not allowed');
      return;
    }

    // Check for roles, if admin proceed, if user check if he has access
    try {
      if(req.user.userRole === 'admin'){
        if (role === 'read'){
          model.find({createdBy: req.user.username})
            .then(results=>{
              next();
            }).catch(err=>next(err));   
        } else {
          next();
        }
        
      }else if (req.user.userRole === 'user'){
        if (role === 'read'){
          model.find({createdBy: req.user.username})
            .then(results=>{
              next();
            }).catch(err=>next(err));

        } else if (role === 'update' || role === 'delete'){
          model.find({_id:req.params.id})
            .then(results=>{
              if (results[0] && req.user.username === results[0].createdBy){
                next();
              } else {
                next('User not allowed');
              }
            }).catch(err=>next(err));
        }
      } else {
        next('Access Denied');
      }
    } catch(e) {
      next('An error occured: ' + e);
    }
  };
};