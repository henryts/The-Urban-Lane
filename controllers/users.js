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
const shortid = require('shortid');
const crypto = require('crypto');
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
  //****USER LOGIN POST*****
 // server-side code
loginUser: async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userObj = await users.findOne({ email: email });
  
  if (userObj == null) {
    res.status(400).send("Sign up first!");
  } else if (userObj.block == true) {
    res.status(400).send("User is blocked");
  } else {
    try {
      if (bcrypt.compareSync(password, userObj.password)) {
        req.session.loggedIn = true;
        req.session.userid = userObj;
        res.send("Login successful"); // return success message
       //generation and updation of new hash id for user
        let id = req.session.userid._id;
        const hash = crypto.createHash('sha256');
        hash.update(id.toString());
        let userHashId= hash.digest('hex').substr(0, 8);
        try {
          const user = await users.findOneAndUpdate(
            { _id: req.session.userid._id },
            { $set: { userHashId: userHashId } },
            { upsert: true, new: true }
          );
          //console.log("userHashId updated",user);
        } catch (err) {
          console.error(err);
        }


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
   renderLogin: (req,res)=>
   {res.render("user/user-login");
   },

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
     //console.log('User found:', foundUser);
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
      // console.log("password matched");
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
                  console.log("errot at hashing password",err);
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
 
getCart: async (req, res) => {
  // add to cart 
  if (req.session.loggedIn) {
    const uEmail = req.session.userid.email;
    const pid = req.params.id;
    const product_qty = req.body.quantity;
    console.log("qty",product_qty);
    //const product = await products.findOne({ _id: uid });
    const products = [{
      pid: pid,
      size: 'm',
      qty: product_qty,

    }];
    const productsInCart =  await cartcollections.findOne({
            userEmail: uEmail,
            'product': {
              '$elemMatch': {
                pid: pid
              }
            }
          });

  if(productsInCart)
  {
   res.redirect('/showCart');
  // res.send("already exist");
  }
  else{
 let ab=  await cartcollections.updateOne({ userEmail: uEmail }, { $push: { product: products } }, { upsert: true }).then(console.log("cart db done"));
 res.redirect('/showCart');
  }
}
  else{
    res.redirect('/login');
  
}
},

  showCart: async(req,res)=>{    // cart display
      if (req.session.loggedIn) {
        const uEmail = req.session.userid.email;
        const uid =req.session.userid;
        
        let cartempty =await cartcollections.find({userEmail:uid.email});
        console.log(cartempty);
        if(!cartempty[0].product.length)
        { 
          uid.cartCount=0;
          console.log("empty");
          res.render("user/shop-cart", { products: null, uid });

        }          
    try {
     const cart = await cartService.cart(req.session.userid.email);
        ///console.log(cart);
         console.log("cart", cart[0].products);
        // console.log(cart.products[1]);
        if (cart.length === 0) {
          console.log("empty");
          res.render("user/shop-cart", { products: null, uid });
        } else  {
          const lengthh = cart[0].products.length;
          if (lengthh) {
            const options = { new: true }; // Return the updated document
            users.findOneAndUpdate(
              { _id: uid._id },
              { $set: { cartCount: lengthh } },
              options,
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  // console.log("result is",result);
                }
              }
            );
            req.session.userid.cartCount = lengthh;
            uid.cartCount = lengthh;
          }
          console.log("cart count: ", uid.cartCount);
        

          res.render("user/shop-cart", { products: cart[0].products, uid });
        }
    //  else if(typeof cart[0] === 'undefined'){
    //   console.log("empty");
    //   res.render("user/shop-cart",{products:null,uid});
    //  }
   } catch (err) {
     // handle error
     console.error("Error while retrieving cart:", err);
   }  
    }
  },
         
  updateQuanity:async (req,res)=> {  //control in from ajax call
  
   console.log("count in update",req.body.count);
   console.log("quantity in update",req.body.quantity);
   console.log("productcost in update",req.body.pCost);
   const pid = req.body.product;
   let qty = req.body.quantity;
   const count= req.body.count;
   const pCost = req.body.pCost
   const uEmail = req.session.userid.email;
 
  let response={} ;
  let total=0;
  console.log("qty=",qty);
  response.subtotal=parseInt(pCost) *qty ;
  console.log(" response.subtotal=",response.subtotal);
 // let liveQty=parseInt(count) +parseInt(qty);
  console.log("liveQty=",qty);
   if (count == -1 && qty == 1) {
    
     qty=1;

  } else {
    await cartcollections.updateOne(
        {
          userEmail: uEmail,
          "product.pid": pid,
        },
        {
          $inc: { "product.$.qty": qty },
          $set: { "product.$.productTotal": response.subtotal }
        }
      )
      .then((response) => {
        console.log("qty updated in db ");
      });
  
  let l=0;
  const cart = await cartService.cart(req.session.userid.email);
 
   l=cart[0].products.length;
    total=0;
   console.log("subtotal in db=",cart[0].products[0].subtotal);
  for(let i=0;i<l;i++)
  {
       total=total+cart[0].products[i].subtotal;
       
  }
       response.total=total;
       console.log(" response.total=",response.total);
       res.json(response);
  
  // }  
  }
} ,
  



    deleteFromCart:async(req,res)=>{ 
      if (req.session.loggedIn) {  //delete from cart
     const id=req.params.id
     const uEmail=req.session.userid.email
      console.log("in delete method");
      const cartDocument = await cartcollections.findOne({ userEmail:uEmail});
     // console.log(cartDocument.product);
       const updatedCart = await cartcollections.updateOne({ _id:cartDocument._id},{ $pull: { product: { pid: id } } })
       console.log(updatedCart);
       res.redirect('/showCart');
     
    }
    else{
      res.redirect('/login');
    }
  },

 checkOut:async (req,res)=>{
  try {
        if (req.session.loggedIn) {
         let uEmail = req.session.userid.email ;  
        // let uid= req.session.userid
         const cart = await cartcollections.aggregate([
          // match the cart based on the user's email
          { $match: { userEmail: uEmail } },
        
          // unwind the product array
          { $unwind: "$product" },
        
          // join with the products collection to get the product details
          {
            $lookup: {
              from: "products",
              localField: "product.pid",
              foreignField: "_id",
              as: "productDetails"
            }
          },
        
         // group the data by cart ID and product ID
          {
            $group: {
              _id: { cartId: "$_id", productId: "$product.pid" },
              userEmail: { $first: "$userEmail" },
              product: { $first: "$product" },
              productDetails: { $first: { $arrayElemAt: [ "$productDetails", 0 ] } }
            }
          },
        
          // group the data by cart ID
          {
            $group: {
              _id: "$_id.cartId",
              userEmail: { $first: "$userEmail" },
              products: {
                $push: {
                  pid: "$product.pid",
                  size: "$product.size",
                  qty: "$product.qty",
                  productTotal: "$productDetails.subTotal",
                  productName: "$productDetails.productName",
                  productDescription: "$productDetails.productDescription",
                  brandName: "$productDetails.brandName",
                  productCost: "$productDetails.productCost",
                  productCatogory: "$productDetails.productCatogory",
                  productImages: "$productDetails.productImages",
                 
                }
              },
             // totalPrice: { $sum: "$product.productTotal" }
            }
          },
          {
            $project: {
              _id: 0,
              userEmail: 1,
              products: {
                $map: {
                  input: "$products",
                  as: "p",
                  in: {
                    productsId:"$$p._id",
                    productName: "$$p.productName",
                    qty: "$$p.qty",
                      productCost: "$$p.productCost",
                    productImages: "$$p.productImages",
                    subtotal: { $multiply: [{$toInt:"$$p.qty"}, {$toDouble:"$$p.productCost"}] },
                   
                },
                
              },
             //  totalPrice: { $sum: "$products.total" }
                  }
            }
          }
        ]).exec();
       
        let uid = await users.findOne({ email: uEmail });
      
      res.render('user/CHECKOUT',{uid, product: cart[0].products });  
        }
      }
     catch (error) {
      console.log(error);
      next();
    }  }  ,
    addtoWishlist:async(req,res)=>{
      if(req.session.loggedIn)
      {
    const uEmail = req.session.userid.email;
    const pid = req.params.id; 
     console.log(pid);
    const products = [{
      pid: pid
    }];
    const productsInWishlist =  await wishlistdb.findOne({
            userEmail: uEmail,
            'product': {
              '$elemMatch': {
                pid: pid
              }
            }
          });

  if(productsInWishlist)
  {
   res.redirect('/wishlist');
  // res.send("already exist");
  console.log("already exist");
  }
  else{
 let ab=  await wishlistdb.updateOne({ userEmail: uEmail }, { $push: { product: products } }, { upsert: true }).then(console.log("wishlist db done"));
 res.redirect('/wishlist');
  }
}
else{
  res.redirect('/login');
}  
      
  },

    wishlist:async(req,res)=>{ 
       if(req.session.loggedIn)
       {
        const uEmail= req.session.userid.email

        const wishlistObj = await wishlistdb.aggregate([
          // match the cart based on the user's email
          { $match: { userEmail: uEmail } },
        
          // unwind the product array
          { $unwind: "$product" },
        
          // join with the products collection to get the product details
          {
            $lookup: {
              from: "products",
              localField: "product.pid",
              foreignField: "_id",
              as: "productDetails"
            }
          },
        
         // group the data by cart ID and product ID
          {
            $group: {
              _id: { cartId: "$_id", productId: "$product.pid" },
              userEmail: { $first: "$userEmail" },
              product: { $first: "$product" },
              productDetails: { $first: { $arrayElemAt: [ "$productDetails", 0 ] } }
            }
          },
        
          // group the data by cart ID
          {
            $group: {
              _id: "$_id.cartId",
              userEmail: { $first: "$userEmail" },
              products: {
                $push: {
                  pid: "$product.pid",                 
                  productName: "$productDetails.productName",
                  productDescription: "$productDetails.productDescription",
                  brandName: "$productDetails.brandName",
                  productCost: "$productDetails.productCost",              
                  productImages: "$productDetails.productImages",
                 
                }
              }
             
            }
          },
          {
            $project: {
              _id: 0,
              userEmail: 1,
              products: {
                $map: {
                  input: "$products",
                  as: "p",
                  in: {
                    productsId:"$$p.pid",
                    productName: "$$p.productName",                  
                      productCost: "$$p.productCost",
                    productImages: "$$p.productImages",                   
                   
                },
               // this.userSignOut
              },            
                  }
            }
          }
        ]).exec();
        
        let uid = req.session.userid;
       let lengthh=0;
        if(typeof wishlistObj[0]=== 'undefined' )
        {
          lengthh=0;
        }
        else{
         lengthh= wishlistObj[0].products.length;
        }
        const update = { $set: { wishListCount: lengthh} }; 
        const options = {new: true }; // Return the updated document
 
        users.findOneAndUpdate({ _id: uid._id },{ $set: { wishlistCount: lengthh} }, options, (err, result) => {
          if (err) {
            console.log(err);
          } else {
           // console.log("result is",result);
          }
        });
         if(typeof wishlistObj[0]=='undefined')
         {
          uid.wishlistCount=0;
          res.render("user/wishlist",{wList:0,uid});
         }
         else{
        uid.wishlistCount= wishlistObj[0].products.length;
        res.render("user/wishlist",{wList:wishlistObj[0].products,uid}); 
         }
       // console.log(wishlistObj[0]);
       
       }
       else{
        res.redirect('/login');
       }

    },
        
    UserPofile: async (req,res)=>{
         if(req.session.loggedIn){
         userDetails=req.session.userid;
         const shortid = require('shortid');
         const userID = shortid.generate(req.session.userid._id);//chjange
         const uid = mongoose.Types.ObjectId(req.session.userid._id);  
         console.log( uid);
         const order =await userOrders.aggregate([{ $match: { userId:uid } },
        { $unwind: "$orderList" }

        
         ]).exec();
        res.render("user/userProfile",{orders:order,userID})

        console.log(order);



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
      
        await users.updateOne({ username:uid.username},{ $push: { address:newAddress} });
       

        
        res.redirect('/checkout');
       
 
      }
      else{
        res.redirect("/login");
      }
    },
    removefromWishlist:async(req,res)=>{
      if (req.session.loggedIn) {
      
        const id=req.params.id
        const uEmail=req.session.userid.email
         console.log("in remove method");
         const wlDocument = await wishlistdb.findOne({userEmail:uEmail});
         console.log(wlDocument);
   
         const updatedwl = await wishlistdb.updateOne({ _id: wlDocument._id},{ $pull: { product: { pid: id } } })
   
         res.redirect('/wishlist');


      }
      else{
          res.redirect("/login");
        }


    },
    orderCreation: async (req, res) => {
      if (req.session.loggedIn) {
        const uid = req.session.userid;
        const email = req.session.userid.email;
        const aid = req.params.adid
        const address = req.body;      
          const userAddress = {
          firstName: address.firstName,
          secondName: address.secondName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          contactNumber: address.contactNumber,
          shippingEmail: address.shippingEmail,
        };
    
        const cart = await cartcollections.aggregate([
          {
            $match: { userEmail: email },
          },
          {
            $unwind: "$product",
          },
          {
            $lookup: {
              from: "products",
              localField: "product.pid",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
          {
            $group: {
              _id: "$userEmail",
              items: {
                $push: {
                  productId: "$productDetails._id",
                  productName: "$productDetails.productName",
                  productCatogory:"$productDetails.productCatogory",
                  productImages:"$productDetails.productImages",
                  quantity: "$product.qty",
                  price: "$productDetails.productCost",
                  productTotal: { $multiply: [
                    { $toDouble: "$product.qty" },
                    { $toDouble: "$productDetails.productCost" }
                  ] },
                },
              },
              totalPrice: { $sum: { $multiply: [
                { $toDouble: "$product.qty" },
                { $toDouble: "$productDetails.productCost" }] } },
            },
          },
        ]);
       
        if (cart.length == 0) {
          res.send("Cart is Empty!!");
         // res.redirect('/');
        } else {
          const orderItem = {
            items: cart[0].items,
            totalPrice: cart[0].totalPrice,
            status: "proccessing",
            address: userAddress,
            creationTime: new Date(),
          };
        //taking username
        const userr = await users.findOne({ _id:uid  });
        let name = userr.username;

          const order = await userOrders.findOneAndUpdate(
            { userId: uid },
            { $push: { orderList: orderItem },
            $set: { userName: name, userEmail: email },
            },
           
            { upsert: true,new: true }
          );
          if (order) {
            const orderId = order.orderList[order.orderList.length - 1]._id;
            console.log("Order created with id:", orderId);
            req.session.latestOrderId=orderId;
          
            res.redirect('/OrderCreationpart2');
            
          } else {
            res.send("Error while placing order");
          }
        }
      }
    },
    payOption:async(req,res)=>{
      if (req.session.loggedIn) {        
       let uEmail = req.session.userid.email ;  
        let uid= req.session.userid;
       
         const cart = await cartcollections.aggregate([
          // match the cart based on the user's email
          { $match: { userEmail: uEmail } },
        
          // unwind the product array
          { $unwind: "$product" },
        
          // join with the products collection to get the product details
          {
            $lookup: {
              from: "products",
              localField: "product.pid",
              foreignField: "_id",
              as: "productDetails"
            }
          },
        
         // group the data by cart ID and product ID
          {
            $group: {
              _id: { cartId: "$_id", productId: "$product.pid" },
              userEmail: { $first: "$userEmail" },
              product: { $first: "$product" },
              productDetails: { $first: { $arrayElemAt: [ "$productDetails", 0 ] } }
            }
          },
        
          // group the data by cart ID
          {
            $group: {
              _id: "$_id.cartId",
              userEmail: { $first: "$userEmail" },
              products: {
                $push: {
                  pid: "$product.pid",
                  size: "$product.size",
                  qty: "$product.qty",
                  productTotal: "$productDetails.subTotal",
                  productName: "$productDetails.productName",
                  productDescription: "$productDetails.productDescription",
                  brandName: "$productDetails.brandName",
                  productCost: "$productDetails.productCost",
                  productCatogory: "$productDetails.productCatogory",
                  productImages: "$productDetails.productImages",
                 
                }
              },
             // totalPrice: { $sum: "$product.productTotal" }
            }
          },
          {
            $project: {
              _id: 0,
              userEmail: 1,
              products: {
                $map: {
                  input: "$products",
                  as: "p",
                  in: {
                    productsId:"$$p._id",
                    productName: "$$p.productName",
                    qty: "$$p.qty",
                      productCost: "$$p.productCost",
                    productImages: "$$p.productImages",
                    subtotal: { $multiply: [{$toInt:"$$p.qty"}, {$toInt:"$$p.productCost"}] },
                     },
                 },
             //  totalPrice: { $sum: "$products.total" }
                  }
            }
          }
        ]).exec();
        
         res.render('user/paymentSelection',{ product: cart[0].products });  
        }     
        else{
        res.redirect("/login");
      }
    },
      
onlinePay:async (req,res)=>{

    const cart = await cartService.cart(req.session.userid.email);
      const items =cart[0].products;    
    paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Adazb6aG6tpC2d1cvO690n9yQscdtZqBlOymckEOutJxXfE97IHR80N9IqlWK-ew8Adgfy7OQFIUZkPh',
    'client_secret': 'EIT9EtOgHYqyALyAF-ltIbshpTE3gWreN4x4OrhGjwJEfVhwLZou0nu3VRS82s9zx5HpPeD6BcnTHQtH'
  });
  
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:4000/orderConfirmationpart4",
        "cancel_url": "http://localhost:4000/cancel" //payment not confirmed
    },
    "transactions": [{
      "item_list": {
        "items": [{
            "name": "Red Sox Hat",
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
    console.log(error);
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
        console.log("payament status:"+payment);
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
      "item_list": {
        "items": [{
            "name": "Red Sox Hat",
            "sku": "001",
            "price": "25.00",
            "currency": "USD",
            "quantity": 1
        }]
    },
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
        console.log("paypal error response:",error.response);
        throw error;
    } else {
        console.log("paypal",JSON.stringify(payment));
        res.send('Success');
    }
});
},
confirmOrder:async(req,res)=>
{ 
  
  
 
  if (req.session.loggedIn) {
    res.set({
      'cache-control': 'no-cache, no-store, must-revalidate'
    });
   const mongoId =req.session.userid._id;
  
  
    //generating unique orderid :
    let orderId =req.session.latestOrderId;
    const hash = crypto.createHash('sha256');
    hash.update(orderId.toString());
    let orderHashId= hash.digest('hex').substr(0, 8);
    try {
      const rslt = await userOrders.updateOne(
        {userId: mongoId, "orderList._id": orderId },
        {
          $set: {
            "orderList.$.orderHashId": orderHashId,
              }   
        },
        { upsert: true, new: true }
      );
      //console.log("userHashId updated",user);
    } catch (err) {
      console.error(err);
    }

   const newOrder = await userOrders.findOne(
    { userId: mongoId, "orderList._id": orderId },
    { "orderList.$": 1 }
  );
    //console.log("newOrder  ", newOrder);
    if(req.body.payoption=='cod')
    {
      const result = await userOrders.updateOne(
        {userId: mongoId, "orderList._id": orderId },
        {
          $set: {
            "orderList.$.paymentMethod": 'COD',
            "orderList.$.status": 'confirmed',
            "orderList.$.paymentStatus": true,
          },
        }
      );
      console.log("oderrr", result);
      const newOrder = await userOrders.findOne(
        { userId: mongoId, "orderList._id": orderId },
        { "orderList.$": 1 }
      );
        console.log("newOrder after updation ", newOrder);
      // try {
      //   const updatedOrder = await userOrders.findByIdAndUpdate(orderId, {
      //     $set: {
      //       paymentStatus: true,
      //       paymentMethod:'COD'
      //     }
      //   });
      //   //return updatedOrder;
      // } catch (err) {
      //   console.error(err);
      //   throw err;
      // }
      
   res.render('user/orderConfirm',{order:newOrder.orderList[0],uid,orderdet:newOrder}); 
 } 
    else if(req.body.payoption=='razorpay')
    {
       const userId= req.session.userid._id;
       const result = await userOrders.updateOne(
        { "orderList._id": orderId },
        { $set: { "orderList.$.paymentMethod": "Razor Pay" } }
      );
     // const orderDetails = await userOrders.findOne({ userId:userId });
     console.log(newOrder.orderList[0].totalPrice);
     let totalINR = (newOrder.orderList[0].totalPrice);
    
     //console.log("inr",totalINR);
      const instance = new Razorpay({
        key_id: "rzp_test_Zc5byswcyV2mBa",
        key_secret: "4b4miOAumGlwoSigTndsbVY0",
      });

      const options = {
        amount: parseInt(newOrder.orderList[0].totalPrice)*100, // amount in the smallest currency unit
        currency: "USD",
        receipt: "order_rcptid_12",
      };
   
      instance.orders.create(options, function (err, orderz) {
        console.log("error from razr pay api:",err);
        console.log("order from razor pay:",orderz);
        let id = orderz.id
        res.render("user/razorpayButton",{totalINR,id,orderDetail:newOrder.orderList[0]});
      });

      //const orderId = orders.id;
      //res.render("user/razorpayButton");
    }

    }
    else if(req.body.payoption=='paypal')
    { 
      const result = await userOrders.updateOne(
        { "orderList._id": orderId },
        { $set: { "orderList.$.paymentMethod": "Pay Pal" } }
      );
      res.redirect('/PayPal');

    }

}
,
payPalconfirmOrder: (req,res)=>{
    if(req.session.loggedIn)
    {

      res.render('user/orderConfirm');

    }
    else{
      res.redirect('/login');
    }
},
razorPayConfirmOrder:async(req,res)=>
{  
  
  if(req.session.loggedIn)
  { 

    const mongoId =req.session.userid._id;
    const uid = shortid.generate(mongoId);
    const orderId= req.session.latestOrderId;
    const newOrder = await userOrders.findOne(
     { userId: mongoId, "orderList._id": orderId },
     { "orderList.$": 1 }
   );
   await userOrders.findOneAndUpdate(
    { userId: mongoId, "orderList._id": orderId },
    { $set: { "orderList.$.paymentMethod": "Razor PAY", "orderList.$.status": "confirmed" } }
  );
    res.render('user/orderConfirm',{order:newOrder.orderList[0],uid}); 
}
  else{
    res.redirect('/login');
  }


},
passwordReset: async (req, res) => {
  if (req.session.loggedIn) {
    const uEmail = req.session.userid.email;
    console.log("email is ", uEmail);
    const user = await users.findOne({ email: uEmail });
    console.log(user);
    const hashedPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(req.body.password, hashedPassword);
    if (uEmail == req.body.email && isPasswordMatch) {
      console.log("credentials ok");
      let password = req.body.npassword;
      let confirmPassword = req.body.cpassword;
      if (password === confirmPassword) {
        console.log("password matched");
        bcrypt.hash(password, 10, function (err, hashedPassword) {
          if (err) {
            console.log(err);
            res.status(500).json({ error: 'Error hashing password' });
          } else {
            console.log("password encrypted");
            users.findOne({ email: uEmail }, function (err, user) {
              if (err) {
                console.log(err);
                res.status(500).json({ error: 'Error finding user' });
              } else if (!user) {
                console.log('User not found');
                res.status(404).json({ error: 'User not found' });
              } else {
                user.password = hashedPassword;
                user.save(function (err, updatedUser) {
                  if (err) {
                    console.log("error at hashing password", err);
                    res.status(500).json({ error: 'Error updating password' });
                  } else {
                    console.log('Password updated successfully');
                    res.status(200).json({ message: 'Password updated successfully' });
                  }
                });
              }
            });
          }
        });
      } else {
        console.log("new password does not match confirm password");
        res.status(400).json({ error:"passwords does not match"});
       // res.json({ success: false, message: 'password does not match' }) ;
      }
    }
  }}
}
     

    
  
    
  

    
  
  