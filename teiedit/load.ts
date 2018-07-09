/**
 * @module load.ts
 * @author Christophe Parisse
 * load the XML file and the initial value according to the ODD
 * if the XML file is empty, all initial values are zero or null or blank
 * the result structure teiData is ready to be processed
 */

import * as edit from './edit';
import * as odd from './odd';
import * as schema from './schema';
import * as alert from '../ui/alert';
import * as msg from '../ui/messages';

let entities = require("entities");
let dom = require('xmldom').DOMParser;

export let ptrListElementSpec = null; // closure variable

/*
 * CHARGEMENT DU FICHIER TEI
 */

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
            txt += entities.decodeXML(node.childNodes[child].textContent);
        } else if (node.childNodes[child].nodeType === 1 && node.childNodes[child].tagName === 'seg') {
            txt += entities.decodeXML(node.childNodes[child].textContent);
        }
    }
    return txt;
}

/**
 * @method load
 * @param {*} data raw data content of TEI file 
 * @param {*} dataOdd array of ElementSpec from odd.ts - loadOdd
 * @returns {*} true if ok
 */
export function checkOddTei(data, teiData) {
    if (!teiData.dataOdd) return ''; // no odd already loaded
    // get XML ready
    teiData.parser = new DOMParser();
    teiData.doc = data 
        ? new dom().parseFromString(data.toString(), 'text/xml')
        : null;

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
 * @method load
 * @param {*} data raw data content of TEI file 
 * @param {*} dataOdd array of ElementSpec from odd.ts - loadOdd
 * @returns {*} true if ok
 */
export function loadTei(data, teiData, noreload=false) {
    // get XML ready
    if (!noreload) teiData.parser = new DOMParser();
    if (!noreload) teiData.doc = data 
        ? new dom().parseFromString(data.toString(), 'text/xml')
        : null;

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
    if (root) {
//        let attr = root.getAttribute("xml:base");
        // create first elementSpec and find and create the other recursively
        teiData.dataTei = loadElementSpec(h, root, path, '1', '1', null);
        // h = descripteur elementSpec
        // root = suite de noeuds
        // '' = chemin initial
        // 1 = nombre minimal de root autorisés
        // 1 = nombre maximal de root autorisés
    } else {
        // create first elementSpec and find and create the other recursively
        teiData.dataTei = loadElementSpec(h, null, path, '1', '1', null);
        // h = descripteur elementSpec
        // root = suite de noeuds
        // '' = chemin initial
        // 1 = nombre minimal de root autorisés
        // 1 = nombre maximal de root autorisés
    }
    return true;
}

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
            // this item wa created by the user.
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

export function loadElementSpec(es, node, path, minOcc, maxOcc, parent) {
    let c = schema.copyElementSpec(es);
    // creation d'un élément initial vide pour le noeud courant
    c.node = node;
    c.parentElementSpec = parent;
    if (maxOcc === '2') {
        if (minOcc === '1')
            c.usage = 'req';
        else            
            c.usage = 'opt'; // cas 0 à 2
    } else if (maxOcc === 'unbounded') {
        if (minOcc === '1')
            c.usage = 'req';
        else            
            c.usage = 'opt'; // cas 0 à unbounded
    } else {
        if (minOcc === '1')
            c.usage = 'req'; // cas 1 à 1
        else
            c.usage = 'opt'; // cas 0 à 1
    }
    c.validatedES = '';
    // chercher tous les elements existant dans le DOM
    // sous cet élément
    c.absolutepath = path;
    let nbElt = 0;
    if (node) {
        c.validatedES = 'ok'; // l'élément existait donc il est validé par l'utilisateur
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
                    // pas d'édition de l'attribut
                    // mais valeur prédéfinie
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
        if (!c.content) return c;
        for (let ec of c.content.sequencesRefs) {
            // ec au format ElementCount
            if (ec.type === 'elementRef') {
                loadElementRef(ec, node, c.absolutepath, c);
            } else {
                loadSequence(ec, node, c.absolutepath, c);
            }
        }
    } else {
        // construire un élément vide non validé
        // soit parce que le DOM est vide, soit parce que on n'a pas trouvé d'élément dans le DOM
        // content et attr sont initialisés
        // descendre dans l'arbre
        /* ICI on applique un paramètre de l'application
         * les éléments non renseignés sont inclus pas défaut ou non
         */
        if (!c.content) return c;
        c.validatedES = odd.odd.params.defaultNewElement ? 'ok' : ''; // l'élément n'existait pas et il n'est pas validé par l'utilisateur
        for (let ec of c.content.sequencesRefs) {
            // ec au format ElementCount
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

function loadElementRef(ec, node, path, parent) {
    // ec est un ElementCount
    // préparer le premier élément ElementCountItem
    let eci = new schema.ElementCountItem();
    eci.parentElementSpec = parent;
    // ec.model contient le nom de l'elementSpec
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
    // remplir le premier s'il y en a un
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
        // préparer les nouveaux éléments
        // ec est un ElementCount
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

function loadSequence(ec, node, path, parent) {
    // load from TEI
    let nnodes = []; // tableau de tableau de nodes
    // pour tous les modèles de la séquence on cherche les noeuds correspondants
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
    
    // initialiser le tableau des descendants
    ec.eCI = [];
   // remplir un node s'il n'y en a aucun
    if (!node || maxlg === 0) {
        // préparer la première séquence
        // ec est un ElementCount
        let eci = new schema.ElementCountItem();
        eci.parentElementSpec = parent;
        eci.type = 'sequence';
        ec.eCI.push(eci);
        eci.element = [];
        eci.model = [];
        // ec.model contient un tableau de noms d'elementSpec
        // find and create first sequence of elementSpec
        for (let k=0; k < ec.model.length ; k++) {
            let h = ptrListElementSpec[ec.model[k]];
            eci.model.push(ec.model[k]);
            eci.element.push(loadElementSpec(h, null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs, parent));
        }
        if (ec.minOccurs === '2') {
            // cas particulier des noeuds avec 2 éléments obligatoires
            // préparer la deuxième séquence
            // ec est un ElementCount
            let eci = new schema.ElementCountItem();
            eci.type = 'sequence';
            ec.eCI.push(eci);
            eci.element = [];
            eci.model = [];
            // ec.model contient un tableau de noms d'elementSpec
            // find and create first sequence of elementSpec
            for (let k=0; k < ec.model.length ; k++) {
                let h = ptrListElementSpec[ec.model[k]];
                eci.model.push(ec.model[k]);
                eci.element.push(loadElementSpec(h, null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs, parent));
            }
        }
        return;
    }

    // générer un ensemble de eci dans ec.eCI
    for (let i=0; i < maxlg ; i++) {            
        let eci = new schema.ElementCountItem();
        eci.parentElementSpec = parent;
        eci.type = 'sequence';
        eci.element = [];
        eci.model = [];
        ec.eCI.push(eci);
    }
    
    // remplir les eci avec les nodes
    for (let i = 0; i < maxlg ; i++) {
        // préparer les nouveaux éléments
        // ec est un ElementCount
        for (let k=0; k < nnodes.length ; k++) {            
            // find and create first elementSpec
            let h = ptrListElementSpec[ec.model[k]];
            ec.eCI[i].model.push(ec.model[k]);
            ec.eCI[i].element.push(loadElementSpec(h, nnodes[k].length > i ? nnodes[k][i] : null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs, parent));
        }
    }
}
