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

function createFullPath(doc, node, pa) {
    let e = null;
    for (let i=0; i < pa.length; i++) {
        e = doc.createElement(pa[i]);
        node.appendChild(e);
        node = e;
    }
    return e;
}

function testPathAndGet(path, doc) {
    let nodes;
    try {
        nodes = doc ? select(path, doc) : [];
    } catch(err) {
        console.log('caught at testPathAndGet: ', err);
        return [];
    }
    if (nodes.length > 0) {
        return nodes;
    } else {
        return null;
    }
}

function testPathAndConstruct(path, name, doc) {
    let nodes = testPathAndGet(path, doc);
    if (nodes.length > 0) {
        // ok to create node(s).
        let newNodes = [];
        for (let k=0; k < nodes.length ; k++) {
            let n = createFullPath(doc, nodes[k], name);
            if (n) newNodes.push(n);
        }
        return newNodes;
    }
    return null;
}

function getChildNodesByName(node, name) {
    var children = [];
    for (let child in node.childNodes) {
        if (node.childNodes[child].nodeType === 1) {
            if (node.childNodes[child].tagName === name) children.push(child);
        }
    }
    return children;
}

/**
 * @method createAbsolutePath
 * @param path 
 * @param doc 
 */
function createAbsolutePath(path, doc) {
    /* Trois cas:
    * Le chemin existe et on liste les nodes
    * Le chemin existe jusqu'à l'avant dernier node et on crée un ou plusieurs nouveaux nodes
    * Le chemin n'existe pas. On le crée jusqu'à l'avant dernier et on revient au cas deux.
    */
    let nds = testPathAndGet(path, doc);
    if (nds) return nds;
    // cas UN ok.
    let p = path.split('/').slice(1);
    // find chemin jusqu'à l'avant dernier
    let pth = '/' + p.slice(0,p.length-1).join('/');
    nds = testPathAndConstruct(pth, p[p.length-1], doc);
    /*
    if (nds) return nds;
    for (let i = p.length-1; i > 0; i--) {
        // find element above
        let pth = '/' + p.slice(0,i).join('/');
        let nds = testAndReturn(pth, doc);
        if (nds) return nds;
    }
    // si ici alors il faut créer un élément à la racine !
    n = createFullPath(doc, doc.rootElement, p);
    if (n) return [n]; else return [];
    */
    let ip = 0;
    nds = [doc.rootElement]; // plusieurs chemins seront possible à tout moment
    for ( ; ip < pth.length - 1; ip++) {
        let nextNds = [];
        for (let k=0; k < nds.length; k++) {

        }
    }
}

export function generateTEI(data, dataTei) {
    // get XML ready
    parser = new DOMParser();
    // let doc = parser.parseFromString(data, "text/xml");
    doc = data 
        ? new dom().parseFromString(data.toString(), 'text/xml')
        : null;
    let s = '';
    for (let i in dataTei) {
        dataTei[i].validated = edit.values[dataTei[i].validatedID];
        s += '<element path="' + dataTei[i].predeclare + '/' + dataTei[i].ident + '" validated="' + dataTei[i].validated + '">\n';
        if (dataTei[i].content) {
            s += generateTEIContent(dataTei[i].content, doc);
        }
        s += '</element>\n';
    }
    console.log(s);
    // transform doc to text
    console.log(doc.toString());
    return doc.toString();
}

function generateOneContent(eci, doc) {
    let s = '';
    // load from TEI
    let path = eci.element.absolutepath.replace(/\//g,"/tei:"); // add namespace
    let nodes;
    try {
        nodes = doc ? select(path, doc) : [];
    } catch(err) {
        console.log('caught at generateOneContent: ', err);
        return;
    }
    if (nodes.length > 0) {
        if (nodes.length > 1) {
            alert("Trop d'élements pour un One. Il faudrait supprimer les éléments en trop.");
        }
        s += generateElement(eci, doc, nodes[0]);
    } else {
        console.log("createAbsPath=", path); // va générer le node si nécessaire
        let nodes = createAbsolutePath(path, doc);
        if (nodes.length > 0) {
            for (let k=0; k<nodes.length; k++) {
                s += generateElement(eci, doc, nodes[k]);
            }
        }
    }
    return s;
}

function generateXOrMoreContent(ec, doc, type) {
    let s = '';
    // load from TEI
    let path = ec[0].element.absolutepath.replace(/\//g,"/tei:"); // add namespace
    // tous les éléments ont le même path
    let nodes;
    try {
        nodes = doc ? select(path, doc) : [];
    } catch(err) {
        console.log('caught at generateXOrMoreContent: ', err);
        return;
    }
    // maintenant il faut d'abord utiliser tous les nodes pour les premiers ec
    // et s'il n'y a pas la place rajouter des nodes
    let iEC = 0; // pointeur sur l'élément dans ec
    for ( ; iEC < nodes.length && iEC < ec.length ; iEC++) {
        s += generateElement(ec[iEC], doc, nodes[iEC]);
    }
    for ( ; iEC < ec.length ; iEC++) {
        // si on passe ici c'est qu'on a fini les nodes sans avoir fini les ec
        nodes = createAbsolutePath(path, doc);
        // on épuise les nouveaux nodes (en général un seul node sera créé à la fois)
        for (let k=0; iEC < ec.length && k < nodes.length; k++) {
            let el = doc.createElement(ec[0].element.name); // même nom pour tous les éléments
            nodes[k].appendChild(el);
            s += generateElement(ec[iEC], doc, nodes[k]);
        }
    }
    return s;
}

function generateTEIContent(ct, doc) {
    let s = '';
    for (let i=0; i < ct.one.length; i++) {
        s += generateOneContent(ct.one[i].eCI[0], doc);
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        s += generateXOrMoreContent(ct.oneOrMore[i].eCI, doc, true);
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        s += generateXOrMoreContent(ct.zeroOrMore[i].eCI, doc, false);
    }
    return s;
}

function generateElement(eci, doc, node) {
    let s = '';
    /*
    s += (edit.values[ec[i].validatedID] === true)
        ? "VALIDATED "
        : ( (edit.values[ec[i].validatedID] === false) ? "unchecked " : "empty");
    */
    console.log("geneElemts:",eci);
    if (edit.values[eci.validatedID] === true) {
        eci.element.textContent = edit.values[eci.element.textContentID];
        node.textContent = eci.element.textContent;
        s += '<' + eci.element.name + '>' + eci.element.textContent + '</' + eci.element.name + '>\n';
        if (eci.element.content) {
            s += generateTEIContent(eci.element.content, doc);
        }
    }
    return s;
}
