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