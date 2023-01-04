const users = require("../models/user-schema");
const admin_cred = require("../models/admin-schema");
const mongooseModels = require("../models/admin-schema");
const Catagory = mongooseModels.catagory;
const newProduct = mongooseModels.products;
var path = require('path');
const { render } = require("ejs");


 
module.exports = {
  adminDashboard: async (req, res) => {
    //admin-dashboard
    res.render("admin/admin-index");
  },

  userlist: async (req, res) => {
    //user data listing
    const uData = await users.find({});
    var num = 1;
    res.render("admin/user-list", { uData, num });
  },

  adminLoginPage: (req, res) => {
    // admin-login page render
    res.render("admin/admin-login");
  },

  //admin login post method
  adminLogin: (req, res) => {
    try {
      if (
        req.body.password == admin_cred.password &&
        req.body.email == admin_cred.username
      ) {
        res.redirect("/admin/dashboard");
      } else {
        res.send("wrong credentials");
      }
    } catch {
      res.send("error");
    }
  },
  //BLOCKING USER
  blockUser: async (req, res) => {
         console.log("control in here");
       id=req.params.id;  

    // ( btn_val=="block")? users.findByIdAndUpdate(id, { block: true }): users.findByIdAndUpdate(id, { block: flase })
       let blck = await users.findByIdAndUpdate(id, { block: true });
      
        res.redirect("/admin/user-list");
  },
 unblockUser: async (req, res) => {
   
    id=req.params.id;  
 // ( btn_val=="block")? users.findByIdAndUpdate(id, { block: true }): users.findByIdAndUpdate(id, { block: flase })
   let unlbblk = await users.findByIdAndUpdate(id, { block: false });
   // users.findByIdAndUpdate(id, { block: flase });
     res.redirect("/admin/user-list");
},

  
  categoryView: async(req, res) => {            //catogory page -diplay
  var catData = await Catagory.find({});
  res.render("admin/page-categories",{catData});

  },

  
  categoryPost: async(req, res) => {           //CategoryPost
   
    const newCat = new Catagory({
      CategoryName: req.body.catName,
      slug: req.body.catSlug,
      Description: req.body.catDisc,
    });
    newCat.save().then(()=>{
      res.redirect("/admin/categoryView")
    });
  },
     addProduct:async (req,res)=>{          //add product render
    
    //Add Product page display
    var catData = await Catagory.find({});
    res.render("admin/product-add",{catData});
      
     },

     addProductPost:async (req,res) =>      //add product post
   {  
        const newpdt = new newProduct({
        productName:req.body.pTitle,
        productDescription: req.body.pDescription,
        brandName: req.body.productBrand,
        productCost: req.body.productCost,
        productCatogory: req.body.catName,
        productImages:req.files
        });
     
        newpdt.save().then(()=>{
      
        res.redirect("/admin/addProduct");
        });

    },
      
    deleteProduct: async(req,res)=>{                 //DELETE -products 
    
    let deleteUser = await newProduct.findOneAndRemove({_id:req.params.id})
   
    res.redirect("/admin/productList");   
  },

     productListView: async (req,res)=>                 //Product List ender
         {
         let pData = await newProduct.find({});
    
         res.render("admin/list-products",{pData});
         }

         };


  /*  otpLogin: async (req,res)=>{

 // Download the helper library from https://www.twilio.com/docs/node/install
    // Set environment variables for your credentials
    // Read more at http://twil.io/secure
    const accountSid = "ACb8ac9111ac07e1d91a356ed1793fb2c8";
    const authToken = "ac8e81cb6816dbb8880138ff4f8815aa";
    const client = require("twilio")(accountSid, authToken);
    const otp = generateOTP();

    client.messages
    .create({ body: `Your OTP is ${otp}`, from: "+17652348786", to: "+916282383283" })
      .then(message => console.log(message.sid));

    }    */  
