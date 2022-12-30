const users = require("../models/user-schema");
const admin_cred = require("../models/admin-schema");

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

  adminLogin: (req, res) => {       //admin login post method

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
    if (btn_val=='Unblock') {
      users.findByIdAndUpdate(id, { block: false }, function (err, user) {
        if (err) {
          console.log(err);
        } else {
          console.log(user);
        }
      });
    } else if (butn_val=='block') {
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
};
