/**
 * @name initelectron.js
 * @author Christophe Parisse
 */

const ipcRenderer = require('electron').ipcRenderer;
import * as events from './events';
import * as teimeta from '../teiedit/teimeta';
import * as version from './version';
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
        events.openXml();
    }
    if (e.which === 83 && (e.ctrlKey === true || e.metaKey === true) && (e.altKey === true)) { // ctrl alt S
        e.preventDefault();
        events.dumpHtml();
        return;
    }
    if (e.which === 83 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl S
        e.preventDefault();
        events.save(() => {});
    }
    if (e.which === 81 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl Q
        quit();            
    }
    if (e.which === 115 && (e.altKey === true)) { // alt F4
        quit();
    }
    if (e.which === 78 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl N
        e.preventDefault();
        events.newXml('new');
    }
}

export function init() {
    teimeta.teiData.system = 'electron';
    common.loadParams();

    ipcRenderer.on('open', function(event, arg) {
        events.openXml();
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
        version.about();
    });
    ipcRenderer.on('quit', function(event, arg) {
        quit();            
    });

    // the file-save is a real save
    let el = document.getElementById('file-save');
    el.addEventListener("click", events.save);
    // the file-saveas always ask for name
    el = document.getElementById('file-saveas');
    el.addEventListener("click", events.saveAs);

    common.init(bodyKeys);
    common.setLanguage(teimeta.teiData.params.language, false);
    // load previous data
    events.newXml('previous');
}
