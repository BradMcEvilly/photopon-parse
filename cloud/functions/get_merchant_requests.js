Parse.Cloud.define("getMerchantRequests", function(request, response) {
  var query = new Parse.Query("MerchantRequests");
  query.include("user");

  query.find({useMasterKey: true}).then(function(results) {
    response.success(results);      
  }, function(error) {  
    response.error('Failed to get merchant requests');
  })
});
