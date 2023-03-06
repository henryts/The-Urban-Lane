const mongoose = require('mongoose');

const adminCredSchema= new mongoose.Schema({
    adminName:String,
    adminEmail: String,
    adminPassword: String
    })
const catagorySchema= new mongoose.Schema({
    CategoryName:String,
    slug: String,
    Description: String
    })
 const productSchema= new mongoose.Schema({
        productName:String,
        productDescription: String,
        brandName: String,
        size:{type:String, default:'m'},
        qty: {type:String, default:1},
        productCost: String,
        productCatogory: String,
        productImages: Array
        })


    module.exports ={ 
                        catagory: mongoose.model("catagory",catagorySchema),
                        products: mongoose.model("products",productSchema),
                        adminCred: mongoose.model("adminCred",adminCredSchema)
    }

