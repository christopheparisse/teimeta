/**
 * 
 */

import * as edit from '../teiedit/edit';
import * as odd from '../teiedit/odd';
import * as tei from '../teiedit/tei';
import * as system from './opensave';

export let teiData = {
    oddName: '',
    fileName: '',
    dataOdd: null,
    dataTei: null,
    html: null,
    new: true,
    parser: null,
    doc: null,
};

function finish(err, name, data) {
    teiData.fileName = name;
    let el = document.getElementById('filename');
    el.innerHTML = "Fichier: " + name;
    tei.load(data, teiData);
    teiData.html = edit.generateHTML(teiData.dataTei);
    el = document.getElementById('teidata');
    el.innerHTML = teiData.html;
    teiData.new = false;
    //console.log("openfile TEI", teiData.dataTei);
    //console.log(edit.values);
}

export function open() {
    system.chooseOpenFile(function(err, name, data) {
        if (!err) {
            if (!teiData.dataOdd) {
                newFile(function() { finish(1, null, null); } );
            } else {
                finish(0, name, data);
            }
        } else
            console.log(name, err);
    });
};

export function newFile(callback) {
    try {
        let ls = localStorage.getItem("previousODD");
        if (ls) {
            var js = JSON.parse(ls);
            openOddLoad(js.oddName, js.data);
            if (callback) callback(0);
        } else {
            emptyFile();
        }
    } catch (error) {
        emptyFile();
    }
}

export function openOddLoad(name, data) {
    teiData.oddName = name;
    let el = document.getElementById('oddname');
    el.innerHTML = "ODD: " + name;
    teiData.dataOdd = odd.loadOdd(data);
    tei.load(null, teiData);
    teiData.html = edit.generateHTML(teiData.dataTei);
    teiData.fileName = 'nouveau-fichier.xml';
    teiData.new = true;

    el = document.getElementById('filename');
    el.innerHTML = "Fichier: " + teiData.fileName;
    el = document.getElementById('teidata');
    el.innerHTML = teiData.html;
    //console.log("openOddLoad ODD", teiData.dataOdd);
    //console.log("openOddLoad TEI", teiData.dataTei);
    //console.log(edit.values);
}

export function openOdd() {
    system.chooseOpenFile(function(err, name, data) {
        if (!err) {
            openOddLoad(name, data);
            let js = JSON.stringify({data: data, oddName: name});
            localStorage.setItem("previousODD", js);
        } else
            console.log(name, err);
    });
};

export function emptyFile() {
    let dt = document.getElementById('teidata');
    dt.innerHTML = '';
    teiData.oddName = "Pas de nom de fichier";
    teiData.fileName = 'Pas de nom de fichier';
    teiData.new = true;
    let el = document.getElementById('oddname');
    el.innerHTML = "ODD: " + teiData.oddName;
    el = document.getElementById('filename');
    el.innerHTML = "Fichier: " + teiData.fileName;
}

export function saveAs() {    
    system.chooseSaveFile('json', function(err, name) {
        if (!err) {
            teiData.fileName = name;
            let el = document.getElementById('filename');
            el.innerHTML = "Fichier: " + teiData.fileName;
            var ed = tei.generateTEI(teiData);
            system.saveFile(teiData.fileName, ed, null);
        } else
            console.log(name, err);
    });
};

export function save() {
    var fileok = true;
    if (!teiData.fileName) {
            var ed = tei.generateTEI(teiData);
            system.saveFile(teiData.fileName, ed, null);
    } else
        saveAs();
};

export function saveAsLocal() {
    var ed = tei.generateTEI(teiData);
    // console.log(ed);
    system.saveFileLocal('xml', teiData.fileName, ed);
};
