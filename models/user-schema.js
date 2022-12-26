const mongoose = require('mongoose');
const userSchema= new mongoose.Schema({
    username : String,
    email:String,
    password:String,
    age: String,
    userStatus :String

});
module.exports = mongoose.model("User",userSchema);