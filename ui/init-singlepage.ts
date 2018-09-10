/**
 * init-singlepage.js
 */

import * as events from './events';
import * as teimeta from '../teiedit/teimeta';
import * as common from './common';
import * as msg from '../msg/messages';
import '../css/font-awesome/css/font-awesome.min.css';
import '../css/internal.css';
import '../css/display.css';

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
    if (e.which === 83 && (e.ctrlKey === true || e.metaKey === true && e.shiftKey === true)) { // ctrl shift S
        e.preventDefault();
        events.saveAsLocal(null);
    }
    if (e.which === 83 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl S
        e.preventDefault();
        events.saveLocal(null);
    }
    if (e.which === 78 && (e.ctrlKey === true || e.metaKey === true)) { // ctrl N
        e.preventDefault();
        events.newXml('new'); // checked changes
    }
}

export function init() {
    var sURL = window.document.URL.toString();
    if (sURL.substring(0,5) === "file:") {
        teimeta.teiData.system = 'html';
        teimeta.teiData.protocol = 'file';
    } else {
        teimeta.teiData.system = 'html';
        teimeta.teiData.protocol = 'http';
    }
    // load params
    common.loadParams();

    /*
    // the file-save is a download save
    let el = document.getElementById('file-save');
    el.addEventListener("click", events.saveLocal);
    //  and a saveas
    el = document.getElementById('file-saveas');
    el.addEventListener("click", events.saveAsLocal);
    */
   
    common.init(bodyKeys);
    window.addEventListener("beforeunload", function (e) {
        if (teimeta.teiData.edit.change() === false) {
            return undefined;
        }

        var confirmationMessage = msg.msg('leavinghtml');

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

    common.setLanguage(teimeta.teiData.params.language, false);
    // load previous data
    events.newXml('previous');
}

// in case the document is already rendered
if (document.readyState!='loading')
    init();
else if (document.addEventListener)
    document.addEventListener('DOMContentLoaded', init);
