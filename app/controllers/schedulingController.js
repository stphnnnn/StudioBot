var scheduling = require('../models/scheduling');
var moment = require('moment');

module.exports = function(controller) {
  controller.hears(['today'], 'direct_message', function(bot, message) {
    var user = message.user;
        user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
    var date = moment().format('Do MMM');
      bot.api.users.info({user: user}, function(err, response) {
        scheduling.getDay(response.user.name, date, function(res) {
          bot.reply(message, res + " today.");
        });
      })
  });

  controller.hears(['tomorrow'], 'direct_message', function(bot, message) {
    var user = message.user;
        user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
    var date = moment().add(1, 'days').format('Do MMM');
    bot.api.users.info({user: user}, function(err, response) {
      scheduling.getDay(response.user.name, date, function(res) {
        bot.reply(message, res + " tomorrow.");
      });
    })
  });

  controller.hears(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 'direct_message', function(bot, message) {
    var user = message.user;
        user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
    nextDay(message.match[0].toLowerCase(), function(date, day) {
      bot.api.users.info({user: user}, function(err, response) {
        scheduling.getDay(response.user.name, date, function(res) {
          bot.reply(message, res + " on " + day + ".");
        });
      });
    })
  });

  controller.hears(['this week'], 'direct_message', function(bot, message) {
    var user = message.user;
        user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
    var date = moment().startOf('isoWeek').format('Do MMM');
    bot.api.users.info({user: user}, function(err, response) {
      scheduling.getWeek(response.user.name, date, function(res) {
        var reply = "I don't know what you're working on."
        if (res) {
          reply = {
            'text': 'Here\'s what you\'re working on next week:',
            'attachments': res
          }
        }
        bot.reply(message, reply);
      });
    })
  });

  controller.hears(['next week'], 'direct_message', function(bot, message) {
    var user = message.user;
        user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
    var date = moment().startOf('isoWeek').add(1, 'week').format('Do MMM');
    bot.api.users.info({user: user}, function(err, response) {
      scheduling.getWeek(response.user.name, date, function(res) {
        var reply = "I don't know what you're working on."
        if (res) {
          reply = {
            'text': 'Here\'s what you\'re working on next week:',
            'attachments': res
          }
        }
        bot.reply(message, reply);
      });
    })
  });
};

function nextDay(req, callback) {
  var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  for (var i = 0; i < days.length; i++) {
    if (req.indexOf(days[i]) > -1) {
      day = i + 1;
      var current = moment();
      var currentDay = current.day();
      if (day <= currentDay) {
        day += 7;
      }
      callback(current.day(day).format('Do MMM'), current.day(day).format('dddd'));
      return;
    }
  }
}
