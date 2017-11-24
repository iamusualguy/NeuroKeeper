const Excel = require('exceljs');

function writeRow(newReport) {
    let workbook = new Excel.Workbook();
    let filename = 'template.xlsx';
    workbook.xlsx.readFile(filename)
        .then(() => {
            workbook.getWorksheet("Efforts").addRow(newReport);
            return workbook.xlsx.writeFile(filename);
        })
        .then(() => {
            console.log('File is written');
        })
        .catch(err => console.error(err));
}