var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var notificationModel=new Schema({ 
	user_id:{
		type: String,
		trim: true
	},
	read:{
		type:Number,
		default:0
	},
	notification_desc:{
		type:String
	},
	notification_ad_name:{
		type:String
	},
	notification_ad_link:{
		type:String
	},
	notification_user_name:{
		type:String
	},
	notification_user_link:{
		type:String
	},
	createdAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('Notification',notificationModel);