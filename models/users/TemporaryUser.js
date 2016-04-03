var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../../controllers/functions/timestamp');

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
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('TemporaryUser',temporaryUserModel);