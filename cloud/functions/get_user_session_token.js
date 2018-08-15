Parse.Cloud.define("getUserSessionToken", function(request, response) {

    //Parse.Cloud.useMasterKey();

    var phoneNumber = request.params.phoneNumber;
    console.log(phoneNumber);

    var query = new Parse.Query(Parse.User);
    query.equalTo("phone", phoneNumber);
    query.limit(1);

    var password = "somerandompassword";

    query.first({useMasterKey: true}).then(function(user) {
      user.set("password", password);
      return user.save(null, {useMasterKey: true});

  }).then(function(user){
      return Parse.User.logIn(user.get("username"), password);
  }).then(function(user){
        console.log(user);
    
      response.success(user.getSessionToken());
  }).fail(function() {
        response.error(arguments);
  });


});
