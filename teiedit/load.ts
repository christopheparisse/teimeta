/**
 * @module load.ts
 * @author Christophe Parisse
 * load the XML file and the initial value according to the ODD
 * if the XML file is empty, all initial values are zero or null or blank
 * the result structure teiData is ready to be processed
 */

import * as teimeta from './teimeta';
import * as odd from './odd';
import * as schema from './schema';
import * as alert from './alert';
import * as msg from '../msg/messages';

let entities = require("entities");

export let ptrListElementSpec = null; // closure variable

/*
 * loading the XML file
 */

/**
 * @method getNodeText
 * get text of current node only
 * @param {Object} node
 * @returns {string} value of text
 */
function getNodeText(node) {
    var txt = '';
    for (let child in node.childNodes) {
        if (node.childNodes[child].nodeType === 3) {
            txt += entities.decodeXML(node.childNodes[child].textContent);
        } else if (node.childNodes[child].nodeType === 1 && node.childNodes[child].tagName === 'seg') {
            txt += entities.decodeXML(node.childNodes[child].textContent);
        }
    }
    return txt;
}

/**
 * @method getOddFromXml
 * @param {*} data raw data content of TEI file 
 * @param {*} dataOdd array of ElementSpec from odd.ts - loadOdd
 * @returns {*} true if ok
 */
export function getOddFromXml(data, teiData) {
    if (!teiData.dataOdd) return ''; // no odd already loaded
    if (data) data = schema.stripBOM(data);
    // get XML ready
    teiData.parser = new DOMParser();
    try {
        if (data) {
            let datastring = data.toString();
            teiData.doc = teiData.parser.parseFromString(datastring, 'text/xml');
            if (teiData.doc.documentElement.nodeName === "parsererror") {
                alert.alertUser("The XML file is not valid: Operation canceled." + teiData.doc.documentElement.innerHTML);
                console.log("Errors in XML file", teiData.doc.documentElement.innerHTML);
            // } else {
                // console.log("No errors found");
            }
        }
    } catch(e) {
        alert.alertUser("The XML file is not valid: Operation canceled (catch) " + e.toString());
    }

    // find root
    let root = null;
    if (teiData.doc) {
        root = teiData.doc.documentElement;
        let nodes = odd.getChildrenByName(root, teiData.dataOdd.rootTEI);
        if (nodes.length > 1) {
            alert.alertUser(msg.msg('morethanoneroot'));
            return false;
        } else if (nodes.length === 1) {
            root = nodes[0];
        }
    }
    if (root) {
        let attr = root.getAttribute("xml:base");
        if (attr) return attr;
    }
    return '';
}

/**
 * @param {*} data raw data content of TEI file 
 * @param {*} dataOdd array of ElementSpec from odd.ts - loadOdd
 * @returns {*} true if ok
 */
export function loadTei(data, teiData) {
    if (data) data = schema.stripBOM(data);
    //console.log("call of loadTei ", data, teiData);
    // get XML ready
    if (!teiData.parser) teiData.parser = new DOMParser();
    try {
        if (!teiData.doc) {
            if (data) {
                let datastring = data.toString();
                teiData.doc = teiData.parser.parseFromString(datastring, 'text/xml');
                if (teiData.doc.documentElement.nodeName === "parsererror") {
                    alert.alertUser("The XML file is not valid: Operation canceled." + teiData.doc.documentElement.innerHTML);
                    console.log("Errors in XML file", teiData.doc.documentElement.innerHTML);
                // } else {
                    // console.log("No errors found");
                }
            }
        }
    } catch(e) {
        alert.alertUser("The XML file is not valid: Operation canceled (catch) " + e.toString());
    }
    if (!teiData.dataOdd) return ''; // no odd loaded

    // find root
    let root = null;
    let path = '/' + teiData.dataOdd.rootTEI; // root but must be unique !
    if (teiData.doc) {
        root = teiData.doc.documentElement;
        let nodes = odd.getChildrenByName(root, teiData.dataOdd.rootTEI);
        if (nodes.length > 1) {
            alert.alertUser(msg.msg('morethanoneroot'));
            return false;
        } else if (nodes.length === 1) {
            root = nodes[0];
        }
    }
    teiData.root = root; // store for later external save
    // find first elementSpec
    ptrListElementSpec = teiData.dataOdd.listElementSpec;
    let h = ptrListElementSpec[teiData.dataOdd.rootTEI];
    if (!h) {
        alert.alertUser(msg.msg('norootinodd'));
        return false;
    }
    // create first elementSpec and find and create the other recursively
    // h = descriptor elementSpec
    // root = list of nodes (could be null)
    // '' = initial path
    // 1 = minimal number of root authorized
    // 1 = maximal number of root authorized
    teiData.dataTei = loadElementSpec(h, root, path, '1', '1', null);
    return true;
}

/**
 * check dataType value
 * @param {Object} datatype - dataType object
 */
function verifyDatatype(datatype) {
    if (datatype.type === 'openlist' && datatype.valueContent !== '') {
        // check if valueContent fait partie du openlist
        let found = false;
        for (let i=0; i < datatype.vallist.length; i++) {
            if (datatype.vallist[i].ident === datatype.valueContent) {
                found = true;
                break;
            } 
        }
        if (found === false) {
            // this item was created by the user.
            let vi = new schema.ValItem();
            vi.ident = datatype.valueContent;
            // creation of a description with only the value and the discription is the same as the value for
            // items that were created by the users
            vi.desc = new schema.Desc();
            vi.desc.langs.push("eng");
            vi.desc.texts.push(vi.ident);
            vi.desc.renditions.push(vi.ident);
            datatype.vallist.push(vi);
        }
    }
    if (!datatype.valueContent && datatype.rend) datatype.valueContent = datatype.rend;
}

/**
 * load elementSpec data from the node - manage element array of any size
 * @param es 
 * @param node 
 * @param path 
 * @param minOcc 
 * @param maxOcc 
 * @param parent 
 */
export function loadElementSpec(es, node, path, minOcc, maxOcc, parent) {
    let c = schema.copyElementSpec(es);
    //console.log('loadElementSpec ', c.access, path);
    // creation of an initial empty element for the current node
    c.node = node;
    c.parentElementSpec = parent;
    if (maxOcc === '2') {
        if (minOcc === '1')
            c.usage = 'req';
        else            
            c.usage = 'opt'; // case 0 to 2
    } else if (maxOcc === 'unbounded') {
        if (minOcc === '1')
            c.usage = 'req';
        else            
            c.usage = 'opt'; // case 0 to unbounded
    } else {
        if (minOcc === '1')
            c.usage = 'req'; // case 1 to 1
        else
            c.usage = 'opt'; // case 0 to 1
    }
    c.validatedES = '';
    // look for all existing element in the DOM under this node
    c.absolutepath = path;
    let nbElt = 0;
    if (node) {
        c.validatedES = 'ok'; // this element did exist so it was validated by the user
        // load content
        if (c.content && c.content.datatype) {
            // the text of the node is edited
            c.content.datatype.valueContent = getNodeText(node).trim();
            c.content.datatype.rend = c.content.rend;
            if (!c.content.datatype.valueContent) c.content.datatype.valueContent = c.content.rend;
            c.content.datatype.parentElementSpec = c;
            verifyDatatype(c.content.datatype);
        }
        // load attributes
        for (let a in c.attr) {
            if (c.attr[a].ident) {
                c.attr[a].datatype.parentElementSpec = c;
                if (c.attr[a].datatype.type === '') {
                    // no edition of the attribute
                    // but predefined value
                    if (c.attr[a].rend) c.attr[a].datatype.valueContent = c.attr[a].rend;
                } else {
                    let attr = node.getAttribute(c.attr[a].ident);
                    if (attr) {
                        c.attr[a].datatype.valueContent = attr;
                        c.attr[a].datatype.rend = c.attr[a].rend;
                        if (!c.attr[a].datatype.valueContent) c.attr[a].datatype.valueContent = c.attr[a].rend;
                        verifyDatatype(c.attr[a].datatype);
                    } else {
                        if (c.attr[a].rend)
                            c.attr[a].datatype.valueContent = c.attr[a].rend;
                        else
                            c.attr[a].datatype.valueContent = '';
                    }
                }
            }
        }
        // load content
        // node recursivity is allowed because we follow node which is not recursive
        if (!c.content) return c;
        for (let ec of c.content.sequencesRefs) {
            // ec is at the format ElementCount
            if (ec.type === 'elementRef') {
                loadElementRef(ec, node, c.absolutepath, c);
            } else {
                loadSequence(ec, node, c.absolutepath, c);
            }
        }
    } else {
        // build an empty element not validated
        // either because the DOM is empty or because we did not find the element in the current DOM
        // content and attr will be initialized
        // go down in the tree
        /* here we apply a parameter of the software
         * the elements not edited are or are not included by default
         */
        if (!c.content) return c;
        // check recursivity
        if (isRecursive(c.parentElementSpec, c.access)) {
            c.content = null;
            c.recursive = true;
            console.log('recursive stop at ', c.access, c.absolutepath);
            return c;
        }
        c.validatedES = teimeta.teiData.params.defaultNewElement ? 'ok' : ''; // l'élément n'existait pas et il n'est pas validé par l'utilisateur
        for (let ec of c.content.sequencesRefs) {
            // ec at the format ElementCount
            // load content
            if (ec.type === 'elementRef') {
                loadElementRef(ec, null, c.absolutepath, c);
            } else {
                loadSequence(ec, null, c.absolutepath, c);
            }
        }
    }
    return c;
}

/**
 * test if an elementSpec has already be seen in a tree branch to avoid recursive processing
 * @param es 
 * @param name 
 */
function isRecursive(es, name) {
    if (!es) return;
    // es is an elementSpec
    if (es.access === name) return true;
    if (es.parentElementSpec)
        return isRecursive(es.parentElementSpec, name);
    else
        return false;
}

/**
 * load elementRef data from the node
 * @param ec 
 * @param node 
 * @param path 
 * @param parent 
 */
function loadElementRef(ec, node, path, parent) {
    //console.log("loadElementRef:",ec,node,path);
    // ec is an ElementCount
    // prepare the first element ElementCountItem
    let eci = new schema.ElementCountItem();
    eci.parentElementSpec = parent;
    // ec.model contains the name of the elementSpec
    eci.type = 'elementRef';
    ec.eCI.push(eci);

    // load from TEI
    let nodes = node ? odd.getChildrenByName(node, ec.ident, ec.corresp) : [];
    // filtering the elements (nodes) using corresp field if necessairy
    path =  path + '/' + ec.model;
    // si c'est vide
    if (nodes.length === 0) {
        // find and create one elementSpec
        let h = ptrListElementSpec[ec.model];
        eci.model = ec.model;
        eci.element = loadElementSpec(h, null, path, ec.minOccurs, ec.maxOccurs, parent);
        return;
    }
    // fill the first one if there is one
    if (nodes.length > 0) {
        // find and create first elementSpec
        let h = ptrListElementSpec[ec.model];
        eci.model = ec.model;
        eci.element = loadElementSpec(h, nodes[0], path, ec.minOccurs, ec.maxOccurs, parent);
    }
    for (let i = 1; i < nodes.length ; i++) {
        if (ec.maxOccurs === '1') {
            alert.alertUser(msg.msg('toomanyelements') + path + '/' + ec.model);
        }
        // prepare new elements
        // ec is an ElementCount
        eci = new schema.ElementCountItem();
        eci.parentElementSpec = parent;
        eci.type = 'elementRef';
        ec.eCI.push(eci);
        // find and create first elementSpec
        let h = ptrListElementSpec[ec.model];
        eci.model = ec.model;
        eci.element = loadElementSpec(h, nodes[i], path, ec.minOccurs, ec.maxOccurs, parent);
    }
}

/**
 * load Sequence data from the node
 * @param ec 
 * @param node 
 * @param path 
 * @param parent 
 */
function loadSequence(ec, node, path, parent) {
    //console.log("loadSequence:",ec,node,path);
    // load from TEI
    let nnodes = []; // array of arrays of nodes
    // for all models in the sequence, we look for corresponding nodes
    if (node) {
        for (let n = 0; n < ec.ident.length; n++) {
            if (node) {
                // filtering the elements (nodes) using corresp field if necessary
                let elts = odd.getChildrenByName(node, ec.ident[n], ec.corresp[n]);
                nnodes.push(elts);    
            } else {
                nnodes.push([]);    
            }
        }
    }
    let maxlg = 0;
    for (let k = 0; k < nnodes.length ; k++)
        if (maxlg < nnodes[k].length) maxlg = nnodes[k].length;
    /*
    if (nnodes.length > 1 && ec.maxOccurs === '1') {
        for (let k = 0; k < nnodes.length ; k++) {
            if (nnodes[k].length > 1) {
                alert.alertUser("Attention: trop d'éléments pour " + ec.model[k] + " dans " + path + '/' + ec.model[k]);
            }
        }
    }
    */
    
    // initialise the array of descendants
    ec.eCI = [];
   // fill a node if there is none
    if (!node || maxlg === 0) {
        // prepare the first sequence
        // ec is an ElementCount
        let eci = new schema.ElementCountItem();
        eci.parentElementSpec = parent;
        eci.type = 'sequence';
        ec.eCI.push(eci);
        eci.element = [];
        eci.model = [];
        // ec.model contains an array of names of elementSpec
        // find and create first sequence of elementSpec
        for (let k=0; k < ec.model.length ; k++) {
            let h = ptrListElementSpec[ec.model[k]];
            eci.model.push(ec.model[k]);
            eci.element.push(loadElementSpec(h, null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs, parent));
        }
        if (ec.minOccurs === '2') {
            // specific case of a node with 2 obligatory elements
            // prepare the second sequence
            // ec is an ElementCount
            let eci = new schema.ElementCountItem();
            eci.type = 'sequence';
            ec.eCI.push(eci);
            eci.element = [];
            eci.model = [];
            // ec.model contains an array of names of elementSpec
            // find and create first sequence of elementSpec
            for (let k=0; k < ec.model.length ; k++) {
                let h = ptrListElementSpec[ec.model[k]];
                eci.model.push(ec.model[k]);
                eci.element.push(loadElementSpec(h, null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs, parent));
            }
        }
        return;
    }

    // generate a set of eci in ec.eCI
    for (let i=0; i < maxlg ; i++) {            
        let eci = new schema.ElementCountItem();
        eci.parentElementSpec = parent;
        eci.type = 'sequence';
        eci.element = [];
        eci.model = [];
        ec.eCI.push(eci);
    }
    
    // fill the eci with the nodes
    for (let i = 0; i < maxlg ; i++) {
        // prepare the new elements
        // ec is an ElementCount
        for (let k=0; k < nnodes.length ; k++) {            
            // find and create first elementSpec
            let h = ptrListElementSpec[ec.model[k]];
            ec.eCI[i].model.push(ec.model[k]);
            ec.eCI[i].element.push(loadElementSpec(h, nnodes[k].length > i ? nnodes[k][i] : null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs, parent));
        }
    }
}
