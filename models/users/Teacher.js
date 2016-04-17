var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../../controllers/functions/timestamp');

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
		trim: true
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
		type: String,
		default:timestamp.getTime()
	},
	updatedAt:{
		type: String,
		default:timestamp.getTime()
	}
	
});
module.exports=mongoose.model('Teacher',teacherModel);