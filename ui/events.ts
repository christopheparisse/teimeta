/**
 * events.ts
 * author: Christophe Parisse
 * main procedures to load, save, and call teiedit functions
 * 
 * Use case
 * 1) openXml() --> choose a local file --> loadXml(data/file/url)
 *      if ODD in XML then loadODD(file/url)
 *      else choose ODD file or choose predefined ODD or already loaded ODD --> (loadOdd data/file/url)
 * 2) newXml()
 *      choose ODD file or choose predefined ODD or already loaded ODD --> (loadOdd data/file/url)
 * 3) chooseOdd()
 *      choose ODD file to be used in later openXml() or newXml()
 *      if the user want to replace current ODD, he has to save first
 * 4) chooseCss()
 *      choose a CSS file to be used in later openXml() or newXml()
 *      the predefined CSS can be used only with predefined ODD (see above)
 * 
 * choix obligatoire internes
 *      loadCss(data/ulr/file)
 */

import * as edit from '../teiedit/edit';
import * as odd from '../teiedit/odd';
import * as schema from '../teiedit/schema';
import * as tei from '../teiedit/tei';
import * as load from '../teiedit/load';
import * as opensave from './opensave';
import * as alert from './alert';
import * as msg from './messages';

const NEWFILENAME = msg.msg('newfile');

export let teiData = {
    oddName: '',
    cssName: '',
    fileName: '',
    dataOdd: null,
    dataCss: null,
    dataTei: null,
    html: null,
    new: true,
    parser: null,
    doc: null,
    system: ''
};

export function openXml() {
    // checked changes - the user can cancel if needed
    checkChange(() => { // if ok ask the user for a file
        opensave.chooseOpenFile(function(err, name, data) {
            if (!err) { // if not cancelled
                if (!teiData.dataOdd) {
                    newFile(function() { finishLoad(1, null, null); } );
                } else {
                    finishLoad(0, name, data);
                }
            } else
                console.log(name, err);
        });
    });
};

function finishLoad(err, name, data) {
    teiData.fileName = name;
    let el = document.getElementById('filename');
    el.innerHTML = msg.msg('file') + name;
    load.loadTei(data, teiData);
    teiData.html = edit.generateHTML(teiData);
    el = document.getElementById('teidata');
    el.innerHTML = teiData.html;
    teiData.new = false;
    //console.log("openfile TEI", teiData.dataTei);
    //console.log(edit.values);
}

export function dumpHtml() {
    opensave.saveFileLocal("html", "page.html", teiData.html);
}

export function checkChange(fun) {
    if (edit.change() === false) {
        fun();
        return;
    }
    alert.askUserModalYesNoCancel(
        msg.msg('askforsave'),
        (ret) => {
            if (ret === 'yes') { //save
                if (teiData.system === 'electron') {
                    save(fun);
                } else {
                    saveAsLocal(fun);
                }
            } else if (ret === 'no') {
                fun(); // do not save
            } else {
                return; // cancel
            }
        }
    );
}

export function newFile(callback) {
    // checked changes
    checkChange(() => {
        try {
            let ls = localStorage.getItem("previousODD");
            if (ls) {
                var js = JSON.parse(ls);
                if (!js.version || js.version !== schema.version) {
                    //console.log('ancienne version de localstorage');
                    emptyFile();
                    if (callback) callback(0);
                    return;
                }
                let lcss = localStorage.getItem("previousCSS");
                var jcss = JSON.parse(lcss);
                console.log('newfile CSS', jcss);
                if (lcss) {
                    openCssLoad(jcss.cssName, jcss.data);
                }
                openOddLoad(js.oddName, js.data);
                if (callback) callback(0);
            } else {
                emptyFile();
            }
        } catch (error) {
            console.log(error);
            emptyFile();
            if (callback) callback(0);
        }
    });
}

export function reLoad(callback) {
    try {
        let ls = localStorage.getItem("previousODD");
        let lx = localStorage.getItem("previousXML");
        let lxname = localStorage.getItem("previousXMLName");
        if (ls && lx) {
            var js = JSON.parse(ls);
            if (!js.version || js.version !== schema.version) {
                //console.log('ancienne version de localstorage');
                emptyFile();
                if (callback) callback(0);
                return;
            }
            let lcss = localStorage.getItem("previousCSS");
            var jcss = JSON.parse(lcss);
            console.log('newfile CSS', jcss);
            if (lcss) {
                openCssLoad(jcss.cssName, jcss.data);
            }
            openOddLoad(js.oddName, js.data);
            finishLoad(0, lxname, lx);
            if (callback) callback(0);
        } else {
            emptyFile();
        }
    } catch (error) {
        console.log(error);
        emptyFile();
    }
}

export function openOddCssLoad(nameOdd, dataOdd, nameCss, dataCss) {
    openCssLoad(nameCss, dataCss);
    openOddLoad(nameOdd, dataOdd);
}

export function openOddLoad(name, data) {
    teiData.oddName = name;
    let el = document.getElementById('oddname');
    el.innerHTML = "ODD: " + name;
    teiData.dataOdd = odd.loadOdd(data);
    load.loadTei(null, teiData);
    if (teiData.dataCss) {
        let cssHtml =  '<style>' + teiData.dataCss + '</style>\n';
        teiData.html = cssHtml + edit.generateHTML(teiData);
    } else {
        teiData.html = edit.generateHTML(teiData);
    }
    teiData.fileName = NEWFILENAME;
    teiData.new = true;

    el = document.getElementById('cssname');
    if (el) el.innerHTML = "CSS: " + teiData.cssName;
    el = document.getElementById('filename');
    el.innerHTML = msg.msg('file') + teiData.fileName;
    el = document.getElementById('teidata');
    el.innerHTML = teiData.html;
    let js = JSON.stringify({data: data, oddName: name, version: schema.version});
    localStorage.setItem("previousODD", js);
}

export function openOdd() {
    // checked changes
    checkChange(() => {
        opensave.chooseOpenFile(function(err, name, data) {
            if (!err) {
                openOddLoad(name, data);
            } else
                console.log(name, err);
        });
    });
};

export function openCssLoad(name, data) {
    teiData.cssName = name;
    let el = document.getElementById('cssname');
    if (el) el.innerHTML = "CSS: " + name;
    teiData.dataCss = data;
    // console.log("CSS: ", name, data);
    let js = JSON.stringify({data: data, cssName: name});
    localStorage.setItem("previousCSS", js);
}

export function openCss() {
    // checked changes
    checkChange(() => {
        opensave.chooseOpenFile(function(err, name, data) {
            if (!err) {
                openCssLoad(name, data);
            } else
                console.log(name, err);
        });
    });
};

export function emptyFile() {
    let dt = document.getElementById('teidata');
    dt.innerHTML = '';
    teiData.oddName = msg.msg('nofilename');
    teiData.fileName = msg.msg('nofilename');
    teiData.cssName = msg.msg('nofilename');
    teiData.new = true;
    let el = document.getElementById('oddname');
    el.innerHTML = "ODD: " + teiData.oddName;
    el = document.getElementById('cssname');
    if (el) el.innerHTML = "CSS: " + teiData.cssName;
    el = document.getElementById('filename');
    el.innerHTML = msg.msg('file') + teiData.fileName;
}

export function saveAs(fun) {    
    opensave.chooseSaveFile('xml', function(err, name) {
        if (!err) {
            teiData.fileName = name;
            let el = document.getElementById('filename');
            el.innerHTML = msg.msg('file') + teiData.fileName;
            var ed = tei.generateTEI(teiData);
            opensave.saveFile(teiData.fileName, ed);
            edit.change(false);
            if (fun && typeof fun === "function") fun();
        } else
            console.log('saveas cancelled', name, err);
    });
};

export function saveStorage() {
    var ed = tei.generateTEI(teiData);
    localStorage.setItem("previousXML", ed);
    localStorage.setItem("previousXMLName", teiData.fileName);
};

export function save(fun) {
    if (teiData.fileName !== NEWFILENAME) {
            var ed = tei.generateTEI(teiData);
            edit.change(false);
            opensave.saveFile(teiData.fileName, ed);
            if (fun && typeof fun === 'function') fun();
    } else {
        return saveAs(fun);
    }
};

export function saveAsLocal(fun) {
    var ed = tei.generateTEI(teiData);
    // console.log(ed);
    edit.change(false);
    opensave.saveFileLocal('xml', teiData.fileName, ed);
    if (fun && typeof fun === 'function') fun();
};
