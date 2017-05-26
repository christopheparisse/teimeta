"use strict";
/**
 * @module odd.ts
 * @author: Christophe Parisse
 * lecture du fichier odd et récupération de toutes
 * les informatons qui permettront l'édition de la tei
 * @exports loadOdd
 * @exports Element ElementCount ElementCountItem ElementSpec Content Attr Val ValItem
 */
Object.defineProperty(exports, "__esModule", { value: true });
var system = require("../ui/opensave");
var schema = require("./schema");
exports.odd = new schema.SCHEMA();
var dom = require('xmldom').DOMParser;
var xpath = require('xpath');
var select;
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
function getChildrenByName(node, name) {
    var children = [];
    for (var child in node.childNodes) {
        if (node.childNodes[child].nodeType === 1) {
            if (node.childNodes[child].tagName === name)
                children.push(node.childNodes[child]);
        }
    }
    return children;
}
exports.getChildrenByName = getChildrenByName;
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
    var d = new schema.Desc();
    if (readDesc(d, node))
        elementspec.desc = d;
    // le champ content
    var c = new schema.Content();
    if (readContent(c, node))
        elementspec.content = c;
    // le champ attr
    var a = getChildrenByName(node, 'attList');
    if (a.length > 0) {
        var ad = getChildrenByName(a[0], 'attDef');
        for (var i in ad) {
            var adv = new schema.AttrDef();
            readAttrDef(adv, ad[i]);
            var n = valList(adv, ad[i]);
            if (n > 0) {
                // mettre une valeur par défaut s'il y en a une
                if (adv.datatype !== 'openlist')
                    adv.datatype = 'list';
            }
            elementspec.attr.push(adv);
        }
    }
}
function getDataRef(node) {
    var d = getChildrenByName(node, 'dataRef');
    if (d.length < 1)
        return '';
    var n = d[0].getAttribute('name');
    if (!n)
        return '';
    switch (n) {
        case 'string':
            return 'string';
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
        default:
            console.log('unknow type for dataRef:', n, 'in', node.tagName);
            return 'string';
    }
}
function readContent(content, node) {
    var d = getChildrenByName(node, 'content');
    if (d.length > 1) {
        // standard syntax is not more than one content ?
        console.log('more than one content in node: only first is processed', node.tagName);
    }
    if (d.length > 0) {
        // find elementRef
        var e = getChildrenByName(d[0], 'elementRef');
        for (var ei in e) {
            var ec = new schema.ElementCount();
            getElementRef(ec, e[ei]);
            content.sequencesRefs.push(ec);
        }
        // find sequence
        e = getChildrenByName(d[0], 'sequence');
        for (var ei in e) {
            var ec = new schema.ElementCount();
            getSequence(ec, e[ei]);
            content.sequencesRefs.push(ec);
        }
        // find dataRef
        content.datatype = getDataRef(d[0]); // si rien alors datatype === ''
        // find textNode
        var t = getChildrenByName(d[0], 'textNode');
        if (t.length > 0) {
            if (content.datatype === '') {
                content.datatype = 'string'; // type par defaut
            }
            // sinon on respecte le type de dataRef
        }
        // find if there are values predefined
        var vl = new schema.AttrDef();
        var n = valList(vl, d[0]);
        if (n > 0) {
            content.vallist = vl;
            // mettre une valeur par défaut s'il y en a une
            if (content.datatype !== 'openlist')
                content.datatype = 'list';
        }
    }
    return d.length;
}
function getMinMax(elementCount, node) {
    var a = node.getAttribute('minOccurs');
    if (a)
        elementCount.minOccurs = a;
    a = node.getAttribute('maxOccurs');
    if (a)
        elementCount.maxOccurs = a;
}
function getElementRef(elementCount, node) {
    getMinMax(elementCount, node);
    elementCount.model = tagElementSpec(node);
    elementCount.ident = keyElementSpec(node);
    elementCount.type = 'elementRef';
    if (exports.odd.listElementRef[elementCount.model] === undefined)
        exports.odd.listElementRef[elementCount.model] = 1;
    else
        exports.odd.listElementRef[elementCount.model]++;
}
function getSequence(elementCount, node) {
    getMinMax(elementCount, node);
    elementCount.type = 'sequence';
    var s = getChildrenByName(node, 'elementRef');
    elementCount.model = [];
    elementCount.ident = [];
    for (var i in s) {
        var t = keyElementSpec(s[i]);
        elementCount.ident.push(t);
        t = tagElementSpec(s[i]);
        elementCount.model.push(t);
        if (exports.odd.listElementRef[t] === undefined)
            exports.odd.listElementRef[t] = 1;
        else
            exports.odd.listElementRef[t]++;
    }
}
function tagElementSpec(node) {
    var k = node.getAttribute('key');
    var c = node.getAttribute('corresp');
    return tagES(k, c);
}
function keyElementSpec(node) {
    return node.getAttribute('key');
}
function textDesc(desc, lg) {
    if (lg === undefined)
        return desc.texts.length > 0 ? desc.texts[0] : '';
    for (var i = 0; i < desc.langs.length; i++) {
        if (lg === desc.langs[i])
            return desc.texts[i];
    }
    return desc.texts.length > 0 ? desc.texts[0] : '';
}
exports.textDesc = textDesc;
function rendition(desc, lg) {
    if (lg === undefined)
        return desc.rendition.length > 0 ? desc.rendition[0] : '';
    for (var i = 0; i < desc.langs.length; i++) {
        if (lg === desc.langs[i])
            return desc.rendition[i];
    }
    return desc.rendition.length > 0 ? desc.rendition[0] : '';
}
function readDesc(desc, node) {
    var d = getChildrenByName(node, 'desc');
    for (var i in d) {
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
    var d = new schema.Desc();
    if (readDesc(d, node))
        attrDef.desc = d;
    // le champ datatype
    var a = getChildrenByName(node, 'datatype');
    if (a.length > 0) {
        attrDef.datatype = getDataRef(a[0]);
    }
}
/**
 * @method valList
 * fonction de traitement des listes de valeurs pour les attributs
 * @param Attr structure
 * @param node
 */
function valList(attrDef, node) {
    var valList = node.getElementsByTagName("valList");
    if (valList.length > 0) {
        // find all about element
        var valItem = node.getElementsByTagName("valItem");
        for (var k = 0; k < valItem.length; k++) {
            var vi = new schema.ValItem();
            var attr = valItem[k].getAttribute("ident");
            if (attr)
                vi.ident = attr;
            var desc = valItem[k].getElementsByTagName("desc");
            if (desc.length > 0)
                vi.desc = desc[0].textContent;
            if (!vi.desc)
                vi.desc = vi.ident;
            attrDef.items.push(vi);
        }
    }
    return valList.length;
}
/**
 * @method loadOdd
 * parse tous les elementSpec du odd et appele sous-fonction pour les champs Content
 * @param data : contenu d'un fichier xml
 * @returns structure teiOdd (modèle de données du ODD)
 */
function loadOdd(data) {
    var error = '';
    var warning = '';
    // get XML ready
    var parser = new DOMParser();
    // let doc = parser.parseFromString(data, "text/xml");
    var doc = new dom().parseFromString(data.toString(), 'text/xml');
    var ns = doc.documentElement.namespaceURI;
    select = xpath.useNamespaces({ "tei": ns });
    var schemaSpec = select("//tei:schemaSpec", doc);
    if (schemaSpec.length < 1) {
        var s = "Pas d'élément schemaSpec dans le fichier ODD";
        system.alertUser(s);
        return null;
    }
    // récupérer attribut start
    var attr = schemaSpec[0].getAttribute("start");
    // valeur retour de la fonction
    if (attr) {
        exports.odd.init();
        exports.odd.rootTEI = attr;
    }
    else {
        var s = "Pas d'attribut racine (@start) dans le fichier ODD";
        system.alertUser(s);
        return null;
    }
    // récupérer attribut ident
    exports.odd.rootIdent = schemaSpec[0].getAttribute("ident");
    var eSpec = getChildrenByName(schemaSpec[0], 'elementSpec');
    // récupérer attribut namespace
    exports.odd.namespace = schemaSpec[0].getAttribute("ns");
    // récupérer attribut other entries (corresp)
    attr = schemaSpec[0].getAttribute("corresp");
    if (attr) {
        var n = attr.split(' ');
        if (n > 1)
            exports.odd.entries = n;
    }
    // lire les elementSpec
    for (var i = 0; i < eSpec.length; i++) {
        var es = new schema.ElementSpec();
        readElementSpec(es, eSpec[i]);
        if (exports.odd.listElementSpec[es.access]) {
            error += 'ERREUR: redefinition de ' + es.access + "\n";
        }
        exports.odd.listElementSpec[es.access] = es;
    }
    for (var i in exports.odd.listElementRef) {
        // check if all elementRef exist as elementSpec
        if (!exports.odd.listElementSpec[i]) {
            error += 'ERREUR: elementRef ' + i + " n'est pas défini\n";
        }
    }
    for (var i in exports.odd.listElementSpec) {
        // check if all elementRef exist as elementSpec
        if (exports.odd.listElementSpec[i].access !== exports.odd.rootTEI && !exports.odd.listElementRef[exports.odd.listElementSpec[i].access]) {
            warning += 'ATTENTION: elementSpec ' + exports.odd.listElementSpec[i].access + " n'est pas utilisé<br/>\n";
        }
    }
    var rootElt = exports.odd.listElementSpec[exports.odd.rootTEI];
    if (!rootElt) {
        error += "Pas de définition pour l'élément racine " + exports.odd.rootTEI + "\n";
    }
    else {
        rootElt.usage = 'req';
    }
    console.log(exports.odd);
    if (error) {
        system.alertUser(error);
        return null;
    }
    if (warning) {
        system.alertUser(warning);
        console.log(warning);
    }
    return exports.odd;
}
exports.loadOdd = loadOdd;
