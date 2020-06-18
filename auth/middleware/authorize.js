'use strict';
// This is the AC (Access Control) middleware

module.exports = (role) => {
  return (req,res,next) => {
    try {
      if(req.user.userRole === 'admin'){
        if(req.user.role.includes(role)){
          next();
        }
      } else {
        next('Access Denied');
      }
    } catch(e) {
      next('An error occured: ' + e);
    }
  };
};