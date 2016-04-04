var express=require('express');

var router=express.Router();
var auth=require('../controllers/user/auth');
var user=require('../controllers/user/users_controller');
var advertisement=require('../controllers/product/advertisements_controller');


var view=require('../controllers/views_controller');


//please append /api in front
//e.g /api/user/login

//registering a new user
router.route('/user/register').post(user.register);

//sending confirmation again new user
router.route('/user/register').get(user.send_confirmation);

//confirming a new user
router.route('/user/confirm').post(user.confirm);

//sending password to new user
router.route('/user/forgot').post(user.forgot);

//editing info of user
router.route('/user/register').put(user.register);

//login 
router.route('/user/login').post(auth.login);

//logout
router.route('/user/logout').get(auth.logout);

//posting a wish
router.route('/user/wish').post(auth.loggedIn,user.wish);

//publishing an advertisement
router.route('/advertisement/publish').post(auth.loggedIn,advertisement.publish);

//editing the advertisement
router.route('/advertisement/publish').get(auth.loggedIn,advertisement.publishpage);

//sending content for home page
router.route('/view/home').get(view.home);

//sending content for advertisement page
//will contain comment and rating

router.route('/view/advertisement').get(auth.loggedIn,view.advertisement);

//for commenting on  of any advertisement post
 router.route('/advertisement/comment').post(auth.loggedIn,advertisement.comment);

//for rating on  of any advertisement post
 router.route('/advertisement/rate').post(auth.loggedIn,advertisement.rate);

//for bidding on  of any advertisement post
 router.route('/advertisement/bid').post(auth.loggedIn,advertisement.bid);

//for user activities/history
router.route('/view/user/activities').get(auth.loggedIn,view.activities);

//for user notifications
router.route('/view/user/notifications').get(auth.loggedIn,view.notifications);

//for pinging the seller
router.route('/user/ping').post(auth.loggedIn,user.ping);


////////////////////////////////////////////////////////
//add sort query check middle ware
//for view all ads
router.route('/view/products').get(auth.loggedIn,view.products);


//for view books
router.route('/view/books').get(auth.loggedIn,view.books);

//for view electronics
router.route('/view/electronics').get(auth.loggedIn,view.electronics);

//for view other
router.route('/view/others').get(auth.loggedIn,view.others);

//for view more latest
router.route('/view/advertisement/latest').get(auth.loggedIn,view.latest);

//for view more recently viewed
router.route('/view/advertisement/viewed').get(auth.loggedIn,view.viewed);

//for view more recommendation
router.route('/view/advertisement/recommended').get(auth.loggedIn,view.recommended);

//for viewing any user
router.route('/view/user').post(auth.loggedIn,view.user);

//for search page And add sorting option
router.route('/view/search').post(auth.loggedIn,view.search);

module.exports=router;