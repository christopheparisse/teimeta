/**
 * initalone.js
 */

import * as events from './events';
import * as edit from '../teiedit/edit';
import * as syscall from './opensave';
import * as help from './help';

function bodyKeys(e) {
/*    
    console.log('keyCode '+ e.keyCode);
    console.log('charCode '+ e.charCode);
    console.log('ctrl '+ e.ctrlKey);
    console.log('alt '+ e.altKey);
    console.log('shift '+ e.shiftKey);
    console.log('meta '+ e.metaKey);
    console.log('ident ' + e.keyIdentifier);
*/    
/*    if (e.which === 117 && e.altKey !== true && e.ctrlKey !== true) {
        e.preventDefault();
        teiEdit.insertLineAtEnd(e);
    }
*/  
    if (e.which === 79 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl O
        e.preventDefault();
        events.open();
    }
    if (e.which === 79 && (e.ctrlKey === true || e.metaKey === true) && e.shiftKey === true) { // ctrl shift O
        e.preventDefault();
        events.openOdd();
    }
    if (e.which === 83 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl S
        e.preventDefault();
        events.saveAsLocal();
    }
    if (e.which === 78 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl N
        e.preventDefault();
        events.newFile(null);
    }
}

function readTextFile(file, callback) {
    var rawFile:any = new XMLHttpRequest();
    // rawFile.overrideMimeType("text/xml");
    rawFile.responseType = "text";
    rawFile.open("GET", file, true);
    rawFile.onload = function(e) {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function oddMedia() {
    readTextFile('http://ct3.ortolang.fr/teimeta/media.odd', function(text) {
        events.openOddLoad('Odd prédéfini Média', text);
    });
}

function oddFileDesc() {
    readTextFile('http://ct3.ortolang.fr/teimeta/filedesc.odd', function(text) {
        events.openOddLoad('Odd prédéfini Média', text);
    });
}

function oddPartDesc() {
    readTextFile('http://ct3.ortolang.fr/teimeta/partdesc.odd', function(text) {
        events.openOddLoad('Odd prédéfini Média', text);
    });
}

export function init() {
    // load previous data
    events.newFile(null);
    let el;
    el = document.getElementsByTagName('body');
    el[0].addEventListener("keydown", bodyKeys);
    el = document.getElementById('file-open');
    el.addEventListener("click", events.open);
    el = document.getElementById('file-open-odd');
    el.addEventListener("click", events.openOdd);
    el = document.getElementById('file-saveas');
    el.addEventListener("click", events.saveAsLocal);
    //el = document.getElementById('file-new');
    //el.addEventListener("click", events.newFile);
    el = document.getElementById('help');
    el.addEventListener("click", help.about);

    el = document.getElementById('odd-media');
    el.addEventListener("click", oddMedia);
    el = document.getElementById('odd-filedesc');
    el.addEventListener("click", oddFileDesc);
    el = document.getElementById('odd-partdesc');
    el.addEventListener("click", oddPartDesc);
    
    el = document.getElementById('showall');
    el.addEventListener("click", edit.showAll);
    el = document.getElementById('hideall');
    el.addEventListener("click", edit.hideAll);
    el = document.getElementById('upload-input-transcript');
    el.addEventListener("change", syscall.openLocalFile);
    // for debugging purposes
    window['dbg'] = {};
    window['dbg'].tei = events.teiData;
    window['dbg'].v = edit.values;
}

// in case the document is already rendered
if (document.readyState!='loading')
    init();
else if (document.addEventListener)
    document.addEventListener('DOMContentLoaded', init);