var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../controllers/functions/timestamp');

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
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('Ping',pingModel);