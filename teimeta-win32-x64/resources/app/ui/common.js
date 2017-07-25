"use strict";
/**
 * common.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("./events");
var odd = require("../teiedit/odd");
var schema = require("../teiedit/schema");
var picoModal = require('picomodal');
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    // rawFile.overrideMimeType("text/xml");
    rawFile.responseType = "text";
    rawFile.open("GET", file, true);
    rawFile.onload = function (e) {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
}
function oddMedia() {
    readTextFile('http://ct3.ortolang.fr/teimeta/media.odd?v=' + schema.version, function (text) {
        events.openOddLoad('Odd prédéfini Média', text);
    });
}
exports.oddMedia = oddMedia;
function oddTeiOral() {
    readTextFile('http://ct3.ortolang.fr/teimeta/teioral.odd?v=' + schema.version, function (text) {
        events.openOddLoad('Odd prédéfini Tei Oral', text);
    });
}
exports.oddTeiOral = oddTeiOral;
function oddPartDesc() {
    readTextFile('http://ct3.ortolang.fr/teimeta/olac.odd?v=' + schema.version, function (text) {
        events.openOddLoad('Odd prédéfini Olac DC', text);
    });
}
exports.oddPartDesc = oddPartDesc;
// to check if parameters are changed
var changeParams = false;
function setLeftShift(e) {
    //    console.log('leftshift', e);
    var v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 100) {
        if (odd.odd.params.leftShift !== v) {
            changeParams = true;
            odd.odd.params.leftShift = v;
        }
    }
}
exports.setLeftShift = setLeftShift;
function setDispFPath(e) {
    var s = document.getElementById('toggleDispFPath');
    if (odd.odd.params.displayFullpath) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.displayFullpath = false;
    }
    else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.displayFullpath = true;
    }
    changeParams = true;
}
exports.setDispFPath = setDispFPath;
function setDefNewElt(e) {
    var s = document.getElementById('toggleDefNewElt');
    if (odd.odd.params.defaultNewElement) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.defaultNewElement = false;
    }
    else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.defaultNewElement = true;
    }
    changeParams = true;
}
exports.setDefNewElt = setDefNewElt;
function setValReq(e) {
    var s = document.getElementById('toggleDefValReq');
    if (odd.odd.params.validateRequired) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.validateRequired = false;
    }
    else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.validateRequired = true;
    }
    changeParams = true;
}
exports.setValReq = setValReq;
function setCanRm(e) {
    var s = document.getElementById('toggleDefCanRm');
    if (odd.odd.params.canRemove) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.canRemove = false;
    }
    else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.canRemove = true;
    }
    changeParams = true;
}
exports.setCanRm = setCanRm;
function setLgEng(e) {
    var s = document.getElementById('toggleLgEng');
    if (odd.odd.params.language === 'en') {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        odd.odd.params.language = 'fr';
    }
    else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        odd.odd.params.language = 'en';
    }
    changeParams = true;
}
exports.setLgEng = setLgEng;
var paramsPicomodal = null;
function oddParams() {
    if (!paramsPicomodal) {
        // for the first time do not used DOM functions
        // use only picoModal initiatilisation of a HTML string
        var userInfo = "\n<h2 style=\"margin-top: 0\">Param\u00E8tres</h2>\n<ul>\n    <li onclick=\"window.ui.setDispFPath();\">Afficher les chemins complets <span id=\"toggleDispFPath\">"
            + ((odd.odd.params.displayFullpath)
                ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
                : '<i class="fa fa-square-o" aria-hidden="true"></i>')
            + "</span></li>\n    <li>D\u00E9calage en pixels des imbrications: <input type=\"number\" min=\"0\" max=\"100\" value=\""
            + odd.odd.params.leftShift
            + "\" name=\"leftshift\" onchange=\"window.ui.setLeftShift(event);\"/></li>\n    <li onclick=\"window.ui.setDefNewElt();\">Elements vides ou absents inclus automatiquement <span id=\"toggleDefNewElt\">"
            + ((odd.odd.params.defaultNewElement)
                ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
                : '<i class="fa fa-square-o" aria-hidden="true"></i>')
            + "</span></li>\n    <li onclick=\"window.ui.setValReq();\">Autoriser la suppression des \u00E9l\u00E9ments obligatoires <span id=\"toggleDefValReq\">"
            + ((odd.odd.params.validateRequired)
                ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
                : '<i class="fa fa-square-o" aria-hidden="true"></i>')
            + "</span></li>\n    <li onclick=\"window.ui.setCanRm();\">Autoriser la suppression d'\u00E9l\u00E9ments (sinon seulement modification) <span id=\"toggleDefCanRm\">"
            + ((odd.odd.params.canRemove)
                ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
                : '<i class="fa fa-square-o" aria-hidden="true"></i>')
            + "</span></li>\n    <li onclick=\"window.ui.setLgEng();\">English version of ODD <span id=\"toggleLgEng\">"
            + ((odd.odd.params.language === 'en')
                ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
                : '<i class="fa fa-square-o" aria-hidden="true"></i>')
            + "</span></li>\n</ul>\n";
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
    paramsPicomodal.afterClose(function () {
        if (changeParams) {
            saveParams();
            events.saveStorage();
            events.reLoad(null);
        }
    }).show();
}
exports.oddParams = oddParams;
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
    var v = localStorage.getItem("defaultNewElement");
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
        var vi = parseInt(v);
        if (!isNaN(vi) && vi >= 0 && vi <= 100)
            odd.odd.params.leftShift = vi;
    }
}
exports.loadParams = loadParams;
