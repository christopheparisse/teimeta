/**
 * @name tei.ts
 * @author Christophe Parisse
 */

import * as edit from './edit';
import * as odd from './odd';

let dom = require('xmldom').DOMParser;
let xpath = require('xpath');
let select = xpath.useNamespaces({
        "tei": "http://www.tei-c.org/ns/1.0",
        "xml": "",
        "exm": "http://www.tei-c.org/ns/Examples",
        "s": "http://purl.oclc.org/dsdl/schematron"
    });
let parser = null;
let doc = null;

/**
 * @method load
 * @param {*} data raw data content of TEI file 
 * @param {*} dataOdd array of ElementSpec from odd.ts - loadOdd
 * @returns {*} array of ElementSpec TEI + ODD
 */
export function load(data, dataOdd) {
    // get XML ready
    parser = new DOMParser();
    // let doc = parser.parseFromString(data, "text/xml");
    doc = data 
        ? new dom().parseFromString(data.toString(), 'text/xml')
        : null;
    let dataTei = [];
    for (let i in dataOdd) {
        let es = copy(dataOdd[i]);
        dataTei.push(es);
        if (es.predeclare.endsWith('/')) es.predeclare = es.predeclare.substring(0,es.predeclare.length-1);
        // if (!es.predeclare) es.predeclare = '***NEPASEDITER***';
        es.absolutepath = es.predeclare + '/' + es.ident;
        // load from TEI
        let path = es.absolutepath.replace(/\//g,"/tei:"); // add namespace
        //console.log(path);
        let nodes;
        try {
            nodes = doc ? select(path, doc) : [];
        } catch(err) {
            console.log('caught at load: ', err);
            continue;
        }
        if (nodes.length > 1) {
            console.log("not only one elementSpec");
            console.log("pas encore implémenté");
            // créer un tableau
            // faire autant de copies que nécessaire pour mettre dans le tableau
        } else if (nodes.length === 1) {
            es.validated = true;
            edit.values[es.validatedID] = true;
            if (es.content)
                loadContent(nodes[0], es.content, es.absolutepath); // es === es.list[0]
        } else {
            // nodes.length === 0
            es.validated = false;
            edit.values[es.validatedID] = true;
            if (es.content)
                loadContent(null, es.content, es.absolutepath);
        }
    }
    return dataTei;
}

export function copy(obj): any {
    return JSON.parse(JSON.stringify(obj));
}

function loadContent(doc, ct, abspath) {
    for (let i=0; i < ct.one.length; i++) {
        let ec = new odd.ElementCount();
        ec.count = "one";
        ec.model = copy(ct.one[i]);
        ct.one[i] = ec;
        loadOne(doc, ec, abspath); // read element editing info
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        let ec = new odd.ElementCount();
        ec.count = "oneOrMore";
        ec.model = copy(ct.oneOrMore[i]);
        ct.oneOrMore[i] = ec;
        loadXOrMore(doc, ec, abspath, true); // read element editing info
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        let ec = new odd.ElementCount();
        ec.count = "zeroOrMoreone";
        ec.model = copy(ct.zeroOrMore[i]);
        ct.zeroOrMore[i] = ec;
        loadXOrMore(doc, ec, abspath, false); // read element editing info
    }
}

function loadOne(doc, ec, abspath) {
    // préparer l'élément unique
    // ec est un ElementCount
    let eci = new odd.ElementCountItem();
    eci.element = copy(ec.model);
    eci.validated = true;
    edit.values[eci.validatedID] = true;
    ec.eCI.push(eci);

    let elt = eci.element;
    elt.absolutepath = abspath + '/' + elt.name;
    // load from TEI
    let path = elt.absolutepath.replace(/\//g,"/tei:"); // add namespace
    let nodes;
    try {
        nodes = doc ? select(path, doc) : [];
    } catch(err) {
        console.log('caught at loadOne: ', err);
        return;
    }
    // utiliser count TODO
    if (nodes.length > 0) {
        elt.textContent = nodes[0].textContent.trim();
    }
    if (elt.content) {
        loadContent(doc, elt.content, elt.absolutepath);
    }
}

function loadXOrMore(doc, ec, abspath, x) {
    let path = ec.model.absolutepath = abspath + '/' + ec.model.name;
    // load from TEI
    path = path.replace(/\//g,"/tei:"); // add namespace
    let nodes;
    try {
        nodes = doc ? select(path, doc) : [];
    } catch(err) {
        console.log('caught at loadXOrMore: ', err);
        return;
    }
    // utiliser count
    if (nodes.length > 0) {
        // on peut se baser sur ce qui existe pour construire les données
        for (let i in nodes) {
            // préparer l'élément
            // ec ElementCount
            let eci = new odd.ElementCountItem();
            eci.element = copy(ec.model);
            eci.validated = true;
            edit.values[eci.validatedID] = true;
            ec.eCI.push(eci);
            eci.element.textContent = nodes[i].textContent.trim();
            if (eci.element.content) {
                loadContent(doc, eci.element.content, ec.model.absolutepath);
            }
        }
    } else {
        // il faut construire au moins un élément vide
        // préparer l'élément unique
        // ec est un ElementCount
        let eci = new odd.ElementCountItem();
        eci.element = copy(ec.model);
        eci.validated = x; // si x == true on est dans oneOrMore sinon dans zeroOrMore
        edit.values[eci.validatedID] = x;
        ec.eCI.push(eci);
        if (eci.element.content) {
            loadContent(doc, eci.element.content, ec.model.absolutepath);
        }
    }
}

export function generateTEI(dataTei) {
    let s = '';
    for (let i in dataTei) {
        dataTei[i].validated = edit.values[dataTei[i].validatedID];
        s += dataTei[i].predeclare + '/' + dataTei[i].ident + ': ' + dataTei[i].validated + '\n';
        if (dataTei[i].content) {
            s += generateTEIContent(dataTei[i].content, null); // null for node TODO
        }
    }
    return s;
}

function generateTEIContent(ct, node) {
    let s = '';
    for (let i=0; i < ct.one.length; i++) {
        s += generateElements(ct.one[i].eCI, node);
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        s += generateElements(ct.oneOrMore[i].eCI, node);
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        s += generateElements(ct.zeroOrMore[i].eCI, node);
    }
    return s;
}

function generateElements(ec, node) {
    let s = '';
    for (let i in ec) {
        s += (edit.values[ec[i].validatedID] === true)
            ? "VALIDATED "
            : ( (edit.values[ec[i].validatedID] === false) ? "unchecked " : "empty");
        ec[i].element.textContent = edit.values[ec[i].element.textContentID];
        s += ec[i].element.name + ' := ' + ec[i].element.textContent + '\n';
        if (ec[i].element.content) {
            s += generateTEIContent(ec[i].element.content, node);
        }
    }
    return s;
}
