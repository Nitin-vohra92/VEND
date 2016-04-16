var express=require('express');

var router=express.Router();
var auth=require('../controllers/auth');
var user=require('../controllers/user/users_controller');
var advertisement=require('../controllers/product/advertisements_controller');


var view=require('../controllers/views_controller');


//please append /api in front
//e.g /api/user/login

//registering a new user
router.route('/user/register').post(user.register);

//sending confirmation again new user
router.route('/user/confirm_again').get(user.send_confirmation);

//confirming a new user
router.route('/user/confirm').post(user.confirm);

//sending password to new user
router.route('/user/forgot').post(user.forgot);

//login 
router.route('/user/login').post(auth.login);

//logout
router.route('/user/logout').get(auth.logout);

//posting a wish
router.route('/user/wish').post(auth.loggedIn,user.wish);

//posting a wish
router.route('/user/wish/delete').post(auth.loggedIn,user.deleteWish);


//publishing an advertisement
router.route('/advertisement/publish').post(auth.loggedIn,advertisement.publish);


//editing the advertisement
router.route('/advertisement/edit').post(auth.loggedIn,advertisement.edit);

//deleting the advertisement
router.route('/advertisement/delete').post(auth.loggedIn,advertisement.delete);


//for commenting on  of any advertisement post
 router.route('/advertisement/comment').post(auth.loggedIn,advertisement.comment);

//for rating on  of any advertisement post
 router.route('/advertisement/rate').post(auth.loggedIn,advertisement.rate);

//for bidding on  of any advertisement post
 router.route('/advertisement/bid').post(auth.loggedIn,advertisement.bid);




//for pinging the seller
router.route('/user/ping').post(auth.loggedIn,user.ping);

//for confirm ping request
router.route('/user/ping/confirm').post(auth.loggedIn,advertisement.confirmPing);

//for messaging user
router.route('/user/message').post(auth.loggedIn,user.message);

router.route('/user/reply').post(auth.loggedIn,user.reply);

//subscribing a user
router.route('/user/subscribe').post(auth.loggedIn,user.subscribe);

//unsubscribe from subscriptions
router.route('/user/unsubscribe').post(auth.loggedIn,user.unsubscribe);

//unsubscribe from profile page
router.route('/user/unsubscribe_profile').post(auth.loggedIn,user.unsubscribe_profile);

module.exports=router;