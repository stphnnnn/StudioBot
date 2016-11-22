var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('../../google-generated-creds.json');

var spreadsheet = new GoogleSpreadsheet(process.env.SCHEDULING);
spreadsheet.useServiceAccountAuth(creds, function(err, token){
  spreadsheet.getInfo( function( err, sheet_info ){
    task();
  });
})

var dateRow = 8;
var nameCol = 1;
var nameDepth = 3;

var users = {};
var dates = {};
var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function getNames() {
  users = {};
  spreadsheet.getInfo(function (err, info) {
    sheet = info.worksheets[0];
    sheet.getCells({
      'min-col': nameCol,
      'max-col': nameCol,
      'return-empty': false
    }, function (err, cells) {
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        users[cell.value.toLowerCase()] = cell.row;
      }
    });
  });
}

function getDates() {
  dates = {};
  spreadsheet.getInfo(function (err, info) {
    sheet = info.worksheets[0];
    sheet.getCells({
      'min-row': dateRow,
      'max-row': dateRow,
      'return-empty': false
    }, function (err, cells) {
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        dates[cell.value] = cell.col;
      }
    });
  });
}

function task() {
  getNames();
  getDates();
  setTimeout(task, 1000 * 60 * 5);
}

module.exports = {
  getDay: function (name, date, callback) {
    spreadsheet.getInfo(function (err, info) {
      sheet = info.worksheets[0];
      sheet.getCells({
        'min-row': users[name],
        'max-row': users[name] + nameDepth,
        'min-col': dates[date],
        'max-col': dates[date],
        'return-empty': false
      }, function (err, cells) {
        var arr = [];
        if (!cells) {
          callback("I don't know what you're working on");
        }
        else if (cells.length == 0) {
          callback("You're free");
        }
        else {
          for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            arr.push("*" + cell.value + "*");
          }
          var uniqueArray = arr.filter(function(elem, pos) {
            return arr.indexOf(elem) == pos;
          });
          if (uniqueArray.length > 1) {
            var message = uniqueArray.slice(0, uniqueArray.length - 1).join(', ') + " and " + uniqueArray.slice(-1);
          }
          else {
            var message = uniqueArray[0];
          }
          callback("You're working on " + message);
        }
      });
    });
  },

  getWeek: function (name, date, callback) {
    spreadsheet.getInfo(function (err, info) {
      sheet = info.worksheets[0];
      sheet.getCells({
        'min-row': users[name],
        'max-row': users[name] + nameDepth,
        'min-col': dates[date],
        'max-col': dates[date] + 4,
        'return-empty': false
      }, function (err, cells) {
        var week = {0:[],1:[],2:[],3:[],4:[]};
        if (!cells || cells.length == 0) {
          callback(null);
        }
        else {
          var response = [];
          for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            var col = cell.col - dates[date];
            week[col].push("*" + cell.value + "*");
          }
          for (var day in week) {
            var uniqueArray = week[day].filter(function(elem, pos) {
              return week[day].indexOf(elem) == pos;
            });
            if (uniqueArray.length > 1) {
              var message = uniqueArray.slice(0, uniqueArray.length - 1).join(', ') + " and " + uniqueArray.slice(-1);
            }
            else if (uniqueArray.length == 0) {
              var message = "Nothing! Looks like you're free."
            }
            else {
              var message = uniqueArray[0];
            }
            response.push({text : days[day] + ": " + message, mrkdwn_in: ['text']});
          }
          callback(response);
        }
      });
    });
  }
};
