if (!process.env.KITCHEN) {
  throw new Error('"KITCHEN" environment variable must be defined');
}

var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('../../google-generated-creds.json');

var spreadsheet = new GoogleSpreadsheet(process.env.KITCHEN);
spreadsheet.useServiceAccountAuth(creds, function(err, token){
  spreadsheet.getInfo( function( err, sheet_info ){
    task();
  });
})

var monthRow = 2;
var dayCol = 1;

function task() {
  getDays();
  getMonths();
  setTimeout(task, 1000 * 60 * 5);
}

var days = {};
var months = {};

function getMonths() {
  months = {};
  spreadsheet.getInfo(function (err, info) {
    sheet = info.worksheets[0];
    sheet.getCells({
      'min-row': monthRow,
      'max-row': monthRow,
      'return-empty': false
    }, function (err, cells) {
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        months[cell.value] = cell.col;
      }
    });
  });
}

function getDays() {
  days = {};
  spreadsheet.getInfo(function (err, info) {
    sheet = info.worksheets[0];
    sheet.getCells({
      'min-col': dayCol,
      'max-col': dayCol,
      'min-row': 2,
      'return-empty': false
    }, function (err, cells) {
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        days[cell.value] = cell.row;
      }
      console.log(days);
    });
  });
}
