var validator=require('validator');
var path=require('path');
var shortid=require('shortid');
var _=require('underscore');

var TemporaryUser=require('../../models/users/TemporaryUser');

var Activity=require('../../models/Activity');
var Account=require('../../models/Account');
var Setting=require('../../models/Setting');

var Teacher=require('../user/teachers_controller');
var Student=require('../user/students_controller');
var Other=require('../user/others_controller');

var ActivityNotification=require('../../models/ActivityNotification');
var Notification=require('../../models/Notification');
var Ping=require('../../models/Ping');
var Wish=require('../../models/Wish');
var Message=require('../../models/Message');
var Subscription=require('../../models/Subscription');

var RecentlyViewed=require('../../models/RecentlyViewed');
var Recommendation=require('../../models/Recommendation');
var advertisementFunctions=require('./advertisement');


var timestamp=require('./timestamp');
var helper=require('./helper');
var CONF_FILE=require('../../conf.json');

var _this=this;
var ROUTES=require('../../routes/constants');
var VEND_WEBSITE='https://vend-nith.herokuapp.com/';


function mergeArrays(array1, array2) {
	//return _.union(array1,array2);
	var array3 = [];
    var arr = array1.concat(array2);
    var len = arr.length;
    var assoc = {};

    while(len--) {
        var itm = arr[len];

        if(!assoc[itm]) { // Eliminate the indexOf call
            array3.unshift(itm);
            assoc[itm] = true;
        }
    }

    return array3;
};

function findIndexByKeyValue(obj, key, value){
    for (var i = 0; i < obj.length; i++) {
        if (obj[i][key] == value) {
            return i;
        }
    }
    return -1;
}

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i].toString().indexOf(v)>-1) return true;
    }
    return false;
};

function setHomeContent(books,electronics,others){
	var home=[];
	if(books.length>=1)
		home.push(books[0]);
	if(electronics.length>=1)
		home.push(electronics[0]);
	if(others.length>=1)
		home.push(others[0]);
	if(books.length>=2)
		home.push(books[1]);
	else if(electronics.length>=2)
		home.push(electronics[1]);
	else if(others.length>=2)
		home.push(others[1]);

	return home;
}
//sendMail any mail function will use it 
function sendMail(mail_to,mail_subject,mail_body){
	var nodemailer=require("nodemailer");
	var smtpTransport=nodemailer.createTransport('SMTP',{
			sevice: 'Gmail',
			auth: {
				user: CONF_FILE.EMAIL.USERNAME,
				pass: CONF_FILE.EMAIL.PASSWORD
			}
	});
	//mail notification
    console.log("Sending mail");	
	var mailOptions = {
    from: '"VEND "'+'<'+CONF_FILE.EMAIL.USERNAME+'>', // sender address 
    to: mail_to, // list of receivers 
    subject:mail_subject, // Subject line 
    text: mail_body // body 
	};
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
     }else{
            console.log("Message sent: " + response.message);
         }
	});
	return;
}

//for now leave it, make it work later
function sendMessage(message_to,message_body){

	var sinchSms = require('sinch-sms')({
		key: 'fb551b96-662d-441b-92df-2de5e22b1534', 
		secret: 'xMMXfBJ5D0++AUfYQRoOkA=='
	});
	sinchSms.send('+919882553532', message_body).then(function(response) {
		//All good, response contains messageId
		console.log(response);
	}).fail(function(error) {
		// Some type of error, see error object
		console.log(error);
	});
	/*var text = require('textbelt');
	var opts={
		fromAddr:CONF_FILE.email.username,
		fromName:"VEND-SMS",
		region:"intl",
		subject:"VEND NOTIFICATION MESSAGE"};
	text.debug(true);
	text.sendText('9882553532', 'A sample text message!',opts, function(err) {
	  if (err) {
	    console.log(err);
	  }
	});*/

}

//generalized add Activity function called by other activity functions
function addActivity(user_info,activity_desc){
	var user_id=user_info.user_id;
	var user_name=user_info.name;
	var activity=new Activity();
	activity.user_id=user_id;
	activity.user_name=user_name;
	activity.activity=activity_desc;
	activity.createdAt=timestamp.getTime();
	activity.save();
	return;

}
///////////////////////////////////////////
//TODO covert methods in user.js to callback system
////////////////////////////////////////////
function addNotification(user_id,notification_desc){
	//id to which notification is made not the one who causes the notification
	var notification=new Notification();
	notification.user_id=user_id;
	notification.notification=notification_desc;
	notification.createdAt=timestamp.getTime();
	notification.save();
	// sendMail also now later think about sending on every notification???
	return;

}
exports.validateRegistrationData=function(req){
	var error;
	// validate the input


		var input=req.body;
		var imagefile=req.files.profile_pic;
	//firstname
	if (validator.isNull(input.firstname)||input.firstname.trim().length===0||!validator.isAlpha(input.firstname)) {
		error="Firstname is not valid!! It can contain only alphabets.";
		return error;
	}
	//lastname
	if(validator.isNull(input.lastname)||input.lastname.trim().length===0||!validator.isAlpha(input.lastname)){
		error="Lastname is not valid!! It can contain only alphabets.";
		return error;
	}
	//email
	if(!validator.isEmail(input.email)||input.email.trim().length===0){
		error="Email is not valid.";
		return error;
	}
	//phone number
	if(!validator.isMobilePhone(input.contact,'en-IN')||input.contact.trim().length===0){
		error="Phone Number is not valid.";
		return error;
	}
	//profile picture
	if(imagefile!==undefined){
		var ext=path.extname(imagefile.path);
		//for now only two types of images
		if(ext!=='.jpg'&& ext!=='.png'&&ext!=='.JPG'&&ext!=='.PNG'){
			error="Image file is not supported!! Only .jpg and .png are supported.";
			return error;
		}
	}
	if(validator.isNull(input.username)||input.username.trim().length===0){
		error="Username can not be empty!!";
		return error;
	}
	if(validator.isNull(input.password)||input.password.trim().length===0||input.password.length<8){
		console.log("Inside password test.");

		error="Password is not valid!!";
		return error;
	}
	if(input.type==="Student"){
		//test specific to student details
		if(!validator.isAlphanumeric(input.rollno)||input.rollno.trim().length===0){
			error="Roll Number is not valid!!";
			return error;
		}
		if(validator.isNull(input.department)||input.department.trim().length===0){
			error="Department needs to be selected!!";
			return error;
		}
		if(validator.isNull(input.degree)||input.degree.trim().length===0){
			error="Degree type needs to be selected!!";
			return error;
		}
		
		switch(input.department){
				case 'CED':
					if(input.degree==='BTECH'){
						if(input.rollno.length!==5){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(2))!==1){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
					if(input.degree==='MTECH'){
						if(input.rollno.length!==6){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(3))!==1||input.rollno.charAt(2)!=='M'){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
				break;
				case 'EED':
					if(input.degree==='BTECH'){
						if(input.rollno.length!==5){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(2))!==2){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
					if(input.degree==='MTECH'){
						if(input.rollno.length!==6){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(3))!==2||input.rollno.charAt(2)!=='M'){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
				break;
				case 'MED':
					if(input.degree==='BTECH'){
						if(input.rollno.length!==5){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(2))!==3){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
					if(input.degree==='MTECH'){
						if(input.rollno.length!==6){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(3))!==3||input.rollno.charAt(2)!=='M'){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
				break;
				case 'ECE':
					if(input.degree==='BTECH'){
						if(input.rollno.length!==5){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(2))!==4){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
					if(input.degree==='MTECH'){
						if(input.rollno.length!==6){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(3))!==4||input.rollno.charAt(2)!=='M'){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
				break;
				case 'CSE':
					if(input.degree==='BTECH'){
						if(input.rollno.length!==5){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(2))!==5){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
					if(input.degree==='MTECH'){
						if(input.rollno.length!==6){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(3))!==5||input.rollno.charAt(2)!=='M'){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
				break;
				case 'ARCH':
					if(input.degree==='BTECH'){
						if(input.rollno.length!==5){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(2))!==6){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
					if(input.degree==='MTECH'){
						if(input.rollno.length!==6){
							error="Roll Number is not valid!!";
							return error;
						}
						if(parseInt(input.rollno.charAt(3))!==6||input.rollno.charAt(2)!=='M'){
							error="Roll Number does not match with you department!!";
							return error;
						}
					}
				break;
		}
		
	}
	if(input.type==="Teacher"){
		//test specific to teacher details 

		if(validator.isNull(input.teacher_department)||input.teacher_department.trim().length===0){
			error="Department needs to be selected!!";
			return error;
		}
		if(validator.isNull(input.designation)||input.designation.trim().length===0){
			error="Designation needs to be selected!!";
			return error;
		}
	}

	return error;
}

exports.storeTemporaryUser=function(input,image_path){
	var temporaryUser=new TemporaryUser(input);

	temporaryUser.user_description=JSON.stringify(input);
	temporaryUser.temp_id=shortid.generate();
	temporaryUser.token=Math.floor(10000000+Math.random()*90000000);
	temporaryUser.image_path=image_path;
	temporaryUser.createdAt=timestamp.getTime();
	temporaryUser.save();
	return temporaryUser.temp_id;

}

exports.deleteTemporaryUser=function(input){
	TemporaryUser.remove({temp_id:input},function(err){
		if(err)
			console.log(err);
	});
}

exports.sendConfirmationMail=function(input){
	var temp_id=input;
	TemporaryUser.findOne({temp_id:temp_id},function(err,temporaryUser){
		if(err)
			console.log(err);
		var data=JSON.parse(temporaryUser.user_description);		
		var token=temporaryUser.token;
		var mail_to=data.email;
		var mail_subject="VEND Account Verification";
		var mail_body="Your Account verification token is "+token+"."+
						" This token is valid only for current session in your the browser."+
						" After 15 minutes, this token will not be applicable.";
		sendMail(mail_to,mail_subject,mail_body);
		return;
	});
}

exports.saveAccount=function(user,profile_pic,username,password,type){
	var account=new Account();
	account.username=username;
	account.password=password;
	account.name=user.firstname+' '+user.lastname;
	account.user_id=user._id;
	account.profile_pic=profile_pic;
	account.type=type;
	account.createdAt=timestamp.getTime();
	account.save(function(err,account){
		_this.saveSettings(account._id,function(){});
	});
	return account;

}

exports.saveSettings=function(user_id,callback){
	var setting=new Setting();
	setting.user_id=user_id;
	setting.save();
}

exports.changeProfile=function(user_id,profile_pic,callback){
	var path = require('path');
	var APP_DIR = path.dirname(require.main.filename);
	var fs=require('fs');
	_this.getUser(user_id,function(account,user){
		// fs.unlink(APP_DIR +'/public'+account.profile_pic);
		var oldPath=profile_pic;
	 	var ext=path.extname(oldPath);
	 	var DIR_USER;
	 	switch(account.type){
	 		case 'Student':
	 			DIR_USER='students';
	 			break;
	 		case 'Teacher':
	 			DIR_USER='teachers';
	 			break;
	 		case 'Other':
	 			DIR_USER='others';
	 			break;
	 	}
	 	var savedPath="/uploads/profilepictures/"+DIR_USER+"/"+user._id+ext;
	    var newPath = APP_DIR +'/public'+ savedPath;
		helper.resizeAndMoveImage(oldPath,newPath);
		Account.findOne({_id:user_id},function(err,result){
			result.profile_pic=savedPath;
			result.save(function(){
				callback();
			});
		});
	});
}
exports.changeEmail=function(user_id,email,callback){
 	Account.findOne({_id:user_id},function(err,account){
 		switch(account.type){
 			case 'Student':
 				Student.changeEmail(account.user_id,email,function(error){
 					callback(error);
 				});
 				break;
 			case 'Teacher':
 				Teacher.changeEmail(account.user_id,email,function(error){
 					callback(error);
 				});
 				break;
 			case 'Other':
 				Other.changeEmail(account.user_id,email,function(error){
 					callback(error);
 				});
 				break;
 		}
 	});
 }

exports.changeContact=function(user_id,contact,callback){
 	Account.findOne({_id:user_id},function(err,account){
 		switch(account.type){
 			case 'Student':
 				Student.changeContact(account.user_id,contact,function(error){
 					callback(error);
 				});
 				break;
 			case 'Teacher':
 				Teacher.changeContact(account.user_id,contact,function(error){
 					callback(error);
 				});
 				break;
 			case 'Other':
 				Other.changeContact(account.user_id,contact,function(error){
 					callback(error);
 				});
 				break;
 		}
 	});
 }

exports.changeSettings=function(user_id,input,callback){
	Setting.findOne({user_id:user_id},function(err,setting){
		if(err){
			callback(1);
		}
		else{
			if(setting===null){
				setting=new Setting();
				setting.user_id=user_id;
			}
			setting.email=input.email;
			setting.phone=input.phone;
			setting.save(function(){
				 callback(0);
			});
		}
	});
} 

exports.getSettings=function(user_id,callback){
	Setting.findOne({user_id:user_id},function(err,setting){
		if(setting===null){
			callback({email:'No',phone:'No'});
		}
		else
		 callback(setting);
	});
} 

exports.changePassword=function(user_id,password,callback){
	Account.findOne({_id:user_id},function(err,account){
		if(err||account===null){
			callback(1);
		}
		else{
			account.password=password;
			account.save(function(){
				callback(0);
			});
		}
	});
}

exports.setSession=function(req,account){
	req.session.user_id=account._id;
	req.session.user_type=account.type;
	req.session.profile_pic=account.profile_pic;
	req.session.username=account.username;
	req.session.name=account.name;
	req.session.save(function(err) {
		console.log(err);
	});
	return;
}

exports.sendPasswordMail=function(email,firstname,username,password){
	var mail_to=email;
	var mail_subject="VEND Password Request";
	var mail_body="Hello "+firstname+", this email contains your VEND account password. "+
					"Please change your password for more safety from settings panel. "+
					"Your account credentials are:\n"+
					"Username: "+username+"\n"+
					"Password: "+password+"\n";
	sendMail(mail_to,mail_subject,mail_body);
	return;

}
exports.sendConfirmationMessage=function(input){
	var temp_id=input;
	TemporaryUser.findOne({temp_id:temp_id},function(err,temporaryUser){
		if(err)
			console.log(err);
		var data=JSON.parse(temporaryUser.user_description);		
		var token=temporaryUser.token;
		var message_to='+91'+data.contact;
		var message_body="Your Account verification token is "+token+"."+
		" This token is valid only for this on the browser."+
		" After 15 minutes, this token will not be applicable.";
		 // sendMessage(message_to,message_body);
		return;
	});


}

exports.sendToLogin=function(res){
	
			var response={};
			var message="Please log in to continue.";
			response.message=message;
			res.render('login',{response:response});
}

exports.sendToError=function(req,res,error){
			var response={};
			response.user_info=req.session;
			response.error=error;
			res.render('error',{response:response});
}



exports.searchUser=function(query,callback){
	var query=helper.changeToRegexArray(query);
	Account.find({$or:[{name: { $in: query}},{type:{ $in: query}}]},function(err,users){
		callback(users);
	});
}

exports.getAccount=function(id,callback){
	Account.findOne({_id:id},function(err,account){
		callback(account);
	});
}

exports.getUser=function(user_id,callback){
	Account.findOne({_id:user_id},function(err,account){
		if(err||account===null)
			callback(null,err);
		else{
			switch(account.type){
				case 'Student':
					Student.find(account.user_id,function(user){
						callback(account,user);
					});
					break;
				case 'Teacher':
					Teacher.find(account.user_id,function(user){
						callback(account,user);
					});
					break;
				case 'Other':
					Other.find(account.user_id,function(user){
						callback(account,user);
					});
					break;
			}
		}
	});
}

exports.sendToAd=function(res,ad_id){
	res.redirect(ROUTES.ADVERTISEMENT+'?id='+ad_id);
}


exports.getActivities=function(user_id,limit,callback){
	if(limit===null){
		Activity.find({user_id:user_id}, null, { sort: {'_id': -1}}).exec(function(err, activities) {
			callback(activities);
		});
	}
	else{
		Activity.find({user_id:user_id}, null, { sort: {'_id': -1},limit:limit}).exec(function(err, activities) {
			callback(activities);
		});
	}
}

////related to adding activity
exports.addPublishActivity=function(user_info,advertisement,callback){
	var ad_category_link=advertisementFunctions.getAdCategoryLink(advertisement);

	var activity_entity_name=advertisement.name;
	var activity_entity_link=ROUTES.ADVERTISEMENT+'?id='+advertisement._id;
	var activity="Published an advertisement: "+
	'<a href="'+activity_entity_link+'" class="text-info">'+
			activity_entity_name+"</a> under "+'<a href="'+ad_category_link+
			'" class="text-info">'+advertisement.category+'</a> Category.';
	addActivity(user_info,activity);
	//add callback functionailty
	callback();

}

exports.addRatingActivity=function(user_info,input,callback){
	
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		var activity_entity_name=advertisement.name;
		var activity_entity_link=ROUTES.ADVERTISEMENT+'?id='+input.ad_id;
		var activity="Rated the advertisement "+
		'<a href="'+activity_entity_link+'" class="text-info">'+activity_entity_name+"</a> "+input.rating+" stars.";
		addActivity(user_info,activity);
		callback();
	});

}

exports.addViewedActivity=function(user_info,advertisement,callback){
	var ad_category_link=advertisementFunctions.getAdCategoryLink(advertisement);

	var activity_entity_name=advertisement.name;
	var activity_entity_link=ROUTES.ADVERTISEMENT+'?id='+advertisement._id;
	var activity='Viewed the advertisement '+
			'<a href="'+activity_entity_link+'" class="text-info">'+
			activity_entity_name+"</a> under "+'<a href="'+ad_category_link+
			'" class="text-info">'+advertisement.category+'</a> Category.';
	addActivity(user_info,activity);
	callback();
}


exports.addBiddingActivity=function(user_info,input,callback){

	//get the ad details
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		var ad_category_link=advertisementFunctions.getAdCategoryLink(advertisement);
		var activity_entity_name=advertisement.name;
		var activity_entity_link=ROUTES.ADVERTISEMENT+'?id='+advertisement._id;
		var activity="Bidded Rs. "+input.amount+" on the advertisement "+
			'<a href="'+activity_entity_link+'" class="text-info">'+
			activity_entity_name+"</a> under "+'<a href="'+ad_category_link+
			'" class="text-info">'+advertisement.category+'</a> Category.';
		addActivity(user_info,activity);
		callback();
	});

}

exports.addCommentActivity=function(user_info,input,callback){

	//get the ad details
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		var ad_category_link=advertisementFunctions.getAdCategoryLink(advertisement);
		var activity_entity_name=advertisement.name;
		var activity_entity_link=ROUTES.ADVERTISEMENT+'?id='+advertisement._id;
		var activity="Commented on the advertisement "+
			'<a href="'+activity_entity_link+'" class="text-info">'+
			activity_entity_name+"</a> under "+'<a href="'+ad_category_link+
			'" class="text-info">'+advertisement.category+'</a> Category.';
		addActivity(user_info,activity);
		callback();
	});

}

exports.addPingActivity=function(user_info,input,callback){

	//get the ad details
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		var ad_category_link=advertisementFunctions.getAdCategoryLink(advertisement);
		var activity_entity_name=advertisement.name;
		var activity_entity_link=ROUTES.ADVERTISEMENT+'?id='+advertisement._id;
		var ad_publisher_name=advertisement.user_name;
		var ad_publisher_link=ROUTES.USER+'?id='+advertisement.user_id;
		
		var activity="Pinged "+
			'<a href="'+ad_publisher_link+'" class="text-info">'+
			ad_publisher_name+"</a> for his advertisement "+
			'<a href="'+activity_entity_link+'" class="text-info">'+
			activity_entity_name+"</a> under "+'<a href="'+ad_category_link+
			'" class="text-info">'+advertisement.category+'</a> Category.';
		addActivity(user_info,activity);
		callback();
	});

}

exports.addConfirmedRequestActivity=function(user_info,ping,callback){
	var user_link=ROUTES.USER+'?id='+ping.user_id;
	var ad_link=ROUTES.CLOSED_ADVERTISEMENT+'?id='+ping.ad_id;
	var activity="Confirmed "+ping.ad_type+" request by "+'<a href="'+user_link+'" class="text-info">'+ping.user_name+"</a> for advertisement "+
	'<a href="'+ad_link+'" class="text-info">'+
	ping.ad_name+"</a>.";
	addActivity(user_info,activity);
	callback();
}

exports.addWishActivity=function(user_info,wish,callback){
	var wish_link=ROUTES.WISH+'?id='+wish._id;
	var activity='Posted a wish for <span class="text-success"><strong>'+wish.title+
	'</strong></span>. Check recommendations <a href="'+wish_link+'">here</a>.';
	addActivity(user_info,activity);
	callback();
}

exports.addViewedWishActivity=function(user_info,wish,callback){
	var wish_link=ROUTES.WISH+'?id='+wish._id;
	var activity='Viewed a wish entitled: <span class="text-success"><strong>'+wish.title+
	'</strong></span>. Check recommendations <a href="'+wish_link+'">here</a>.';
	addActivity(user_info,activity);
	callback();	
}

exports.addViewedUserActivity=function(user_info,view_user_id,callback){
	_this.getAccount(view_user_id,function(account){
		var user_link=ROUTES.USER+'?id='+account._id;
		var activity='Viewed profile of <a href="'+
		user_link+'" class="text-info">'+account.name+'</a>.';
		addActivity(user_info,activity);
		callback();
	});
}

exports.addSubscriptionActivity=function(user_info,input,callback){
	var user_link=ROUTES.USER+'?id='+input.user_id;
	var activity='Subscribed to <a href="'+
	user_link+'" class="text-info">'+input.user_name+'</a>.';
	addActivity(user_info,activity);
	callback();
}



////Related to notification
exports.getNotificationCount=function(user_id,callback){
	Notification.find({user_id:user_id,read:0},function(err,notifications){
		callback(notifications.length);
	});
}	
exports.sendNotification=function(user_id,mail_body,callback){
	Setting.findOne({user_id:user_id},function(err,setting){
		if(err||setting===null){
			//do nothing
		}
		else{
			if(setting.email==='Yes'){

				_this.getUser(user_id,function(account,user){
					var mail_to=user.email;
					var mail_subject='Vend Notification';
					sendMail(mail_to,mail_subject,mail_body);
					callback();
				});
			}
		}
	});
}

exports.addRatingNotification=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		//id of the publisher
		var user_id=advertisement.user_id;
		
		var notification_ad_name=advertisement.name;
		var notification_ad_link=ROUTES.ADVERTISEMENT+'?id='+input.ad_id;
		var notification_user_name=user_info.name;
		var notification_user_link=ROUTES.USER+'?id='+user_info.user_id;
		var notification_desc='<a href="'+notification_user_link+'" class="text-info">'+
						notification_user_name+'</a> rated '+input.rating+' stars on your advertisement '+
						'<a href="'+notification_ad_link+'" class="text-info">'+notification_ad_name+"</a>.";

		addNotification(user_id,notification_desc);

		var mail_body=notification_user_name+' rated '+input.rating+' stars on your advertisement '+
			notification_ad_name+'. \n Please check Vend for more Info.';
		_this.sendNotification(user_id,mail_body,function(){});
		callback();
	});

}


exports.addBiddingNotification=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		//id of the publisher
		var user_id=advertisement.user_id;
		
		var notification_ad_name=advertisement.name;
		var notification_ad_link=ROUTES.ADVERTISEMENT+'?id='+input.ad_id;
		var notification_user_name=user_info.name;
		var notification_user_link=ROUTES.USER+'?id='+user_info.user_id;

		var notification_desc='<a href="'+notification_user_link+'" class="text-info">'+
			notification_user_name+'</a> bidded Rs. '+input.amount+' on your advertisement '+
			'<a href="'+notification_ad_link+'" class="text-info">'+notification_ad_name+"</a>.";

		addNotification(user_id,notification_desc);

		var mail_body=notification_user_name+' bidded Rs. '+input.amount+' on your advertisement '+
			notification_ad_name+'. \n Please check Vend for more Info.';
		_this.sendNotification(user_id,mail_body,function(){});
		callback();
	});
}

exports.addCommentNotification=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		//id of the publisher
		var user_id=advertisement.user_id;
		
		var notification_ad_name=advertisement.name;
		var notification_ad_link=ROUTES.ADVERTISEMENT+'?id='+input.ad_id;
		var notification_user_name=user_info.name;
		var notification_user_link=ROUTES.USER+'?id='+user_info.user_id;

		var notification_desc='<a href="'+notification_user_link+'" class="text-info">'+
			notification_user_name+'</a> commented on your advertisement '+
			'<a href="'+notification_ad_link+'" class="text-info">'+notification_ad_name+"</a>.";

		addNotification(user_id,notification_desc);

		var mail_body=notification_user_name+' commented on your advertisement '+
			notification_ad_name+'. \n Please check Vend for more Info.';
		_this.sendNotification(user_id,mail_body,function(){});
		callback();
	});
}

exports.addPingNotification=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		//id of the publisher
		var user_id=advertisement.user_id;
		
		var notification_ad_name=advertisement.name;
		var notification_ad_link=ROUTES.ADVERTISEMENT+'?id='+input.ad_id;
		var notification_user_name=user_info.name;
		var notification_user_link=ROUTES.USER+'?id='+user_info.user_id;

		var notification_desc='<a href="'+notification_user_link+'" class="text-info">'+
			notification_user_name+'</a> pinged you for your advertisement '+
			'<a href="'+notification_ad_link+'" class="text-info">'+notification_ad_name+
			"</a>.<br>Check <a href='/api/view/user/advertisements' class='text-success'>Your Ads</a> for more options.";

		addNotification(user_id,notification_desc);

		var mail_body=notification_user_name+' pinged you for your advertisement '+
			notification_ad_name+'. \n Please check Vend for more Info.';
		_this.sendNotification(user_id,mail_body,function(){});
		callback();
	});
}

exports.addConfirmationNotification=function(user_info,ping,callback){
	var user_link=ROUTES.USER+'?id='+user_info.user_id;
	var user_name=user_info.name;
	var ad_link=ROUTES.CLOSED_ADVERTISEMENT+'?id='+ping.ad_id;
	var ad_name=ping.ad_name;
	var notification_desc='<a href="'+user_link+'" class="text-info">'+user_name+
		'</a> confirmed your request to '+ping.ad_kind+
		' the product. For details of advertisement visit the <a href="'+ad_link+'" class="text-info"> Ad page</a>.'+
		'<br>Get publisher details <a href="'+user_link+'" class="text-info">here</a>.';
	addNotification(ping.user_id,notification_desc);

		var mail_body=user_name+' confirmed your request to '+ping.ad_kind+
			' the product entitled '+ad_name+'. \n Please check Vend for more Info.';
		_this.sendNotification(ping.user_id,mail_body,function(){});
	callback();
}

exports.addRejectionNotification=function(user_info,ping,callback){
	var user_link=ROUTES.USER+'?id='+user_info.user_id;
	var user_name=user_info.name;
	var ad_link=ROUTES.CLOSED_ADVERTISEMENT+'?id='+ping.ad_id;
	var ad_name=ping.ad_name;
	Ping.find({ad_id:ping.ad_id,user_id:{$nin:[ping.user_id]}},function(err,pings){
		for(var i=0;i<pings.length;i++){
			var notification_desc='<a href="'+user_link+'" class="text-info">'+user_name+
			'</a> rejected your request to '+ping.ad_kind+
			' the product. For further details, visit the <a href="'+ad_link+'" class="text-info"> Ad page</a>.';
			addNotification(pings[i].user_id,notification_desc);

		var mail_body=user_name+' rejected your request to '+ping.ad_kind+
			' the product entitled: '+ad_name+'. \n Please check Vend for more Info.';
		_this.sendNotification(pings[i].user_id,mail_body,function(){});
		}
		callback();
	});	
}


exports.addWishNotification=function(publisher_user_id,category,product,ad_id){
	switch(category){
		case 'Book':
			var tags=product.title.split(" ");
			tags=mergeArrays(tags,product.author.split(" "));
			tags.push(product.semester);
			_this.matchWishAndSendNotification(publisher_user_id,category,tags,ad_id);
			break;
		case 'Electronics':
		case 'Other':
			var tags=product.name.split(" ");
			tags=mergeArrays(tags,product.sub_category.split(" "));
			tags=mergeArrays(tags,product.brand.split(" "));
			_this.matchWishAndSendNotification(publisher_user_id,category,tags,ad_id);
			break;
	}
}

exports.matchWishAndSendNotification=function(publisher_user_id,category,tags,ad_id){
	var ad_link=ROUTES.ADVERTISEMENT+'?id='+ad_id;
	tags=helper.changeToRegexArray(tags);
	Wish.find({category:category,user_id:{$nin:[publisher_user_id]},$or:[{title:{$in:tags}},{description:{$in:tags}}]},function(err,wishes){
		if(err)
			console.log(err);
		for(var i=0;i<wishes.length;i++){
			var notification_desc='New advertisement matching your wish for '+
			'<a href="'+ROUTES.WISH+'?id='+wishes[i]._id+'">'+wishes[i].title+'</a> has been posted. Check it '+
			'<a href="'+ad_link+'">here</a>.';
			addNotification(wishes[i].user_id,notification_desc);

			var mail_body='New advertisement matching your wish for '+wishes[i].title+
				' has been posted. \n Please check Vend for more Info.';
			_this.sendNotification(wishes[i].user_id,mail_body,function(){});
		}
	});
}


exports.addSubscriptionNotification=function(user_info,input,callback){
	var user_link=ROUTES.USER+'?id='+user_info.user_id;
	var user_name=user_info.name;
	var notification_desc='<a href="'+user_link+'" class="text-info">'+user_name+
			'</a> subscribed you.';
	addNotification(input.user_id,notification_desc);
	var mail_body=user_name+' subscribed you on Vend.'+
		' \n Please check Vend for more Info.';
	_this.sendNotification(input.user_id,mail_body,function(){});
	callback();
}

exports.addSubscriberNotification=function(advertisement){
	var subscribed_user_id=advertisement.user_id;
	var notification_desc='<a href="'+ROUTES.USER+'?id='+advertisement.user_id+'">'+
		advertisement.user_name+'</a> posted a new advertisement :'+
		'<a href="'+ROUTES.ADVERTISEMENT+'?id='+advertisement._id+'">'+
		advertisement.name+'</a>.<br> Change settings <a href="/subsriptions">here</a>.';
	Subscription.find({subscribed_user_id:subscribed_user_id},function(err,subscriptions){

		for(var i=0;i<subscriptions.length;i++){
			addNotification(subscriptions[i].subscriber_user_id,notification_desc);
			var mail_body=advertisement.user_name+' posted a new advertisement '+
				advertisement.name+'. \n Please check Vend for more Info.';
			_this.sendNotification(subscriptions[i].subscriber_user_id,mail_body,function(){});
		}
	});
	return;
}
exports.addActivityNotification=function(user_id,notification,callback){
	var activityNotification=new ActivityNotification();
	activityNotification.user_id=user_id;
	activityNotification.notification=notification;
	activityNotification.save();
	callback();
}
//it also deletes the notification
exports.getAndDeleteActivityNotification=function(user_id,callback){
	var notification;
	ActivityNotification.findOne({user_id:user_id},function(err,activityNotification){
		if(activityNotification!==null){
		notification=activityNotification.notification;
		activityNotification.remove();
		}
		callback(notification);
	});
}


exports.addPing=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		var ping=new Ping(user_info);
		ping.ping_user_id=advertisement.user_id;
		ping.ping_user_name=advertisement.user_name;
		ping.user_name=user_info.name;
		ping.ad_id=input.ad_id;
		ping.ad_name=advertisement.name;
		ping.ad_kind=advertisement.kind;
		ping.ad_category=advertisement.category;
		ping.createdAt=timestamp.getTime();
		ping.save();
		callback();
	});
}

exports.addToRecommendation=function(user_id,search_tag,ad_id,callback){
	//for each id there will be two types of tags:
	// 1. based on what ads he views
	// 2. based on what he searches 
	Recommendation.findOne({user_id:user_id},function(err,recommendation){
		if(recommendation===null){
			recommendation=new Recommendation();
			recommendation.user_id=user_id;
		}
		var view_tags=recommendation.view_tags;
		var search_tags=recommendation.search_tags;
		//1.what he views
		if(search_tag===null){//i.e based on ad_id, get similar ads and add to recommendation
			advertisementFunctions.getAdvertisement(ad_id,function(advertisement){
				//based on type of advertisement
				//if book add semester to tags
				var category=advertisement.category;
				advertisementFunctions.getProduct(category,advertisement.product_id,function(product){
					switch(category){
						case 'Book':
							if(!(view_tags.indexOf(product.semester)>-1)){
								view_tags.unshift(product.semester);
								recommendation.view_tags=view_tags;
							}
							recommendation.save();
							break;
						case 'Electronics':
						case 'Other':
							if(!(view_tags.indexOf(product.sub_category)>-1)){
								view_tags.unshift(product.sub_category);
								recommendation.view_tags=view_tags;
							}
							recommendation.save();
							break;
					}
				});
			});
		}
		//2. what he searches
		else{//based on search tag
			/////////////////////////////////////
			for(var i=0;i<search_tag.length;i++){
				//will cahnge if search tags is array
				if(!search_tags.contains(search_tag[i])){
					search_tags.unshift(search_tag[i]);
					recommendation.search_tags=search_tags;
				}
			}
			recommendation.save();
		}
		callback();
	});
}

//recommended logic here-change it
exports.getRecommended=function(user_info,limit,sort,callback){
	if(limit===null){
		limit=100;
	}
	//for home it should be overall recommendation no categories
	//
		var books=[];
		var electronics=[];
		var others=[];
		var complete={};
		var home=[];
		var view_tags=[];
		var search_tags=[];
		var user_id=user_info.user_id;
		var user_type=user_info.user_type;
		Recommendation.findOne({user_id:user_id},function(err,recommendation){
			if(recommendation!==null){
				view_tags=recommendation.view_tags;
				search_tags=recommendation.search_tags;
			}
			//also pass user id so that user does not see his own ads
			// change it
			//first in books
			advertisementFunctions.getRecommendedBooks(user_id,view_tags,function(book_advertisements){
				books=mergeArrays(books,book_advertisements);
				advertisementFunctions.getRecommendedElectronics(user_id,view_tags,function(electronics_advertisements){
					electronics=mergeArrays(electronics,electronics_advertisements);
					advertisementFunctions.getRecommendedOthers(user_id,view_tags,function(other_advertisements){
						others=mergeArrays(others,other_advertisements);
						advertisementFunctions.searchRecommendedBooks(user_id,search_tags,function(searched_books){
							books=mergeArrays(books,searched_books);
							advertisementFunctions.searchRecommendedElectronics(user_id,search_tags,function(searched_electronics){
								electronics=mergeArrays(electronics,searched_electronics);
								advertisementFunctions.searchRecommendedOthers(user_id,search_tags,function(searched_others){
									others=mergeArrays(others,searched_others);
									advertisementFunctions.getRecommended(user_id,user_type,function(advertisements){
										if(books.length===0&&electronics.length===0&&others.length===0){
											books=mergeArrays(books,advertisements.books);
											electronics=mergeArrays(electronics,advertisements.electronics);
											others=mergeArrays(others,advertisements.others);
										}
										//for home page pick from every category result
										advertisementFunctions.sortAdvertisements(sort,books,electronics,others,function(sorted_books,sorted_electronics,sorted_others){
											books=sorted_books;
											electronics=sorted_electronics;
											others=sorted_others;
											home=setHomeContent(books,electronics,others);
											if(limit===4)
												callback(home);
											else{
												complete.books=books;
												complete.electronics=electronics;
												complete.others=others;
												callback(complete);
											}
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


exports.getMyAdvertisementsAndPings=function(user_id,callback){
	advertisementFunctions.getAdvertisementByUser(user_id,function(advertisements){
		advertisementFunctions.addProductDetailsToAdvertisements(advertisements,function(product_advertisements){
			advertisementFunctions.addPingsToAdvertisements(product_advertisements,function(ping_product_advertisements){
				advertisementFunctions.addBidsToAdvertisements(ping_product_advertisements,function(bids_pings_product_advertisements){
					callback(bids_pings_product_advertisements);
				});
			});
		});
	});

}


exports.saveWish=function(user_info,input,callback){
	var wish=new Wish(input);
	wish.user_id=user_info.user_id;
	wish.user_name=user_info.name;
	wish.user_type=user_info.user_type;
	wish.createdAt=timestamp.getTime();
	wish.save(function(){
		callback(wish);
	});
}

exports.getWish=function(wish_id,callback){
	Wish.findOne({_id:wish_id},function(err,wish){
		if(err)
			callback(err);
		callback(wish);
	});
}

exports.getWishes=function(callback){
	Wish.find({},null,{sort:{_id:-1}},function(err,wishes){
		callback(wishes);
	});
}

exports.getUserWishes=function(user_id,callback){
	Wish.find({user_id:user_id},null,{sort:{_id:-1}},function(err,wishes){
		callback(wishes);
	});
}

exports.deleteWish=function(user_info,wish_id,req,res,callback){
	var user_id=user_info.user_id;
	Wish.findOne({user_id:user_id,_id:wish_id},function(err,wish){
		if(wish===null){
			var error='Invalid Request! Wish not found.';			
			_this.sendToError(req,res,error);
		}
		else{
			Wish.remove({_id:wish_id},function(){
				callback();
			});
		}
	});
}

exports.addMessage=function(user_info,input,callback){
	var from_user_id=user_info.user_id;
	var from_user_name=user_info.name;
	var message_body=input.message;
	var to_user_id=input.user_id;
	var to_user_name=input.user_name;

	var message=new Message();
	message.from_user_id=from_user_id;
	message.from_user_name=from_user_name;
	message.message=message_body;
	message.to_user_id=to_user_id;
	message.to_user_name=to_user_name;
	message.createdAt=timestamp.getTime();
	message.save();
	var mail_body=message.from_user_name+' has sent you a message. \nPlease check Vend for more Info.';
	_this.sendNotification(message.to_user_id,mail_body,function(){});
	callback();

}

exports.getMessages=function(user_id,callback){
	
	Message.find({$or:[{to_user_id:user_id},{from_user_id:user_id}]},null,{sort:{_id:-1}},function(err,messages){
		var result=helper.getMessageUniqueUser(messages,user_id);
		for(var i=0;i<result.length;i++){
			result[i].messages=[];
		}
		for(var i=0;i<messages.length;i++){
			var message=messages[i];
			if(message.from_user_id===user_id){
				var index=findIndexByKeyValue(result,'user_id',message.to_user_id);
				result[index].messages.push(message);
			}
			else{
				var index=findIndexByKeyValue(result,'user_id',message.from_user_id);
				result[index].messages.push(message);
			}
		}
		Message.update({$and:[{read:0},{to_user_id:user_id}]}, { read: 1 },{multi: true}, function(err){
  			callback(result);
  		});
		
	});
}

exports.getUnreadMessageCount=function(user_id,callback){
	Message.find({$and:[{read:0},{$or:[{to_user_id:user_id}]} ]}, function(err,messages){
  			callback(messages.length);
  		});
}

exports.getConfirmations=function(user_id,callback){
	advertisementFunctions.getConfirmedAdvertisementsForUser(user_id,function(advertisements){
		callback(advertisements);
	});
}

exports.getPendingConfirmations=function(user_id,callback){
	Ping.find({user_id:user_id},function(err,pings){
		callback(pings);
	});
}

exports.addSubscription=function(user_info,input,callback){
	var subscription=new Subscription();
	subscription.subscriber_user_id=user_info.user_id;
	subscription.subscriber_user_name=user_info.name;
	subscription.subscribed_user_id=input.user_id;
	subscription.subscribed_user_name=input.user_name;
	subscription.createdAt=timestamp.getTime();
	subscription.save(function(){
		callback();
	});
}

exports.deleteSubscription=function(user_info,input,req,res,callback){
	Subscription.findOne({subscriber_user_id:user_info.user_id,subscribed_user_id:input.user_id},function(err,subscription){
		if(err||subscription===null){
			var error="Invalid Request Recieved";
			_this.sendToError(req,res,error)
		}
		else{
			Subscription.remove({subscriber_user_id:user_info.user_id,subscribed_user_id:input.user_id},function(){
				callback();
			});
		}
	});
}

exports.getSubscriptionStatus=function(user_info,user_id,callback){
	Subscription.findOne({subscriber_user_id:user_info.user_id,subscribed_user_id:user_id},function(err,subscription){
		if(subscription===null)
			callback('no');
		else
			callback('yes');
	});
}

exports.getSubscriptions=function(user_id,callback){
	Subscription.find({subscriber_user_id:user_id},function(err,subscriptions){
		callback(subscriptions);
	});
}

exports.getSubscriberCount=function(user_id,callback){
	Subscription.find({subscribed_user_id:user_id},function(err,subsriptions){
		callback(subsriptions.length);
	});
}


exports.deleteActivities=function(user_id,callback){
	Activity.remove({user_id:user_id},function(){
		callback();
	});
}
exports.deleteNotifications=function(user_id,callback){
	Notification.remove({user_id:user_id},function(){
		callback();
	});
}