const AutoLaunch = require('auto-launch');
const electron = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { BrowserWindow, dialog } = electron;

let settingsWindow;
let currentSettings;

function cancelSettings() {
    settingsWindow.close();
}

function createSettingsWindow(mainWindow) {
    // Create setting window.
    settingsWindow = new BrowserWindow({
        width: 350,
        height: 500,
        title: 'Settings',
        parent: mainWindow,
        modal: true,
        skipTaskbar: true
    });

    // Load HTML into the window.
    settingsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'settingsWindow.html'),
        protocol: 'file',
        slashes: true
    }));
}

function getProjects(inputFilePath) {
    const getProjectsPromise = new Promise((resolve, reject) => {

        xlsj = require("xls-to-json");
        xlsj({
            input: inputFilePath,  // input xls 
            output: null, // output json 
            sheet: "Projects"  // specific sheetname 
        }, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log(result);
                resolve(result);
            }
        });
    });

    return getProjectsPromise;
}

function loadSettings() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'settings.json'), 'utf8', (err, data) => {
            if (err) {
                console.log(err);
                currentSettings = null;
            } else {
                try {
                    currentSettings = JSON.parse(data);
                } catch (e) {
                    currentSettings = null;
                }
            }
            resolve();
        });
    });
}

function saveSettings(settingsToSave, app) {
    const settings = JSON.stringify(settingsToSave);

    if (settings != JSON.stringify(currentSettings)) {
        fs.writeFile(path.join(__dirname, 'settings.json'), settings, function (err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("Settings have been successfully saved.");
            }
            var autoLauncher = new AutoLaunch({
                name: 'neuro-reports'
            });

            autoLauncher.isEnabled().then((result) => {
                if (!result && settingsToSave.autoLaunch) {
                    autoLauncher.enable();
                } else if (result && !settingsToSave.autoLaunch) {
                    autoLauncher.disable();
                }
            });
            app.relaunch();
            app.quit();
        });
        currentSettings = settingsToSave;
    }
    settingsWindow.close();
}

function selectPath() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    },
        (directoryPaths) => {
            settingsWindow.webContents.send('settings:pathSelected', directoryPaths[0]);
        });
}

function openSettings() {
    settingsWindow.webContents.send('settings:present', getSettings());
}

function uploadProjects() {
    dialog.showOpenDialog({
        properties: ['openFile']
    },
        (filePaths) => {
            const getProjectsPromise = getProjects(filePaths[0]);
            getProjectsPromise.then((projects) => {
                settingsWindow.webContents.send('projects:reset', projects.map((value, index) => {
                    return {
                        name: value.Projects,
                        enabled: true
                    };
                }));
            }).catch((error) => {
                console.log(error)
            });
        });
}

defaultSettings = {
    projects: [
        {
            name: 'Internal.Communication',
            enabled: true
        },
        {
            name: 'Internal.Development',
            enabled: true
        },
        {
            name: 'Internal.Investigation',
            enabled: true
        },
        {
            name: 'Internal.Testing',
            enabled: true
        },
        {
            name: 'Internal.Estimation',
            enabled: true
        },
        {
            name: 'Internal.Administration',
            enabled: true
        },
        {
            name: 'Internal.Code review',
            enabled: true
        },
    ],
    realTime: false,
    topMost: true,
    filePath: "template",
    notificationTime: 1,
    newFileEveryWeek: false,
    workTime: 8,
    theme: "Light",
    autoLaunch: true
};

function getSettings() {
    return currentSettings != null ? currentSettings : defaultSettings;
}

module.exports = {
    cancelSettings: cancelSettings,
    createSettingsWindow: createSettingsWindow,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    selectPath: selectPath,
    uploadProjects: uploadProjects,
    getSettings: getSettings,
    openSettings: openSettings,
};