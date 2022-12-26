const express = require('express');
const app = express();
var path=require('path');
const dbConnection = require('./models/mong-conct')


app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:false}));
dbConnection();
const userRouter = require('./routes/users');
app.use('/users',userRouter);

app.listen(4000);
