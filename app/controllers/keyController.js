var Key = require('../models/key');

function keyType(id) {
  if (id == 12) {
    return('Late key');
  }
  else {
    return('Key ' + id);
  }
}

exports.list = function(callback) {
  Key.find(function (err, keys) {
    if (err) console.log(err);
    if (keys) {
      callback('OK, here\'s a list of who has keys:');
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].claimed) {
          var user = "<@"+keys[i].user+">";
          callback(keyType(keys[i].id) + ' belongs to ' + user + '.');
        }
      }
    }
  });
}

exports.single = function(id, callback) {
  Key.findOne({id: id}, function(err, keys) {
    if (err) console.log(err);
    if (!keys) {
      callback('Key ' + id + ' does not exist.');
    }
    else {
      if (keys.claimed) {
        var user = "<@"+keys.user+">";
        callback(keyType(id) + ' belongs to ' + user + '.');
      }
      else {
        callback(keyType(id) + ' is unclaimed.');
      }
    }
  });
}

exports.claim = function(id, user, callback) {
  Key.findOne({id: id}, function(err, keys) {
    if (err) console.log(err);
    if (!keys) {
      callback('Key ' + id + ' does not exist.');
    }
    else {
      var newUser = "<@"+user+">";
      if (keys.claimed) {
        var oldUser = "<@"+keys.user+">";
        if (newUser == oldUser) {
          callback(keyType(id) + ' already belongs to ' + oldUser + '.');
        }
        else {
          keys.user = user;
          keys.save(function(err) {
            if (err) console.log(err);
            callback('Moving ' + keyType(id) + ' from ' + oldUser + ' to ' + newUser + '.');
          });
        }
      }
      else {
        keys.user = user;
        keys.claimed = true;
        keys.save(function(err) {
          if (err) console.log(err);
          callback(keyType(id) + ' now belongs to ' + newUser + '.');
        });
      }
    }
  });
}

exports.unclaim = function(id, callback) {
  Key.findOne({id: id}, function(err, keys) {
    if (err) console.log(err);
    if (!keys) {
      callback('Key ' + id + ' does not exist.');
    }
    else {
      if (keys.claimed) {
        keys.claimed = false;
        keys.user = undefined;
        keys.save(function(err) {
          if (err) console.log(err);
          callback(keyType(id) + ' is now unclaimed.');
        });
      }
      else {
        callback(keyType(id) + ' is already unclaimed.');
      }
    }
  });
}











//private

// exports.create = function(id) {
//   Key.findOne({id: id}, function(err, key) {
//     if (err) console.log(err);
//     if (!key) {
//       var key = new Key({
//         id: id,
//         claimed: false
//       });
//       key.save(function(err) {
//         if (err) console.log(err);
//         console.log('Key ' + id + ' has been created.');
//       });
//     }
//     else {
//       console.log('Key ' + id + ' already exists.');
//     }
//   });
// }
//
// exports.delete = function(id) {
//     Key.findOneAndRemove({ id: id }, function(err) {
//       if (err) console.log(err);
//       console.log('Key ' + id + ' has been deleted.');
//     });
// }
