var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var advertisementModel=new Schema({ 
	ad_id:{
		type: String,
		trim: true
	},
	user_id:{
		type: String,
		trim: true
	},
	user_desc:{
		type:String,
		default:'Anonymous'
	},
	user_type:{
		type:String,
		default:'Anonymous'
	},
	product_id:{
			type: String
	},
	category:{
		type: String
	},
	kind:{
		type: String
	},
	price:{
		type: String
	},
	thumb:{
		type: String
	},
	description:{
		type: String,
		default:'No Description by Publisher.'
	},
	createdAt:{
		type: Date,
		default:Date.now
	},
	updatedAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('Advertisement',advertisementModel);