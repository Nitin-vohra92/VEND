var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var recommendationModel=new Schema({
	user_id:{
		type: String,
		trim: true
	},
	view_tags:[String],//for tags based on view
	search_tags:[String]//tags based on search

});
module.exports=mongoose.model('Recommendation',recommendationModel);