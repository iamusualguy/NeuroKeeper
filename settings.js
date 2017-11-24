const electron = require('electron');
const path = require('path');
const url = require('url');

const { BrowserWindow } = electron;

function createSettingsWindow() {
    // Create setting window.
    settingsWindow = new BrowserWindow({
        width: 300,
        height: 500,
        title: 'Settings'
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

function presentSettings() {
    settingsWindow.webContents.send('settings:present', defaultSettings);
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
    topMost: false,
    filePath: "",
    notificationTime: 1,
    newFileEveryWeek: false,
    workTime: 8,
    theme: "Light",
};

module.exports = {
    defaultSettings: defaultSettings,
    createSettingsWindow: createSettingsWindow,
    presentSettings: presentSettings,
    uploadProjects: uploadProjects
};