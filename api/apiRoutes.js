var express=require('express');

var router=express.Router();
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
router.route('/user/login').post(user.login);

//logout
router.route('/user/logout').get(user.logout);

//posting a wish
router.route('/user/wish').post(user.wish);

//publishing an advertisement
router.route('/advertisement/publish').post(advertisement.publish);

//editing the advertisement
router.route('/advertisement/publish').get(advertisement.publishpage);

//sending content for home page
router.route('/view/home').get(view.home);

//sending content for advertisement page
//will contain comment and rating

router.route('/view/advertisement').get(view.advertisement);

//for comments of any advertisement view all //for ad page sent via above request
 router.route('/view/advertisement/comment').post(view.comments);

//for commenting on  of any advertisement post
 router.route('/advertisement/comment').post(advertisement.comment);

//for rating on  of any advertisement post
 router.route('/advertisement/rate').post(advertisement.rate);

//for bidding on  of any advertisement post
 router.route('/advertisement/bid').post(advertisement.bid);

//for user activities/history
router.route('/view/user/activities').get(view.activities);

//for user notifications
router.route('/view/user/notifications').get(view.notifications);

//for pinging the seller
router.route('/user/ping').get(user.ping);

//for view books
router.route('/view/products').get(view.products);

//for view books
router.route('/view/books').get(view.books);

//for view electronics
router.route('/view/electronics').get(view.electronics);

//for view other
router.route('/view/others').get(view.others);

//for view more latest
router.route('/view/advertisement/latest').get(view.latest);

//for view more recently viewed
router.route('/view/advertisement/viewed').get(view.viewed);

//for view more recommendation
router.route('/view/advertisement/recommended').get(view.recommended);

//for viewing any user
router.route('/view/user').post(view.user);

//for search page
router.route('/view/search').post(view.search);

module.exports=router;