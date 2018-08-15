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
