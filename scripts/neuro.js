//const Excel = require('exceljs');

var Dictionary = [];


function prepareData() {
    let allDesc = "";
    let filename = "file.xlsx";
    var workbook = new Excel.Workbook();
    workbook.xlsx.readFile(filename)
        .then(function (book) {
            var DATA = [];
            worksheet = book.getWorksheet(1);

            for (let i = 1; i < worksheet.rowCount; i++) {
                let row = worksheet.getRow(i);
                let rowData = {};
                rowData.Task = row.getCell('A').value;
                rowData.Desc = row.getCell('B').value;
                rowData.Time = row.getCell('C').value;
                rowData.Date = row.getCell('D').value;

                allDesc += rowData.Desc;

                DATA.push(rowData);
            }
            Dictionary = GenerateDictionary(allDesc);

            DataToArrays(DATA, Dictionary);
            //   console.log(DATA);
            
            console.log(Dictionary);
        });
}

function DataToArrays(data, dictionary) {
    let arrays = [];
    let flagDate = new Date();

    data.forEach(function (item, i, arr) {
        let itemDate = new Date(item.Date);
        if (itemDate.getDate() + itemDate.getFullYear() != flagDate.getDate() + flagDate.getFullYear()) {
            flagDate = itemDate;
            flagDate = addHoursToDate(flagDate, 9);
        }

        let Hours = getHoursArray(flagDate);
        let WeekDays = getWeekDayArray(new Date(item.Date));
        let Description = replaceWordToInt(item.Desc, dictionary);
        flagDate = addHoursToDate(flagDate, item.Time);
        //console.log(flagDate+" - "+itemDate+" = "+item.Time);
        arrays.push([WeekDays, Hours, Description]);

    });
    console.log(arrays);
}

function addHoursToDate(d, h) {
    d.setTime(d.getTime() + (h * 60 * 60 * 1000));
    return d;
}

//get weekday array 
//param: Date()
function getWeekDayArray(d) {
    let res = [0, 0, 0, 0, 0, 0, 0];
    res[d.getDay() - 1] = 1;
    return res;
}

//get hours array 
//param: Date()
function getHoursArray(d) {
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

function replaceWordToInt(text, dictionary) {
    text = text.replace(/[^a-zA-Z ]/g, "").toLowerCase();
    var tArray = text.split(" ");
    intWords = tArray.map(function (word, i) {
        return dictionary.indexOf(word)
    })
    return intWords;
}