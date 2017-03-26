/**
 * @name initelectron.js
 * @author Christophe Parisse
 */

const ipcRenderer = require('electron').ipcRenderer;
import * as events from './events';
import * as edit from '../teiedit/edit';
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

export function init() {
    // load previous data
    events.newFile(null);

    ipcRenderer.on('open', function(event, arg) {
        events.open();
    });
    ipcRenderer.on('openodd', function(event, arg) {
        events.openOdd();
    });
    ipcRenderer.on('save', function(event, arg) {
        events.save();
    });
    ipcRenderer.on('saveas', function(event, arg) {
        events.saveAs();
    });
    ipcRenderer.on('help', function(event, arg) {
        help.about();
    });

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

    // for user interface in html pages
    window['ui'] = {};
    window['ui'].setOnOff = edit.setOnOff;    
    window['ui'].setOnOffEC = edit.setOnOffEC;    
    window['ui'].setText = edit.setText;
    window['ui'].createEC = edit.createEC;    
    window['ui'].setAttr = edit.setAttr;
    // for debugging purposes
    window['dbg'] = {};
    window['dbg'].tei = events.teiData;
    window['dbg'].v = edit.values;
}
