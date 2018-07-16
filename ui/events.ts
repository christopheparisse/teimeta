/**
 * events.ts
 * author: Christophe Parisse
 * main procedures to load, save, and call teiedit functions
 * 
 * Use case
 * 1) openXml() --> choose a local file --> loadXml(data/file/url)
 *      if ODD in XML then loadODD(url) or ask for (file)
 *      else choose ODD file or choose predefined ODD or already loaded ODD --> (loadOdd data/file/url)
 *      if CSS in ODD file same thing as above but with CSS 
 * 2) newXml()
 *      check changes + 
 *      choose ODD file or choose predefined ODD or already loaded ODD --> (loadOdd data/file/url)
 * 3) chooseOdd()
 *      choose ODD file to be used in later openXml() or newXml()
 *      if the user want to replace current ODD, he has to save first but change is immediate otherwise the user 
 *      has to use newXml() as above
 * 4) chooseCss()
 *      choose a CSS file to be used in later openXml() or newXml()
 *      the predefined CSS can be used immediatly
 *
 **/

import * as edit from '../teiedit/edit';
import * as odd from '../teiedit/odd';
import * as schema from '../teiedit/schema';
import * as tei from '../teiedit/tei';
import * as load from '../teiedit/load';
import * as opensave from './opensave';
import * as alert from './alert';
import * as msg from './messages';
import * as common from './common';

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

function dispname(s:string) {
    let p = s.lastIndexOf('/');
    if (p === -1) p = s.lastIndexOf('\\');
    if (p === -1) return s;
    return s.substring(p+1);
}

function afterOpenXmlFile(err, oddname, displayname, odddata, xmlname, xmldata) {
    if (!err) {
        openOddLoad(oddname, displayname, odddata);
        finishOpenXml(xmlname, xmldata);
    }                    
}

export function openXml() {
    // checked changes - the user can cancel if needed
    checkChange(() => { // if ok ask the user for a file
        opensave.chooseOpenFile(function(err, name, data) {
            if (!err) { // if not cancelled
                let oddname:string = load.checkOddTei(data, teiData);
                if (!oddname) {
                    // find an odd
                    findOdd(name, data);
                } else if (oddname === teiData.oddName) {
                    // same as current odd
                    // do not reload
                    finishOpenXml(name, data);
                } else if (oddname.substring(0,4) !== "http") {
                    // an odd is indicated in the xml file
                    // it is not an external address so cannot access directly if not electron
                    let displayname = dispname(oddname);
                    common.openSpecificLocalFile(oddname, displayname, name, data, afterOpenXmlFile);
                } else {
                    // an odd is indicated in the xml file
                    // try to open it
                    let displayname = dispname(oddname);
                    readTextFile(oddname, function (text) {
                        // console.log("read ODD: ", oddname, text);
                        if (text) {
                            openOddLoad(oddname, displayname, text);
                            finishOpenXml(name, data);
                        }
                    });
                }
            } else
                console.log(name, err);
        });
    });
};

/**
 * method findOdd
 * ask the user for choices: open ODD, use predefined ODD, use previous ODD (if possible)
 */
function findOdd(nameXml, dataXml) {
    function openChooseOdd(choice) {
        switch (choice) {
            case 'computer':
                // open local odd
                opensave.chooseOpenFile(function(err, name, data) {
                    if (!err) {
                        openOddLoad(name, name, data);
                        finishOpenXml(nameXml, dataXml);
                    } else {
                        console.log('cancel open odd for xml file: ', nameXml);
                    }
                });
                break;
            case 'current':
                // open with current odd
                finishOpenXml(nameXml, dataXml);
                break;

            default:
                if (choice && choice.substring(0,6) === 'aumoid') {
                    let c = choice.substring(6);
                    if (isNaN(parseInt(c))) {
                        console.log('bad choice:', choice, "[", c, "]");
                        alert.alertUser('bad choice: ' + choice + " [" + c + "]");
                        return;
                    }
                    let n = (msg.oddpredefs())[c];
                    if (n && n.odd) {
                        if (n.css && n.css !== "#clean#") {
                            oddCssLoadUrls(n.odd, n.label, n.css, n.labelcss,
                                function(){
                                    finishOpenXml(nameXml, dataXml);
                                });
                        } else {
                            if (n.css === "#clean#") {
                                cleanCss();
                            }
                            oddLoadUrl(n.odd, n.label,
                                function(){
                                    finishOpenXml(nameXml, dataXml);
                                });
                        }
                    } else {
                        console.log('bad number in choice:', choice, msg.oddpredefs());
                        alert.alertUser('bad number in choice: ' + choice);
                    }
                }
                break;
        }
    }
    if (teiData.dataOdd) {
        alert.askUserModalForOdd(teiData.oddName, true, openChooseOdd);
    } else {
        alert.askUserModalForOdd('', false, openChooseOdd);
    }
}

export function cleanCss() {
    teiData.cssName = "";
    teiData.dataCss = "";
    let el = document.getElementById('cssname');
    if (el) el.innerHTML = "CSS: ";
    let js = JSON.stringify({data: "", cssName: ""});
    localStorage.setItem("previousCSS", js);
}

function finishOpenXml(name, data) {
    function finishIt() {
        // now load XML
        load.loadTei(data, teiData);
        let h; // result from generateHTML
        if (teiData.dataCss) {
            let cssHtml =  '<style id="cssstyle">' + teiData.dataCss + '</style>\n';
            h = edit.generateHTML(teiData);
            teiData.html = cssHtml + h.html;
        } else {
            h = edit.generateHTML(teiData);
            teiData.html = h.html;
        }
        el = document.getElementById('teidata');
        el.innerHTML = teiData.html;
        edit.executeResizeList(h.script);
        teiData.new = false;
        //console.log("openfile TEI", teiData.dataTei);
        //console.log(edit.values);
    }
    teiData.fileName = name ? name : msg.msg('newfile');
    let el = document.getElementById('filename');
    el.innerHTML = msg.msg('file') + teiData.fileName;
    // test if cssfile is needed
    if (teiData.dataOdd && teiData.dataOdd.cssfile) {
        testCss(teiData.dataOdd.cssfile, finishIt);
    }
    finishIt();
}

function afterOpenCssFile(err, cssname, displayname, cssdata, unused1, unused2) {
    if (!err) {
        openCssLoad(cssname, displayname, cssdata);
    }                    
}

function testCss(cssname, fun) {
    if (!cssname) {
        // nothing to do
        if (fun) fun();
        return;
    } else if (cssname === teiData.cssName) {
        // same as current css
        // do not reload
        if (fun) fun();
        return;
    } else if (cssname.substring(0,4) !== "http") {
        // an css is indicated in the odd file
        // it is not an external address so cannot access directly if not electron
        let displayname = dispname(cssname);
        common.openSpecificLocalFile(cssname, cssname, teiData.oddName, null, afterOpenCssFile);
        if (fun) fun();
    } else {
        // an odd is indicated in the xml file
        // try to open it
        let displayname = dispname(cssname);
        readTextFile(cssname, function (text) {
            // console.log("read ODD: ", oddname, text);
            if (text) {
                openCssLoad(cssname, displayname, text);
                if (fun) fun();
            }
        });
    }
}

export function newXml(choice) {
    // checked changes
    checkChange(() => {
        if (choice !== 'previous') {
            // find an odd
            findOdd(null, null);
        } else {
            try {
                let ls = localStorage.getItem("previousODD");
                if (ls) {
                    var js = JSON.parse(ls);
                    if (!js.version || js.version !== schema.version) {
                        //console.log('ancienne version de localstorage');
                        emptyFile();
                        return;
                    }
                    let lcss = localStorage.getItem("previousCSS");
                    var jcss = JSON.parse(lcss);
                    // console.log('newfile CSS', jcss);
                    if (lcss) {
                        openCssLoad(jcss.cssName, jcss.cssName, jcss.data);
                    }
                    openOddLoad(js.oddName, js.oddName, js.data);
                    //alert.alertUser('here is previous');
                    finishOpenXml(null, null);
                } else {
                    emptyFile();
                }
            } catch (error) {
                console.log(error);
                emptyFile();
            }
        }
    });
}

export function dumpHtml() {
    common.saveFileLocal("html", "page.html", teiData.html);
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
            // console.log('newfile CSS', jcss);
            if (lcss) {
                openCssLoad(jcss.cssName, jcss.cssName, jcss.data);
            }
            openOddLoad(js.oddName, js.oddName, js.data);
            finishOpenXml(lxname, lx);
            if (callback) callback(0);
        } else {
            emptyFile();
        }
    } catch (error) {
        console.log(error);
        emptyFile();
    }
}

export function openOddCssLoad(nameOdd, dispNameOdd, dataOdd, nameCss, dispNameCss, dataCss) {
    openCssLoad(nameCss, dispNameCss, dataCss);
    openOddLoad(nameOdd, dispNameOdd, dataOdd);
}

export function openOddLoad(name, displayname, data) {
    function finishOL() {
        let h; // result from generateHTML
        if (teiData.dataCss) {
            let cssHtml =  '<style id="cssstyle">' + teiData.dataCss + '</style>\n';
            h = edit.generateHTML(teiData);
            teiData.html = cssHtml + h.html;
        } else {
            h = edit.generateHTML(teiData);
            teiData.html = h.html;
        }
        teiData.fileName = msg.msg('newfile');
        teiData.new = true;
    
        el = document.getElementById('cssname');
        if (el) el.innerHTML = "CSS: " + teiData.cssName;
        el = document.getElementById('filename');
        el.innerHTML = msg.msg('file') + teiData.fileName;
        el = document.getElementById('teidata');
        el.innerHTML = teiData.html;
        edit.executeResizeList(h.script);
        let js = JSON.stringify({data: data, oddName: name, version: schema.version});
        localStorage.setItem("previousODD", js);
    }

    teiData.oddName = name;
    let el = document.getElementById('oddname');
    el.innerHTML = "ODD: " + displayname;
    teiData.dataOdd = odd.loadOdd(data);
    load.loadTei(null, teiData);
    if (teiData.dataOdd.cssfile) {
        testCss(teiData.dataOdd.cssfile, finishOL);
    } else {
        finishOL();
    }
}

export function openOdd() {
    // checked changes
    checkChange(() => {
        // save in all cases and put in name + data
        saveStorage();
        let lxdata = localStorage.getItem("previousXML");
        let lxname = localStorage.getItem("previousXMLName");
        // find an odd
        findOdd(lxname, lxdata);
    });
};

export function openCssLoad(name, displayname, data) {
    teiData.cssName = name;
    let el = document.getElementById('cssname');
    if (el) el.innerHTML = "CSS: " + displayname;
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
                // save in all cases and put in name + data
                saveStorage();
                openCssLoad(name, name, data);
                reLoad(null);
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
    if (teiData.fileName !== msg.msg('newfile')) {
            var ed = tei.generateTEI(teiData);
            edit.change(false);
            opensave.saveFile(teiData.fileName, ed);
            if (fun && typeof fun === 'function') fun();
    } else {
        return saveAs(fun);
    }
};

function saveit(name, fun) {
    var ed = tei.generateTEI(teiData);
    // console.log(ed);
    edit.change(false);
    common.saveFileLocal('xml', name, ed);
    if (fun && typeof fun === 'function') fun();
}

export function saveLocal(fun, force = false) {
    let nf = msg.msg('newfile');
    if (teiData.fileName === nf || force === true) {
        alert.promptUserModal("Please give the name of your new file: ",
            function(newname) {
                if (!newname) return;
                teiData.fileName = newname;
                let el = document.getElementById('filename');
                el.innerHTML = msg.msg('file') + teiData.fileName;
                if (newname) saveit(newname, fun);
            });
    } else {
        saveit(teiData.fileName, fun);
    }
};

export function saveAsLocal(fun, force = false) {
    alert.promptUserModal("Please give the name of your new file: ",
        function(newname) {
            if (!newname) return;
            teiData.fileName = newname;
            let el = document.getElementById('filename');
            el.innerHTML = msg.msg('file') + teiData.fileName;
            if (newname) saveit(newname, fun);
        });
};

export function readTextFile(file, callback) {
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

export function oddLoadUrl(url, namedisplayed, fun) {
    readTextFile(url, function(text) {
        openOddLoad(url, namedisplayed, text);
        fun();
    });
}

export function oddCssLoadUrls(urlOdd, namedisplayedOdd, urlCss, namedisplayedCss, fun) {
    readTextFile(urlOdd, function(textOdd) {
        readTextFile(urlCss, function(textCss) {
            openOddCssLoad(urlOdd, namedisplayedOdd, textOdd, urlCss, namedisplayedCss, textCss);
            fun();
        });
    });
}
