var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var userTypeModel=new Schema({ 
	id:{
		type: Number,
		unique: true
	},
	name:{
		type: String,
		unique: true
	}
	
});
module.exports=mongoose.model('UserType',userTypeModel);