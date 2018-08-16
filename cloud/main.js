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

var _ = require("underscore");
var moment = require("moment");
var fs = require('fs');
var path = require('path');

require("./utils.js");
require("./mailer.js");

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

_(['callbacks','functions','jobs']).each(function(folder){
  var dir = path.join(__dirname,folder);
  _(fs.readdirSync(dir)).each(function(file){
    require(path.join(dir, file));
  })
});
