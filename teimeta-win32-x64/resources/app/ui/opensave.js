"use strict";
/* global systemCall */
Object.defineProperty(exports, "__esModule", { value: true });
/* use strict */
var fs = require('fs');
var path = require('path');
// var dialog = require('electron').dialog;
var remote = require('electron').remote;
var saveAs = require('file-saver');
var picoModal = require('picomodal');
/**
 * available in main
 */
function chooseOpenFile(callback) {
    try {
        var fl = remote.dialog.showOpenDialog({
            title: 'Open file',
            filters: [
                { name: 'Xml/Tei Files', extensions: ['tei', 'xml', 'odd'] },
                //                { name: 'Csv Files', extensions: ['csv', 'tsv', 'txt'] },
                //                { name: 'Json Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        });
        if (fl) {
            openFile(fl[0], callback);
        }
        else
            callback(1, 'cancelled', null);
    }
    catch (error) {
        console.log(error);
        callback(1, error, null);
    }
}
exports.chooseOpenFile = chooseOpenFile;
;
function chooseSaveFile(extension, callback) {
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
        }
        else
            callback(1, 'cancelled');
    }
    catch (error) {
        console.log(error);
        callback(1, error);
    }
}
exports.chooseSaveFile = chooseSaveFile;
;
/**
 * available in renderer and main
 */
function openFile(fname, callback) {
    try {
        var tb = fs.readFileSync(fname, 'utf-8');
        callback(0, fname, tb);
    }
    catch (error) {
        console.log(error);
        callback(1, error, null);
    }
}
exports.openFile = openFile;
;
function saveFile(fname, data, callback) {
    try {
        fs.writeFileSync(fname, data, 'utf-8');
        if (callback)
            callback(0, 'file saved');
    }
    catch (error) {
        console.log(error);
        if (callback)
            callback(1, error);
    }
}
exports.saveFile = saveFile;
;
function saveFileLocal(type, name, data) {
    var blob = new Blob([data], {
        type: "text/plain;charset=utf-8"
    });
    // {type: 'text/css'});
    var p1 = name.lastIndexOf('/');
    var p2 = name.lastIndexOf('\\');
    if (p1 < p2)
        p1 = p2;
    if (p1 === -1)
        p1 = 0;
    var l = name.substr(p1);
    saveAs.saveAs(blob, l);
}
exports.saveFileLocal = saveFileLocal;
;
function alertUser(s) {
    picoModal(s).show();
    //    dialog.showErrorBox('teiEdit', s);
}
exports.alertUser = alertUser;
function alertUserModal(s, fun) {
    picoModal(s).afterClose(function () { return fun(); }).show();
}
exports.alertUserModal = alertUserModal;
function openLocalFile(fn) {
    // for compatibility
}
exports.openLocalFile = openLocalFile;
function askUser(s) {
    if (confirm(s) === true)
        return true;
    else
        return false;
    //    dialog.showXXXXBox('teiEdit', s);
}
exports.askUser = askUser;
function askUserModal(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p class='footer'>" +
            "<button class='cancel'>Cancel</button> " +
            "<button class='ok'>Ok</button>" +
            "</p>"
    }).afterCreate(function (modal) {
        modal.modalElem().addEventListener("click", function (evt) {
            if (evt.target && evt.target.matches(".ok")) {
                modal.close(true);
            }
            else if (evt.target && evt.target.matches(".cancel")) {
                modal.close();
            }
        });
    }).afterClose(function (modal, event) {
        fun(event.detail ? true : false);
    }).show();
}
exports.askUserModal = askUserModal;
