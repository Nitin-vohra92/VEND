var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../controllers/functions/timestamp');

var commentModel=new Schema({ 
	ad_id:{
		type: String
	},
	user_id:{
		type: String,
		trim: true
	},
	user_name:{
		type:String
	},
	user_type:{
		type:String
	},
	comment:{
		type: String
	},
	createdAt:{
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('Comment',commentModel);