const express = require("express");
const UserController = require("../controllers/users");
//const flash = require('express-session');
const users = require("../models/user-schema");
const bcrypt = require("bcrypt");
const router = express.Router();

const bodyParser = require("body-parser");

router.get('/', UserController.home); //home

router.get('/login', UserController.loginPage); //login User render

router.post('/login', UserController.loginUser); // login post

router.get('/sign-up', UserController.signUpPage); //sign-up page render

router.post('/sign-up', UserController.signupUser); //sign-up POST

router.get('/reqOtp', UserController.reqOtp); //otp twilio get

router.post('/verifyOtp', UserController.verifyOtp); // verify otp twilio post
// router.use(verifyLogin)


  
   
module.exports = router;
