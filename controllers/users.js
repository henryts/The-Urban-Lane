const users = require("../models/user-schema");
const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");
const oneDay = 1000 * 60 * 60 * 24;
let otpgen ;

//**********HOME PAGE RENDER*****/
module.exports = {
home: (req, res) => {
  res.render("user/index");
},
//****USER LOGIN POST*****
loginUser: async (req, res) => {
  const mail = req.body.email;
  const userObj = await users.findOne({ email: mail });
  
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
     
      
      res.render("user/otp-login");
    }
  } catch {
    //res.status(500).send();
    res.send("error");
  }
},

//********LOGIN PAGE RENDER**********
loginPage : (req, res) => {

  res.render("user/user-login");
},
//********USER SIGNUP PAGE RENDER**********
signUpPage :(req, res) => {
  res.render("user/user-signup");
},
//********SIGNUP PAGE POST**********
signupUser : async (req, res) => {
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
},

reqOtp: async(req,res)=>{
       const accountSid = "ACb8ac9111ac07e1d91a356ed1793fb2c8";
       const authToken = "ac8e81cb6816dbb8880138ff4f8815aa";
       const client = require("twilio")(accountSid, authToken);
       otpgen = Math.floor(1000 + Math.random() * 9000);

    client.messages
    .create({ body: `Your OTP is ${otpgen}`, from: "+17652348786", to: "+916282383283" })
      .then(message => console.log(message.sid));
     // otpgen = processOtp(otpgen); 
    },
    verifyOtp: (req,res)=>{
      const otp1 = req.body.otp1;
      const otp2 = req.body.otp2;
      const otp3 = req.body.otp3;
      const otp4 = req.body.otp4; 
      const otp = otp1 + otp2 + otp3 + otp4 ;

      console.log(otpgen);
      if(otpgen==otp){
        console.log("otp verified");
        res.render("user/index");
      }
      else{
        res.send("wrong otp");
      }

    }
  
 


}
function processOtp(otp){
  return otp;
}








