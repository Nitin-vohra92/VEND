var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var activityModel=new Schema({ 
	user_id:{
		type: String,
		trim: true
	},
	user_name:{
		type:String,
		default:'Anonymous'
	},
	activity:{
		type: String
	},
	createdAt:{
		type: Date,
		default:Date.now
	},
	updatedAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('Activity',activityModel);