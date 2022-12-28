const express = require('express');
const app = express();
var path=require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
 }));
const dbConnection = require('./models/mong-conct')
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
dbConnection();
const userRouter = require('./routes/users');
app.use('/',userRouter);

app.listen(3000);
