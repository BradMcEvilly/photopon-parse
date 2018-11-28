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


ParseClient.createUserFromContactInfo= function(contactInfo){

    console.log('--------------');
	console.log('ParseClient.createUserFromContactInfo... BEGIN');
    console.log('--------------');

    var promise = new Parse.Promise();
    var user = new Parse.User();
    user.set("username", contactInfo.name);
    user.set("password", "somerandompassword");
    user.set("phone", contactInfo.phone);

    try {
        user.signUp().then(function(result){
			console.log('--------------');
			console.log('user.signup result:', result);
			console.log('--------------');
			promise.resolve(result);
		}, function(error){
			console.log('--------------');
			console.error("Error signing up contact... Error: " + error);
			console.log('--------------');
			promise.error(error);
		});

    } catch (error) {
        console.error("CATCH Error signing up contact... Error: " + error);
        promise.error(error);
    }

    console.log('--------------');
    console.log('ParseClient.createUserFromContactInfo... END');
    console.log('--------------');

	return promise;




	//
    // var promise = new Parse.Promise();
    // var PhotoponUser = Parse.Object.extend("User");
    // var query = new Parse.Query(PhotoponUser);
    // query.equalTo("objectId",userId);
    // query.first().then(function(result){
    //     if(result){
    //         // If result was defined, the object with this objectID was found
    //         promise.resolve(result);
    //     } else {
    //         console.log("User ID: " + userId + " was not found");
    //         promise.resolve(null);
    //     }
    // }, function(error){
    //     console.error("Error searching for User with id: " + userId + " Error: " + error);
    //     promise.error(error);
    // });
	//
    // return promise;

}

ParseClient.getUser = function(userId) {
    var promise = new Parse.Promise();

    var PhotoponUser = Parse.Object.extend("User");
    var query = new Parse.Query(PhotoponUser);
    query.equalTo("objectId",userId);
    query.first().then(function(result){
        if(result){
            // If result was defined, the object with this objectID was found
            promise.resolve(result);
        } else {
            console.log("User ID: " + userId + " was not found");
            promise.resolve(null);
        }
    }, function(error){
        console.error("Error searching for User with id: " + userId + " Error: " + error);
        promise.error(error);
    });

    return promise;
}

ParseClient.getUserWithPhone = function(phone) {
    var promise = new Parse.Promise();

    var PhotoponUser = Parse.Object.extend("User");
    var query = new Parse.Query(PhotoponUser);
    query.equalTo("phone",phone);
    query.first().then(function(result){
        if(result){
            // If result was defined, the object with this objectID was found
            promise.resolve(result);
        } else {
            console.log("User ID: " + userId + " was not found");
            promise.resolve(null);
        }
    }, function(error){
        console.error("Error searching for User with id: " + userId + " Error: " + error);
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
};

Parse.Cloud.define("getUserSessionToken", function(request, response) {

    //Parse.Cloud.useMasterKey();

    var phoneNumber = request.params.phoneNumber;
    console.log(phoneNumber);

    var query = new Parse.Query(Parse.User);
    query.equalTo("phone", phoneNumber);
    query.limit(1);

    var password = "somerandompassword";

    query.first({useMasterKey: true}).then(function(user) {
	    user.set("password", password);
	    console.log('getUserSessionToken	query.first...');
	    return user.save(null, {useMasterKey: true});
	}).then(function(user){
		console.log('**');
        console.log('**');

		console.log('getUserSessionToken	.then...');
        console.log('logIn');
        console.log('**');
        console.log('**');
	    return Parse.User.logIn(user.get("username"), password);
	}).then(function(user){
        console.log('**');
        console.log('**');
        console.log('getUserSessionToken	.then...');
        console.log('response.success');
        console.log('**');
        console.log('**');
        console.log(user);
        ParseClient.updateUndefinedFriendsWithUser(user);
	    response.success(user.getSessionToken());

	}).fail(function() {
        console.log('**');
        console.log('**');
        console.log('getUserSessionToken	FAILED');
        console.log('**');
        console.log('**');
        response.error(arguments);
	});


});

Parse.Cloud.define("getMerchantRequests", function(request, response) {

		var query = new Parse.Query("MerchantRequests");
		query.include("user");

			query.find({useMasterKey: true}).then(function(results) {

				response.success(results);
			}).catch(function(error) {
				response.error(new Error('Failed to get merchant requests'));
			});


});


Parse.Cloud.define("getMerchants", function(request, response) {

		var query = new Parse.Query("Company");
		query.include("merchant");

			query.find({useMasterKey: true}).then(function(results) {

				response.success(results);
			}).catch(function(error) {
				response.error(new Error('Failed to get merchant'));
			});


});



Parse.Cloud.define("resetPhotoponUserClient", function(request, response) {

    //Parse.Cloud.useMasterKey();

   var file = fs.readFileSync("/app/template/password_reset_email.html", "utf8");
   var template = _.template(file);



    var email = request.params.email;

    request.log.info(email);

    var query = new Parse.Query(Parse.User);
    query.equalTo("email", email);
    query.limit(1);

    query.first({useMasterKey: true}).then(function(user) {
	   var password  = Math.random().toString(36).slice(-8);

	   // test change
	   user.set("password",password);
	   user.set("isTempPassword",true);
	   user.save(null, {
					useMasterKey: true,
					success: function(user) {

					},
					error: function(user, error) {

					}
				});


       request.log.info(password);


	   var mailOptions = {
				from: '"Photopon" <noreply@photopon.com>',
				subject: 'Reset Password',
				html: template({name:user.get("username"),password: password })
		};
		mailOptions.to = user.get('email');
		mailOptions.bcc = "brad.mcevilly@gmail.com";
	   transporter.sendMail(mailOptions, (error, info) => {});

	   response.success("");

	}).catch(function(error){
		request.log.info(pretty(error));
        response.error("User does't exist.");

	});


});


Parse.Cloud.define("validateEmailClient", function(request, response) {

   request.log.info("run function");

    var token = request.params.token;

   	if(!token){
   		response.error("Invalid Token");
   	}else{
		var query = new Parse.Query(Parse.User);
		query.equalTo("emailValidationToken", token);
		query.limit(1);
		query.first({useMasterKey: true}).then(function(u) {
		   if(u){
			   u.set("emailValidationToken",null);
			   u.set("emailVerified",true);
			   u.save(null, {useMasterKey: true}).then(function(user) {
								 response.success("");
								 }).catch(function(error) {
									response.error("Invalid Token");
								});

			}else{
				response.error("Invalid Token");
			}
		}).catch(function(error){
			response.error("Invalid Token");
		});

   	}




});


Parse.Cloud.define("GetMerchantPhotopons", function(request, response) {

    //Parse.Cloud.useMasterKey();

    var merchantId = request.params.merchantId;

    var data = {
    	redeems: [],
    	shares: []
    };

    var query = new Parse.Query("Notifications");
    query.include("assocPhotopon");
    query.include("assocPhotopon.coupon");
    query.include("assocPhotopon.creator");

    query.each(function(notification) {
    	var type = notification.get("type");
    	var p = notification.get("assocPhotopon");

    	if (p && (type == "REDEEMED") && (data.redeems.length < 5)) {
    		var c = p.get("coupon");
    		if (c.get("owner").id == merchantId) {
    			data.redeems.push(p);
    		}
    	}

    	if (p && (type == "PHOTOPON") && (data.shares.length < 5)) {
    		var c = p.get("coupon");
    		if (c.get("owner").id == merchantId) {
    			data.shares.push(p);
    		}
    	}

    	if ((data.redeems.length >= 5) && (data.shares.length >= 5)) {
    		response.success(data);
    	}

    }, {
    	useMasterKey: true,
    	success: function() {
            response.success(data);
        },
        error: function(error) {
            response.error(error.description);
        }
    });

});



Parse.Cloud.define("UserStats", function(request, response) {

    //Parse.Cloud.useMasterKey();

    var query = new Parse.Query(Parse.User);

    var stats = {
		merchants: 0,
		activeMerchants: 0,
		consumers: 0,
		activeConsumers: 0,
		all: 0,
		todaysSignup: 0
	};

    query.each(function(user) {

		stats.all++;

		var isMerchant = user.get("isMerchant");
		var lastLogin = user.get("lastLogin");
		var createdAt = user.get("createdAt");

		var isRecent = false;

		if (lastLogin) {
			isRecent = ((new Date()).getTime() - lastLogin.getTime()) <= 24 * 60 * 60 * 1000;
		}

		var createdToday = ((new Date()).getTime() - createdAt.getTime()) <= 24 * 60 * 60 * 1000;

		var d = ( (new Date()).getTime() - createdAt.getTime() ) / (24 * 60 * 60 * 1000);

		console.log(user.get("username") + " " + d);
		//console.log((new Date()).getTime());
		//console.log(createdAt.getTime());

		if (createdToday) {
			stats.todaysSignup++;
		}

		if (isMerchant) {
			stats.merchants++;

			if (isRecent) {
				stats.activeMerchants++;
			}
		} else {
			stats.consumers++;

			if (isRecent) {
				stats.activeConsumers++;
			}
		}

    }, {
    	useMasterKey: true,
    	success: function() {
            response.success(stats);
        },
        error: function(error) {
            response.error(error.description);
        }
    });

});

Parse.Cloud.job("DailyStatSummary", function(request, status) {

    try{
		Parse.Cloud.useMasterKey();

		status.message("I just started");

		request.log.info(("test"));

		var promises = [];

		var d = new Date();
		var start = new moment(d);
		start.add(-1,'day');
		start.startOf('day');

		var finish = new moment(start);
		finish.add(1, 'day');


		var newMerchants = new Parse.Query("MerchantRequests");
		newMerchants.greaterThanOrEqualTo("createdAt", start.toDate());
		newMerchants.lessThan("createdAt", finish.toDate());
		//ewMerchants.doesNotExist('parentItem');

		var newMerchantsByRep = new Parse.Query("MerchantRequests");
		newMerchantsByRep.greaterThanOrEqualTo("createdAt", start.toDate());
		newMerchantsByRep.lessThan("createdAt", finish.toDate());
		newMerchantsByRep.exists('promo');
		newMerchantsByRep.select("promo");
		//newMerchantsByRep.distinct("promo");

		var newCoupons = new Parse.Query("Coupon");
		newCoupons.greaterThanOrEqualTo("createdAt", start.toDate());
		newCoupons.lessThan("createdAt", finish.toDate());

		var newPhotopons = new Parse.Query("Photopon");
		newPhotopons.greaterThanOrEqualTo("createdAt", start.toDate());
		newPhotopons.lessThan("createdAt", finish.toDate());


		promises.push(newMerchants.count({useMasterKey: true}));
		promises.push(newMerchantsByRep.distinct("promo",{useMasterKey: true}));
		promises.push(newCoupons.count({useMasterKey: true}));
		promises.push(newPhotopons.count({useMasterKey: true}));


		Parse.Promise.when(promises).then(function(result1) {
			var returnData = {};
			returnData["newMerchants"] = result1[0];
	   		returnData["newMerchantsByRep"] = result1[1].length;
	   		returnData["newCoupons"] = result1[2];
	   		returnData["newPhotopons"] = result1[3];

	   		var file = fs.readFileSync("/app/template/dailyStats.html", "utf8");
	   		var template = _.template(file);


					ParseClient.getSuperUsers().then(function(users){
						if(users){
							for( var i = 0; i<users.length; i++){
								var mailOptions = {
									from: '"Photopon" <noreply@photopon.com>',
									subject: 'Daily Stats '+start.format('ll'),
									html: template({name:users[i].get("username"),date:start.format('ll'), stats:returnData})
								};
								mailOptions.to = users[i].get('email');
                                mailOptions.cc = "drgutkin@gmail.com";
								mailOptions.bcc = "brad.mcevilly@gmail.com";
								transporter.sendMail(mailOptions, (error, info) => {});

							}
						}
					},function(error){
					});



			request.log.info(pretty(returnData));
			status.success(pretty(returnData));

		}, function(error) {
			status.error((error));
		});

	}catch(e){
	  status.error((e));

	}

});


Parse.Cloud.job("RemoveDuplicateZips", function(request, status) {
  //Parse.Cloud.useMasterKey();
  var _ = require("underscore");

  var hashTable = {};

  var testItemsQuery = new Parse.Query("EnabledLocations");

  testItemsQuery.each(function (testItem) {
    var key = testItem.get("zipcode");

    if (key in hashTable) { // this item was seen before, so destroy this
        return testItem.destroy();
    } else { // it is not in the hashTable, so keep it
        hashTable[key] = 1;
    }

  }, {
  	useMasterKey: true
  }).then(function() {
    console.log("Migration completed successfully.");
  }, function(error) {
    console.log("Uh oh, something went wrong.");
  });
});


Parse.Cloud.define("MyCoupons", function(request, response) {
	//Parse.Cloud.useMasterKey();


	var hashTable = {};

	var d = new Date();
	var todaysDate = new Date(d.getTime());

	var myCoupons = new Parse.Query("Coupon");
	myCoupons.include("company");
	myCoupons.equalTo("isActive", true);
	myCoupons.greaterThanOrEqualTo("expiration", todaysDate);


	var myRedeems = new Parse.Query("RedeemedCoupons");
	myRedeems.equalTo("user", request.user);





	myCoupons.find({
		useMasterKey: true,
		success: function (allCoupons) {

			var redeemed = [];

			myRedeems.find({
				useMasterKey: true,
				success: function(redeems) {

					for (var i = 0; i < allCoupons.length; i++) {
						redeemed.push(false);
						var c = allCoupons[i];

						for (var j = 0; j < redeems.length; j++) {
							var r = redeems[j];

							if (r.get("coupon").id == c.id) {
								redeemed[i] = true;
								break;
							}
						}
					}

					response.success({
						coupons: allCoupons,
						redeems: redeemed,
						params: request.params
					});

				},
				error: function(err) {

				}
			});


		},
		error: function() {

		}
	});


});



Parse.Cloud.define("ServerTime", function(request, response) {
	var time = new Date();
	response.success(time.getTime());
});


Parse.Cloud.beforeSave("MerchantRequests", function(request, response) {

		if(!request.object.existed()){


			var promises = [];

			var MerchantRequest = Parse.Object.extend("MerchantRequests");
			var queryMerchantRequest = new Parse.Query(MerchantRequest);
			queryMerchantRequest.equalTo("taxID",request.object.get("taxID"));

			var Company = Parse.Object.extend("Company");
			var queryCompany = new Parse.Query(Company);
			queryCompany.equalTo("taxID",request.object.get("taxID"));

			request.log.info(request.object.get("taxID"));

			promises.push(queryMerchantRequest.first({useMasterKey: true}));
			promises.push(queryCompany.first({useMasterKey: true}));

			Parse.Promise.when(promises).then(function(result) {
				request.log.info(pretty(result));
				if(result[0] ||  result[1]){

					response.error("A company with this EIN already exists");


				}else{

					response.success();
				}


			}).catch(function(error) {


					response.error(error);


			});


		}else{

			response.success();
		}






});


Parse.Cloud.afterSave("MerchantRequests", function(request) {

	if(!request.object.existed()){

			var promocode = request.object.get("promo")
		//if(promocode){
			var Representative = Parse.Object.extend("Representative");
			var query = new Parse.Query(Representative);
			query.equalTo("repID",promocode);
			query.first({ useMasterKey:true }).then(function(representative){



						ParseClient.getSuperUsers().then(function(users){
							if(users){
								for( var i = 0; i<users.length; i++){

								var mailOptions = {
									from: '"Photopon" <noreply@photopon.com>',
									subject: 'New Merchant Request Received',
									text: 'Dear '+users[i].get('username')+',\n\n You just received a new merchant access request from '+request.object.get("businessName")+""+((representative)? " (representative: "+representative.get("firstName")+")":""),
									html: 'Dear '+users[i].get('username')+',<br><br>You just received a new merchant request from <b>'+request.object.get("businessName")+"</b>"+((representative) ? " (representative: "+representative.get("firstName")+")" : "")
								};
									mailOptions.to = users[i].get('email');
									mailOptions.bcc = "brad.mcevilly@gmail.com";
									request.log.info(users[i].get('email'));
									transporter.sendMail(mailOptions, (error, info) => {});
									Parse.Push.send({
										channels: [ "User_"+users[i].id ],
										data: {
											type: "ADMIN",
											notificationId: request.object.id,
											badge: "Increment",
											alert: mailOptions.text,
											title: mailOptions.subject
										}
									}, {
										useMasterKey: true,
										success: function() {

										},
										error: function(error) {
										// Handle error
										}
									});
								}
							}
						}).catch(function(error){
						});

						if(representative){
							request.object.set("isAccepted", true);
							request.object.save(null, {useMasterKey: true});
						}

			}).catch(function(error){
				request.log.info(pretty(error));
			});

				var user = request.object.get("user").fetch({useMasterKey: true}).then(function(u){

				var token =(Math.random()*Math.random()).toString(16).substr(2);

				u.set("emailValidationToken", token);

				u.save(null, {
						useMasterKey: true,
						success: function(user) {

						},
						error: function(user, error) {

						}
					});

				var mailOptions = {
								from: '"Photopon" <noreply@photopon.com>',
								subject: 'Request Received',
								text: 'Dear '+request.object.get('businessName')+',\n\nCongratulations your request has been sent. We will review your request within 24 hours and contact you. \n\nThank you.',
								html: 'Dear '+request.object.get('businessName')+', <br><br>Congratulations your request has been sent. We will review your request within 24 hours and contact you. <br><br>Thank you.'
							};
								mailOptions.to = u.get('email')
								transporter.sendMail(mailOptions, (error, info) => {});



						var mailOptions = {
								from: '"Photopon" <noreply@photopon.com>',
								subject: 'Email Validation',
								text: 'Dear '+request.object.get('businessName')+',\n\nPlease validate your email address by clicking to the following link: http://photopon.co/merchants/admin/#/access/validateEmail/'+token+'. \n\nThank you.',
								html: 'Dear '+request.object.get('businessName')+',<br><br>Please validate your email address by clicking to the following link: <a href="http://photopon.co/merchants/admin/#/access/validateEmail/'+token+'">http://photopon.co/merchants/admin/#/access/validateEmail/'+token+'</a>. <br><br>Thank you.'
							};
								mailOptions.to = u.get('email')
								transporter.sendMail(mailOptions, (error, info) => {});



				});








		//}

	}else{



	if (request.object.get("isAccepted")) {

			var CompanyClass = Parse.Object.extend("Company");
			var company = new CompanyClass();
			company.set("merchant",request.object.get("user"));
			company.set("taxID",request.object.get("taxID"));
			company.set("name", request.object.get("businessName"));
			company.set("image", request.object.get("logo"));
			company.save(null, {useMasterKey: true}).then(function(company){
					var promocode = request.object.get("promo")
					if(promocode){
						var Representative = Parse.Object.extend("Representative");
						var query = new Parse.Query(Representative);
						query.equalTo("repID",promocode);
						query.first({ useMasterKey:true }).then(function(result){
							company.set("rep",result);
							company.save(null, {useMasterKey: true});
						})

					}
					request.object.get("user", {useMasterKey: true}).set("isMerchant", true);
					request.object.get("user", {useMasterKey: true}).save(null,{useMasterKey: true});
					request.object.destroy({useMasterKey: true});

							var user = request.object.get("user").fetch({useMasterKey: true}).then(function(u){

							var mailOptions = {
								from: '"Photopon" <noreply@photopon.com>',
								subject: 'Request Accepted',
								text: 'Dear '+company.get('name')+',\n\nCongratulations your request has been accepted. You can now login. \nhttp://photopon.co/merchants/admin/#/access/signin',
								html: 'Dear '+company.get('name')+', <br><br>Congratulations your request has been accepted. You can now login.<br><a href="http://photopon.co/merchants/admin/#/access/signin">http://photopon.co/merchants/admin/#/access/signin</a>'
							};
								mailOptions.to = u.get('email')
								mailOptions.bcc = "brad.mcevilly@gmail.com";
								transporter.sendMail(mailOptions, (error, info) => {});



				});

			}).catch(function(error){
				request.object.set("isAccepted",false);
				request.object.save(null,{useMasterKey: true});
			});


		}else{



			if(request.object.get("user")){


						var user = request.object.get("user").fetch({useMasterKey: true}).then(function(u){


								var mailOptions = {
									from: '"Photopon" <noreply@photopon.com>',
									subject: 'Request Denied',
									text: 'Dear '+request.object.get('businessName')+',\n\Sorry your request has been denied.',
									html: 'Dear '+request.object.get('businessName')+', <br><br>Sorry your request has been denied.'
								};
									mailOptions.to = u.get('email');
									mailOptions.bcc = "brad.mcevilly@gmail.com";
									transporter.sendMail(mailOptions, (error, info) => {});

								user.destroy({useMasterKey: true}),then(function(){
										request.object.destroy({useMasterKey: true});
								}).catch(function(error){
									request.log.info(pretty(error));
								});




						}).catch(function(error){
							request.object.destroy({useMasterKey: true});

						});





			}else{
				request.object.destroy({useMasterKey: true});
			}
		}

	}

});

Parse.Cloud.afterSave("Coupon", function(request) {
	if(!request.object.existed()){
		var user = request.object.get("owner")
		if(user){
			var MerchantRequests = Parse.Object.extend("MerchantRequests");
			var query = new Parse.Query(MerchantRequests);
			query.equalTo("user",user);
			query.first({ useMasterKey:true }).then(function(result){

				if(result){
					var mailOptions = {
						from: '"Photopon" <noreply@photopon.com>',
						subject: 'New Coupon Added',
						text: ''+result.get("businessName")+' just added a new Coupon',
						html: '<b>'+result.get("businessName")+'</b> just added a new Coupon'
					};
					ParseClient.getSuperUsers().then(function(users){
						if(users){
							for( var i = 0; i<users.length; i++){
								mailOptions.to = users[i].get('email');
								mailOptions.bcc = "brad.mcevilly@gmail.com";
								transporter.sendMail(mailOptions, (error, info) => {});
								Parse.Push.send({
									channels: [ "User_"+users[i].id ],
									data: {
										type: "ADMIN",
										notificationId: request.object.id,
										badge: "Increment",
										alert: mailOptions.text,
										title: mailOptions.subject
									}
								}, {
									useMasterKey: true,
									success: function() {

									},
									error: function(error) {
									// Handle error
									}
								});
							}
						}
					},function(error){
					});
				} else {

				}
			}, function(error){

			});

		}

	}




});

Parse.Cloud.beforeSave("Verifications", function(request, response) {
	var numTried = request.object.get("numTried") || 0;
	request.object.set("numTried", numTried + 1);


	var client = require('twilio')('AC411575f00f763f4fbaf602173db1c518', '8537400eebcb197b068110ffb552df44');


	// Send an SMS message
	client.sendSms({
	    to:'+1' + request.object.get("phoneNumber"),
	    from: '+12015100525',
	    url:'https://demo.twilio.com/welcome/sms/reply/',
	    body: 'Your verification code: ' + request.object.get("code")
	  }, function(err, responseData) {
	    if (err) {
			console.log(err);
			response.success();
	    } else {
			console.log(responseData.from);
			console.log(responseData.body);

    		response.success();
	    }
	  }
	);

    var mailOptions = {
        from: '"Photopon" <noreply@photopon.com>',
        subject: 'Photopon - NEW USER SIGNUP!',
        text: 'Dear Brad & Mike, \n\n A new user signed up in the Photopon App. \n\n Here is his/her mobile number: \n\n'+request.object.get("phoneNumber"),
        html: 'Dear Brad & Mike, <br><br> A new user signed up in the Photopon App. <br><br> Here is his/her mobile number: <br><br><b>'+request.object.get("phoneNumber")
    };
    mailOptions.to = "brad.mcevilly@gmail.com";
    mailOptions.bcc = "drgutkin@gmail.com";
    transporter.sendMail(mailOptions, (error, info) => {});

    response.success("");

    //response.success();
});

Parse.Cloud.beforeSave("Friends", function(request, response) {
	var user1 = request.object.get("user1");
	var user2 = request.object.get("user2");
	var phoneId = request.object.get("phoneId");


    console.log('-----------');
    console.log('-----------');
    console.log('-----------');
	console.log('Friends... request:', request);
    console.log('-----------');
    console.log('-----------');
    console.log('-----------');

    var fship = new Parse.Query("Friends");
	fship.equalTo("user1", user1);

	if (user2) {
		fship.equalTo("user2", user2);
	} else {
		// if no user exists with that phone number, do the following
		//fship.equalTo("phoneId", phoneId);

		console.log('before... 		ParseClient.getUser(user1).then(function(result){');
		console.log('user1 ', user1);
        console.log('user1 = ' + user1);
        ParseClient.getUser(user1.id).then(function(result){
        	console.log('ParseClient.getUser(user1).then(function(result){.... MADE IT');
            if(result){
            	console.log('if(result)...');
                console.log(result.get("phone"));
                var phone = result.get("phone");
				var contactName = request.object.get("name");
                console.log('before...		ParseClient.inviteFriendSMS(phoneId, phone)');



                /* IN PROGRESS.....
                 *
                 *
                 *
                 */

                // create new user given the phone number and contact name
				console.log('-----------');
                console.log('-----------');
                console.log('-----------');
				console.log('user2:', user2);
                console.log('-----------');
                console.log('-----------');
                console.log('-----------');

                ParseClient.createUserFromContactInfo({
					name:contactName,
					phone:phoneId
				}).then(function(result){
					if(result){
						// add friendship
                        console.log('-----------');
                        console.log('-----------');
						console.log('ParseClient.createUserFromContactInfo... then... result:', result);
                        console.log('-----------');
                        console.log('-----------');

                        ship.equalTo("user2", result);

					}
				});

                //ParseClient.inviteFriendSMS(phoneId, phone);

            } else {
                console.log("User with objectId: " + user1.id + " was not found");
            }
        }, function(error){
            console.log("Error: " + error);
        });

	}

	fship.find({
		success: function(objects) {
			if (objects.length > 0) {
				response.error("Friendship already exists");
			} else {
				response.success();
			}
		},
		error: function(error) {
			response.error(error);
		}
	});
});


ParseClient.inviteFriendSMS = function(toPhone, fromPhone){
	console.log('ParseClient.inviteFriendSMS = function(toPhone, fromPhone){');
	console.log('toPhone = ' + toPhone);
	console.log('fromPhone = ' + fromPhone);
    var client = require('twilio')('AC411575f00f763f4fbaf602173db1c518', '8537400eebcb197b068110ffb552df44');
    // Send an SMS message
    client.sendSms({
            to:toPhone,
            from: '+12015100525',
            url:'https://demo.twilio.com/welcome/sms/reply/',
            body: 'Your friend at ' + fromPhone + ' sent you a gift using the Photopon app. To accept, download Photopon and verify your mobile number: https://tinyurl.com/y84z2fvd'
        }, function(err, responseData) {
            if (err) {
                console.log(err);

            } else {

                console.log(responseData.from);
                console.log(responseData.body);


            }
        }
    );
}

Parse.Cloud.beforeSave("Photopon", function(request, response) {

    console.log("Parse.Cloud.beforeSave(Photopon...");

    try {
        console.log("try...");
        var userList = request.object.get("users");

        for (var a = 0; a < userList.length; a++) {
            console.log("a = " + a);
            for (var propName in userList[a]) {
                propValue = userList[a][propName];
                console.log(propName, propValue);
            }
        }
    }catch (e) {
		console.log(e);
    }

    console.log("Photopon::try catch - no errors");

	if(!request.user){

		response.error("User is not defined");
	}else if(!request.object.get("coupon")){

		 response.error("CouponId is required");

	}else{

		var couponID = request.object.get("coupon").id;
		ParseClient.getCoupon(couponID).then(function(coupon){
			if(coupon){
				request.object.set("creator", request.user);
				request.object.set("installationId", request.installationId);

				var groupACL = new Parse.ACL();
				groupACL.setPublicReadAccess(true);
				groupACL.setWriteAccess(request.user, true);
				request.object.setACL(groupACL);

				request.user.set("lastPhotopon", new Date());

				var PerUserShareClass = Parse.Object.extend("PerUserShare");

				var friends = request.object.get("users");
				if(friends){
					for (var i = 0; i < friends.length; i++) {
						var friend = new Parse.User();


						friend.id = friends[i];

						var sh = new PerUserShareClass();

						sh.set("user", request.user);
						sh.set("coupon", request.object.get("coupon"));
						sh.set("friend", friend);

						sh.save(null,{useMasterKey: true});
					}
				}


				request.user.save(null, {
					useMasterKey: true,
					success: function(user) {
						response.success();
					},
					error: function(user, error) {
						response.error();
					}
				});


			}else{

				response.error("Coupon doesn't exist");

			}

		},
		function(error){
			response.error(error);
		});
	}

});


Parse.Cloud.afterSave("Notifications", function(request) {

	var user = request.object.get("to");
	var assocUser = request.object.get("assocUser");

	var notificationType = request.object.get("type");
	var channelName = "User_" + user.id;


	assocUser.fetch({
		success: function(assocUser) {
			console.log(assocUser);
			var photoponId;

			var message = "";
			if (notificationType == "PHOTOPON") {

				message = "User " + assocUser.get("username") + " sent you Photopon!"
				photoponId = request.object.get("assocPhotopon").id;

			} else if (notificationType == "MESSAGE") {
				message = assocUser.get("username") + ": " + request.object.get("content");

			} else if (notificationType == "FRIEND") {
				message = assocUser.get("username") + " added you";

			} else if (notificationType == "ADDWALLET") {
				message = assocUser.get("username") + " saved your Photopon";

			} else if (notificationType == "REDEEMED") {
				message = assocUser.get("username") + " redeemed your Photopon";

			} else if (notificationType == "VIEWED") {
				message = assocUser.get("username") + " viewed your Photopon";

			}


			Parse.Push.send({
				channels: [ channelName ],
				data: {
					type: notificationType,
					notificationId: request.object.id,
					badge: "Increment",
					alert: message
				}
			}, {
				useMasterKey: true,
				success: function() {

				},
				error: function(error) {
				// Handle error
				}
			});


		},
		error: function(error) {
		// Handle error
		}
	});

});


Parse.Cloud.job("CreateBills", function(request, response) {
		var WhenBillsGenerated = function(merchantCouponMap) {
			var numMerchants = Object.keys(merchantCouponMap).length;
			response.success("Generated " + numMerchants + " invoices");
		};


		var GetLastBill = function(id, callback) {

			var user = new Parse.User();
			user.id = id;


			var billQuery = new Parse.Query("Bills");
			billQuery.equalTo("user", user);
			billQuery.descending("generation");

			billQuery.first({
				success: function(object) {
					callback(object);
				},
				error: function(error) {
					callback(null);
				}
			});


		};


		var GenerateBillForMerchant = function(merchantId, coupons, properties, callback) {
			var BillClass = Parse.Object.extend("Bills");

			var centPerShare = properties.centPerShare ? properties.centPerShare : 5;
			var centPerRedeem = properties.centPerRedeem ? properties.centPerRedeem : 25;

			GetLastBill(merchantId, function(lastBill) {

				var totalShares = 0;
				var totalRedeems = 0;

				var minCouponTime = new Date();
				for (var i = 0; i < coupons.length; i++) {

					if (coupons[i].createdAt < minCouponTime) {
						minCouponTime = coupons[i].createdAt;
					}

					totalShares += parseInt(coupons[i].get("numShared") || 0, 10);
					totalRedeems += parseInt(coupons[i].get("numRedeemed") || 0, 10);
				};


				var lastTotalShared = parseInt(lastBill ? (lastBill.get("numShared") || 0) : 0, 10);
				var lastTotalRedeemed = parseInt(lastBill ? (lastBill.get("numRedeemed") || 0) : 0, 10);

				var generation = parseInt(lastBill ? lastBill.get("generation") : 0, 10);

				var currentShared = totalShares - lastTotalShared;
				var currentRedeemed = totalRedeems - lastTotalRedeemed;


				var user = new Parse.User();
				user.id = merchantId;

				var bill = new BillClass();

				bill.set("numShared", totalShares);
				bill.set("numRedeemed", totalRedeems);

				bill.set("currentShares", currentShared);
				bill.set("currentRedeems", currentRedeemed);

				bill.set("centPerShare", centPerShare);
				bill.set("centPerRedeem", centPerRedeem);

				bill.set("previousBillDate", lastBill ? lastBill.createdAt : minCouponTime);

				bill.set("generation", generation + 1);


				bill.set("user", user);



				bill.save(null, {
					success: function(bill) {
						callback();
					},
					error: function(bill, error) {
						throw ("Failed to save object.");
					}
				});
			});


		};

		var WhenCouponsFetched = function(merchantCouponMap, companyProperties) {

			var numMerchantsLeft = Object.keys(merchantCouponMap).length;


			for (var merchantId in merchantCouponMap) {
				GenerateBillForMerchant(merchantId, merchantCouponMap[merchantId], companyProperties[merchantId], function() {
					numMerchantsLeft--;
					if (numMerchantsLeft == 0) {
						WhenBillsGenerated(merchantCouponMap);
					}
				});
			}

		};


		var GetMerchantCoupons = function() {
			var Company = Parse.Object.extend("Company");

			var queryCompany = new Parse.Query(Company);
			queryCompany.include("merchant");

			queryCompany.find({

				success: function(companies) {
					var merchants = {};
					var companyProperties = {};

					for (var i = 0; i < companies.length; i++) {

						var company = companies[i];
						var merchantObject = company.get("merchant");

						var numRequests = companies.length;

						if (!merchantObject) {
							console.log("Error: Merchant not found for company " + company.get("name") + " [" + company.id + "]");

							numRequests = numRequests - 1;

							if (numRequests == 0) {
								WhenCouponsFetched(merchants, companyProperties);
							}
							continue;
						}

						merchants[merchantObject.id] = [];
						companyProperties[merchantObject.id] = {
							centPerShare: company.get("centPerShare"),
							centPerRedeem: company.get("centPerRedeem")
						};


						(function(id) {

							console.log("Getting " + id);

							var user = new Parse.User();
							user.id = id;


							var couponQuery = new Parse.Query("Coupon");
							couponQuery.equalTo("owner", user);
							couponQuery.find({
								success: function(merchantCoupons) {
									numRequests = numRequests - 1;

									for (var j = 0; j < merchantCoupons.length; j++) {
										merchants[id].push(merchantCoupons[j]);
									};

									if (numRequests == 0) {
										WhenCouponsFetched(merchants, companyProperties);
									}

								},
								error: function(error, res) {
									throw error;
								}
							})

						})(merchantObject.id);




					}

				},
				error: function(error) {
					throw ("Error: " + error.code + " " + error.message);
				}
			});
		};



		try {
			GetMerchantCoupons();
		} catch (ex) {
			response.error(ex);
		}




});
