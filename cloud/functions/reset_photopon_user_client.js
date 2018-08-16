//                  _                                        _
//  _ _ ___ ___ ___| |_   _ __  __ _ _______ __ _____ _ _ __| |
// | '_/ -_|_-</ -_)  _| | '_ \/ _` (_-<_-< V  V / _ \ '_/ _` |
// |_| \___/__/\___|\__| | .__/\__,_/__/__/\_/\_/\___/_| \__,_|
//                       |_|

Parse.Cloud.define("resetPhotoponUserClient", function(request, response) {
  var email = request.params.email;
  request.log.info("[RESET PASSWORD] "+email);

  var query = new Parse.Query(Parse.User);
  query.equalTo("email", email);
  query.limit(1);
  query.first({useMasterKey: true}).then(function(user) {
    var password  = Math.random().toString(36).slice(-8);

    user.set("password",password);
    user.set("isTempPassword",true);
    user.save(null, {
      useMasterKey: true,
      success: function(user) {
        Mailer.reset_password(user, password);
        response.success("");        
      },
      error: function(user, error) {
        response.error("[RESET PASSWORD ERROR] "+Utils.pretty(error));
      }
    });
  }, function(error) {
    // TODO: should not return error when user not found - exposes user membership
    request.log.info(Utils.pretty(error));
    response.error("User does't exist.");
  });
});
