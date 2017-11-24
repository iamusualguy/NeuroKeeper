const Excel = require('exceljs');

function getFileName() {
    var d = new Date();
    var filePath = mainManager.settings.filePath;
    return filePath + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + ".xlsx";
}

function writeRow(newReport) {
    console.log(newReport);
    let workbook = new Excel.Workbook();
    let filename = getFileName();
    var fs = require('fs');
    var promise = new Promise((resolve, reject) => {
        fs.stat(filename, function (err, stat) {
            if (err == null) {
                workbook.xlsx.readFile(filename)
                    .then(() => {
                        workbook.getWorksheet("Efforts").addRow(newReport);
                        workbook.xlsx.writeFile(filename);
                        resolve();
                    });
            } else if (err.code == 'ENOENT') {
                // file does not exist
                writeEmptyFile(newReport); resolve();
            } else {
                reject('Some other error: ', err.code);
            }
        });
    });


    return promise;
}

function writeEmptyFile(newReport) {
    var Excel = require('exceljs');
    var workbook = new Excel.Workbook();
    var sheet = workbook.addWorksheet('Efforts');
    filename = getFileName();
    return workbook.xlsx.writeFile(filename)
        .then(function () {
            workbook.getWorksheet("Efforts").addRow(["Project-Task", "Effort", "Description", "Started Date", "Completion Date"]);
            workbook.getWorksheet("Efforts").addRow(newReport);
            return workbook.xlsx.writeFile(filename);
            console.log('Array added and file saved.')
        });
}

function getStatistics() {
    let workbook = new Excel.Workbook();
    let filename = getFileName();
    let sObject = {};
    let stats = [];
    workbook.xlsx.readFile(filename)
        .then((book) => {
            worksheet = book.getWorksheet('Efforts');
            for (let i = 2; i < worksheet.rowCount; i++) {
                let row = worksheet.getRow(i);
                let rowData = {};
                rowData.ProjectTask = row.getCell('A').value;
                rowData.Effort = row.getCell('B').value;
                rowData.Description = row.getCell('C').value;
                rowData.StartedDate = row.getCell('D').value;

                stats.push(rowData);
            }

            //console.log(stats);
            sObject.TodayEffort =  getTodayEffort(stats);
            sObject.WeekEffort = getWeekEffort(stats);
            sObject.MonthEffort = getMonthEffort(stats);
        });
}

function getMonthEffort(stats) {
    let trackedTime = 0;
    stats.forEach(function (item, i, arr) {
        if (item.StartedDate != null) {
                trackedTime += item.Effort;
        }
    });

    console.log(trackedTime);
    return trackedTime;
}

function getWeekEffort(stats){
let weekTime = 0;

var curr = new Date; // get current date
var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
var last = first + 6; // last day is the first day + 6



var firstday = new Date(curr.setDate(first));
var lastday = new Date(curr.setDate(last));

firstday = firstday.setHours(0,0,0,0);
lastday = lastday.setHours(23,59,59,999);

stats.forEach(function (item, i, arr) {
    if (item.StartedDate <= lastday && item.StartedDate >= firstday ) {
        weekTime += item.Effort;
    }
});
console.log(weekTime);
return weekTime;
}

function getTodayEffort(stats) {
    let trackedTime = 0;
    stats.forEach(function (item, i, arr) {
        if (item.StartedDate != null) {
            let id = "" + item.StartedDate.getDate() +
                item.StartedDate.getMonth() +
                item.StartedDate.getFullYear();
            let dn = new Date();

            let cd = "" + dn.getDate() +
                dn.getMonth() +
                dn.getFullYear();

            if (id === cd) {
                trackedTime += item.Effort;
            }
        }
    });

    console.log(trackedTime);
    return trackedTime;
}