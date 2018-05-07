/**
 * common.ts
 */

import * as events from './events';
import * as odd from '../teiedit/odd';
import * as msg from './messages';
import * as schema from '../teiedit/schema';
let picoModal = require('picomodal');

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
    // checked changes
    events.checkChange(() => {
        readTextFile('http://ct3.ortolang.fr/teimeta/media.odd?v=' + schema.version, function(text) {
            events.openOddLoad(msg.msg('predefoddmedia'), text);
        });
    });
}

export function oddTeiOral() {
    // checked changes
    events.checkChange(() => {
        readTextFile('http://ct3.ortolang.fr/teimeta/teioral.odd?v=' + schema.version, function(text) {
            events.openOddLoad(msg.msg('predefoddteispoken'), text);
        });
    });
}

export function oddPartDesc() {
    // checked changes
    events.checkChange(() => {
        readTextFile('http://ct3.ortolang.fr/teimeta/olac.odd?v=' + schema.version, function(text) {
            events.openOddLoad(msg.msg('predefoddolacdc'), text);
        });
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

export function setLanguage(lg, reload=true) {
    if (lg === 'fra') {
        odd.odd.params.language = 'fr';
        msg.setLanguage('fra');
    } else {
        odd.odd.params.language = 'en';
        msg.setLanguage('eng');
    }

    let el = document.getElementById('title');
    el.textContent = msg.msg("title");
    el = document.getElementById('xmlopen');
    el.textContent = msg.msg("xmlopen");
    el = document.getElementById('xmlsave');
    el.textContent = msg.msg("xmlsave");
    el = document.getElementById('oddopen');
    el.textContent = msg.msg("oddopen");
    el = document.getElementById('menuhelp');
    el.textContent = msg.msg("menuhelp");
    el = document.getElementById('oddpredef');
    el.textContent = msg.msg("oddpredef");
    el = document.getElementById('teispoken');
    el.textContent = msg.msg("teispoken");
    el = document.getElementById('oddolac');
    el.textContent = msg.msg("oddolac");
    el = document.getElementById('oddmedia');
    el.textContent = msg.msg("oddmedia");
    el = document.getElementById('menuparam');
    el.textContent = msg.msg("menuparam");

    changeParams = false;
    saveParams();
    if (reload) {
        events.saveStorage();
        events.reLoad(null);
    }
}

export function oddParams() {
    let paramsPicomodal = null;
    let userInfo = `
    <h2 style="margin-top: 0">Paramètres</h2>
    <ul>
        <li onclick="window.ui.setDispFPath();">` + msg.msg('paramfullpath') + '<span id="toggleDispFPath">'
        + ((odd.odd.params.displayFullpath)
            ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
            : '<i class="fa fa-square-o" aria-hidden="true"></i>')
    + `</span></li>
        <li>` + msg.msg('paramshift') + '<input type="number" min="0" max="100" value="'
        + odd.odd.params.leftShift 
    + `" name="leftshift" onchange="window.ui.setLeftShift(event);"/></li>
        <li onclick="window.ui.setDefNewElt();">` + msg.msg('paramdefincl') + '<span id="toggleDefNewElt">'
        + ((odd.odd.params.defaultNewElement)
            ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
            : '<i class="fa fa-square-o" aria-hidden="true"></i>')
    + `</span></li>
        <li onclick="window.ui.setValReq();">` + msg.msg('paramsupprobl') + '<span id="toggleDefValReq">'
        + ((odd.odd.params.validateRequired)
            ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
            : '<i class="fa fa-square-o" aria-hidden="true"></i>')
    + `</span></li>
        <li onclick="window.ui.setCanRm();">` + msg.msg('paramcanrm') + '<span id="toggleDefCanRm">'
        + ((odd.odd.params.canRemove)
            ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
            : '<i class="fa fa-square-o" aria-hidden="true"></i>')
/*
    + `</span></li>
        <li onclick="window.ui.setLanguage('fra');">Version française <img height="15px" src="css/fr.png"></img>`
    + `</span></li>
        <li onclick="window.ui.setLanguage('eng');">English version<img height="15px" src="css/us.png"></img>`
*/
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
