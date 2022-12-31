const express = require("express");
const router = express.Router();
const flash = require("express-flash");
const adminController = require("../controllers/admin");
const users = require("../models/user-schema");
const bcrypt = require("bcrypt");


router.get('/adminlogin', adminController.adminLoginPage); //admin login page display

router.post('/adminlogin',adminController.adminLogin);

//admin login POST METHOD

router.get('/dashboard', adminController.adminDashboard); //admin dashboard -index

router.get('/user-list', adminController.userlist); //user list

router.post('/user-list', adminController.blockUser); //block user

router.get('/categoryView',adminController.categoryView); //catogories

router.post('/categoryPost',adminController.categoryPost); //catogories

module.exports = router;