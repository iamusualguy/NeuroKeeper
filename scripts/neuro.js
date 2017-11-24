const Excel = require('exceljs');

function addHoursToDate(d, h) {
    d.setTime(d.getTime() + (h * 60 * 60 * 1000));
    return d;
}

function GenerateDictionary(text) {
    text = text.replace(/[^a-zA-Z ]/g, "").toLowerCase();
    var tArray = text.split(" ");
    words = tArray.filter((v, i, a) => a.indexOf(v) === i);
    return words;
}