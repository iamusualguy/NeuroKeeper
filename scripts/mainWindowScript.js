//const {ipcRenderer} = electron;
let mainManager = null;
let currentSettings = null;

function saveNewReportHandler() {
    const newReport = mainManager.getReport();
    if (newReport.length === 4 &&
        newReport.every(reportElement => reportElement != "")) {
        writeRow(newReport)
            .then(() => {
                updateStatisticsHandler();
                minimazeHandler();
                mainManager.resetFields();
            })
            .catch(err => alert("Error of record saving. Try to close report file and save record again.\r\n" + err));
    } else {
        alert("You didn't fill some field. Please fill all fields and save record again.");
    }
}

function startNewDayHandler() {
    mainManager.startNewDay();
}

function minimazeHandler() {
    ipcRenderer.send('mainWindow:hide', {});
}

function pauseDayHandler() {
    mainManager.pause();
}

function switchStatisticsHandler() {
    ipcRenderer.send('statistics:switch', {});
}

function updateStatisticsHandler() {
    ipcRenderer.send('statistics:update', {});
}