var Student=require('../../models/users/Student');
var Account=require('../../models/Account');

var RecentlyViewed=require('../../models/RecentlyViewed');
var Advertisement=require('../../models/Advertisement');
var Wish=require('../../models/Wish');
var Notification=require('../../models/Notification');


var userFunctions=require("../functions/user");
var helper=require('../functions/helper');

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
		student.profile_pic=savedPath;
		helper.resizeAndMoveImage(oldPath,newPath);
		 
 	//picture done



	student.save();
	
	var account=userFunctions.saveAccount(student,input.username,input.password,input.type);

	delete req.session.temp_id;
	
	userFunctions.setSession(req,account);
	res.redirect('/');

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


