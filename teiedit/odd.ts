/**
 * @module odd.ts
 * @author: Christophe Parisse
 * reading the odd file and get all information
 * that make it possible to edit the xml or the TEI
 * @exports loadOdd
 * @exports Element ElementCount ElementCountItem ElementSpec Content Attr Val ValItem
 */

import * as alert from './alert';
import * as msg from '../msg/messages';
import * as schema from './schema';

let entities = require("entities");
let xpath = require('xpath');
let select;
// import * as system from '../system/opensave';
let listElementRef = {};

function tagES(k, c) {
    return (c) ? k + '#' + c : k;    
}

/**
 * @method getChildrenByName
 * get list of immediate children nodes with a given tagname
 * @param node
 * @param name 
 * @returns [list of nodes]
 */
export function getChildrenByName(node, name, corresp=null) {
    let children = [];
    for (let child = 0; child < node.childNodes.length; child++) {
        if (node.childNodes[child].getAttribute && corresp) {
            // console.log(node.childNodes[child]);
            let a = node.childNodes[child].getAttribute('corresp');
            if (a !== corresp) continue;
        }
        if (node.childNodes[child].nodeType === 1) {
            if (node.childNodes[child].tagName === name) children.push(node.childNodes[child]);
        }
    }
    return children;
}

/**
 * read a elementSpec in the ODD description from an odd node
 * @param elementspec 
 * @param node 
 */
function readElementSpec(elementspec, node) {
    // find all about elementSpec
    let remarks = false;

    // récupérer tous les attributs potentiels
    elementspec.ident = node.getAttribute("ident");
    elementspec.corresp = node.getAttribute("corresp");
    elementspec.module = node.getAttribute("module");
    elementspec.mode = node.getAttribute("mode");
    elementspec.rend = node.getAttribute("rend"); // rend will not be used - signal it ?
    // les autres attributs sont ignorés
    elementspec.access = tagES(elementspec.ident, elementspec.corresp);

    // le champ desc
    let d =  new schema.Desc();
    if (readDesc(d, node)) elementspec.desc = d;

    // le champ content
    let c =  new schema.Content();
    if (readContent(c, node)) elementspec.content = c;

    // le champ remarksContent
    let rc =  new schema.Remarks();
    if (readRemarks(rc, node, "element")) {
        remarks = true;
        elementspec.remarks = rc;
    }
    rc =  new schema.Remarks();
    if (readRemarks(rc, node, "content")) {
        remarks = true;
        // elementspec.remarksContent = rc;
        if (elementspec.content.datatype) {
            elementspec.content.datatype.remarks = rc;
        } else {
            let s = msg.msg('remarksnodatatype');
            alert.alertUser(s);
        }
    }

    // le champ attr
    let a = getChildrenByName(node, 'attList');
    if (a.length > 0) {
        let ad = getChildrenByName(a[0], 'attDef');
        for (let i in ad) {
            let adv = new schema.AttrDef();
            if (readAttrDef(adv, ad[i])) {
                remarks = true;
            }
            elementspec.attr.push(adv);
        }
    }
    return remarks;
}

/**
 * read a remarks description from the ODD
 * @param rm 
 * @param node 
 * @param style 
 */
function readRemarks(rm, node, style) {
    let d = getChildrenByName(node, 'remarks');
    for (let i in d) {
        let s = d[i].getAttribute('style');
        if (s === style || (style === 'element' && !s)) {
            let r = processRemarks(rm, d[i]);
            if (r) {
                return rm;
            }
        }
    }
    return null;
}

/**
 * process a remarks description from the ODD
 * @param rm 
 * @param node 
 */
function processRemarks(rm, node) {
    // ab field : must be unique
    rm.cssvalue = '';
    let d = getChildrenByName(node, 'ab');
    if (d.length > 1) {
        let s = msg.msg('remarksmultab');
        alert.alertUser(s);
        rm.cssvalue = d[0].textContent;
    } else if (d.length === 1) {
        rm.cssvalue = d[0].textContent;
    }
    // if no ab field, then the user can use the note fields
    // load the <p><ident> field if it exists
    // load the <p><note> fields (easier to use than the css)
    d = getChildrenByName(node, 'p');
    let warningmultipleident = false;
    for (let i in d) {
        let p = getChildrenByName(d[i], 'ident');
        let found = false;
        if (p.length > 1) {
            let s = msg.msg('remarksmultident');
            alert.alertUser(s);
        }
        if (p.length >= 1) {
            if (warningmultipleident === true) {
                let s = msg.msg('remarksmultident');
                alert.alertUser(s + ' ' + p[0].textContent);
            }
            warningmultipleident = true;
            rm.ident = p[0].textContent;
            found = true;
        }
        p = getChildrenByName(d[i], 'note');
        if (p.length > 0 && rm.cssvalue !== '') {
            let s = msg.msg('remarksabplusnote' + d[i].innerHTML + " " + rm.cssvalue);
            alert.alertUser(s);
            found = true;
        } else if (p.length > 0) {
            rm.cssvalue = '';
            for (let j in p) {
                let a = p[j].getAttribute('type');
                rm.cssvalue += ' ' + a + ':' + p[j].textContent + ';';
            }
            found = true;
        }
        if (found === false) {
            // by default p contains the same value as with ident
            let t = d[i].textContent;
            if (t) {
                if (warningmultipleident === true) {
                    let s = msg.msg('remarksmultident');
                    alert.alertUser(s + ' ' + t);
                }
                warningmultipleident = true;
                rm.ident = t;
            }
        }
    }
    return rm;
}

/**
 * find a datatype description from the ODD
 * @param node 
 */
function getDataRef(node) : string {
    let d = getChildrenByName(node, 'dataRef');
    if (d.length < 1) return '';
    let n = d[0].getAttribute('name');
    if (!n) return '';
    switch(n) {
        case 'string':
            return 'string';
        case 'multiline':
            return 'multiline';
        case 'decimal':
            return 'number';
        case 'NCName':
            return 'NCName';
        case 'integer':
            return 'number';
        case 'number':
            return 'number';
        case 'anyURI':
            return 'anyURI';
        case 'url':
            return 'url';
        case 'duration':
            return 'duration';
        case 'list':
            return 'list';
        case 'openlist':
            return 'openlist';
        case 'date':
            return 'date';
        case 'languagecode':
            return 'languagecode';
        case 'countrycode':
            return 'countrycode';
        default:
            console.log('unknow type for dataRef:', n, 'in', node.tagName);
            return 'string';
    }
}

/**
 * read a content description from the ODD
 * @param content 
 * @param node 
 */
function readContent(content, node) {
    let d = getChildrenByName(node, 'content');
    if (d.length > 1) {
        // standard syntax is not more than one content ?
        console.log('more than one content in node: only first is processed', node.tagName);
    }
    if (d.length > 0) {
        content.rend = d[0].getAttribute('rend');
        if (!content.rend) content.rend = '';
        // find elementRef
        let e = getChildrenByName(d[0], 'elementRef');
        for (let ei in e) {
            let ec = new schema.ElementCount();
            getElementRef(ec, e[ei]);
            content.sequencesRefs.push(ec);
        }
        // find sequence
        e = getChildrenByName(d[0], 'sequence');
        for (let ei in e) {
            let ec = new schema.ElementCount();
            getSequence(ec, e[ei]);
            content.sequencesRefs.push(ec);
        }
        // find dataRef
        let ltype = getDataRef(d[0]); // si rien alors datatype === null
        // find textNode
        let t = getChildrenByName(d[0], 'textNode');
        if (t.length > 0) {
            content.datatype = new schema.DataType();
            if (ltype === '') {
                content.datatype.type = 'string'; // type par defaut
            } else {
                // sinon on respecte le type de dataRef
                content.datatype.type = ltype;
                content.datatype.rend = content.rend;
            }
        } else if (ltype !== '') {
            content.datatype = new schema.DataType();
            content.datatype.type = ltype;
            content.datatype.rend = content.rend;
        }
        // find if there are values predefined
        let vl = new schema.DataType();
        let n = valList(vl, d[0]);
        if (n > 0) {
            if (!content.datatype)
                content.datatype = new schema.DataType();
            content.datatype.vallist = vl.vallist;
            // mettre une valeur par défaut s'il y en a une
            if (content.datatype.type === 'openlist' || vl.type === 'openlist')
                content.datatype.type = 'openlist';
            else
                content.datatype.type = 'list';
            if (!content.rend)
                content.datatype.rend = vl.vallist[0].ident;
            else
                content.datatype.rend = content.rend;
        }
    }
    return d.length;
}

/**
 * get mix max values for content from the ODD
 * @param elementCount 
 * @param node 
 */
function getMinMax(elementCount, node) {
    let a = node.getAttribute('minOccurs');
    if (a) elementCount.minOccurs = a;
    a = node.getAttribute('maxOccurs');
    if (a) elementCount.maxOccurs = a;
}

/**
 * create content of elementCount reference
 * @param elementCount 
 * @param node 
 */
function getElementRef(elementCount, node) {
    getMinMax(elementCount, node);
    elementCount.model = tagElementSpec(node);
    elementCount.ident = keyElementSpec(node);
    elementCount.corresp = correspElementSpec(node);
    elementCount.type = 'elementRef';
    if (listElementRef[elementCount.model] === undefined)
        listElementRef[elementCount.model] = 1;
    else
        listElementRef[elementCount.model]++;
}

/**
 * create content of elementCount sequence
 * @param elementCount 
 * @param node 
 */
function getSequence(elementCount, node) {
    getMinMax(elementCount, node);
    elementCount.type = 'sequence';
    let s = getChildrenByName(node, 'elementRef');
    elementCount.model = [];
    elementCount.ident = [];
    elementCount.corresp = [];
    for (let i in s) {
        let t = keyElementSpec(s[i]);
        elementCount.ident.push(t);
        t = correspElementSpec(s[i]);
        elementCount.corresp.push(t);
        t = tagElementSpec(s[i]);
        elementCount.model.push(t);
        if (listElementRef[t] === undefined)
            listElementRef[t] = 1;
        else
            listElementRef[t]++;
    }
}

/**
 * construct a tag with corresp and key parts of a node
 * @param {Object} node 
 * @return {string} tag value
 */
function tagElementSpec(node) {
    let k = node.getAttribute('key');
    let c = node.getAttribute('corresp');
    return tagES(k, c);
}

/**
 * access the key part of a node
 * @param {Object} node 
 * @return {string} key value
 */
function keyElementSpec(node) {
    return node.getAttribute('key');
}

/**
 * access the corresp part of a node
 * @param {Object} node 
 * @return {string} corresp value
 */
function correspElementSpec(node) {
    return node.getAttribute('corresp');
}

/**
 * access to text value of a Desc
 * @param desc 
 * @param lg 
 */
export function textDesc(desc, lg) {
    if (!lg) {
        lg = 'en';
    }
    for (let i=0; i<desc.langs.length; i++) {
        if (lg === desc.langs[i]) return entities.decodeXML(desc.texts[i]);
    }
    // did not find language
    for (let i=0; i<desc.langs.length; i++) {
        if ('en' === desc.langs[i]) return entities.decodeXML(desc.texts[i]);
    }
    // if no english show first
    return entities.decodeXML( desc.texts.length > 0 ? desc.texts[0] : '' );
}

/**
 * access to rendition value of a Desc
 * @param desc 
 * @param lg 
 */
function rendition(desc, lg) {
    if (lg === undefined) return desc.rendition.length > 0 ? desc.rendition[0] : '';
    for (let i=0; i<desc.langs.length; i++) {
        if (lg === desc.langs[i]) return desc.rendition[i];
    }
    return desc.rendition.length > 0 ? desc.rendition[0] : '';
}

/**
 * normalizes text value for XML
 * suppress XML tags
 * @param {string} s XML text
 * @return {string} cleaned text
 */
function innerXml(s) {
    if (!s) return '';
    let pat = /\<.*?\>(.*)\<.*?\>/;
    let r = s.replace(/\n/g, ' ').match(pat);
    return (r) ? r[1] : s;
}

/**
 * read a Desc description from the ODD
 * @param desc 
 * @param node 
 * @return {numeric} length of desc
 */
function readDesc(desc, node) {
    let d = getChildrenByName(node, 'desc');
    for (let i in d) {
        desc.texts.push(innerXml(d[i].textContent));
        desc.langs.push(d[i].getAttribute('xml:lang'));
        desc.renditions.push(d[i].getAttribute('rendition'));
    }
    return d.length;
}

/**
 * read an attribute description from the ODD
 * @param attrDef 
 * @param node 
 */
function readAttrDef(attrDef, node) {
    let remarks = false;
    attrDef.ident = node.getAttribute('ident');
    attrDef.usage = node.getAttribute('usage');
    attrDef.mode = node.getAttribute('mode');
    attrDef.rend = node.getAttribute('rend');
    if (!attrDef.rend) attrDef.rend = '';
    
    // desc field
    let d =  new schema.Desc();
    if (readDesc(d, node)) attrDef.desc = d;

    attrDef.datatype = new schema.DataType();
    // datatype field
    let a = getChildrenByName(node, 'datatype');
    if (a.length > 0) {
        attrDef.datatype.type = getDataRef(a[0]);
    } else {
        attrDef.datatype.type = 'string';
    }
    attrDef.datatype.rend = attrDef.rend;
    let n = valList(attrDef.datatype, node);
    if (n > 0) {
        if (attrDef.datatype.vallistType) {
            let vlType = (attrDef.datatype.vallistType === 'closed') ? 'list' : attrDef.datatype.vallistType;
            attrDef.datatype.type = vlType;
        } else {
            // type not specified by valList: use datatype or default
            if (attrDef.datatype.type !== 'openlist')
                attrDef.datatype.type = 'list';
        }
        if (!attrDef.rend)
            attrDef.datatype.rend = (attrDef.datatype.vallist.length > 0) ? attrDef.datatype.vallist[0].ident : "";
        else
            attrDef.datatype.rend = attrDef.rend;
    }
    let rc =  new schema.Remarks();
    if (readRemarks(rc, node, "element")) {
        remarks = true;
        attrDef.datatype.remarks = rc;
    }
    return remarks;
}

/**
 * @method valList
 * compute list of values for an attributre
 * @param {Object} data - Attr structure 
 * @param {Object} node - node of an ODD 
 * @return {numeric} length of node
 */
function valList(data, node) {
    let vl = node.getElementsByTagName("valList");
    if (vl.length > 0) {
        data.vallistType = vl[0].getAttribute("type");
        data.vallist = [];
        // find all about element
        let valItem = node.getElementsByTagName("valItem");
        for (let k=0; k < valItem.length; k++) {
            let vi = new schema.ValItem();
            let attr = valItem[k].getAttribute("ident");
            if (attr) vi.ident = attr;
            // desc field
            let d =  new schema.Desc();
            if (readDesc(d, valItem[k])) {
                vi.desc = d;
            } else {
                d.langs = [''];
                d.texts = [vi.ident];
                d.renditions = [''];
                vi.desc = d;
            }
            data.vallist.push(vi);
        }
    }
    return vl.length;
}

/**
 * @method loadOdd
 * parse all elementSpec from the odd and call sub routines for Content fields
 * @param data : content of an odd file
 * @return teiOdd structure (model data from the ODD)
 */
export function loadOdd(data, eltsSpecs = null, eltsRefs = null) {
    data = schema.stripBOM(data);
    listElementRef = {};
    let odd = new schema.SCHEMA();
    let error = '';
    let warning = '';
    // get XML ready
    let parser = new DOMParser();
    let doc;
    // let doc = parser.parseFromString(data, "text/xml");
    try {
        let datastring = data.toString();
        doc = parser.parseFromString(datastring, 'text/xml');
        if (doc.documentElement.nodeName === "parsererror") {
            alert.alertUser("The ODD file is not valid: Operation canceled." + doc.documentElement.innerHTML);
            console.log("Errors in ODD file", doc.documentElement.innerHTML);
        // } else {
            // console.log("No errors found");
        }
    } catch(e) {
        alert.alertUser("The ODD file is not valid: Operation canceled (catch) " + e.toString());
    }
    let ns = doc.documentElement.namespaceURI;
    select = xpath.useNamespaces({"tei": ns});
    let schemaSpec = select("//tei:schemaSpec", doc);
    if (schemaSpec.length < 1) {
        let s = msg.msg('nooddinelementspec');
        alert.alertUser(s);
        return null;
    }
    // get attribute start
    let attr = schemaSpec[0].getAttribute("start");
    // function return value
    if (attr) {
        odd.init();
        odd.rootTEI = attr;
    } else {
        let s = msg.msg('norootattr');
        alert.alertUser(s);
        return null;
    }

    /* insert elements from included models */
    let duplicateOK = {};
    // add classRefs (elements from included classRef) if there are some
    if (eltsSpecs) {
        odd.listElementSpec = eltsSpecs; 
        // list element that can be duplicated
        for (let i in eltsSpecs) {
            duplicateOK[i] = i;
        }
    }
    if (eltsRefs) {
        odd.listElementRef = eltsRefs;
    }

    // get attribute ident
    odd.rootIdent = schemaSpec[0].getAttribute("ident");
    // get all altIdent
    let eAlt = getChildrenByName(schemaSpec[0], 'altIdent');
    // read the elementSpec
    for (let i=0; i < eAlt.length ; i++) {
        let type = eAlt[i].getAttribute("type");
        let content = eAlt[i].textContent;
        // console.log("altIdent", type, content);
        odd.altIdent.push({type:type, value:content});
    }

    // get all elementSpec
    let eSpec = getChildrenByName(schemaSpec[0], 'elementSpec');
    // get attribute namespace
    odd.namespace = schemaSpec[0].getAttribute("ns");
    // get attribute cssfile
    odd.cssfile = schemaSpec[0].getAttribute("rend");
    odd.remarks = false;
    // read the elementSpec
    for (let i=0; i < eSpec.length ; i++) {
        var es = new schema.ElementSpec();
        if (readElementSpec(es, eSpec[i])) {
            odd.remarks = true;
        }
        if (odd.listElementSpec[es.access]) {
            if (!duplicateOK[es.access])
                error += msg.msg('redefelementspec') + es.access + '<br/>';
            // if in duplicateOK, the old element is replaced by the new one
            else
                console.log('duplicate element: ' + es.access);
        }
        odd.listElementSpec[es.access] = es;
    }
    // get all listed elementRef
    for (let i in listElementRef) odd.listElementRef[i] = listElementRef[i];
    for (let i in odd.listElementRef) {
        // check if all elementRef exist as elementSpec
        if (!odd.listElementSpec[i]) {
            error += msg.msg('notdefelementref1') + '[' + i + ']' + msg.msg('notdefelementref2') + '<br/>';
        }
    }
    for (let i in odd.listElementSpec) {
        // check if all elementSpec exist as elementRef
        if (odd.listElementSpec[i].access !== odd.rootTEI && !odd.listElementRef[odd.listElementSpec[i].access]) {
            warning += msg.msg('notusedelementref1') + odd.listElementSpec[i].access + msg.msg('notusedelementref2') + '<br/>';
        }
    }
    let rootElt = odd.listElementSpec[odd.rootTEI];
    if (!rootElt) {
        error += msg.msg('nodefrootelement') + odd.rootTEI + '<br/>';
    } else {
        rootElt.usage = 'req';
    }
    if (error) {
        alert.alertUser(error);
        return null;
    }
    if (warning) {
        alert.alertUser(warning);
        console.log(warning);
    }
    return odd;
}

/**
 * @method loadOddClassRef
 * parse all classRef of the odd and return list
 * @param data : content of odd file
 * @return array of { key: "", source: "" }
 */
export function loadOddClassRef(data) {
    data = schema.stripBOM(data);
    let error = '';
    let warning = '';
    // get XML ready
    let parser = new DOMParser();
    let doc;
    try {
        doc = parser.parseFromString(data.toString(), 'text/xml');
        if (doc.documentElement.nodeName === "parsererror") {
            alert.alertUser("The ODD file is not valid: Operation canceled (in loadOddClassRef)." + doc.documentElement.innerHTML);
            console.log("Errors in ODD file (loadOddClassRef).", doc.documentElement.innerHTML);
        // } else {
            // console.log("No errors found in loadOddClassRef");
        }
    } catch(e) {
        alert.alertUser("The ODD file is not valid: Operation canceled (in loadOddClassRef) (catch) " + e.toString());
    }
    let ns = doc.documentElement.namespaceURI;
    select = xpath.useNamespaces({"tei": ns});
    let schemaSpec = select("//tei:schemaSpec", doc);
    if (schemaSpec.length < 1) {
        let s = msg.msg('nooddinelementspec');
        alert.alertUser(s);
        return null;
    }
    // get all classRef = including other files
    let classRefs = [];
    let cRef = getChildrenByName(schemaSpec[0], 'classRef');
    for (let i=0; i < cRef.length; i++) {
        let key = cRef[i].getAttribute("key");
        let source = cRef[i].getAttribute("source");
        if (key && source) {
            classRefs.push({ key: key, source: source});
        } else {
            alert.alertUser('incorrect classRef specification for ' + cRef[0].toString());
        }
    }
    return classRefs;
}
