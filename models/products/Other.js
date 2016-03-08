var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var productotherModel=new Schema({ 
	brand:{
		type:String,
		default:'Anonymous'
	},
	//to be decided++
	sub_category:{
		type:String,
		default:'Anonymous'
	},
	name:{
		type:String
	},
	images:[{
		path:{
		type: String
	}
	}],
	description:{
		type: String,
		default:'No Desription by Publisher'
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
module.exports=mongoose.model('ProductOther',productotherModel);