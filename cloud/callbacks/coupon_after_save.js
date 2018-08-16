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
                mailOptions.bcc = "david@ezrdv.org";
                Mailer.send(mailOptions);
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
