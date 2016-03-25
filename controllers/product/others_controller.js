var Others=require('../../models/products/Other');
var Advertisement=require('../../models/Advertisement');
var Activity=require('../../models/Activity');

//for images
var fs=require('fs');
var path = require('path');

var APP_DIR = path.dirname(require.main.filename);
var UPLOAD_DIR = "/uploads/productimages/others/";


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
        	       
	        var source = fs.createReadStream(oldPath);
			var dest = fs.createWriteStream(newPath);
			source.pipe(dest);
			fs.unlink(oldPath);
	 	}
	 }
	 else{
 		var oldPath=imagefiles.path;
 		var ext=path.extname(oldPath);
 		
 		var savedPath = UPLOAD_DIR+other._id+i+ext;
 		var newPath=APP_DIR+'/public/'+savedPath;

        other.images.push({path:savedPath});        
        	          
    	var source = fs.createReadStream(oldPath);
		var dest = fs.createWriteStream(newPath);
		source.pipe(dest);
		fs.unlink(oldPath);
 	}
 	//images done


	other.save();
 	callback(other._id,other.images[0].path);
	

}

exports.find=function(advertisement,callback){
	Others.findOne({_id:advertisement.product_id},function(err,product){
		callback(product);
	});
}