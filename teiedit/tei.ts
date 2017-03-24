/**
 * @module tei.ts
 * @author Christophe Parisse
 * lecture d'un fichier xml et chargement des valeurs initiales
 * si le fichier est vide (null) les valeurs initiales sont toutes mises à zéro
 * la structrue résultat teiData est prête à être traitée
 */

import * as edit from './edit';
import * as odd from './odd';
import * as system from '../system/opensave';

let entities = require("entities");
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

/*
 * CHARGEMENT DU FICHIER TEI
 */

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
        // copie pour mettre dans le tableau dataTei
        let es = odd.copyESOdd(teiData.dataOdd[i]);
        // load from TEI
        let path = es.absolutepath.replace(/\//g,"/tei:"); // add namespace
        path = path.replace(/\/tei:\/tei:/,"//tei:"); // si il y a un // dans le chemin
        //console.log(path);
        let nodes;
        try {
            nodes = teiData.doc ? select(path, teiData.doc) : [];
        } catch(err) {
            console.log('caught at load: ', err);
            continue;
        }
        // les nodes sont chargés et données sont prêtes à être traitées.
        // on remplit dataTei
        teiData.dataTei.push(es);
        // et maintemant on charge les données autant de fois que nécessaire
        // les valeurs du contenu des ElementSpec (tableau de valeurs)
        // permettant de gérer un nombre quelconque d'éléments 
        // si autorisé est initialisé
        if (nodes.length > 0) {
            // créer un tableau
            // faire autant de copies que nécessaire pour mettre dans le tableau
            for (let k=0; k < nodes.length; k++) {
                let esEC = odd.copyESOdd(es);
                esEC.validatedES = true;
                esEC.node = nodes[k];
                // fill it with textContent and attributes TODO
                fillElement(esEC.element, nodes[k]);
                es.ec.push(esEC); // ajout de l'élément à liste
                // il est prêt à être étudié et édité
                if (es.content) {
                    esEC.content = odd.copyContentOdd(es.content);
                    loadContent(nodes[k], esEC.content, es.absolutepath);
                }
            }
        } else {
            // nodes.length === 0
            let esEC = odd.copyESOdd(es);
            if (es.mode === 'replace' || es.mode === 'change')
                esEC.validatedES = true;
            esEC.node = null;
            es.ec.push(esEC); // ajout de l'élément à liste
            // il est prêt à être étudié et édité
            if (es.content) {
                esEC.content = odd.copyContentOdd(es.content);
                loadContent(null, esEC.content, es.absolutepath);
            }
        }
    }
    return true;
}

function loadContent(doc, ct, abspath) {
    for (let i=0; i < ct.one.length; i++) {
        let ec = new odd.ElementCount();
        ec.count = "one";
        ec.model = ct.one[i]; // copy ?
        ct.one[i] = ec;
        loadOne(doc, ec, abspath); // read element editing info
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        let ec = new odd.ElementCount();
        ec.count = "oneOrMore";
        ec.model = ct.oneOrMore[i]; // copy ?
        ct.oneOrMore[i] = ec;
        loadXOrMore(doc, ec, abspath, 1); // read element editing info
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        let ec = new odd.ElementCount();
        ec.count = "zeroOrMoreone";
        ec.model = ct.zeroOrMore[i]; // copy ?
        ct.zeroOrMore[i] = ec;
        loadXOrMore(doc, ec, abspath, 0); // read element editing info
    }
    for (let i=0; i < ct.twoOrMore.length; i++) {
        let ec = new odd.ElementCount();
        ec.count = "twoOrMore";
        ec.model = ct.twoOrMore[i]; // copy ?
        ct.twoOrMore[i] = ec;
        loadXOrMore(doc, ec, abspath, 2); // read element editing info
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
            txt += node.childNodes[child].textContent;
        } else if (node.childNodes[child].nodeType === 1 && node.childNodes[child].tagName === 'seg') {
            txt += node.childNodes[child].textContent;
        }
    }
    return txt;
}

function loadOne(node, ec, abspath) {
    // préparer l'élément unique
    // ec est un ElementCount
    let eci = new odd.ElementCountItem();
    eci.element = odd.copyElementOdd(ec.model);
    eci.validatedEC = true;
    ec.eCI.push(eci);

    let elt = eci.element;
    elt.absolutepath = abspath + '/' + elt.name;
    // load from TEI
    let nodes = node ? getChildrenByName(node, elt.name) : [];
    // utiliser count TODO
    if (nodes.length > 0) {
        fillElement(elt, nodes[0]);
        elt.textContent = getNodeText(nodes[0]).trim();
    }
    if (elt.content) {
        loadContent(nodes.length > 0 ? nodes[0] : null, elt.content, elt.absolutepath);
    }
}

function loadXOrMore(node, ec, abspath, count) {
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
            eci.element = odd.copyElementOdd(ec.model);
            eci.validatedEC = true;
            ec.eCI.push(eci);
            // remplir avec le contenu
            fillElement(eci.element, nodes[i]);
            if (eci.element.content) {
                loadContent(nodes[i], eci.element.content, ec.model.absolutepath);
            }
        }
    }
    let rest;
    if (count === 0 && nodes.length < 1)
        rest = 1;
    else if (count === 1 && nodes.length < 1)
        rest = 1;
    else if (count === 2 && nodes.length < 1)
        rest = 2;
    else if (count === 2 && nodes.length === 1)
        rest = 1;
    else
        rest = 0;
    for (let i=0; i < rest; i++) {
        // il faut construire un ou des élément vides
        // préparer l'élément unique
        // ec est un ElementCount
        let eci = new odd.ElementCountItem();
        eci.element = odd.copyElementOdd(ec.model);
        eci.validatedEC = (count === 0) ? false : true; // si x == false on est dans zeroOrMore sinon true (oneOrMore ou twoOrmore)
        ec.eCI.push(eci);
        if (eci.element.content) {
            loadContent(null, eci.element.content, ec.model.absolutepath);
        }
    }
}

function fillElement(elt, node) {
    elt.textContent = getNodeText(node).trim();
    elt.node = node;
    // attributs
    for (let i = 0; i < elt.attr.length; i++) {
        if (elt.attr[i].ident) {
            let attr = node.getAttribute(elt.attr[i].ident);
            if (attr) elt.attr[i].value = attr;
        }
    }
}

/*
 * SAUVEGARDE DU FICHIER TEI
 */

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
 * @method createAbsolutePath
 * creates a path from top of xml file and returns last node created
 * @param path 
 * @param doc
 * @returns node 
 */
function createAbsolutePath(path, doc) {
    let p = path.split('/').slice(1);
    // le nom de l'élément racine est ignoré
    // on pourrait controler si le nom de l'élément correspond au nom donné dans l'ODD
    /*
    if (p[0] !== 'TEI') {
        let s = 'impossible de créer des chemins qui ne commencent pas par TEI';
        system.alertUser(s);
        return null;
    }
    */
    let node = doc.documentElement;
    for (let i = 1; i < p.length; i++) {
        let nds = getChildrenByName(node, p[i]);
        if (nds.length > 1) {
            let s = p.slice(0,i).join('/');
            s = 'attention element ' + s + " n'est pas unique.";
            console.log(s);
            system.alertUser(s);
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
            teiData.dataTei[i].ec[k].validatedES = edit.values[teiData.dataTei[i].ec[k].validatedESID];
            s += '<element path="' + teiData.dataTei[i].absolutepath + '" name="' 
                + teiData.dataTei[i].ident + '" validated="' + teiData.dataTei[i].ec[k].validatedES + '">\n';
            if (!teiData.dataTei[i].ec[k].validatedES) {
                s += '</element>\n';
                continue;
            }
            let current = teiData.dataTei[i].ec[k].node;
            if (!current) {
                current = createAbsolutePath(teiData.dataTei[i].absolutepath, teiData.doc);
                teiData.dataTei[i].ec[k].node = current;
            }
            s += generateFilledElement(teiData.dataTei[i].ec[k].element, teiData.doc, current);
            if (teiData.dataTei[i].ec[k].content) {
                // si on edite quelque chose au niveau de l'élémentSpec il faut le mettre ici
                s += generateTEIContent(teiData.dataTei[i].ec[k].content, teiData.doc, current);
            }
            s += '</element>\n';
        }
    }
    console.log(s);
    // transform doc to text
    console.log(teiData.doc);
    return teiData.doc.toString();
}

function generateOneContent(eci, doc, current) {
    let s = '';
    // find or create element from XML file
    /*
    let nodes = getChildrenByName(current, eci.element.name);
    if (nodes.length > 0) {
        if (nodes.length > 1) {
            system.alertUser("Trop d'élements pour un One. Il faudrait supprimer les éléments en trop.");
        }
        s += generateElement(eci, doc, nodes[0]);
    } else {
        // console.log("create new node", eci.element.name); // va générer le node si nécessaire
        let newnode = doc.createElement(eci.element.name);
        current.appendChild(newnode);
        s += generateElement(eci, doc, newnode);
    }
    */
    s += generateElement(eci, doc, current);
    return s;
}

function generateXOrMoreContent(ec, doc, current, count) {
    let s = '';
    // find or create element from XML file
    /*
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
    */
    // pointeur sur l'élément dans ec
    for ( let iEC = 0; iEC < ec.length ; iEC++) {
        s += generateElement(ec[iEC], doc, current);
    }
    return s;
}

function generateTEIContent(ct, doc, current) {
    let s = '';
    for (let i=0; i < ct.one.length; i++) {
        s += generateOneContent(ct.one[i].eCI[0], doc, current);
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        s += generateXOrMoreContent(ct.oneOrMore[i].eCI, doc, current, 1);
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        s += generateXOrMoreContent(ct.zeroOrMore[i].eCI, doc, current, 0);
    }
    for (let i=0; i < ct.twoOrMore.length; i++) {
        s += generateXOrMoreContent(ct.twoOrMore[i].eCI, doc, current, 2);
    }
    return s;
}

function generateElement(eci, doc, node) {
    let s = '';
    // console.log("geneElemts:",eci);
    if (edit.values[eci.validatedECID] === true) {
        // si node est vide en créer un en dernier fils du node d'au dessus
        let current = eci.element.node;
        if (!current) {
            current = doc.createElement(eci.element.name);
            node.appendChild(current);
            eci.element.node = current;
        }
        s += generateFilledElement(eci.element, doc, current);
        if (eci.element.content) {
            s += generateTEIContent(eci.element.content, doc, current);
        }
    }
    return s;
}

function generateFilledElement(elt, doc, node) {
    let s = '';
    if (elt.ana !== 'none') {
        elt.textContent = entities.encodeXML(edit.values[elt.textContentID]);
        setTextNode(node, elt.textContent, doc);
        s += '<' + elt.name + '>' + elt.textContent + '</' + elt.name + '>\n';
    }
    // attributs
    for (let i = 0; i < elt.attr.length; i++) {
        if (elt.attr[i].ident && elt.attr[i].ana !== 'none') {
            elt.attr[i].value = entities.encodeXML(edit.values[elt.attr[i].valueID]);
            node.setAttribute(elt.attr[i].ident, elt.attr[i].value);
        }
    }
    return s;
}
