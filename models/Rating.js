var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var rateModel=new Schema({ 
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
	user_type:{
		type:String,
		default:'Anonymous'
	},
	rating:{
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
module.exports=mongoose.model('Rating',rateModel);