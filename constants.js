//check for errors and change routes if names contradict

//related to advertisements
/////////////////////////////////////////////
//view get requests
exports.ADVERTISEMENT='/api/view/advertisement?id=';
exports.ADVERTISEMENTS='/api/view/advertisements';
exports.BOOKS='/api/view/books';
exports.ELECTRONICS='/api/view/books';
exports.OTHERS='/api/view/books';
exports.PUBLISH_PAGE='/api/view/publish';

//post requests


/////////////////////////////////////////////

//related to user
/////////////////////////////////////////////
//view get requests
exports.HOME='/api/view/home';
exports.USER='/api/view/user?id=';
exports.REGISTER_PAGE='/register';
exports.YOUR_ADS='/api/view/user/advertisements';

//post requests
exports.REGISTER='/api/user/register';
exports.LOGIN='/api/user/login';
exports.PUBLISH='/api/advertisement/publish';
exports.PING='/api/user/ping';

/////////////////////////////////////////////