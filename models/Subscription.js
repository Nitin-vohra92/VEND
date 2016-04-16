var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var subscriptionModel=new Schema({
	subscriber_user_id:{
		type: String,
		trim: true
	},
	subscriber_user_name:{
		type:String
	},
	subscribed_user_id:{
		type: String,
		trim: true
	},
	subscribed_user_name:{
		type:String
	},
	createdAt:{
		type: String,
		default:Date.now()
	}
});
module.exports=mongoose.model('Subscription',subscriptionModel);