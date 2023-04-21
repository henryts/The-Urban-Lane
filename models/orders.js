const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const orderSchema= new mongoose.Schema({
     userId: mongoose.Schema.Types.ObjectId,
     userName: String,
     userEmail:String,
    
     
     orderList:[{
                   items: [ { productId:  mongoose.Schema.Types.ObjectId,
                            productName:String,
                            productCatagory:String,
                            productImages:Array,
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

                   creationTime: Date,
                   modifiedAt: String,
                   deliveryStatus:{ type:String, default:'Yet to Dispatch'},
                   paymentStatus:{ type:String, default:'pending'},
                   paymentMethod:{ type:String},
                   cancellationRequest:{ type:Boolean, default:false} ,
                   cancelReason:{ type:String, default:null} ,
                   returnRequest:{ type:Boolean, default:false},
                   orderHashId:String,
                   couponDiscount: { type: Number, default:0}                                  

     } ]
              
    });
    

    module.exports ={ 
        userOrders: mongoose.model("userOrders",orderSchema),
       
     
     }