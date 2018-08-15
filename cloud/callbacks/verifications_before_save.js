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

    //response.success();
});