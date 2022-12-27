const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const flash = require('express-session'); 

const initializePassport = require('./passportConfig');
initializePassport(passport,email=>{
  return users.find(users=>users.email==email),id=>users.find(users=>users.id);//change to db operation
})
const users = require('../models/user-schema');
const { application } = require('express');

router
 .route('/login-register')
      .get((req,res)=>{ 
    res.render('page-login-register',{users});
       })
      .post(passport.authenticate('local',{
        //passport-login
         successRedirect:'/',
         failureRedirect:'/login-register',
         failureFlash:true
      }));
module.exports=router;
