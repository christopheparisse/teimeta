/**
 * Author: Christophe Parisse
 * Module: data.ts 
 * handle the data for the triplet XML file, ODD file, CSS file.
 * so that to open, create and save an XML file it is only necessary to interface with this file
 * and the internal specificities are hidden from the external interface
 */

import * as schema from './schema';
import * as odd from './odd';
import * as load from './load';
import * as edit from './edit';
import * as generate from './generate';
import * as alert from './alert';
import { init } from '../ui/init-singlepage';

/*
* internal values
*/
export let teiData = {
    oddName: '', // name of ODD file
    cssName: '', // name of CSS file
    fileName: '', // name of XML/TEI file
    dataOdd: null, // data to handle ODD
    dataCss: null, // data to handle css (CSScstring)
    dataTei: null, // data to handle xml data (by default TEI)
    html: null, // html content string
    new: true,
    parser: null, // DOM Parser
    doc: null, // DOM document
    system: '', // name of running system (electron or html)
    edit: edit, // pointer to edition functions
    params: new schema.PARAMS(), // pointer to parameters
    version: schema.version,
    init: function() {
        this.oddName = ''; // name of ODD file
        this.cssName = ''; // name of CSS file
        this.fileName = ''; // name of XML/TEI file
        this.dataOdd = null; // data to handle ODD
        this.dataCss = null; // data to handle css (CSScstring)
        this.dataTei = null; // data to handle xml data (by default TEI)
        this.html = null; // html content string
        this.new = true;
        this.parser = null; // DOM Parser
        this.doc = null; // DOM document
    }
};

/**
 * load an url - provided here for testing purposes and to make it easier to implement interfaces with teimeta
 * @param {string} file - url to be read
 * @param {FileCallback} callback - function executed after the call 
 */
export function readTextFile(file, callback) {
    var rawFile:any = new XMLHttpRequest();
    // rawFile.overrideMimeType("text/xml");
    rawFile.responseType = "text";
    rawFile.open("GET", file, true);
    rawFile.onload = function(e) {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(0, rawFile.responseText);
        } else {
            callback(rawFile.status, "error reading " + file);
        }
    }
    rawFile.send(null);
}

function urlpathname(s) {
    let p = s.lastIndexOf('/');
    return (p >= 0) ? s.substring(0,p+1) : s;
}

/**
 * to be executed after an HTMl string provided by teimeta has been loaded
 * necessary to implement automatic resize of entry fields
 */
export function finalizeHTML() {
    edit.finalize();
}

/**
 * @method openXml
 * this function takes as input the string content of the file to be open
 * the filename parameter is optional and is used for display
 * the function tries to find out whether the xml file contains the name of ODD file
 * @param filename
 * @param data
 * @returns 'ok' / 'odd' / 'css' / 'null'
 * the return values are stored in the data structure
 */
export function loadXml(filename: string, data: string) {
    if (!teiData.dataOdd) {
        // without odd file it is impossible 
        // to load the XML so abort
        return false;
    }
    if (data === null) {
        // in this case, the XML is null, so we
        // just load a new XML which only the ODD
        teiData.dataTei = null;
        teiData.parser = null;
        teiData.doc = null;
        load.loadTei(null, teiData);
        teiData.fileName = filename;
        teiData.new = true;
    } else {
        if (filename !== teiData.fileName) {
            // different files
            // so reinit
            teiData.parser = null; // DOM Parser
            teiData.doc = null; // DOM document
            teiData.fileName = filename;
        }
        // now load XML
        load.loadTei(data, teiData);
        teiData.new = false;
    }
    let h; // result from generateHTML
    if (teiData.dataCss) {
        let cssHtml =  '<style id="cssstyle">' + teiData.dataCss + '</style>\n';
        h = edit.generateHTML(teiData);
        teiData.html = cssHtml + h;
    } else {
        h = edit.generateHTML(teiData);
        teiData.html = h;
    }
    return true;
}

/**
 * @method initXml
 * this function takes as input the string content of the file to be open
 * the filename parameter is optional and is used for display
 * the function tries to find out whether the xml file contains the name of ODD file
 * @param filename
 * @param data
 * @returns 'ok' / 'css' / 'null'
 * the return values are stored in the data structure
 */
export function initXml(filename: string, data: string) {
    teiData.fileName = filename;
    return load.getOddFromXml(data, teiData);
}

/**
 * @method initOdd
 * this function takes as input the string content of the file to be open
 * the filename parameter is optional and is used for display
 * @param filename
 * @param data
 * @returns 'ok' / 'css' / 'null'
 * the return values are stored in the data structure
 */
export function initOdd(filename: string, data: string, urlmodel: string) {
    let impts = odd.loadOddClassRef(data);
    let eltSpecs = [];
    let eltRefs = [];
    if (impts && impts.length > 0) {
        console.log(impts);
        // there are imports to be loaded.
        let p = urlpathname(urlmodel);
        // for use with Node-style callbacks...
        var async = require("async");
        // var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
        async.each(impts, (ielt, callback) => {
            console.log("read:", p + ielt.source);
            readTextFile(p + ielt.source, function(err, idata) {
                if (err) return callback(err);
                try {
                    let ie = idata.toString();
                    let d = odd.loadOdd(ie);
                    console.log(p + ielt.source, d, ie);
                    if (d) eltSpecs.push(d.listElementSpec);
                    if (d) eltRefs.push(d.listElementRef);
                } catch (e) {
                    return callback(e);
                }
                callback();
            });
        }, err => {
            if (err) console.error(err.message);
            // eltRefs contains now all elementSpec
            let o = odd.loadOdd(data, eltSpecs, eltRefs);
            if (!o) return false;
            teiData.oddName = filename;
            teiData.dataOdd = o;
            return true;
        });
    }
    let o = odd.loadOdd(data);
    if (!o) return false;
    teiData.oddName = filename;
    teiData.dataOdd = o;
    return true;
}

/**
 * @method initCss
 * this function takes as input the string content of the file to be open
 * the filename parameter is optional and is used for display
 * @param filename
 * @param data
 * @returns 'ok' / 'null'
 * the return values are stored in the data structure
 */
export function initCss(filename: string, data: string) {
    teiData.cssName = filename;
    teiData.dataCss = data;
}

/**
 * gather the new state of the XML object edited by teimeta
 * @return {string} - xml content edited by teimeta library
 */
export function generateXml() {
    return generate.generateTEI(teiData);
}

/**
 * @method loadXmlOddCss
 * this function takes as input the string content of all the data
 * filename parameters is optional (can be null) and are used for display
 * if dataCss is null, no css is used (unless included in dataOdd)
 * if dataXml is null, a new empty XML file is generated
 * dataOdd cannot be null - an ODD must be specified
 * @param {string} filenameXml - name of xml file
 * @param {string} dataXml - content of xml file
 * @param {string} filenameOdd - name of odd file
 * @param {string} dataOdd - content of odd file
 * @param {string} filenameCss - name of css file
 * @param {string} dataCss - content of css file
 * @returns 'ok' / 'null'
 * the return values are stored in the teiData structure
 */
export function loadXmlOddCss(filenameXml: string, dataXml: string, 
    filenameOdd: string, dataOdd: string, filenameCss: string, dataCss: string) {
        if (dataCss) initCss(filenameCss, dataCss);
        if (!dataOdd) {
            alert.alertUser('no dataOdd in loadXmlOddCss: cannot edit xml/tei file');
            return '<div>Missing odd!</div>'
        }
        if (initOdd(filenameOdd, dataOdd, urlpathname(filenameOdd)) === null) return '<div>Incorrect odd!</div>';
        loadXml(filenameXml, dataXml);
        return teiData.html;
}

/**
 * @method readXmlOddCss
 * this function takes as input three urls
 * the urls are filenames that must be available though http protocol
 * if filenameCss is null, no css is used (unless included in filenameOdd)
 * if filenameXml is null, a new empty XML file is generated
 * filenameOdd cannot be null - an ODD must be specified
 * @param {string} filenameXml - name of xml file
 * @param {string} filenameOdd - name of odd file
 * @param {string} filenameCss - name of css file
 * @returns 'ok' / 'null'
 * the return values are stored in the teiData structure
 */
export function readXmlOddCss (filenameXml: string,  
    filenameOdd: string, filenameCss: string, callback: any) {
        function loadXml(filename, oddname, odddata, cssname, cssdata) {
            if (filename) {
                readTextFile(filename,
                function(err, data) {
                    if (err) {
                        console.log('error : ', data);
                        alert.alertUser('error reading ' + filename + ' : ' + data);
                        return;
                    }
                    let h = loadXmlOddCss(filename, data, oddname, odddata, cssname, cssdata);
                    callback(h);
                });
            } else {
                let h = loadXmlOddCss(null, null, oddname, odddata, cssname, cssdata);
                callback(h);
            }
        }
        function loadOdd(filename, cssname, cssdata) {
            if (filename) {
                readTextFile(filename, 
                function(err, data) {
                    if (err) {
                        console.log('error : ', data);
                        alert.alertUser('error reading ' + filename + ' : ' + data);
                        return;
                    }
                    loadXml(filenameXml, filenameOdd, data, filenameCss, data);
                });
            } else {
                alert.alertUser('cannot run readXmlOddCss with null filenameOdd');
            }
        }
        if (filenameCss) {
            readTextFile(filenameCss, 
            function(err, data) {
                if (err) {
                    console.log('error : ', data);
                    alert.alertUser('error reading ' + filenameCss + ' : ' + data);
                return;
                }
                loadOdd(filenameOdd, filenameCss, data);
            });
        } else {
            loadOdd(filenameOdd, null, null);
        }
}