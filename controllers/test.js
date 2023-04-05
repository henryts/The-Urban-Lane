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


<div class="row">
    <div class="col-xl-8 col-lg-12">
      <div class="card mb-4">
        <article class="card-body">
          <h5 class="card-title">Sale statistics</h5>
          <canvas id="myChart1" height="120px"></canvas>
        </article>
      </div>
    </div>
    <div class="col-xl-4 col-lg-12">
      <div class="card mb-4">
        <article class="card-body">
          <h5 class="card-title">Types of Orders</h5>
          <canvas id="myChart2" height="217"></canvas>
        </article>
      </div>
    </div>
  </div>

  <div>
    <p style="visibility: hidden" id="days">
      <%= JSON.stringify(locals.ordersPerDay) %>
    </p>
    <p style="visibility: hidden" id="payment">
      <%=JSON.stringify(locals.paymentCount) %>
    </p>
  </div>
</section>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>

<script>
  document.write(new Date());

  // Sample data
  var xValues = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  var yValues = [0, 5, 10, 15, 20, 25, 50];
  var buyed = [];
  let daysData = JSON.parse(document.getElementById('days').innerHTML);
  console.log(daysData+"llkjjdj")

  for (let i = 0; i < xValues.length; i++) {
    if (xValues[i] in daysData) {
      buyed.push(daysData[xValues[i]]);
    } else {
      buyed.push(0);
    }
  }

  new Chart('myChart1', {
    type: 'bar',
    data: {
      labels: xValues,
      datasets: [
        {
          fill: false,
          lineTension: 0,
          backgroundColor: 'yellow',
          borderColor: 'rgba(0,0,255,0.1)',
          data: buyed,
          label: 'Sales',
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [{ ticks: { min: 0, max: 25 } }],
      },
    },
  });

  var xValue = ['Razorpay', 'COD', 'Paypal'];
  var yValue = [];
  let paymentData = JSON.parse(document.getElementById('payment').innerHTML);
  yValue.push(paymentData[0]);
  yValue.push(paymentData[1]);
  yValue.push(paymentData[2]);

  var barColors = ['#27968B', 'grey', 'orange'];

  new Chart('myChart2', {
    type: 'pie',
    data: {
      labels: xValue,
      datasets: [
        {
          backgroundColor: barColors,
          data: yValue,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Payment mode',
      },
    },
  });
</script>