const Excel = require('exceljs');
const electron = require('electron');

function getFileName() {
    var d = new Date();
    var filePath = currentSettings.filePath;
    return filePath+"report-" + (d.getMonth() + 1) + "-" + d.getFullYear() + ".xlsx";
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
                        resolve(workbook.xlsx.writeFile(filename));
                        
                    });
            } else if (err.code == 'ENOENT') {
                // file does not exist
                resolve( writeEmptyFile(newReport) );
            } else {
                reject('Some other error: ', err.code);
            }
        });
    });


    return promise;
}

function writeEmptyFile(newReport) {
    const workbook = new Excel.Workbook();
    workbook.addWorksheet('Efforts');
    filename = getFileName();
    return workbook.xlsx.writeFile(filename)
        .then(function () {
            workbook.getWorksheet("Efforts").addRow(["Project-Task", "Effort", "Description", "Date (MM/DD/YYYY)"]);
            if (newReport != null) {
                workbook.getWorksheet("Efforts").addRow(newReport);
            }
            // console.log('Array added and file saved.');
            return workbook.xlsx.writeFile(filename);
        });
}

function getStatistics() {
    let workbook = new Excel.Workbook();
    let filename = getFileName();
    let sObject = {};
    let stats = [];
    var fs = require('fs');
    var promise = new Promise((resolve, reject) => {
        fs.stat(filename, function (err, stat) {
            if (err == null) {
                resolve(workbook.xlsx.readFile(filename)
                    .then((book) => {
                        worksheet = book.getWorksheet('Efforts');
                        for (let i = 2; i <= worksheet.rowCount; i++) {
                            let row = worksheet.getRow(i);
                            let rowData = {};
                            rowData.ProjectTask = row.getCell('A').value;
                            rowData.Effort = row.getCell('B').value;
                            rowData.Description = row.getCell('C').value;
                            rowData.StartedDate = row.getCell('D').value;

                            stats.push(rowData);
                        }

                        //console.log(stats);
                        sObject.TodayEffort = getTodayEffort(stats);
                        sObject.WeekEffort = getWeekEffort(stats);
                        sObject.MonthEffort = getMonthEffort(stats);
                        sObject.WeekDescriptions = getWeekDescriptions(stats);

                        // console.log(sObject);
                        return sObject;
                    }))
            }
            else if (err.code == 'ENOENT') {
                // file does not exist

                sObject.TodayEffort = 0;
                sObject.WeekEffort = 0;
                sObject.MonthEffort = 0;
                writeEmptyFile(null); resolve(sObject);
            }
        });
    });

    return promise;
}

function getMonthEffort(stats) {
    let trackedTime = 0;
    stats.forEach(function (item, i, arr) {
        if (item.StartedDate != null) {
            trackedTime += item.Effort;
        }
    });

    //   console.log(trackedTime);
    return trackedTime;
}

function getWeekEffort(stats) {
    let weekTime = 0;

    var curr = new Date; // get current date
    var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(curr.setDate(first));
    var lastday = new Date(curr.setDate(last));

    firstday = firstday.setHours(0, 0, 0, 0);
    lastday = lastday.setHours(23, 59, 59, 999);

    stats.forEach(function (item, i, arr) {
        if (item.StartedDate <= lastday && item.StartedDate >= firstday) {
            weekTime += item.Effort;
        }
    });
    //  console.log(weekTime);
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

    //  console.log(trackedTime);
    return trackedTime;
}

function getWeekDescriptions(stats) {

    let weekDesc = [[], [], [], [], [], [], []]; // <--- это гармонь

    var curr = new Date; // get current date
    var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week

    var firstday = new Date(curr.setDate(first));
    var lastday = new Date(firstday.getTime() + 6*24*60*60*1000);

    firstday = firstday.setHours(0, 0, 0, 0);
    lastday = lastday.setHours(23, 59, 59, 999);

    stats.forEach(function (item, i, arr) {
        if (item.StartedDate <= lastday && item.StartedDate >= firstday) {
            weekDesc[item.StartedDate.getDay()].push(item);
        }
    });

    var wekDayCacl = weekDesc.map(function (day) {
        var result = day.reduce(function (sum, current) {
            return sum + current.Effort;
        }, 0);

        return result;
    });

    // console.log(weekDesc);
    // console.log(wekDayCacl);
    return { daySumm: wekDayCacl, dayList: weekDesc };
}