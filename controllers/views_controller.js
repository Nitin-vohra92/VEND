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
var BookModel=require('../models/products/Book');
var ElectronicsModel=require('../models/products/Book');
var OtherModel=require('../models/products/Book');

var RecentlyViewed=require('../models/RecentlyViewed');
var Wish=require('../models/Wish');	
var Advertisement=require('../models/Advertisement');
var Comment=require('../models/Comment');	
var Rating=require('../models/Rating');
var Notification=require('../models/Notification');

var Activity=require('../models/Activity');
var Bid=require('../models/Bid');

//for home view
exports.home=function(req,res){
	//if any user is logged in
	console.log(req.session);
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
				Advertisement.find({}, null, {limit: 4}).exec(function(err, advertisement) {
  					response.recent=advertisement;
  					//console.log('Inside recents');
  						Wish.find({}, null, { sort: {'createdAt': -1}}).exec(function(err, wishes) {
  							response.wishes=wishes;
  						
  							//console.log('Inside wishes');
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
		res.redirect('/login');
	}
	else{
	var input=req.body;
	var recent=new RecentlyViewed(input);
	recent.user_id=req.session.user_id;
	recent.save();
	//now send the content

	var response={};
	response.user_info=req.session;
	response.advertisement=input;
	var category=input.category;
	console.log(input);
	var responseSetter=function(result){
		response.product=result;
		//find comments and rating
		console.log('printing result'+result);
		Comment.find({ad_id:input.ad_id}, null, { sort: {'createdAt': -1}}).exec(function(err, comments) {
  			response.comments=comments;
  			Rating.find({ad_id:input.ad_id}, null, { sort: {'createdAt': -1}}).exec(function(err, ratings) {
  				response.ratings=ratings;
  				Bid.find({ad_id:input.ad_id}, null, { sort: {'createdAt': -1}}).exec(function(err, bids) {
	  				response.bids=bids;
	  				//add to activity
					var activity=new Activity(input);
					activity.user_id=req.session.user_id;
					activity.user_name=req.session.user_name;
					console.log(req.session);
					activity.activity='Viewed an Advertisement on: '+input.category+' by: '+req.session.user_name+' at '+new Date();
					activity.save();
					console.log(activity);
	  				req.session.ad_id=input.ad_id;
	  				req.session.category=input.category;
	  				req.session.product_id=result._id;
	  				
					//res.json(response);
	  				res.render('advertisement',{response:response});
			});
			});
			});

		};
	switch(category){
		case 'Book':
			Book.find(responseSetter,input);
			break;
		case 'Electronics':
			Electronics.find(responseSetter,input);
			break;
		case 'Others':
			OtherProduct.find(responseSetter,input);
			break;
	}
}
}

//for advertisement view after get
exports.get_advertisement=function(req,res){
	if(req.session.user_id==undefined){
		res.redirect('/login');
	}
	else{
	var input=req.session;
	
	//now send the content

	var response={};
	var input=req.session;
	response.user_info=req.session;
	response.advertisement=input;
	var category=input.category;
	console.log(input);
	var responseSetter=function(result){
		response.product=result;
		//find comments and rating
		console.log('printing result'+result);
		Comment.find({ad_id:input.ad_id}, null, {sort: {'createdAt': -1}}).exec(function(err, comments) {
  			response.comments=comments;
  			console.log(comments);
  			Rating.find({ad_id:input.ad_id}, null, {sort: {'createdAt': -1}}).exec(function(err, ratings) {
  				response.ratings=ratings;
  				Bid.find({ad_id:input.ad_id}, null, {sort: {'amount': -1}}).exec(function(err, bids) {
	  				response.bids=bids;
	  				
					//res.json(response);
	  				res.render('advertisement',{response:response});
			});
			});
			});

		};
	switch(category){
		case 'Book':
			Book.find(responseSetter,input);
			break;
		case 'Electronics':
			Electronics.find(responseSetter,input);
			break;
		case 'Others':
			OtherProduct.find(responseSetter,input);
			break;
	}
}
}


//for products view
exports.products=function(req,res){
	//if any user is logged in
	console.log(req.session);
	if(req.session.user_id===undefined){
		res.redirect('/login');

	}
	//if no user logged in
	else{
		var response={};

			//getting latest advertisements
			Advertisement.find({category: 'Books'}, null, {limit: 4, sort: {'createdAt': -1}}).exec(function(err, advertisement) {
				response.books=advertisement;
				//console.log('Inside latest');
				//getting recently viewed
				Advertisement.find({category:'Electronics'}, null, {limit: 4, }).exec(function(err, advertisement) {
  					response.electronics=advertisement;
  					//console.log('Inside recents');
  						Advertisement.find({category:'Other'}, null, {limit: 4, }).exec(function(err, advertisement) {
  					response.others=advertisement;
  							//console.log('Inside wishes');
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
		res.redirect('/login');
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
		res.redirect('/login');
	else{
	var user_id=req.session.user_id;
	var response={};
	response.user_info=req.session;
	Notification.find({$and:[{read:0},{user_id:user_id}]}, null, {limit: 20, sort: {'createdAt': -1}}).exec(function(err, notifications) {
  				response.unread_notifications=notifications;
  				
  				Notification.find({$and:[{read:0},{user_id:user_id}]}, null, {limit: 20, sort: {'createdAt': -1}}).exec(function(err, notifications) {
  				response.read_notifications=notifications;
  				
  				Notification.update({read:0 }, { read: 1 },{upsert: true}, function(err){
  					console.log('Updated Seen!!');
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
		res.redirect('/login');
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
		res.redirect('/login');
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
		res.redirect('/login');
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
	if(req.session.user_id===undefined)
		res.redirect('/login');
	else{
		Advertisement.latest(req,res);
	}
}

//for view more recently viewed
exports.viewed=function(req,res){
	if(req.session.user_id===undefined)
		res.redirect('/login');
	else{
		Advertisement.viewed(req,res);
	}
}


//for view more recently viewed
exports.recommended=function(req,res){
	if(req.session.user_id===undefined)
		res.redirect('/login');
	else{
		Advertisement.recommended(req,res);
	}
}


//for user view
exports.user=function(req,res){
	if(req.session.user_id===undefined)
		res.redirect('/login');
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
		res.redirect('/login');
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
	response.user_info=req.session;
	switch(input.category){
		case 'User':
			Account.find({name: /input.query/i},function(err,users){
					response.users=users;
					res.render('search',{response:response});
			});
			break;
		case 'Book':
			BookModel.find({$or:[{title: /input.query/i},{author: /input.query/i}]},function(err,books){
					response.books=books;
					res.render('search',{response:response});
			});
			break;
		case 'Electronics':
			ElectronicsModel.find({$or:[{name: /input.query/i},{brand: /input.query/i},{sub_category: /input.query/i}]},function(err,electronics){
					response.electronics=electronics;
					res.render('search',{response:response});
			});
			break;
		case 'Others':
			OtherModel.find({$or:[{name: /input.query/i},{brand: /input.query/i},{sub_category: /input.query/i}]},function(err,others){
					response.others=others;
					res.render('search',{response:response});
			});
			break;
		default:
			Account.find({username: { $regex: input.query, $options: "i" }},function(err,users){
				console.log(input.query);
				response.users=users;
				BookModel.find({$or:[{title: { $regex: input.query, $options: "i" }},{author: { $regex: input.query, $options: "i" }}]},function(err,books){
			
						response.books=books;
					ElectronicsModel.find({$or:[{name: { $regex: input.query, $options: "i" }},{brand: { $regex: input.query, $options: "i" }},{sub_category: { $regex: input.query, $options: "i" }}]},function(err,electronics){
						
							response.electronics=electronics;
						OtherModel.find({$or:[{name: { $regex: input.query, $options: "i" }},{brand: { $regex: input.query, $options: "i" }},{sub_category: { $regex: input.query, $options: "i" }}]},function(err,others){
							
								response.others=others;
							//res.json(response);
							  res.render('search',{response:response});
						});
					});
				});
			});
			break;
	}

}

