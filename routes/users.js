const express = require("express");
const UserController = require("../controllers/users");
//const flash = require('express-session');
const users = require("../models/user-schema");
const bcrypt = require("bcrypt");
const router = express.Router();

const bodyParser = require("body-parser");



router.get('/login', UserController.loginPage); //login User render

router.get('/', UserController.IndexPage); //user index render   -LANDING PAGE

router.post('/login', UserController.loginUser); // login post

router.get('/otpPage', UserController.otpPage); // otp page render

router.get('/sign-up', UserController.signUpPage); //sign-up page render

router.post('/sign-up', UserController.signupUser); //sign-up POST

router.get('/reqOtp', UserController.reqOtp); //otp twilio get

router.post('/verifyOtp', UserController.verifyOtp); // verify otp twilio post 

router.get('/userSignout', UserController.userSignOut); // user signout

router.get('/productDetails/:id', UserController.productDetails); // user signout

router.get('/productDetails/:id', UserController.productDetails); // user signout

router.post('/postcart', UserController.postCart); // post cart 

router.get('/getcart', UserController.getCart); // cart display 



// router.use(verifyLogin)


  
   
module.exports = router;
