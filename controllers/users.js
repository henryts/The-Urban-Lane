const userModel = require("../models/user-schema");
const users=userModel.User;
const cartCollections = userModel.cartCollection;
const orderModel =  require("../models/orders");
const userOrders = orderModel.userOrders;
const express = require("express");
const mongoose = require('mongoose');

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
  //****USER LOGIN POST*****
  loginUser: async (req, res) => {
    const mail = req.body.email;
    let userObj = await users.findOne({ email: mail });
  
    if (userObj == null) {
      res.status(400).send("Sign up first!");
    } else if (userObj.block == true) {
      res.status(400).send("User is blocked");
    } else {
      try {
        if ( bcrypt.compare(req.body.password, userObj.password)) {
          req.session.loggedIn = true;
          req.session.userid = userObj;
          res.send("Login successful"); // return success message
        } else {
          res.status(400).send("Invalid password");
        }
      } catch {
        res.status(500).send("Internal server error");
      }
    }
  }
  ,

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
       let userObj=1
      res.render("user/user-login",{userObj});
    }
  },
 //forgot password get
 forgotPassword: (req,res)=>{
        let  errorMessage =null;
        let errorMessageOtp=null;
         res.render("user/forgotPassword", {errorMessage, errorMessageOtp });
  },
  forgotPasswordOtp:async (req,res)=>
  {
     let foundUser =await users.findOne({ mobile: req.body.phone });
      phone1=req.body.phone;
       if (foundUser) {
     console.log('User found:', foundUser);
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
       .then((message) =>  res.json({ success: true, message: 'OTP sent' }) );
        } else {
      //  console.log('User not found');
      //  let errorMessage = 'User not found';
      //  let errorMessageOtp=null;
       res.json({ success: false, message: 'User not found' }); //

        }
        },
        
    forgotPasswordVerifyOtp: (req, res) => {      // otp verification -post method
     //verify otp login -post method
    
    const otp1 = req.body.otp1;
    const otp2 = req.body.otp2;
    const otp3 = req.body.otp3;
    const otp4 = req.body.otp4;
    const otp = otp1 + otp2 + otp3 + otp4;
    if (otpgen == otp) {

     res.json({ success: true, redirectUrl: '/resetPassword' }); // send JSON response with redirect URL
    } else {
      let errorMessageOtp="Incorrect OTP";
      let errorMessage=null;
      res.json({ success: false, message: 'Incorrect OTP' }); 
    }
  },
 

  //********Index PAGE RENDER-----redirect-login**********
  IndexPage: async (req, res) => {
    pData = await newProduct.find({});
    

    if (req.session.loggedIn) {
      uid = req.session.userid;
      res.render("user/index", { uid, pData });
    } else {
      uid=null;
      res.render("user/index", {uid, pData });
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
      else  res.render("user/otp-login");

    }); 
  },

  reqOtp: async (req, res) => {           //otp request post method twilio /\/  /\/

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

  },
  verifyOtp: async (req, res) => {      // otp verification -po 
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
  resetPassword: (req,res)=>{  //get render

       res.render('user/resetPassword.ejs');
 },
  resetPasswordPost: (req,res)=>{  //get post
     console.log("control in post");
    let  password=req.body.password;
    let confirmPassword=req.body.confirm_password;
    if(password==confirmPassword)
    { 
      console.log("password matched");
      bcrypt.hash(password, 10, function(err, hashedPassword) {
        if (err) {
          console.log(err);
          // Handle error
        }
        else {
          console.log("password encrypted");
          users.findOne({ mobile: phone1 }, function(err, user) {
            if (err) {
              console.log(err);
              // Handle error
            }
            else if (!user) {
              console.log('User not found');
              // Handle user not found
            }
            else {
              user.password = hashedPassword;
              user.save(function(err, updatedUser) {
                if (err) {
                  console.log(err);
                  // Handle error
                }
                else {
                  console.log('Password updated successfully');
                  res.redirect('/');
                }
              });
            }
          });
        }
      });
          
    }
},
   userSignOut: (req, res) => {         //signout button function
    // Logout- sesion null
     req.session.userid = null;
     req.session.loggedIn=false;
 // Redirect the user to the home page
     res.redirect("/");
  },
  productDetails: async (req, res) => {   //display product details -get function
     let id = req.params.id;
     pDetails = await newProduct.findById({ _id: id });
     if (req.session.loggedIn) {
      uid = req.session.userid; 
      res.render("user/productDisplay", { uid, pDetails });
      }else{
      res.redirect('/login');
    }
  },

  // aggregation methods--- error 
  // getCart: async (req, res) => {
  //   if (req.session.loggedIn) {
  //     const userId = mongoose.Types.ObjectId(req.session.userid);
  //     const productId = mongoose.Types.ObjectId(req.params.id);
  //     const productQty = parseInt(req.query.quantity);
  
  //     const cart = await cartCollections.aggregate([
  //       { $match: { userId } },
  //       { $unwind: "$product" },
  //       { $lookup: {
  //           from: "products",
  //           localField: "product.pid",
  //           foreignField: "_id",
  //           as: "product.product"
  //         }
  //       },
  //       { $unwind: "$product.product" },
  //       { $group: {
  //           _id: "$_id",
  //           userId: { $first: "$userId" },
  //           product: { $push: "$product" },
  //           total: { $sum: "$product.product.productCost" }
  //         }
  //       }
  //     ]);
  
  //     let pDisp;
  //     if (cart.length === 0) {
  //       pDisp = { product: [] };
  //     } else {
  //       pDisp = cart[0];
  //     }
  
  //     const product = {
  //       pid: productId,
  //       size: 'm',
  //       qty: productQty
  //     };
  
  //     const productIndex = pDisp.product.findIndex(p => p.pid.toString() === productId.toString());
  
  //     if (productIndex !== -1) {
  //       // Product already exists in cart, update quantity
  //       pDisp.product[productIndex].qty += productQty;
  //       await cartCollections.updateOne(
  //         { _id: pDisp._id, "product.pid": productId },
  //         { $inc: { "product.$.qty": productQty }, $set: { updatedAt: new Date() } }
  //       );
  //     } else {
  //       // Product doesn't exist in cart, add it
  //       pDisp.product.push(product);
  //       await cartCollections.updateOne(
  //         { _id: pDisp._id },
  //         { $push: { product }, $set: { updatedAt: new Date() } }
  //       );
  //     }
  
  //     res.render('user/shop-cart', { uid: userId, pDisp });
  //   } else {
  //     res.redirect('/login');
  //   }
  // },
  
  // showCart: async (req, res) => {
  //   try {
  //     if (!req.session.loggedIn) {
  //       return res.redirect('/login');
  //     }
  
  //     const userId = mongoose.Types.ObjectId(req.session.userid);
  
  //     const pipeline = [
  //       { $match: { userId: userId } },
  //       { $unwind: '$product' },
  //       { $lookup: { from: 'products', localField: 'product.pid', foreignField: '_id', as: 'productData' } },
  //       { $unwind: '$productData' },
  //       {
  //         $project: {
  //           _id: '$productData._id',
  //           productName: '$productData.productName',
  //           productDescription: '$productData.productDescription',
  //           productCost: '$productData.productCost',
  //           productQty: '$product.qty'
  //         }
  //       },
  //       { $group: { _id: '$_id', productName: { $first: '$productName' }, productDescription: { $first: '$productDescription' }, productCost: { $first: '$productCost' }, productQty: { $sum: '$productQty' } } }
  //     ];
  
  //     const productsInCart = await cartCollections.aggregate(pipeline).toArray();
  //     const cartTotal = productsInCart.reduce((acc, product) => acc + (product.productCost * product.productQty), 0);
  
  //     res.render('user/shop-cart', { uid: userId, productsInCart: productsInCart, cartTotal: cartTotal });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Internal server error');
  //   }
  // },
  

  
  getCart:async(req,res)=>{     
                                                //add to cart 
    if (req.session.loggedIn) {
    uid = req.session.userid ;
    pid= req.params.id;
    product_qty= req.query.quantity;
    products= [{
    pid: pid,
    size: 'm',
    qty: product_qty
    }]
    const query = {
      userId: uid,
      'product': {
          '$elemMatch': {
              'pid': pid
          }
      }
  };
  const productsInCart = await cartCollections.findOne(query);
   if (productsInCart) {
    // pid already exists in cart, redirect to /showCart
    res.redirect('/showCart');
 
}
 else {

      await cartCollections.updateOne({ userId: uid }, {$push: { product:products } }, { upsert: true }).then(console.log("cart db done"));
      pDisp = await cartCollections.findOne({ userId: uid }).populate('product.pid'); 
       res.render('user/shop-cart',{uid, pDisp});  
      }}else{
     res.redirect('/login');
      }},


      showCart: async(req,res)=>{    // cart display
      if (req.session.loggedIn) {
      uid = req.session.userid ;  
      pDisp = await cartCollections.findOne({ userId: uid }).populate('product.pid');
     // console.log(pDisp.product[3].pid.productCost);
      res.render('user/shop-cart',{uid,pDisp});

    }else{
      res.redirect('/login');
    }
  },
  
    deleteFromCart:async(req,res)=>{   //delete from cart
      id=req.params.id
      userSession=req.session.userid
      console.log("in delete method");
      const cartDocument = await cartCollections.findOne({ userId:userSession._id});

      const updatedCart = await cartCollections.updateOne({ _id:cartDocument._id},{ $pull: { product: { pid: id } } })

      res.redirect('/showCart');
    },
      checkOut:(req,res)=>{

        if (req.session.loggedIn) {
          uid = req.session.userid ;       
      res.render('user/shop-checkout',{uid});  //ejs not enough find new template
        }
    },
        
    UserPofile:async (req,res)=>{
         if(req.session.loggedIn){
         userDetails=req.session.userid;
         pDisp = await cartCollections.findOne({ userId: uid }).populate('product.pid');
         res.render("user/userProfile",{userDetails,pDisp});
        }
        else{
          res.redirect('/login');
        }

    },
  addNewAddressGet: async(req,res)=>{
      if(req.session.loggedIn){
        uid = req.session.userid;
        res.render('user/addNewAddress',{uid})
        }
      else{
        res.redirect('/login');
      }

    },

    addNewAddressPost: async(req,res)=>{
      if(req.session.loggedIn){
           uid = req.session.userid;
            newAddress={
            firstName: req.body.firstName,
            secondName: req.body.secondName,
            addressLine1: req.body.addressLine1,
            addressLine2:req.body. addressLine2,
            city:req.body.city,
            province:req.body.province,
            postalCode:req.body.postalCode,
            contactNumber:req.body.contactNumber,
            shippingEmail:req.body.shippingEmail
        }
      
        await users.updateOne({ username:uid.username},{ $push: { address:newAddress} }).then(res.redirect('/checkout'))  
 
      }
      else{
        res.redirect("/login");
      }
    },

 orderCreation: async(req,res)=>
    {  
      if(req.session.loggedIn){
        uid = req.session.userid
        const email = req.session.userid.email;
         const address = JSON.parse(req.body[email]);
    
        userAddress={           firstName:address.firstName,
                               secondName: address.secondName,
                               addressLine1: address.addressLine1,
                               addressLine2: address.addressLine2,
                               city: address.city,
                                province:address.province,
                                postalCode: address.postalCode,
                                contactNumber:address.contactNumber,
                                shippingEmail:address.shippingEmail
        }
      
       // briing pid
           date=new Date();
           let order = await userOrders.findOne({ userId: uid });
        if (!order) {
          order = new userOrders({
              userId: uid,
              orderList: [{
                  items: [],
                  totalPrice: 0,
                  status: 'proccessing',
                  address: userAddress,
                  creationTime: date
              }]
          });
        }

          // Retrieve the user's cart
         const cart = await cartCollections.findOne({ userId: uid }).populate('product.pid');
         // Add items to the orderList
         let totalPrice = 0;
         let items = [];
        
         for(let i = 0; i < cart.product.length; i++) {
           tCost=cart.product[i].qty *  cart.product[i].pid.productCost
              item = {
                 productId: cart.product[i].pid._id,
                 quantity: cart.product[i].qty,
                 price: cart.product[i].pid.productCost,
                 productTotal: tCost
             };
             items.push(item);
             totalPrice += tCost;
            //order.orderList[orderIndex] = orderItem;
             
         }
         const orderItem = {
          items: items,
          totalPrice: totalPrice,
          status: 'proccessing',
          address:userAddress,
          creationTime: date
      };
         order.orderList.push(orderItem);
        await order.save().then(res.send("order placed success fully!!"));
      }
        
        },

 deleteAddress:async(req,res)=>{
      delId= req.param.id ;
      uid= req.session.userid;
      console.log("adress is "+uid.address.firstName)
     await users.updateOne({ email:uid.email},{ $pull: { address: { shippingEmail:delId} } }).then( res.redirect('/checkout'));
     


}
     

    }
  
    
  

    
  
  