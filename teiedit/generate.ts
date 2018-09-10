/*
 * @module generate.ts
 * @author Christophe Parisse
 * Saving the results and the TEI or XML file
 */

// import * as alert from './alert';
import * as teimeta from './teimeta';
import * as edit from './edit';

let entities = require("entities");

let basicTEI = '<?xml version="1.0" encoding="UTF-8"?>\
<TEI xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:svg="http://www.w3.org/2000/svg"\
     xmlns:math="http://www.w3.org/1998/Math/MathML" xmlns="http://www.tei-c.org/ns/1.0">\
</TEI>';
let currentNamespace = 'nonamespace';

/**
 * changes < and > to html codes
 * @param {string} s - string to be processed
 * @return {string} - new string content 
 */
function encodeXML(s) {
    if (teimeta.teiData.params.encodeXMLFull)
        return entities.encodeXML(s);
    s = s.replace(/\</,'&lt;');
    s = s.replace(/\>/,'&gt;');
    return s;
}

/**
 * clean xml values in DOM from unused (empty) attributes
 * @param {Object} node - DOM top node recursively processed

 function clean(node) {
    var nodes=[], values=[];
    for (let att, i = 0, atts = node.attributes, n = atts.length; i < n; i++) {
            att = atts[i];
            if (!/\S/.test(att.nodeValue)) {
                node.removeAttribute(att.nodeName);
                i --;
            }
    }
    for (let n = 0; n < node.childNodes.length; n ++) {
        let child = node.childNodes[n];
        if (  child.nodeType === 8 
           || (child.nodeType === 3 && !/\S/.test(child.nodeValue))
           ) {
            node.removeChild(child);
            n --;
        } else if(child.nodeType === 1) {
            clean(child);
        }
    }
}
 */

/**
 * @method createAbsolutePath
 * creates a path from top of xml file and returns last node created
 * @param path 
 * @param doc
 * @returns node 

 function createAbsolutePath(path, doc) {
    let p = path.split('/').slice(1);
    // le nom de l'élément racine est ignoré
    // on pourrait controler si le nom de l'élément correspond au nom donné dans l'ODD
    // if (p[0] !== 'TEI') {
    //     let s = 'impossible de créer des chemins qui ne commencent pas par TEI';
    //     alert.alertUser(s);
    //     return null;
    // }
    let node = doc.documentElement;
    for (let i = 1; i < p.length; i++) {
        let nds = odd.getChildrenByName(node, p[i]);
        if (nds.length > 1) {
            let s = p.slice(0,i).join('/');
            s = '<!-- attention element ' + s + " n'est pas unique. -->";
        }
        if (nds.length > 0) {
            node = nds[0];
        } else {
            let newnode = doc.createElement(p[i]);
            node.appendChild(newnode);
            node = newnode;
        }
    }
    return node;
}
*/

/**
 * gather the new state of the XML object edited by teimeta
 * @param {Object} teiData - object stored in teimeta module
 * @return {string} - xml content edited by teimeta library
 */
export function generateTEI(teiData) {
    if (!teiData.dataOdd.namespace) teiData.dataOdd.namespace = 'http://www.tei-c.org/ns/1.0';
    let eltspec = teiData.dataTei;
    let s = '';
    if (!teiData.doc) {
        if (teiData.dataOdd.namespace) {
            s = '<?xml version="1.0" encoding="UTF-8"?>';
            /*
            s += '<' + teiData.dataOdd.rootTEI + '></' + teiData.dataOdd.rootTEI + '>'
            */
            /*
            if (teiData.dataOdd.namespace !== 'nonamespace')
                s += '<' + teiData.dataOdd.rootTEI + ' xmlns="' + teiData.dataOdd.namespace + '"></' + teiData.dataOdd.rootTEI + '>';
            else
                s += '<' + teiData.dataOdd.rootTEI + '></' + teiData.dataOdd.rootTEI + '>';
            */
            s += '<' + teiData.dataOdd.rootTEI + ' ';
            if (teiData.dataOdd.namespace !== 'nonamespace')
                s += ' xmlns="' + teiData.dataOdd.namespace + '"';
            for (let i=0; i<teiData.dataOdd.altIdent.length; i++) {
                s += ' ' + teiData.dataOdd.altIdent[i].type + '="' + teiData.dataOdd.altIdent[i].value + '"';
            }
            s += '></' + teiData.dataOdd.rootTEI + '>';
            teiData.doc = new DOMParser().parseFromString(s, 'text/xml');
        } else {
                teiData.doc = new DOMParser().parseFromString(basicTEI, 'text/xml');
        }
        teiData.root = teiData.doc.documentElement;
        /*
        console.log("NS:", teiData.dataOdd.namespace);
        if (teiData.dataOdd.namespace !== 'nonamespace')
            teiData.root.namespaceURI = teiData.dataOdd.namespace;
        */
        eltspec.node = teiData.root;
    }
    currentNamespace = teiData.dataOdd.namespace;
    // first generate the root otherwise it would be duplicated
    generateFilledElement(eltspec, teiData.doc, eltspec.node);
    // console.log("generateTEI", teiData.dataOdd);
    /*
    for (let i=0; i<teiData.dataOdd.altIdent.length; i++) {
        eltspec.node.setAttribute(teiData.dataOdd.altIdent[i].type, teiData.dataOdd.altIdent[i].value);
    }
    */
    if (eltspec.content)
        s += generateTEIContent(eltspec.content, teiData.doc, eltspec.node);
    // add oddname to teiData.doc
    // console.log(s);
    eltspec.node.setAttribute("xml:base", teiData.oddName);
    var xmls = new XMLSerializer();
    // return teiData.doc.toString();
    return xmls.serializeToString(teiData.doc);
}

/**
 * internal: process Element
 * @param {ElementSpec} espec - node in schema representation
 * @param {Object} doc - DOM main document 
 * @param {Object} node - DOM node corresponding to espec parameter 
 * @return {string} - return value as string format of the current node
 */
function generateElement(espec, doc, node) {
    let s = '';
    if (!edit.values[espec.validatedESID]) {
        console.log("Error: geneElemts:", espec);
        return "";
    }
    if (edit.values[espec.validatedESID].select === 'ok' /* || espec.usage === 'req' */) {
        // if node is empty create one at the end, son of the node above
        let current = espec.node;
        if (!current) {
            current = (currentNamespace === 'nonamespace') ? doc.createElement(espec.ident) : doc.createElementNS(currentNamespace, espec.ident);
            node.appendChild(current);
            espec.node = current;
            s += '<!-- ajout de ' + espec.absolutepath + ' -->\n';
        }
        s += generateFilledElement(espec, doc, current);
        if (espec.content) {
            s += generateTEIContent(espec.content, doc, current);
        }
    } else {
        // suppress a node is this is allowed
        if (espec.node && (teimeta.teiData.params.canRemove || espec.usage === 'opt')) {
            espec.node.parentNode.removeChild(espec.node);
            espec.node = null;
        }
    }
    return s;
}

/**
 * @method setTextNode
 * set the value of the text node only, without touching the children (unlike textContent or innerHTML)
 * @param node 
 * @param val 
 * @param doc
 */
function setTextNode(node, val, doc) {
    if (!doc) {
        node.textContent = val;
        return;
    }
    let first = false;
    for (let child in node.childNodes) {
        if (node.childNodes[child].nodeType === 3) {
            if (first === false) {
                first = true;
                node.childNodes[child].nodeValue = val;
                node.childNodes[child].data = val;
            } else {
                node.childNodes[child].nodeValue = '';
                node.childNodes[child].data = '';
            }
        }
    }
    if (first === false) {
        // pas de noeud texte rencontré
        let nn = doc.createTextNode(val);
        node.appendChild(nn);
    }
}

/**
 * internal: switch process to other Element(s)
 * @param {*} espec - list of nodes in schema representation
 * @param {Object} doc - DOM main document 
 * @param {Object} current - DOM node corresponding to espec parameter 
 * @return {string} - return value as string format of the current node
 */
function generateElementRef(eci, doc, current) {
    let s = '';
    // pointer to element in ec
    for ( let i = 0; i < eci.eCI.length ; i++) {
        s += generateElement(eci.eCI[i].element, doc, current);
    }
    return s;
}

/**
 * internal: switch process to a sequence of Element(s)
 * @param {*} espec - list of nodes in schema representation
 * @param {Object} doc - DOM main document 
 * @param {Object} current - DOM node corresponding to espec parameter 
 * @return {string} - return value as string format of the current node
 */
function generateSequence(eci, doc, current) {
    let s = '';
    // pointer to element in ec
    for ( let i = 0; i < eci.eCI.length ; i++) {
        for ( let k = 0; k < eci.eCI[i].element.length; k++) {
            s += generateElement(eci.eCI[i].element[k], doc, current);
        }
    }
    return s;
}

/**
 * internal: switch process to the content of a node
 * @param {*} ct - content of a node in schema representation
 * @param {Object} doc - DOM main document 
 * @param {Object} current - DOM node corresponding to espec parameter 
 * @return {string} - return value as string format of the current node
 */
function generateTEIContent(ct, doc, current) {
    let s = '';
    for (let ec of ct.sequencesRefs) {
        // ec at ElementCount format
        if (ec.type === 'elementRef') {
            s += generateElementRef(ec, doc, current);
        } else {
            s += generateSequence(ec, doc, current);
        }
    }
    return s;
}

/**
 * internal: generate value for an Element with fieds to be edited
 * @param {*} elt - node in schema representation
 * @param {Object} doc - DOM main document 
 * @param {Object} current - DOM node corresponding to espec parameter 
 * @return {string} - return value as string format of the current node
 */
function generateFilledElement(elt, doc, node) {
    let s = '';
    s += '<' + elt.ident;
    // attributes
    for (let i = 0; i < elt.attr.length; i++) {
        if (elt.attr[i].ident) {
            if (!elt.attr[i].datatype.type) {
                elt.attr[i].datatype.valueContent = elt.attr[i].rend;
            } else {
                let v = edit.values[elt.attr[i].datatype.valueContentID].value;
                elt.attr[i].datatype.valueContent = encodeXML(String(v));
            }
            // test if empty and if this the case, if parameters not to fill empty attribute is true, then remove attribute
            if (!elt.attr[i].datatype.valueContent && elt.attr[i].usage === 'opt' && !teimeta.teiData.params.defaultNewElement) {
                node.removeAttribute(elt.attr[i].ident);
            } else {
                node.setAttribute(elt.attr[i].ident, elt.attr[i].datatype.valueContent);
                s += ' ' + elt.attr[i].ident + '="' + elt.attr[i].datatype.valueContent + '"';
            }
        }
    }
    // write corresp attribute if it exists
    if (elt.corresp) {
        node.setAttribute('corresp', elt.corresp);
        s += ' ' + elt.corresp;
    }
    s += '>';
    if (elt.content && elt.content.datatype) {
        elt.content.datatype.valueContent = encodeXML(edit.values[elt.content.datatype.valueContentID].value);
        setTextNode(node, elt.content.datatype.valueContent, doc);
        s += '<textNode>' + elt.content.datatype.valueContent + '</textNode>\n';
    }
    s += '</' + elt.ident + '>\n';
    return s;
}
