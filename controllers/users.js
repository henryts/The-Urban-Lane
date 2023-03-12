const userModel = require("../models/user-schema");
const users=userModel.User;
const cartCollections = userModel.cartCollection;
const orderModel =  require("../models/orders");
const userOrders = orderModel.userOrders;
const express = require("express");
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');

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




  // // // *********************cgpt
  // getCart: async (req, res) => {
  //   if (req.session.loggedIn) {
  //     const uid = req.session.userid;
  //     const pid = req.params.id;
  //     const product_qty = req.query.quantity;
  //     const products = [{`
  //       pid: pid,
  //       size: 'm',
  //       qty: product_qty
  //     }];
  
  //     const query = {
  //       userId: uid,
  //       'product': {
  //         '$elemMatch': {
  //           'pid': pid
  //         }
  //       }
  //     };
  
  //     const productsInCart = await cartCollections.aggregate([
  //       { $match: { userId: uid } },
  //       { $unwind: '$product' },
  //       { $match: { 'product.pid': pid } }
  //     ]).toArray();
  
  //     if (productsInCart.length > 0) {
  //       // pid already exists in cart, redirect to /showCart
  //       res.redirect('/showCart');
  //     } else {
  //       await cartCollections.updateOne({ userId: uid }, { $push: { product: products } }, { upsert: true });
  //       const pDisp = await cartCollections.findOne({ userId: uid }).populate('product.pid');
  //       res.render('user/shop-cart', { uid, pDisp });
  //     }
  //   } else {
  //     res.redirect('/login');
  //   }
  // },
  
  // showCart: async (req, res) => {
  //   if (req.session.loggedIn) {
  //     const uid = req.session.userid;
  //     const pDisp = await cartCollections.findOne({ userId: uid }).populate('product.pid');
  //     res.render('user/shop-cart', { uid, pDisp });
  //   } else {
  //     res.redirect('/login');
  //   }
  // },
  // getCart :async (req, res) => {   //editing
  //   if (req.session.loggedIn) {
  //     const uid = req.session.userid;
  //     const pid = req.params.id;
  //     const product_qty = req.query.quantity;
  //     const products = [{
  //       pid: pid,
  //       size: 'm',
  //       qty: product_qty
  //     }];
  
  //     const query = {
  //       userId: uid,
  //       'products': {
  //         '$elemMatch': {
  //           'pid': pid
  //         }
  //       }
  //     };
  
  //     const productsInCart = await cartCollections.findOne(query);
  //     if (productsInCart) {
  //       // pid already exists in cart, redirect to /showCart
  //       // res.redirect('/showCart');
  //       console.log("already exist");
  //       res.send("Product already exists in cart.");
  //     } else {
  //       await cartCollections.updateOne({ userId: uid }, { $push: { products: products } }, { upsert: true });
  //       console.log("cart db done");
  //       res.send("Product added to cart.");
  //     }
  //   }
  //    else {
  //     res.send("Please login to add products to cart.");
  //   }
  
  // },
  
 
getCart: async (req, res) => {
  // add to cart 
  if (req.session.loggedIn) {
    const uid = req.session.userid._id;
    const pid = req.params.id;
    const product_qty = req.query.quantity;
    const products = [{
      pid: pid,
      size: 'm',
      qty: product_qty
    }];
    
    const query = {
      userId: uid,
      'products': {
        '$elemMatch': {
          'pid': pid
        }
      }
    };

    const productsInCart = await cartCollections.findOne({userId:uid});
    console.log(productsInCart);
    if (productsInCart) {
      // pid already exists in cart, redirect to /showCart
      console.log("already exist in cart");
      res.redirect('/showCart');
    } else {
      await cartCollections.updateOne({ userId: uid }, { $push: { product: products } }, { upsert: true }).then(console.log("cart db done"));
      res.redirect('/showCart');
      // const pDisp = await cartCollections.aggregate([
      //   {
      //     $match: { userId: req.session.userid._id } // match the user ID to find the right user
      //   }
       // { $unwind: "$products" },
        // {
        //   $lookup: {
        //     from: 'products', // name of the 'products' collection
        //     localField: 'products.pid',
        //     foreignField: '_id',
        //     as: 'productdetails'
        //   }
        // }
      // ]).exec((err,  pDisp ) => {
      //   if (err) {
      //     // handle error
      //     console.error(err);
      //   } else {
      //     console.log( pDisp ); // array of cart items made by the user
      //    // res.render('user/shop-cart', { uid, cartItems });
      //   }
      // });
    } 
  
  } else {
    res.redirect('/login');
  }
},


  showCart: async(req,res)=>{    // cart display
      if (req.session.loggedIn) {
      uid = req.session.userid._id ;  
      pDisp = await cartCollections.findOne({ userId: uid }).populate('product.pid');
     // console.log(pDisp.product[3].pid.productCost);
      res.render('user/shop-cart',{uid,pDisp});

    }else{
      res.redirect('/login');
    }
  },
 

//   deleteFromCart:  async (req, res) => {
//   const { id } = req.params;
//   const { userId } = req.session;

//   try {
//     const cartDocument = await cartCollections.findOne({ userId });
//     const { product } = cartDocument;

//     const index = product.findIndex(item => item.pid.toString() === id);

//     if (index === -1) {
//       return res.status(404).send('Item not found in cart');
//     }

//     // remove the item from the array
//     product.splice(index, 1);

//     await cartCollections.updateOne(
//       { _id: cartDocument._id },
//       { $set: { product } }
//     );

//     return res.status(204).send();
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send('Internal server error');
//   }
// },

//     deleteFromCart:async(req,res)=>{   //delete from cart
//       id=req.params.id
//       userSession=req.session.userid
//       console.log("in delete method");
//       const cartDocument = await cartCollections.findOne({ userId:userSession._id});

//       const updatedCart = await cartCollections.updateOne({ _id:cartDocument._id},{ $pull: { product: { pid: id } } })

//       res.redirect('/showCart');
//     },

 checkOut: (req,res)=>{

        if (req.session.loggedIn) {
         let uid = req.session.userid ;       
      res.render('user/CHECKOUT',{uid});  //ejs not enough find new template
        }
    },
        
    UserPofile: async (req,res)=>{
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
     


},
onlinePay: (req,res)=>{
 // res.render("user/paypal.ejs");
  paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Adazb6aG6tpC2d1cvO690n9yQscdtZqBlOymckEOutJxXfE97IHR80N9IqlWK-ew8Adgfy7OQFIUZkPh',
    'client_secret': 'EGecxFYgkbV1-foIkl1dJDUxO2f278TqUdHF5vsf8EtJ0I5x-T-mmnEqXiC8IUUfQMksQkiEjaec0-SP'
  });
  
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Redhock Bar Soap",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Washing Bar soap"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
        console.log(payment);
      }
  }
});   

},
paymentSuccess: (req,res)=>
{
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

// Obtains the transaction details from paypal
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
}



}

     

    
  
    
  

    
  
  