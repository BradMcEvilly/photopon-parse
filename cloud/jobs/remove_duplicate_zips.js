Parse.Cloud.job("RemoveDuplicateZips", function(request, status) {
  //Parse.Cloud.useMasterKey();
  var _ = require("underscore");

  var hashTable = {};

  var testItemsQuery = new Parse.Query("EnabledLocations");

  testItemsQuery.each(function (testItem) {
    var key = testItem.get("zipcode");

    if (key in hashTable) { // this item was seen before, so destroy this
        return testItem.destroy();
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
