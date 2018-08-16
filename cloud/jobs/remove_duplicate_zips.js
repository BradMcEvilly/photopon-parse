var _ = require("underscore");

Parse.Cloud.job("RemoveDuplicateZips", function(request, status) {
  var hashTable = {};

  var testItemsQuery = new Parse.Query("EnabledLocations");

  testItemsQuery.each(function (enabled_location) {
    var key = enabled_location.get("zipcode");

    if (key in hashTable) { // this item was seen before, so destroy this
      enabled_location.destroy();
    } else { // it is not in the hashTable, so keep it
      hashTable[key] = 1;
    }
  }, {
    useMasterKey: true
  }).then(function() {
    console.log("Migration completed successfully.");
  }, function(error) {
    console.log("Uh oh, something went wrong.");
  });
});
