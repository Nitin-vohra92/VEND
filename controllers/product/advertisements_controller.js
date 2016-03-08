var ProductCategory=require('../../models/identifiers/ProductCategory');

var Advertisement=require('../../models/Advertisement');
var Book=require('./books_controller');
var Electronics=require('./electronics_controller');
var Other=require('./others_controller');

var Rating=require('../../models/Rating');
var Comment=require('../../models/Comment');
var Notification=require('../../models/Notification');
var Activity=require('../../models/Activity');
var Bid=require('../../models/Bid');

exports.publish=function(req,res){
	if(req.session.user_id===undefined)
		res.redirect('/login');
	else{
		console.log(req.body);
		// res.redirect('/');
		var input=req.body;
	
	var productCategory=input.type;
	//first find name of type

	 	switch(productCategory){
	 		case 'Book':
	 			Book.publish(input,req,res);
	 			break;
			case 'Electronics':
				Electronics.publish(input,req,res);
				break;	
			case 'Other':
				Other.publish(input,req,res);
				break;
	 		}
}
}
exports.publishpage=function(req,res){
	if(req.session.user_id===undefined)
		res.redirect('/login');
	else{
		res.redirect('/publish');
}
	

}
exports.latest=function(req,res){
	var response={};
	response.user_info=req.session;
	Advertisement.find({}, null, {sort: {'createdAt': -1}}).exec(function(err, advertisement) {
  		response.latest=advertisement;
  		res.json(response);
  		//res.render('',{response:response});

	});
}
//recently viewed
exports.viewed=function(req,res){

	var response={};
	response.user_info=req.session;
	Advertisement.find({}, null, {}).exec(function(err, advertisement) {
  		response.recent=advertisement;
  		res.json(response);
  		//res.render('recent',{response:response});

	});
}

exports.recommended=function(req,res){
	var response={};
	response.user_info=req.session;
	var user_type=req.session.user_type;
	if(user_type==='Other'){
		Advertisement.find({}, null, {sort: {'createdAt': -1}}).exec(function(err, recommendations) {
  			response.recommended=recommendations;
  			console.log('Inside recommended');
				 res.json(response);
				//res.render('recommended',{response:response});
			
		});
	}
	else{
		Advertisement.find({user_type:user_type}, null, {sort: {'createdAt': -1}}).exec(function(err, recommendations) {
  			Response.recommended=recommendations;
  			console.log('Inside recommended');
  				console.log('Inside wishes');
				 res.json(response);
				//res.render('recommended',{response:response});

		});
	}
}

exports.comment=function(req,res){
	var input=req.body;
	var comment=new Comment(input);
	comment.user_desc=req.session.user_name+','+req.session.user_type+' at NITH';
	comment.user_type=req.session.user_type;
	comment.ad_id=req.session.ad_id;
	comment.save();
	console.log(input.comment);
	//add to activity
	var activity=new Activity(input);
	activity.user_id=req.session.user_id;
	activity.user_name=req.session.user_name;
	activity.activity='commented on Advertisement by : '+comment.user_desc+' at '+comment.createdAt;
	activity.save();

	res.redirect('/api/view/advertisement');
	//res.json({status:'Success'});
}

//needs rating and ad details
exports.rate=function(req,res){
	var input=req.body;
	var rating=new Rating(input);
	rating.user_desc=req.session.user_name+','+req.session.user_type+' at NITH';
	rating.user_type=req.session.user_type;
	rating.rating=rating.rating+'/10'
	rating.ad_id=req.session.ad_id;
	rating.save();
	//add to activity
	var activity=new Activity(input);
	activity.user_id=req.session.user_id;
	activity.user_name=req.session.user_name;
	activity.activity='Rated an Advertisement by : '+input.user_desc+' at '+rating.createdAt;
	activity.save();
	//res.json({status:'Success'});
	res.redirect('/api/view/advertisement');
}


// needs amount and ad details
exports.bid=function(req,res){
	var input=req.body;
	var bid=new Bid(input);
	bid.user_desc=req.session.user_name+','+req.session.user_type+'at NITH';
	bid.ad_id=input.ad_id;
	bid.amount='Rs. '+bid.amount;
	bid.user_type=req.session.user_type;
	bid.ad_id=req.session.ad_id;
	bid.save();
	var session=req.session;
	var notification=new Notification(session);
	notification.user_id=req.session.user_id;
	notification.user_desc=req.session.user_name+','+req.session.user_type+'at NITH';
	notification.user_type=req.session.user_type;
	notification.to_id=input.user_id;
	notification.product_name=input.description;
	notification.desc='Bid was done by: '+req.session.user_name+' for your Advertisement in '+session.category;
	notification.save();

	//add to activity
	var activity=new Activity(input);
	activity.user_id=req.session.user_id;
	activity.user_name=req.session.user_name;
	activity.activity='Bidded on Advertisement by : '+input.user_desc+' at '+bid.createdAt;
	activity.save();
	res.redirect('/api/view/advertisement');
}