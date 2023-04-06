const mongoose = require('mongoose');
const bannerSchema= new mongoose.Schema({
     
     title: String,
     description:String,
     bannerImages: Array
    });

    module.exports ={ 
        bannerdb: mongoose.model("bannerdb",bannerSchema),
       
     
     }