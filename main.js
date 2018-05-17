const fs = require('fs');
const Excel = require('exceljs');
const electron = require('electron');
const url = require('url');
const path = require('path');
var $ = require('jquery');
const settings = require("./settings.js");
const nn = require("./neuralNetwork.js");

const { app, BrowserWindow, ipcMain, Tray, Menu } = electron;

const WindowsArray = {
    Main: "main",
    Statistics: "statistics",
    Mode: {
        Hide: "hide",
        Show: "show",
    },
}

let mainWindow;
let statisticsWindow;

function loadStatistics() {
    // Load HTML into the window.
    statisticsWindow && statisticsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'statisticsWindow.html'),
        protocol: 'file',
        slashes: true
    }));
}

function createStatisticsWindow() {
    return new Promise((resolve, reject) => {
        settings.loadSettings().then(() => {
            statisticsWindow = new BrowserWindow({
                width: 650,
                height: 0,
                title: 'Statistics',
                   parent: mainWindow,
                frame: false,
                //   modal: true,
                skipTaskbar: true,
                backgroundColor: '#333',
                show: false,
            });

            //statisticsWindow.webContents.openDevTools();
            loadStatistics();
            resolve();
        });
    });
}

function setStatisticsWindowPosition() {
    if (!statisticsWindow) {
        return;
    }
    let pos = mainWindow.getPosition();
    statisticsWindow.setPosition(pos[0], pos[1] + 135);
    statisticsWindow.setSize(650, 300, true);
}

function createWindow() {
    settings.loadSettings().then(() => {
        tray = new Tray(__dirname + '/icon.png');
        // Create the browser window.
        mainWindow = new BrowserWindow({
            width: 650,
            height: 135,
            frame: false,
            resizable: false,
            skipTaskbar: true,
            show: true,
            alwaysOnTop: settings.getSettings().topMost,
            backgroundColor: '#333',
        });
        mainWindow.setVisibleOnAllWorkspaces(true);

        //mainWindow.webContents.openDevTools();

        tray.setToolTip('Report Keeper')
        const trayContextMenu = createContextMenu(mainWindow)
        tray.setContextMenu(trayContextMenu)

        tray.on('click', () => {
            switchMainAndStatisticsWindows();
        })

        // and load the index.html of the app.
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'mainWindow.html'),
            protocol: 'file',
            slashes: true
        }));
    });
    // nn.createNN();
    // nn.openNN();
    //nn.createLSTN();
}

function createContextMenu(appWindow) {
    return (
        Menu.buildFromTemplate([{
                label: 'Show/Hide',
                click: function () {
                    switchMainAndStatisticsWindows();
                }
            },
            {
                label: 'Settings',
                click: function () {
                    settings.createSettingsWindow(mainWindow);
                }
            },
            {
                label: 'Quit',
                click: function () {
                    app.isQuiting = true;
                    app.quit();
                }
            }
        ])
    );
}

function switchMainAndStatisticsWindows(mainMode, statisticsMode = WindowsArray.Mode.Hide) {
    if (!mainWindow.isVisible()) {
        loadStatistics();
    }
    switchWindow(WindowsArray.Main, mainMode);
    setStatisticsWindowPosition();
    switchWindow(WindowsArray.Statistics, statisticsMode);
}

function switchWindow(window, mode) {
    let currentWindow;
    switch (window) {
        case WindowsArray.Main:
            currentWindow = mainWindow;
            break;
        case WindowsArray.Statistics:
            currentWindow = statisticsWindow;
            break;
        default:
            throw Error("This window doesn't exist");
    }
    if (!currentWindow) {
        return;
    }
    switch (mode) {
        case WindowsArray.Mode.Show:
            currentWindow.show();
            break;
        case WindowsArray.Mode.Hide:
            currentWindow.hide();
            break;
        default:
            currentWindow.isVisible() ? currentWindow.hide() : currentWindow.show();
    }
}

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    //закрытие окна и сворачивание в док если это OS X
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('statistics:switch', (e, args) => {

    let promise = new Promise((resolve, reject) => resolve());
    if (!statisticsWindow) {
        promise = createStatisticsWindow();
    }
    promise.then(() => {
        setStatisticsWindowPosition();
        switchWindow(WindowsArray.Statistics);
    });
});

ipcMain.on('statistics:update', (e, args) => {

    if (!statisticsWindow) {
        createStatisticsWindow();
        return;
    }

    loadStatistics();
});

ipcMain.on('settings:opened', (e, args) => {
    settings.openSettings();
});

ipcMain.on('settings:uploadProjects', (e, args) => {
    settings.uploadProjects();
});

ipcMain.on('settings:cancel', (e, args) => {
    settings.cancelSettings();
});

ipcMain.on('settings:save', (e, args) => {
    settings.saveSettings(args[0], args[1], app);
});

ipcMain.on('mainWindow:hide', (e, args) => {
    switchMainAndStatisticsWindows(WindowsArray.Mode.Hide);
});

ipcMain.on('mainWindow:show', (e, args) => {
    switchMainAndStatisticsWindows(WindowsArray.Mode.Show);
});

ipcMain.on('main:opened', (e, args) => {
    const settingsToSend = settings.getSettings();
    mainWindow.webContents.send('settings:sent', settingsToSend);
});

ipcMain.on('settings:selectPath', (e, args) => {
    settings.selectPath();
});

ipcMain.on('statistics:opened', (e, args) => {
    const settingsToSend = settings.getSettings();
    statisticsWindow.webContents.send('settings:sent', settingsToSend);
});

ipcMain.on('nn:get', (e, args) => {
    nn.getNextString().then((i) => {
        mainWindow.webContents.send("nn:to", i);
    });
});