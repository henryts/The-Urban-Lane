const mongoose = require('mongoose');
const orderSchema= new mongoose.Schema({
     userId: mongoose.Schema.Types.ObjectId,
     
     orderList:[{
                   items: [ { productId:  mongoose.Schema.Types.ObjectId,
                            quantity: String,
                            price: String,
                   }],
                   totalPrice: String,
                   status: String,
                   address:String,
                   creationTime: String,
                   modifiedAt: String,
                   cancellationRequest:{ type:Boolean, default:false} ,
                   returnRequest:{ type:Boolean, default:false}                                     

     } ]
              
    })

    module.exports ={ 
        userOrders: mongoose.model("userOrders",orderSchema),
       
     
     }