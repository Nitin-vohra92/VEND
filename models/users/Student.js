var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var studentModel=new Schema({ 
	firstname:{
		type: String,
		trim: true
	},
	lastname:{
		type: String,
		trim: true
	},
	email:{
		type: String,
		trim: true
	},
	profile_pic:{
		type: String,
		default:'/images/image_placeholder.png'
	},
	rollno:{
		type: String,
		default:'Anonymous'
	},
	Degree:{
		type: String
	},
	semester:{
		type: Number
	},
	department:{
		type: String
	},
	contact:{
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
module.exports=mongoose.model('Student',studentModel);