var Student=require('../../models/users/Student');
var Account=require('../../models/Account');

var RecentlyViewed=require('../../models/RecentlyViewed');
var Advertisement=require('../../models/Advertisement');
var Wish=require('../../models/Wish');
var Notification=require('../../models/Notification');


var userFunctions=require("../functions/user");

//for profile picture
var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);

//after confirm page this register is done

exports.register=function(req,res,input,image_path){
	var student=new Student(input);


	//profile picture
 		var oldPath=image_path;
 		var ext=path.extname(oldPath);
 		var savedPath="/uploads/profilepictures/students/"+student._id+ext;
        var newPath = APP_DIR +'/public'+ savedPath;
               
        var source = fs.createReadStream(oldPath);
		var dest = fs.createWriteStream(newPath);
		source.pipe(dest);
		student.profile_pic=savedPath; 
		fs.unlink(oldPath);
 	//picture done



	student.save();
	
	var account=userFunctions.saveAccount(student,input.username,input.password,input.type);

	delete req.session.temp_id;
	
	userFunctions.setSession(req,account);
	res.redirect('/');

}

exports.find=function(callback,account){
	Student.findOne({_id:account.user_id},function(err,student){
		if(err)
			console.log(err);
		else{
			console.log(student);
			callback(student);	
		}
		});
}

exports.home=function(req,res){
	var response={};
	Student.findOne({_id:req.session.user_id},function(err,student){
		if(err)
			console.log(err);
		else{
			response.user_info=req.session;
			//getting latest advertisements
			Advertisement.find({}, null, {limit: 4, sort: {'createdAt': -1}}).exec(function(err, advertisement) {
				response.latest=advertisement;
				//getting recently viewed
				RecentlyViewed.find({}, null, {limit: 4}).exec(function(err, advertisement) {
  					response.recent=advertisement;

  					//change it
  					Advertisement.find({user_type:'Student'}, null, {limit: 4, sort: {'createdAt': -1}}).exec(function(err, recommendations) {
  						response.recommended=recommendations;
	  					Wish.find({}, null, { sort: {'createdAt': -1}}).exec(function(err, wishes) {
	  						response.wishes=wishes;
	  						Notification.find({$and:[{user_id:req.session.user_id},{read:0}]}, null, { sort: {'createdAt': -1}}).exec(function(err, notifications) {
		  						response.notification_count=notifications.length;
								// res.json(response);
								res.render('index',{response:response});
							});
						});
					});
  				});
			});
		}
	});
}
