const mongoose = require('mongoose');
const bannerSchema= new mongoose.Schema({
     
     offerTitle: String,
     heading1:String,
     heading2: String,
     bottomline:String,
     bannerImages: Array
    });
    module.exports ={ 
        bannerdb: mongoose.model("bannerdb",bannerSchema),
       
     
     }