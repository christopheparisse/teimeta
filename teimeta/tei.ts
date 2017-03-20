/**
 * @module tei.ts
 * @author Christophe Parisse
 * lecture d'un fichier xml et chargement des valeurs initiales
 * si le fichier est vide (null) les valeurs initiales sont toutes mises à zéro
 * la structrue résultat teiData est prête à être traitée
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

let basicTEI = '<?xml version="1.0" encoding="UTF-8"?>\
<TEI xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:svg="http://www.w3.org/2000/svg"\
     xmlns:math="http://www.w3.org/1998/Math/MathML" xmlns="http://www.tei-c.org/ns/1.0">\
</TEI>';
/**
 * @method load
 * @param {*} data raw data content of TEI file 
 * @param {*} dataOdd array of ElementSpec from odd.ts - loadOdd
 * @returns {*} true if ok
 */
export function load(data, teiData) {
    teiData.dataTei = [];
    // get XML ready
    teiData.parser = new DOMParser();
    teiData.doc = data 
        ? new dom().parseFromString(data.toString(), 'text/xml')
        : null;
    for (let i in teiData.dataOdd) {
        let es = copy(teiData.dataOdd[i]);
        if (es.predeclare.endsWith('/')) es.predeclare = es.predeclare.substring(0,es.predeclare.length-1);
        // if (!es.predeclare) es.predeclare = '***NEPASEDITER***';
        es.absolutepath = es.predeclare + '/' + es.ident;
        // load from TEI
        let path = es.absolutepath.replace(/\//g,"/tei:"); // add namespace
        //console.log(path);
        let nodes;
        try {
            nodes = teiData.doc ? select(path, teiData.doc) : [];
        } catch(err) {
            console.log('caught at load: ', err);
            continue;
        }
        // les données sont prêtes à être traitées.
        // on ajoute donc l'élément au tableau de données
        teiData.dataTei.push(es);
        // les valeurs du contenu des ElementSpec (tableau de valeurs)
        // permettant de gérer un nombre quelconque d'éléments 
        // si autorisé est initialisé
        if (nodes.length > 0) {
            // créer un tableau
            // faire autant de copies que nécessaire pour mettre dans le tableau
            for (let k=0; k < nodes.length; k++) {
                let esEC = new odd.ElementSpecItem();
                esEC.validated = true;
                esEC.node = nodes[k];
                es.ec.push(esEC); // ajout de l'élément à liste
                // il est prêt à être étudié et édité
                if (es.content) {
                    esEC.content = copy(es.content);
                    loadContent(nodes[k], esEC.content, es.absolutepath);
                }
            }
        } else {
            // nodes.length === 0
            let esEC = new odd.ElementSpecItem();
            if (es.mode === 'replace' || es.mode === 'change')
                esEC.validated = true;
            esEC.node = null;
            es.ec.push(esEC); // ajout de l'élément à liste
            // il est prêt à être étudié et édité
            if (es.content) {
                esEC.content = copy(es.content);
                loadContent(null, esEC.content, es.absolutepath);
            }
        }
    }
    return true;
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

/**
 * @method getNodeText
 * get text of current node only
 * @param node
 * @returns value of text
 */
function getNodeText(node) {
    var txt = '';
    for (let child in node.childNodes) {
        if (node.childNodes[child].nodeType === 3) {
            txt += node.childNodes[child];
        }
    }
    return txt;
}

function loadOne(node, ec, abspath) {
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
    let nodes = node ? getChildrenByName(node, elt.name) : [];
    // utiliser count TODO
    if (nodes.length > 0) {
        elt.textContent = getNodeText(nodes[0]).trim();
    }
    if (elt.content) {
        loadContent(nodes.length > 0 ? nodes[0] : null, elt.content, elt.absolutepath);
    }
}

function loadXOrMore(node, ec, abspath, x) {
    ec.model.absolutepath = abspath + '/' + ec.model.name;
    // load from TEI
    let nodes = node ? getChildrenByName(node, ec.model.name) : [];
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
            eci.element.textContent = getNodeText(nodes[i]).trim();
            if (eci.element.content) {
                loadContent(nodes[i], eci.element.content, ec.model.absolutepath);
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
            loadContent(null, eci.element.content, ec.model.absolutepath);
        }
    }
}

/**
 * @method getChildrenByName
 * get list of immediate children nodes with a given tagname
 * @param node
 * @param name 
 * @returns [list of nodes]
 */
function getChildrenByName(node, name) {
    let children = [];
    for (let child in node.childNodes) {
        if (node.childNodes[child].nodeType === 1) {
            if (node.childNodes[child].tagName === name) children.push(node.childNodes[child]);
        }
    }
    return children;
}

function setTextNode(node, val, doc) {
    let first = false;
    for (let child in node.childNodes) {
        if (node.childNodes[child].nodeType === 3) {
            if (first === false) {
                first = true;
                node.childNodes[child].nodeValue = val;
            } else {
                node.childNodes[child].nodeValue = '';
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
 * @method createAbsolutePath
 * creates a path from top of xml file and returns last node created
 * @param path 
 * @param doc
 * @returns node 
 */
function createAbsolutePath(path, doc) {
    let p = path.split('/').slice(1);
    let node = doc.documentElement;
    for (let i = 0; i < p.length; i++) {
        let nds = getChildrenByName(node, p[i]);
        if (nds.length > 1) {
            let s = p.slice(0,i).join('/');
            s = 'attention element ' + s + " n'est pas unique.";
            console.log(s);
            alert(s);
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

export function generateTEI(teiData) {
    // get XML ready surtout si nouveau texte
    if (teiData.doc === null) {
        teiData.doc = new dom().parseFromString(basicTEI, 'text/xml');
    } 
    let s = '';
    for (let i in teiData.dataTei) {
        for (let k=0; k < teiData.dataTei[i].ec.length; k++) {
            teiData.dataTei[i].ec[k].validated = edit.values[teiData.dataTei[i].ec[k].validatedID];
            s += '<element path="' + teiData.dataTei[i].absolutepath + '" name="' 
                + teiData.dataTei[i].ident + '" validated="' + teiData.dataTei[i].validated + '">\n';
            if (!teiData.dataTei[i].ec[k].validated) {
                s += '</element>\n';
                continue;
            }
            let current;
            if (teiData.dataTei[i].ec[k].node) {
                current = teiData.dataTei[i].ec[k].node;
            } else {
                current = createAbsolutePath(teiData.dataTei[i].absolutepath, teiData.doc);
                teiData.dataTei[i].ec[k].node = current;
            }
            if (teiData.dataTei[i].ec[k].content) {
                // si on edite quelque chose au niveau de l'élémentSpec il faut le mettre ici
                s += generateTEIContent(teiData.dataTei[i].ec[k].content, teiData.doc, current);
            }
            s += '</element>\n';
        }
    }
    console.log(teiData.dataTei);
    console.log(s);
    // transform doc to text
    console.log(teiData.doc.toString());
    return teiData.doc.toString();
}

function generateOneContent(eci, doc, current) {
    let s = '';
    // find or create element from XML file
    let nodes = getChildrenByName(current, eci.element.name);
    if (nodes.length > 0) {
        if (nodes.length > 1) {
            alert("Trop d'élements pour un One. Il faudrait supprimer les éléments en trop.");
        }
        s += generateElement(eci, doc, nodes[0]);
    } else {
        // console.log("create new node", eci.element.name); // va générer le node si nécessaire
        let newnode = doc.createElement(eci.element.name);
        current.appendChild(newnode);
        s += generateElement(eci, doc, newnode);
    }
    return s;
}

function generateXOrMoreContent(ec, doc, current, type) {
    let s = '';
    // find or create element from XML file
    let nodes = getChildrenByName(current, ec[0].element.name);
    // maintenant il faut d'abord utiliser tous les nodes pour les premiers ec
    // et s'il n'y a pas la place rajouter des nodes
    let iEC = 0; // pointeur sur l'élément dans ec
    for ( ; iEC < nodes.length && iEC < ec.length ; iEC++) {
        s += generateElement(ec[iEC], doc, nodes[iEC]);
    }
    for ( ; iEC < ec.length ; iEC++) {
        // si on passe ici c'est qu'on a fini les nodes sans avoir fini les ec
        let newnode = doc.createElement(ec[iEC].element.name);
        current.appendChild(newnode);
        s += generateElement(ec[iEC], doc, newnode);
    }
    return s;
}

function generateTEIContent(ct, doc, current) {
    let s = '';
    for (let i=0; i < ct.one.length; i++) {
        s += generateOneContent(ct.one[i].eCI[0], doc, current);
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        s += generateXOrMoreContent(ct.oneOrMore[i].eCI, doc, current, true);
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        s += generateXOrMoreContent(ct.zeroOrMore[i].eCI, doc, current, false);
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
    // console.log("geneElemts:",eci);
    if (edit.values[eci.validatedID] === true) {
        eci.element.textContent = edit.values[eci.element.textContentID];
        if (doc !== null)
            setTextNode(node, eci.element.textContent, doc);
        else
            node.textContent = eci.element.textContent;
        s += '<' + eci.element.name + '>' + eci.element.textContent + '</' + eci.element.name + '>\n';
        if (eci.element.content) {
            s += generateTEIContent(eci.element.content, doc, node);
        }
    }
    return s;
}
