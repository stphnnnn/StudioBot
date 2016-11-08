require('dotenv').config()

var Botkit = require('botkit');
var mongoose = require('mongoose');

mongoose.connect(process.env.DBURL);
mongoose.connection.on('connected', function () {
  console.log('Mongoose connection open.');
});

var controller = Botkit.slackbot({
  debug: false,
  retry: 10
});

var bot = controller.spawn({
  token: process.env.SLACKTOKEN
}).startRTM()

require('./app/controllers/keysController.js')(controller);
require('./app/controllers/schedulingController.js')(controller);
