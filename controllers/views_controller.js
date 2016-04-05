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
var Comment=require('../models/Comment');	
var Rating=require('../models/Rating');
var Notification=require('../models/Notification');

var Activity=require('../models/Activity');
var Bid=require('../models/Bid');

var userFunctions=require('./functions/user');
var advertisementFunctions=require('./functions/advertisement');

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
					//add for wishes
					res.render('index',{response:response});
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
				//add for wishes
				res.render('index',{response:response});
			});
		});
		
	}
}

//for advertisement view
exports.advertisement=function(req,res){
	
		var response={};
		response.user_info=req.session;

		var ad_id=req.query.id;
		advertisementFunctions.getAdvertisement(ad_id,function(advertisement){
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


//for viewing more wishes
exports.wishes=function(req,res){
	var response=[];
	response.push({user_info:req.session});

	Wish.find({}, null, { sort: {'createdAt': -1}}).exec(function(err, wishes){
  		response.push({wishes:wishes});
  		res.render('',{response:response});

  	});
}

//for user activities
exports.activities=function(req,res){
	var response={};
	response.user_info=req.session;
	Activity.find({user_id:req.session.user_id}, null, { sort: {'_id': -1}}).exec(function(err, activities) {
	  				response.activities=activities;
	  				///check for any notification
	  				res.render('activities',{response:response});
	  				//res.json(response);
  				});
}

//for user notification

exports.notifications=function(req,res){
	var user_id=req.session.user_id;
	var response={};
	response.user_info=req.session;
	Notification.find({$and:[{read:0},{user_id:user_id}]}, null, {sort: {'_id': -1}}).exec(function(err,unread_notifications) {
  				response.unread_notifications=unread_notifications;
  				
  				Notification.find({$and:[{read:1},{user_id:user_id}]}, null, {sort: {'_id': -1}}).exec(function(err,read_notifications) {
  				response.read_notifications=read_notifications;
  				
  				Notification.update({$and:[{read:0},{user_id:req.session.user_id} ]}, { read: 1 },{multi: true}, function(err){
  					//res.json(response);
  					res.render('notifications',{response:response});
				});
			});
		});
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
								//res.json(response);
								res.render('products',{response:response});
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
			userFunctions.getNotificationCount(user_id,function(count){
				response.notification_count=count;
	  			//res.json(response);
	  			res.render('books',{response:response});
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
			userFunctions.getNotificationCount(user_id,function(count){
				response.notification_count=count;
	  			//res.json(response);
	  			res.render('electronics',{response:response});
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
			userFunctions.getNotificationCount(user_id,function(count){
				response.notification_count=count;
	  			//res.json(response);
	  			res.render('others',{response:response});
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
			res.render('latest',{response:response});
		});
}

//for view more recently viewed
exports.viewed=function(req,res){
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
			res.render('recent',{response:response});
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
			res.render('recommended',{response:response});
		});
}


//for user view
exports.user=function(req,res){
		var input=req.body;
		var response=[];
		response.push({user_info:req.session});
		 var responseSetter=function(result){
					response.push({user:result});
					//activities
					Activity.find({user_id:input.user_id}, null, {limit: 10, sort: {'createdAt': -1}}).exec(function(err, activities) {
		  				response.push({activities:activities});
		  				res.render('',{response:response});
	  				});

		 };
							// //after finding type of user search for his details in respective tables
		 					switch(input.type){
		 						case 'Teacher':
		 							Teacher.find(responseSetter,input);
		 							break;
		 						case 'Student':
		 							Student.find(responseSetter,input);
		 							break;
		 						case 'Other':
									Other.find(responseSetter,input);
									break;	
		 					}
}

//for search page
exports.search=function(req,res){
	var input=req.body;
	console.log('In search');
	var response={};
	var query=input.query;
	var user_id=req.session.user_id;
	response.user_info=req.session;
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
							res.render('search',{response:response});
						});
					});
				});
			});
			break;
	}

}

