var Electronics=require('../../models/products/Electronics');
var Advertisement=require('../../models/Advertisement');

var Activity=require('../../models/Activity');
//for images
var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);
var UPLOAD_DIR = "\\uploads\\productimages\\electronics\\";

var helper=require('../functions/helper');
var timestamp=require('../functions/timestamp');

exports.publish=function(req,callback){
	var input=req.body;


	//validate data if possible
 	var electronics=new Electronics(input);


 	//images
 	var imagefiles=req.files.images;
 	if(Array.isArray(imagefiles)){
 		for(var i=0; i<imagefiles.length;i++){
 			var oldPath=imagefiles[i].path;
 			var ext=path.extname(oldPath);

 			var savedPath = UPLOAD_DIR+electronics._id+i+ext;
 			var newPath=APP_DIR+'\\public'+savedPath;
 			
    	    electronics.images.push({path:savedPath});
			helper.resizeAndMoveImage(oldPath,newPath); 

 		}
 	}
 	else{
 		var oldPath=imagefiles.path;
 		var ext=path.extname(oldPath);
    	var savedPath = UPLOAD_DIR+electronics._id+i+ext;
 		var newPath=APP_DIR+'/public/'+savedPath;
 		electronics.images.push({path:savedPath});
    	
    	helper.resizeAndMoveImage(oldPath,newPath); 
    	
 	}
 	//images done

	electronics.createdAt=timestamp.getTime();
	electronics.updatedAt=timestamp.getTime();

	electronics.save();

 	callback(electronics._id,electronics.images[0].path);
	
}

exports.find=function(id,callback){
	Electronics.findOne({_id:id},function(err,product){
		callback(product);
	});
}

exports.search=function(query,callback){
	Electronics.find({$or:[{name: { $regex: query, $options: "i" }},{brand: { $regex: query, $options: "i" }},{sub_category: { $regex: query, $options: "i" }}]},{_id:1},function(err,electronics){		
		callback(electronics);
	});
}
exports.getRecommendedElectronics=function(view_tags,callback){
	Electronics.find({sub_category:{$in:view_tags}},function(err,electronics){
			callback(electronics);
	});
}

exports.searchRecommendedElectronics=function(search_tags,callback){
	search_tags=helper.changeToRegexArray(search_tags);
	Electronics.find({$or:[{name: {$in:search_tags}},{brand: {$in:search_tags}},{sub_category: {$in:search_tags}}]},{_id:1},function(err,electronics){		
		callback(electronics);
	});
}