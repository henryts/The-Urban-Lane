orderCreation: async(req,res)=>
    {  
      if(req.session.loggedIn){
        uid = req.session.userid
        const email = req.session.userid.email;
         const address = JSON.parse(req.body[email]);
    
        userAddress={           firstName:address.firstName,
                               secondName: address.secondName,
                               addressLine1: address.addressLine1,
                               addressLine2: address.addressLine2,
                               city: address.city,
                                province:address.province,
                                postalCode: address.postalCode,
                                contactNumber:address.contactNumber,
                                shippingEmail:address.shippingEmail
        }
      
       // briing pid
           date=new Date();
           let order = await userOrders.findOne({ userId: uid });
        if (!order) {
          order = new userOrders({
              userId: uid,
              orderList: [{
                  items: [],
                  totalPrice: 0,
                  status: 'proccessing',
                  address: userAddress,
                  creationTime: date
              }]
          });
        }

          // Retrieve the user's cart
         const cart = await cartcollections.findOne({ userId: uid }).populate('product.pid');
         // Add items to the orderList
         let totalPrice = 0;
         let items = [];
        
         for(let i = 0; i < cart.product.length; i++) {
           tCost=cart.product[i].qty *  cart.product[i].pid.productCost
              item = {
                 productId: cart.product[i].pid._id,
                 quantity: cart.product[i].qty,
                 price: cart.product[i].pid.productCost,
                 productTotal: tCost
             };
             items.push(item);
             totalPrice += tCost;
            //order.orderList[orderIndex] = orderItem;
             
         }
         const orderItem = {
          items: items,
          totalPrice: totalPrice,
          status: 'proccessing',
          address:userAddress,
          creationTime: date
      };
         order.orderList.push(orderItem);
        await order.save().then(res.send("order placed success fully!!"));
      }
        
        }