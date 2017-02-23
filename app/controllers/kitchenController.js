if (!process.env.KITCHEN) {
  throw new Error('"KITCHEN" environment variable must be defined');
}

var moment = require('moment');
var schedule = require('node-schedule');
var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('../../google-generated-creds.json');

var spreadsheet = new GoogleSpreadsheet(process.env.KITCHEN);

var rota = {};

module.exports = function(controller, bot) {

  spreadsheet.useServiceAccountAuth(creds, function(err, token){
    spreadsheet.getInfo( function( err, sheet_info ){
      var j = new schedule.scheduleJob('0 30 9 * * *', function() {
        getRota();
      });
    });
  });

  function getRota() {
    rota = {};
    spreadsheet.getRows(1, function (err, rows) {
      rows.forEach(function (row) {
        rota[row.month.toLowerCase()] = Object.assign({}, row);
      });
      remindUser();
    });
  }

  function remindUser() {
    var thisDay = moment().format('dddd').toLowerCase();
    var thisMonth = moment().format('MMMM').toLowerCase();
    bot.api.users.list({}, function(err, response) {
      response.members.forEach(function (user) {
        if (user.name == rota[thisMonth][thisDay].toLowerCase()) {
          bot.say({
            text: 'It\'s your day for kitchen duties! :egg: :sparkles:',
            channel: user.id
          });
        }
      });
    });
  }
}
