const mongoose = require('mongoose');
const userSchema= new mongoose.Schema({
    username : String,
    password:String,
    email:String,
    mobile: String,
    block: Boolean
   

});
module.exports = mongoose.model("User",userSchema);