var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var pingModel=new Schema({ 
	ping_user_id:{
		type: String
	},
	ad_id:{
		type: String
	},
	ad_name:{
		type:String
	},
	ad_kind:{
		type:String
	},
	ad_category:{
		type:String
	},
	user_id:{
		type: String,
		trim: true
	},
	user_name:{
		type:String
	},
	user_type:{
		type:String
	},
	createdAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('Ping',pingModel);