var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var temporaryUserModel=new Schema({ 
	temp_id:{
		type: String
	},
	user_description:{
		type: String
	},
	image_path:{
		type:String,
		default:'/images/image_placeholder.png'
	},
	token:{
		type: Number
	},
	createdAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('TemporaryUser',temporaryUserModel);