const userModel = require("../models/user-schema");
const users=userModel.User;
const cartcollections = userModel.cartcollections;
const orderModel =  require("../models/orders");
const wishlistModel =  require("../models/wishlist-schema");
const wishlistdb = wishlistModel.wishlistdb;
const userOrders = orderModel.userOrders;
const express = require("express");
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');
const Razorpay = require('razorpay');
const cartService = require("./cartInfo");

const mongooseModels = require("../models/admin-schema");
const newProduct = mongooseModels.products;
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");


const oneDay = 1000 * 60 * 60 * 24;
let piDisp ;
let otpgen=null;
let phone1=0;

module.exports = {
    RazorPayget: async(req,res)=>
    {

        if(req.session.loggedIn)
        { 
            console.log("control in razrpayget");
             const razorpay = new Razorpay({
                key_id: 'rzp_test_8FhsDQXauNn2kx',
                key_secret: 'I2ZpSlDE9D8et4W9wS3fXFIQ',
              });

              const order = await razorpay.orders.create({
                amount: 1000,
                currency: 'INR',
                payment_capture: 1,
              });
              
              const orderId = order.id;
         }
         res.render("user/razorpayButton");


    }
}