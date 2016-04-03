var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../controllers/functions/timestamp');

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
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('Activity',activityModel);