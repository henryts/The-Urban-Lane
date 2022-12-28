const express = require("express");
const router = express.Router();
const passport = require("passport");
const flash = require("express-flash");
const UserController = require("../controllers/users");
//const flash = require('express-session');
const users = require("../models/user-schema");
const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");

router.get('/', UserController.home); //home

router.get('/login', UserController.loginUser); //login User render

router.post('/login', UserController.loginUser); // login post

router.get('/sign-up', UserController.signupUser); //sign-up page render

router.get('/sign-up', UserController.signupUser); //sign-up POST



  
   
module.exports = router;
