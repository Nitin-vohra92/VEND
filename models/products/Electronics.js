var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var productModel=new Schema({ 
	brand:{
		type:String,	
		default:'Anonymous'
	},
	//to be specified 
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
	createdAt:{
		type: Date,
		default:Date.now
	},
	updatedAt:{
		type: Date,
		default:Date.now
	}
});
module.exports=mongoose.model('Electronics',productModel);