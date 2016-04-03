var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

var timestamp=require('../../controllers/functions/timestamp');
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
		type: String,
		default:timestamp.getTime()
	},
	updatedAt:{
		type: String,
		default:timestamp.getTime()
	}
});
module.exports=mongoose.model('Book',bookModel);
