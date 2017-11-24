const Excel = require('exceljs');

function writeRow() {
    let workbook = new Excel.Workbook();
    let filename = 'template.xlsx';
    workbook.xlsx.readFile(filename)
        .then(() => {
            workbook.getWorksheet("Efforts").addRow(["Internal.Development", "1", "test desc","12/12/2017","12/12/2017"]);
            return workbook.xlsx.writeFile(filename);
        })
        .then(() => {
            console.log('File is written');
        })
        .catch(err => console.error(err));
}