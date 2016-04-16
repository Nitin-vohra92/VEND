var Account=require('../models/Account');


//controllers


var Teacher=require('./user/teachers_controller');
var Student=require('./user/students_controller');
var Other=require('./user/others_controller');
var Book=require('./product/books_controller');
var Electronics=require('./product/electronics_controller');
var OtherProduct=require('./product/others_controller');

//models
var Account=require('../models/Account');

var RecentlyViewed=require('../models/RecentlyViewed');
var Wish=require('../models/Wish');	
var Advertisement=require('../models/Advertisement');

var Notification=require('../models/Notification');
var Activity=require('../models/Activity');


var userFunctions=require('./functions/user');
var advertisementFunctions=require('./functions/advertisement');

//login page
exports.login=function(req,res){
	var response={};
	res.render('login',{response:response});
}

//register page
exports.register=function(req,res){
	var response={};
	res.render('register',{response:response});
}

exports.confirm=function(req,res){
	var response={};
	var message="Please check your email for the token. It may take upto 5 minutes for the mail to reach you.";
	response.message=message;
	res.render('confirm',{response:response});	
}
exports.forgot=function(req,res){
	var response={};
	res.render('forgot',{response:response});
}
//for home view
exports.home=function(req,res){
	var response={};
	//if any user is logged in
	if(req.session.user_id){
		response.user_info=req.session;
		var user_info=req.session;
		advertisementFunctions.getLatest(4,null,function(latests){
			response.latest=latests;
			advertisementFunctions.getRecentlyViewed(4,null,function(recents){
				response.recent=recents;
				userFunctions.getRecommended(user_info,4,null,function(recommended){
					response.recommended=recommended;
					userFunctions.getNotificationCount(user_info.user_id,function(count){
						response.notification_count=count;
						userFunctions.getAndDeleteActivityNotification(user_info.user_id,function(activity){
							response.activity_notification=activity;
							userFunctions.getWishes(function(wishes){
								response.wishes=wishes;
								//res.json({response:response});
								userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
									response.message_count=message_count;
									res.render('index',{response:response});
								});
							});
							
						});
					});
					//add for wishes

					
				});
				
			});
		});

	}
	//if no user logged in
	else{
		advertisementFunctions.getLatest(4,null,function(latests){
			response.latest=latests;
			advertisementFunctions.getRecentlyViewed(4,null,function(recents){
				response.recent=recents;
				userFunctions.getWishes(function(wishes){
					response.wishes=wishes;
					//res.json({response:response});
					res.render('index',{response:response});
				});
			});
		});
		
	}
}


exports.publish=function(req,res){
		var response={};
		response.user_info=req.session;
		var user_id=req.session.user_id;
		userFunctions.getNotificationCount(user_id,function(count){
			response.notification_count=count;
			userFunctions.getUnreadMessageCount(user_id,function(message_count){
				response.message_count=message_count;
				res.render('publish',{response:response});
			});
			
		});
}

exports.editAdvertisement=function(req,res){
	var response={};
	var input=req.body;
	var user_info=req.session;
	response.user_info=user_info;
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		if(advertisement.user_id!==user_info.user_id||advertisement===null){
			var error='Invalid request recieved. The advertisement was not published from this account. Advertisement might have been deleted. Please check again.'
			userFunctions.sendToError(req,res,error);
		}
		response.advertisement=advertisement;
		advertisementFunctions.getProduct(advertisement.category,advertisement.product_id,function(product){
			response.product=product;
			userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
				response.message_count=message_count;
				res.render('advertisement_edit',{response:response});
			});
			
		});
	});
}
//for advertisement view
exports.advertisement=function(req,res){
	
		var response={};
		response.user_info=req.session;

		var ad_id=req.query.id;
		advertisementFunctions.getAdvertisement(ad_id,function(advertisement){
			if(advertisement===null){
				var error="The advertisement was not found.Following may be the reasons:<br>"+
				"1. The advertisement might have been deleted by the publisher.<br>"+
				'2. The publisher might have confirmed to sell/loan to someone who requested for it,<a href="/api/view/advertisement/closed?id='+ad_id+
				'"> Check here.</a><br>';
				userFunctions.sendToError(req,res,error);
			}
			else if(advertisement._id===undefined){
				var error="The advertisement was not found.Following may be the reasons:<br>"+
				"1. The advertisement might have been deleted by the publisher.<br>"+
				"2. Invalid Ad Id .Please check again.";
				userFunctions.sendToError(req,res,error);
			}
			else{
				/////////////////////////////////////////////////
				//later when advertisement will be deleted check for the same and redirect to page
				//ad has been deleted by the seller
				////////////////////////////////////////////////
				response.advertisement=advertisement;
				if(req.session.user_id===advertisement.user_id)
					response.self=1;
				else
					response.self=0;

				var category=advertisement.category;
				var product_id=advertisement.product_id;
				var user_id=req.session.user_id;
				var user_info=req.session;
				advertisementFunctions.getProduct(category,product_id,function(product){
					response.product=product;
					userFunctions.getAccount(advertisement.user_id,function(publisher){

						response.publisher=publisher;
						//some of the tasks are to be done for every page i.e with *
						//*also get activity notification i.e done something like commented,rated orr 
						//  bid or after he published a ad or anything activity
						//*get any notification for the user i.e 'Updates'-notification count
						//add to activity viewed advertisement
						//get the rating previously done by user
						//get the average rating for the add.
						//bids,comments for  ad
						userFunctions.getAndDeleteActivityNotification(user_id,function(notification){
							response.activity_notification=notification;
							userFunctions.getNotificationCount(user_id,function(count){
								response.notification_count=count;
								advertisementFunctions.getPreviousRating(user_id,ad_id,function(rating){
										response.rating_user=rating;
										advertisementFunctions.getRating(ad_id,function(rating_desc){
											response.avg_rating=rating_desc.average;
											response.rating_user_count=rating_desc.count;
											advertisementFunctions.getBids(ad_id,function(bids){
												response.bids=bids;
												advertisementFunctions.getComments(ad_id,function(comments){
													response.comments=comments;
													advertisementFunctions.getPingStatus(user_info.user_id,ad_id,function(status){
														response.ping_status=status;
														if(notification===undefined){
															userFunctions.addViewedActivity(user_info,advertisement,function(){});
															advertisementFunctions.addToRecentlyViewed(advertisement,function(){});
															userFunctions.addToRecommendation(user_id,null,ad_id,function(){});
														}
														userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
															response.message_count=message_count;
															//////////////////////////////////////////////////////////////////
															//if time please add more items like from same seller,similar items
															//////////////////////////////////////////////////////////////////
															res.render('advertisement',{response:response});

														});				
													});
												});
												
											});
										});
								});
							});
						});
					});
				});
			}
		});	
}

exports.closedAdvertisement=function(req,res){
	var response={};
	response.user_info=req.session;
	var ad_id=req.query.id;
	var user_id=req.session.user_id;
	advertisementFunctions.getClosedAdvertisement(ad_id,function(advertisement){
		if(advertisement===null||advertisement._id===undefined){
			var error="The advertisement was not found.Following may be the reasons:<br>"+
			"1. The advertisement might have been deleted by the publisher.<br>"+
			"2. Invalid Ad Id .Please check again.";
			userFunctions.sendToError(req,res,error);
		}
		else{
			response.advertisement=advertisement;
			var category=advertisement.category;
			var product_id=advertisement.product_id;
			advertisementFunctions.getProduct(category,product_id,function(product){
				response.product=product;
				userFunctions.getNotificationCount(user_id,function(count){
					response.notification_count=count;
					userFunctions.getUnreadMessageCount(user_id,function(message_count){
						response.message_count=message_count;
						res.render('advertisement_closed',{response:response});
					});
				});
			});
		}
	});

}

//for user activities
exports.activities=function(req,res){
	var response={};
	response.user_info=req.session;
	var user_id=req.session.user_id;
	userFunctions.getActivities(user_id,null,function(activities){
	  	response.activities=activities;
		//check for any notification
	  	userFunctions.getNotificationCount(user_id,function(count){
	  		response.notification_count=count;
			userFunctions.getUnreadMessageCount(user_id,function(message_count){
				response.message_count=message_count;
				res.render('activities',{response:response});
			});
	  	});
  	});
}

//for user notification

exports.notifications=function(req,res){
	var user_id=req.session.user_id;
	var response={};
	response.user_info=req.session;
	//move to user functions if needed
	Notification.find({$and:[{read:0},{user_id:user_id}]}, null, {sort: {'_id': -1}}).exec(function(err,unread_notifications) {
  				response.unread_notifications=unread_notifications;
  				
  				Notification.find({$and:[{read:1},{user_id:user_id}]}, null, {sort: {'_id': -1}}).exec(function(err,read_notifications) {
  				response.read_notifications=read_notifications;
  				
  				Notification.update({$and:[{read:0},{user_id:req.session.user_id} ]}, { read: 1 },{multi: true}, function(err){
  					userFunctions.getUnreadMessageCount(user_id,function(message_count){
						response.message_count=message_count;
  						res.render('notifications',{response:response});
					});
				});
			});
		});
}

//for your ads 

exports.myAdvertisements=function(req,res){
	var response={};
	var user_info=req.session;
	response.user_info=user_info;
	userFunctions.getMyAdvertisementsAndPings(user_info.user_id,function(advertisements){
		response.advertisements=advertisements;
		advertisementFunctions.getSuccessFulAdvertisements(user_info.user_id,function(successful_advertisements){
			response.successful_advertisements=successful_advertisements;
			userFunctions.getNotificationCount(user_info.user_id,function(count){
				response.notification_count=count;
				userFunctions.getAndDeleteActivityNotification(user_info.user_id,function(activity){
					response.activity_notification=activity;
					userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
						response.message_count=message_count;
						// res.json({response:response});
						res.render('my_advertisements',{response:response});
					});
				});
				
			});
		});	
	});
}

exports.myWishes=function(req,res){
	var response={};
	var user_info=req.session;
	response.user_info=user_info;
	userFunctions.getUserWishes(user_info.user_id,function(wishes){
		response.wishes=wishes;
		userFunctions.getNotificationCount(user_info.user_id,function(count){
			response.notification_count=count;
			userFunctions.getAndDeleteActivityNotification(user_info.user_id,function(notification){
				response.activity_notification=notification;
				userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
					response.message_count=message_count;
					// res.json({response:response});
					res.render('my_wishes',{response:response});
				});
			});
		});
	});
}

exports.messages=function(req,res){
	var response={};
	var user_info=req.session;
	response.user_info=user_info;
	userFunctions.getMessages(user_info.user_id,function(messages){
		response.messages=messages;
		userFunctions.getAndDeleteActivityNotification(user_info.user_id,function(notification){
			response.activity_notification=notification;
			userFunctions.getNotificationCount(user_info.user_id,function(count){
				response.notification_count=count;
				// res.json({response:response});
				res.render('messages',{response:response});
			});
		});
	});
}

exports.confirmations=function(req,res){
	var response={};
	var user_info=req.session;
	response.user_info=user_info;
	userFunctions.getConfirmations(user_info.user_id,function(advertisements){
		response.advertisements=advertisements;
		userFunctions.getNotificationCount(user_info.user_id,function(count){
			response.notification_count=count;
			userFunctions.getAndDeleteActivityNotification(user_info.user_id,function(notification){
				response.activity_notification=notification;
				userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
					response.message_count=message_count;
					// res.json({response:response});
					res.render('confirmations',{response:response});
				});
			});
		});
	});
}

exports.subscriptions=function(req,res){
	var response={};
	var user_info=req.session;
	response.user_info=user_info;
	userFunctions.getSubscriptions(user_info.user_id,function(subscriptions){
		response.subscriptions=subscriptions;
		userFunctions.getAndDeleteActivityNotification(user_info.user_id,function(notification){
			response.activity_notification=notification;
			userFunctions.getNotificationCount(user_info.user_id,function(count){
				response.notification_count=count;
				userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
					response.message_count=message_count;
					// res.json({response:response});
					res.render('subscriptions',{response:response});
				});
			});
		});
	})
}

//for products view
exports.products=function(req,res){
	
			var response={};
			response.user_info=req.session;
			var user_id=req.session.user_id;
			var sort=req.query.sort;
			if(!sort)
				sort=null;
			advertisementFunctions.getBooks(sort,function(books){
				response.books=books;
				advertisementFunctions.getElectronics(sort,function(electronics){
					response.electronics=electronics;
					advertisementFunctions.getOthers(sort,function(others){
						response.others=others;
						userFunctions.getNotificationCount(user_id,function(count){
								response.notification_count=count;
								response.sort_name=advertisementFunctions.getSortName(sort);
								response.sort=sort;
								if(sort===null)
									response.sort='publish_time';
								userFunctions.getUnreadMessageCount(user_id,function(message_count){
									response.message_count=message_count;
									//res.json(response);
									res.render('products',{response:response});
								});
						});
					});
				});
			});
		
}



//for viewing books
exports.books=function(req,res){
		var response={};
		response.user_info=req.session;
		var user_id=req.session.user_id;
		var sort=req.query.sort;
		if(!sort)
			sort=null;
		advertisementFunctions.getBooks(sort,function(books){
			response.books=books;
			response.sort_name=advertisementFunctions.getSortName(sort);
			response.sort=sort;
			if(sort===null)
				response.sort='publish_time';
			userFunctions.getNotificationCount(user_id,function(count){
				response.notification_count=count;
				userFunctions.getUnreadMessageCount(user_id,function(message_count){
					response.message_count=message_count;
		  			//res.json(response);
		  			res.render('books',{response:response});
				});
	  		});
		});
}

//for viewing books
exports.electronics=function(req,res){
		var response={};
		response.user_info=req.session;
		var user_id=req.session.user_id;
		var sort=req.query.sort;
		if(!sort)
			sort=null;
		advertisementFunctions.getElectronics(sort,function(electronics){
			response.electronics=electronics;
			response.sort_name=advertisementFunctions.getSortName(sort);
			response.sort=sort;
			if(sort===null)
				response.sort='publish_time';
			userFunctions.getNotificationCount(user_id,function(count){
				response.notification_count=count;
				userFunctions.getUnreadMessageCount(user_id,function(message_count){
					response.message_count=message_count;
		  			//res.json(response);
		  			res.render('electronics',{response:response});
				});
	  		});
		});
}

//for viewing others
exports.others=function(req,res){
		var response={};
		response.user_info=req.session;
		var user_id=req.session.user_id;
		var sort=req.query.sort;
		if(!sort)
			sort=null;
		advertisementFunctions.getOthers(sort,function(others){
			response.others=others;
			response.sort_name=advertisementFunctions.getSortName(sort);
			response.sort=sort;
			if(sort===null)
				response.sort='publish_time';
			userFunctions.getNotificationCount(user_id,function(count){
				response.notification_count=count;
				userFunctions.getUnreadMessageCount(user_id,function(message_count){
					response.message_count=message_count;
		  			//res.json(response);
		  			res.render('others',{response:response});
				});
	  		});
		});
}
//for view more latest
exports.latest=function(req,res){
		var response={};
		response.user_info=req.session;
		var user_id=req.session.user_id;
		var sort=req.query.sort;
		if(!sort)
			sort=null;
		
		advertisementFunctions.getLatest(null,sort,function(advertisements){
			response.latest=advertisements;
			response.sort_name=advertisementFunctions.getSortName(sort);
			response.sort=sort;
			if(sort===null)
				response.sort='publish_time';
			userFunctions.getNotificationCount(user_id,function(count){
				response.notification_count=count;
				userFunctions.getUnreadMessageCount(user_id,function(message_count){
					response.message_count=message_count;
					res.render('latest',{response:response});
				});
			});
		});
}

//for view more recently viewed
exports.recent=function(req,res){
		var response={};
		response.user_info=req.session;
		var user_id=req.session.user_id;
		var sort=req.query.sort;
		if(!sort)
			sort=null;
		
		advertisementFunctions.getRecentlyViewed(null,sort,function(advertisements){
			response.recent=advertisements;
			response.sort_name=advertisementFunctions.getSortName(sort);
			response.sort=sort;
			if(sort===null)
				response.sort='publish_time';
			userFunctions.getNotificationCount(user_id,function(count){
				response.notification_count=count;
				userFunctions.getUnreadMessageCount(user_id,function(message_count){
					response.message_count=message_count;
					res.render('recent',{response:response});
				});
			});
		});
}

//find some logic for recommendation
//for view more recommended
exports.recommended=function(req,res){
	var response={};
		var user_info=req.session;
		response.user_info=user_info;
		var sort=req.query.sort;
		if(!sort)
			sort=null;
		userFunctions.getRecommended(user_info,null,sort,function(advertisements){
			response.books=advertisements.books;
			response.electronics=advertisements.electronics;
			response.others=advertisements.others;
			userFunctions.getNotificationCount(user_info.user_id,function(count){
				response.notification_count=count;
				response.sort_name=advertisementFunctions.getSortName(sort);
				response.sort=sort;
				if(sort===null)
					response.sort='publish_time';
				userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
					response.message_count=message_count;
					res.render('recommended',{response:response});
				});
			});
		});
}


//for user view
exports.user=function(req,res){
		var response={};
		var user_info=req.session;
		response.user_info=user_info;
		var view_user_id=req.query.id;
		if(view_user_id==user_info.user_id)
			response.self=1;
		else
			response.self=0;
		//get user details
		//get user advertisements
		//get user activities (limit to 10)
		//do the regular things like add activity,check for notification
		userFunctions.getUser(view_user_id,function(account,user){
			if(account===null||user===null){
				var error="The user was not found.Following may be the reasons:<br>"+
				"Invalid User Id .Please check again.";
				userFunctions.sendToError(req,res,error);
			}
			else{
				response.user=user;
				response.account=account;
				advertisementFunctions.getAdvertisementByUser(view_user_id,function(advertisements){
					response.advertisements=advertisements;
					userFunctions.getActivities(view_user_id,10,function(activities){
						response.activities=activities;
						userFunctions.getAndDeleteActivityNotification(user_info.user_id,function(notification){
							response.activity_notification=notification;
							if(notification===undefined&&(response.self===0)){
								userFunctions.addViewedUserActivity(user_info,view_user_id,function(){});
							}
							userFunctions.getNotificationCount(user_info.user_id,function(count){
								response.notification_count=count;
								//add for subscription status
								userFunctions.getSubscriptionStatus(user_info,view_user_id,function(status){
									response.subscription_status=status;
									userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
										response.message_count=message_count;
										// res.json({response:response});
										res.render('user',{response:response});
									});	
								});
							});
						});
					});
				});
			}
		});
}


exports.wish=function(req,res){
	var wish_id=req.query.id;
	var user_info=req.session;
	var response={};
	response.user_info=user_info;
	response.wish_id=wish_id; 
	var sort=req.query.sort;
		if(!sort)
			sort=null;
	userFunctions.getWish(wish_id,function(wish){
		if(wish===null||wish._id===undefined){
			var error="The wish was not found.Following may be the reasons:<br>"+
			"1. The wish might have been deleted by the publisher.<br>"+
			'2. URL not valid. Please check the URL and try again.';
			userFunctions.sendToError(req,res,error);
		}
		else{
			response.wish=wish;
			advertisementFunctions.getWishRecommendations(wish,sort,function(advertisements){

				response.advertisements=advertisements;
				response.sort_name=advertisementFunctions.getSortName(sort);
				response.sort=sort;
				if(sort===null){
					response.sort='publish_time';
					userFunctions.addViewedWishActivity(user_info,wish,function(){});
				}
				userFunctions.getNotificationCount(user_info.user_id,function(count){
					response.notification_count=count;
					userFunctions.getUnreadMessageCount(user_info.user_id,function(message_count){
						response.message_count=message_count;
						// res.json({response:response});
						res.render('wish',{response:response});
					});
				});
			});	
		}	
	});

}


//for search page
exports.search=function(req,res){
	var input=req.body;
	console.log('In search');
	var response={};
	var query=req.query.q;
	query=query.split(" ");
	var user_id=req.session.user_id;
	response.user_info=req.session;
	var sort=req.query.sort;
		if(!sort)
			sort=null;
	userFunctions.addToRecommendation(user_id,query,null,function(){});							
	switch(input.category){
		case 'User':
			userFunctions.searchUser(query,function(users){
				response.users=users;
				res.render('search',{response:response});
			});
			break;
		case 'Book':
			advertisementFunctions.searchBook(query,function(advertisements){
				response.books=advertisements;
				res.render('search',{response:response});
			});
			break;
		case 'Electronics':
			advertisementFunctions.searchElectronics(query,function(advertisements){
				response.electronics=advertisements;
				res.render('search',{response:response});
			});
			break;
		case 'Others':
			advertisementFunctions.searchOther(query,function(advertisements){
				response.others=advertisements;
				res.render('search',{response:response});
			});
			break;
		default:
			userFunctions.searchUser(query,function(users){
				response.users=users;
				advertisementFunctions.searchBook(query,function(advertisements){
					response.books=advertisements;
					advertisementFunctions.searchElectronics(query,function(advertisements){
						response.electronics=advertisements;
						advertisementFunctions.searchOther(query,function(advertisements){
							response.others=advertisements;
							userFunctions.getNotificationCount(user_id,function(count){
								response.notification_count=count;
								advertisementFunctions.sortAdvertisements(sort,response.books,response.electronics,response.others,function(sorted_books,sorted_electronics,sorted_others){
									response.books=sorted_books;
									response.electronics=sorted_electronics;
									response.others=sorted_others;
									response.query=query;
									response.sort_name=advertisementFunctions.getSortName(sort);
									response.sort=sort;
									if(sort===null)
										response.sort='publish_time';
									userFunctions.getUnreadMessageCount(user_id,function(message_count){
										response.message_count=message_count;
										res.render('search',{response:response});
									});
								});
							});
						});
					});
				});
			});
			break;
	}

}


