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
    module.exports ={   admin_cred,
                        catagory: mongoose.model("catagory",catagorySchema),
                        //products: mongoose.model("products",productSchema)
    }

