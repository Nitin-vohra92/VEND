var Book=require('../../models/products/Book');
var Advertisement=require('../../models/Advertisement');
var Activity=require('../../models/Activity');


//for images
var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);
var UPLOAD_DIR = "/uploads/productimages/books/";

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
 			var newPath=APP_DIR+'/public/'+savedPath;

        	book.images.push({path:savedPath});        
        	var source = fs.createReadStream(oldPath);
			var dest = fs.createWriteStream(newPath);
			source.pipe(dest);
			fs.unlink(oldPath);
 		}
 	}
 	else{
 		var oldPath=imagefiles.path;
 		var ext=path.extname(oldPath);
 		var savedPath = UPLOAD_DIR+book._id+i+ext;
 		var newPath=APP_DIR+'/public/'+savedPath;

        book.images.push({path:savedPath});        
    	var source = fs.createReadStream(oldPath);
		var dest = fs.createWriteStream(newPath);
		source.pipe(dest);
		fs.unlink(oldPath);
 	}


 	//images done


 	book.save();
 	callback(book._id,book.images[0].path);
 	//move to advertisement functions
	


	
}


exports.find=function(advertisement,callback){
	Book.findOne({_id:advertisement.product_id},function(err,product){
		callback(product);
	});
}