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
const cartService = require("./cartinfo");

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
   shopbycatagory:async(req,res)=>{
    if (req.session.loggedIn) {
        let uid = req.session.userid;
        pData = await newProduct.find({});
        res.render("user/filter-products",{uid,pData});
    }
    else{
        res.redirect("/login");
    }
   },
   catagory1: async(req,res)=>{
    if (req.session.loggedIn) {
        let uid =req.session.userid;
        let linkId = req.query.name;
        console.log(linkId);
        console.log('Link ID received from client:', linkId);      
            if(linkId=='men')
          {
            console.log("control in cat");     
          let pData = await newProduct.find({ productCatogory:'Men'}); 
          res.render("user/filter-products",{uid,pData});

          }else if(linkId=='women')
          {
            let pData = await newProduct.find({ productCatogory:'women'}); 
            res.render("user/filter-products",{uid,pData});
          }
          else if(linkId=='boy')
          {
            let pData = await newProduct.find({ productCatogory:'boy'}); 
            res.render("user/filter-products",{uid,pData});
          }
          else if(linkId=='girl')
          {
            let pData = await newProduct.find({ productCatogory:'girl'}); 
            res.render("user/filter-products",{uid,pData});
          }
        
    }
    else{
        res.redirect("/login");
    }


   },
   priceFilter:async(req,res)=>{
    if (req.session.loggedIn) {
      const minPrice = req.body.minPrice;
      const maxPrice = req.body.maxPrice;
       console.log("minPrice",minPrice);
      // console.log("maxPrice",maxPrice);
      // Query the database for products that match the price range
      newProduct.find({productCost: {$gte: minPrice, $lte: maxPrice}}, function(err, products) {
        if (err) {
          // Handle error
          console.error(err);
          res.status(500).send(err);
        } else {
          // Return the products as JSON
          console.log(products);
          res.json(products);
        }
      });

     } else{
        res.redirect("/login");
    }

   },
   priceFilterGet:(req,res)=>
   {
    if (req.session.loggedIn) {
      const uid=req.session.userid._id;
      const pData = req.query.productz;
      console.log((product));
      res.render("user/filter-products",{uid,pData});

    } else{
      res.redirect("/login");
  }

   }
}