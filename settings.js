const AutoLaunch = require('auto-launch');
const electron = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const xlsj = require("xls-to-json");
const storage = require('electron-json-storage');

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
        height: 400,
        title: 'Settings',
        parent: mainWindow,
        modal: true,
        frame: false,
        skipTaskbar: true,
        backgroundColor: '#333',
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
        storage.get('neuro-keeper-settings', function (error, data) {
            if (error) {
                console.log(error);
                currentSettings = null;
            }

            if (!data.filePath) {
                currentSettings = null;
            } else {
                currentSettings = data;
            }

            resolve();
        });
    });
}

function saveSettings(settingsToSave, timeStamp, app) {
    if (!timeStamp) {
        settingsToSave.timeStamp = currentSettings ? currentSettings.timeStamp : defaultSettings.timeStamp;
    }
    if (JSON.stringify(settingsToSave) != JSON.stringify(currentSettings)) {

        storage.set('neuro-keeper-settings', settingsToSave, function (error) {
            if (error) {
                console.log(error);
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

            if (!timeStamp) {
                app.relaunch();
                app.quit();
            }
        });
        currentSettings = settingsToSave;
    }
    if (settingsWindow) {
        settingsWindow.close();
    }
}

function selectPath() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    },
        (directoryPaths) => {
            if (directoryPaths) {
                settingsWindow.webContents.send('settings:pathSelected', directoryPaths[0] + "\\");
            }
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
            if (!filePaths) return;
            const getProjectsPromise = getProjects(filePaths[0]);
            setTimeout(() => {
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
            }, 100);
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
    filePath: __dirname + "\\",
    notificationTime: 1.0,
    newFileEveryWeek: false,
    workTime: 8.0,
    theme: "Dark",
    autoLaunch: true,
    timeStamp: new Date()
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