
var Teacher=require('../../models/users/Teacher');
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
	var teacher=new Teacher(input);
	teacher.department=input.teacher_department;
	//profile picture
 	
 		var oldPath=image_path;
 		var ext=path.extname(oldPath);
 		var savedPath="/uploads/profilepictures/teachers/"+teacher._id+ext;
        var newPath = APP_DIR +'/public'+ savedPath;
               
        var source = fs.createReadStream(oldPath);
		var dest = fs.createWriteStream(newPath);
		source.pipe(dest);

		teacher.profile_pic=savedPath;
		console.log(teacher); 
		fs.unlink(oldPath);
 	//picture done



	teacher.save();
	
	var account=userFunctions.saveAccount(teacher,input.username,input.password,input.type);

	delete req.session.temp_id;
	

	userFunctions.setSession(req,account);
	res.redirect('/');
	
}
exports.find=function(callback,account){
	Teacher.findOne({_id:account.user_id},function(err,teacher){
		if(err)
			console.log(err);
		else{
			callback(teacher);

		}
		});
}


