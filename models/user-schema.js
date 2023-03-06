const mongoose = require('mongoose');
const userSchema= new mongoose.Schema({
    username : String,
    password:String,
    email:String,
    mobile:{ type: Number, unique:true},
    block: Boolean,
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
    userId : mongoose.Schema.Types.ObjectId,
    product :[{
                 pid: {  type: mongoose.Schema.Types.ObjectId,
                        ref:  "products",
                        unique:true
                        },
                 size: {type:String, default:'m'},
                 qty: {type:String, default:'1'},
                 productTotal: {type:String,default:null}
     }] 
});

module.exports ={ 
   User: mongoose.model("User",userSchema),
   cartCollection : mongoose.model("cartCollection",cartSchema)

}