const express = require('express');
const passport = require('passport');
const app = express();
var path=require('path');
const dbConnection = require('./models/mong-conct')
const userRouter = require('./routes/users');


app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:false}));
app.use(passport.initialize());
app.use(passport.session());
//passport -- mounting flash and session
app.use(flash());
app.use(session({
    secret:"HELLO", //setup .env file
    resave:false,
    saveUninitialized:false;
}))

dbConnection();

app.use('/users',userRouter);

app.listen(4000);
