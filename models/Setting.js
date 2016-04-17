var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var settingModel=new Schema({
	user_id:{
		type: String
	},
	email:{
		type: String,
		default:'No'
	},
	phone:{
		type: String,
		default:'No'
	}	
});
module.exports=mongoose.model('Setting',settingModel);