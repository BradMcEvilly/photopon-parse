Parse.Cloud.define("getMerchants", function(request, response) {
  var query = new Parse.Query("Company");
  query.include("merchant");

  query.find({useMasterKey: true}).then(function(results) {
    response.success(results);      
  }, function(error) {
    response.error("Failed to get merchant");    
  });
});
