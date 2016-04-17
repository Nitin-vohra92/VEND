var validator=require('validator');

var Student=require('../../models/users/Student');
var Account=require('../../models/Account');

var RecentlyViewed=require('../../models/RecentlyViewed');
var Advertisement=require('../../models/Advertisement');
var Wish=require('../../models/Wish');
var Notification=require('../../models/Notification');


var userFunctions=require("../functions/user");
var helper=require('../functions/helper');

//for profile picture
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);

//after confirm page this register is done

exports.register=function(req,res,input,image_path,callback){
	var student=new Student(input);


	//profile picture
 		var oldPath=image_path;
 		var ext=path.extname(oldPath);
 		var savedPath="/uploads/profilepictures/students/"+student._id+ext;
        var newPath = APP_DIR +'/public'+ savedPath;
		helper.resizeAndMoveImage(oldPath,newPath);
		 
 	//picture done



	student.save();
	
	var account=userFunctions.saveAccount(student,savedPath,input.username,input.password,input.type);

	delete req.session.temp_id;
	
	userFunctions.setSession(req,account);
	callback();

}

exports.find=function(id,callback){
	Student.findOne({_id:id},function(err,student){
		if(err)
			console.log(err);
		else{
			callback(student);	
		}
		});
}


exports.changeEmail=function(id,email,callback){
	Student.findOne({_id:id},function(err,user){
		if(err||user===null){
			callback(1);
		}
		else{
			if(validator.isEmail(email)){
	 			user.email=email;
		 		user.save(function(){
		 			callback(0);
		 		});
		 	}
		 	else
		 		callback(1);
		}
	});
}

exports.changeContact=function(id,contact,callback){
	Student.findOne({_id:id},function(err,user){
		if(err||user===null){
			callback(1);
		}
		else{
			if(validator.isMobilePhone(contact,'en-IN')){
	 			user.contact=contact;
		 		user.save(function(){
		 			callback(0);
		 		});
		 	}
		 	else
		 		callback(1);
		}
	});
}