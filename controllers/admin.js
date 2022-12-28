const users = require("../models/user-schema");
  //********Admin Dashboard PAGE RENDER**********
  exports.adminDashboard = async(req, res) => {
    res.render("admin-index");
  };

  exports.userlist = async(req, res) => {
     const uData = await users.find({});  
     var num=1;
    res.render("User-list",{uData, num });
  };