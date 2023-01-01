const mongoose = require('mongoose');
admin_cred={
    username: "admin987@gmail.com",
    password: "admintheking"
};
const catagorySchema= new mongoose.Schema({
    CategoryName:String,
    slug: String,
    Description: String
    })
 const productSchema= new mongoose.Schema({
        productName:String,
        productDescription: String,
        brandName: String,
        productCost: Number,
        productCatogory: String,
        img:
        {
            data: Buffer,
            contentType: String
        }
        })


    module.exports ={   admin_cred,
                        catagory: mongoose.model("catagory",catagorySchema),
                        products: mongoose.model("products",productSchema)
    }

