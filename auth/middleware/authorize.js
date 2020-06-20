'use strict';
// This is the AC (Access Control) middleware

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