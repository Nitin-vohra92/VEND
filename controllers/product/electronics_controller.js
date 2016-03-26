var Electronics=require('../../models/products/Electronics');
var Advertisement=require('../../models/Advertisement');

var Activity=require('../../models/Activity');
//for images
var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);
var UPLOAD_DIR = "/uploads/productimages/electronics/";

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
 			var newPath=APP_DIR+'/public/'+savedPath;
 			
    	    electronics.images.push({path:savedPath});

    	    var source = fs.createReadStream(oldPath);
			var dest = fs.createWriteStream(newPath);
			source.pipe(dest);
			fs.unlink(oldPath);
 		}
 	}
 	else{
 		var oldPath=imagefiles.path;
 		var ext=path.extname(oldPath);
    	var savedPath = UPLOAD_DIR+electronics._id+i+ext;
 		var newPath=APP_DIR+'/public/'+savedPath;
 		electronics.images.push({path:savedPath});
    	             
    	var source = fs.createReadStream(oldPath);
		var dest = fs.createWriteStream(newPath);
		source.pipe(dest);
		fs.unlink(oldPath);
 	}
 	//images done


	electronics.save();

 	callback(electronics._id,electronics.images[0].path);
	
}

exports.find=function(advertisement,callback){
	Electronics.findOne({_id:advertisement.product_id},function(err,product){
		callback(product);
	});
}