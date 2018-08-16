Parse.Cloud.beforeSave("MerchantRequests", function(request, response) {
    
    if(!request.object.existed()){
    
    
      var promises = [];
      
      var MerchantRequest = Parse.Object.extend("MerchantRequests");
      var queryMerchantRequest = new Parse.Query(MerchantRequest);
      queryMerchantRequest.equalTo("taxID",request.object.get("taxID"));
      
      var Company = Parse.Object.extend("Company");
      var queryCompany = new Parse.Query(Company);
      queryCompany.equalTo("taxID",request.object.get("taxID"));
      
      request.log.info(request.object.get("taxID"));
      
      promises.push(queryMerchantRequest.first({useMasterKey: true}));
      promises.push(queryCompany.first({useMasterKey: true}));
    
      Parse.Promise.when(promises).then(function(result) {
        request.log.info(Utils.pretty(result));
        if(result[0] ||  result[1]){
        
          response.error("A company with this EIN already exists");

        
        }else{
        
          response.success();
        }
      
      
      }).catch(function(error) {
      
      
          response.error(error);

      
      });
    
    
    }else{
    
      response.success();
    }

    
    
    
    

});