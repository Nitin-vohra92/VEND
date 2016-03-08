var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var teacherModel=new Schema({ 
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
		unique: true,
		trim: true
	},
	profile_pic:{
		type: String,
		default:'/images/image_placeholder.png'
	},
	designation:{
		type: String
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
module.exports=mongoose.model('Teacher',teacherModel);