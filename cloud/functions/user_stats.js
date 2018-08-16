Parse.Cloud.define("UserStats", function(request, response) {
  var stats = {
    merchants: 0,
    activeMerchants: 0,
    consumers: 0,
    activeConsumers: 0,
    all: 0,
    todaysSignup: 0
  };

  var query = new Parse.Query(Parse.User);
  query.each(function(user) {
    stats.all++;

    var isMerchant = user.get("isMerchant");
    var lastLogin = user.get("lastLogin");
    var createdAt = user.get("createdAt");
    var isRecent = Utils.isWithinOneDay(lastLogin);
    var createdToday = Utils.usWithinOneDay(createdAt);
    var d = Utils.daysSince(createdAt);

    console.log("[USER STATS] "+user.get("username") + " " + d);

    if (createdToday) { stats.todaysSignup++; }

    if (isMerchant) {
      stats.merchants++;
      if (isRecent) { stats.activeMerchants++; }
    } else {
      stats.consumers++;
      if (isRecent) { stats.activeConsumers++; }
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
