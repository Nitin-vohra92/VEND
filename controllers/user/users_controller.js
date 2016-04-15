var Teacher=require('./teachers_controller');
var Student=require('./students_controller');
var Other=require('./others_controller');
var Account=require('../../models/Account');

var userFunctions=require("../functions/user");
var TemporaryUser=require('../../models/users/TemporaryUser');

var helper=require('../functions/helper');

var ROUTES=require('../../routes/constants');

exports.register=function(req,res){

	var response={};
	//uncheck later after testing is done
	if(req.session.temp_id!==undefined){
		res.redirect(ROUTES.CONFIRM);		
	}
	else{
		var input=req.body;
		var image=req.files.profile_pic;

		var error=userFunctions.validateRegistrationData(req);
		if(error){
			response.error=error;
			res.render('register',{response:response});
		}
		else{
			//for every type of user
			Account.findOne({username:input.username},function(err,account){
				console.log(account);
			 	if(account!==null){
					error="Please choose a different username!! Entered username already exists."
					response.error=error;
					res.render('register',{response:response});
				}
				else
				{
					//store temporarily and send confirmation
					var temp_id=userFunctions.storeTemporaryUser(input,image.path);
					req.session.temp_id=temp_id;
					req.session.save(function(err) {
								console.log(err);
					});
					userFunctions.sendConfirmationMail(temp_id);
					res.redirect(ROUTES.CONFIRM);		
				}
			});
		}
//closing staring else, uncomment later	
	}
}

exports.confirm=function(req,res){
	var temp_id=req.session.temp_id;
	var token=req.body.token;
	var response={};
	TemporaryUser.findOne({temp_id:temp_id},function(err,temporaryUser){
		if(err)
			console.log(err);
		if(temporaryUser===null){
			var error="Your session has expired!! Please register again.";
			response.error=error;
			res.render('register',{response:response});
		}
		else{
			if(temporaryUser.token===parseInt(token)){
				var user_data=JSON.parse(temporaryUser.user_description);
				var image_path=temporaryUser.image_path;
					//store the unconfirmed registrations +store image file path
					// and delete entry from temporary table
					userFunctions.deleteTemporaryUser(temp_id);
					switch(user_data.type){
					case 'Teacher':
						Teacher.register(req,res,user_data,image_path,function(){
							res.redirect(ROUTES.HOME);
						});
						break;
					case 'Student':
						Student.register(req,res,user_data,image_path,function(){
							res.redirect(ROUTES.HOME);
						});
						break;
					case 'Other':
						Other.register(req,res,user_data,image_path,function(){
							res.redirect(ROUTES.HOME);
						});
						break;		
			 			}


			}
			else{
				var error="Token you entered is incorrect!! Please check again.";
				response.error=error;
				res.render('confirm',{response:response});
			}
		}

	});

}

exports.send_confirmation=function(req,res){
	var response={};
	var send=req.query.send;
	var temp_id=req.session.temp_id;
	if(temp_id!==undefined){
		if(send==='email'){
			userFunctions.sendConfirmationMail(temp_id);
			var message="Message sent!! Please check your email again.";
			response.message=message;
			res.render('confirm',{response:response});
		}
		if(send==='phone'){
			//will try later if possible
			userFunctions.sendConfirmationMessage(temp_id);
			var not_available="Info: This feature is not yet available. Try sending mail again to get the token";
			var message="Message sent!! Please check your phone for the token.";
			response.message=not_available;
			res.render('confirm',{response:response});
		}
	}
	else{
		var error="Your session has expired!! Please register again.";
		response.error=error;
		res.render('register',{response:response});
	}

}

exports.forgot=function(req,res){
	var response={};
	var input=req.body;
	var username=input.username;
	var email=input.email;
	Account.findOne({username:username},function(err,account){
			 	if(account===null){
					error="Username doesn't exist!! Please check again."
					response.error=error;
					res.render('forgot',{response:response});
				}
				else
				{
					var sendEmail=function(user){
						if(user.email===email){
							userFunctions.sendPasswordMail(user.email,user.firstname,account.username,account.password);
							var message="Password sent. Check your email.";
							response.message=message;
							res.render('login',{response:response});							
						}
						else{
							var message="Email doesn't match with the registered email for this username. Please check again.";
							response.message=message;
							res.render('forgot',{response:response});
						}


					}
					switch(account.type){
	 						case 'Teacher':
	 							Teacher.find(account.user_id,sendEmail);
	 							break;
	 						case 'Student':
	 							Student.find(account.user_id,sendEmail);
	 							break;
	 						case 'Other':
								Other.find(account.user_id,sendEmail);
								break;	
	 					}	

				}
			});
}


exports.wish=function(req,res){
		var input=req.body;
		var user_info=req.session;
		//check for errors
		var error=helper.validateWish(input);
		if(error){
			var notification='Could not post a wish.'+error;
			userFunctions.addActivityNotification(user_info.user_id,notification,function(){
				res.redirect(ROUTES.HOME);
			});
		}
		else{
			//add wish
			userFunctions.saveWish(user_info,input,function(wish){
				//add activity
				userFunctions.addWishActivity(user_info,wish,function(){
					//add activity notifier
					var notification='Successfully posted a wish. Check recommendations <a href="/api/view/wish?id='+wish._id+'">here</a>.';
					userFunctions.addActivityNotification(user_info.user_id,notification,function(){
						res.redirect(ROUTES.HOME);
					});
				});
			});
		}
		//make page for wish recommendation
}


exports.deleteWish=function(req,res){
	var input=req.body;
	var user_info=req.session;
	var wish_id=input.wish_id;
	userFunctions.deleteWish(user_info,wish_id,req,res,function(){
		var notification='Successfully deleted your wish.';
		userFunctions.addActivityNotification(user_info.user_id,notification,function(){
			res.redirect(ROUTES.WISHES);
		});
	});
}

exports.ping=function(req,res){
	var input=req.body;
	var user_info=req.session;
	userFunctions.addPing(user_info,input,function(){
		userFunctions.addPingActivity(user_info,input,function(){
			//notify user successfully rating by adding to tab
			var notification='Successfully pinged the publisher of the advertisement.';
			userFunctions.addActivityNotification(user_info.user_id,notification,function(){
			//add notfication to publisher of ad
				userFunctions.addPingNotification(user_info,input,function(){
					userFunctions.sendToAd(res,input.ad_id);
				});
			});
		});
	});
}

exports.message=function(req,res){
	var input=req.body;
	var user_info=req.session;
	userFunctions.addMessage(user_info,input,function(){
		var notification='Successfully messaged the user.';
		userFunctions.addActivityNotification(user_info.user_id,notification,function(){
			userFunctions.addMessageNotification(user_info,input,function(){	
				res.redirect(ROUTES.USER+'?id='+input.user_id);
			});
		});
	});
}