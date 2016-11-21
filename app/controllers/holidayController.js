var scheduling = require('../models/holiday');

module.exports = function(controller, visitor) {
  controller.hears(['holiday', 'days off'], 'direct_message', function(bot, message) {
    var user = message.user;
        user = user.replace(/['"<>@;:,.\/?\\-]/g, ''); //remove <@>
      bot.api.users.info({user: user}, function(err, response) {
        scheduling.getHoliday(response.user.name, function(res) {
          bot.reply(message, res);
        });
      })
  });
};
