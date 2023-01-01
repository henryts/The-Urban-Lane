const users = require("../models/user-schema");
const admin_cred = require("../models/admin-schema");
const mongooseModels = require("../models/admin-schema");
const Catagory = mongooseModels.catagory;
const { redirect } = require('express');
 
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

  categoryView: async(req, res) => {
    //CategoryRender
    var num=1;
    var catData = await Catagory.find({});
    res.render("admin/page-categories",{catData, num});
  },

  categoryPost: async(req, res) => {
    //CategoryPost
    var catData = await Catagory.find({});
    var num=0;
    const newCat = new Catagory({
      CategoryName: req.body.catName,
      slug: req.body.catSlug,
      Description: req.body.catDisc,
    });
    newCat.save(function (err, newCat) {
      if (err) {
        res.send("db error");
      } else {
       
       // res.redirect("/admin/categoryView");
       res.render("admin/page-categories",{catData, num})
        
      }
    });
  },
};
