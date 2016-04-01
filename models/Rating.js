var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var rateModel=new Schema({ 
	ad_id:{
		type: String
	},
	user_id:{
		type: String,
		trim: true
	},
	rating:{
		type: String
	}
});
module.exports=mongoose.model('Rating',rateModel);