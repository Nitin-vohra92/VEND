var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../controllers/functions/timestamp');

var accountModel=new Schema({ 
	username:{
		type: String,
		unique: true,
		index: true
	},
	password:{
		type: String
	},
	name:{
		type: String,
		index: true
	},
	profile_pic:{
		type:String
	},
	user_id:{
		type: String
	},
	type:{
		type: String
	},
	createdAt:{
		type: String,
		default:timestamp.getTime()
	}
	
});
module.exports=mongoose.model('Account',accountModel);