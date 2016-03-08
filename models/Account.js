var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

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
	}
	
});
module.exports=mongoose.model('Account',accountModel);