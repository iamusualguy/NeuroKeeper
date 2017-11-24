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
    ArraysToObject(arrays);
}

function ArraysToObject(arrays) {
var res = [];
    for (var i = 0; i < arrays.length - 3; i++) {
        let obj = {};
        let input = [];
        let output = [];

        input = arrays[i + 2][0].concat(arrays[i + 2][1]);

        let descR = arrays[i][2].concat(arrays[i+1][2]);
        if (descR.length < 50) {
            for (; ;) {
                descR.push(0);
                if (descR.length >= 50) break;
            }
        }
        else {
            descR.slice(0, 50);
        }

        input = input.concat(descR);

        output = arrays[i+2][2];

        if (output.length < 25) {
            for (; ;) {
                output.push(0);
                if (output.length >= 25) break;
            }
        }
        else {
            output.slice(0, 25);
        }

        obj.input = input;
        obj.output = output;

        res.push(obj);
    }
console.log(res);
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