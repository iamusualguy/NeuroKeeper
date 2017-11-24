const Excel = require('exceljs');

function getFileName() {
    var d = new Date();
    var filePath = mainManager.settings.filePath;
    return filePath + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + ".xlsx";
}

function writeRow(newReport) {

    let workbook = new Excel.Workbook();
    let filename = getFileName();
    var fs = require('fs');
    var promise = new Promise((resolve,reject) => {
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
                writeEmptyFile(newReport);resolve();
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

            console.log(stats);
        });
}