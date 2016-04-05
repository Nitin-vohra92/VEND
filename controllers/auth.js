
var userFunctions=require("./functions/user");
var Account=require('../models/Account');


exports.login=function(req,res){
	var input=req.body;
	var response={};
	//first find in accounts table
	Account.findOne({username:input.username},function(err,account){
		if(err)
			console.log(err);
		else{
			//if not found
			if(account===null){
				var error="Account Not found!!";
				response.error=error;
				res.render('login',{response:response});
			}
			//if found
			else{
				if(account.password===input.password){
					//find name of type and then accordingly search for details in respective tables
					
						userFunctions.setSession(req,account);
						res.redirect('/');
						
					
	 			}
				else{

				var error="Incorrect password!!";
				response.error=error;
				res.render('login',{response:response});
				}
			}
		}
	});
	 
}

exports.loggedIn=function(req,res,next){
	if (req.session.user_id===undefined) {
        userFunctions.sendToLogin(res);
    } else {
        next();
    }
}

exports.logout=function(req,res){
	req.session.destroy(function(err) {
  			// cannot access session here
	});
	res.redirect('/');	 
}

exports.validateGetRequest=function(req,res,next){
	var query=req.query[0];
	query=Object.keys(req.query)[0];
	if(query!=='id'&&query!=='sort'){
		res.json({message:"Invalid request!!"});
	}
	else
		next();
}