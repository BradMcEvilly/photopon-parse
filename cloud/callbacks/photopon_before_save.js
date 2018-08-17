Parse.Cloud.beforeSave("Photopon", function(request, response) {
  
  

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
