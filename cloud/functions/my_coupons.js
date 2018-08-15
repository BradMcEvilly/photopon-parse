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