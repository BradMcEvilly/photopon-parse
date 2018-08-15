Parse.Cloud.define("validateEmailClient", function(request, response) {

   request.log.info("run function");
    
    var token = request.params.token;
    
    if(!token){
      response.error("Invalid Token");
    }else{
    var query = new Parse.Query(Parse.User);
    query.equalTo("emailValidationToken", token);
    query.limit(1);
    query.first({useMasterKey: true}).then(function(u) {
       if(u){
         u.set("emailValidationToken",null);
         u.set("emailVerified",true);
         u.save(null, {useMasterKey: true}).then(function(user) {
                 response.success("");
                 }).catch(function(error) {
                  response.error("Invalid Token");
                });
            
      }else{
        response.error("Invalid Token");
      }
    }).catch(function(error){
      response.error("Invalid Token");
    }); 
    
    }
   
      
        

});
