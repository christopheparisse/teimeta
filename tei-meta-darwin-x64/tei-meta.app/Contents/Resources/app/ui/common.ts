/**
 * common.ts
 */

import * as events from './events';
import * as odd from '../teiedit/odd';
import * as schema from '../teiedit/schema';
let picoModal = require('picoModal');

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

export function oddMedia() {
    readTextFile('http://ct3.ortolang.fr/teimeta/media.odd?v=' + schema.version, function(text) {
        events.openOddLoad('Odd prédéfini Média', text);
    });
}

export function oddTeiOral() {
    readTextFile('http://ct3.ortolang.fr/teimeta/teioral.odd?v=' + schema.version, function(text) {
        events.openOddLoad('Odd prédéfini Tei Oral', text);
    });
}

export function oddPartDesc() {
    readTextFile('http://ct3.ortolang.fr/teimeta/partdesc.odd?v=' + schema.version, function(text) {
        events.openOddLoad('Odd prédéfini Participants', text);
    });
}

// to check if parameters are changed
let changeParams = false;

export function setLeftShift(e) {
//    console.log('leftshift', e);
    let v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 100) {
        if (odd.odd.params.leftShift !== v) {
            changeParams = true;
            odd.odd.params.leftShift = v;
        }
    }
}

export function setDispFPath(e) {
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

export function setDefNewElt(e) {
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

export function setValReq(e) {
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

export function setCanRm(e) {
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

export function setLgEng(e) {
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

export function oddParams() {
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

export function loadParams() {
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
