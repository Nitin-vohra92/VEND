var validator=require('validator');
var path=require('path');
var shortid=require('shortid');
var _=require('underscore');

var TemporaryUser=require('../../models/users/TemporaryUser');

var Activity=require('../../models/Activity');
var Account=require('../../models/Account');

var ActivityNotification=require('../../models/ActivityNotification');
var Notification=require('../../models/Notification');
var Ping=require('../../models/Ping');
var Wish=require('../../models/Wish');

var RecentlyViewed=require('../../models/RecentlyViewed');
var Recommendation=require('../../models/Recommendation');
var advertisementFunctions=require('./advertisement');


var timestamp=require('./timestamp');
var helper=require('./helper');
var CONF_FILE=require('../../conf.json');




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
    from: '"VEND SERVICE"'+'<'+CONF_FILE.EMAIL.USERNAME+'>', // sender address 
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
	if (validator.isNull(input.firstname)||!validator.isAlpha(input.firstname)) {
		error="Firstname is not valid!! It can contain only alphabets.";
		return error;
	}
	//lastname
	if(validator.isNull(input.lastname)||!validator.isAlpha(input.lastname)){
		error="Lastname is not valid!! It can contain only alphabets.";
		return error;
	}
	//email
	if(!validator.isEmail(input.email)){
		error="Email is not valid.";
		return error;
	}
	//phone number
	if(!validator.isMobilePhone(input.contact,'en-IN')){
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
	if(validator.isNull(input.username)){
		error="Username can not be empty!!";
		return error;
	}
	if(validator.isNull(input.username)||input.password.length<8){
		console.log("Inside password test.");

		error="Password is not valid!!";
		return error;
	}
	if(input.type==="Student"){
		//test specific to student details
		if(!validator.isAlphanumeric(input.rollno)){
			error="Roll Number is not valid!!";
			return error;
		}
		if(validator.isNull(input.department)){
			error="Department needs to be selected!!";
			return error;
		}
		if(validator.isNull(input.degree)){
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

		if(validator.isNull(input.teacher_department)){
			error="Department needs to be selected!!";
			return error;
		}
		if(validator.isNull(input.designation)){
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

exports.saveAccount=function(user,username,password,type){
	var account=new Account();
	account.username=username;
	account.password=password;
	account.name=user.firstname+' '+user.lastname;
	account.user_id=user._id;
	account.profile_pic=user.profile_pic;
	account.type=type;
	account.createdAt=timestamp.getTime();
	account.save();
	return account;

}


exports.setSession=function(req,account){
	req.session.user_id=account.user_id;
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
	// sendMail(mail_to,mail_subject,mail_body);
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
	Account.findOne({user_id:id},function(err,account){
		callback(account);
	});
}

exports.sendToAd=function(res,ad_id){
	res.redirect('/api/view/advertisement?id='+ad_id);
}




////related to adding activity
exports.addPublishActivity=function(user_info,advertisement,callback){
	var ad_category_link=advertisementFunctions.getAdCategoryLink(advertisement);

	var activity_entity_name=advertisement.name;
	var activity_entity_link='/api/view/advertisement?id='+advertisement._id;
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
		var activity_entity_link='/api/view/advertisement?id='+input.ad_id;
		var activity="Rated the advertisement "+
		'<a href="'+activity_entity_link+'" class="text-info">'+activity_entity_name+"</a> "+input.rating+" stars.";
		addActivity(user_info,activity);
		callback();
	});

}

exports.addViewedActivity=function(user_info,advertisement,callback){
	var ad_category_link=advertisementFunctions.getAdCategoryLink(advertisement);

	var activity_entity_name=advertisement.name;
	var activity_entity_link='/api/view/advertisement?id='+advertisement._id;
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
		var activity_entity_link='/api/view/advertisement?id='+advertisement._id;
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
		var activity_entity_link='/api/view/advertisement?id='+advertisement._id;
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
		var activity_entity_link='/api/view/advertisement?id='+advertisement._id;
		var ad_publisher_name=advertisement.user_name;
		var ad_publisher_link='/api/view/user?id='+advertisement.user_id;
		
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
	var activity="Confirmed "+ping.ad_type+" request by "+'<a href="/api/view/user?id='+
	ping.user_id+'" class="text-info">'+ping.user_name+"</a> for advertisement "+
	'<a href="/api/view/advertisement/closed?id='+ping.ad_id+'" class="text-info">'+
	ping.ad_name+"</a>.";
	addActivity(user_info,activity);
	callback();
}

exports.addWishActivity=function(user_info,wish,callback){
	var activity='Posted a wish for '+wish.title+
	'. Check recommendations <a href="/api/view/wish?id='+wish._id+'">here</a>.';
	addActivity(user_info,activity);
	callback();
}

exports.addViewedWishActivity=function(user_info,wish,callback){
	var activity='Viewed a wish '+wish.title+
	'. Check recommendations <a href="/api/view/wish?id='+wish._id+'">here</a>.';
	addActivity(user_info,activity);
	callback();	
}



////Related to notification
exports.getNotificationCount=function(user_id,callback){
	Notification.find({user_id:user_id,read:0},function(err,notifications){
		callback(notifications.length);
	});
}	


exports.addRatingNotification=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		//id of the publisher
		var user_id=advertisement.user_id;
		
		var notification_ad_name=advertisement.name;
		var notification_ad_link='/api/view/advertisement?id='+input.ad_id;
		var notification_user_name=user_info.name;
		var notification_user_link='/api/view/user?id='+user_info.user_id;
		var notification_desc='<a href="'+notification_user_link+'" class="text-info">'+
						notification_user_name+'</a> rated '+input.rating+' stars on your advertisement '+
						'<a href="'+notification_ad_link+'" class="text-info">'+notification_ad_name+"</a>.";

		addNotification(user_id,notification_desc);
		callback();
	});

}

exports.addBiddingNotification=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		//id of the publisher
		var user_id=advertisement.user_id;
		
		var notification_ad_name=advertisement.name;
		var notification_ad_link='/api/view/advertisement?id='+input.ad_id;
		var notification_user_name=user_info.name;
		var notification_user_link='/api/view/user?id='+user_info.user_id;

		var notification_desc='<a href="'+notification_user_link+'" class="text-info">'+
			notification_user_name+'</a> bidded Rs. '+input.amount+' on your advertisement '+
			'<a href="'+notification_ad_link+'" class="text-info">'+notification_ad_name+"</a>.";

		addNotification(user_id,notification_desc);
		callback();
	});
}

exports.addCommentNotification=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		//id of the publisher
		var user_id=advertisement.user_id;
		
		var notification_ad_name=advertisement.name;
		var notification_ad_link='/api/view/advertisement?id='+input.ad_id;
		var notification_user_name=user_info.name;
		var notification_user_link='/api/view/user?id='+user_info.user_id;

		var notification_desc='<a href="'+notification_user_link+'" class="text-info">'+
			notification_user_name+'</a> commented on your advertisement '+
			'<a href="'+notification_ad_link+'" class="text-info">'+notification_ad_name+"</a>.";

		addNotification(user_id,notification_desc);
		callback();
	});
}

exports.addPingNotification=function(user_info,input,callback){
	advertisementFunctions.getAdvertisement(input.ad_id,function(advertisement){
		//id of the publisher
		var user_id=advertisement.user_id;
		
		var notification_ad_name=advertisement.name;
		var notification_ad_link='/api/view/advertisement?id='+input.ad_id;
		var notification_user_name=user_info.name;
		var notification_user_link='/api/view/user?id='+user_info.user_id;

		var notification_desc='<a href="'+notification_user_link+'" class="text-info">'+
			notification_user_name+'</a> pinged you for your advertisement '+
			'<a href="'+notification_ad_link+'" class="text-info">'+notification_ad_name+
			"</a>.<br>Check <a href='/api/view/user/advertisements' class='text-success'>Your Ads</a> for more options.";

		addNotification(user_id,notification_desc);
		callback();
	});
}

exports.addConfirmationNotification=function(user_info,ping,callback){
	var user_link='/api/view/user?id='+user_info.user_id;
	var user_name=user_info.name;
	var ad_link='/api/view/advertisement/closed?id='+ping.ad_id;
	var ad_name=ping.ad_name;
	var notification_desc='<a href="'+user_link+'" class="text-info">'+user_name+
		'</a> confirmed your request to '+ping.ad_kind+
		' the product. For details of advertisement visit the <a href="'+ad_link+'" class="text-info"> Ad page</a>.'+
		'<br>Contact publisher <a href="'+user_link+'" class="text-info">here.</a>';
	addNotification(ping.user_id,notification_desc);
	callback();
}

exports.addRejectionNotification=function(user_info,ping,callback){
	var user_link='/api/view/user?id='+user_info.user_id;
	var user_name=user_info.name;
	var ad_link='/api/view/advertisement/closed?id='+ping.ad_id;
	var ad_name=ping.ad_name;
	Ping.find({ad_id:ping.ad_id,user_id:{$nin:[ping.user_id]}},function(err,pings){
		for(var i=0;i<pings.length;i++){
			var notification_desc='<a href="'+user_link+'" class="text-info">'+user_name+
			'</a> rejected your request to '+ping.ad_kind+
			' the product. For further details, visit the <a href="'+ad_link+'" class="text-info"> Ad page</a>.';
			addNotification(pings[i].user_id,notification_desc);
		}
		callback();
	});	
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
			//first in books
			advertisementFunctions.getRecommendedBooks(view_tags,function(book_advertisements){
				books=mergeArrays(books,book_advertisements);
				advertisementFunctions.getRecommendedElectronics(view_tags,function(electronics_advertisements){
					electronics=mergeArrays(electronics,electronics_advertisements);
					advertisementFunctions.getRecommendedOthers(view_tags,function(other_advertisements){
						others=mergeArrays(others,other_advertisements);
						advertisementFunctions.searchRecommendedBooks(search_tags,function(searched_books){
							books=mergeArrays(books,searched_books);
							advertisementFunctions.searchRecommendedElectronics(search_tags,function(searched_electronics){
								electronics=mergeArrays(electronics,searched_electronics);
								advertisementFunctions.searchRecommendedOthers(search_tags,function(searched_others){
									others=mergeArrays(others,searched_others);
									advertisementFunctions.getRecommended(user_type,function(advertisements){
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
	wish.save(function(){
		callback(wish);
	});
}

exports.getWish=function(wish_id,callback){
	Wish.findOne({_id:wish_id},function(err,wish){
		callback(wish);
	});
}

exports.getWishes=function(callback){
	Wish.find({},null,{sort:{_id:-1}},function(err,wishes){
		callback(wishes);
	});
}
