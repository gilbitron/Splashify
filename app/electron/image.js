const electron = require('electron');
const path = require('path');
const fs = require('fs');
const {download} = require('electron-dl');
const wallpaper = require('wallpaper');
const Jimp = require('jimp');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

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
        .catch(error => {
			event.sender.send('image-error', error);
		});
});

ipcMain.on('get-wallpaper', (event) => {
    wallpaper.get()
        .then(imagePath => {
            event.sender.send('current-wallpaper', imagePath);
        })
		.catch(error => {
			event.sender.send('image-error', error);
		});
});

ipcMain.on('set-wallpaper', (event, imagePath, displayId) => {
    // Resize image
    Jimp.read(imagePath)
		.then(image => {
            const display = electron.screen.getPrimaryDisplay();
			let {width, height} = display.size;
	        width *= display.scaleFactor;
	        height *= display.scaleFactor;

	        image.cover(width, height)
	             .quality(100)
	             .write(imagePath);

	        wallpaper.set(imagePath)
	                 .then(() => {
	                     event.sender.send('wallpaper-updated', imagePath);
	                 })
					 .catch(error => {
			 			event.sender.send('image-error', error);
			 		 });
	    })
		.catch(error => {
			event.sender.send('image-error', error);
		});
});
