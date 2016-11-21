var keys = require('../models/keys');

module.exports = function(controller, visitor) {
  controller.hears(['who has keys', 'who\'s got keys', 'who has the keys'],['direct_message','direct_mention','mention'],function(bot,message) {
    keys.list(function(res) {
      var reply = "I don't know who has keys."
      if (res) {
        reply = {
          'text': 'Here\'s who has keys:',
          'attachments': res
        }
      }
      bot.reply(message, reply);
    });
  });

  controller.hears('who has key (.*)',['direct_message','direct_mention','mention'],function(bot,message) {
    var id = message.match[1];
    id = id.replace(/['";:,.\/?\\-]/g, '');
    keys.single(id, function(res) {
      bot.reply(message, res);
    });
  });

  controller.hears(['who has late key','who has late keys', 'who has the late keys', 'who has the late key'],['direct_message','direct_mention','mention'],function(bot,message) {
    keys.single(12, function(res) {
      bot.reply(message, res);
    });
  });

  controller.hears('i have key (.*)',['direct_message','direct_mention','mention'],function(bot,message) {
    var id = message.match[1];
    var user = message.user;
    keys.claim(id, user, function(res) {
      bot.reply(message, res);
    });
  });

  controller.hears(['i have late key',' i have late keys', 'i have the late keys', 'i have the late key'],['direct_message','direct_mention','mention'],function(bot,message) {
    var user = message.user;
    keys.claim(12, user, function(res) {
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
            keys.claim(id, user, function(res) {
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
            keys.claim(12, user, function(res) {
              bot.reply(message, res);
            });
          }
      })
  });

  controller.hears(['give key (.*) back', 'giving key (.*) back', 'return key (.*)', 'give back key (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var id = message.match[1];
    keys.unclaim(id, function(res) {
      bot.reply(message, res);
    });
  });

  controller.hears(['give late key back', 'giving late key back', 'return late key', 'give back late key', 'give late keys back', 'giving late keys back', 'return late keys', 'give back late keys'], 'direct_message,direct_mention,mention', function(bot, message) {
    keys.unclaim(12, function(res) {
      bot.reply(message, res);
    });
  });
};
