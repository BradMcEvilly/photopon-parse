Parse.Cloud.define("ServerTime", function(request, response) {
  var time = new Date();
  response.success(time.getTime());
});
