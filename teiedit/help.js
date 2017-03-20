/**
 * help.js
 */

if (typeof window === 'undefined') {
    var help = module.exports;
    var electron = require('electron');
    var dialog = electron.dialog;
} else if (typeof help === 'undefined') {
    var help = {};
}

help.version = '0.1.0 - 15-03-2017';

help.shortHelp = function() {
    var s = "Version : " + help.version + " \n\n\
Version prototype de tei-meta en javascript.";
    alertUser(s);
};

function alertUser(s) {
    if (typeof alert !== 'undefined')
        alert(s);
    else
        dialog.showErrorBox('teiEdit', s);
}