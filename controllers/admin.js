const users = require("../models/user-schema");
//const admin_cred = require("../models/admin-schema");
//const adminCred=require("../models/admin-schema")
const mongooseModels = require("../models/admin-schema");
const Catagory = mongooseModels.catagory;
const newProduct = mongooseModels.products;
const admins = mongooseModels.adminCred;
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
       adminLogin:async (req, res) => {
       const mail = req.body.email;
       adminObj = await admins.findOne({adminEmail:mail});

       console.log(adminObj);
       if (adminObj == null) {
        return res.status(400).send("cannot find user");
      }

      if (
        req.body.password == adminObj.adminPassword &&
        req.body.email == adminObj.adminEmail
      ) {
        req.session.loggedIn=true;
        req.session.admin= adminObj;
        console.log("login done");
        res.redirect("/admin/dashboard");
      } else {
        res.send("wrong credentials");
      }
    
    },
     //BLOCKING USER
         blockUser: async (req, res) => {
         console.log("control in here");
         id=req.params.id;  
         let blck = await users.findByIdAndUpdate(id, { block: true });
         res.redirect("/admin/user-list");
  },
 unblockUser: async (req, res) => {
   
    id=req.params.id;  
    let unlbblk = await users.findByIdAndUpdate(id, { block: false });
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
         },
    editProductPost: async(req,res)=>{                 // Product edit page listing
          const id = req.params.id;
         let pdctObj = await  newProduct.find({_id:id });
          var catData = await Catagory.find({});
           

         console.log(pdctObj);
          res.redirect('/admin/editProductPage/:id')
         },
      editProductPage: async(req,res)=>{                 // Product edit page listing
          const id = req.params.id;
          console.log(req.params.id);
          pdctObj = await  newProduct.find({_id:id });
          var catData = await Catagory.find({});
           //give condition for cat data <--correction

         // console.log(pdctObj);
          res.render("admin/edit-product/:id",{pdctObj,catData});
         }
        }