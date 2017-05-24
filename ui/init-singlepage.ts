/**
 * initalone.js
 */

import * as events from './events';
import * as odd from '../teiedit/odd';
import * as edit from '../teiedit/edit';
import * as syscall from './opensave';
import * as help from './help';
let picoModal = require('../js/picoModal.js');

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
        events.openOddLoad('Odd prédéfini Tei Oral', text);
    });
}

function oddPartDesc() {
    readTextFile('http://ct3.ortolang.fr/teimeta/partdesc.odd', function(text) {
        events.openOddLoad('Odd prédéfini Participants', text);
    });
}

// to check if parameters are changed
let changeParams = false;

function setLeftShift(e) {
//    console.log('leftshift', e);
    let v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 100) {
        if (odd.odd.params.leftShift !== v) {
            changeParams = true;
            odd.odd.params.leftShift = v;
        }
    }
}

function setDispFPath(e) {
    let s = document.getElementById('toggleDispFPath');
    if (odd.odd.params.displayFullpath) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.displayFullpath = false;
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.displayFullpath = true;
    }
    changeParams = true;
}

function setDefNewElt(e) {
    let s = document.getElementById('toggleDefNewElt');
    if (odd.odd.params.defaultNewElement) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.defaultNewElement = false;
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.defaultNewElement = true;
    }
    changeParams = true;
}

function setValReq(e) {
    let s = document.getElementById('toggleDefValReq');
    if (odd.odd.params.validateRequired) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.validateRequired = false;
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.validateRequired = true;
    }
    changeParams = true;
}

function setCanRm(e) {
    let s = document.getElementById('toggleDefCanRm');
    if (odd.odd.params.canRemove) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.canRemove = false;
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.canRemove = true;
    }
    changeParams = true;
}

function setLgEng(e) {
    let s = document.getElementById('toggleLgEng');
    if (odd.odd.params.language === 'en') {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.language = 'fr';
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.language = 'en';
    }
    changeParams = true;
}

let paramsPicomodal = null;

function oddParams() {
    if (!paramsPicomodal) {
        // for the first time do not used DOM functions
        // use only picoModal initiatilisation of a HTML string
let userInfo = `
<h2 style="margin-top: 0">Paramètres</h2>
<ul>
    <li onclick="window.ui.setDispFPath();">Afficher les chemins complets <span id="toggleDispFPath">`
    + ((odd.odd.params.displayFullpath)
        ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
        : '<i class="fa fa-square-o" aria-hidden="true"></i>')
+ `</span></li>
    <li>Décalage en pixels des imbrications: <input type="number" min="0" max="100" value="`
    + odd.odd.params.leftShift 
+ `" name="leftshift" onchange="window.ui.setLeftShift(event);"/></li>
    <li onclick="window.ui.setDefNewElt();">Elements vides ou absents inclus automatiquement <span id="toggleDefNewElt">`
    + ((odd.odd.params.defaultNewElement)
        ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
        : '<i class="fa fa-square-o" aria-hidden="true"></i>')
+ `</span></li>
    <li onclick="window.ui.setValReq();">Autoriser la suppression des éléments obligatoires <span id="toggleDefValReq">`
    + ((odd.odd.params.validateRequired)
        ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
        : '<i class="fa fa-square-o" aria-hidden="true"></i>')
+ `</span></li>
    <li onclick="window.ui.setCanRm();">Autoriser la suppression d'éléments (sinon seulement modification) <span id="toggleDefCanRm">`
    + ((odd.odd.params.canRemove)
        ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
        : '<i class="fa fa-square-o" aria-hidden="true"></i>')
+ `</span></li>
    <li onclick="window.ui.setLgEng();">English version of ODD <span id="toggleLgEng">`
    + ((odd.odd.params.language === 'en')
        ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
        : '<i class="fa fa-square-o" aria-hidden="true"></i>')
+ `</span></li>
</ul>
`;
        changeParams = false;
        paramsPicomodal = picoModal({
            content: userInfo,
            closeHtml: '<span>Ok</span>',
            closeStyles: {
//                position: "absolute",
                top: "-10px",
                right: "-10px",
                background: "#eee",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "5px",
                border: "1px solid #ccc"
            }
        });
    }
    paramsPicomodal.afterClose( () => {
        if (changeParams) {
            saveParams();
            events.saveStorage();
            events.reLoad(null);
        }
    }).show();
}

function saveParams() {
    localStorage.setItem("defaultNewElement", odd.odd.params.defaultNewElement.toString());
    localStorage.setItem("leftShift", odd.odd.params.leftShift.toString());
    localStorage.setItem("validateRequired", odd.odd.params.validateRequired.toString());
    localStorage.setItem("canRemove", odd.odd.params.canRemove.toString());
    localStorage.setItem("language", odd.odd.params.language);
    localStorage.setItem("displayFullpath", odd.odd.params.displayFullpath.toString());
    localStorage.setItem("groupingStyle", odd.odd.params.groupingStyle);
}

function loadParams() {
    // load params.
    let v = localStorage.getItem("defaultNewElement");
    if (v === 'false')
        odd.odd.params.defaultNewElement = false;
    v = localStorage.getItem("validateRequired");
    if (v === 'true')
        odd.odd.params.validateRequired = true;
    v = localStorage.getItem("canRemove");
    if (v === 'true')
        odd.odd.params.canRemove = true;
    v = localStorage.getItem("displayFullpath");
    if (v === 'false')
        odd.odd.params.displayFullpath = false;
    v = localStorage.getItem("groupingStyle");
    if (v)
        odd.odd.params.groupingStyle = v;
    v = localStorage.getItem("language");
    if (v === 'en')
        odd.odd.params.language = v;
    v = localStorage.getItem("leftShift");
    if (v !== '') {
        let vi = parseInt(v);
        if (!isNaN(vi) && vi >= 0 && vi <= 100)
            odd.odd.params.leftShift = vi;
    }
}

export function init() {
    // load params
    loadParams();
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
    // for user interface in html pages
    window['ui'] = {};
    window['ui'].setOnOffES = edit.setOnOffES;    
    window['ui'].setOnOffEC = edit.setOnOffEC;    
    window['ui'].setText = edit.setText;
    window['ui'].createEC = edit.createEC;    
    window['ui'].setAttr = edit.setAttr;
    window['ui'].toggleES = edit.toggleES;
    window['ui'].odd = odd.odd;
    window['ui'].setLeftShift = setLeftShift;
    window['ui'].setDispFPath = setDispFPath;
    window['ui'].setDefNewElt = setDefNewElt;
    window['ui'].setValReq = setValReq;
    window['ui'].setCanRm = setCanRm;
    window['ui'].setLgEng = setLgEng;
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
