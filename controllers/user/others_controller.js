var Other=require('../../models/users/Others');
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


	var other=new Other(input);


	//profile picture
		var oldPath=image_path;
 		var ext=path.extname(oldPath);
 		var savedPath="/uploads/profilepictures/others/"+other._id+ext;
        var newPath = APP_DIR +'/public'+ savedPath;
		other.profile_pic=savedPath; 
		helper.resizeAndMoveImage(oldPath,newPath);

 	//picture done



	other.save();

	var account=userFunctions.saveAccount(other,input.username,input.password,input.type);
	
	delete req.session.temp_id;
	userFunctions.setSession(req,account);

	res.redirect('/');
}

exports.find=function(id,callback){
	Other.findOne({_id:id},function(err,other){
		if(err)
			console.log(err);
		else
			callback(other);	
	});
}


