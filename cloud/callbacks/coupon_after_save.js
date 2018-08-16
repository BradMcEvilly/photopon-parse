var logger = require('parse-server').logger;

Parse.Cloud.afterSave("Coupon", function(request) {
  if(!request.object.existed()){
    var user = request.object.get("owner")
    if(!user) { return; }

    // Why are we doing this?
    // if there is a MerchantRequest for the user,
    // then send an email to each SuperUser.
    // TODO: Maybe it should be getting the Company instead of the MerchantRequest?
    var MerchantRequests = Parse.Object.extend("MerchantRequests");
    var query = new Parse.Query(MerchantRequests);
    query.equalTo("user",user);
    query.first({ useMasterKey:true }).then(function(result){
      if(result){
        var mailOptions = {
          from: '"Photopon" <noreply@photopon.com>', 
          subject: 'New Coupon Added',
          text: ''+result.get("businessName")+' just added a new Coupon',
          html: '<b>'+result.get("businessName")+'</b> just added a new Coupon',
          bcc: "david@ezrdv.org"
        };
        ParseClient.eachSuperUser(function(user){
          mailOptions.to = user.get('email');
          Mailer.send(mailOptions);

          Parse.Push.send({
            channels: [ "User_"+user.id ],
            data: {
              type: "ADMIN",
              notificationId: request.object.id,
              badge: "Increment",
              alert: mailOptions.text,
              title: mailOptions.subject
            }
          }, {
            useMasterKey: true,
            success: function() {},
            error: function(error) {}
          });
        });
      }
    }, function(error){
      logger.error("[COUPON ERROR] "+Utils.pretty(error));
    });
  }
});
