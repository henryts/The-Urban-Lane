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
      // Import the UserOrders model

orderStat= await userOrders.aggregate([
  {
    $unwind: '$orderList' // Unwind the orderList array
  },
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m', date: '$orderList.creationTime' } // Group by year and month
      },
      count: { $sum: 1 } // Count the number of orders
    }
  },
  {
    $sort: { _id: 1 } // Sort by year and month
  }
]);

//console.log(orderStat);

    
    const currentDate = new Date();

    // First, let's find the total revenue for the current year
    const totalRevenueOfYear = await userOrders.aggregate([
      {
        $unwind: "$orderList"
      },
      {
        $match: {
          "orderList.status": "Delivered",
          "orderList.creationTime": {
            $gte: new Date(currentDate.getFullYear(), 0, 1),
            $lte: new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $toDouble: "$orderList.totalPrice"
            }
          }
        }
      }
    ]);
    
    // Then, let's find the total number of orders of the current month
    const totalOrdersOfMonth = await userOrders.aggregate([
      {
        $unwind: "$orderList"
      },
      {
        $match: {
          "orderList.creationTime": {
            $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            $lte: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: {
            $sum: 1
          }
        }
      }
    ]);
    
    // Finally, let's find the total revenue for the current month
    const totalRevenueOfMonth = await userOrders.aggregate([
      {
        $unwind: "$orderList"
      },
      {
        $match: {
          "orderList.status": "Delivered",
          "orderList.creationTime": {
            $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            $lte: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $toDouble: "$orderList.totalPrice"
            }
          }
        }
      }
    ]);
    
    console.log("Total revenue of the current year:", totalRevenueOfYear[0].totalRevenue);
    console.log("Total number of orders of the current month:", totalOrdersOfMonth[0].totalOrders);
    console.log("Total revenue of the current month:", totalRevenueOfMonth[0].totalRevenue);
    
   res.render("admin/admin-index", {
  orderStat: orderStat,
  totalRevenue: totalRevenueOfYear[0].totalRevenue,
  totalOrders: totalOrdersOfMonth[0].totalOrders,
  revenueOfMonth: totalRevenueOfMonth[0].totalRevenue
});



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
     res.render('admin/pageOrders',{order:orders,orderID});
  } catch (err) {
    console.log(err);
  }

  }
  else{
    res.redirect('/admin/adminlogin');
  }
  },
  orderDetails:async(req,res)=>{
    if(req.session.loggedIn)
    {


     const userId= req.query.userId;
     const orderId = req.query.orderId;
     req.session.userid=userId;
     req.session.orderid=orderId;
     const newOrder = await userOrders.findOne(
      { userId: userId, "orderList._id": orderId },
      { "orderList.$": 1 }
    );
      const userDetails = await users.findOne({
        _id:userId
        });
      
 console.log(newOrder);
 
      res.render('admin/OrderDetail',{order:newOrder,user: userDetails});

    }
    else{
      res.redirect('/admin/adminlogin');
    }
  },
  orderStatusUpdater:async(req,res)=>{
    if(req.session.loggedIn)
    { 

      const uid = req.session.userid;
      const orderId= req.session.orderid;
      const selectedStatus = req.body.status;
      let response = {};
      console.log("status selected",selectedStatus);
      if(selectedStatus=='Delivered')
      {
     await userOrders.findOneAndUpdate(
    { userId: uid, "orderList._id": orderId },
    { $set: { "orderList.$.status": selectedStatus, "orderList.$.paymentStatus": "Payment Recieved", 
               "orderList.$.deliveryStatus":'Package Delivered'} }

               
     );
     response.ok=true;
     res.json(response);
    }
    else if (selectedStatus=='Shipped')
    {

     await userOrders.findOneAndUpdate(
    { userId: uid, "orderList._id": orderId },
    { $set: { "orderList.$.status": 'Shipped',
               "orderList.$.deliveryStatus":'Shipped'} }
       );
       response.ok=true;
       res.json(response);
    
    }
    else if (selectedStatus=='Cancel')
    {

     await userOrders.findOneAndUpdate(
    { userId: uid, "orderList._id": orderId },
    { $set: { "orderList.$.status": 'Cancelled',
               "orderList.$.deliveryStatus":'Returning',
               "orderList.$.paymentStatus":'pending'} }
       );
       response.ok=true;
       res.json(response);
    }
    }
  },
  salesReportFilter:async (req,res)=>{
    if(req.session.loggedIn)
    {
        
         res.render("admin/salesReportFilter",{})
     }
},
salesReportPost:async(req,res)=>{
  const startdate = new Date(req.body.startdate);
  const enddate = new Date(req.body.enddate);
  console.log("start date",startdate);
  console.log("end date",enddate); 
  
 
  try {
    const orders = await userOrders.aggregate([
      {
        $unwind: "$orderList"
      },
      {
        $match: {
          "orderList.status": "Delivered",
          "orderList.creationTime": { $gte: startdate, $lte: enddate }
        }
      },
      {
        $project: {
          orderHashId: "$orderList.orderHashId",
          userEmail: "$userEmail",
          totalPrice: "$orderList.totalPrice",
          orderStatus: "$orderList.status",
          paymentMethod: "$orderList.paymentMethod",
          creationTime: "$orderList.creationTime"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: "$totalPrice" } },
          orders: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          orders: 1
        }
      }
    ]);

    //res.status(200).json(orders[0]);
    console.log(orders[0].orders);
    res.render("admin/salesReportFilter",{orders:orders[0]});
    //console.log(orders[0].orders);
     
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

  


 

}



}
