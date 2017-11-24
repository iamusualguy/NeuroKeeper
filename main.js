const fs = require('fs');
const Excel = require('exceljs');

const electron = require('electron');
const url = require('url');
const path = require('path');
var $ = require('jquery');

const { app, BrowserWindow } = electron;

let mainWindow;

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 550,
        height: 150,
        frame: false,
        resizable: false
    });

    mainWindow.webContents.openDevTools();

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));
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