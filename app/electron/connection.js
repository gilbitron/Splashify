const electron = require('electron');
const ElectronOnline = require('electron-online');
const util = require('./util');

const ipcMain = electron.ipcMain;
const connection = new ElectronOnline();

connection.on('online', () => {
    notifyConnectionStatus();
});

connection.on('offline', () => {
    notifyConnectionStatus();
});

ipcMain.on('get-connection-status', (event) => {
    event.sender.send('connection-status', connection.status.toLowerCase());
});

function notifyConnectionStatus() {
    util.webContentsSend('connection-status', connection.status.toLowerCase());
}
