const usersDetails = require("../models/user-schema");
//const admin_cred = require("../models/admin-schema");
//const adminCred=require("../models/admin-schema")
const mongooseModels = require("../models/admin-schema");
const orderModel =  require("../models/orders");
const userOrders = orderModel.userOrders;
const Catagory = mongooseModels.catagory;
const newProduct = mongooseModels.products;
const admins = mongooseModels.adminCred;
const users = usersDetails.User;
const shortid = require('shortid');
var path = require("path");
const { render } = require("ejs");

module.exports = {
  adminDashboard: async (req, res) => {
    //admin-dashboard
    if (req.session.loggedIn) {
      res.render("admin/admin-index");
    } else {
      res.redirect("/admin/adminlogin");
    }
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
  adminLogin: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    console.log(password);
    try {
      if (email == "admin@tul.com" && password == "123") {
        req.session.loggedIn = true;
        // req.session.userid = userObj;
        res.send("Login successful"); // return success message
      } else {
        res.status(400).send("Invalid password");
      }
    } catch {
      res.status(500).send("Internal server error");
    }
  },

  //BLOCKING USER
  blockUser: async (req, res) => {
    id = req.params.id;
    let blck = await users.findByIdAndUpdate(id, { block: true });

    res.redirect("/admin/user-list");
  },
  unblockUser: async (req, res) => {
    id = req.params.id;
    let unlbblk = await users.findByIdAndUpdate(id, { block: false });
    res.redirect("/admin/user-list");
  },

  categoryView: async (req, res) => {
    //catogory page -diplay
    var catData = await Catagory.find({});
    if (req.session.loggedIn) {
      res.render("admin/page-categories", { catData });
    } else {
      res.redirect("/admin/adminlogin");
    }
  },

  categoryPost: async (req, res) => {
    //CategoryPost

    const newCat = new Catagory({
      CategoryName: req.body.catName,
      slug: req.body.catSlug,
      Description: req.body.catDisc,
    });
    newCat.save().then(() => {
      res.redirect("/admin/categoryView");
    });
  },
  deleteCatagory: async (req, res) => {
    let delId = req.query.id;

    Catagory.deleteOne({ _id: delId }, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin/categoryView");
      }
    });
  },
  editCatagory: async (req, res) => {
    let editId = req.query.id;
    let catData = await Catagory.find({});
    let editData = await Catagory.find({ _id: editId });
    console.log(editData);
    res.render("admin/page-categories-edit", { catData, editData });
  },
  editCatagoryPost: async (req, res) => {
    let CategoryName = req.body.catName;
    let slug = req.body.catSlug;
    let Description = req.body.catDisc;
    console.log(req.params.id);

    Catagory.findOneAndUpdate(
      { _id: req.params.id }, // search criteria to find the category
      {
        CategoryName: req.body.catName,
        slug: req.body.catSlug,
        Description: req.body.catDisc,
      }, // updated field values
      { new: true }, // returns the updated category
      (err, updatedCategory) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error updating category.");
        }
        res.redirect("/admin/categoryView");
      }
    );
  },
  addProduct: async (req, res) => {
    //add product render

    //Add Product page display
    var catData = await Catagory.find({});
    if (req.session.loggedIn) {
      res.render("admin/product-add", { catData });
    } else {
      res.redirect("/admin/adminlogin");
    }
  },

  addProductPost: async (
    req,
    res //add product post
  ) => {
    const newpdt = new newProduct({
      productName: req.body.pTitle,
      productDescription: req.body.pDescription,
      brandName: req.body.productBrand,
      productCost: req.body.productCost,
      productCatogory: req.body.catName,
      productImages: req.files,
    });
    newpdt.save().then(() => {
      res.redirect("/admin/addProduct");
    });
  },

  deleteProduct: async (req, res) => {
    //DELETE -products

    let deleteUser = await newProduct.findOneAndRemove({ _id: req.params.id });

    res.redirect("/admin/productList");
  },

  productListView: async (
    req,
    res //Product List ender
  ) => {
    let pData = await newProduct.find({});
    console.log("control in method");
    if (req.session.loggedIn) {
      res.render("admin/list-products", { pData });
    } else {
      res.redirect("/admin/adminlogin");
    }
  },
  editProductPost: async (req, res) => {
    // Product edit page listing
    const id = req.params.id;
    let pdctObj = await newProduct.find({ _id: id });
    var catData = await Catagory.find({});
    console.log(pdctObj);
    res.redirect("/admin/editProductPage/:id");
  },
  editProductPage: async (req, res) => {
    // Product edit page listing
    const id = req.params.id;
    console.log(req.params.id);
    pdctObj = await newProduct.find({ _id: id });
    var catData = await Catagory.find({});
    //give condition for cat data <--correction

    // console.log(pdctObj);
    if (session.loggedIn) {
      res.render("admin/edit-product/:id", { pdctObj, catData });
    } else {
      res.redirect("/admin/adminlogin");
    }
  },
  adminLogout: async (req, res) => {
    req.session.loggedIn = null;
    res.redirect("/admin/adminlogin");
  },
  orderListDisplay:async(req,res)=>{
  if(req.session.loggedIn)
  {
    try {
      const orders = await userOrders.find({});
      let orderID=[];
      let k=0;
    //console.log(orders[1].orderList);
      for(let i=0;i<orders.length;i++)
      {
       for(let j=0;j<orders[i].orderList.length;j++,k++)
       {
         orderID[k] = shortid.generate(orders[i].orderList[j]._id);
       
       }
      }
      console.log("userID :", orderID);
     res.render('admin/pageOrders',{order:orders,orderID});
  } catch (err) {
    console.log(err);
  }

  }
  else{
    res.redirect('/adminlogin');
  }


  }
};
