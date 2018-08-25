/* use strict */

let fs = require('fs');
// var dialog = require('electron').dialog;
let remote = require('electron').remote;

export let system = 'file';

/**
 * available in main
 */
export function chooseOpenFile(callback) {
    try {
        var fl = remote.dialog.showOpenDialog({
            title: 'Open file',
            filters: [
                { name: 'Xml/Tei Files', extensions: ['xml', 'tei', 'odd'] },
//                { name: 'Csv Files', extensions: ['csv', 'tsv', 'txt'] },
//                { name: 'Json Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: [ 'openFile' ]
        });
        if (fl) {
            openFile(fl[0], callback);
        } else
            callback(1, 'cancelled', null);
    } catch (error) {
        console.log(error);
        callback(1, error, null);
    }
};

export function chooseSaveFile(extension, callback) {
    var filter;
    if (extension === 'json')
        filter = [
                { name: 'Json Files', extensions: ['json'] },
        ];
    else if (extension === 'xml')
        filter = [
                { name: 'Xml/Tei Files', extensions: ['xml', 'tei'] },
        ];
    else if (extension === 'csv')
        filter = [
                { name: 'Csv Files', extensions: ['csv', 'txt'] },
        ];
    else
        filter = [
                { name: 'All Files', extensions: ['*'] },
        ];
    try {
        var fl = remote.dialog.showSaveDialog({
            title: 'Save xml/tei file',
            filters: filter,
        });
        if (fl) {
            callback(0, fl);
        } else
            callback(1, 'cancelled');
    } catch (error) {
        console.log(error);
        callback(1, error);
    }
};

/**
 * available in renderer and main
 */
export function openFile(fname, callback) {
    try {
        var tb = fs.readFileSync(fname, 'utf-8');
        callback(0, fname, tb);
    } catch (error) {
        console.log(error);
        callback(1, error, null);
    }
};

export function saveFile(fname, data, callback = null) {
    try {
        fs.writeFileSync(fname, data, 'utf-8');
        if (callback) callback(0, 'file saved');
    } catch (error) {
        console.log(error);
        if (callback) callback(1, error);
    }
};

export function openLocalFile(fn) {
    // for compatibility
}
