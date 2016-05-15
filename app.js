var express = require('express');
var mongoose=require('mongoose');
  // mongoose.set('debug', true);
var CONF_FILE=require('./conf.json');
//Database
// local
var db=mongoose.connect('mongodb://127.0.0.1/VEND');
// online
// var db=mongoose.connect('mongodb://'+CONF_FILE.MONGO_DB.USERNAME+':'+CONF_FILE.MONGO_DB.PASSWORD+'@'+CONF_FILE.MONGO_DB.ADDRESS);

var session=require('express-session');
var MongoStore=require('connect-mongo')(session);
var routes = require('./routes/index');
var apiRoutes = require('./api/apiRoutes');
var app = express();
var port=process.env.PORT||3000;

require('./config')(app);
//session setup
app.use(session({
    secret:'anyrandomstring',
    store: new MongoStore({
      mongooseConnection:mongoose.connection
    }),
    resave: false,
    saveUninitialized: true
}));


app.use('/', routes);
app.use('/api',apiRoutes);

//constants
app.locals=require('./views/titles.json');


app.listen(port,function(req,res){
  console.log("Server Started!!"+port);
});