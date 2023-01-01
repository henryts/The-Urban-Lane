const users = require("../models/user-schema");
const admin_cred = require("../models/admin-schema");
const mongooseModels = require("../models/admin-schema");
const Catagory = mongooseModels.catagory;
const newProduct = mongooseModels.products;
var fs = require('fs');
var path = require('path');
const { redirect } = require('express');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
var upload = multer({ storage: storage })

 
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
    var btn_val = req.body.submit;
    if (btn_val == "Unblock") {
      users.findByIdAndUpdate(id, { block: false }, function (err, user) {
        if (err) {
          console.log(err);
        } else {
          console.log(user);
        }
      });
    } else if (butn_val == "block") {
      users.findByIdAndUpdate(id, { block: true }, function (err, user) {
        if (err) {
          console.log(err);
        } else {
          console.log(user);
        }
      });
    }
    res.redirect("/user-list");
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
  addProduct:async (req,res)=>{  
    
    //Add Product page display
    var catData = await Catagory.find({});
    res.render("admin/product-add",{catData});
      
     },

     addProductPost:async (req,res) =>
   {  
    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');
    var final_img = {
        contentType:req.file.mimetype,
        image:new Buffer(encode_img,'base64')
    };
    image.create(final_img,function(err,result){
        if(err){
            console.log(err);
        }else{
            console.log(result.img.Buffer);
            console.log("Saved To database");
            res.contentType(final_img.contentType);
            res.send(final_img.image);
        }});






        
        const newpdt = new newProduct({
        productName:req.body.pTitle,
        productDescription: req.body.pDescription,
        brandName: req.body.productBrand,
        productCost: req.body.productCost,
        productCatogory: req.body.catName,
        
      var upload = multer({ storage: storage });

    newpdt.save().then(()=>{
      
      res.redirect("/admin/addProduct");
    });

   }

};
