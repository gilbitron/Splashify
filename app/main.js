const electron = require('electron');
const path = require('path');
const fs = require('fs');
const {download} = require('electron-dl');
const storage = require('electron-json-storage');
const wallpaper = require('wallpaper');
const Jimp = require('jimp');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let mainWindow;

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

    mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        minWidth: 500,
        minHeight: 500
    });

    var url = 'file://' + path.join(__dirname, 'index.html');
    if (process.env.NODE_ENV === 'development') {
        url = 'http://localhost:8080/app/index.html';
    }

    mainWindow.loadURL(url);

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

app.on('ready', function() {
    require('./menu');

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
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('download-image', (event, imageUrl) => {
    let basePath = path.join(app.getPath('pictures'), 'Splashify');

    // Create Splashify dir if it doesn't exist
    try {
        fs.accessSync(basePath, fs.F_OK);
    } catch (e) {
        fs.mkdir(basePath);
    }

    let imagePath = basePath + path.sep + path.basename(imageUrl) + '.jpeg';

    // Delete existing image if it exists
    try {
        fs.accessSync(imagePath, fs.F_OK);
        fs.unlinkSync(imagePath);
    } catch (e) {}

    download(BrowserWindow.getFocusedWindow(), imageUrl, {directory: basePath})
        .then(dl => {
            event.sender.send('image-downloaded', dl.getSavePath());
        })
        .catch(console.error);
});

ipcMain.on('get-wallpaper', (event) => {
    wallpaper.get()
        .then(imagePath => {
            event.sender.send('current-wallpaper', imagePath);
        })
        .catch(console.error);
});

ipcMain.on('set-wallpaper', (event, imagePath, displayId) => {
    // Resize image
    Jimp.read(imagePath, (err, image) => {
        if (err) throw err;

        const {width, height} = electron.screen.getPrimaryDisplay().size;

        image.cover(width, height)
             .quality(100)
             .write(imagePath);

        wallpaper.set(imagePath)
                 .then(() => {
                     event.sender.send('wallpaper-updated', imagePath);
                 })
                 .catch(console.error);
    });
});
