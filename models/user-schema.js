const mongoose = require('mongoose');
const userSchema= new mongoose.Schema({
    username : String,
    password:String,
    email:String,
    mobile: String,
    block: Boolean,
    
   

});

const cartSchema= new mongoose.Schema({
    userId : mongoose.Schema.Types.ObjectId,
    product :[{
                 pid: {  type: mongoose.Schema.Types.ObjectId,
                        ref:  "products"},
                 size: {type:String, default:'m'},
                 qty: {type:Number, default:'1'} 
     }] 
});

module.exports ={ 
   User: mongoose.model("User",userSchema),
   cartCollection : mongoose.model("cartCollection",cartSchema)

}