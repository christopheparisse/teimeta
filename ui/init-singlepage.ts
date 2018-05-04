/**
 * initalone.js
 */

import * as events from './events';
import * as odd from '../teiedit/odd';
import * as schema from '../teiedit/schema';
import * as edit from '../teiedit/edit';
import * as syscall from './opensave';
import * as help from './help';
import * as common from './common';
import * as msg from './messages';

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
        events.saveAsLocal(null);
    }
    if (e.which === 78 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl N
        e.preventDefault();
        events.newFile(null); // checked changes
    }
}

export function init() {
    events.teiData.system = 'html';
    // load params
    common.loadParams();
    // load previous data
    events.newFile(null);
    let el;
    el = document.getElementById('titledate');
    el.textContent = ' - ' + help.version;
    el = document.getElementsByTagName('body');
    el[0].addEventListener("keydown", bodyKeys);
    el = document.getElementById('file-open');
    el.addEventListener("click", events.open); // checked changes
    el = document.getElementById('file-open-odd');
    el.addEventListener("click", events.openOdd); // checked changes
    el = document.getElementById('file-saveas');
    el.addEventListener("click", events.saveAsLocal);
    //el = document.getElementById('file-new');
    //el.addEventListener("click", events.newFile);
    el = document.getElementById('help');
    el.addEventListener("click", help.about);
    el = document.getElementById('top2-params');
    el.addEventListener("click", common.oddParams);

    el = document.getElementById('odd-media');
    el.addEventListener("click", common.oddMedia); // checked changes
    el = document.getElementById('odd-teioral');
    el.addEventListener("click", common.oddTeiOral); // checked changes
    el = document.getElementById('odd-partdesc');
    el.addEventListener("click", common.oddPartDesc); // checked changes
    
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
    window['ui'].highlight = edit.highlight;
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

    window.addEventListener("beforeunload", function (e) {
        if (edit.change() === false) {
            return undefined;
        }

        var confirmationMessage = msg.msg('leavinghtml');

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });
}

// in case the document is already rendered
if (document.readyState!='loading')
    init();
else if (document.addEventListener)
    document.addEventListener('DOMContentLoaded', init);
