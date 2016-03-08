var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var wishModel=new Schema({ 
	user_id:{
		type: String,
		trim: true
	},
	user_desc:{
		type:String,
		default:'Anonymous'
	},
	user_type:{
		type:String,
		default:'Anonymous'
	},
	description:{
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
module.exports=mongoose.model('Wish',wishModel);