/**
 * common.ts
 */

import * as teimeta from '../teiedit/teimeta';
import * as events from './events';
import * as msg from '../msg/messages';
import * as syscall from './opensave';
import * as version from './version';
import * as alert from '../teiedit/alert';
let picoModal = require('picomodal');
let saveAs = require('file-saver');

// to check if parameters are changed
let changeParams = false;

export function setLeftShift(e) {
//    console.log('leftshift', e);
    let v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 100) {
        if (teimeta.teiData.params.leftShift !== v) {
            changeParams = true;
            teimeta.teiData.params.leftShift = v;
        }
    }
}

export function setDispFPath(e) {
    let s = document.getElementById('toggleDispFPath');
    if (teimeta.teiData.params.displayFullpath) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        teimeta.teiData.params.displayFullpath = false;
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        teimeta.teiData.params.displayFullpath = true;
    }
    changeParams = true;
}

export function setDefNewElt(e) {
    let s = document.getElementById('toggleDefNewElt');
    if (teimeta.teiData.params.defaultNewElement) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        teimeta.teiData.params.defaultNewElement = false;
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        teimeta.teiData.params.defaultNewElement = true;
    }
    changeParams = true;
}

export function setValReq(e) {
    let s = document.getElementById('toggleDefValReq');
    if (teimeta.teiData.params.validateRequired) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        teimeta.teiData.params.validateRequired = false;
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        teimeta.teiData.params.validateRequired = true;
    }
    changeParams = true;
}

export function setCanRm(e) {
    let s = document.getElementById('toggleDefCanRm');
    if (teimeta.teiData.params.canRemove) {
        s.innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i>';
        teimeta.teiData.params.canRemove = false;
    } else {
        s.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        teimeta.teiData.params.canRemove = true;
    }
    changeParams = true;
}

export function setLanguage(lg, reload=true) {
    if (lg === 'fr' || lg === 'fra' || lg === 'fre') {
        teimeta.teiData.params.language = 'fre';
        msg.setLanguage('fre');
    } else if (lg === 'es' || lg === 'esp' || lg === 'spa') {
        teimeta.teiData.params.language = 'spa';
        msg.setLanguage('spa');
    } else if (lg === 'ja' || lg === 'jpn') {
        teimeta.teiData.params.language = 'jpn';
        msg.setLanguage('jpn');
    } else {
        teimeta.teiData.params.language = 'eng';
        msg.setLanguage('eng');
    }

    try {
        let el = document.getElementById('title');
        if (el) el.textContent = msg.msg("title");
        el = document.getElementById('xmlopen');
        if (el) el.textContent = msg.msg("xmlopen");
        el = document.getElementById('xmlsave1');
        if (el) el.textContent = msg.msg("xmlsave1");
        el = document.getElementById('xmlsave2');
        if (el) el.textContent = msg.msg("xmlsave2");
        el = document.getElementById('xmlsaveas');
        if (el) el.textContent = msg.msg("xmlsaveas");
        el = document.getElementById('oddapply');
        if (el) el.textContent = msg.msg("oddapply");
        el = document.getElementById('cssapply');
        if (el) el.textContent = msg.msg("cssapply");
        el = document.getElementById('cssclean');
        if (el) el.textContent = msg.msg("cssclean");
        el = document.getElementById('xmlnew');
        if (el) el.textContent = msg.msg("xmlnew");
        el = document.getElementById('menuhelp');
        if (el) el.textContent = msg.msg("menuhelp");
        el = document.getElementById('menuparam');
        if (el) el.textContent = msg.msg("menuparam");
        el = document.getElementById('applyoddcss');
        if (el) el.textContent = msg.msg("applyoddcss");
        el = document.getElementById('choicelanguage');
        if (el) el.textContent = msg.msg("choicelanguage");
        el = document.getElementById('paramlinks');
        if (el) el.textContent = msg.msg("paramlinks");
    } catch (error) {
        alert.alertUser('Erreur de message: ' + error.toString());
        console.log("setLanguage", error);
    }

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
        <li onclick="window.teimeta.setDispFPath();">` + msg.msg('paramfullpath') + '<span id="toggleDispFPath">'
        + ((teimeta.teiData.params.displayFullpath)
            ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
            : '<i class="fa fa-square-o" aria-hidden="true"></i>')
    + `</span></li>
        <li>` + msg.msg('paramshift') + '<input type="number" min="0" max="100" value="'
        + teimeta.teiData.params.leftShift 
    + `" name="leftshift" onchange="window.teimeta.setLeftShift(event);"/></li>
        <li onclick="window.teimeta.setDefNewElt();">` + msg.msg('paramdefincl') + '<span id="toggleDefNewElt">'
        + ((teimeta.teiData.params.defaultNewElement)
            ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
            : '<i class="fa fa-square-o" aria-hidden="true"></i>')
    + `</span></li>
        <li onclick="window.teimeta.setValReq();">` + msg.msg('paramsupprobl') + '<span id="toggleDefValReq">'
        + ((teimeta.teiData.params.validateRequired)
            ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
            : '<i class="fa fa-square-o" aria-hidden="true"></i>')
    + `</span></li>
        <li onclick="window.teimeta.setCanRm();">` + msg.msg('paramcanrm') + '<span id="toggleDefCanRm">'
        + ((teimeta.teiData.params.canRemove)
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
    paramsPicomodal.afterClose( () => {
        if (changeParams) {
            saveParams();
            events.saveStorage();
            events.reLoad(null);
        }
    }).afterClose(function (modal) { modal.destroy(); })
    .show();
}

function saveParams() {
    localStorage.setItem("defaultNewElement", teimeta.teiData.params.defaultNewElement.toString());
    localStorage.setItem("leftShift", teimeta.teiData.params.leftShift.toString());
    localStorage.setItem("validateRequired", teimeta.teiData.params.validateRequired.toString());
    localStorage.setItem("canRemove", teimeta.teiData.params.canRemove.toString());
    localStorage.setItem("language", teimeta.teiData.params.language);
    localStorage.setItem("displayFullpath", teimeta.teiData.params.displayFullpath.toString());
    localStorage.setItem("groupingStyle", teimeta.teiData.params.groupingStyle);
}

export function loadParams() {
    // load params.
    let v = localStorage.getItem("defaultNewElement");
    if (v === 'false')
        teimeta.teiData.params.defaultNewElement = false;
    v = localStorage.getItem("validateRequired");
    if (v === 'true')
        teimeta.teiData.params.validateRequired = true;
    v = localStorage.getItem("canRemove");
    if (v === 'true')
        teimeta.teiData.params.canRemove = true;
    v = localStorage.getItem("displayFullpath");
    if (v === 'false')
        teimeta.teiData.params.displayFullpath = false;
    v = localStorage.getItem("groupingStyle");
    if (v)
        teimeta.teiData.params.groupingStyle = v;
    v = localStorage.getItem("language");
    if (v === 'en')
        teimeta.teiData.params.language = v;
    v = localStorage.getItem("leftShift");
    if (v !== '') {
        let vi = parseInt(v);
        if (!isNaN(vi) && vi >= 0 && vi <= 100)
            teimeta.teiData.params.leftShift = vi;
    }
}

function link(url) {
    window.open(url,'_blank');
}

//resizable(document.getElementById('txt'),7);
export function init(funbodykeys) {
    let el;
    el = document.getElementById('titledate');
    if (el) el.textContent = ' - ' + version.version + ' - ' + version.date;
    el = document.getElementsByTagName('body');
    if (el) el[0].addEventListener("keydown", funbodykeys);

    /*
    el = document.getElementById('file-open');
    if (el) el.addEventListener("click", events.openXml);
    el = document.getElementById('file-new');
    if (el) el.addEventListener("click", events.newXml);
    el = document.getElementById('file-apply-odd');
    if (el) el.addEventListener("click", events.openOdd);
    el = document.getElementById('file-apply-css');
    if (el) el.addEventListener("click", events.openCss);
    el = document.getElementById('file-clean-css');
    if (el) el.addEventListener("click", events.cleanCss);
    el = document.getElementById('help');
    if (el) el.addEventListener("click", version.about);
    el = document.getElementById('top2-params');
    if (el) el.addEventListener("click", oddParams);

    el = document.getElementById('showall');
    if (el) el.addEventListener("click", teimeta.teiData.edit.showAll);
    el = document.getElementById('hideall');
    if (el) el.addEventListener("click", teimeta.teiData.edit.hideAll);
    */

    el = document.getElementById('link-ortolang');
    if (el) el.addEventListener("click", function() { link('https://www.ortolang.fr')});
    el = document.getElementById('link-metadoc');
    if (el) el.addEventListener("click", function() { link('http://ct3.ortolang.fr/teimeta-doc/')});
    el = document.getElementById('link-teiconvert');
    if (el) el.addEventListener("click", function() { link('http://ct3.ortolang.fr/teiconvert/')});
    el = document.getElementById('link-teicorpo');
    if (el) el.addEventListener("click", function() { link('http://ct3.ortolang.fr/tei-corpo/')});

    el = document.getElementById('upload-input-transcript');
    if (el) el.addEventListener("change", syscall.openLocalFile);
    
    //
    if (!window['teimeta']) window['teimeta'] = {};
    window['teimeta'].setLeftShift = setLeftShift;
    window['teimeta'].setDispFPath = setDispFPath;
    window['teimeta'].setDefNewElt = setDefNewElt;
    window['teimeta'].setValReq = setValReq;
    window['teimeta'].setCanRm = setCanRm;
    window['teimeta'].setLanguage = setLanguage;
    window['teimeta'].openXml = events.openXml;
    window['teimeta'].newXml = events.newXml;
    window['teimeta'].openOdd = events.openOdd;
    window['teimeta'].openCss = events.openCss;
    window['teimeta'].cleanCss = events.cleanCss;
    window['teimeta'].about = version.about;
    window['teimeta'].oddParams = oddParams;
    window['teimeta'].showAll = teimeta.teiData.edit.showAll;
    window['teimeta'].hideAll = teimeta.teiData.edit.hideAll;
    window['teimeta'].saveLocal = events.saveLocal;
    window['teimeta'].saveAsLocal = events.saveAsLocal;
    window['teimeta'].dumpHtml = events.dumpHtml;
    window['teimeta'].emptyFile = events.emptyFile;
}

export function saveFileLocal(type, name, data) {
    var blob = new Blob([data], {
        type : "text/plain;charset=utf-8"
    });
    // {type: 'text/css'});
    var p1 = name.lastIndexOf('/');
    var p2 = name.lastIndexOf('\\');
    if (p1 < p2) p1 = p2;
    if (p1 === -1) p1 = 0;
    var l = name.substr(p1);
    saveAs.saveAs(blob, l);
};

export function openSpecificLocalFile(oddname, displayname, xmlname, xmldata, funCallback) {
    function fun(err, name, data) {
        // name should be the same as oddname but the user might have changed it
        funCallback(err, name, name, data, xmlname, xmldata);
    }
    alert.askUserModal(
        'The file <b>' + xmlname + '</b> uses a file named <b>' + oddname +
        '</b> - please locate it on you computer.',
        function(response) { 
            if (response) 
                syscall.chooseOpenFile(fun)
            else
                fun("cancel", "", "");
        }
    );    
}

export function askUserModalYesNoCancel(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p class='footer'>" +
            "<button class='yes'>Save</button>" +
            "<button class='no'>Don't save</button>" +
            "<button class='cancel'>Cancel</button> " +
            "</p>"
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target && evt.target.matches(".yes")) {
                modal.close('yes');
            } else if (evt.target && evt.target.matches(".cancel")) {
                modal.close('cancel');
            } else if (evt.target && evt.target.matches(".no")) {
                modal.close('no');
            }
        });
    }).afterClose((modal, event) => {
        fun(event.detail);
    }).show();
}

let oddprefdefined = [];

export function oddpredefs(callback) {
    if (oddprefdefined.length < 1) {
        teimeta.readTextFile("./models/models.json",
            function(err, data) {
                if (!err) {
                    let ds = data.toString();
                    try {
                        let js = JSON.parse(ds);
                        for (let i=0; i < js.length; i++) {
                            if (js[i].css) js[i].css = './models/' + js[i].css;
                            if (js[i].odd) js[i].odd = './models/' + js[i].odd;
                            if (!js[i].labelcss) js[i].labelcss = "";
                            if (!js[i].css) js[i].css = "";
                        }
                        oddprefdefined = js;
                        console.log("oddpredefs", js);
                        callback(oddprefdefined);
                    } catch(e) {
                        // alert.alertUser('error reading models.json: ' + e.toString());
                        console.log('error reading models.json:', e);
                        callback(oddprefdefined);
                    }
                } else {
                    // alert.alertUser('error reading models.json: ' + data);
                    console.log('error reading models.json:', data);
                    callback(oddprefdefined);
                }
            });
    } else {
        callback(oddprefdefined);
    }
}

export function askUserModalForOdd(previousname, loaded, fun) {
    function afteroddpredefs(predefs) {
        let askoddInfo = msg.msg('askoddInfo');
        let askoddCurrent = msg.msg('askoddCurrent');
        let askoddLocalOdd = msg.msg('askoddLocalOdd');
        let askoddPredef = msg.msg('askoddPredef');
    //    let askoddOk = msg.msg('ok');
        let askoddCancel = msg.msg('cancel');

        let box = '<div id="aumomodal"><p class="aumo aumotitle">' + askoddInfo + '</p>' +
        (loaded ? "<button class='aumo aumobutton current'>" + askoddCurrent + " " + previousname + "</button>" : "")
            + "<button class='aumo aumobutton computer'>" + askoddLocalOdd + "</button>";

        if (predefs.length === 0) {
            box += "<p class='aumo aumoinfo'>" + "No predefined ODDs" + "</p>";
        } else {
            box += '<p class="aumo aumoinfo">' + askoddPredef + "<p/>";
            for (let s=0; s < predefs.length; s++) {
                box += "<button class='aumo aumobutton aumoid" + s + "'>" + (predefs)[s].label + "</button>";
            }
        }

        box += "<button class='aumo aumocancel cancel'>" + askoddCancel + "</button></div>";

        picoModal({
            content: box
        }).afterCreate(modal => {
            modal.modalElem().addEventListener("click", evt => {
                if (evt.target) {
                    if (evt.target.matches(".current")) {
                        modal.close('current');
                    } else if (evt.target.matches(".computer")) {
                        modal.close('computer');
                    } else if (evt.target.matches(".cancel")) {
                        modal.close('cancel');
                    } else {
                        for (let s=0; s < predefs.length; s++) {
                            let l = "aumoid" + s;
                            if (evt.target.matches("." + l)) {
                                modal.close(l);
                            }
                        }
                    }
                }
            });
        }).afterClose((modal, event) => {
            fun(event.detail);
        }).show();
    }
    oddpredefs(afteroddpredefs);
}
