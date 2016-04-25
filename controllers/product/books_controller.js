var Book=require('../../models/products/Book');


//for images
var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);
var UPLOAD_DIR = "/uploads/productimages/books/";


var helper=require('../functions/helper');
var timestamp=require('../functions/timestamp');
var userFunctions=require('../functions/user');


exports.publish=function(req,callback){
	var input=req.body;

	//validate data if possible
 	var book=new Book(input);

 	//images
 	var imagefiles=req.files.images;
 	if(Array.isArray(imagefiles)){
 		for(var i=0; i<imagefiles.length;i++){
 			var oldPath=imagefiles[i].path;

 			var ext=path.extname(oldPath);
			var savedPath = UPLOAD_DIR+book._id+i+ext;
	 		var newPath=APP_DIR+'/public'+savedPath;
         	book.images.push({path:savedPath});        
	
			helper.resizeAndMoveImage(oldPath,newPath);     	
 		}

 	}
 	else{
 		var oldPath=imagefiles.path;
		var ext=path.extname(oldPath);
	 	var savedPath = UPLOAD_DIR+book._id+ext;
	 	var newPath=APP_DIR+'/public'+savedPath;
        book.images.push({path:savedPath}); 

		helper.resizeAndMoveImage(oldPath,newPath);
 		
 	}


 	//images done
	


		book.createdAt=timestamp.getTime();
		book.save();
		
		callback(book);
	
}

exports.saveImages=function(req,product_id,callback){
	var images=[];
	var imagefiles=req.files.images;
 	if(Array.isArray(imagefiles)){
 		for(var i=0; i<imagefiles.length;i++){
 			var oldPath=imagefiles[i].path;

 			var ext=path.extname(oldPath);
			var savedPath = UPLOAD_DIR+product_id+i+ext;
	 		var newPath=APP_DIR+'/public'+savedPath;
         	images.push({path:savedPath});        
	
			helper.resizeAndMoveImage(oldPath,newPath);     	
 		}

 	}
 	else{
 		var oldPath=imagefiles.path;
		var ext=path.extname(oldPath);
	 	var savedPath = UPLOAD_DIR+product_id+ext;
	 	var newPath=APP_DIR+'/public'+savedPath;
        images.push({path:savedPath}); 

		helper.resizeAndMoveImage(oldPath,newPath);
 		
 	}
 	Book.findOne({_id:product_id},function(err,product){
 		helper.deleteImages(product.images);
 		product.images=images;
 		product.updatedAt=timestamp.getTime();
 		product.save();
 		callback(product.images[0].path);
 	});

}


exports.find=function(id,callback){
	Book.findOne({_id:id},function(err,product){
		callback(product);
	});
}

exports.findBooksByIds=function(ids,callback){
	Book.find({_id:{$in:ids}},function(err,products){
		callback(products);
	});
}
exports.search=function(query,callback){
	query=helper.changeToRegexArray(query);
	Book.find({$or:[{title: {$in:query}},{author: {$in:query}}]},{_id:1},{sort: {'_id': -1}},function(err,books){
		callback(books);
	});
}
exports.getRecommendedBooks=function(view_tags,callback){
	Book.find({semester:{$in:view_tags}},function(err,books){
			callback(books);
	});
}

exports.searchRecommendedBooks=function(search_tags,callback){
	search_tags=helper.changeToRegexArray(search_tags);
	Book.find({$or:[{title:{$in:search_tags}},{author: {$in:search_tags}},{semester:{$in:search_tags}}]},{_id:1},function(err,books){
		callback(books);
	});
}

exports.deleteProduct=function(product_id,callback){
	Book.findOne({_id:product_id},function(err,product){
		var images=product.images;
		helper.deleteImages(images);
		Book.remove({_id:product_id},function(){
			callback();
		});
	});
}