var Teacher=require('./teachers_controller');
var Student=require('./students_controller');
var Other=require('./others_controller');
var Account=require('../../models/Account');
var Wish=require('../../models/Wish');
var Notification=require('../../models/Notification');
var Activity=require('../../models/Activity');

var userFunctions=require("../functions/user");
var TemporaryUser=require('../../models/users/TemporaryUser');




exports.register=function(req,res){

	var response={};
	//uncheck later after testing is done
	if(req.session.temp_id!==undefined){
		var message="Please check your email for the token. It may take upto 5 minutes for the mail to reach you.";
		response.message=message;
		res.render('confirm',{response:response});		
	}
	else{
		var input=req.body;
		var image=req.files.profile_pic;

		var error=userFunctions.validateRegistrationData(input,image);
		if(error){
			response.error=error;
			res.render('register',{response:response});
		}
		else{
			//for every type of user
			Account.findOne({username:input.username},function(err,account){
				console.log(account);
			 	if(account!==null){
					error="Please choose a differnt username!! Entered username already exists."
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
					var message="Please check your email for the token. It may take upto 5 minutes for the mail to reach you.";
					response.message=message;
					res.render('confirm',{response:response});

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
						Teacher.register(req,res,user_data,image_path);
						break;
					case 'Student':
						Student.register(req,res,user_data,image_path);
						break;
					case 'Other':
						Other.register(req,res,user_data,image_path);
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
			userFunctions.sendConfirmationMessage(temp_id);
			var message="Message sent!! Please check your phone for the token.";
			response.message=message;
			res.render('confirm',{response:response});
		}
	}
	else{
		var error="Your session has expired!! Please register again.";
		response.error=error;
		res.render('register',{response:response});
	}

}

exports.login=function(req,res){
	var input=req.body;
	var response={};
	//first find in accounts table
	Account.findOne({username:input.username},function(err,account){
		if(err)
			console.log(err);
		else{
			//if not found
			if(account===null){
				var error="Account Not found!!";
				response.error=error;
				res.render('login',{response:response});
			}
			//if found
			else{
				if(account.password===input.password){
					//find name of type and then accordingly search for details in respective tables
					
						req.session.user_id=account.user_id;
						req.session.user_type=account.type;
						req.session.save(function(err) {
							console.log(err);
						});
						console.log(req.session.user_name);
						
						// var type=account.type;
						 var sessionSetter=function(result){
						 		req.session.name=result.firstname+' '+result.lastname;
						 		req.session.firstname=result.firstname;
								console.log(req.session.user_name);
						 		req.session.profile_pic=result.profile_pic;
						 		req.session.user_desc=result.firstname+' '+result.lastname+' '+account.type+' at NITH';
						 		res.redirect('/');
						 };
						// //after finding type of user search for his details in respective tables
	 					switch(account.type){
	 						case 'Teacher':
	 							Teacher.find(sessionSetter,account);
	 							break;
	 						case 'Student':
	 							Student.find(sessionSetter,account);
	 							break;
	 						case 'Other':
								Other.find(sessionSetter,account);
								break;	
	 					}
					
	 			}
				else{

				var error="Incorrect password!!";
				response.error=error;
				res.render('login',{response:response});
				}
			}
		}
	});
	 
}


exports.logout=function(req,res){
	req.session.destroy(function(err) {
  			// cannot access session here
	});
	res.redirect('/');	 
}

exports.wish=function(req,res){
	if(req.session.user_id===undefined)
		res.redirect('/login');
	else{
		var input=req.body;
		var wish=new Wish(input);
		wish.user_id=req.session.user_id;
		wish.user_desc=req.session.name+','+req.session.user_type+' at NITH';
		wish.user_type=req.session.user_type;
		wish.save();
		//add to activity
		var activity=new Activity(input);
		activity.user_id=req.session.user_id;
		activity.user_name=req.session.user_name;

		activity.activity='Posted a wish: '+wish.description+ ' at '+wish.createdAt;
		activity.save();
		//res.json({status:'Success'});
		res.redirect('/');
	}
}

exports.ping=function(req,res){
	var input=req.body;
	var notification=new Notification(input);
	notification.user_id=req.session.user_id;
	notification.user_desc=req.session.name+','+req.session.user_type+' at NITH';
	notification.user_type=req.session.user_type;
	notification.to_id=input.user_id;
	notification.product_name=input.description;
	notification.desc='Pinged by: '+req.session.user_name+' for your Advertisement in '+ req.session.category;
	notification.save();


	//add to activity
	var activity=new Activity(input);
	activity.user_id=req.session.user_id;
	activity.user_name=req.session.name;
	activity.activity='Pinged the user: '+notification.user_desc+' at '+notification.createdAt;
	activity.save();

	res.redirect('/api/view/advertisement');
}