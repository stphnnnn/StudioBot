require('dotenv').config()
var Botkit = require('botkit');
var moment = require('moment');

var sheetController = require('./app/sheetController');

var controller = Botkit.slackbot({
  debug: false,
  retry: 10
});

var bot = controller.spawn({
  token: process.env.SLACKTOKEN
}).startRTM()

var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

controller.hears(['today'], 'direct_message,direct_mention,mention', function(bot, message) {
  var user = message.user;
      user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
  var date = moment().format('Do MMM');
    bot.api.users.info({user: user}, function(err, response) {
      sheetController.getDay(response.user.name, date, function(res) {
        bot.reply(message, res + " today.");
      });
    })
});

controller.hears(['tomorrow'], 'direct_message,direct_mention,mention', function(bot, message) {
  var user = message.user;
      user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
  var date = moment().add(1, 'days').format('Do MMM');
  bot.api.users.info({user: user}, function(err, response) {
    sheetController.getDay(response.user.name, date, function(res) {
      bot.reply(message, res + " tomorrow.");
    });
  })
});

controller.hears(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 'direct_message,direct_mention,mention', function(bot, message) {
  var user = message.user;
      user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
  nextDay(message.match[0].toLowerCase(), function(date, day) {
    bot.api.users.info({user: user}, function(err, response) {
      sheetController.getDay(response.user.name, date, function(res) {
        bot.reply(message, res + " on " + day + ".");
      });
    });
  })
});

controller.hears(['this week'], 'direct_message,direct_mention,mention', function(bot, message) {
  var user = message.user;
      user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
  var date = moment().startOf('isoWeek').format('Do MMM');
  bot.api.users.info({user: user}, function(err, response) {
    bot.reply(message, "Here's what you're working on this week...");
    sheetController.getWeek(response.user.name, date, function(res) {
      bot.reply(message, res);
    });
  })
});

controller.hears(['next week'], 'direct_message,direct_mention,mention', function(bot, message) {
  var user = message.user;
      user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
  var date = moment().startOf('isoWeek').add(1, 'week').format('Do MMM');
  bot.api.users.info({user: user}, function(err, response) {
    bot.reply(message, "Here's what you're working on next week...");
    sheetController.getWeek(response.user.name, date, function(res) {
      bot.reply(message, res);
    });
  })
});

function nextDay(req, callback) {
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

controller.hears(['(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.reply(message, 'I don\'t understand what you are asking me to do...sorry.');
});
