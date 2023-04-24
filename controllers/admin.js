const usersDetails = require("../models/user-schema");
const mongooseModels = require("../models/admin-schema");
const bannerModels = require("../models/banner");
const couponModels = require("../models/coupon");
const coupondbs=couponModels.coupondbs;
var couponCode = require('coupon-code');
const swal = require('sweetalert2');
const bannerdb=bannerModels.bannerdb;
const orderModel =  require("../models/orders");
const userOrders = orderModel.userOrders;
const Catagory = mongooseModels.catagory;
const newProduct = mongooseModels.products;
const sharp = require('sharp');

const admins = mongooseModels.adminCred;
const users = usersDetails.User;
var path = require("path");
const { render } = require("ejs");
const { response } = require("express");

module.exports = {
  adminDashboard: async (req, res) => {
    //admin-dashboard
    if (req.session.loggedIn) {
      // Import the UserOrders model
//CHART1  
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
  }
  ,
  {
    $project: {
      _id: 1,
      count: { $ifNull: ["$count", 0] } // If count is null, replace it with 0
    }
  },
  {
    $sort: { _id: 1 } // Sort by year and month
  }
]);
 if(orderStat.length==0)
 {
  orderStat=null;
  
var formattedMonthlyOrderCount=null;
 }
 else{

var formattedMonthlyOrderCount = orderStat?.reduce((acc, curr) => {
  const monthYear = (curr._id === '2023-01' ? 'January' : curr._id);
  const count = curr.count;
  return { ...acc, [monthYear]: count };
});
 }
console.log("orderStat",orderStat);  
console.log("formattedMonthlyOrderCount",formattedMonthlyOrderCount);  
//console.log("janary count in fotmatedmonth",formattedMonthlyOrderCount);
function formatOrderStat(orderStat) {
  const monthMap = {};
  for (let i = 1; i <= 12; i++) {
    const month = i < 10 ? `0${i}` : `${i}`;
    const key = `2023-${month}`;
    const match = orderStat.find(stat => stat._id === key);
    monthMap[key] = match ? match.count : 0;
  }
  return monthMap;
}
const monthMap = formatOrderStat(orderStat);
console.log("monthMap",monthMap);
const monthsToDisplay = ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06','2023-07', '2023-08', '2023-09', '2023-10', '2023-11','2023-12'];
if(formattedMonthlyOrderCount==null)
{
  var monthlyOrderCount = [];
  monthlyOrderCount['2023-01']=0;
  monthlyOrderCount['2023-02']=0;
  monthlyOrderCount['2023-03']=0;
  monthlyOrderCount['2023-04']=0;
  monthlyOrderCount['2023-05']=0;
  monthlyOrderCount['2023-06']=0;
  monthlyOrderCount['2023-07']=0;
  monthlyOrderCount['2023-08']=0;
  monthlyOrderCount['2023-09']=0;
  monthlyOrderCount['2023-10']=0;
  monthlyOrderCount['2023-11']=0;
  monthlyOrderCount['2023-12']=0;
}
else{
var monthlyOrderCount = monthsToDisplay.reduce((acc, month) => {
  const count = formattedMonthlyOrderCount[month] || 0;
  acc[month] = count;
  return acc;
}, {});
}
//monthlyOrderCount['2023-01']=formattedMonthlyOrderCount['count'];

console.log("monthlyOrderCount:",monthlyOrderCount);
//console.log("january count",monthlyOrderCount['2023-01']);

//find the payment method count
const results = await userOrders.aggregate([
  {
    $unwind: '$orderList'
  },
  {
    $group: {
      _id: '$orderList.paymentMethod',
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      paymentMethod: '$_id',
      count: 1
    }
  },
  {
    $sort: {
      paymentMethod: 1
    }
  }
]);

// Create a map to hold the counts for each payment method
const countMap = new Map();
countMap.set('COD', 0);
countMap.set('Razor Pay', 0);
countMap.set('PayPal', 0);

// Loop through the results and update the count map
results.forEach(result => {
  const { paymentMethod, count } = result;
  countMap.set(paymentMethod, count);
});

// Get the counts for each payment method
const codCount = countMap.get('COD');
const razorPayCount = countMap.get('Razor Pay');
const payPalCount = countMap.get('PayPal');

// console.log(`COD count: ${codCount}`);
// console.log(`Razor Pay count: ${razorPayCount}`);
// console.log(`PayPal count: ${payPalCount}`);

const currentDate = new Date();
 
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
    
    // find the total number of orders of the current month
   const  startOfMonth1 = new Date();
startOfMonth1.setDate(1);
startOfMonth1.setHours(0, 0, 0, 0);

const endOfMonth = new Date();
endOfMonth.setMonth(endOfMonth.getMonth() + 1);
endOfMonth.setDate(0);
endOfMonth.setHours(23, 59, 59, 999);

const totalRevenueOfMonth = await userOrders.aggregate([
  {
    $match: {
      "orderList.creationTime": { $gte: startOfMonth1, $lte: endOfMonth },
    },
  },
  {
    $unwind: "$orderList",
  },
  {
    $group: {
      _id: null,
      totalPrice: {
        $sum: { $toInt: "$orderList.totalPrice" },
      },
    },
  },
]);

console.log("new Monthly revenue",totalRevenueOfMonth[0]?.totalPrice);
    
  
  
    //console.log("month revenue",totalRevenueOfMonth);
    //FOR CATAGORY CHART
    const startOfMonth = new Date();
startOfMonth.setDate(1); // Set to the first day of the current month

const pipeline = [
  // Match orders placed in the present month
  {
    $match: {
      "orderList.creationTime": { $gte: startOfMonth }
    }
  },
  // Flatten the orderList array and unwind the items array
  { $unwind: "$orderList" },
  { $unwind: "$orderList.items" },
  // Lookup product details for each item using productId
  {
    $lookup: {
      from: "products",
      localField: "orderList.items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  // Flatten the product array and group by category
  { $unwind: "$product" },
  {
    $group: {
      _id: "$product.productCatogory",
      count: { $sum: 1 }
    }
  }
];

const result = await userOrders.aggregate(pipeline);
console.log("result",result);

const catCount =result.reduce((acc, curr) => {
  // Convert the _id to lowercase and use it as the key
  const key = curr._id.toLowerCase();
  // Add the count to the accumulator object
  acc[key] = curr.count;
  return acc;
}, {});
if (!catCount.men) {
  catCount.men = 0;
}
if (!catCount.women) {
  catCount.women = 0;
}
if (!catCount.boy) {
  catCount.boy = 0;
}
if (!catCount.girl) {
  catCount.girl = 0;
}
console.log("catCount:",catCount);
const now = new Date();
const startOfMonth2 = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth2 = new Date(now.getFullYear(), now.getMonth() + 1, 0);

// Use the aggregate function to group the orders and count them
const result1 = await userOrders.aggregate([
  {
    $unwind: "$orderList"
  },
  {
    $match: {
      "orderList.creationTime": {
        $gte: startOfMonth2,
        $lte: endOfMonth2
      }
    }
  },
  {
    $group: {
      _id: null,
      count: { $sum: 1 }
    }
  }
]);
//total number of products
const totalProducts = await newProduct.aggregate([
  { $group: { _id: null, total: { $sum: 1 } } }
]);
console.log("total products",totalProducts);
const totalOrders = result1.length > 0 ? result1[0].count : 0;
console.log("totalOrders",totalOrders);

console.log("Total orders in current month:", totalOrders);
   
    console.log("totalRevenueOfYear ",totalRevenueOfYear);
    if( totalRevenueOfYear.length==0||totalRevenueOfMonth.length==0)
    {
      res.render("admin/admin-index", {
        orderStat: null,
        totalRevenue: 0,
        totalOrders: totalOrders,
        revenueOfMonth: 0,
        catCount:catCount,
        codCount,
        razorPayCount,
        payPalCount,
        totalProducts,
        monthlyOrderCount:monthMap
      });

    }
    else
    {   

   res.render("admin/admin-index", {
  orderStat: orderStat,
  totalRevenue: totalRevenueOfYear[0]?.totalRevenue,
  totalOrders: totalOrders,
  revenueOfMonth:totalRevenueOfMonth[0]?.totalPrice,
  monthlyOrderCount:monthMap,
  codCount,
  razorPayCount,
  payPalCount,
  catCount:catCount,
  totalProducts:totalProducts[0]?.total


});
    }



  } else {
    res.redirect("/admin/adminlogin");
  }
},

  userlist: async (req, res) => {
    //user data listing
    const page= req.query.page || 1;
      const perPage =10;
      if(page==1)
      {
        sno=1;
      }
     else if(page>=2)
      {
        sno=(page-1)*11
      }
      const uData = await users.find({}).skip((page-1)*perPage).limit(perPage);
      
      console.log("length=",uData.length);
    var num = 1;
    res.render("admin/user-list", { uData,
       num,
       pages:Math.ceil(uData.length/perPage),
       sno });
       
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
    for(let i=0;i<req.files.length;i++)
    {
    sharp(req.files[0].path)
    .resize(400, 400, { fit: 'cover' })
    .toFile(`public/bannerUploads/${req.files[0].filename}`, (err, info) => {
      if (err) {
        // Handle the error
      } else {
        // The image has been resized and saved
        console.log("image resized");
      }
    });
  }
    newpdt.save().then(() => {
      res.redirect("/admin/addProduct");
    });
  },

  deleteProduct: async (req, res) => {
    //DELETE -products

    let deleteUser = await newProduct.findOneAndRemove({ _id: req.query.id });

    res.redirect("/admin/productList");
  },

  productListView: async (
    req,
    res //Product List ender
  ) => {
    const page= req.query.page || 1;
    const perPage =10;
    if(page==1)
    {
      sno=1;
    }
   else if(page>=2)
    {
      sno=(page-1)*11
    }
    let pData = await newProduct.find({}).skip((page-1)*perPage).limit(perPage);;
    //console.log("control in method");
    if (req.session.loggedIn) {
      res.render("admin/list-products", { pData,pages:Math.ceil(pData.length/perPage),
      sno });
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
    const id = req.query.id;
   console.log("control",id);
   const pdctObj = await newProduct.find({ _id: id });
    console.log("product Details",pdctObj);
    var catData = await Catagory.find({});
    //give condition for cat data <--correction

    // console.log(pdctObj);
    if (req.session.loggedIn) {
      res.render("admin/edit-product", { pdctObj, catData });
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
      const page= req.query.page || 1;
      const perPage =10;
      if(page==1)
      {
        sno=1;
      }

    //  let sno=req.query.sno ||1;
     else if(page>=2)
      {
      sno=(page-1)*11;
      }
     
     // const count = await userOrders.findOne({query}); 
      //const orders = await userOrders.find({}).skip((page-1)*perPage).limit(perPage);
      const orderscount = await userOrders.aggregate([
        {
          $unwind: "$orderList"
        },
        {
          $project: {
            _id: 0,
            userId: 1,
            userName: 1,
            orderDetails: "$orderList",
          }
        }
      ]);

      const orders = await userOrders.aggregate([
        {
          $unwind: "$orderList"
        },
        {
          $project: {
            _id: 0,
            userId: 1,
            userName: 1,
            orderDetails: "$orderList",
          }
        }
      ]).skip((page-1)*perPage).limit(perPage);
      
        // console.log("orderscount:",orderscount.length);
        // console.log("page:",page);
        // console.log("orders in page",orders.length);
 
      let orderID=[];
      res.render('admin/pageOrders',{
      order:orders,
      pages:Math.ceil(orderscount.length/perPage),
      sno

    });
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
   // res.status(500).json({ message: err.message });
  }},
  bannerForm: (req,res)=>{
    if(req.session.loggedIn)
        {
         
          res.render('admin/bannerUpload');

        }
          else {
            res.redirect("/admin/adminlogin");
          }        
        
  },
  bannerFormPost:(req,res)=>{
    if(req.session.loggedIn)
        {
          const newbanner = new bannerdb({
            offerTitle: req.body.offerTitle,
            heading1: req.body.heading1,
            heading2: req.body.heading2,
            bottomline: req.body.bottomline,
            bannerImages: req.files,
          });
          newbanner.save().then(() => {
            res.redirect("/admin/bannerForm");
          });
        }
        else {
          res.redirect("/admin/adminlogin");
        } 

},
bannerList: async(req,res)=>{
  if(req.session.loggedIn)
  {
    const bannerList  = await bannerdb.find({});
    //console.log(bannerList);
    res.render('admin/bannerList',{bannerList});

  }

  else {
    res.redirect("/admin/adminlogin");
  }

},
bannerDelete:async(req,res)=>
{
  if(req.session.loggedIn)
  {
    const id=req.query.id;
    console.log("id",id);
    const response = {}
    bannerdb.findByIdAndDelete(id, (err, doc) => {
       if (err) {
         console.log(err);
       } else {
        console.log("doc",doc);
        response.ok=true;
        res.json(response);
       }
     });

  }
  else{
    res.redirect("/admin/adminlogin");
  }
},
bannerEdit:async(req,res)=>{
  if(req.session.loggedIn)
  {

    const id = req.query.id;
   
   
   const bData = await  bannerdb.findOne({ _id:id});
   console.log(bData);
   res.render('admin/bannerEditForm',{bData:bData})

  }
   else{
    res.redirect("/admin/adminlogin");
   }
    
},
bannerEditPost:async(req,res)=>{
  if(req.session.loggedIn)
  {
    console.log("control in edit post");
    const offerTitle = req.body.offerTitle;
    const heading1 = req.body.heading1;
    const heading2 = req.body.heading2;
    const bottomline = req.body.bottomline;
    //const bannerImage=req.files;
    const id = req.params.id;
    let response= {};
    const updateBanner = {
      offerTitle: req.body.couponName,
      heading1: req.body.heading1,
      heading2: req.body.heading2,
      bottomline: req.body.bottomline,
      
  };
  
  try {
      const result = await bannerdb.updateOne({ _id: id }, { $set: updateBanner });
      response.success = true;
      response.message = "Banner updated successfully";
      res.status(200).json(response);
  } catch (error) {
      response.success = false;
      response.message = "Error updating Banner";
      res.status(500).json(response);
  }
  
  }
 else {
      res.redirect("/admin/adminlogin");
    } 

},

couponGenerateForm: (req,res)=>{
  if(req.session.loggedIn)
        {
  
    res.render("admin/couponGenerate");
}
else {
  res.redirect("/admin/adminlogin");
} },
couponPost:(req,res)=>{
  if(req.session.loggedIn)
  {
    const couponName = req.body.couponName;
    const discountPercent = req.body.discount;
    const minTotalPrice = req.body.minTotalPrice;
    const maxDiscount = req.body.maxDiscount;
    const expiryDate = req.body.expiryDate;
    const Code  =    couponCode.generate();
    let response= {};
    const newCoupon = new coupondbs({
    name: couponName,
     code: Code,
    discount: discountPercent,
    minTotalPrice: minTotalPrice,
    maxDiscount:maxDiscount,
    expirationDate:expiryDate 
    });
    newCoupon.save().then(() => {
      response.ok=true;
      response.code=Code;
      res.json(response);
     // res.redirect("/admin/couponGenerate");
     
     
    }); 
  }
  else {
    
    res.redirect("/admin/adminlogin");
  }

},
couponlist:async(req,res)=>
{
  if(req.session.loggedIn)
  {
    const couponList = await coupondbs.find({});
   // console.log(couponList);
    res.render("admin/couponList",{cList:couponList});

  }
  else {
    res.redirect("/admin/adminlogin");
  }
},
editCoupon:async(req,res)=>
{ if(req.session.loggedIn)
  {
    const id = req.query.id;
    //console.log("control in edit coupon");
   
   const cData = await coupondbs.findOne({ _id:id});
  //console.log(cData);
   res.render('admin/couponEditForm',{cData:cData});
  }
  else {
    res.redirect("/admin/adminlogin");
  }
},
editCouponPost:async(req,res)=>{
  if(req.session.loggedIn)
  {
    const couponName = req.body.couponName;
    const discountPercent = req.body.discount;
    const minTotalPrice = req.body.minTotalPrice;
    const maxDiscount = req.body.maxDiscount;
    const expiryDate = req.body.expiryDate;
    const id = req.params.id;
    let response= {};
    const updateCoupon = {
      name: req.body.couponName,
      discount: req.body.discount,
      minTotalPrice: req.body.minTotalPrice,
      maxDiscount: req.body.maxDiscount,
      expirationDate: req.body.expiryDate,
  };
  
  try {
      const result = await coupondbs.updateOne({ _id: id }, { $set: updateCoupon });
      response.success = true;
      response.message = "Coupon updated successfully";
      res.status(200).json(response);
  } catch (error) {
      response.success = false;
      response.message = "Error updating coupon";
      res.status(500).json(response);
  }



  }
  else {
    res.redirect("/admin/adminlogin");
  }

},
deleteCoupon:async(req,res)=>
{ 
  if(req.session.loggedIn)
  {

     const id=req.body.id;
     const response = {}
      coupondbs.findByIdAndDelete(id, (err, doc) => {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
          response.ok=true;
          res.json(response);
        }
      });

  }
  else{
    
      res.redirect("/admin/adminlogin");
    }
  }




}







