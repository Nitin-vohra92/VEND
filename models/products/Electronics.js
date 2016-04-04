var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../../controllers/functions/timestamp');

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
		type: String,
		default:timestamp.getTime()
	},
	updatedAt:{
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('Electronics',productModel);