"use strict";
/**
 * @module edit.js
 * @author Christophe Parisse
 * création des structures HTML permettant l'édiion d'un ODD et d'un TEI
 * toutes les structures sous-jacentes (contenus à éditer)
 * ont été générés précédemment dans les fonctions odd.loadOdd et tei.load
 * les champs xxID qui permettent de récupérer les valeurs sont créés ici
 */
Object.defineProperty(exports, "__esModule", { value: true });
var odd = require("./odd");
var schema = require("./schema");
var load = require("./load");
var system = require("../ui/opensave");
exports.values = {};
var lastId = 0;
function createID() {
    var id = 'id' + lastId;
    lastId++;
    return id;
}
exports.createID = createID;
// variantes de forme des icones
// fa-circle-o fa-minus-circle fa-minus-square-o
// fa-circle fa-thumbs-o-up fa-check-square
// affichage de la validation ou non des elementSpec
// la validation ou non passe par un changement de forme
// la couleur dépend seulement du fait que c'est obligatoire ou optionnel 
// elle n'est pas modifiée dans cette fonction mais dans l'affichage initial
// les classes fa-choice-validated et fa-choice-not-validated sont des pseudo-classes pour connaitre l'état de l'élément
function setOnOff(event, id, styleOn, styleOff) {
    if (event.target.className.indexOf('fa-choice-not-validated') >= 0) {
        event.target.className = 'validate fa fa-size2 fa-choice-validated ' + styleOn;
        exports.values[id] = true;
        // ici il faut mettre à 'ok' les parents.
    }
    else {
        event.target.className = 'validate fa fa-size2 fa-choice-not-validated ' + styleOff;
        exports.values[id] = false;
        // ici il faut mette à 'del' les enfants
    }
    //console.log(event);
}
exports.setOnOff = setOnOff;
function setOnOffES(event, id, usage) {
    if (usage === 'req')
        setOnOff(event, id, 'fa-bookmark fa-color-required', 'fa-bookmark-o fa-color-required');
    else
        setOnOff(event, id, 'fa-bookmark fa-color-optional', 'fa-bookmark-o fa-color-optional');
}
exports.setOnOffES = setOnOffES;
/*
export function setOnOffEC(event, id) {
    setOnOff(event, id, 'fa-check-square fa-color-expand', 'fa-minus-square-o fa-color-expand');
}
*/
function createEC(event, id) {
    var c = exports.values[id];
    // values[uniqCreate] = {elt: ec.model, tab: ec.eCI, id: uniqCreate, path: ec.absolutepath};
    var eci = new schema.ElementCountItem();
    eci.type = c.elt.type;
    if (c.elt.type === 'elementRef') {
        eci.model = c.elt.model;
        var h = load.ptrListElementSpec[eci.model];
        eci.element = load.loadElementSpec(h, null, c.path + '/' + eci.model, "0", "unbounded");
    }
    else {
        eci.model = [];
        eci.element = [];
        for (var _i = 0, _a = c.elt.model; _i < _a.length; _i++) {
            var ece = _a[_i];
            eci.model.push(ece);
            var h = load.ptrListElementSpec[ece];
            eci.element.push(load.loadElementSpec(h, null, c.path + '/' + ece, "0", "unbounded"));
        }
    }
    // la duplication ne concerne que le premier niveau ?
    // propager à tous les enfants la mise à zéro des champs node
    // normalement pas copié à vérifier
    // odd.setNodesToNull(eci.element);
    eci.validatedEC = false;
    eci.validatedECID = createID();
    exports.values[eci.validatedECID] = false;
    c.tab.push(eci);
    var s = '<div class="headSequence">\n';
    /*
    s += '<i class="validate fa fa-minus-square-o fa-choice-not-validated fa-color-expand " '
        + 'onclick="window.ui.setOnOffEC(event, \'' + eci.validatedECID + '\')"></i>\n';
    */
    s += '<div class="content">\n';
    if (eci.type === 'elementRef') {
        s += generateElement(eci.element, 'single');
    }
    else {
        for (var _b = 0, _c = eci.element; _b < _c.length; _b++) {
            var ece = _c[_b];
            s += generateElement(ece, 'single');
        }
    }
    s += '</div>';
    s += '</div>';
    //console.log(event, id);
    var referenceNode = document.getElementById(id);
    /*
    var newEl = document.createElement('div');
    newEl.innerHTML = s;
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
    */
    referenceNode.insertAdjacentHTML('beforeend', s);
}
exports.createEC = createEC;
function setText(event, id) {
    exports.values[id] = event.target.value;
    //console.log(event);
}
exports.setText = setText;
function setAttr(event, id) {
    exports.values[id] = event.target.value;
    //console.log(event);
}
exports.setAttr = setAttr;
function toggle(el, value) {
    var display = (window.getComputedStyle ? getComputedStyle(el, null) : el.currentStyle).display;
    if (display == 'none')
        el.style.display = value;
    else
        el.style.display = 'none';
}
function toggleES(event, id) {
    //console.log(event, id);
    // toggle
    var node = document.getElementById('show' + id);
    // if (el.classList) el.classList.contains(className);
    // if (el.classList) el.classList.add(className);
    // if (el.classList) el.classList.remove(className);
    toggle(node, "block");
}
exports.toggleES = toggleES;
function showAll() {
    var nodes = document.getElementsByClassName('toggle');
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.display = "block";
    }
}
exports.showAll = showAll;
function hideAll() {
    var nodes = document.getElementsByClassName('toggle');
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.display = "none";
    }
}
exports.hideAll = hideAll;
/**
 * @function generateHtml
 * @param elist
 */
function generateHTML(teiData) {
    return generateElement(teiData.dataTei, 'root');
}
exports.generateHTML = generateHTML;
function generateContent(ct, abspath) {
    var s = '';
    for (var _i = 0, _a = ct.sequencesRefs; _i < _a.length; _i++) {
        var ec = _a[_i];
        if (ec.minOccurs === '1' && ec.maxOccurs === '1') {
            s = '<div class="headHRef">';
            if (ec.type === 'elementRef') {
                s += generateElement(ec.eCI[0].element, 'single');
            }
            else {
                for (var _b = 0, _c = ec.eCI[0].element; _b < _c.length; _b++) {
                    var ece = _c[_b];
                    s += generateElement(ece, 'single');
                }
            }
            s += '</div>';
        }
        else {
            s += generateMultiple(ec, abspath);
        }
    }
    return s;
}
function generateMultiple(ec, abspath) {
    // ec est un ElementCount
    var s = '';
    var uniqCreate = createID();
    s += '<div class="contentCountMany" id="' + uniqCreate + '" >\n';
    // on peut en rajouter ... ou supprimer
    s += '<div class="plusCM"><i class="create fa fa-plus-square fa-color-expand" '
        + 'onclick="window.ui.createEC(event, \'' + uniqCreate + '\')"></i></div>\n';
    exports.values[uniqCreate] = { elt: ec.eCI[0], tab: ec.eCI, id: uniqCreate, path: abspath };
    for (var i in ec.eCI) {
        var uniq = createID();
        ec.eCI[i].validatedECID = uniq;
        s += '<div class="headSequence">\n';
        exports.values[uniq] = ec.eCI[i].validatedEC;
        /*
        // l'élément peut être validé ou non
        if (values[uniq])
            s += '<i class="validate fa fa-check-square fa-choice-validated fa-color-expand" '
                + 'onclick="window.ui.setOnOffEC(event, \'' + uniq + '\')"></i>\n';
        else
            s += '<i class="validate fa fa-minus-square-o fa-choice-not-validated fa-color-expand" '
                + 'onclick="window.ui.setOnOffEC(event, \'' + uniq + '\')"></i>\n';
        */
        s += '<div class="content">\n';
        if (ec.eCI[i].type === 'elementRef') {
            s += generateElement(ec.eCI[i].element, 'multiple');
        }
        else {
            for (var _i = 0, _a = ec.eCI[i].element; _i < _a.length; _i++) {
                var ece = _a[_i];
                s += generateElement(ece, 'multiple');
            }
        }
        s += '</div>\n';
        s += '</div>\n';
    }
    s += '</div>\n';
    return s;
}
function editDataType(elt) {
    var s = '<div class="nodeEdit">\n';
    // il faut editer l'élément texte du noeud
    var uniq = createID();
    // gérer le type d'édition du champ
    switch (elt.content.datatype) {
        case 'list':
            elt.textContentID = uniq;
            exports.values[uniq] = elt.content.textContent;
            // edition de la valeur
            if (elt.usage === 'req') {
                s += '<label for="' + uniq + '">';
                s += '<em>obligatoire</em>';
                s += '</label>\n';
            }
            // choix dans une liste
            s += '<select class="listattr" id="' + uniq + '" ';
            s += 'onchange="window.ui.setAttr(event, \'' + uniq + '\');" >\n';
            for (var k = 0; k < elt.content.vallist.items.length; k++) {
                s += '<option value="' +
                    elt.content.vallist.items[k].desc + '" ';
                if (elt.content.textContent === elt.content.vallist.items[k].ident)
                    s += 'selected="selected" ';
                s += '>' + elt.content.vallist.items[k].desc + '</option>\n';
            }
            s += '</select>\n';
            break;
        case 'string':
        default:
            elt.textContentID = uniq;
            exports.values[uniq] = elt.content.textContent;
            // edition de la valeur
            if (elt.usage === 'req') {
                s += '<label for="' + uniq + '">';
                s += '<em>obligatoire</em>';
                s += '</label>\n';
            }
            s += '<input name="' + uniq + '" id="' + uniq + '" ';
            s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
            if (elt.content.textContent)
                s += ' value="' + elt.content.textContent + '"';
            s += ' />\n';
            break;
    }
    s += '</div>\n';
    return s;
}
function classOf(usage) {
    switch (usage) {
        case 'req':
            return 'color-required';
        case 'rec':
            return 'color-recommended';
        default:
            return 'color-optional';
    }
}
function editAttr(elt) {
    var s = '<div class="nodeAttr attr-' + classOf(elt.usage) + '">\n';
    for (var i in elt.attr) {
        if (!elt.attr[i].datatype)
            continue; // pas d'édition de la valeur
        if (elt.attr[i].datatype === 'list') {
            if (!elt.attr[i].items || elt.attr[i].items.length <= 0) {
                // grosse erreur ou manque liste vide
                system.alertUser("pas de liste de valeurs pour l'attribut: " + elt.attr.ident);
                continue;
            }
            // attributs avec liste
            var uniq = createID();
            if (!elt.attr[i].value)
                elt.attr[i].value = elt.attr[i].items[0].ident;
            exports.values[uniq] = elt.attr[i].value;
            elt.attr[i].valueID = uniq;
            if (elt.attr[i].desc) {
                s += '<label for="' + uniq + '">';
                s += '<b>' + odd.textDesc(elt.attr[i].desc, odd.odd.params.language) + '</b>';
                s += '</label>\n';
            }
            s += '<select class="listattr" id="' + uniq + '" ';
            s += 'onchange="window.ui.setAttr(event, \'' + uniq + '\');">\n';
            for (var k in elt.attr[i].items) {
                s += '<option value="' +
                    elt.attr[i].items[k].ident + '" ';
                if (elt.attr[i].value === elt.attr[i].items[k].ident)
                    s += 'selected="selected" ';
                s += '>' + elt.attr[i].items[k].desc;
                s += '</option>\n';
            }
            s += '</select>\n';
        }
        else if (elt.attr[i].datatype === 'openlist') {
            if (!elt.attr[i].items || elt.attr[i].items.length <= 0) {
                // grosse erreur ou manque liste vide
                system.alertUser("pas de liste de valeurs pour l'attribut: " + elt.attr.ident);
                continue;
            }
            // attributs avec liste
            var uniq = createID();
            if (!elt.attr[i].value)
                elt.attr[i].value = elt.attr[i].items[0].ident;
            exports.values[uniq] = elt.attr[i].value;
            elt.attr[i].valueID = uniq;
            if (elt.attr[i].desc) {
                s += '<label for="' + uniq + '">';
                s += '<b>' + odd.textDesc(elt.attr[i].desc, odd.odd.params.language) + '</b>';
                s += '</label>\n';
            }
            s += '<input type=text class="listattr" list="' + uniq + '" value="' + elt.attr[i].value + '" ';
            s += 'onchange="window.ui.setAttr(event, \'' + uniq + '\');"/>\n';
            s += '<datalist id="' + uniq + '">';
            for (var k in elt.attr[i].items) {
                s += '<option value="' +
                    elt.attr[i].items[k].ident + '" ';
                s += '>' + elt.attr[i].items[k].desc;
                s += '</option>\n';
            }
            s += '</datalist>\n';
        }
        else {
            // attribut sans liste: edition de la valeur
            var uniq = createID();
            exports.values[uniq] = elt.attr[i].value;
            elt.attr[i].valueID = uniq;
            if (elt.attr[i].desc) {
                s += '<label for="' + uniq + '">';
                s += '<b>' + odd.textDesc(elt.attr[i].desc, odd.odd.params.language) + '</b>';
                s += '</label>\n';
            }
            var type = 'text';
            switch (elt.attr[i].datatype) {
                case 'month':
                    type = 'month';
                    break;
                case 'date':
                    type = 'date';
                    break;
                case 'number':
                    type = 'number';
                    break;
                case 'anyURI':
                case 'uri':
                case 'url':
                    type = 'url';
                    break;
            }
            s += '<input type = "' + type + '" name="' + uniq + '" id="' + uniq + '"';
            s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
            if (elt.attr[i].value)
                s += ' value="' + elt.attr[i].value + '"';
            exports.values[uniq] = (elt.attr[i].value) ? elt.attr[i].value : '';
            s += ' />\n';
        }
    }
    s += '</div>\n';
    return s;
}
function generateElement(elt, validatedStyle) {
    // let s = '<div class="element">';
    var s = '';
    var uniq = createID();
    var prof = (elt.absolutepath.match(/\//g) || []).length - 1;
    s += '<div class="nodeField node-' + classOf(elt.usage) + '" title="' + elt.absolutepath + '" style="margin-left: ' + prof * odd.odd.params.leftShift + 'px;">\n';
    if (odd.odd.params.validateRequired && validatedStyle !== 'root') {
        // on peut tout valider donc on ne se pose pas de question
        exports.values[uniq] = elt.validatedES;
        elt.validatedESID = uniq;
        if (elt.validatedES) {
            s += '<i class="validate fa fa-size2 fa-bookmark fa-choice-validated fa-'
                + classOf(elt.usage)
                + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
        }
        else {
            s += '<i class="validate fa fa-size2 fa-bookmark-o fa-choice-not-validated fa-'
                + classOf(elt.usage)
                + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
        }
    }
    else {
        // on ne peut pas valider les req - ils sont toujours à validatedES === true
        if ((elt.usage === 'req' && validatedStyle !== 'multiple') || validatedStyle === 'root')
            elt.validatedES = true;
        exports.values[uniq] = elt.validatedES;
        elt.validatedESID = uniq;
        if (validatedStyle !== 'root' && (elt.usage !== 'req' || validatedStyle === 'multiple')) {
            if (elt.validatedES) {
                s += '<i class="validate fa fa-size2 fa-bookmark fa-choice-validated fa-'
                    + classOf(elt.usage)
                    + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
            }
            else {
                s += '<i class="validate fa fa-size2 fa-bookmark-o fa-choice-not-validated fa-'
                    + classOf(elt.usage)
                    + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
            }
        }
    }
    // contenu (node principal)
    s += '<i class="hidebutton fa fa-size2 fa-star-half-o fa-color-toggle" '
        + 'onclick="window.ui.toggleES(event, \'' + uniq + '\')"></i>';
    s += '<span class="nodeIdent">' + elt.ident + '</span>\n';
    if (odd.odd.params.displayFullpath)
        s += '<span class="nodeAbspath">' + elt.absolutepath + '</span>\n';
    s += '<div class="toggle" id="show' + uniq + '">';
    // description
    if (elt.desc)
        s += '<div class="eltDesc">' + odd.textDesc(elt.desc, odd.odd.params.language) + '</div>\n';
    // champ texte du noeud
    if (elt.content && elt.content.datatype)
        s += editDataType(elt);
    // Attributes
    if (elt.attr.length > 0)
        s += editAttr(elt);
    // enfants
    if (elt.content && elt.content.sequencesRefs.length > 0) {
        s += '<div class="nodeContent">';
        s += generateContent(elt.content, elt.absolutepath);
        s += '</div>\n';
    }
    s += '</div>\n';
    s += '</div>\n';
    return s;
}
