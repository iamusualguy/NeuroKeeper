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

const mainManager = new reportManager(defaultSettings);

function saveNewReport() {
    const newRepoprt = mainManager.getReport();
    writeRow(newRepoprt);
}
