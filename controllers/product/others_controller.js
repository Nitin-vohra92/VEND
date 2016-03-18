var Others=require('../../models/products/Other');
var Advertisement=require('../../models/Advertisement');
var Activity=require('../../models/Activity');

//for images
var fs=require('fs');
var path = require('path');

var APP_DIR = path.dirname(require.main.filename);
var UPLOAD_DIR = "/uploads/productimages/others/";


exports.publish=function(input,req,res){

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
	var advertisement=new Advertisement(input);
	advertisement.product_id=other._id;
	advertisement.user_id=req.session.user_id;
	advertisement.user_type=req.session.user_type;
	advertisement.thumb=other.images[0].path;
	advertisement.kind=input.kind;
	advertisement.category=input.category;
	advertisement.price=input.price;
	advertisement.description=other.name+' under :'+other.sub_category; 
	advertisement.save();


	//add to activity
	var activity=new Activity(input);
	activity.user_id=req.session.user_id;
	activity.user_name=req.session.user_name;
	activity.activity='Posted an Advertisement Under Others for: '+other.name+' at '+advertisement.createdAt;
	activity.save();

	console.log(input);
	//res.status(201).json(other);
	res.redirect('/');

}

exports.find=function(callback,advertisement){
	Others.findOne({_id:advertisement.product_id},function(err,product){
		callback(product);
	});
}