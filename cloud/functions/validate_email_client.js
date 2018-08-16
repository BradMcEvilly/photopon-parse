Parse.Cloud.define("validateEmailClient", function(request, response) {
  var token = request.params.token;
  request.log.info("[VALIDATE EMAIL] "+token);

  if(!token) {
    response.error("Invalid Token - no token");
    return;
  } 

  var query = new Parse.Query(Parse.User);
  query.equalTo("emailValidationToken", token);
  query.limit(1);
  query.first({useMasterKey: true}).then(function(user) {

    if(!user) {
      response.error("Invalid Token - user not found");
      return;
    }

    user.set("emailValidationToken",null);
    user.set("emailVerified",true);
    user.save(null, {useMasterKey: true}).then(function(user) {
      response.success("");
    }, function(error) {
      response.error("[VALIDATE EMAIL FAIL]");
    });
  }, function(error) {
    response.error("Invalid Token - search error");
  });
});
