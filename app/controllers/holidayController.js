var scheduling = require('../models/holiday');

module.exports = function(controller) {
  controller.hears(['holiday'], 'direct_message', function(bot, message) {
    var user = message.user;
        user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
      bot.api.users.info({user: user}, function(err, response) {
        scheduling.getHoliday(response.user.name, function(res) {
          bot.reply(message, res);
        });
      })
  });
};
