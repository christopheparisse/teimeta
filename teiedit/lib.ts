/**
 * @module lib.ts
 * @author Christophe Parisse
 * list of functions that can be accessed from within an html file so a to create and display a teimeta object
 * this file is useful only for people that do not want to use the require mecanism but prefer to use
 * lib.js is generated by webpack and will contain all dependencies 
 * <script src="temp-page/lib.js"></script>
 * 
 * otherwise use require(teimeta) which does the same job
 */
import * as teimeta from './teimeta';
import '../css/font-awesome/css/font-awesome.min.css';
import '../css/internal.css';

if (window['teimeta'] === undefined) window['teimeta'] = {};  

/*
 * these four functions are necessary to use the interface
 */

/**
 * @method window['teimeta'].loadXmlOddCss
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
window['teimeta'].loadXmlOddCss = teimeta.loadXmlOddCss;

/**
 * @method window['teimeta'].readXmlOddCss
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
window['teimeta'].readXmlOddCss = teimeta.readXmlOddCss;

/**
 * methode window['teimeta'].finalizeHTML
 * to be executed after an HTMl string provided by teimeta has been loaded
 * necessary to implement automatic resize of entry fields - no parameters
 */
window['teimeta'].finalizeHTML = teimeta.finalizeHTML;

/**
 * gather the new state of the XML object edited by teimeta
 * @return {string} - xml content edited by teimeta library
 */
window['teimeta'].generateXml = teimeta.generateXml;

/**
 * acces to parameters
    defaultNewElement = true; // if true the non existing elements are included by default
    leftShift = 5; // size in pixel of the hanging size of the imbrications
    groupingStyle = 'border'; // display style of the groups of duplicable elements
    validateRequired = false; // if true it is possible to not validate (ie remove) obligatory elements
    language = 'fr'; // language name of the desc fields
    displayFullpath = false; // display or not the full path of the tags
    canRemove = false; // allows to remove existing nodes
    fmt = '?:00:00'; // format for time length of media
    nbdigits = 0; // number of digits allowed in the decimal part of a number
    encodeXMLFull = false; // if true use entities.encodeXML otherwise only encodes < and >
 */
window['teimeta'].teimetaParams = teimeta.teiData.params;

/*
 * the functions below as utilitary and to be used only for easy implementation
 * and testing purposes
 */

/**
 * utilitary function for loading urls for user that don't want to implement 
 */
window['teimeta'].readTextFile = teimeta.readTextFile;

let saveAs = require('file-saver');
/**
 * utilitary function for testing as for user that don't want to implement 
 * a saving mecanism
 * @param {string} type - html or xml or text
 * @param {string} name - name of file to be written 
 * @param {string} data - data to be written
 */
function saveFileLocal(type, name, data) {
    var blob = new Blob([data], {
        type : "text/plain;charset=utf-8"
    });
    // {type: 'text/css'});
    var p1 = name.lastIndexOf('/');
    var p2 = name.lastIndexOf('\\');
    if (p1 < p2) p1 = p2;
    if (p1 === -1) p1 = 0;
    var l = name.substr(p1);
    saveAs.saveAs(blob, l);
};
window['teimeta'].saveFileLocal = saveFileLocal;