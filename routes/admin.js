const express = require("express");
const router = express.Router();
const flash = require("express-flash");
const adminController = require("../controllers/admin");
const users = require("../models/user-schema");
const bcrypt = require("bcrypt");

router.get('/dashboard', adminController.adminDashboard); //sign-up POST

router.get('/user-list', adminController.userlist); //sign-up POST

module.exports = router;