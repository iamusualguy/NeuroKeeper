function getStatistics(path) {
    let workbook = new Excel.Workbook();
    let filename = path;
    return workbook.xlsx.readFile(filename)
        .then(() => {
            worksheet = book.getWorksheet(1);
            for (let i = 1; i < worksheet.rowCount; i++) {
                let row = worksheet.getRow(i);
                let rowData = {};
                rowData.ProjectTask = row.getCell('A').value;
                rowData.Effort = row.getCell('B').value;
                rowData.Description = row.getCell('C').value;
                rowData.StartedDate = row.getCell('D').value;
            }
        });
}