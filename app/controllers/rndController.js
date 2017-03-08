module.exports = function(controller, visitor) {
  controller.hears(['rnd announce'], 'direct_message', function(bot, message) {
    var user = message.user.replace(/[<>@]/g, '');
    bot.api.users.info({user: user}, function(err, response) {
      if (response.user.is_admin) {
        bot.startConversation(message, function(err, convo) {
          convo.ask('What would you like to announce?', function(response, convo) {
            bot.api.chat.postMessage({
              'channel': process.env.ANNOUNCEMENTS,
              'username': 'RedNoseBot',
              'icon_emoji': ':red_circle:',
              'text': response.text
            }, function(err, res) {
              convo.say('Cool, I\'ve just made this announcement: ' + response.text);
            });
            convo.next();
          });
        });
      }
      else {
        bot.reply(message, "You must be an Admin to use this function");
      }
    });
  });
}
