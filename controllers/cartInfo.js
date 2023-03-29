const userModel = require("../models/user-schema");
const users=userModel.User;
const cartcollections = userModel.cartcollections;

module.exports = {
 
    cart :async (uEmail)=>{
           
        return await cartcollections.aggregate([
            // match the cart based on the user's email
            { $match: { userEmail: uEmail } },
          
            // unwind the product array
            { $unwind: "$product" },
          
            // join with the products collection to get the product details
            {
              $lookup: {
                from: "products",
                localField: "product.pid",
                foreignField: "_id",
                as: "productDetails"
              }
            },
          
           // group the data by cart ID and product ID
            {
              $group: {
                _id: { cartId: "$_id", productId: "$product.pid" },
                userEmail: { $first: "$userEmail" },
                product: { $first: "$product" },
                productDetails: { $first: { $arrayElemAt: [ "$productDetails", 0 ] } }
              }
            },
          
            // group the data by cart ID
            {
              $group: {
                _id: "$_id.cartId",
                userEmail: { $first: "$userEmail" },
                products: {
                  $push: {
                    pid: "$product.pid",
                    size: "$product.size",
                    qty: "$product.qty",
                    productTotal: "$productDetails.subTotal",
                    productName: "$productDetails.productName",
                    productDescription: "$productDetails.productDescription",
                    brandName: "$productDetails.brandName",
                    productCost: "$productDetails.productCost",
                    productCatogory: "$productDetails.productCatogory",
                    productImages: "$productDetails.productImages",
                   
                  }
                },
               // totalPrice: { $sum: "$product.productTotal" }
              }
            },
            {
              $project: {
                _id: 0,
                userEmail: 1,
                products: {
                  $map: {
                    input: "$products",
                    as: "p",
                    in: {
                      productsId:"$$p.pid",
                      productName: "$$p.productName",
                      qty: "$$p.qty",
                        productCost: "$$p.productCost",
                      productImages: "$$p.productImages",
                      subtotal: { $multiply: [{$toInt:"$$p.qty"}, {$toDouble:"$$p.productCost"}] },
                     
                  },
                  
                },
               //  totalPrice: { $sum: "$products.total" }
                    }
              }
            }
          ]).exec();
         



    }
  

}