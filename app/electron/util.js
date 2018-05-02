const {webContents} = require('electron');

module.exports = {
    webContentsSend: function(channel, args) {
        var allWebContents = webContents.getAllWebContents();
        for (var i in allWebContents) {
            allWebContents[i].send(channel, args);
        }
    }
}
