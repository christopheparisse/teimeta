/* global teiEdit */
/* global TableData */
/* global $ */

import * as edit from '../teimeta/edit.ts';
import * as odd from '../teimeta/odd.ts';
import * as tei from '../teimeta/tei.ts';
import * as systemCall from '../systemcall/opensavelocal.js';

var teiData = {
    oddName: '',
    fileName: '',
    dataOdd: null,
    dataTei: null,
    html: null,
};

export function tableElementKeys(e) {
    /*
    console.log('keyCode '+ e.keyCode);
    console.log('charCode '+ e.charCode);
    console.log('ctrl '+ e.ctrlKey);
    console.log('alt '+ e.altKey);
    console.log('shift '+ e.shiftKey);
    console.log('meta '+ e.metaKey);
    console.log('ident ' + e.keyIdentifier);
    */
    if (e.which === 117 && e.shiftKey !== true) {
        e.preventDefault();
        insertLine(e);
    }
    if (e.which === 117 && e.shiftKey === true) {
        e.preventDefault();
        deleteLine(e);
    }
};

export function test() {
    openOddDefault();
};

export function open() {    
    systemCall.chooseOpenFile(function(err, name, data) {
        if (!err) {
            function finish(err) {
                teiData.fileName = name;
                $('#filename').html("Fichier: " + name);
                console.log(teiData.dataOdd);
                teiData.dataTei = tei.load(data, teiData.dataOdd);
                console.log(teiData.dataTei);
                teiData.html = edit.generateHTML(teiData.dataTei);
                console.log(teiData.dataTei);
                $('#teidata').html(teiData.html);
            } 
            if (!teiData.dataOdd) {
                openOddDefault(finish);
            } else {
                finish(0);
            }
        } else
            console.log(name, err);
    });
};

export function openOddDefault(callback) {
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
    $('#oddname').html("ODD: " + name);
    teiData.dataOdd = odd.loadOdd(data);
    console.log(teiData.dataOdd);
    teiData.dataTei = tei.load(null, teiData.dataOdd);
    console.log(teiData.dataTei);
    teiData.html = edit.generateHTML(teiData.dataTei);
    $('#teidata').html(teiData.html);
}

export function openOdd() {
    systemCall.chooseOpenFile(function(err, name, data) {
        if (!err) {
            openOddLoad(name, data);
            let js = JSON.stringify({data: data, oddName: name});
            localStorage.setItem("previousODD", js);
        } else
            console.log(name, err);
    });
};

export function emptyFile() {
    var dt = $('#odddata');
    dt.html('<p>ODD DATA VIDE</p>');
    var dt = $('#teidata');
    dt.html('<p>TEI DATA VIDE</p>');
    teiData.oddName = "Pas de nom de fichier";
    $('#oddname').html("ODD: " + name);
    teiData.fileName = 'Pad de nom de fichier';
    $('#filename').html("Fichier: " + name);
}

export function newFile() {
    function finish(err) {
        teiData.fileName = "Nouveau fichier";
        $('#filename').html("Fichier: " + name);
        console.log(teiData.dataOdd);
        teiData.dataTei = tei.load(null, teiData.dataOdd);
        console.log(teiData.dataTei);
        teiData.html = edit.generateHTML(teiData.dataTei);
        console.log(teiData.dataTei);
        $('#teidata').html(teiData.html);
    } 
    openOddDefault(finish);
}

export function saveAs() {    
    systemCall.chooseSaveFile('json', function(err, name) {
        if (!err) {
            teiData.fileName = name;
            $('#filename').html("Fichier: " + teiData.fileName);
            var ed = tei.generateTEI(teiData.dataTei);
            console.log(ed);
            systemCall.saveFile(teiData.fileName, ed);
        } else
            console.log(name, err);
    });
};

export function save() {
    var fileok = true;
    if (!teiData.fileName) {
            var ed = tei.generateTEI(teiData.dataTei);
            systemCall.saveFile(teiData.fileName, ed);
    } else
        saveAs();
};

export function saveAsLocal() {
    var ed = tei.generateTEI(teiData.dataTei);
    systemCall.saveFileLocal('xml', teiData.fileName, ed);
};
