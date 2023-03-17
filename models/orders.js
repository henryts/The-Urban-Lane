const mongoose = require('mongoose');
const orderSchema= new mongoose.Schema({
     userId: mongoose.Schema.Types.ObjectId,
     
     orderList:[{
                   items: [ { productId:  mongoose.Schema.Types.ObjectId,
                            quantity: String,
                            price: String,
                            productTotal:String
                   }],
                   totalPrice:String,
                   status: String,
                   address:{              firstName:{ type: String, default:null},
                                          secondName:{ type: String, default:null},
                                          addressLine1: { type: String, default:null},
                                          addressLine2:{ type: String, default:null},
                                          city:{ type: String, default:null},
                                          province:{ type: String, default:null},
                                          postalCode: { type: Number, default:null},
                                          contactNumber:{ type: String, default:null},
                                          shippingEmail:{ type: String, default:null}},

                   creationTime: String,
                   modifiedAt: String,
                   cancellationRequest:{ type:Boolean, default:false} ,
                   returnRequest:{ type:Boolean, default:false}                                     

     } ]
              
    })

    module.exports ={ 
        userOrders: mongoose.model("userOrders",orderSchema),
       
     
     }