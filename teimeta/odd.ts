/**
 * odd.ts
 * author: Christophe Parisse
 * lecture du fichier odd et préparation des commandes pour l'édition de la tei
 */

"use strict";

let dom = require('xmldom').DOMParser;
let xpath = require('xpath');
let select = xpath.useNamespaces({
        "tei": "http://www.tei-c.org/ns/1.0",
        "xml": "",
        "exm": "http://www.tei-c.org/ns/Examples",
        "s": "http://purl.oclc.org/dsdl/schematron"
    });

export class ElementSpec {
    // Informations de l'ODD
    ident = '';
    predeclare = '';
    desc = '';
    module = '';
    mode = ''; // change=oneOrMore, replace=one, add=zeroOrMore
    content = null;
    // Informations pour éditer la TEI
    absolutepath = '';
    validated = false; // is false element vide, sinon element valide
    validatedID = '';
    list = []; // si plusieurs elementSpec,
        // cela permet de les mettre dans un tableau
}

export class Content {
    // les tableaux contiennent des éléments étendus
    // un élément étendu est un objet qui permet de gérer
    // un nombre quelconque d'éléments dupliqués et validés ou non 
    one = [];
    zeroOrMore = [];
    oneOrMore = [];
}

export class ElementCount {
    count = ''; // oneOrMore, one, zeroOrMore, twoOrMore
    model = null;
    eCI = []; // element Count Items
}

export class ElementCountItem {
    validated = false; // is false element not used, si non element used
    validatedID = '';
    // obligatory = false; // true if element cannot be removed
    element = null;
}

export class Element {
    // Informations de l'ODD
    name = '';
    module = '';
    usage = '';
    mode = '';
    desc = '';
    attr = [];
    category = [];
    content = null;
    // Informations pour éditer la TEI
    absolutepath = '';
    textContent = ''; // ID pour le texte si nécessaire
    textContentID = ''; // value pour le texte si nécessaire
}

export class Attr {
    // Informations de l'ODD
    ident = '';
    value = '';
    val = null;
    usage = '';
    mode = '';
    desc = '';
    // Informations pour éditer la TEI
}

export class Val {
    // Informations de l'ODD
    ident = '';
    desc = '';
    type = '';
    mode = '';
    items = [];
}

export class ValItem {
    // Informations de l'ODD
    ident = '';
    desc = '';
}

function valList(node) {
    let v = new Val();
    let valList = node.getElementsByTagName("valList");
    if (valList.length) {
        // find all about element
        let attr = valList[0].getAttribute("type");
        if (attr.length) v.type = attr[0].textContent;
        attr = valList[0].getAttribute("mode");
        if (attr.length) v.mode = attr[0].textContent;
        let valItem = node.getElementsByTagName("valItem");
        for (let k=0; k < valItem.length; k++) {
            let vi = new ValItem();
            attr = valItem[k].getAttribute("ident");
            if (attr) vi.ident = attr;
            let desc = valItem[k].getElementsByTagName("desc");
            if (desc.length>0) vi.desc = desc[0].textContent;
            v.items.push(vi);
        }
    }
    return v;
}

function parseElement(doc) {
    // DOM method
    // initialize DOM
    let doc1 = new dom().parseFromString(doc, 'text/xml');
    let el = new Element();
    // find all about element
    let attr = select('/exm:element/@name', doc1); // .value;
    if (attr.length) el.name = attr[0].textContent;
    attr = select('/exm:element/@module', doc1); // .value;
    if (attr.length) el.module = attr[0].textContent;
    attr = select('/exm:element/@usage', doc1); // .value;
    if (attr.length) el.usage = attr[0].textContent;

    let attList = select('/exm:element/exm:attList', doc1);
    for (let k=0; k < attList.length; k++) {
        let attDef = attList[k].getElementsByTagName("attDef");
        for (let l=0; l < attDef.length; l++) {
            let a = new Attr();
            attr = attDef[l].getAttribute("ident");
            if (attr) a.ident = attr;
            attr = attDef[l].getAttribute("usage");
            if (attr) a.usage = attr;
            attr = attDef[l].getAttribute("value");
            if (attr) a.value = attr;
            attr = attDef[l].getAttribute("mode");
            if (attr) a.mode = attr;
            let desc = attDef[l].getElementsByTagName("desc");
            if (desc.length>0) a.desc = desc[0].textContent;
            a.val = valList(attDef[l]);
            el.attr.push(a);
        }
    }

    let category = select('/exm:element/exm:category', doc1);
    for (let k=0; k < category.length; k++) {
        let cat = category[k].getElementsByTagName("catDesc");
        let vi = new Val();
        for (let l=0; l < cat.length; l++) {
            attr = cat[l].getAttribute("xml:lang");
            if (attr && attr === 'fr') {
                vi.desc = cat[l].textContent;
            }
            if (!vi.desc) vi.desc = cat[l].textContent;
        }
        attr = category[k].getAttribute("xml:id");
        if (attr) vi.ident = attr;
        el.category.push(vi);
    }
 
    let desc = select('/exm:element/exm:desc', doc1);
    if (desc.length>0) el.desc = desc[0].textContent;

    let content = select('/exm:element/exm:content', doc1);
    if (content.length > 1) {
        console.log("content différent de 1 at ", el.name);
    }
    if (content.length > 0)
        el.content = parseContent(content[0].toString());
    return el;
}

function parseContent(doc) {
    // DOM method
    // initialize DOM
    let doc1 = new dom().parseFromString(doc, 'text/xml');
    let ei = new Content();
    // find all elements
    let content = select('/exm:content/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.one.push(parseElement(content[k].toString()));
    content = select('/exm:content/exm:one/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.one.push(parseElement(content[k].toString()));
    content = select('/exm:content/exm:oneOrMore/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.oneOrMore.push(parseElement(content[k].toString()));
    content = select('/exm:content/exm:zeroOrMore/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.zeroOrMore.push(parseElement(content[k].toString()));
    /*
    content = select('/exm:content/exm:twoOrMore/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.twoOrMore.push(parseElement(content[k].toString()));
    */
    return ei;
}

export function loadOdd(data) {
    // get XML ready
    let parser = new DOMParser();
    // let doc = parser.parseFromString(data, "text/xml");
    let doc = new dom().parseFromString(data.toString(), 'text/xml');
    let eSpec = [];
    let nodes = select("//exm:elementSpec", doc);
    for (let i=0; i < nodes.length ; i++) {
        // console.log(nodes[i]);
        let s = nodes[i].toString();
        let esElt = new ElementSpec();

        // DOM method
        // initialize DOM
        let doc1 = new dom().parseFromString(s, 'text/xml');
        // find all elementSpec
        let attr = select('/exm:elementSpec/@ident', doc1); // .value;
        if (attr.length) esElt.ident = attr[0].textContent;
        attr = select('/exm:elementSpec/@module', doc1); // .value;
        if (attr.length) esElt.module = attr[0].textContent;
        attr = select('/exm:elementSpec/@mode', doc1); // .value;
        if (attr.length) esElt.mode = attr[0].textContent;
        attr = select('/exm:elementSpec/@predeclare', doc1); // .value;
        if (attr.length) esElt.predeclare = attr[0].textContent;

        let desc = select('/exm:elementSpec/exm:desc', doc1);
        if (desc.length>0) esElt.desc = desc[0].textContent;

        let content = select('/exm:elementSpec/exm:content', doc1);
        if (content.length > 1) {
            console.log("content différent de 1 at ", esElt.ident);
        }
        if (content.length > 0)
            esElt.content = parseContent(content[0].toString());
//        if (content.length > 0)
        eSpec.push(esElt)
    }
    // console.log(eSpec);
    return eSpec;
}
