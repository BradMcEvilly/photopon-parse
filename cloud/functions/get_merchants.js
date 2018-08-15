Parse.Cloud.define("getMerchants", function(request, response) {

    var query = new Parse.Query("Company");
    query.include("merchant");
    
      query.find({useMasterKey: true}).then(function(results) {
      
        response.success(results);      
      }).catch(function(error) {
        response.error(new Error('Failed to get merchant'));
      });


});
