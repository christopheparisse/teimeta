/**
 * initalone.js
 */

import * as events from './events';
import * as odd from '../teiedit/odd';
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

function oddTeiOral() {
    readTextFile('http://ct3.ortolang.fr/teimeta/teioral.odd', function(text) {
        events.openOddLoad('Odd prédéfini Média', text);
    });
}

function oddPartDesc() {
    readTextFile('http://ct3.ortolang.fr/teimeta/partdesc.odd', function(text) {
        events.openOddLoad('Odd prédéfini Média', text);
    });
}

function setLeftShift(e) {
//    console.log('leftshift', e);
    let v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 50) odd.odd.leftShift = v;
}

function oddParams() {
    syscall.alertUser(`
<h2>Paramètres</h2>
<ul>
    <li>Afficher les chemins complets <i class="fa fa-toggle-on" aria-hidden="true"></i></li>
    <li>Décalage en pixels des imbrications: <input type="text" name="leftshift" onchange="window.ui.setLeftShift(event);"/></li>
</ul>
`);
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
    el = document.getElementById('top2-params');
    el.addEventListener("click", oddParams);

    el = document.getElementById('odd-media');
    el.addEventListener("click", oddMedia);
    el = document.getElementById('odd-teioral');
    el.addEventListener("click", oddTeiOral);
    el = document.getElementById('odd-partdesc');
    el.addEventListener("click", oddPartDesc);
    
    el = document.getElementById('showall');
    el.addEventListener("click", edit.showAll);
    el = document.getElementById('hideall');
    el.addEventListener("click", edit.hideAll);
    el = document.getElementById('upload-input-transcript');
    el.addEventListener("change", syscall.openLocalFile);
    //
    window['ui'].setLeftShift = setLeftShift;
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
