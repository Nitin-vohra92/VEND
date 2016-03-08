var UserTypes=require('../../models/identifiers/UserTypes');
var Teacher=require('./teachers_controller');
var Student=require('./students_controller');
var Other=require('./others_controller');
var Account=require('../../models/Account');
var Wish=require('../../models/Wish');
var Notification=require('../../models/Notification');
var Activity=require('../../models/Activity');

exports.register=function(req,res){
	var input=req.body;
		//for every type of user
	Account.findOne({username:input.username},function(err,account){
		console.log(account);
		if(account==={}){
			res.json({status:"Username already exists!!"});
		}
		else
		{
			switch(input.type){
			case 'Teacher':
				Teacher.register(input,req,res);
				break;
			case 'Student':
				Student.register(input,req,res);
				break;
			case 'Other':
				Other.register(input,req,res);
				break;		
	 	}


		}
	});
	
}


exports.login=function(req,res){
	var input=req.body;
	console.log(input);
	//first find in accounts table
	Account.findOne({username:input.username},function(err,account){
		if(err)
			console.log(err);
		else{
			//if not found
			if(account===null){
				res.json({status:"Account Not found!!"});
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
						 		req.session.user_name=result.firstname+' '+result.lastname;

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
				else
					res.json({staus:"Incorrect Password!!"});
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
		wish.user_desc=req.session.user_name+','+req.session.user_type+'at NITH';
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
	// var notification=new Notification(input);
	// notification.user_id=req.session.user_id;
	// notification.user_desc=req.session.user_name+','+req.session.user_type+'at NITH';
	// notification.user_type=req.session.user_type;
	// notification.to_id=input.user_id;
	// notification.product_name=input.description;
	// notification.desc='Pinged by: '+req.session.user_name+' for your Advertisement in '+ req.session.category;
	// notification.save();

	//mail notification
            console.log("Sending mail");
	var nodemailer=require("nodemailer");
	var smtpTransport=nodemailer.createTransport('SMTP',{
		sevice: 'Gmail',
		auth: {
			user: "vendnotifier@gmail.com",
			pass: "vendnotifier123"
		}
	});
	var mailOptions = {
    from: '"VEND SERVICE" <vendnotifier@gmail.com>', // sender address 
    to: 'omsharmadot2364@gmail.com', // list of receivers 
    subject: 'Notification', // Subject line 
    text: "notification" // html body 
	};
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
     }else{
            console.log("Message sent: " + response.message);
         }
	});


	//
	  req.session.ad_id=input.ad_id;
	  req.session.category=input.category;
	 // req.session.product_id=result._id;
	//add to activity
	// var activity=new Activity(input);
	// activity.user_id=req.session.user_id;
	// activity.user_name=req.session.user_name;
	// activity.activity='Pinged the user: '+notification.user_desc+' at '+activity.createdAt;
	// activity.save();

	res.redirect('/api/view/advertisement');
}