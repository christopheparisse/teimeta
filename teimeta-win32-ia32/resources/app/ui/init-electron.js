"use strict";
/**
 * @name initelectron.js
 * @author Christophe Parisse
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ipcRenderer = require('electron').ipcRenderer;
var events = require("./events");
var odd = require("../teiedit/odd");
var edit = require("../teiedit/edit");
var syscall = require("./opensave");
var help = require("./help");
var common = require("./common");
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
    if (e.which === 79 && (e.ctrlKey === true || e.metaKey === true)) {
        e.preventDefault();
        events.open();
    }
    if (e.which === 79 && (e.ctrlKey === true || e.metaKey === true) && e.shiftKey === true) {
        e.preventDefault();
        events.openOdd();
    }
    if (e.which === 83 && (e.ctrlKey === true || e.metaKey === true)) {
        e.preventDefault();
        events.saveAsLocal();
    }
    if (e.which === 78 && (e.ctrlKey === true || e.metaKey === true)) {
        e.preventDefault();
        events.newFile(null);
    }
}
function init() {
    // load previous data
    events.newFile(null);
    ipcRenderer.on('open', function (event, arg) {
        events.open();
    });
    ipcRenderer.on('openodd', function (event, arg) {
        events.openOdd();
    });
    ipcRenderer.on('save', function (event, arg) {
        events.save();
    });
    ipcRenderer.on('saveas', function (event, arg) {
        events.saveAs();
    });
    ipcRenderer.on('help', function (event, arg) {
        help.about();
    });
    var el;
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
    el.addEventListener("click", common.oddParams);
    el = document.getElementById('odd-media');
    el.addEventListener("click", common.oddMedia);
    el = document.getElementById('odd-teioral');
    el.addEventListener("click", common.oddTeiOral);
    el = document.getElementById('odd-partdesc');
    el.addEventListener("click", common.oddPartDesc);
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
    //    window['ui'].setOnOffEC = edit.setOnOffEC;    
    window['ui'].setText = edit.setText;
    window['ui'].createEC = edit.createEC;
    window['ui'].setAttr = edit.setAttr;
    window['ui'].toggleES = edit.toggleES;
    window['ui'].odd = odd.odd;
    window['ui'].setLeftShift = common.setLeftShift;
    window['ui'].setDispFPath = common.setDispFPath;
    window['ui'].setDefNewElt = common.setDefNewElt;
    window['ui'].setValReq = common.setValReq;
    window['ui'].setCanRm = common.setCanRm;
    window['ui'].setLgEng = common.setLgEng;
    // for debugging purposes
    window['dbg'] = {};
    window['dbg'].tei = events.teiData;
    window['dbg'].v = edit.values;
}
exports.init = init;
