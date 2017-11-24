defaultSettings = {
    projects: ["Internal.Communication","Internal.Development","Internal.Investigation","Internal.Testing","Internal.Estimation","Internal.Administration","Internal.Code review"],
    realTime: false,
    topMost: false,
    filePath: "",
    notificationTime: 1,
    newFileEveryWeek: false,
    workTime: 8,
    theme: "Light",
}

function saveNewReport() {
    const newRepoprt = getReport();
    writeRow(newRepoprt);
}

function getReport() {
    const reportTask = document.getElementById('task-input').value;
    const reportDuration = document.getElementById('duration-input').value;
    const reportText = document.getElementById('report-input').value;
    const reportDate = document.getElementById('date-input').value;

    return [reportTask, reportDuration, reportText,reportDate,reportDate];
}