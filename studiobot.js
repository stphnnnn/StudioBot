require('dotenv').config()

var Botkit = require('botkit');
var mongoose = require('mongoose');
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;

mongoose.connect(process.env.DBURL, { server: { reconnectTries: Number.MAX_VALUE } });

var controller = Botkit.slackbot({
  debug: false
});

var bot = controller.spawn({
  token: process.env.SLACKTOKEN,
  retry: 10
}).startRTM()

require('./app/controllers/botController.js')(controller);
require('./app/controllers/keysController.js')(controller);
require('./app/controllers/schedulingController.js')(controller);
require('./app/controllers/holidayController.js')(controller);

controller.middleware.receive.use(dashbot.receive);
controller.middleware.send.use(dashbot.send);
