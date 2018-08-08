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
    params: odd.odd.params, // pointer to parameters
    version: schema.version,
    script: null, // code to be executed when the HTML is loaded
    // in the data display of the client
};

export function finalize() {
    if (teiData.script) edit.executeResizeList(teiData.script);
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
        teiData.html = cssHtml + h.html;
    } else {
        h = edit.generateHTML(teiData);
        teiData.html = h.html;
        teiData.script = h.script;
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
export function initOdd(filename: string, data: string) {
    teiData.oddName = filename;
    teiData.dataOdd = odd.loadOdd(data);
    return teiData.dataOdd.cssfile;
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

export function generateXml() {
    return generate.generateTEI(teiData);
}

/**
 * @method loadXmlOddCss
 * this function takes as input the string content of the file to be open
 * the filename parameter is optional and is used for display
 * @param filenameXml
 * @param dataXml
 * @param filenameOdd
 * @param dataOdd
 * @param filenameCss
 * @param dataCss
 * @returns 'ok' / 'null'
 * the return values are stored in the teiData structure
 */
export function loadXmlOddCss(filenameXml: string, dataXml: string, 
    filenameOdd: string, dataOdd: string, filenameCss: string, dataCss: string) {
}
