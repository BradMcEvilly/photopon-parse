//        _   _ _ _ _   _
//  _   _| |_(_) (_) |_(_) ___  ___
// | | | | __| | | | __| |/ _ \/ __|
// | |_| | |_| | | | |_| |  __/\__ \
//  \__,_|\__|_|_|_|\__|_|\___||___/

Utils = {
  pretty: function(object) {
    return JSON.stringify(object, null, 2);
  },

  // TODO: use moment.js
  isWithinOneDay: function(dateTime) {
    if(!dateTime) { return false; }
    var oneDay = 24 * 60 * 60 * 1000;
    return (new Date()).getTime() - dateTime.getTime() <= oneDay;
  },

  // TODO: use moment.js
  daysSince: function(dateTime) {
    var oneDay = 24 * 60 * 60 * 1000;
    return ((new Date()).getTime() - dateTime.getTime()) / oneDay;
  }
}

exports = Utils;