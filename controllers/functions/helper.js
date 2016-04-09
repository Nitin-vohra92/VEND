var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);


exports.resizeAndMoveImage=function (oldpath,newpath) {
	var jimp=require('jimp');
	jimp.read(oldpath, function (err, image) {
		if(err)
			console.log(err);
		image.resize(500,400).write(newpath,function(err){
			fs.unlink(oldpath);		
		});
	});
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