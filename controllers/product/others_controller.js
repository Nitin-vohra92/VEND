var Others=require('../../models/products/Other');

//for images
var fs=require('fs');
var path = require('path');

var APP_DIR = path.dirname(require.main.filename);
var UPLOAD_DIR = "/uploads/productimages/others/";

var helper=require('../functions/helper');
var timestamp=require('../functions/timestamp')

exports.publish=function(req,callback){
	var input=req.body;

	//validate data if possible
 	var other=new Others(input);


 	//images
 	var imagefiles=req.files.images;
 	if(Array.isArray(imagefiles)){
	 	for(var i=0; i<imagefiles.length;i++){
	 		var oldPath=imagefiles[i].path;
	 		var ext=path.extname(oldPath);

	        var savedPath = UPLOAD_DIR+other._id+i+ext;
 			var newPath=APP_DIR+'/public/'+savedPath;

        	other.images.push({path:savedPath}); 
    		helper.resizeAndMoveImage(oldPath,newPath); 

	 	}
	 }
	 else{
 		var oldPath=imagefiles.path;
 		var ext=path.extname(oldPath);
 		
 		var savedPath = UPLOAD_DIR+other._id+ext;
 		var newPath=APP_DIR+'/public/'+savedPath;

        other.images.push({path:savedPath});
    	helper.resizeAndMoveImage(oldPath,newPath); 

 	}
 	//images done

	other.createdAt=timestamp.getTime();
	other.updatedAt=timestamp.getTime();

	other.save();
 	callback(other._id,other.images[0].path);
	

}

exports.saveImages=function(req,product_id,callback){
	var images=[];
	var imagefiles=req.files.images;
 	if(Array.isArray(imagefiles)){
 		for(var i=0; i<imagefiles.length;i++){
 			var oldPath=imagefiles[i].path;

 			var ext=path.extname(oldPath);
			var savedPath = UPLOAD_DIR+product_id+i+ext;
	 		var newPath=APP_DIR+'\\public'+savedPath;
         	images.push({path:savedPath});        
	
			helper.resizeAndMoveImage(oldPath,newPath);     	
 		}

 	}
 	else{
 		var oldPath=imagefiles.path;
		var ext=path.extname(oldPath);
	 	var savedPath = UPLOAD_DIR+product_id+ext;
	 	var newPath=APP_DIR+'\\public\\'+savedPath;
        images.push({path:savedPath}); 

		helper.resizeAndMoveImage(oldPath,newPath);
 		
 	}
 	Others.findOne({_id:product_id},function(err,product){
 		helper.deleteImages(product.images);
 		product.images=images;
 		product.updatedAt=timestamp.getTime();
 		product.save();
 		callback(product.images[0].path);
 	});

}



exports.find=function(id,callback){
	Others.findOne({_id:id},function(err,product){
		callback(product);
	});
}

exports.findOthersByIds=function(ids,callback){
	Others.find({_id:{$in:ids}},function(err,products){
		callback(products);
	});
}

exports.search=function(query,callback){
	Others.find({$or:[{name: { $regex: query, $options: "i" }},{brand: { $regex: query, $options: "i" }},{sub_category: { $regex: query, $options: "i" }}]},{_id:1},{sort: {'_id': -1}},function(err,others){
		callback(others);
	});
}

exports.getRecommendedOthers=function(view_tags,callback){
	Others.find({sub_category:{$in:view_tags}},function(err,others){
			callback(others);
	});
}

exports.searchRecommendedOthers=function(search_tags,callback){
	search_tags=helper.changeToRegexArray(search_tags);
	Others.find({$or:[{name: {$in:search_tags}},{brand: {$in:search_tags}},{sub_category: {$in:search_tags}}]},{_id:1},function(err,others){
		callback(others);
	});
}

exports.deleteProduct=function(product_id,callback){
	Others.remove({_id:product_id},function(){
		callback();
	});
}