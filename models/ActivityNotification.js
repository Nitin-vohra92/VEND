var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var activityModel=new Schema({ 
	user_id:{
		type: String
	},
	notification:{
		type: String
	}	
});

module.exports=mongoose.model('ActivityNotification',activityModel);