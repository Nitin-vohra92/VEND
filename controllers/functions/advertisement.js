var validator=require('validator');
var path=require('path');

var Advertisement=require('../../models/Advertisement');

var Book=require('../../models/products/Book');
var Electronics=require('../../models/products/Electronics');
var Other=require('../../models/products/Other');


function convertIdsToArray(ids){
	var result=[];
	for (var i = 0; i<ids.length; i++) {
	result[i]=ids[i]._id;
	}
	return result;
}

exports.validatePublishData=function(req){
	var error;
	var input=req.body;
	var images=req.files.images;
	var category=input.category;
	// var name_test=new RegExp('([a-zA-Z]+[^1234567890]+(\.)? )+');
	var name_test=new RegExp('([1234567890])+');
	switch(category){
		case 'Book':
			//for title
			if(validator.isNull(input.title)){
				error="Title of book is not valid.";
				return error;
			}
			if (validator.isNull(input.author)||name_test.test(input.author)) {
				error='Author of book is not valid.(Numbers not allowed)';
				return error;
			}
			if (!validator.isNumeric(input.semester)||(input.semester<0||input.semester>10)) {
				error="Semester is not valid.";
				return error;
			}
			break;
		case 'Electronics':
		case 'Other':
			if(validator.isNull(input.brand)){
				error="Brand of product is not valid.";
				return error;
			}
			if (validator.isNull(input.sub_category)) {
				error='Sub category of product is not valid';
				return error;
			}
			if (validator.isNull(input.name)) {
				error="Name of product is not valid.";
				return error;
			}
			break;
	}
	//now check for common details
	if(validator.isNull(input.kind)||!validator.isAlpha(input.kind)||(input.kind!=='BUY'&&input.kind!=='LOAN')){
		error="BUY or LOAN input not valid.";
		return error;
	}
	if(validator.isNull(input.bid)||!validator.isAlpha(input.bid)||(input.bid!=='YES'&&input.bid!=='NO')){
		error="BID input not valid.";
		return error;
	}
	if (images.length>0) {
		var count=images.length;
		for(var i=0;i<count;i++){
			var ext=path.extname(images[i].path);
			//for now only two types of images
			if(ext!=='.jpg'&& ext!=='.png'&&ext!=='.JPG'&&ext!=='.PNG'){
				error="Image files with extension: "+ext+" not supported!! Only .jpg and .png are supported. All files must be of these format.";
				return error;
			}
		}
	}
	if(images.length===0){
		error="Image of the product is required.";
		return error;
	}
	if(validator.isNull(input.location)){
		error="Location of product not specified";
		return error;
	}
	if(!validator.isNumeric(input.price)||input.price<0||input.price>9999999){
		error="Price of product is not valid.";
		return error;
	}
	if(validator.isNull(input.description)){
		error="Please give desription of product.";
		return error;
	}


	return error;
}

exports.saveAdvertisement=function(req,product_id,thumb_path){
	var input=req.body;
	var advertisement=new Advertisement(input);
	advertisement.product_id=product_id;
	advertisement.user_id=req.session.user_id;
	advertisement.user_type=req.session.user_type;
	advertisement.thumb=thumb_path;
	switch(input.category){
	case 'Book':
		advertisement.name=input.title;
		break;
	case 'Electronics':
	case 'Other':
		advertisement.name=input.name;
		break;
	} 
	advertisement.save();
	return advertisement;
}

exports.searchBook=function(query,callback){
	Book.find({$or:[{title: { $regex: query, $options: "i" }},{author: { $regex:query, $options: "i" }}]},{_id:1},function(err,books){
		var result=convertIdsToArray(books);
		Advertisement.find({product_id:{$in:result}},function(err,advertisement){
		callback(advertisement);
		});
	});
}

exports.searchElectronics=function(query,callback){
	Electronics.find({$or:[{name: { $regex: query, $options: "i" }},{brand: { $regex: query, $options: "i" }},{sub_category: { $regex: query, $options: "i" }}]},{_id:1},function(err,electronics){
		var result=convertIdsToArray(electronics);
		Advertisement.find({product_id:{$in:result}},function(err,advertisement){
		callback(advertisement);
		});
	});
}
exports.searchOther=function(query,callback){
	Other.find({$or:[{name: { $regex: query, $options: "i" }},{brand: { $regex: query, $options: "i" }},{sub_category: { $regex: query, $options: "i" }}]},{_id:1},function(err,others){
		var result=convertIdsToArray(others);
		Advertisement.find({product_id:{$in:result}},function(err,advertisement){
		callback(advertisement);
		});
	});
}