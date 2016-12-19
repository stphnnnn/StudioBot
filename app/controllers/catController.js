var request = require('request');

function getCat(callback) {
  request('http://thecatapi.com/api/images/get?format=html&type=gif', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var regex = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/;
      var catUrl = regex.exec(response.body)[0];
      callback(catUrl);
    }
  });
}

module.exports = function(controller, visitor) {
  controller.hears([':cat:', ':cat2:'], 'direct_message', function(bot, message) {
    getCat(function (catUrl) {
      console.log(catUrl);
      var res = {
        'username': 'Meow Bot',
        'attachments': [
          {
            "title": catUrl,
            "image_url": catUrl
          }
        ]
        }
        bot.reply(message, res);
    });
  });
};
