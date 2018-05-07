/**
 * @name initelectron.js
 * @author Christophe Parisse
 */

const ipcRenderer = require('electron').ipcRenderer;
import * as events from './events';
import * as odd from '../teiedit/odd';
import * as edit from '../teiedit/edit';
import * as syscall from './opensave';
import * as help from './help';
import * as common from './common';

function quit() {
    // checked changes
    events.checkChange(() => {
            const remote = require('electron').remote;
            remote.process.preventClose = false;
            remote.app.quit();
    });
}

/*
    ipcRenderer.on('close', function (e) {
        if (edit.change() === false) {
            const remote = require('electron').remote;
            remote.process.preventClose = false;
            remote.app.quit();
        }
        var answer = confirm('Something is not saved. Do you really want to close the application?');
        if (!answer) {
            const remote = require('electron').remote;
            remote.process.preventClose = true;
        }
    });

*/

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
    if (e.which === 79 && (e.ctrlKey === true || e.metaKey === true) && e.shiftKey === true) { // ctrl shift O
        e.preventDefault();
        events.openOdd();
        return;
    }
    if (e.which === 79 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl O
        e.preventDefault();
        events.open();
    }
    if (e.which === 83 && (e.ctrlKey === true || e.metaKey === true) && (e.altKey === true)) { // ctrl alt S
        e.preventDefault();
        events.dumpHtml();
        return;
    }
    if (e.which === 83 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl S
        e.preventDefault();
        events.saveAsLocal(() => {});
    }
    if (e.which === 81 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl Q
        quit();            
    }
    if (e.which === 115 && (e.altKey === true)) { // alt F4
        quit();
    }
    if (e.which === 78 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl N
        e.preventDefault();
        events.newFile(null);
    }
}

export function init() {
    events.teiData.system = 'electron';
    common.loadParams();
    // load previous data
    events.newFile(null);

    ipcRenderer.on('open', function(event, arg) {
        events.open();
    });
    ipcRenderer.on('openodd', function(event, arg) {
        events.openOdd();
    });
    ipcRenderer.on('save', function(event, arg) {
        events.save(() => {});
    });
    ipcRenderer.on('saveas', function(event, arg) {
        events.saveAs(() => {});
    });
    ipcRenderer.on('help', function(event, arg) {
        help.about();
    });
    ipcRenderer.on('quit', function(event, arg) {
        quit();            
    });

    let el;
    el = document.getElementById('titledate');
    el.textContent = ' - ' + help.version;
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
    window['ui'].setText = edit.setText;
    window['ui'].createEC = edit.createEC;
    window['ui'].setOpenlist = edit.setOpenlist;
    window['ui'].initOpenlist = edit.initOpenlist;
    window['ui'].toggleES = edit.toggleES;
    window['ui'].checkTime = edit.checkTime;
    window['ui'].odd = odd.odd;
    window['ui'].setLeftShift = common.setLeftShift;
    window['ui'].setDispFPath = common.setDispFPath;
    window['ui'].setDefNewElt = common.setDefNewElt;
    window['ui'].setValReq = common.setValReq;
    window['ui'].setCanRm = common.setCanRm;
    window['ui'].setLanguage = common.setLanguage;
    // for debugging purposes
    window['dbg'] = {};
    window['dbg'].tei = events.teiData;
    window['dbg'].v = edit.values;

    common.setLanguage(odd.odd.params.language, false);
}
