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

import * as teimeta from '../teiedit/teimeta';
import * as opensave from './opensave';
import * as alert from './alert';
import * as msg from './messages';
import * as common from './common';

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
            if (!err) { // if not cancelled - use data
                // try to find the odd name
                let oddname:string = teimeta.initXml(name, data);
                if (!oddname) {
                    // find an odd and then this function will open the XML
                    findOdd(name, data);
                } else if (oddname === teimeta.teiData.oddName) {
                    // same as current odd
                    // do not reload - open XML
                    finishOpenXml(name, data);
                } else if (oddname.substring(0,4) !== "http") {
                    // an odd is indicated in the xml file
                    // it is not an external address 
                    // so cannot access directly if not electron
                    let displayname = dispname(oddname);
                    // open ODD then open XML
                    common.openSpecificLocalFile(oddname, displayname, name, data, afterOpenXmlFile);
                } else {
                    // an odd is indicated in the xml file
                    // try to open it
                    let displayname = dispname(oddname);
                    // read ODD
                    readTextFile(oddname, function (text) {
                        // console.log("read ODD: ", oddname, text);
                        if (text) {
                            // load ODD
                            openOddLoad(oddname, displayname, text);
                            // then open XML
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
    if (teimeta.teiData.dataOdd) {
        alert.askUserModalForOdd(teimeta.teiData.oddName, true, openChooseOdd);
    } else {
        alert.askUserModalForOdd('', false, openChooseOdd);
    }
}

export function cleanCss() {
    teimeta.teiData.cssName = "";
    teimeta.teiData.dataCss = "";
    let el = document.getElementById('cssname');
    if (el) el.innerHTML = "CSS: ";
    let js = JSON.stringify({data: "", cssName: ""});
    localStorage.setItem("previousCSS", js);
}

function finishOpenXml(name, data) {
    function finishIt() {
        teimeta.loadXml(name, data);
        el = document.getElementById('teidata');
        if (el) {
            el.innerHTML = teimeta.teiData.html;
        } else {
            alert.alertUser('HTML error: see console log');
            console.log('no <div id="teidata"></div> element defined in HTML. Cannot load TEIMETA html form.');
            }
        teimeta.finalize();
        //console.log("openfile TEI", teimeta.teiData.dataTei);
        //console.log(edit.values);
    }
    teimeta.teiData.fileName = name ? name : msg.msg('newfile');
    let el = document.getElementById('filename');
    el.innerHTML = msg.msg('file') + teimeta.teiData.fileName;
    // test if cssfile is needed
    if (teimeta.teiData.dataOdd && teimeta.teiData.dataOdd.cssfile) {
        testCss(teimeta.teiData.dataOdd.cssfile, finishIt);
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
    } else if (cssname === teimeta.teiData.cssName) {
        // same as current css
        // do not reload
        if (fun) fun();
        return;
    } else if (cssname.substring(0,4) !== "http") {
        // an css is indicated in the odd file
        // it is not an external address so cannot access directly if not electron
        let displayname = dispname(cssname);
        common.openSpecificLocalFile(cssname, cssname, teimeta.teiData.oddName, null, afterOpenCssFile);
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
            findOdd(msg.msg('newfile'), null);
        } else {
            try {
                let ls = localStorage.getItem("previousODD");
                if (ls) {
                    var js = JSON.parse(ls);
                    if (!js.version || js.version !== teimeta.teiData.version) {
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
                    finishOpenXml(msg.msg('newfile'), null);
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
    common.saveFileLocal("html", "page.html", teimeta.teiData.html);
}

export function checkChange(fun) {
    if (teimeta.teiData.edit.change() === false) {
        fun();
        return;
    }
    alert.askUserModalYesNoCancel(
        msg.msg('askforsave'),
        (ret) => {
            if (ret === 'yes') { //save
                if (teimeta.teiData.system === 'electron') {
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
            if (!js.version || js.version !== teimeta.teiData.version) {
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

    /*

    teimeta.loadXml(null, msg.msg('newfile'));
    el = document.getElementById('filename');
    if (el) el.innerHTML = msg.msg('file') + teimeta.teiData.fileName;

    el = document.getElementById('teidata');
    if (el) {
        el.innerHTML = teimeta.teiData.html;
    } else {
        alert.alertUser('HTML error: see log');
        console.log('no teidata element defined in HTML. Cannot load TEIMETA html form.');
    }
    let h; // result from generateHTML
    if (teimeta.teiData.dataCss) {
        let cssHtml =  '<style id="cssstyle">' + teimeta.teiData.dataCss + '</style>\n';
        h = edit.generateHTML(teimeta.teiData);
        teimeta.teiData.html = cssHtml + h.html;
    } else {
        h = edit.generateHTML(teimeta.teiData);
        teimeta.teiData.html = h.html;
    }
    teimeta.teiData.fileName = msg.msg('newfile');
    teimeta.teiData.new = true;

    edit.executeResizeList(h.script);

    */

    function finishOL() {
        el = document.getElementById('cssname');
        if (el) el.innerHTML = "CSS: " + teimeta.teiData.cssName;
        let js = JSON.stringify({data: data, oddName: name, version: teimeta.teiData.version});
        localStorage.setItem("previousODD", js);
    }

    let el = document.getElementById('oddname');
    if (el) el.innerHTML = "ODD: " + displayname;
    teimeta.initOdd(name, data);
    if (teimeta.teiData.dataOdd.cssfile) {
        testCss(teimeta.teiData.dataOdd.cssfile, finishOL);
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
    let el = document.getElementById('cssname');
    if (el) el.innerHTML = "CSS: " + displayname;
    teimeta.initCss(name, data);
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
    if (dt) {
        dt.innerHTML = '';
    } else {
        alert.alertUser('HTML error: see console log');
        console.log('no <div id="teidata"></div> element defined in HTML. Cannot load TEIMETA html form.');
    }
    teimeta.teiData.oddName = msg.msg('nofilename');
    teimeta.teiData.fileName = msg.msg('nofilename');
    teimeta.teiData.cssName = msg.msg('nofilename');
    teimeta.teiData.new = true;
    let el = document.getElementById('oddname');
    el.innerHTML = "ODD: " + teimeta.teiData.oddName;
    el = document.getElementById('cssname');
    if (el) el.innerHTML = "CSS: " + teimeta.teiData.cssName;
    el = document.getElementById('filename');
    el.innerHTML = msg.msg('file') + teimeta.teiData.fileName;
}

export function saveAs(fun) {    
    opensave.chooseSaveFile('xml', function(err, name) {
        if (!err) {
            teimeta.teiData.fileName = name;
            let el = document.getElementById('filename');
            el.innerHTML = msg.msg('file') + teimeta.teiData.fileName;
            var ed = teimeta.generateXml();
            opensave.saveFile(teimeta.teiData.fileName, ed);
            teimeta.teiData.edit.change(false);
            if (fun && typeof fun === "function") fun();
        } else
            console.log('saveas cancelled', name, err);
    });
};

export function saveStorage() {
    var ed = teimeta.generateXml();
    localStorage.setItem("previousXML", ed);
    localStorage.setItem("previousXMLName", teimeta.teiData.fileName);
};

export function save(fun) {
    if (teimeta.teiData.fileName !== msg.msg('newfile')) {
            var ed = teimeta.generateXml();
            teimeta.teiData.edit.change(false);
            opensave.saveFile(teimeta.teiData.fileName, ed);
            if (fun && typeof fun === 'function') fun();
    } else {
        return saveAs(fun);
    }
};

function saveit(name, fun) {
    var ed = teimeta.generateXml();
    // console.log(ed);
    teimeta.teiData.edit.change(false);
    common.saveFileLocal('xml', name, ed);
    if (fun && typeof fun === 'function') fun();
}

export function saveLocal(fun, force = false) {
    let nf = msg.msg('newfile');
    if (teimeta.teiData.fileName === nf || force === true) {
        alert.promptUserModal("Please give the name of your new file: ",
            function(newname) {
                if (!newname) return;
                teimeta.teiData.fileName = newname;
                let el = document.getElementById('filename');
                el.innerHTML = msg.msg('file') + teimeta.teiData.fileName;
                if (newname) saveit(newname, fun);
            });
    } else {
        saveit(teimeta.teiData.fileName, fun);
    }
};

export function saveAsLocal(fun, force = false) {
    alert.promptUserModal("Please give the name of your new file: ",
        function(newname) {
            if (!newname) return;
            teimeta.teiData.fileName = newname;
            let el = document.getElementById('filename');
            el.innerHTML = msg.msg('file') + teimeta.teiData.fileName;
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
