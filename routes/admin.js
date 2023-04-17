const express = require("express");
const router = express.Router();
const flash = require("express-flash");
const adminController = require("../controllers/admin");
const users = require("../models/user-schema");
const bcrypt = require("bcrypt");
var multer = require('multer');
var path = require('path');

var storage = multer.diskStorage({
    destination: "public/uploads",
  filename: (req,file,cb,err) =>{
    if(err){
        console.log(err);
    }
    cb(null,Date.now()+path.extname(file.originalname))
  }
})
var bannerStorage = multer.diskStorage({
  destination: "public/bannerUploads",
filename: (req,file,cb,err) =>{
  if(err){
      console.log(err);
  }
  cb(null,Date.now()+path.extname(file.originalname))
}
})
const upload = multer({
  storage:storage
}).array("file");
const uploadBanner = multer({
  storage:bannerStorage
}).array("bannerfile");


router.get('/adminlogin', adminController.adminLoginPage); //admin login page display

router.post('/adminlogin',adminController.adminLogin);

//admin login POST METHOD
//router.use(verifyLogin)
router.get('/dashboard', adminController.adminDashboard); //admin dashboard -index

router.get('/user-list', adminController.userlist); //user list

router.post('/user-list/block/:id', adminController.blockUser); //block user

router.post('/user-list/unblock/:id', adminController.unblockUser); //unblock user

router.get('/categoryView',adminController.categoryView); //catogories

router.post('/categoryPost',adminController.categoryPost); //catogories

router.get('/addProduct',adminController.addProduct); // add product display

router.post('/addProductPost',upload, adminController.addProductPost); //add products post

router.get('/productList',adminController.productListView); //product listing display

router.get('/deleteProduct/:id',adminController.deleteProduct); //delete list

router.post('/editProductPost/:id',adminController.editProductPost); // Product edit page post

router.get('/editProductPage/:id',adminController.editProductPage); // Product edit page display

router.get('/logout',adminController.adminLogout); // admin logout


router.get('/deleteCat',adminController.deleteCatagory);
router.get('/editCat',adminController.editCatagory);
router.post('/categoryPostUpdate/:id',adminController.editCatagoryPost);

router.get('/bannerForm',adminController.bannerForm);
router.post('/bannerFormPost',uploadBanner,adminController.bannerFormPost);
router.get('/bannerList',uploadBanner,adminController.bannerList);
router.get('/bannerDelete',adminController.bannerDelete);
router.get('/bannerEdit', adminController.bannerEdit);




router.get('/pageOrders',adminController.orderListDisplay);
router.get('/orderDetails',adminController.orderDetails);
router.post('/orderStatusUpdate', adminController.orderStatusUpdater); 

router.get('/salesReport', adminController.salesReportFilter); 
router.post('/salesReportPost', adminController.salesReportPost); 
// router.get('/ToPdfSalesReport', adminController.ToPdfSalesReport); 

router.get('/couponGenerate', adminController.couponGenerateForm);
router.post('/couponPost', adminController.couponPost);
router.get('/couponlist', adminController.couponlist);
router.get('/editCoupon', adminController.editCoupon);
router.post('/couponUpdatePost/:id',adminController.editCouponPost);
router.post('/deleteCoupon', adminController.deleteCoupon);









module.exports = router;