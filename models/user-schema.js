const mongoose = require('mongoose');
const userSchema= new mongoose.Schema({
    username : String,
    password:String,
    email:String,
    mobile: String,
    block: Boolean
   

});
const cartSchema= new mongoose.Schema({
    userId : String,
    productId :String,
    
   

});

module.exports ={ 
   User: mongoose.model("User",userSchema),
   cartCollection : mongoose.model("cartCollection",cartSchema)

}