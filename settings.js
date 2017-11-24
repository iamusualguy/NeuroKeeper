const AutoLaunch = require('auto-launch');
const electron = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const xlsj = require("xls-to-json");
const storage = require('electron-json-storage');

const { BrowserWindow, dialog } = electron;

let settingsWindow;

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
        xlsj({
            input: inputFilePath,  // input xls 
            output: "output.json", // output json 
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
    storage.get('neuro-keeper-settings', function(error, data) {
        if (error) {
            console.log(error);
            currentSettings = defaultSettings;
        }

        if (!data.filePath) {
            currentSettings = defaultSettings;
        } else {
            currentSettings = data;
        }

        settingsWindow.webContents.send('settings:present', currentSettings);
    });

    /*
    fs.readFile(path.join(__dirname, 'settings.json'), 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            currentSettings = defaultSettings;
        } else {
            try {
                currentSettings = JSON.parse(data);
            } catch (e) {
                currentSettings = defaultSettings;
            }
        }

        settingsWindow.webContents.send('settings:present', currentSettings);
    });
    */
}

function saveSettings(settingsToSave) {
    storage.set('neuro-keeper-settings', settingsToSave, function(error) {
        if (error) {
            console.log(error);
        }
    });

    /*
    fs.writeFile(path.join(__dirname, 'settings.json'), JSON.stringify(settingsToSave), function(err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Settings have been successfully saved.");
        }
    });
    */

    var autoLauncher = new AutoLaunch({
        name: 'neuro-reports'
    });

    autoLauncher.isEnabled().then((result) => {
        if (!result && settingsToSave.autoLaunch) {
            autoLauncher.enable();
        } else if (result && !settingsToSave.autoLaunch) {
            autoLauncher.disable();
        }
    });

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

function uploadProjects() {
    dialog.showOpenDialog({
        properties: ['openFile']
        },
        (filePaths) => {
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
    filePath: "template",
    notificationTime: 1,
    newFileEveryWeek: false,
    workTime: 8,
    theme: "Light",
    autoLaunch: true
};

currentSettings = null;

module.exports = {
    cancelSettings: cancelSettings,
    createSettingsWindow: createSettingsWindow,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    selectPath: selectPath,
    uploadProjects: uploadProjects,

    currentSettings: currentSettings,
    defaultSettings: defaultSettings
};