var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var bidModel=new Schema({ 
	ad_id:{
		type: String
	},
	user_id:{
		type: String,
		trim: true
	},
	user_desc:{
		type:String,
		default:'Anonymous'
	},
	ad_id:{
		type:String
	},
	user_type:{
		type:String
	},
	amount:{
		type: String,
		default:"0"
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
module.exports=mongoose.model('Bid',bidModel);