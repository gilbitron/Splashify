const electron = require('electron');
const path = require('path');
const storage = require('electron-json-storage');
const {autoUpdater} = require('electron-auto-updater');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let windows = [];

function createWindow() {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;

    var windowWidth = 1024;
    if (windowWidth > width) {
        windowWidth = width;
    }
    var windowHeight = 768;
    if (windowHeight > height) {
        windowHeight = height;
    }

    var mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        minWidth: 500,
        minHeight: 500
    });

    windows.push(mainWindow);

    var url = 'file://' + path.join(__dirname, 'index.html');
    if (process.env.NODE_ENV === 'development') {
        url = 'http://localhost:8080/index.html';
    }

    mainWindow.loadURL(url);

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function() {
        var index = windows.indexOf(mainWindow);
        windows.splice(index, 1);
        mainWindow = null;
    });

    require('./electron/updater');
    mainWindow.webContents.once('did-frame-finish-load', function(event) {
        if (process.env.NODE_ENV === 'development') {
            // For testing. Pretend there is an update.
            setTimeout(function() {
                autoUpdater.emit('update-downloaded', '', '', '1.0.0', '', '');
            }, 2000);
        } else {
            autoUpdater.checkForUpdates();
        }
    });
}

app.on('ready', function() {
    require('./electron/menu');
    require('./electron/image');

    storage.clear(function(error) {
        if (error) throw error;
    });

    createWindow();
});

app.on('window-all-closed', function() {
    app.quit();
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.length < 1) {
        createWindow();
    }
});

ipcMain.on('install-update', (event) => {
    autoUpdater.quitAndInstall();
});
