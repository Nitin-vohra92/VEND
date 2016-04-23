var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');

module.exports=function(app){
	// express setup setup
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(express.static(__dirname + '/public'));         // set the static files location   
	app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
	app.use(logger('dev'));
	app.use(cookieParser());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true,limit: '50mb' }));
	app.use(multipart());
	app.engine('html', require('ejs').renderFile);
	app.use(function(req,res,next){
	  res.set('X-Powered-By','VEND');
	  next();
	});
}