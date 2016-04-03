var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../controllers/functions/timestamp');

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
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('Notification',notificationModel);