const express = require("express");
const UserController = require("../controllers/users");
//const flash = require('express-session');
const users = require("../models/user-schema");
const bcrypt = require("bcrypt");
const router = express.Router();





router.get('/login', UserController.loginPage); //login User render

router.get('/', UserController.IndexPage); //user index render   -LANDING PAGE

router.post('/login', UserController.loginUser); // login post

router.get('/otpPage', UserController.otpPage); // otp page render


router.get('/forgotPassword', UserController.forgotPassword); // otp page render

router.post('/forgetPasswordReqOtp', UserController. forgotPasswordOtp); // otp gen

router.get('/resetPassword', UserController.resetPassword); // rest password render

router.post('/resetPasswordPost', UserController.resetPasswordPost); // rest password post

router.post('/forgotPasswordVerifyOtp', UserController.forgotPasswordVerifyOtp)

router.get('/sign-up', UserController.signUpPage); //sign-up page render

router.post('/sign-up', UserController.signupUser); //sign-up POST

router.get('/reqOtp', UserController.reqOtp); //otp twilio get

router.post('/verifyOtp', UserController.verifyOtp); // verify otp twilio post 

router.get('/userSignout', UserController.userSignOut); // user signout

router.get('/productDetails/:id', UserController.productDetails);

router.post('/getcart/:id', UserController.getCart); // diplay items  ajax reciveing

router.get('/showCart', UserController.showCart); // display cart

router.post('/cart/updateQuantity/:itemId', UserController.updateQuanity);
//router.get('/deleteFromCart/:id', UserController.deleteFromCart); // cart delete

router.get('/checkout', UserController. checkOut);  //chckout display -get

router.get('/userProfile', UserController.UserPofile);  //user -Profile Display

router.get('/addAdressForm',UserController.addNewAddressGet);  // adding new address -checkout
router.post('/addNewAddress', UserController.addNewAddressPost); //  adding new address -checkout

router.post('/OrderCreationpart1/:adid', UserController.orderCreation);

//router.post('/checkOut/deleteAddress/:id', UserController.deleteAddress);  //delete adddress from checkout form

router.get('/PayPal', UserController.onlinePay);   //paypal-post

router.get('/success', UserController.paymentSuccess);   //paypal-post




// router.use(verifyLogin)


  
   
module.exports = router;
