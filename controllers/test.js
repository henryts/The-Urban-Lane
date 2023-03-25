changeQuantity:(req, res) => {
    console.log('aaaaaaaaaaaaaaaaa');
    // let itemQuantity = parseInt(req.body.count) + parseInt(req.body.quantity)
    // console.log(itemQuantity);
    // productHelpers.getStockCount(req.body.product).then((productstock) => {
      // console.log("aaaaaaaaaaaaaaaaaaaaaaa", productstock);
    //   if (productstock >= itemQuantity) {
        // console.log('gggggdddddddddddddddddddddddddddd');

        console.log(req.body,'bodyy');
        userhelpers.changeProductQuantity(req.body).then(async (response) => {
          response.total = await userhelpers.getTotalAmount(req.session.user._id); //user is passed from ajax in order to reload total amount without refreshing
          response.subtotal = await userhelpers.getSubtotalAmount(req.session.user._id, req.body.product);
          console.log(response)
          res.json(response);
        });
    //   } else {
    //     res.json({ status: false })
    //   }
    // })
  },
  changeProductQuantity: (details) => {
    // console.log(details,'888888888888888888888888888888888888888888888888888888');
      count = parseInt(details.count);
      quantity = parseInt(details.quantity);
      return new Promise((resolve, reject) => {
        // Removing the item from cart when quantity is one and when - button is clicked
        if (count == -1 && quantity == 1) {
          db.cart
            .updateOne(
              { _id: ObjectId(details.cart) },
              {
                $pull: { products: { item: ObjectId(details.product) } },
              }
            )
            .then((response) => {
              resolve({ removeProduct: true });
            });
        } else {
          db.cart
            .updateOne(
              {
                _id: ObjectId(details.cart),
                "products.product": ObjectId(details.product),
              },
              {
                $inc: { "products.$.quantity": count },
              }
            )
            .then((response) => {
              resolve({ status: true });
            });
        }
      });
    },


  <script>
  function changeQuantity(cartId, prodId, prod, count) {
    console.log(cartId, prodId, count, prod);
    let quantity = parseInt(document.getElementById(prodId).innerHTML)
    console.log(quantity);
    count = parseInt(count)
    $.ajax({
      url: '/change-product-quantity',
      data: {
    
        cart: cartId,
        product: prodId,
        count: count,
        quantity: quantity
      },
      method: 'post',
      success: (response) => {
        if (response.removeProduct) {
          alert("Product Removed From the Cart")
          location.reload()
        }
  
        else {
        //   document.getElementById(prod ).innerHTML = quantity + count
          document.getElementById('total').innerHTML = response.total
          document.getElementById(prodId).innerHTML = response.subtotal
        }
      }
    })
  }
</script>

<td class="price" data-title="Price"><span> <%=cart[i].products[0].Price%></span></td>
                                        <td class="text-center" data-title="Stock">
                                            <div class="detail-qty border radius  m-auto">
                                                <a class="qty-down" onclick="changeQuantity(`<%=cart[i]._id%>`, `<%=cart[i].product._id%>`,`<%=cart[i].products[0].Productname%>`,-1)"><i class="fi-rs-angle-small-down"></i></a>
                                                <span class="qty-val" ><%=cart[i].quantity%></span>
                                                <a  class="qty-up" onclick="changeQuantity(`<%=cart[i]._id%>`, `<%=cart[i].product._id%>`,`<%=cart[i].products[0].Productname%>`,1)"><i class="fi-rs-angle-small-up"></i></a>
                                                
                                            </div>
                                        </td>