const users = require("../models/user-schema");
  //********Admin Dashboard PAGE RENDER**********
  exports.adminDashboard = async(req, res) => {
    res.render("admin/admin-index");
  };

  exports.userlist = async(req, res) => {
     const uData = await users.find({});  
     var num=1;
    res.render("admin/User-list",{uData, num });
  };