const userModel = require("../models/user-schema");
const users=userModel.User;
const cartCollections = userModel.cartCollection;
const express = require("express");
const mongooseModels = require("../models/admin-schema");
const newProduct = mongooseModels.products;
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");

const oneDay = 1000 * 60 * 60 * 24;
let piDisp ;

module.exports = {
  //****USER LOGIN POST*****
     loginUser: async (req, res) => {
    const mail = req.body.email;
    userObj = await users.findOne({ email: mail });

    if (userObj == null) {
      return res.status(400).send("cannot find user");
    }
    if (userObj.block == true) {
      res.send("user is blocked");
      res.redirect("/login");
    }
    try {
      if (await bcrypt.compare(req.body.password, userObj.password)) {
        req.session.loggedIn = true;
        req.session.userid = userObj; //session issue -to be given at otp page
        //console.log(req.session.userid);
        res.redirect("/otpPage");
        //this.reqOtp();
      }
    } catch {
      //res.status(500).send();
      res.send("error");
    }
  },

  otpPage: (req, res) => {
    //otp  page render
    if (req.session.loggedIn) {
      res.render("user/otp-login");
    } else {
      res.send("wrong credentials");
    }
  },

  //********LOGIN PAGE RENDER**********
  loginPage: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/user-login");
    }
  },
  //********Index PAGE RENDER-----redirect-login**********
  IndexPage: async (req, res) => {
    pData = await newProduct.find({});

    if (req.session.loggedIn) {
      uid = req.session.userid;
      res.render("user/index", { uid, pData });
    } else {
      res.render("user/index", { pData });
    }
  },
  //********USER SIGNUP PAGE RENDER**********
  signUpPage: (req, res) => {
    res.render("user/user-signup");
  },
  //********SIGNUP PAGE POST**********
  signupUser: async (req, res) => {
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new users({
      username: req.body.username,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashPassword,
      block: 0,
    });
    newUser.save(function (err, newUser) {
      if (err) res.send("db error");
      else res.redirect("/login");
    }); //.then(() => console.log("data added to db successfully"));
  },

  reqOtp: async (req, res) => {           //otp request post method twilio /\/  /\/
    //otp generation twilio get
    const accountSid = "ACb8ac9111ac07e1d91a356ed1793fb2c8";
    const authToken = "ac8e81cb6816dbb8880138ff4f8815aa";
    const client = require("twilio")(accountSid, authToken);
    otpgen = Math.floor(1000 + Math.random() * 9000);
     client.messages
      .create({
        body: `Your OTP is ${otpgen}`,
        from: "+17652348786",
        to: "+916282383283",
      })
      .then((message) => console.log(message.sid));
    // otpgen = processOtp(otpgen);
  },
  verifyOtp: async (req, res) => {      // otp verification -post method
    //verify otp login -post method
    const otp1 = req.body.otp1;
    const otp2 = req.body.otp2;
    const otp3 = req.body.otp3;
    const otp4 = req.body.otp4;
    const otp = otp1 + otp2 + otp3 + otp4;
    if (otpgen == otp) {
      res.redirect("/");
    } else {
      res.send("wrong otp");
    }
  },

  userSignOut: (req, res) => {         //signout button function
    // Logout- sesion null
    req.session.userid = null;

    // Redirect the user to the home page
    res.redirect("/");
  },
  productDetails: async (req, res) => {   //display product details -get function
    let id = req.params.id;
    pDetails = await newProduct.findById({ _id: id });
    console.log(pDetails.brandName);
    console.log("session: "+req.session.loggedIn);
    if (req.session.loggedIn) {
      uid = req.session.userid; 
      res.render("user/productDisplay", { uid, pDetails });
      }else{
      res.redirect('/login');
    }
  },

  // postCart:async(req,res)=>{
  //   if (req.session.loggedIn) {
  //     uid = req.session.userid; 
  //     console.log("control in post cart")
  //     //.....process..
  //     res.redirect("/getcart");
  //   }
  // },

  
  getCart:async(req,res)=>{     
                                                //cart displayy 
    if (req.session.loggedIn) {
    uid = req.session.userid ;
    pid= req.params.id;
    products= [{
    pid: pid,
    size: 'm',
    qty: '1'
    }]
    productsInCart =  await cartCollections.updateOne({ userId: uid }, {$push: { product:products } }, { upsert: true }).then(console.log("cart db done"));
    
    pDisp = await cartCollections.findOne({ userId: uid }).populate('product.pid');
    //console.log(pDisp.product[1].pid.productName);

     res.render('user/shop-cart',{pDisp});
   
    //res.redirect('/showCart/pDisp');
      
    }else{
      res.redirect('/login');
    }},

    showCart: async(req,res)=>{
      if (req.session.loggedIn) {
      uid = req.session.userid ;
      
      pDisp = await cartCollections.findOne({ userId: uid }).populate('product.pid');
      res.render('user/shop-cart',{pDisp});

    }else{
      res.redirect('/login');
    }
  },
  
    deleteFromCart:async(req,res)=>{
      id=req.params.id
      userSession=req.session.userId
      const cartDocument = await cartCollections.findOne({ userSession });
      const updatedCart = await cartCollections.updateOne(
      { _id:cartDocument._id
      },
      { $pull: { product: { pid: id } } })

      res.redirect('/showCart');
    }
    
  }

    
  
  