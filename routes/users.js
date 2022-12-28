const express = require('express');
const router = express.Router();
const passport = require('passport');
const flash = require('express-flash');
//const flash = require('express-session'); 

const users = require('../models/user-schema');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
// var userObj = await users.findOne({email:req.body.email});
// initializePassport(passport,userObj.email,userObj.password);

router //LOGIN ROUTE
 .route('/user-login')    
      .get((req,res)=>{ 
          res.render('user-login');
       })
      .post(async(req,res) => {
          const mail = req.body.email;
          const userObj = await users.findOne({email:mail});    
        console.log(userObj);  
        if(userObj==null){
            return res.status(400).send('cannot find user');
            }
        try{
           if(await bcrypt.compare(req.body.password,userObj.password))
           {
              res.send("login done");
            //res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
           
        }}catch{
            //res.status(500).send();
            res.send("error");
        }});
    
              
      
         
      

//SIGN-UP ROUTE
router
 .route('/user-signup')    
      .get((req,res)=>{ 
    res.render('user-signup',{users});
       })
      .post(async (req,res)=>{ 
          const hashPassword = await bcrypt.hash(req.body.password,10); 
        

          const newUser = new users({
          username:req.body.username,
          email:req.body.email,
          mobile:req.body.mobile,
          password:hashPassword
        });
        newUser.save( ).then(()=>console.log('data added to db successfully'))
       });
module.exports=router;
