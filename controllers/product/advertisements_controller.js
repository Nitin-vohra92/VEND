var ProductCategory=require('../../models/identifiers/ProductCategory');

var Advertisement=require('../../models/Advertisement');
var Book=require('./books_controller');
var Electronics=require('./electronics_controller');
var Other=require('./others_controller');


var Notification=require('../../models/Notification');

var userFunctions=require('../functions/user');
var advertisementFunctions=require('../functions/advertisement');


exports.publish=function(req,res){
	
		var input=req.body;
		var response={};
		var error=advertisementFunctions.validatePublishData(req);
		if(error){
			response.user_info=req.session;
			response.error=error;
			res.render('publish',{response:response});
		}
		else{
			var user_info=req.session;
			var productCategory=input.category;
			var afterProductSaved=function(product_id,thumb_path){
				var advertisement=advertisementFunctions.saveAdvertisement(req,product_id,thumb_path);
				//add to activity
				userFunctions.addPublishActivity(req.session,advertisement,function(){
					//also add activity notification
					var notification='Successfully published the advertisement. Check Your Ads for more options.';
					userFunctions.addActivityNotification(user_info.user_id,notification,function(){
						
						//redirect to home
						res.redirect('/');
					});
				});
				
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





exports.comment=function(req,res){
	
		var input=req.body;
		if(input.ad_id===''||input.comment==='')
			res.redirect('/');
		else{
			var user_info=req.session;
			var ad_id=input.ad_id;
			//add rating for the add
			advertisementFunctions.addComment(user_info,input,function(){
				//add activity to user account
				userFunctions.addCommentActivity(user_info,input,function(){
					//add notification to the publisher
					//check if publisher is himself commenting on ad
					advertisementFunctions.getAdvertisement(ad_id,function(advertisement){
						if(advertisement.user_id!==user_info.user_id){
							userFunctions.addCommentNotification(user_info,input,function(){});
						}
						userFunctions.sendToAd(res,ad_id);
					});
				});
			});
		}
}

//needs rating and ad details
exports.rate=function(req,res){
	
		var input=req.body;
		if(input.ad_id===''||input.rating==='')
			res.redirect('/');
		else{
			var user_info=req.session;
			var ad_id=input.ad_id;
			//add rating for the add
			advertisementFunctions.addRating(user_info.user_id,input,function(){
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
	
		var input=req.body;
		if(input.ad_id===''||input.bid==='')
			res.redirect('/');
		else{
			var user_info=req.session;
			var ad_id=input.ad_id;
			//add rating for the add
			advertisementFunctions.addBid(user_info,input,function(){
				//add activity to user account
				userFunctions.addBiddingActivity(user_info,input,function(){
					//notify user successfully rating by adding to tab
					var notification='Successfully bidded Rs.'+input.amount+' on the advertisement.';
					userFunctions.addActivityNotification(user_info.user_id,notification,function(){
						//add notfication to publisher of ad
						userFunctions.addBiddingNotification(user_info,input,function(){
							userFunctions.sendToAd(res,ad_id);
						});
					});
				});
			});
		}
}

exports.delete=function(req,res){
	var input=req.body;
	var ad_id=input.delete_ad_id;
	var user_info=req.session;
	advertisementFunctions.deleteAdvertisement(user_info,ad_id,res,function(){
		var notification='Successfully deleted the advertisement.';
		userFunctions.addActivityNotification(user_info.user_id,notification,function(){
			res.redirect("/api/view/user/advertisements");
		});			
	});
}