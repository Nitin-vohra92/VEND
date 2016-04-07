var validator=require('validator');
var path=require('path');

var Advertisement=require('../../models/Advertisement');

var Book=require('../product/books_controller');
var Electronics=require('../product/electronics_controller');
var Other=require('../product/others_controller');


var RecentlyViewed=require('../../models/RecentlyViewed');

var Rating=require('../../models/Rating');
var Bid=require('../../models/Bid');
var Comment=require('../../models/Comment');
var Ping=require('../../models/Ping');

var userFunctions=require('./user');



var timestamp=require('./timestamp');

function convertIdsToArray(ids){
	var result=[];
	for (var i = 0; i<ids.length; i++) {
	result[i]=ids[i]._id;
	}
	return result;
}

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function findIndexByKeyValue(obj, key, value){
    for (var i = 0; i < obj.length; i++) {
        if (obj[i][key] == value) {
            return i;
        }
    }
    return -1;
}

function getAdvertisementFromIds(products,callback){
	var result=convertIdsToArray(products);
	Advertisement.find({product_id:{$in:result}},function(err,advertisements){
		callback(advertisements);
	});
}
function setAggregateRating(ad_id,callback){
	Rating.aggregate([{$match:{ad_id:ad_id}},{$group:{ _id: '$ad_id',average:{$avg: '$rating'},count:{$sum:1}}}],function(err,result_rating){	
			var rating={};
			if(result_rating.length===0){
				rating.average=0;
				rating.count=0;
			}
			else{
				rating=result_rating[0];
			}
			Advertisement.findOne({_id:ad_id},function(err,advertisement){
				advertisement.rating=rating.average*rating.count;
				advertisement.save();
				console.log(rating);
				callback();
			});
		});
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
	advertisement.createdAt=timestamp.getTime();
	advertisement.updatedAt=timestamp.getTime();
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
		getAdvertisementFromIds(books,function(advertisements){
			callback(advertisements);
		});		
	});
}

exports.searchElectronics=function(query,callback){
	Electronics.search(query,function(electronics){
		getAdvertisementFromIds(electronics,function(advertisements){
			callback(advertisements);
		});	
	});

}
exports.searchOther=function(query,callback){
	Other.search(query,function(others){
		getAdvertisementFromIds(others,function(advertisements){
			callback(advertisements);
		});	
	});

	
}
/////////////////////////////////////////////////
//ad sort logic
exports.getSortName=function(sort){
	var name;
	switch(sort){
		case null:
		case 'publish_time':
			name='Newest First';
			break;
		case 'rating':
			name='Rating';
			break;
		case 'price_asc':
			name='Price(Low to High)';
			break;
		case 'price_desc':
			name='Price(High to Low)';
			break;
		case 'loan':
			name='Available for Loan';
			break;
		case 'buy':
			name='Available for Buy';
			break;
		case 'bid':
			name='Available for Bidding';
			break;
		case 'no_bid':
			name='Not available for Bidding';
			break;
		default:
			name='Newest First';
			break;
	}
	return name;
}
//for ads for advertisement page
exports.getBooks=function(sort,callback){
	switch(sort){
		case null:
		case 'publish_time':
			Advertisement.find({category: 'Book'}, null, {sort: {'_id': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'rating':
			Advertisement.find({category: 'Book'}, null, {sort: {'rating': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'price_asc':
			Advertisement.find({category: 'Book'}, null, {sort: {'price': 1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'price_desc':
			Advertisement.find({category: 'Book'}, null, {sort: {'price': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'loan':
			Advertisement.find({category: 'Book',kind:'LOAN'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'buy':
			Advertisement.find({category: 'Book',kind:'BUY'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'bid':
			Advertisement.find({category: 'Book',bid:'YES'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'no_bid':
			Advertisement.find({category: 'Book',bid:'NO'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		default:
			Advertisement.find({category: 'Book'}, null, {sort: {'_id': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
	}

}

exports.getElectronics=function(sort,callback){
	switch(sort){
		case null:
		case 'publish_time':
			Advertisement.find({category: 'Electronics'}, null, {sort: {'_id': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'rating':
			Advertisement.find({category: 'Electronics'}, null, {sort: {'rating': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'price_asc':
			Advertisement.find({category: 'Electronics'}, null, {sort: {'price': 1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'price_desc':
			Advertisement.find({category: 'Electronics'}, null, {sort: {'price': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'loan':
			Advertisement.find({category: 'Electronics',kind:'LOAN'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'buy':
			Advertisement.find({category: 'Electronics',kind:'BUY'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'bid':
			Advertisement.find({category: 'Electronics',bid:'YES'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'no_bid':
			Advertisement.find({category: 'Electronics',bid:'NO'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		default:
			Advertisement.find({category: 'Electronics'}, null, {sort: {'_id': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
	}
}
exports.getOthers=function(sort,callback){
	switch(sort){
		case null:
		case 'publish_time':
			Advertisement.find({category: 'Other'}, null, {sort: {'_id': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'rating':
			Advertisement.find({category: 'Other'}, null, {sort: {'rating': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'price_asc':
			Advertisement.find({category: 'Other'}, null, {sort: {'price': 1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'price_desc':
			Advertisement.find({category: 'Other'}, null, {sort: {'price': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'loan':
			Advertisement.find({category: 'Other',kind:'LOAN'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'buy':
			Advertisement.find({category: 'Other',kind:'BUY'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'bid':
			Advertisement.find({category: 'Other',bid:'YES'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'no_bid':
			Advertisement.find({category: 'Other',bid:'NO'}, null, {}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		default:
			Advertisement.find({category: 'Other'}, null, {sort: {'_id': -1}}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
	}
}




//latest
exports.getLatest=function(limit,sort,callback){
	if(limit===null){
		limit=40;
	}
	switch(sort){
		case null:
		case 'publish_time':
			Advertisement.find({}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'rating':
			Advertisement.find({}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				advertisements.sort(function(a,b){//decreasing
					return b.rating-a.rating;
				});
				callback(advertisements);
			});
			break;
		case 'price_asc':
			Advertisement.find({}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				advertisements.sort(function(a,b){//inc
					return a.price-b.price;
				});
				callback(advertisements);
			});
			break;
		case 'price_desc':
			Advertisement.find({}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				advertisements.sort(function(a,b){//dec
					return b.price-a.price;
				});
				callback(advertisements);
			});
			break;
		case 'loan':
			Advertisement.find({kind:'LOAN'}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'buy':
			Advertisement.find({kind:'BUY'}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'bid':
			Advertisement.find({bid:'YES'}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'no_bid':
			Advertisement.find({bid:'NO'}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		default:
			Advertisement.find({}, null, {sort: {'_id': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
	}
}

//recently viewed
exports.getRecentlyViewed=function(limit,sort,callback){
	if(limit===null){
		limit=40;
	}
	switch(sort){
		case null:
		case 'publish_time':
			RecentlyViewed.find({}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'rating':
			RecentlyViewed.find({}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				advertisements.sort(function(a,b){//decreasing
					return b.rating-a.rating;
				});
				callback(advertisements);
			});
			break;
		case 'price_asc':
			RecentlyViewed.find({}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				advertisements.sort(function(a,b){//inc
					return a.price-b.price;
				});
				callback(advertisements);
			});
			break;
		case 'price_desc':
			RecentlyViewed.find({}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				advertisements.sort(function(a,b){//dec
					return b.price-a.price;
				});
				callback(advertisements);
			});
			break;
		case 'loan':
			RecentlyViewed.find({kind:'LOAN'}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'buy':
			RecentlyViewed.find({kind:'BUY'}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'bid':
			RecentlyViewed.find({bid:'YES'}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		case 'no_bid':
			RecentlyViewed.find({bid:'NO'}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
		default:
			RecentlyViewed.find({}, null, {sort: {'updatedAt': -1},limit:limit}).exec(function(err, advertisements) {
				callback(advertisements);
			});
			break;
	}
}

exports.getRecommended=function(user_type,callback){
	var recommended={};
	Advertisement.find({user_type:user_type,category:'Book'},null,{sort: {'_id': -1}},function(err,books){
		recommended.books=books;
		Advertisement.find({user_type:user_type,category:'Electronics'},null,{sort: {'_id': -1}},function(err,electronics){
			recommended.electronics=electronics;
			Advertisement.find({user_type:user_type,category:'Other'},null,{sort: {'_id': -1}},function(err,others){
				recommended.others=others;
				callback(recommended);
			});
		});
	});
}

exports.getRecommendedBooks=function(view_tags,callback){
	Book.getRecommendedBooks(view_tags,function(books){
		getAdvertisementFromIds(books,function(advertisements){
			callback(advertisements);
		});
	});
}


exports.searchRecommendedBooks=function(search_tags,callback){
	Book.searchRecommendedBooks(search_tags,function(books){
		getAdvertisementFromIds(books,function(advertisements){
			callback(advertisements);
		});
	});
}

exports.getRecommendedElectronics=function(view_tags,callback){
	Electronics.getRecommendedElectronics(view_tags,function(electronics){
		getAdvertisementFromIds(electronics,function(advertisements){
			callback(advertisements);
		});
	});
}

exports.searchRecommendedElectronics=function(search_tags,callback){
	Electronics.searchRecommendedElectronics(search_tags,function(electronics){
		getAdvertisementFromIds(electronics,function(advertisements){
			callback(advertisements);
		});
	});
}

exports.getRecommendedOthers=function(view_tags,callback){
	Other.getRecommendedOthers(view_tags,function(others){
		getAdvertisementFromIds(others,function(advertisements){
			callback(advertisements);
		});
	});
}

exports.searchRecommendedOthers=function(search_tags,callback){
	Other.searchRecommendedOthers(search_tags,function(others){
		getAdvertisementFromIds(others,function(advertisements){
			callback(advertisements);
		});
	});
}

exports.sortAdvertisements=function(sort,books,electronics,others,callback){
	switch(sort){
		case null:
		case 'publish_time':
			callback(books,electronics,others);
			break;
		case 'rating':
			books.sort(function(a,b){//inc
				return b.rating-a.rating;
			});
			electronics.sort(function(a,b){//inc
				return b.rating-a.rating;
			});
			others.sort(function(a,b){//inc
				return b.rating-a.rating;
			});
			callback(books,electronics,others);
			break;
		case 'price_asc':
			books.sort(function(a,b){//inc
				return a.price-b.price;
			});
			electronics.sort(function(a,b){//inc
				return a.price-b.price;
			});
			others.sort(function(a,b){//inc
				return a.price-b.price;
			});
			callback(books,electronics,others);
			break;
		case 'price_desc':
			books.sort(function(a,b){//inc
				return b.price-a.price;
			});
			electronics.sort(function(a,b){//inc
				return b.price-a.price;
			});
			others.sort(function(a,b){//inc
				return b.price-a.price;
			});
			callback(books,electronics,others);
			break;
		case 'loan':
			books=getObjects(books,'kind','LOAN');
			electronics=getObjects(electronics,'kind','LOAN');
			others=getObjects(others,'kind','LOAN');
			callback(books,electronics,others);
			break;
		case 'buy':
			books=getObjects(books,'kind','BUY');
			electronics=getObjects(electronics,'kind','BUY');
			others=getObjects(others,'kind','BUY');
			callback(books,electronics,others);
			break;
		case 'bid':
			books=getObjects(books,'bid','YES');
			electronics=getObjects(electronics,'bid','YES');
			others=getObjects(others,'bid','YES');
			callback(books,electronics,others);
			break;
		case 'no_bid':
			books=getObjects(books,'bid','NO');
			electronics=getObjects(electronics,'bid','NO');
			others=getObjects(others,'bid','NO');
			callback(books,electronics,others);
			break;
		default:
			callback(books,electronics,others);
			break;
	}
}

//////////////////////////////////////////////
exports.getAdvertisement=function(id,callback){
	Advertisement.findOne({_id:id},function(err,advertisement){
		if(err)
			console.log(err);
		callback(advertisement);
	});
}
exports.getAdvertisementByUser=function(user_id,callback){
	Advertisement.find({user_id:user_id},function(err,advertisements){
		callback(advertisements);
	});
}


exports.getAdCategoryLink=function(advertisement){
	var link;
	switch(advertisement.category){
		case 'Book':
			link='/api/view/books';
			break;
		case 'Electronics':
			link='/api/view/electronics';
			break;
		case 'Other':
			link='/api/view/others';
			break;	
	}
	return link;
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

exports.addToRecentlyViewed=function(advertisement,callback){
	RecentlyViewed.findOne({_id:advertisement._id},function(err,result){
		if(result===null){
			var recent=new RecentlyViewed(advertisement);
			recent.ad_id=advertisement._id;
			recent.updatedAt=Date.now();
			recent.save();
		}
		else{
			result.updatedAt=Date.now();
			result.save();
		}
		callback();
	});
	
	
}

exports.addRating=function(user_id,input,callback){
	//also check if rating already done
	Rating.findOne({$and:[{user_id:user_id},{ad_id:input.ad_id}]},function(err,result){
		if(result===null){
		var rating=new Rating(input);
		rating.user_id=user_id;
		rating.save(function(err){
			setAggregateRating(input.ad_id,function(){
				callback();
			});
		});
		}
		else{
			result.rating=input.rating;
			result.save(function(err){
				setAggregateRating(input.ad_id,function(){
					callback();
				});
			});
		}
	});
	
}

exports.getPreviousRating=function(user_id,ad_id,callback){
	var rating;
	Rating.findOne({user_id:user_id,ad_id:ad_id},function(err,result){
		if(result===null){
			rating=0;
		}
		else{
			rating=result.rating;
		}
		callback(rating);
	});
}

exports.getRating=function(ad_id,callback){
	var rating={};
	Rating.aggregate([{$match:{ad_id:ad_id}},{$group:{ _id: '$ad_id',average:{$avg: '$rating'},count:{$sum:1}}}],function(err,result){	
		
		if(result.length===0){
			rating.average=0;
			rating.count=0;
		}
		else{
			rating=result[0];
		}
		callback(rating);

	});
}

exports.addBid=function(user_info,input,callback){
	var bid=new Bid(input);
	bid.user_id=user_info.user_id;
	bid.user_name=user_info.name;
	bid.user_type=user_info.user_type;
	bid.createdAt=timestamp.getTime();
	bid.save();
	callback();
}

exports.getBids=function(ad_id,callback){
	Bid.find({ad_id:ad_id}, null, { sort: {'amount': -1}}).exec(function(err, bids) {
		callback(bids);
	 });
}

exports.addComment=function(user_info,input,callback){
	var comment=new Comment(input);
	comment.user_id=user_info.user_id;
	comment.user_name=user_info.name;
	comment.user_type=user_info.user_type;
	comment.createdAt=timestamp.getTime();
	comment.save();
	callback();
}

exports.getComments=function(ad_id,callback){
	Comment.find({ad_id:ad_id}, null, { sort: {'_id': -1}}).exec(function(err, comments) {
		callback(comments);
	 });
}

exports.getPingStatus=function(user_id,ad_id,callback){
	var status;
	Ping.findOne({user_id:user_id,ad_id:ad_id},function(err,ping){
		if(ping===null)
			status='available';
		else
			status='unavailable';
		callback(status);
	});
}

exports.addPingsToAdvertisements=function(advertisements,callback){
	var ad_ids=convertIdsToArray(advertisements);
	
	Ping.find({ad_id:{$in:ad_ids}},null,{sort:{'_id':1}},function(err,pings){
		var ads=advertisements;
		for (var i =0;i<ads.length;i++) {
			ads[i].pings=[];
		}
		for (var i =0;i<pings.length;i++) {
			ads[findIndexByKeyValue(ads,'_id',pings[i].ad_id)].pings.push(pings[i]);
		}
		callback(ads);
	});

}