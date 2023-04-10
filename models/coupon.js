const mongoose = require('mongoose');
const couponSchema= new mongoose.Schema({
     
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    discount: { type: Number, required: true },
    minTotalPrice: { type: Number, required: true },
    maxDiscount: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    });
    module.exports ={ 
        coupondbs: mongoose.model(" coupondbs",couponSchema),
       
     
     }