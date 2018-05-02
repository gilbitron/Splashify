const electron = require('electron');
const os = require('os');
const {autoUpdater} = require('electron-auto-updater');
const util = require('./util');

const app = electron.app;

const UPDATE_SERVER_HOST = 'splashify-updates.herokuapp.com';
const platform = os.platform();
const version = app.getVersion();

if (process.env.NODE_ENV !== 'development' && platform !== 'linux') {
    autoUpdater.addListener('update-available', function(event) {
        console.log('update-available');
    });
    autoUpdater.addListener('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateURL) {
        console.log('update-downloaded');
        util.webContentsSend('update-available', `A new update is ready to install (${releaseName})`);
    });
    autoUpdater.addListener('error', function(error) {
        console.log(error);
    });
    autoUpdater.addListener('checking-for-update', function(event) {
        console.log('checking-for-update');
    });
    autoUpdater.addListener('update-not-available', function() {
        console.log('update-not-available');
    });

    if (platform === 'darwin') {
        autoUpdater.setFeedURL(`https://${UPDATE_SERVER_HOST}/update/${platform}_${os.arch()}/${version}`);
    }
}
