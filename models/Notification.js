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
	notification:{
		type:String
	},
	createdAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('Notification',notificationModel);