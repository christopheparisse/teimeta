/**
 * @module odd.ts
 * @author: Christophe Parisse
 * lecture du fichier odd et récupération de toutes
 * les informatons qui permettront l'édition de la tei
 * @exports loadOdd
 * @exports Element ElementCount ElementCountItem ElementSpec Content Attr Val ValItem
 */

import * as system from '../ui/opensave';
import * as schema from './schema';

export let odd : schema.SCHEMA = new schema.SCHEMA();

let dom = require('xmldom').DOMParser;
let xpath = require('xpath');
let select;
// import * as system from '../system/opensave';

function tagES(k, c) {
    return (c) ? k + '/' + c : k;    
}

/**
 * @method getChildrenByName
 * get list of immediate children nodes with a given tagname
 * @param node
 * @param name 
 * @returns [list of nodes]
 */
export function getChildrenByName(node, name) {
    let children = [];
    for (let child in node.childNodes) {
        if (node.childNodes[child].nodeType === 1) {
            if (node.childNodes[child].tagName === name) children.push(node.childNodes[child]);
        }
    }
    return children;
}

function readElementSpec(elementspec, node) {
    // console.log(nodes);
    // find all about elementSpec

    // récupérer tous les attributs potentiels
    elementspec.ident = node.getAttribute("ident");
    elementspec.corresp = node.getAttribute("corresp");
    elementspec.module = node.getAttribute("module");
    elementspec.mode = node.getAttribute("mode");
    // les autres attributs sont ignorés
    elementspec.access = tagES(elementspec.ident, elementspec.corresp);

    // le champ desc
    let d =  new schema.Desc();
    if (readDesc(d, node)) elementspec.desc = d;

    // le champ content
    let c =  new schema.Content();
    if (readContent(c, node)) elementspec.content = c;

    // le champ attr
    let a = getChildrenByName(node, 'attList');
    if (a.length > 0) {
        let ad = getChildrenByName(a[0], 'attDef');
        for (let i in ad) {
            let adv = new schema.AttrDef();
            readAttrDef(adv, ad[i]);
            valList(adv, ad[i]);
            elementspec.attr.push(adv);
        }
    }
}

function getDataRef(node) : string {
    let d = getChildrenByName(node, 'dataRef');
    if (d.length < 1) return '';
    let n = d[0].getAttribute('name');
    if (!n) return '';
    switch(n) {
        case 'string':
            return 'string';
        case 'decimal':
            return 'decimal';
        case 'NCName':
            return 'NCName';
        case 'integer':
            return 'integer';
        case 'anyURI':
            return 'anyURI';
        case 'duration':
            return 'duration';
        default:
            console.log('unknow type for dataRef:', n, 'in', node.tagName);
            return 'string';
    }
}

function readContent(content, node) {
    let d = getChildrenByName(node, 'content');
    if (d.length > 1) {
        // standard syntax is not more than one content ?
        console.log('more than one content in node: only first is processed', node.tagName);
    }
    if (d.length > 0) {
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
        content.datatype = getDataRef(d[0]); // si rien alors datatype === ''
        // find textNode
        let t = getChildrenByName(d[0], 'textNode');
        if (t.length > 0) {
            if (content.datatype === '') {
                content.datatype = 'string'; // type par defaut
            }
            // sinon on respecte le type de dataRef
        }
        // find if there are values predefined
        let vl = new schema.AttrDef();
        let n = valList(vl, d[0]);
        if (n > 0) {
            content.vallist = vl;
            // mettre une valeur par défaut s'il y en a une
            content.datatype = 'list';
        }
    }
    return d.length;
}

function getMinMax(elementCount, node) {
    let a = node.getAttribute('minOccurs');
    if (a) elementCount.minOccurs = a;
    a = node.getAttribute('maxOccurs');
    if (a) elementCount.maxOccurs = a;
}

function getElementRef(elementCount, node) {
    getMinMax(elementCount, node);
    elementCount.model = tagElementSpec(node);
    elementCount.ident = keyElementSpec(node);
    elementCount.type = 'elementRef';
    if (odd.listElementRef[elementCount.model] === undefined)
        odd.listElementRef[elementCount.model] = 1;
    else
        odd.listElementRef[elementCount.model]++;
}

function getSequence(elementCount, node) {
    getMinMax(elementCount, node);
    elementCount.type = 'sequence';
    let s = getChildrenByName(node, 'elementRef');
    elementCount.model = [];
    elementCount.ident = [];
    for (let i in s) {
        let t = keyElementSpec(s[i]);
        elementCount.ident.push(t);
        t = tagElementSpec(s[i]);
        elementCount.model.push(t);
        if (odd.listElementRef[t] === undefined)
            odd.listElementRef[t] = 1;
        else
            odd.listElementRef[t]++;
    }
}

function tagElementSpec(node) {
    let k = node.getAttribute('key');
    let c = node.getAttribute('corresp');
    return tagES(k, c);
}

function keyElementSpec(node) {
    return node.getAttribute('key');
}

export function textDesc(desc, lg) {
    if (lg === undefined) return desc.texts.length > 0 ? desc.texts[0] : '';
    for (let i=0; i<desc.langs.length; i++) {
        if (lg === desc.langs[i]) return desc.texts[i];
    }
    return desc.texts.length > 0 ? desc.texts[0] : '';
}

function rendition(desc, lg) {
    if (lg === undefined) return desc.rendition.length > 0 ? desc.rendition[0] : '';
    for (let i=0; i<desc.langs.length; i++) {
        if (lg === desc.langs[i]) return desc.rendition[i];
    }
    return desc.rendition.length > 0 ? desc.rendition[0] : '';
}

function readDesc(desc, node) {
    let d = getChildrenByName(node, 'desc');
    for (let i in d) {
        desc.texts.push(d[i].textContent);
        desc.langs.push(d[i].getAttribute('xml:lang'));
        desc.renditions.push(d[i].getAttribute('rendition'));
    }
    return d.length;
}

function readAttrDef(attrDef, node) {
    attrDef.ident = node.getAttribute('ident');
    attrDef.usage = node.getAttribute('usage');
    attrDef.mode = node.getAttribute('mode');
    attrDef.rend = node.getAttribute('rend');

    // le champ desc
    let d =  new schema.Desc();
    if (readDesc(d, node)) attrDef.desc = d;

    // le champ datatype
    let a = getChildrenByName(node, 'datatype');
    if (a.length > 0) {
        attrDef.editing = getDataRef(a[0]);
    }
}

/**
 * @method valList
 * fonction de traitement des listes de valeurs pour les attributs
 * @param Attr structure 
 * @param node 
 */
function valList(attrDef, node) {
    let valList = node.getElementsByTagName("valList");
    if (valList.length > 0) {
        // find all about element
        let valItem = node.getElementsByTagName("valItem");
        for (let k=0; k < valItem.length; k++) {
            let vi = new schema.ValItem();
            let attr = valItem[k].getAttribute("ident");
            if (attr) vi.ident = attr;
            let desc = valItem[k].getElementsByTagName("desc");
            if (desc.length>0) vi.desc = desc[0].textContent;
            if (!vi.desc) vi.desc = vi.ident;
            attrDef.items.push(vi);
        }
        attrDef.editing = 'list';
    }
    return valList.length;
}

/**
 * @method loadOdd
 * parse tous les elementSpec du odd et appele sous-fonction pour les champs Content
 * @param data : contenu d'un fichier xml
 * @returns structure teiOdd (modèle de données du ODD)
 */
export function loadOdd(data) {
    let error = '';
    let warning = '';
    // get XML ready
    let parser = new DOMParser();
    // let doc = parser.parseFromString(data, "text/xml");
    let doc = new dom().parseFromString(data.toString(), 'text/xml');
    let ns = doc.documentElement.namespaceURI;
    select = xpath.useNamespaces({"tei": ns});
    let schemaSpec = select("//tei:schemaSpec", doc);
    if (schemaSpec.length < 1) {
        let s = "Pas d'élément schemaSpec dans le fichier ODD";
        system.alertUser(s);
        return null;
    }
    // récupérer attribut start
    let attr = schemaSpec[0].getAttribute("start");
    // valeur retour de la fonction
    if (attr) {
        odd.init();
        odd.rootTEI = attr;
    } else {
        let s = "Pas d'attribut racine (@start) dans le fichier ODD";
        system.alertUser(s);
        return null;
    }
    // récupérer attribut ident
    odd.rootIdent = schemaSpec[0].getAttribute("ident");
    let eSpec = getChildrenByName(schemaSpec[0], 'elementSpec');
    // lire les elementSpec
    for (let i=0; i < eSpec.length ; i++) {
        var es = new schema.ElementSpec();
        readElementSpec(es, eSpec[i]);
        if (odd.listElementSpec[es.access]) {
            error += 'ERREUR: redefinition de ' + es.access + "\n";
        }
        odd.listElementSpec[es.access] = es;
    }
    for (let i in odd.listElementRef) {
        // check if all elementRef exist as elementSpec
        if (!odd.listElementSpec[i]) {
            error += 'ERREUR: elementRef ' + i + " n'est pas défini\n";
        }
    }
    for (let i in odd.listElementSpec) {
        // check if all elementRef exist as elementSpec
        if (odd.listElementSpec[i].access !== odd.rootTEI && !odd.listElementRef[odd.listElementSpec[i].access]) {
            warning += 'ATTENTION: elementSpec ' + odd.listElementSpec[i].access + " n'est pas utilisé<br/>\n";
        }
    }
    let rootElt = odd.listElementSpec[odd.rootTEI];
    if (!rootElt) {
        error += "Pas de définition pour l'élément racine " + odd.rootTEI + "\n";
    } else {
        rootElt.usage = 'req';
    }
    console.log(odd);
    if (error) {
        system.alertUser(error);
        return null;
    }
    if (warning) {
        system.alertUser(warning);
        console.log(warning);
    }
    return odd;
}

