require('dotenv').config()

var Botkit = require('botkit');
var mongoose = require('mongoose');

mongoose.connect(process.env.DBURL, { server: { reconnectTries: Number.MAX_VALUE } });

var controller = Botkit.slackbot({
  debug: false
});

var bot = controller.spawn({
  token: process.env.SLACKTOKEN,
  retry: 10
}).startRTM()

require('./app/controllers/keysController.js')(controller);
require('./app/controllers/schedulingController.js')(controller);
