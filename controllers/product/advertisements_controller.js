var ProductCategory=require('../../models/identifiers/ProductCategory');

var Advertisement=require('../../models/Advertisement');
var Book=require('./books_controller');
var Electronics=require('./electronics_controller');
var Other=require('./others_controller');


var Comment=require('../../models/Comment');
var Notification=require('../../models/Notification');
var Bid=require('../../models/Bid');

var userFunctions=require('../functions/user');
var advertisementFunctions=require('../functions/advertisement');


exports.publish=function(req,res){
	
	if(req.session.user_id===undefined){
		userFunctions.sendToLogin(res);
	}
	else{
		var input=req.body;
		var response={};
		var error=advertisementFunctions.validatePublishData(req);
		if(error){
			response.user_info=req.session;
			response.error=error;
			res.render('publish',{response:response});
		}
		else{
			var productCategory=input.category;
			var afterProductSaved=function(product_id,thumb_path){
				var advertisement=advertisementFunctions.saveAdvertisement(req,product_id,thumb_path);
				//add to activity
				userFunctions.addPublishActivity(req.session,advertisement);
				//redirect to home
				res.redirect('/');
				
			};
			//first find category

		 	switch(productCategory){
		 		case 'Book':
		 			Book.publish(req,afterProductSaved);
		 			break;
				case 'Electronics':
					Electronics.publish(req,afterProductSaved);
					break;	
				case 'Other':
					Other.publish(req,afterProductSaved);
					break;
		 	}
	 	}
	}	
}
exports.publishpage=function(req,res){
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
		var response={};
		response.user_info=req.session;
		res.render('publish',{response:response});
	}
}





exports.comment=function(req,res){
	//if no user logged in

	////////////////////////
	var input=req.body;
	var comment=new Comment(input);
	comment.user_desc=req.session.name+','+req.session.user_type+' at NITH';
	comment.user_type=req.session.user_type;
	comment.ad_id=req.session.ad_id;
	comment.save();
	console.log(input.comment);
	//add to activity
	var activity=new Activity(input);
	activity.user_id=req.session.user_id;
	activity.user_name=req.session.name;
	activity.activity='commented on Advertisement by : '+comment.user_desc+' at '+comment.createdAt;
	activity.save();

	res.redirect('/api/view/advertisement');
	//res.json({status:'Success'});
}

//needs rating and ad details
exports.rate=function(req,res){
	//if no user logged in
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
	var input=req.body;
	var user_info=req.session;
	var ad_id=input.ad_id;
	//add rating for the add
	advertisementFunctions.addRating(input,user_info.user_id,function(){
		//add activity to user account
		userFunctions.addRatingActivity(user_info,input,function(){
			//notify user successfully rating by adding to tab
			var notification='Successfully rated the advertisement '+input.rating+' stars.';
			userFunctions.addActivityNotification(user_info.user_id,notification,function(){
				//add notfication to publisher of ad
				userFunctions.addRatingNotification(user_info,input,function(){
					userFunctions.sendToAd(res,ad_id);
				});
			});
		});
	});
	
	
	}
}


// needs amount and ad details
exports.bid=function(req,res){
	//if no user logged in

	/////////////////////
	var input=req.body;
	var bid=new Bid(input);
	bid.user_desc=req.session.name+','+req.session.user_type+'at NITH';
	bid.ad_id=input.ad_id;
	bid.amount='Rs. '+bid.amount;
	bid.user_type=req.session.user_type;
	bid.ad_id=req.session.ad_id;
	bid.save();
	var session=req.session;
	var notification=new Notification(session);
	notification.user_id=req.session.user_id;
	notification.user_desc=req.session.name+','+req.session.user_type+'at NITH';
	notification.user_type=req.session.user_type;
	notification.to_id=input.user_id;
	notification.product_name=input.description;
	notification.desc='Bid was done by: '+req.session.name+' for your Advertisement in '+session.category;
	notification.save();

	//add to activity
	var activity=new Activity(input);
	activity.user_id=req.session.user_id;
	activity.user_name=req.session.name;
	activity.activity='Bidded on Advertisement by : '+input.user_desc+' at '+bid.createdAt;
	activity.save();
	res.redirect('/api/view/advertisement');
}