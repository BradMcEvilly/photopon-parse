Parse.Cloud.beforeSave("Friends", function(request, response) {
  var user1 = request.object.get("user1");
  var user2 = request.object.get("user2");
  var phoneId = request.object.get("phoneId");

  var fship = new Parse.Query("Friends");
  fship.equalTo("user1", user1);

  if (user2) {
    fship.equalTo("user2", user2);
  } else {
    fship.equalTo("phoneId", phoneId);
  }
  
  fship.find({
    success: function(objects) {
      if (objects.length > 0) {
        response.error("Friendship already exists");
      } else {
        response.success();
      }
    },
    error: function(error) {
      response.error(error);
    }
  });
});