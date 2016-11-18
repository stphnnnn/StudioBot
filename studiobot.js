require('dotenv').config()

var Botkit = require('botkit');
var mongoose = require('mongoose');
var ua = require('universal-analytics');

var visitor = ua(process.env.UA);

mongoose.connect(process.env.DBURL, { server: { reconnectTries: Number.MAX_VALUE } });

var controller = Botkit.slackbot({
  debug: false
});

var bot = controller.spawn({
  token: process.env.SLACKTOKEN,
  retry: 10
}).startRTM()

require('./app/controllers/keysController.js')(controller, visitor);
require('./app/controllers/schedulingController.js')(controller, visitor);
require('./app/controllers/holidayController.js')(controller, visitor);
require('./app/controllers/botController.js')(controller, visitor);
