"use strict";
/**
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
var edit = require("../teiedit/edit");
var odd = require("../teiedit/odd");
var schema = require("../teiedit/schema");
var tei = require("../teiedit/tei");
var load = require("../teiedit/load");
var system = require("./opensave");
exports.teiData = {
    oddName: '',
    fileName: '',
    dataOdd: null,
    dataTei: null,
    html: null,
    new: true,
    parser: null,
    doc: null,
};
function finishLoad(err, name, data) {
    exports.teiData.fileName = name;
    var el = document.getElementById('filename');
    el.innerHTML = "Fichier: " + name;
    load.loadTei(data, exports.teiData);
    exports.teiData.html = edit.generateHTML(exports.teiData);
    el = document.getElementById('teidata');
    el.innerHTML = exports.teiData.html;
    exports.teiData.new = false;
    //console.log("openfile TEI", teiData.dataTei);
    //console.log(edit.values);
}
function open() {
    system.chooseOpenFile(function (err, name, data) {
        if (!err) {
            if (!exports.teiData.dataOdd) {
                newFile(function () { finishLoad(1, null, null); });
            }
            else {
                finishLoad(0, name, data);
            }
        }
        else
            console.log(name, err);
    });
}
exports.open = open;
;
function newFile(callback) {
    try {
        var ls = localStorage.getItem("previousODD");
        if (ls) {
            var js = JSON.parse(ls);
            if (!js.version || js.version !== schema.version) {
                console.log('ancienne version de localstorage');
                emptyFile();
                if (callback)
                    callback(0);
                return;
            }
            openOddLoad(js.oddName, js.data);
            if (callback)
                callback(0);
        }
        else {
            emptyFile();
        }
    }
    catch (error) {
        console.log(error);
        emptyFile();
        if (callback)
            callback(0);
    }
}
exports.newFile = newFile;
function reLoad(callback) {
    try {
        var ls = localStorage.getItem("previousODD");
        var lx = localStorage.getItem("previousXML");
        var lxname = localStorage.getItem("previousXMLName");
        if (ls && lx) {
            var js = JSON.parse(ls);
            if (!js.version || js.version !== schema.version) {
                console.log('ancienne version de localstorage');
                emptyFile();
                if (callback)
                    callback(0);
                return;
            }
            openOddLoad(js.oddName, js.data);
            finishLoad(0, lxname, lx);
            if (callback)
                callback(0);
        }
        else {
            emptyFile();
        }
    }
    catch (error) {
        console.log(error);
        emptyFile();
    }
}
exports.reLoad = reLoad;
function openOddLoad(name, data) {
    exports.teiData.oddName = name;
    var el = document.getElementById('oddname');
    el.innerHTML = "ODD: " + name;
    exports.teiData.dataOdd = odd.loadOdd(data);
    load.loadTei(null, exports.teiData);
    exports.teiData.html = edit.generateHTML(exports.teiData);
    exports.teiData.fileName = 'nouveau-fichier.xml';
    exports.teiData.new = true;
    el = document.getElementById('filename');
    el.innerHTML = "Fichier: " + exports.teiData.fileName;
    el = document.getElementById('teidata');
    el.innerHTML = exports.teiData.html;
    var js = JSON.stringify({ data: data, oddName: name, version: schema.version });
    localStorage.setItem("previousODD", js);
}
exports.openOddLoad = openOddLoad;
function openOdd() {
    system.chooseOpenFile(function (err, name, data) {
        if (!err) {
            openOddLoad(name, data);
        }
        else
            console.log(name, err);
    });
}
exports.openOdd = openOdd;
;
function emptyFile() {
    var dt = document.getElementById('teidata');
    dt.innerHTML = '';
    exports.teiData.oddName = "Pas de nom de fichier";
    exports.teiData.fileName = 'Pas de nom de fichier';
    exports.teiData.new = true;
    var el = document.getElementById('oddname');
    el.innerHTML = "ODD: " + exports.teiData.oddName;
    el = document.getElementById('filename');
    el.innerHTML = "Fichier: " + exports.teiData.fileName;
}
exports.emptyFile = emptyFile;
function saveAs() {
    system.chooseSaveFile('json', function (err, name) {
        if (!err) {
            exports.teiData.fileName = name;
            var el = document.getElementById('filename');
            el.innerHTML = "Fichier: " + exports.teiData.fileName;
            var ed = tei.generateTEI(exports.teiData);
            console.log(ed);
            system.saveFile(exports.teiData.fileName, ed, null);
        }
        else
            console.log(name, err);
    });
}
exports.saveAs = saveAs;
;
function saveStorage() {
    var ed = tei.generateTEI(exports.teiData);
    localStorage.setItem("previousXML", ed);
    localStorage.setItem("previousXMLName", exports.teiData.fileName);
}
exports.saveStorage = saveStorage;
;
function save() {
    if (!exports.teiData.fileName) {
        var ed = tei.generateTEI(exports.teiData);
        system.saveFile(exports.teiData.fileName, ed, null);
    }
    else
        saveAs();
}
exports.save = save;
;
function saveAsLocal() {
    var ed = tei.generateTEI(exports.teiData);
    // console.log(ed);
    system.saveFileLocal('xml', exports.teiData.fileName, ed);
}
exports.saveAsLocal = saveAsLocal;
;
