'use strict';
// This is the AC (Access Control) middleware
const  model = require('../../lib/models/motivation/motivation-schema');

module.exports = (role) => {
  return (req,res,next) => {
    try {
      if(req.user.userRole === 'admin'){
        next();
      }else if (req.user.userRole === 'user'){
        // console.log('hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
        model.find({_id:req.params.id})
          .then(results=>{
            if (req.user.username === results[0].createdBy){
              next();
            } else {
              next('User not allowed');
            }
          });
      } else {
        next('Access Denied');
      }
    } catch(e) {
      next('An error occured: ' + e);
    }
  };
};