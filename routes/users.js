const express = require('express');
const router = express.Router();
const initializePassport = require('./passportConfig');
const users = require('../models/user-schema');
router
 .route('/login-register')
      .get((req,res)=>{ 
    res.render('page-login-register',{users});
       })
      .post((req,res)=>{ //passport-login
        
      })
module.exports=router;
