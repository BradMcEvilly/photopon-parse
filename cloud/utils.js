//        _   _ _ _ _   _
//  _   _| |_(_) (_) |_(_) ___  ___
// | | | | __| | | | __| |/ _ \/ __|
// | |_| | |_| | | | |_| |  __/\__ \
//  \__,_|\__|_|_|_|\__|_|\___||___/

Utils = {
  pretty: function(object) {
    return JSON.stringify(object, null, 2);
  }
}

exports = Utils;