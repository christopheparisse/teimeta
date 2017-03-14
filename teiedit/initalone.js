/**
 * initalone.js
 */

import * as events from './events.js';
import * as edit from '../teimeta/edit.ts';
import * as syscall from '../systemcall/opensavelocal.js';

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
    if (e.which === 79 && e.ctrlKey === true) { // ctrl O
        e.preventDefault();
        events.open();
    }
    if (e.which === 79 && e.ctrlKey === true && e.shiftKey === true) { // ctrl shift O
        e.preventDefault();
        events.openOdd();
    }
    if (e.which === 83 && e.ctrlKey === true) { // ctrl S
        e.preventDefault();
        events.saveAsLocal();
    }
    if (e.which === 78 && e.ctrlKey === true) { // ctrl N
        e.preventDefault();
        events.newFile();
    }
}

export function init() {
    // load previous data
    events.openOddDefault(events.newFile);
    let el;
    el = document.getElementsByTagName('body');
    el[0].addEventListener("keydown", bodyKeys);
    el = document.getElementById('file-open');
    el.addEventListener("click", events.open);
    el = document.getElementById('file-open-odd');
    el.addEventListener("click", events.openOdd);
    el = document.getElementById('file-saveas');
    el.addEventListener("click", events.saveAsLocal);
    el = document.getElementById('file-new');
    el.addEventListener("click", events.newFile);
    el = document.getElementById('upload-input-transcript');
    el.addEventListener("change", syscall.openLocalFile);
    window.ui = {};
    window.ui.setOnOff = edit.setOnOff;    
    window.ui.setOnOffEC = edit.setOnOffEC;    
    window.ui.setText = edit.setText;    
    window.ui.createEC = edit.createEC;    
}

// in case the document is already rendered
if (document.readyState!='loading')
    init();
else if (document.addEventListener)
    document.addEventListener('DOMContentLoaded', init);
