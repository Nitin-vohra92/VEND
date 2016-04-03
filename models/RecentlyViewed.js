var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../controllers/functions/timestamp');

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
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('RecentView',recentViewedModel);