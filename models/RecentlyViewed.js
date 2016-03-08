var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var recentViewedModel=new Schema({ 
	ad_id:{
		type: String,
		trim: true
	},
	user_id:{
		type: String
	},
	user_desc:{
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
	location:{
		type: String
	},
	price:{
		type: String
	},
	thumb:{
		type: String
	},
	description:{
		type: String
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
module.exports=mongoose.model('RecentView',recentViewedModel);