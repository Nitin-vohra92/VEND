var Book=require('../../models/products/Book');
var Advertisement=require('../../models/Advertisement');
var Activity=require('../../models/Activity');


//for images
var fs=require('fs');
var path = require('path');
var APP_DIR = path.dirname(require.main.filename);
var UPLOAD_DIR = "/uploads/productimages/books/";

exports.publish=function(input,req,res){


	//validate data if possible
 	var book=new Book(input);
 	book.name=book.title+', '+book.author;

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
	var advertisement=new Advertisement(input);
	advertisement.product_id=book._id;
	advertisement.user_id=req.session.user_id;
	advertisement.user_type=req.session.user_type;
	advertisement.thumb=book.images[0].path;
	advertisement.kind=input.kind;
	advertisement.category=input.category;
	advertisement.price=input.price;
	advertisement.description=book.title+' by '+book.author; 
	advertisement.save();


	//add to activity
	var activity=new Activity(input);
	activity.user_id=req.session.user_id;
	activity.user_name=req.session.user_name;
	activity.activity='Posted an Advertisement for Book: '+book.title+' at '+advertisement.createdAt;
	activity.save();


	//where to redirect
	//res.status(201).json(imagefiles);
	res.redirect('/');
}


exports.find=function(callback,advertisement){
	Book.findOne({_id:advertisement.product_id},function(err,product){
		callback(product);
	});
}