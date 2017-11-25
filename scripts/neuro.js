//const Excel = require('exceljs');

var Dictionary ;

function gI(){
    return prepareData().then(function () {
        return generateInput();
    });
}
function generateInput() {
    var DATA = [];
    var workbook = new Excel.Workbook();
    return workbook.xlsx.readFile("report-11-2017demo.xlsx")
        .then((book) => {
            worksheet = book.getWorksheet('Efforts');
            for (let i = worksheet.rowCount; i >= 2; i--) {
                let row = worksheet.getRow(i);
                let rowData = {};
                let proj = row.getCell('A').value;//s.substr(s.indexOf('.')+1,s.length)
                if (proj != null  && row.getCell('B').value != null){
                rowData.Task = proj.substr(proj.indexOf('.') + 1, proj.length);
                rowData.Desc = row.getCell('C').value;
                rowData.Time = row.getCell('B').value;
                rowData.Date = row.getCell('D').value;

                DATA.push(rowData);
                }
            }
            var d = getHoursArray(new Date());
            var t = getWeekDayArray(new Date());

           var v = d.concat(t);
           var o =  DataToArrays(DATA, Dictionary)[0].input;
               o = o.slice(30);
         return  v.concat(o);
        });
}

function prepareData() {
    let allDesc = "";
    let filename = "6file.xlsx";
    Dictionary = [];
    var workbook = new Excel.Workbook();
    return workbook.xlsx.readFile(filename)
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

            return DataToArrays(DATA, Dictionary);
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
    return ArraysToObject(arrays);
}

function ArraysToObject(arrays) {
    var res = [];
    for (var i = 0; i < arrays.length - 3; i++) {
        let obj = {};
        let input = [];
        let output = [];

        input = arrays[i + 2][0].concat(arrays[i + 2][1]);

        let descR = arrays[i][2].concat(arrays[i + 1][2]);
        if (descR.length < 50) {
            for (; ;) {
                descR.push(0);
                if (descR.length >= 50) break;
            }
        }
        else {
            descR = descR.slice(0, 50);
        }

        input = input.concat(descR);

        output = arrays[i + 2][2];

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
    return res;
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
    let tArray = text.split(" ");
    return tArray.map((word) => {
        return dictionary.indexOf(word)
    })
}

function normilize(array) {
    resSum = [];
    array = array.map((v) => {
        let obj = {};
        let res = [];
        let objSum = {};

        let sum = v.input.reduce((a, b) => a + b, 0);
        objSum.input = sum;
        obj.input = v.input.map((val) => {
            return val / sum;
        });

        sum = v.output.reduce((a, b) => a + b, 0);
        objSum.output = sum;
        obj.output = v.output.map((val) => {
            return val / sum;
        });
        resSum.push(objSum);
        return obj;
    })
    const res = [];
    res.push(array);
    res.push(resSum);
    return res;
}

function toWords(array, sum) {
    return array.map((val) => {
        return Dictionary[Math.round(val*sum)];
    })
}

module.exports = {
    prepareData: prepareData,
    normilize: normilize,
    toWords: toWords,
}