
function dbConnection(){
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://0.0.0.0:27017/CustomerData', ()=>{
    console.log("connected to database");
    });
   // mongoose.set('strictQuery', false);
}
module.exports=dbConnection;



    