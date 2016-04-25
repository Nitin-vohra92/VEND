var Advertisement=require('../../models/Advertisement');
var Book=require('./books_controller');
var Electronics=require('./electronics_controller');
var Other=require('./others_controller');


var userFunctions=require('../functions/user');
var advertisementFunctions=require('../functions/advertisement');

var ROUTES=require('../../routes/constants');

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
			var afterProductSaved=function(product){
				var product_id=product._id;
				var thumb_path=product.images[0].path;
				advertisementFunctions.saveAdvertisement(req,product_id,thumb_path,function(advertisement){
					//add to activity
					userFunctions.addPublishActivity(req.session,advertisement,function(){
						//also add activity notification
						var notification='Successfully published the advertisement.'+
						"Check <a href='/api/view/user/advertisements'>Your Ads</a> for more options.";
						userFunctions.addActivityNotification(user_info.user_id,notification,function(){
							userFunctions.addWishNotification(user_info.user_id,productCategory,product,advertisement._id);
							userFunctions.addSubscriberNotification(advertisement);
							//redirect to home
							res.redirect(ROUTES.HOME);
						});
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



exports.edit=function(req,res){
	var user_info=req.session;
	advertisementFunctions.editAdvertisement(req,function(){
		var notification="Successfully updated Advertisement details.";
		userFunctions.addActivityNotification(user_info.user_id,notification,function(){
			res.redirect(ROUTES.YOUR_ADS);
		});
	});
}


exports.delete=function(req,res){
	var input=req.body;
	var ad_id=input.ad_id;
	var user_info=req.session;
	advertisementFunctions.deleteAdvertisement(user_info,ad_id,req,res,function(){
		var notification='Successfully deleted the advertisement.';
		userFunctions.addActivityNotification(user_info.user_id,notification,function(){
			res.redirect(ROUTES.YOUR_ADS);
		});			
	});
}


exports.comment=function(req,res){
	
		var input=req.body;
		if(input.ad_id===''||input.comment==='')
			res.redirect(ROUTES.HOME);
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
			res.redirect(ROUTES.HOME);
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
			res.redirect(ROUTES.HOME);
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

exports.confirmPing=function(req,res){
	var input=req.body;
	advertisementFunctions.getPing(input.ping_id,function(ping){
		if(ping.ad_id!==input.ad_id||ping===null){
			var error="Invalid Request to confirm a ping. Ping does not correspond to the advertisement.";
			userFunctions.sendToError(req,res,error);
		}
		else{
			var response={};
			var user_info=req.session;
			response.user_info=user_info;
				//add advertisement to successful advertisement and delete related comments,bids etc
				advertisementFunctions.moveToSuccessfulAdvertisement(ping,function(){
				//add an activity
					userFunctions.addConfirmedRequestActivity(user_info,ping,function(){
						//add notification to all requesters for rejection as well as confirmation ...product sold to.
						userFunctions.addConfirmationNotification(user_info,ping,function(){

							//send rejection notification and delete other pings
							userFunctions.addRejectionNotification(user_info,ping,function(){
								// delete all pings
								advertisementFunctions.deletePings(input.ad_id,function(){
									//add activity notification
									var notification="Successfully confirmed the request.";
									userFunctions.addActivityNotification(user_info.user_id,notification,function(){
										res.redirect(ROUTES.YOUR_ADS);
									});
								});
							});
						});
					});
				});
		}
	});
}
