///Custom Functions

function pretty(object) {

	return JSON.stringify(object, null, 2);

}



//EMAIL



var api_key = process.env.MAILGUN_API_KEY;
var domain = process.env.MAILGUN_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var _ = require("underscore");
var moment = require("moment");
const nodemailer = require('nodemailer');
var fs = require('fs');

var transporter = nodemailer.createTransport({
        host: process.env.MAILGUN_SMTP_SERVER,
        port: process.env.MAILGUN_SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user:  process.env.MAILGUN_SMTP_LOGIN, // generated ethereal user
            pass:  process.env.MAILGUN_SMTP_PASSWORD  // generated ethereal password
        }
    });

var MailComposer = require('nodemailer/lib/mail-composer');
 
 
var path = require('path');
var fs = require('fs');
///

ParseClient = {}


ParseClient.getCoupon = function(id){

	var promise = new Parse.Promise();

    var Coupon = Parse.Object.extend("Coupon");
    var query = new Parse.Query(Coupon);
    query.equalTo("objectId",id);
    query.first({useMasterKey: true}).then(function(result){
        if(result){
            // If result was defined, the object with this objectID was found
            promise.resolve(result);
        } else {
            promise.resolve(null);
        }
    }, function(error){
            promise.error(error);
    });

    return promise;
}


ParseClient.getSuperUsers = function(){

	var promise = new Parse.Promise();

    var query = new Parse.Query(Parse.User);
    query.equalTo("isSuperUser",true);
    query.find({useMasterKey: true}).then(function(results){
        if(results && results.length > 0){
            // If result was defined, the object with this objectID was found
            promise.resolve(results);
        } else {
            promise.resolve(null);
        }
    }, function(error){
            promise.error(error);
    });

    return promise;
}

///

require('./functions/get_user_session_token.js');
require('./functions/get_merchant_requests.js');
require('./functions/get_merchants.js');
require('./functions/reset_photopon_user_client.js');
require('./functions/validate_email_client.js');
require('./functions/get_merchant_photopons.js');
require('./functions/user_stats.js');
require('./jobs/daily_stat_summary.js');
require('./jobs/remove_duplicate_zips.js');
require('./functions/my_coupons.js');
require('./functions/server_time.js');
require('./callbacks/merchant_requests_before_save.js');
require('./callbacks/merchant_requests_after_save.js');
require('./callbacks/coupon_after_save.js');
require('./callbacks/verifications_before_save.js');
require('./callbacks/friends_before_save.js');
require('./callbacks/photopon_before_save.js');
require('./callbacks/notifications_after_save.js');
require('./jobs/create_bills.js')
