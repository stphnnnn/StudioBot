function checkChannel (bot, user, callback) {
  bot.api.users.info({user: user}, function(err, res) {
    if (!err) {
      callback(true);
    }
    else {
      bot.api.channels.info({channel: user}, function(err, res) {
        if (!err) {
          callback(true);
        }
        else {
          callback(false);
        }
      });
    }
  });
}

module.exports = function(controller, visitor) {
  controller.hears(['bot announce'], 'direct_message', function(bot ,message) {
    var user = message.user.replace(/[<>@]/g, '');
    bot.api.users.info({user: user}, function(err, response) {
      var askChannel = function(err, convo) {
        convo.ask('Where would you like to make an announcement?', function(response, convo) {
          var channel = response.text.replace(/[<>@#]/g, '').split('|')[0];
          checkChannel(bot, channel, function(res) {
            if (res) {
              convo.say('Awesome. ' + response.text + ' it is!');
              askMessage(response, convo, channel);
              convo.next();
            }
            else {
              bot.reply(message, response.text + ' is not a valid channel.');
              convo.stop();
            }
          });
        });
      };
      var askMessage = function(response, convo, channel) {
        var channelText = response.text;
        convo.ask('What would you like to say?', function(response, convo) {
          convo.say('Ok. Announcing "' + response.text + '" in ' + channelText + '...');
          bot.api.chat.postMessage({
            'channel': channel,
            'text': response.text,
            'as_user': true
          }, function(err, res) {
            convo.say('Cool. I\'ve just made the announcement!');
          });
          convo.next();
        });
      };
      if (response.user.is_admin) {
        bot.startConversation(message, askChannel);
      }
      else {
        bot.reply(message, "You must be an Admin to use this function");
      }
    });
  });

  controller.hears(['help', 'what can i ask you', 'what can you do'], ['direct_message','direct_mention','mention'], function(bot, message) {
      var res = `
I can help you with all kinds of Studio-related questions! Try saying some of the following:
    · _"How much holiday do I have left?"_
    · _"What am I working on this week?"_
    · _"Who has keys?"_
    · _"I have key 7"_
If you need more help, a full list of available commands is available at https://git.io/vXr1k :smile:`;
      bot.reply(message, res);
  });
};
