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
	user_name:{
		type:String
	},
	user_type:{
		type:String
	},
	amount:{
		type: Number,
		default:0
	},
	createdAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('Bid',bidModel);