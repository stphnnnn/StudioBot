require('dotenv').config()

if (!process.env.DASHBOT_API_KEY) {
  throw new Error('"DASHBOT_API_KEY" environment variable must be defined');
}
if (!process.env.SLACKTOKEN) {
  throw new Error('"SLACKTOKEN" environment variable must be defined');
}
if (!process.env.DBURL) {
  throw new Error('"DBURL" environment variable must be defined');
}

var Botkit = require('botkit');
var mongoose = require('mongoose');
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;

mongoose.connect(process.env.DBURL, { server: { reconnectTries: Number.MAX_VALUE } });

var controller = Botkit.slackbot({
  debug: false
});

controller.middleware.receive.use(dashbot.receive);
controller.middleware.send.use(dashbot.send);

var bot = controller.spawn({
  token: process.env.SLACKTOKEN,
  retry: 10
}).startRTM()

require('./app/controllers/botController.js')(controller);
require('./app/controllers/rndController.js')(controller);
require('./app/controllers/catController.js')(controller);
require('./app/controllers/keysController.js')(controller);
require('./app/controllers/schedulingController.js')(controller);
require('./app/controllers/holidayController.js')(controller);
require('./app/controllers/kitchenController.js')(controller, bot);

controller.hears('(.*)', ['direct_message','direct_mention','mention'], function(bot, message){});
