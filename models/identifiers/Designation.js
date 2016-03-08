var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var designationModel=new Schema({ 
	id:{
		type: int,unique: true
	},
	name:{
		type: String,unique: true
	}
});
module.exports=mongoose.model('Designation',designationModel);