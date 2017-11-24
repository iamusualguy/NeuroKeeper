let mainManager;

ipcRenderer.on('settings:returnDefault', (e, settings) => {
    mainManager = new reportManager(settings);
});

function saveNewReport() {
    const newRepoprt = mainManager.getReport();
    if(newRepoprt.length === 5
        && newRepoprt.every(reportElement => reportElement!= ""))
    {
        writeRow(newRepoprt)
        .then(() => {
            console.log('File is written');
            ipcRenderer.send('mainWindow:hide', {});
        })
        .catch(err => alert("Error of record saving. Try to close report file and save record again.\r\n" + err));
    } else {
        alert("You didn't fill some field. Please fill all fields and save record again.");
    }
}
