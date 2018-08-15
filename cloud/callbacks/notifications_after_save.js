Parse.Cloud.afterSave("Notifications", function(request) {

  var user = request.object.get("to");
  var assocUser = request.object.get("assocUser");
  
  var notificationType = request.object.get("type");
  var channelName = "User_" + user.id;


  assocUser.fetch({
    success: function(assocUser) {
      console.log(assocUser);
      var photoponId;

      var message = "";
      if (notificationType == "PHOTOPON") {

        message = "User " + assocUser.get("username") + " sent you Photopon!"
        photoponId = request.object.get("assocPhotopon").id;

      } else if (notificationType == "MESSAGE") {
        message = assocUser.get("username") + ": " + request.object.get("content");

      } else if (notificationType == "FRIEND") {
        message = assocUser.get("username") + " added you";

      } else if (notificationType == "ADDWALLET") {
        message = assocUser.get("username") + " saved your Photopon";

      } else if (notificationType == "REDEEMED") {
        message = assocUser.get("username") + " redeemed your Photopon";

      } else if (notificationType == "VIEWED") {
        message = assocUser.get("username") + " viewed your Photopon";
        
      }


      Parse.Push.send({
        channels: [ channelName ],
        data: {
          type: notificationType,
          notificationId: request.object.id,
          badge: "Increment",
          alert: message
        }
      }, {
        useMasterKey: true,
        success: function() {

        },
        error: function(error) {
        // Handle error
        }
      });


    },
    error: function(error) {
    // Handle error
    }
  });

});
