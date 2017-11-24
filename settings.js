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

function presentSettings() {
    settingsWindow.webContents.send('projects:add', defaultSettings.projects);
}

defaultSettings = {
    projects: [
        'Internal.Communication',
        'Internal.Development',
        'Internal.Investigation',
        'Internal.Testing',
        'Internal.Estimation',
        'Internal.Administration',
        'Internal.Code review'
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
    presentSettings: presentSettings
};