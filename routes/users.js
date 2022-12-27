const express = require('express');
const router = express.Router();
const initializePassport = require('./passportConfig');
const users = require('../models/user-schema');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser')
router //LOGIN ROUTE
 .route('/user-login')    
      .get((req,res)=>{ 
          res.render('user-login',{users});
       })
      .post((req,res)=>{ //user-signup
         res.send("control in LOGIN POST");
      })

//SIGN-UP ROUTE
router
 .route('/user-signup')    
      .get((req,res)=>{ 
    res.render('user-signup',{users});
       })
      .post(async (req,res)=>{   
                                           //USER-SIGNUP-FORM HANDLING-POST
          var userInfo= req.body;
  

        //hashing password
            try{
             var hashedPassword = await bcrypt.hash(userInfo.password,10);// 10-salt rounds
            }catch{
              console.log("error");
            }
         if(!userInfo.username||!userInfo.email||!userInfo.password)
            {
                console.log("enter all details")
             }
             else{
                {
                    var newUser = new users({
                       username: userInfo.username,
                       password: hashedPassword,
                       email:userInfo.email,
                       mobile:userInfo.mobile,
                       
                    });
         newUser.save(function(err,newUser){
                       if(err)
                          res.send(err);
                       else
                        // res.redirect('/');
                        res.send("Data base entry done");
                    });
                 }
             }



      })



module.exports=router;
