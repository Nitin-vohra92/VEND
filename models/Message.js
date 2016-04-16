var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var messageModel=new Schema({ 
	from_user_id:{
		type: String
	},
	from_user_name:{
		type: String
	},
	to_user_id:{
		type:String
	},
	to_user_name:{
		type:String
	},
	message:{
		type: String
	},
	read:{
		type: String,
		default:0
	},
	createdAt:{
		type: String,
		default:Date.now()
	}
});
module.exports=mongoose.model('Message',messageModel);