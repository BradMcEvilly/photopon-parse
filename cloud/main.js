//  ____  _           _
// |  _ \| |__   ___ | |_ ___  _ __   ___  _ __
// | |_) | '_ \ / _ \| __/ _ \| '_ \ / _ \| '_ \
// |  __/| | | | (_) | || (_) | |_) | (_) | | | |
// |_|   |_| |_|\___/ \__\___/| .__/ \___/|_| |_|
//  ____                      |_|___ _                 _
// |  _ \ __ _ _ __ ___  ___   / ___| | ___  _   _  __| |
// | |_) / _` | '__/ __|/ _ \ | |   | |/ _ \| | | |/ _` |
// |  __/ (_| | |  \__ \  __/ | |___| | (_) | |_| | (_| |
// |_|   \__,_|_|  |___/\___|  \____|_|\___/ \__,_|\__,_|


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

require("./utils.js");
///

ParseClient = {}

ParseClient.getCoupon = function(id){
	var promise = new Parse.Promise();

  var Coupon = Parse.Object.extend("Coupon");
  var query = new Parse.Query(Coupon);
  query.equalTo("objectId",id);
  query.first({useMasterKey: true}).then(function(result){
    if(result){
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


_(['callbacks','functions','jobs']).each(function(folder){
  var dir = path.join(__dirname,folder);
  _(fs.readdirSync(dir)).each(function(file){
    require(path.join(dir, file));
  })
});
