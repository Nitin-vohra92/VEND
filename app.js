var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session=require('express-session');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
  // mongoose.set('debug', true);

var multipart = require('connect-multiparty');

var CONF_FILE=require('./conf.json');
//////////////////////////////////////////////////////////
//database 
//local
// add this to git ignore conf.json
// var db=mongoose.connect('mongodb://127.0.0.1/VEND');
// online
var db=mongoose.connect('mongodb://'+CONF_FILE.MONGO_DB.USERNAME+':'+CONF_FILE.MONGO_DB.PASSWORD+'@'+CONF_FILE.MONGO_DB.ADDRESS);

/////////////////////////////////////////////////////////
var MongoStore=require('connect-mongo')(session);
var routes = require('./routes/index');
var apiRoutes = require('./api/apiRoutes');
var app = express();
var port=process.env.PORT||3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));         // set the static files location   

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(cookieParser());
app.use(session({
    secret:'anyrandomstring',
    store: new MongoStore({
      mongooseConnection:mongoose.connection
    }),
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true,limit: '50mb' }));
app.use(multipart());
app.engine('html', require('ejs').renderFile);

app.use(function(req,res,next){
  res.set('X-Powered-By','VEND');
  next();
});
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api',apiRoutes);


app.listen(port,function(req,res){
  console.log("Server Started!!"+port);
});