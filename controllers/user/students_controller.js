var Student=require('../../models/users/Student');
var Account=require('../../models/Account');

var RecentlyViewed=require('../../models/RecentlyViewed');
var Advertisement=require('../../models/Advertisement');
var Wish=require('../../models/Wish');
var Notification=require('../../models/Notification');
//for profile picture
var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);


exports.register=function(input,req,res){
	//first validate the input
	var student=new Student(input);


	//profile picture
 	var imagefile=req.files.profile_pic;
 		var oldPath=imagefile.path;
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
	console.log("Student saved");

	var account=new Account(input);
	account.user_id=student._id;
	account.name=input.firstname+' '+input.lastname;	
	account.save();
	
	//console.log(input);
	req.session.user_id=account.user_id;
	req.session.user_type=account.type;
	req.session.save(function(err) {
		console.log(err);
		res.redirect('/');
	});
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
			response.user_info=student;
			console.log(req.session);
			//getting latest advertisements
			Advertisement.find({}, null, {limit: 4, sort: {'createdAt': -1}}).exec(function(err, advertisement) {
				response.latest=advertisement;
				console.log('Inside latest');
				//getting recently viewed
				Advertisement.find({}, null, {limit: 4}).exec(function(err, advertisement) {
  					response.recent=advertisement;
  					console.log('Inside recents');

  					//change it
  					Advertisement.find({user_type:'Student'}, null, {limit: 4, sort: {'createdAt': -1}}).exec(function(err, recommendations) {
  						response.recommended=recommendations;
  						console.log('Inside recommended');
	  					Wish.find({}, null, { sort: {'createdAt': -1}}).exec(function(err, wishes) {
	  						response.wishes=wishes;
	  						console.log('Inside wishes');
	  						Notification.find({$and:[{user_id:req.session.user_id},{read:0}]}, null, { sort: {'createdAt': -1}}).exec(function(err, notifications) {
		  						response.notifications=notifications;
		  						console.log('Inside notifications');
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
