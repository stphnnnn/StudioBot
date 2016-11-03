require('dotenv').config()

var Botkit = require('botkit');
var mongoose = require('mongoose');
var moment = require('moment');

mongoose.connect(process.env.DBURL);
mongoose.connection.on('connected', function () {
  console.log('Mongoose connection open.');
});

var keyController = require('./app/controllers/keyController');
var sheetController = require('./app/controllers/sheetController');


var controller = Botkit.slackbot({
  debug: false,
  retry: 10
});

var bot = controller.spawn({
  token: process.env.SLACKTOKEN
}).startRTM()

//Key functions
controller.hears(['who has keys', 'who\'s got keys', 'who has the keys'],['direct_message','direct_mention','mention'],function(bot,message) {
  keyController.list(function(res) {
    bot.reply(message, res);
  });
});

controller.hears('who has key (.*)',['direct_message','direct_mention','mention'],function(bot,message) {
  var id = message.match[1];
  id = id.replace(/['";:,.\/?\\-]/g, '');
  keyController.single(id, function(res) {
    bot.reply(message, res);
  });
});

controller.hears(['who has late key','who has late keys', 'who has the late keys', 'who has the late key'],['direct_message','direct_mention','mention'],function(bot,message) {
  keyController.single(12, function(res) {
    bot.reply(message, res);
  });
});

controller.hears('i have key (.*)',['direct_message','direct_mention','mention'],function(bot,message) {
  var id = message.match[1];
  var user = message.user;
  keyController.claim(id, user, function(res) {
    bot.reply(message, res);
  });
});

controller.hears(['i have late key',' i have late keys', 'i have the late keys', 'i have the late key'],['direct_message','direct_mention','mention'],function(bot,message) {
  var user = message.user;
  keyController.claim(12, user, function(res) {
    bot.reply(message, res);
  });
});

controller.hears(['(.*) has key (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var user = message.match[1];
        user = user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
    var id = message.match[2];

    bot.api.users.info({user: user}, function(err, response) {
        if (err) {
          bot.reply(message, 'User @' + user + ' does not exist.');
        }
        else {
          keyController.claim(id, user, function(res) {
            bot.reply(message, res);
          });
        }
    })
});

controller.hears(['(.*) has late key', '(.*) has late keys'], 'direct_message,direct_mention,mention', function(bot, message) {
    var user = message.match[1];
        user = user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
    bot.api.users.info({user: user}, function(err, response) {
        if (err) {
          bot.reply(message, 'User @' + user + ' does not exist.');
        }
        else {
          keyController.claim(12, user, function(res) {
            bot.reply(message, res);
          });
        }
    })
});

controller.hears(['give key (.*) back', 'giving key (.*) back', 'return key (.*)', 'give back key (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
  var id = message.match[1];
  keyController.unclaim(id, function(res) {
    bot.reply(message, res);
  });
});

controller.hears(['give late key back', 'giving late key back', 'return late key', 'give back late key', 'give late keys back', 'giving late keys back', 'return late keys', 'give back late keys'], 'direct_message,direct_mention,mention', function(bot, message) {
  keyController.unclaim(12, function(res) {
    bot.reply(message, res);
  });
});

//Scheduling functions
var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

controller.hears(['today'], 'direct_message', function(bot, message) {
  var user = message.user;
      user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
  var date = moment().format('Do MMM');
    bot.api.users.info({user: user}, function(err, response) {
      sheetController.getDay(response.user.name, date, function(res) {
        bot.reply(message, res + " today.");
      });
    })
});

controller.hears(['tomorrow'], 'direct_message', function(bot, message) {
  var user = message.user;
      user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
  var date = moment().add(1, 'days').format('Do MMM');
  bot.api.users.info({user: user}, function(err, response) {
    sheetController.getDay(response.user.name, date, function(res) {
      bot.reply(message, res + " tomorrow.");
    });
  })
});

controller.hears(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 'direct_message', function(bot, message) {
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

controller.hears(['this week'], 'direct_message', function(bot, message) {
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

controller.hears(['next week'], 'direct_message', function(bot, message) {
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

controller.hears(['(.*)'], 'direct_message', function(bot, message) {
  bot.reply(message, 'I don\'t understand what you are asking me to do...sorry.');
});
