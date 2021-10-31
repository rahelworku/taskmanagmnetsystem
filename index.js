let date_ob = new Date();

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
require('dotenv').config();
const app = express();
const fileUpload = require('express-fileupload')
var cookie = require('cookie-parser');

const port = 4000;
var flash = require('connect-flash');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(fileUpload())
app.use(cookie());

    app.use(flash());

app.engine('hbs',expressHandlebars({extname: '.hbs'}));
app.set('view engine','hbs');

const router = require('./server/router/myrouter');

app.use('/',router);
//app.use('/',router)
let date = ("0" + date_ob.getDate()).slice(-2);

app.listen(port, () => console.log(date));
module.exports=app;


