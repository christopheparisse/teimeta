"use strict";
/**
 * @module load.ts
 * @author Christophe Parisse
 * lecture d'un fichier xml et chargement des valeurs initiales
 * si le fichier est vide (null) les valeurs initiales sont toutes mises à zéro
 * la structure résultat teiData est prête à être traitée
 */
Object.defineProperty(exports, "__esModule", { value: true });
var odd = require("./odd");
var schema = require("./schema");
var system = require("../ui/opensave");
var dom = require('xmldom').DOMParser;
exports.ptrListElementSpec = null; // closure variable
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
    for (var child in node.childNodes) {
        if (node.childNodes[child].nodeType === 3) {
            txt += node.childNodes[child].textContent;
        }
        else if (node.childNodes[child].nodeType === 1 && node.childNodes[child].tagName === 'seg') {
            txt += node.childNodes[child].textContent;
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
function loadTei(data, teiData) {
    // get XML ready
    teiData.parser = new DOMParser();
    teiData.doc = data
        ? new dom().parseFromString(data.toString(), 'text/xml')
        : null;
    // find root
    var root = null;
    var path = '/' + teiData.dataOdd.rootTEI; // root but must be unique !
    if (teiData.doc) {
        root = teiData.doc.documentElement;
        var nodes = odd.getChildrenByName(root, teiData.dataOdd.rootTEI);
        if (nodes.length > 1) {
            system.alertUser("Ficher invalide: Interdit d'avoir plus d'un élément racine");
            return false;
        }
        else if (nodes.length === 1) {
            root = nodes[0];
        }
    }
    teiData.root = root; // store for later external save
    // find first elementSpec
    exports.ptrListElementSpec = teiData.dataOdd.listElementSpec;
    var h = exports.ptrListElementSpec[teiData.dataOdd.rootTEI];
    if (!h) {
        system.alertUser("Ficher invalide: pas d'élément racine dans le ODD");
        return false;
    }
    if (root) {
        // create first elementSpec and find and create the other recursively
        teiData.dataTei = loadElementSpec(h, root, path, '1', '1');
        // h = descripteur elementSpec
        // root = suite de noeuds
        // '' = chemin initial
        // 1 = nombre minimal de root autorisés
        // 1 = nombre maximal de root autorisés
    }
    else {
        // create first elementSpec and find and create the other recursively
        teiData.dataTei = loadElementSpec(h, null, path, '1', '1');
        // h = descripteur elementSpec
        // root = suite de noeuds
        // '' = chemin initial
        // 1 = nombre minimal de root autorisés
        // 1 = nombre maximal de root autorisés
    }
    console.log(teiData.dataTei);
    return true;
}
exports.loadTei = loadTei;
function loadElementSpec(es, node, path, minOcc, maxOcc) {
    var c = schema.copyElementSpec(es);
    // creation d'un élément initial vide pour le noeud courant
    c.node = node;
    if (minOcc === '1')
        c.usage = 'req';
    else
        c.usage = 'opt';
    c.validatedES = '';
    // chercher tous les elements existant dans le DOM
    // sous cet élément
    c.absolutepath = path;
    var nbElt = 0;
    if (node) {
        c.validatedES = 'ok'; // l'élément existait donc il est validé par l'utilisateur
        // load content
        if (c.content && c.content.datatype) {
            // the text of the node is edited
            c.content.textContent = getNodeText(node).trim();
        }
        // load attributes
        for (var a in c.attr) {
            if (c.attr[a].ident) {
                if (c.attr[a].datatype === '') {
                    // pas d'édition de l'attribut
                    // mais valeur prédéfinie
                    if (c.attr[a].rend)
                        c.attr[a].value = c.attr[a].rend;
                }
                else {
                    var attr = node.getAttribute(c.attr[a].ident);
                    if (attr) {
                        c.attr[a].value = attr;
                    }
                    else {
                        if (c.attr[a].rend)
                            c.attr[a].value = c.attr[a].rend;
                    }
                }
            }
        }
        // load content
        if (!c.content)
            return c;
        for (var _i = 0, _a = c.content.sequencesRefs; _i < _a.length; _i++) {
            var ec = _a[_i];
            // ec au format ElementCount
            if (ec.type === 'elementRef') {
                loadElementRef(ec, node, c.absolutepath);
            }
            else {
                loadSequence(ec, node, c.absolutepath);
            }
        }
    }
    else {
        // construire un élément vide non validé
        // soit parce que le DOM est vide, soit parce que on n'a pas trouvé d'élément dans le DOM
        // content et attr sont initialisés
        // descendre dans l'arbre
        /* ICI on applique un paramètre de l'application
         * les éléments non renseignés sont inclus pas défaut ou non
         */
        if (!c.content)
            return c;
        c.validatedES = odd.odd.params.defaultNewElement ? 'ok' : ''; // l'élément n'existait pas et il n'est pas validé par l'utilisateur
        for (var _b = 0, _c = c.content.sequencesRefs; _b < _c.length; _b++) {
            var ec = _c[_b];
            // ec au format ElementCount
            // load content
            if (ec.type === 'elementRef') {
                loadElementRef(ec, null, c.absolutepath);
            }
            else {
                loadSequence(ec, null, c.absolutepath);
            }
        }
    }
    return c;
}
exports.loadElementSpec = loadElementSpec;
function loadElementRef(ec, node, path) {
    // ec est un ElementCount
    // préparer le premier élément ElementCountItem
    var eci = new schema.ElementCountItem();
    // ec.model contient le nom de l'elementSpec
    eci.type = 'elementRef';
    if (ec.minOccurs === '1')
        eci.validatedEC = true;
    ec.eCI.push(eci);
    // load from TEI
    var nodes = node ? odd.getChildrenByName(node, ec.ident) : [];
    path = path + '/' + ec.model;
    // si c'est vide
    if (nodes.length === 0) {
        // find and create one elementSpec
        var h = exports.ptrListElementSpec[ec.model];
        eci.model = ec.model;
        eci.element = loadElementSpec(h, null, path, ec.minOccurs, ec.maxOccurs);
        return;
    }
    // remplir le premier s'il y en a un
    if (nodes.length > 0) {
        // find and create first elementSpec
        var h = exports.ptrListElementSpec[ec.model];
        eci.model = ec.model;
        eci.element = loadElementSpec(h, nodes[0], path, ec.minOccurs, ec.maxOccurs);
    }
    for (var i = 1; i < nodes.length; i++) {
        if (ec.maxOccurs === '1') {
            system.alertUser("Attention: trop d'éléments pour " + path + '/' + ec.model);
        }
        // préparer les nouveaux éléments
        // ec est un ElementCount
        eci = new schema.ElementCountItem();
        eci.type = 'elementRef';
        if (ec.minOccurs === '2')
            eci.validatedEC = true;
        ec.eCI.push(eci);
        // find and create first elementSpec
        var h = exports.ptrListElementSpec[ec.model];
        eci.model = ec.model;
        eci.element = loadElementSpec(h, nodes[i], path, ec.minOccurs, ec.maxOccurs);
    }
}
function loadSequence(ec, node, path) {
    // load from TEI
    var nnodes = []; // tableau de tableau de nodes
    // pour tous les modèles de la séquence on cherche les noeuds correspondants
    if (node)
        for (var _i = 0, _a = ec.ident; _i < _a.length; _i++) {
            var er = _a[_i];
            nnodes.push(node ? odd.getChildrenByName(node, er) : []);
        }
    var maxlg = 0;
    for (var k = 0; k < nnodes.length; k++)
        if (maxlg < nnodes[k].length)
            maxlg = nnodes[k].length;
    /*
    if (nnodes.length > 1 && ec.maxOccurs === '1') {
        for (let k = 0; k < nnodes.length ; k++) {
            if (nnodes[k].length > 1) {
                system.alertUser("Attention: trop d'éléments pour " + ec.model[k] + " dans " + path + '/' + ec.model[k]);
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
        var eci = new schema.ElementCountItem();
        eci.type = 'sequence';
        if (ec.minOccurs === '1')
            eci.validatedEC = true; // ce node doit exister
        ec.eCI.push(eci);
        eci.element = [];
        eci.model = [];
        // ec.model contient un tableau de noms d'elementSpec
        // find and create first sequence of elementSpec
        for (var k = 0; k < ec.model.length; k++) {
            var h = exports.ptrListElementSpec[ec.model[k]];
            eci.model.push(ec.model[k]);
            eci.element.push(loadElementSpec(h, null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs));
        }
        if (ec.minOccurs === '2') {
            // cas particulier des noeuds avec 2 éléments obligatoires
            // préparer la deuxième séquence
            // ec est un ElementCount
            var eci_1 = new schema.ElementCountItem();
            eci_1.type = 'sequence';
            eci_1.validatedEC = true; // ce node doit exister
            ec.eCI.push(eci_1);
            eci_1.element = [];
            eci_1.model = [];
            // ec.model contient un tableau de noms d'elementSpec
            // find and create first sequence of elementSpec
            for (var k = 0; k < ec.model.length; k++) {
                var h = exports.ptrListElementSpec[ec.model[k]];
                eci_1.model.push(ec.model[k]);
                eci_1.element.push(loadElementSpec(h, null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs));
            }
        }
        return;
    }
    // générer un ensemble de eci dans ec.eCI
    for (var i = 0; i < maxlg; i++) {
        var eci = new schema.ElementCountItem();
        eci.type = 'sequence';
        eci.validatedEC = true; // comme les nodes existent ils sont tous considérés comme valides
        eci.element = [];
        eci.model = [];
        ec.eCI.push(eci);
    }
    // remplir les eci avec les nodes
    for (var i = 0; i < maxlg; i++) {
        // préparer les nouveaux éléments
        // ec est un ElementCount
        for (var k = 0; k < nnodes.length; k++) {
            // find and create first elementSpec
            var h = exports.ptrListElementSpec[ec.model[k]];
            ec.eCI[i].model.push(ec.model[k]);
            ec.eCI[i].element.push(loadElementSpec(h, nnodes[k].length > i ? nnodes[k][i] : null, path + '/' + ec.model[k], ec.minOccurs, ec.maxOccurs));
        }
    }
}
