const mongoose = require('mongoose');



const wishlistSchema= new mongoose.Schema({ 
    userEmail :{type:String , default:null},
    product :[{
                 pid: {  type: mongoose.Schema.Types.ObjectId,
                        ref:  "products"
                       // unique:true
                        }                
     }] 
});

module.exports ={ 
    wishlistdb: mongoose.model( "wishlistdb",wishlistSchema)

 }