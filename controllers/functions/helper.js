var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);

var validator=require('validator');

exports.resizeAndMoveImage=function (oldpath,newpath) {
	var jimp=require('jimp');
	jimp.read(oldpath, function (err, image) {
		if(err)
			console.log(err);
		image.resize(500,400).write(newpath,function(err){
			fs.unlink(oldpath);		
		});
	});
	/*var easyimage=require('easyimage');
	easyimage.rescrop({
     src:oldpath, dst:newpath,
     width:500, height:400,
     gravity: 'Center'
  	}).then(function(){
  		fs.unlink(oldpath);
  	});*/
}

exports.changeToRegexArray=function(tags){
	var result=[];
	for(var i=0;i<tags.length;i++){
		result[i]=new RegExp(tags[i], 'i');
	}
	return result;
}

exports.deleteImages=function(images){
	var dirname=APP_DIR+'\\public';
	for(var i=0;i<images.length;i++){
		fs.unlink(dirname+images[i].path);
	}
	return;
}

exports.validateWish=function(input){
	var error;
	if(validator.isNull(input.title)||validator.isNull(input.category)){
		error='Invalid wish input.';
		return error;
	}
	return error;
}

exports.convertWishToTags=function(wish){
	var tags=[];
	tags=wish.title.split(" ");
	var desc_tags=wish.description.split(" ");
	for(var i=0;i<desc_tags.length;i++){
		switch(desc_tags[i]){
			case 'a':
			case 'an':
			case 'the':
			case 'is':
			case 'am':
			case 'are':
			case 'I':
			case 'i':
			case 'to':
			case 'this':
			case 'will':
			case 'shall':
			case 'you':
			case 'You':
			case 'any':
			case 'need':
				break;
			default:
				tags.push(desc_tags[i]);
				break;
		}
	}
	return tags;
}

exports.getMessageUniqueUser=function(messages,view_user_id){
	var lookup = {};
	var result = [];
	var user_id,user_name;

	for (var i = 0; i<messages.length;i++) {
		var message = messages[i];
		if(message.from_user_id===view_user_id){
			user_id=message.to_user_id;
			user_name=message.to_user_name;
		}
		else{
			user_id=message.from_user_id;
			user_name=message.from_user_name;
		}
	  // var user_id = (message.from_user_id===user_id)?messages.to_user_id:messages.from_user_id;
	  // var user_name=(message.from_user_id===user_id)?messages.to_user_name:messages.from_user_name;

	  if (!(user_id in lookup)) {
	    lookup[user_id] = 1;
	    result.push({user_id:user_id,name:user_name});
	  }
	}
	return result;
}