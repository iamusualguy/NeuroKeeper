const electron = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { BrowserWindow } = electron;

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

function getProjects() {
    const getProjectsPromise = new Promise((resolve, reject) => { 
        
        xlsj = require("xls-to-json");
        xlsj({
            input: "template.xls",  // input xls 
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
    fs.readFile(path.join(__dirname, 'settings.json'), 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            currentSettings = defaultSettings;
        } else {
            currentSettings = JSON.parse(data);
        }

        settingsWindow.webContents.send('settings:present', currentSettings);
    });
}

function saveSettings(settingsToSave) {
    fs.writeFile(path.join(__dirname, 'settings.json'), JSON.stringify(settingsToSave), function(err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Settings have been successfully saved.");
        }
    }); 

    settingsWindow.close();
}

function uploadProjects() {
    const getProjectsPromise = getProjects();
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
    filePath: "template.xls",
    notificationTime: 1,
    newFileEveryWeek: false,
    workTime: 8,
    theme: "Light",
};

currentSettings = null;

module.exports = {
    cancelSettings: cancelSettings,
    createSettingsWindow: createSettingsWindow,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    uploadProjects: uploadProjects,

    currentSettings: currentSettings,
    defaultSettings: defaultSettings
};