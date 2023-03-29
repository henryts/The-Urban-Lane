const mongoose = require('mongoose');
const shortid = require('shortid');
const userSchema= new mongoose.Schema({
    username : String,
    password:String,
    email:String,
    mobile:{ type: Number, unique:true},
    block: Boolean,
    wishlistCount:{ type: Number,default:0},
    cartCount:{ type:Number,default:0},
    address: [{
        firstName:{ type: String, default:null},
        secondName:{ type: String, default:null},
        addressLine1: { type: String, default:null},
        addressLine2:{ type: String, default:null},
        city:{ type: String, default:null},
        province:{ type: String, default:null},
        postalCode: { type: Number, default:null},
        contactNumber:{ type: String, default:null},
        shippingEmail:{ type: String, default:null}
    }]
});

const cartSchema= new mongoose.Schema({ 
    userEmail :{type:String , default:null},
    product :[{
                 pid: {  type: mongoose.Schema.Types.ObjectId,
                        ref:  "products"
                       // unique:true
                        },
                 size: {type:String, default:'m'},
                 qty: {type:Number},
                 productTotal: {type:Number,default:1}
     }] 
});

module.exports ={ 
   User: mongoose.model("User",userSchema),
   cartcollections : mongoose.model("cartcollections",cartSchema)

}