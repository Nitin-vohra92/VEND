var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var notificationModel=new Schema({ 
	to_id:{
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
	read:{
		type:Number,
		default:0
	},
	desc:{
		type:String
	},
	product_name:{
		type:Number,
		default:0
	},
	createdAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('Notification',notificationModel);