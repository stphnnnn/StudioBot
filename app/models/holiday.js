if (!process.env.HOLIDAY) {
  throw new Error('"HOLIDAY" environment variable must be defined');
}

var GoogleSpreadsheet = require('google-spreadsheet');
var pluralize = require('pluralize')
var creds = require('../../google-generated-creds.json');

var spreadsheet = new GoogleSpreadsheet(process.env.HOLIDAY);
spreadsheet.useServiceAccountAuth(creds, function(err, token){
  spreadsheet.getInfo( function( err, sheet_info ){
    task();
  });
})

var dataRow = 2;
var daysLeftCol = 5;

var users = {};

function getNames() {
  users = {};
  spreadsheet.getInfo(function (err, info) {
    for (var i = 0; i < info.worksheets.length; i++) {
      sheet = info.worksheets[i];
      users[sheet.title.toLowerCase()] = i;
    }
  });
}

function task() {
  getNames();
  setTimeout(task, 1000 * 60 * 5);
}

module.exports = {
  getHoliday: function (name, callback) {
    spreadsheet.getInfo(function (err, info) {
      sheet = info.worksheets[users[name]];
      sheet.getCells({
        'min-row': dataRow,
        'max-row': dataRow,
        'min-col': daysLeftCol,
        'max-col': daysLeftCol,
        'return-empty': false
      }, function (err, cells) {
        if (err || !cells || cells.length == 0) {
          callback("I don't know how many days of holiday you have left.");
        }
        else {
          callback("You have " + pluralize('day', cells[0].value, true) + " of holiday left.");
        }
      });
    });
  }
};
