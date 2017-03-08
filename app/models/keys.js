var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  user: { type: String },
  claimed: { type: Boolean, default: false }
});

var Key = mongoose.model('Key', keySchema);

function keyType(id) {
  if (id == 12) {
    return('Late key');
  }
  else {
    return('Key ' + id);
  }
}

function at(user) {
  return('<@' + user + '>');
}

module.exports = {
  list: function(callback) {
    Key.find(function (err, keys) {
      if (err) console.log(err);
      if (keys) {
        var response = [];
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].claimed) {
            var user = at(keys[i].user);
            response.push({text: keyType(keys[i].id) + ' belongs to ' + user, mrkdwn_in: ['text']});
          }
        }
        callback(response);
      }
      else {
        callback(null);
      }
    });
  },

  single: function(id, callback) {
    Key.findOne({id: id}, function(err, keys) {
      if (err) console.log(err);
      if (!keys) {
        callback('Key ' + id + ' does not exist.');
      }
      else {
        if (keys.claimed) {
          var user = at(keys.user);
          callback(keyType(id) + ' belongs to ' + user + '.');
        }
        else {
          callback(keyType(id) + ' is unclaimed.');
        }
      }
    });
  },

  claim: function(id, user, callback) {
    Key.findOne({id: id}, function(err, keys) {
      if (err) console.log(err);
      if (!keys) {
        callback('Key ' + id + ' does not exist.');
      }
      else {
        var newUser = at(user);
        if (keys.claimed) {
          var oldUser = at(keys.user);
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
  },

  unclaim: function(id, callback) {
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
};
