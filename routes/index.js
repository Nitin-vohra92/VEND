var express = require('express');
var fs = require('fs');
var router = express.Router();
var response={};

router.route('/')
	.get(function(req, res) {//res.json({title: 'User Page',user: req.session.user_id });
			res.redirect('/api/view/home');		
});

//login page	
router.route('/login')
	.get(function(req, res) {
		
		res.render('login',{response:response});
});


//registering a user
router.route('/register')
	.get(function(req, res) {

		res.render('register',{response:response});
});

//editing user info
router.route('/edit')
	.get(function(req, res) {
		res.json({msg:"User can change his info here"});
        res.end();
});

//publish an advertisement page	
router.route('/publish')
	.get(function(req, res) {
		res.render('publish');
});

//viewing an advertisement page
router.route('/view')
	.get(function(req, res) {
		res.json({msg:"Advertisement will be published here"});
        res.end();
});

//edit details of a product
router.route('/edit')
	.post(function(req, res) {
		res.json({msg:"USer can change Advertisement detail here!!"});
        res.end();
});

module.exports = router;
