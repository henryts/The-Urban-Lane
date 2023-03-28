const express = require("express");
const app = express();
var path = require("path");
app.use(express.json()); 
app.use(
  express.urlencoded({
    extended: false,
  })
);
const dbConnection = require("./models/mong-conct");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/admin")));
dbConnection();
const session = require("express-session");
var hour = 3600000;
app.use(
  session({
    secret: "key",
    cookie: { maxAge: hour },
    resave: false,
    saveUninitialized: true,
  })
);

const userRouter = require("./routes/users");
const adminRouter = require("./routes/admin");

app.use("/admin", adminRouter);

app.use("/", userRouter);
// app.use(function(req, res, next) {
//   res.status(404);
//   res.render('user/page-404.ejs');
// }); 

app.listen(4000);
