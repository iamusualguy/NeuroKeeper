//const Excel = require('exceljs');

function prepareData() {
    let filename = "file.xlsx";
    var workbook = new Excel.Workbook();
    workbook.xlsx.readFile(filename)
        .then(function (book) {
            debugger;
            worksheet = book.getWorksheet(1);
            for (let i = 0; i < worksheet.rowCount; i++) {
                let row = worksheet.getRow(i);
                for (let io = 0; io < row.cellCount; io++) {
                    console.log(row.getCell(io + 1).value);
                }
            }
        });
}

function addHoursToDate(d, h) {
    d.setTime(d.getTime() + (h * 60 * 60 * 1000));
    return d;
}

//get weekday array 
//param: Date()
function WeekDayArray(d) {
    let res = [0, 0, 0, 0, 0, 0, 0];
    res[d.getDay() - 1] = 1;
    return res;
}

//get hours array 
//param: Date()
function HoursArray(d) {
    var data = [];
    var length = 23; // user defined length

    for (var i = 0; i < length; i++) {
        data.push(0);
    }

    data[d.getHours()] = 1;
    return data;
}

function GenerateDictionary(text) {
    text = text.replace(/[^a-zA-Z ]/g, "").toLowerCase();
    var tArray = text.split(" ");
    words = tArray.filter((v, i, a) => a.indexOf(v) === i);
    return words;
}