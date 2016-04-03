var mongoose=require('mongoose'),
	Schema=mongoose.Schema;
var timestamp=require('../../controllers/functions/timestamp');

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
	createdAt:{
		type: String,
		default:timestamp.getTime()
	},
	updatedAt:{
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('ProductOther',productotherModel);