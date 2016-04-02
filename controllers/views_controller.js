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
	//if any user is logged in
	if(req.session.user_id){
		var user_type=req.session.user_type;
			switch(user_type){
	 			case 'Teacher':
	 				Teacher.home(req,res);
	 				break;
	 			case 'Student':
	 				Student.home(req,res);
	 				break;
	 			case 'Other':
					Other.home(req,res);
					break;	
	 		}

	}
	//if no user logged in
	else{
		var response={};
			//getting latest advertisements
			Advertisement.find({}, null, {limit: 4, sort: {'createdAt': -1}}).exec(function(err, advertisement) {
				response.latest=advertisement;
				//console.log('Inside latest');
				//getting recently viewed
				RecentlyViewed.find({}, null, {limit: 4}).exec(function(err, advertisement) {
  					response.recent=advertisement;
  					//console.log('Inside recents');
  						Wish.find({}, null, { sort: {'createdAt': -1}}).exec(function(err, wishes) {
  							response.wishes=wishes;
  							//res.json(response);
							res.render('index',{response:response});
						});
  				});
			});
		
	}
}

//for advertisement view
exports.advertisement=function(req,res){
	if(req.session.user_id===undefined){
		userFunctions.sendToLogin(res);
	}
	else{
		var response={};
		response.user_info=req.session;

		var ad_id=req.query.id;
		advertisementFunctions.getAdvertisement(ad_id,function(advertisement){
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
							userFunctions.addViewedActivity(user_info,advertisement,function(){
								advertisementFunctions.getPreviousRating(user_id,ad_id,function(rating){
									response.rating_user=rating;
									advertisementFunctions.getRating(ad_id,function(rating_desc){
										response.avg_rating=rating_desc.average;
										response.rating_user_count=rating_desc.count;
										advertisementFunctions.getBids(ad_id,function(bids){
											response.bids=bids;
											advertisementFunctions.getComments(ad_id,function(comments){
												response.comments=comments;
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
}

//for products view
exports.products=function(req,res){
	//if any user is logged in
	console.log(req.session);
	if(req.session.user_id===undefined){
		userFunctions.sendToLogin(res);

	}
	//if no user logged in
	else{
		var response={};
			response.user_info=req.session;
			Advertisement.find({category: 'Book'}, null, {sort: {'createdAt': -1}}).exec(function(err, advertisement) {
				response.books=advertisement;
				Advertisement.find({category:'Electronics'}, null, {'createdAt': -1}).exec(function(err, advertisement) {
  					response.electronics=advertisement;
  						Advertisement.find({category:'Other'}, null, {'createdAt': -1}).exec(function(err, advertisement) {
  							response.others=advertisement;
							//res.json(response);
							res.render('products',{response:response});
						
  				});
  				});
			});
		
	}
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
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
	var response={};
	response.user_info=req.session;
	Activity.find({user_id:req.session.user_id}, null, {limit: 20, sort: {'createdAt': -1}}).exec(function(err, activities) {
	  				response.activities=activities;
	  				res.render('activities',{response:response});
	  				//console.log(response.activities[])
	  				//res.json(response);
  				});
	}
}

//for user notification

exports.notifications=function(req,res){
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
	var user_id=req.session.user_id;
	var response={};
	response.user_info=req.session;
	Notification.find({$and:[{read:0},{user_id:user_id}]}, null, {sort: {'createdAt': -1}}).exec(function(err, notifications) {
  				response.unread_notifications=notifications;
  				
  				Notification.find({$and:[{read:0},{user_id:user_id}]}, null, {sort: {'createdAt': -1}}).exec(function(err, notifications) {
  				response.read_notifications=notifications;
  				
  				Notification.update({read:0 }, { read: 1 },{upsert: true}, function(err){
  					//res.json(response);
  					res.render('notifications',{response:response});
				});
			});
		});
	}
}

//for viewing books
exports.books=function(req,res){
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
		var response={};
		response.user_info=req.session;
		Advertisement.find({category:'Book'}, null, {sort: {'createdAt': -1}}).exec(function(err, books) {
	  		response.books=books;
	  		//res.json(response);
	  		res.render('books',{response:response});

		});
	}
}

//for viewing books
exports.electronics=function(req,res){
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
		var response={};
		response.user_info=req.session;
		Advertisement.find({category:'Electronics'}, null, {sort: {'createdAt': -1}}).exec(function(err, electronics) {
	  		response.electronics=electronics;
	  		//res.json(response);
	  		res.render('electronics',{response:response});

		});
	}
}

//for viewing others
exports.others=function(req,res){
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
		var response={};
		response.user_info=req.session;
		Advertisement.find({category:'Other'}, null, {sort: {'createdAt': -1}}).exec(function(err, others) {
	  		response.others=others;
	  		//res.json(response);
	  		res.render('others',{response:response});

		});
	}
}
//for view more latest
exports.latest=function(req,res){
	var response={};
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
		response.user_info=req.session;
		advertisementFunctions.latest(function(advertisements){
			response.latest=advertisements;
			res.render('latest',{response:response});
		});
	}
}

//for view more recently viewed
exports.viewed=function(req,res){
	var response={};
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
		response.user_info=req.session;
		advertisementFunctions.recent(function(advertisements){
			response.recent=advertisements;
			res.render('recent',{response:response});
		});
	}
}


//for view more recently viewed
exports.recommended=function(req,res){
	var response={};
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
		var user_type=req.session.user_type;
		response.user_info=req.session;
		advertisementFunctions.recommended(user_type,function(advertisements){
			response.recommended=advertisements;
			res.render('recommended',{response:response});
		});
	}
}


//for user view
exports.user=function(req,res){
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
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
}

//for view more comments
exports.comments=function(req,res){
	if(req.session.user_id===undefined)
		userFunctions.sendToLogin(res);
	else{
	var response=[];
	response.push({user_info:req.session});
	Comment.find({ad_id:input.ad_id}, null, {limit: 10, sort: {'createdAt': -1}}).exec(function(err, comments) {
  				response.push({comments:comments});
  				res.render('',{response:response});
  				
			});
	}
}

//for search page
exports.search=function(req,res){
	var input=req.body;
	console.log('In search');
	var response={};
	var query=input.query;
	response.user_info=req.session;
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

