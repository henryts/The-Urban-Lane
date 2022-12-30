const users = require("../models/user-schema");
const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const oneDay = 1000 * 60 * 60 * 24;

//**********HOME PAGE RENDER*****/

exports.home = (req, res) => {
  res.render("user/index");
};
//****USER LOGIN POST*****
exports.loginUser = async (req, res) => {
  const mail = req.body.email;
  const userObj = await users.findOne({ email: mail });
  console.log(userObj);
  if (userObj == null) {
    return res.status(400).send("cannot find user");
  }
  if(userObj.block==true)
  {
    res.send("user is blocked");
    res.redirect('/login');
  }
  try {
    if (await bcrypt.compare(req.body.password, userObj.password)) {
      console.log(req.session);
      res.render("user/index");
    }
  } catch {
    //res.status(500).send();
    res.send("error");
  }
};

//********LOGIN PAGE RENDER**********
exports.loginPage = (req, res) => {

  res.render("user/user-login");
};
//********USER SIGNUP PAGE RENDER**********
exports.signUpPage = (req, res) => {
  res.render("user/user-signup");
};
//********SIGNUP PAGE POST**********
exports.signupUser = async (req, res) => {
  const hashPassword = await bcrypt.hash(req.body.password, 10);

  const newUser = new users({
    username: req.body.username,
    email: req.body.email,
    mobile: req.body.mobile,
    password: hashPassword,
    block:0
  });
  newUser.save(function (err, newUser) {
    if (err) res.send("db error");
    else res.redirect("/login");
  }); //.then(() => console.log("data added to db successfully"));
};

