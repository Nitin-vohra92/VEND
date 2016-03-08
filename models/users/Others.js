var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var otherModel=new Schema({ 
	firstname:{
		type: String,
		trim: true
	},
	lastname:{
		type: String,
		trim: true
	},
	email:{
		type: String
	},
	profile_pic:{
		type: String,
		default:'/images/image_placeholder.png'
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
module.exports=mongoose.model('Other',otherModel);