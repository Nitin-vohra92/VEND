var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var bookModel=new Schema({ 
	title:{
		type: String
	},
	author:{
		type: String,
		default:'Anonymous'
	},
	semester:{
		type:Number
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
module.exports=mongoose.model('Book',bookModel);
