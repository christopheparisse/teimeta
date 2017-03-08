/* global systemCall */

/* use strict */

var fs = require('fs');
var path = require('path');
// var dialog = require('electron').dialog;
var remote = require('electron').remote;

if (typeof windows === 'undefined')
    var systemCall = module.exports;
else if (typeof systemCall === 'undefined')
    var systemCall = {};


/**
 * available in main
 */
systemCall.chooseOpenFile = function(callback) {
    try {
        var fl = remote.dialog.showOpenDialog({
            title: 'Open file',
            filters: [
                { name: 'Xml/Tei Files', extensions: ['tei', 'xml', 'odd'] },
//                { name: 'Csv Files', extensions: ['csv', 'tsv', 'txt'] },
//                { name: 'Json Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: [ 'openFile' ]
        });
        if (fl) {
            systemCall.openFile(fl[0], callback);
        } else
            callback(1, 'cancelled', null);
    } catch (error) {
        console.log(error);
        callback(1, error, null);
    }
};

systemCall.chooseSaveFile = function(extension, callback) {
    var filter;
    if (extension === 'json')
        filter = [
                { name: 'Json Files', extensions: ['json'] },
        ];
    else if (extension === 'xml')
        filter = [
                { name: 'Xml/Tei Files', extensions: ['tei', 'xml'] },
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
            title: 'Save tei file',
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
systemCall.openFile = function(fname, callback) {
    try {
        var tb = fs.readFileSync(fname, 'utf-8');
        callback(0, fname, tb);
    } catch (error) {
        console.log(error);
        callback(1, error, null);
    }
};

systemCall.saveFile = function(fname, data, callback) {
    try {
        fs.writeFileSync(fname, data, 'utf-8');
        if (callback) callback(0, 'file saved');
    } catch (error) {
        console.log(error);
        if (callback) callback(1, error);
    }
};
