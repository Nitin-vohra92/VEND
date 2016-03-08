var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var departmentModel=new Schema({ 
	id:{
		type: Number,
		unique: true
	},
	name:{
		type: String,
		unique: true
	}
});
module.exports=mongoose.model('Department',departmentModel);