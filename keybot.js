require('dotenv').config()

var Botkit = require('botkit');
var mongoose = require('mongoose');

mongoose.connect(process.env.DBURL);
mongoose.connection.on('connected', function () {
  console.log('Mongoose connection open.');
});

var keyController = require('./app/controllers/keyController');

var controller = Botkit.slackbot({
  debug: false,
  retry: 10
});

var bot = controller.spawn({
  token: process.env.SLACKTOKEN
}).startRTM()

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
