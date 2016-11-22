module.exports = function(controller, visitor) {
  controller.hears('say ((.|\n)*) (in|to) (.*)', 'direct_message', function(bot, message) {
    var user = message.user.replace(/[<>@]/g, '');
    bot.api.users.info({user: user}, function(err, response) {
      if (response.user.is_admin) {
        var channel = message.match[message.match.length-1].replace(/[<>@#]/g, '').split('|')[0];
        var response = message.match[1].replace(/["]/g, '')
        bot.say({
          text: response,
          channel: channel
        });
        bot.reply(message, "Message sent to " + message.match[message.match.length-1]);
      }
      else {
        bot.reply(message, "You must be an Admin to use this function");
      }
    })
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
