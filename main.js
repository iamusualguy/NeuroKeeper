const fs = require('fs');
const Excel = require('exceljs');

const electron = require('electron');
const url = require('url');
const path = require('path');
var $ = require('jquery');
const settings = require("./settings.js");

const { app, BrowserWindow, ipcMain, Tray, Menu } = electron;

ipcMain.on('settings:open', (e, args) => {
    createSettingsWindow();
});

let mainWindow;

function getProjects() {
    xlsj = require("xls-to-json");
    xlsj({
        input: "template.xls",  // input xls 
        output: "output.json", // output json 
        sheet: "Projects"  // specific sheetname 
    }, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result);
        }
    });
}

function createWindow() {

    getProjects();

    tray = new Tray(__dirname + '/icon.png');
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 650,
        height: 150,
        frame: false,
        resizable: false,
        skipTaskbar: true
    });

    mainWindow.webContents.openDevTools();

    tray.setToolTip('Report Keeper')
    const trayContextMenu = createContextMenu(mainWindow)
    tray.setContextMenu(trayContextMenu)
    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));
}

function createSettingsWindow() {
    // Create setting window.
    settingsWindow = new BrowserWindow({
        width: 300,
        height: 500,
        title: 'Settings',
        skipTaskbar: true
    });

    // Load HTML into the window.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'settingsWindow.html'),
        protocol: 'file',
        slashes: true
    }));
}

function createContextMenu(appWindow) {
	return (
		Menu.buildFromTemplate([
			{
				label: 'Settings', click: function () {
					createSettingsWindow();
				}
			},
			{
				label: 'Quit', click: function () {
					app.isQuiting = true;
					app.quit();
				}
			}
		])
	);
}

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});  //закрытие окна и сворачивание в док если это OS X

ipcMain.on('settings:open', (e, args) => {
    settings.createSettingsWindow();
});

ipcMain.on('settings:opened', (e, args) => {
    settings.presentSettings();
});