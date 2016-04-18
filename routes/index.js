var express = require('express');
var fs = require('fs');
var router = express.Router();

var auth=require('../controllers/auth');
var view=require('../controllers/views_controller');

var ROUTES=require('./constants');

router.route(ROUTES.HOME).get(view.home);

//login page	
router.route(ROUTES.LOGIN).get(view.login);


//registering a user
router.route(ROUTES.REGISTER).get(view.register);

//confirm
router.route(ROUTES.CONFIRM).get(view.confirm);

//forgot password
router.route(ROUTES.FORGOT).get(view.forgot);


//for viewing any user
router.route(ROUTES.USER).get(auth.loggedIn,view.user);


//for search page And add sorting option
router.route(ROUTES.SEARCH).get(auth.loggedIn,auth.validateGetRequest,view.search);

//for wish page
router.route(ROUTES.WISH).get(auth.loggedIn,auth.validateGetRequest,view.wish);

//for user activities/history
router.route(ROUTES.ACTIVITIES).get(auth.loggedIn,view.activities);

//for user notifications
router.route(ROUTES.NOTIFICATIONS).get(auth.loggedIn,view.notifications);

//your ads page
router.route(ROUTES.YOUR_ADS).get(auth.loggedIn,view.myAdvertisements);

//your wishes page
router.route(ROUTES.WISHES).get(auth.loggedIn,view.myWishes);

//your messages page
router.route(ROUTES.MESSAGES).get(auth.loggedIn,view.messages);

//ad confirmations
router.route(ROUTES.CONFIRMATIONS).get(auth.loggedIn,view.confirmations);

//user subscriptions
router.route(ROUTES.SUBSCRIPTIONS).get(auth.loggedIn,view.subscriptions);

//user settings
router.route(ROUTES.SETTINGS).get(auth.loggedIn,view.settings);


////////////////////////////////////////////////////////////////
////////////////////////ADVERTISEMENTS//////////////////////////
////////////////////////////////////////////////////////////////
//publish an advertisement page	
router.route(ROUTES.PUBLISH).get(auth.loggedIn,view.publish);

//for view all ads
router.route(ROUTES.ADVERTISEMENTS).get(auth.loggedIn,auth.validateGetRequest,view.products);


//for view books
router.route(ROUTES.BOOKS).get(auth.loggedIn,auth.validateGetRequest,view.books);

//for view electronics
router.route(ROUTES.ELECTRONICS).get(auth.loggedIn,auth.validateGetRequest,view.electronics);

//for view other
router.route(ROUTES.OTHERS).get(auth.loggedIn,auth.validateGetRequest,view.others);

//for view more latest
router.route(ROUTES.LATEST).get(auth.loggedIn,auth.validateGetRequest,view.latest);

//for view more recently viewed
router.route(ROUTES.RECENTLY_VIEWED).get(auth.loggedIn,auth.validateGetRequest,view.recent);

//for view more recommendation
router.route(ROUTES.RECOMMENDED).get(auth.loggedIn,auth.validateGetRequest,view.recommended);


//will contain comment and rating

router.route(ROUTES.ADVERTISEMENT).get(auth.loggedIn,auth.validateGetRequest,view.advertisement);

//edit advertisement
router.route(ROUTES.EDIT_ADVERTISEMENT).post(auth.loggedIn,view.editAdvertisement);

//will show closed advertisements and to whom it was sold
router.route(ROUTES.CLOSED_ADVERTISEMENT).get(auth.loggedIn,auth.validateGetRequest,view.closedAdvertisement);



module.exports = router;
