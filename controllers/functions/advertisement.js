var validator=require('validator');
var path=require('path');

var Advertisement=require('../../models/Advertisement');

var Book=require('../product/books_controller');
var Electronics=require('../product/electronics_controller');
var Other=require('../product/others_controller');


var RecentlyViewed=require('../../models/RecentlyViewed');

var Rating=require('../../models/Rating');

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
	advertisement.user_name=req.session.name;
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
	Book.search(query,function(books){
		var result=convertIdsToArray(books);
		Advertisement.find({product_id:{$in:result}},function(err,advertisements){
		callback(advertisements);
		});
	});
}

exports.searchElectronics=function(query,callback){
	Electronics.search(query,function(electronics){
		var result=convertIdsToArray(electronics);
		Advertisement.find({product_id:{$in:result}},function(err,advertisements){
		callback(advertisements);
		});
	});

}
exports.searchOther=function(query,callback){
	Other.search(query,function(others){
		var result=convertIdsToArray(others);
		Advertisement.find({product_id:{$in:result}},function(err,advertisements){
		callback(advertisements);
		});
	});

	
}

//latest
exports.latest=function(callback){
	Advertisement.find({}, null, {sort: {'createdAt': -1}}).exec(function(err, latests) {
  		callback(latests);
	});
}

//recently viewed
exports.recent=function(callback){
	RecentlyViewed.find({}, null, {}).exec(function(err, recents) {
  		callback(recents);
	});
}


//recommended logic here-change it
exports.recommended=function(user_type,callback){
	if(user_type==='Other'){
		Advertisement.find({}, null, {sort: {'createdAt': -1}}).exec(function(err, recommendations) {
  			callback(recommendations);
		});
	}
	else{
		Advertisement.find({user_type:user_type}, null, {sort: {'createdAt': -1}}).exec(function(err, recommendations) {
  			callback(recommendations);
  		});
	}
}

exports.getAdvertisement=function(id,callback){
	Advertisement.findOne({_id:id},function(err,advertisement){
		if(err)
			console.log(err);
		callback(advertisement);
	});
}

exports.getProduct=function(category,product_id,callback){
	switch(category){
		case 'Book':
			Book.find(product_id,function(product){
				callback(product);
			});
			break;
		case 'Electronics':
			Electronics.find(product_id,function(product){
				callback(product);
			});
			break;
		case 'Other':
			Other.find(product_id,function(product){
				callback(product);
			});
			break;
	}
}

exports.addRating=function(input,user_id,callback){
	//also check if rating already done
	Rating.findOne({user_id:user_id},function(err,result){
		if(result===null){
		var rating=new Rating(input);
		rating.user_id=user_id;
		rating.save();
		}
		else{
			result.rating=input.rating;
			result.save();
		}
		callback();
	});
	
}