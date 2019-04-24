//const {ipcRenderer} = electron;
let mainManager = null;
let currentSettings = null;

function saveNewReportHandler() {
    const newRepoprt = mainManager.getReport();
    if (newRepoprt.length === 5 &&
        newRepoprt.every(reportElement => reportElement != "")) {
        writeRow(newRepoprt)
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