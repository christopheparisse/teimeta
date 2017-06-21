/**
 * @module edit.js
 * @author Christophe Parisse
 * création des structures HTML permettant l'édiion d'un ODD et d'un TEI
 * toutes les structures sous-jacentes (contenus à éditer)
 * ont été générés précédemment dans les fonctions odd.loadOdd et tei.load
 * les champs xxID qui permettent de récupérer les valeurs sont créés ici
 */

import * as odd from './odd';
import * as schema from './schema';
import * as tei from './tei';
import * as load from './load';
import * as system from '../ui/opensave';

export let values = {};

/**
 * format an integer into 2-digit values
 * @method intFormat2
 * @param {integer} value
 * @return {string} formatted value
 */
function intFormat2(v) {
    return (v < 10) ? "0" + v : v;
}

/**
 * format the presentation of time in the transcript
 * @method formatTime
 * @param {float} time in seconds
 * @param {string} time format : hms 00:00 ?:00:00 and raw
 * @param {number} nb of digit to the right of the point
 * @return {string} time as string
 */
function formatTime(t) {
    if (t === undefined || t === null || t === '') t = 0; // no time

    let d = new Date(t * 1000);
    let h = d.getUTCHours();
    let r;
    if (odd.odd.params.fmt === 'hms') {
        if (h > 0)
            r = h + 'h' + d.getUTCMinutes() + "m" + d.getSeconds() + "s";
        else
            r = d.getUTCMinutes() + "m" + d.getSeconds() + "s";
    } else if (odd.odd.params.fmt === '00:00') {
        r = intFormat2(h * 60 + d.getUTCMinutes()) + ':' + intFormat2(d.getSeconds());
    } else if (odd.odd.params.fmt === '?:00:00') {
        if (h > 0)
            r = h + ':' + intFormat2(d.getUTCMinutes()) + ':' + intFormat2(d.getSeconds());
        else
            r = intFormat2(d.getUTCMinutes()) + ':' + intFormat2(d.getSeconds());
    } else if (odd.odd.params.fmt === '0:00:00') {
        if (h > 0)
            r = h + ':' + intFormat2(d.getUTCMinutes()) + ':' + intFormat2(d.getSeconds());
        else
            r = h + ':' + intFormat2(d.getUTCMinutes()) + ':' + intFormat2(d.getSeconds());
    } else {
        r = h;
    }
    if (!odd.odd.params.nbdigits)
        return r;

    let ms = '';
    if (newval === 0.0)
        ms = '0.000';
    else
        ms = newval.toString();
    if (odd.odd.params.nbdigits === 3)
        ms = ms.substring(2, 5);
    else if (odd.odd.params.nbdigits === 2)
        ms = ms.substring(2, 4);
    else if (odd.odd.params.nbdigits === 1)
        ms = ms.substring(2, 3);
    if (odd.odd.params.fmt === 'hms')
        return r + ms;
    else
        return r + '.' + ms;
}

/**
 * check and modify the value of the time edited directly by the user
 * @method checkTime
 * @param event
 */
export function checkTime(event, id) {
    //console.log(event);
    //console.log(event.target);
    event.preventDefault();
    // découper en parties
    var tx = event.target.value;
    if (tx === '' || tx === 0 || tx === null) {
        // sets the time
        values[id] = '';
        return;
    }
    let newt = 0;
    if (odd.odd.params.fmt === 'hms') {
        var m = tx.split(/[hmsHMS]/);
        if (m.length !== 3) {
            system.alertUser('Mauvais format de temps. Format correct: HhMmSs.ms');
            return;
        }
        var h = parseInt(m[0]);
        var mn = parseInt(m[1]);
        var s = parseFloat(m[2]);
        if (mn > 59 || mn < 0) {
            system.alertUser('Mauvais format des minutes: entre 0 et 59');
            return;
        }
        if (s > 59 || s < 0) {
            system.alertUser('Mauvais format des secondes: entre 0 et 59');
            return;
        }
        newt = h * 3600 + mn * 60 + s;
    } else {
        var m = tx.split(':');
        if (m.length === 1) {
            newt = parseFloat(m[0]);
        } else if (m.length === 2) {
            let mn = parseInt(m[0]);
            let s = parseFloat(m[1]);
            newt = mn * 60 + s;
        } else if (m.length !== 3) {
            system.alertUser('Mauvais format de temps. Format correct: H:M:S.ms');
            return;
        } else {
            let h = parseInt(m[0]);
            let mn = parseInt(m[1]);
            let s = parseFloat(m[2]);
            if (mn > 59 || mn < 0) {
                system.alertUser('Mauvais format des minutes: entre 0 et 59');
                return;
            }
            if (s > 59 || s < 0) {
                system.alertUser('Mauvais format des secondes: entre 0 et 59');
                return;
            }
            newt = h * 3600 + mn * 60 + s;
        }
    }
    // sets the time to newt
    values[id] = newt;
}

function styleTime() {
    let s;
    switch(odd.odd.params.fmt) {
        case 'hms':
        case 'HMS':
            s = "Format: 0h0m0s";
            break;
        case '00:00':
            s = "Format: 00:00";
            break;
        case '00:00:00':
            s = "Format: 00:00:00";
            break;
        case '?:00:00':
            s = "Format: 00:00 ou 00:00:00";
            break;
        default:
            s = "Format en secondes";
            break;
    }
    return s;
}

let lastId = 0;
export function createID() {
    let id = 'id' + lastId;
    lastId++;
    return id;
}

// variantes de forme des icones
// fa-circle-o fa-minus-circle fa-minus-square-o
// fa-circle fa-thumbs-o-up fa-check-square

// affichage de la validation ou non des elementSpec
// la validation ou non passe par un changement de forme
// la couleur dépend seulement du fait que c'est obligatoire ou optionnel 
// elle n'est pas modifiée dans cette fonction mais dans l'affichage initial
// les classes fa-choice-validated et fa-choice-not-validated sont des pseudo-classes pour connaitre l'état de l'élément
export function setOnOff(event, id, styleOn, styleOff) {
    if (event.target.className.indexOf('fa-choice-not-validated') >= 0) {
        event.target.className = 'validate fa fa-size2 fa-choice-validated ' + styleOn;
        values[id] = true;
        // ici il faut mettre à 'ok' les parents.
    } else {
        event.target.className = 'validate fa fa-size2 fa-choice-not-validated ' + styleOff;
        values[id] = false;
        // ici il faut mette à 'del' les enfants
    }
    //console.log(event);
}

export function setOnOffES(event, id, usage) {
    if (usage === 'req')
        setOnOff(event, id, 'fa-bookmark fa-color-required', 'fa-bookmark-o fa-color-required');
    else
        setOnOff(event, id, 'fa-bookmark fa-color-optional', 'fa-bookmark-o fa-color-optional');
}
/*
export function setOnOffEC(event, id) {
    setOnOff(event, id, 'fa-check-square fa-color-expand', 'fa-minus-square-o fa-color-expand');
}
*/

export function createEC(event, id) {
    let c = values[id];
    // values[uniqCreate] = {elt: ec.model, tab: ec.eCI, id: uniqCreate, path: ec.absolutepath};
    let eci = new schema.ElementCountItem();
    eci.type = c.elt.type;
    if (c.elt.type === 'elementRef') {
        eci.model = c.elt.model;
        let h = load.ptrListElementSpec[eci.model];
        eci.element = load.loadElementSpec(h, null, c.path + '/' + eci.model, "0", "unbounded");
    } else {
        eci.model = [];
        eci.element = [];
        for (let ece of c.elt.model) {
            eci.model.push(ece);
            let h = load.ptrListElementSpec[ece];
            eci.element.push(load.loadElementSpec(h, null, c.path + '/' + ece, "0", "unbounded"));
        }
    }
    
    // la duplication ne concerne que le premier niveau ?
    // propager à tous les enfants la mise à zéro des champs node
    // normalement pas copié à vérifier
    // odd.setNodesToNull(eci.element);
    eci.validatedEC = false;
    eci.validatedECID = createID();
    values[eci.validatedECID] = false;
    c.tab.push(eci);
    let s = '<div class="headSequence">\n';
    /*
    s += '<i class="validate fa fa-minus-square-o fa-choice-not-validated fa-color-expand " '
        + 'onclick="window.ui.setOnOffEC(event, \'' + eci.validatedECID + '\')"></i>\n';
    */
    s += '<div class="content">\n';
    if (eci.type === 'elementRef') {
        s += generateElement(eci.element, 'single');
    } else {
        for (let ece of eci.element) {
            s += generateElement(ece, 'single');
        }
    }
    s += '</div>';
    s += '</div>';
    //console.log(event, id);
    let referenceNode = document.getElementById(id);
    /*
    var newEl = document.createElement('div');
	newEl.innerHTML = s;
	referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
    */
    referenceNode.insertAdjacentHTML('beforeend', s);
}

export function setText(event, id) {
    values[id] = event.target.value;
    //console.log(event);
}

export function setAttr(event, id) {
    values[id] = event.target.value;
    //console.log(event);
}

function toggle(el, value) {
    var display = (window.getComputedStyle ? getComputedStyle(el, null) : el.currentStyle).display;
    if (display == 'none') el.style.display = value;
    else el.style.display = 'none';
}

export function toggleES(event, id) {
    //console.log(event, id);
    // toggle
    let node = document.getElementById('show' + id);
    // if (el.classList) el.classList.contains(className);
    // if (el.classList) el.classList.add(className);
    // if (el.classList) el.classList.remove(className);
	toggle(node, "block");    
}

export function showAll() {
    let nodes: any = document.getElementsByClassName('toggle');
    for (let i=0; i<nodes.length; i++) {
        nodes[i].style.display =  "block";
    }
}

export function hideAll() {
    let nodes: any = document.getElementsByClassName('toggle');
    for (let i=0; i<nodes.length; i++) {
        nodes[i].style.display =  "none";
    }
}

/**
 * @function generateHtml
 * @param elist 
 */
export function generateHTML(teiData) {
    return generateElement(teiData.dataTei, 'root');
}

function generateContent(ct, abspath) {
    let s = '';
    for (let ec of ct.sequencesRefs) {
        if (ec.minOccurs === '1' && ec.maxOccurs === '1') {
            s = '<div class="headHRef">';
            if (ec.type === 'elementRef') {
                s += generateElement(ec.eCI[0].element, 'single');
            } else {
                for (let ece of ec.eCI[0].element) {
                    s += generateElement(ece, 'single');
                }
            }
            s += '</div>';
        } else {
            s += generateMultiple(ec, abspath);
        }
    }
    return s;
}

function generateMultiple(ec, abspath) {
    // ec est un ElementCount
    let s = '';
    let uniqCreate = createID();
    s += '<div class="contentCountMany" id="' + uniqCreate + '" >\n';
    // on peut en rajouter ... ou supprimer
    s += '<div class="plusCM"><i class="create fa fa-plus-square fa-color-expand" '
        + 'onclick="window.ui.createEC(event, \'' + uniqCreate + '\')"></i></div>\n';
    values[uniqCreate] = {elt: ec.eCI[0], tab: ec.eCI, id: uniqCreate, path: abspath};
    for (let i in ec.eCI) {
        let uniq = createID();
        ec.eCI[i].validatedECID = uniq;
        s += '<div class="headSequence">\n';
        values[uniq] = ec.eCI[i].validatedEC;
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
        } else {
            for (let ece of ec.eCI[i].element) {
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
    let s = '<div class="nodeEdit">\n';
    // il faut editer l'élément texte du noeud
    let uniq = createID();
    // gérer le type d'édition du champ
    switch(elt.content.datatype) {
        case 'list':
            elt.textContentID = uniq;
            values[uniq] = elt.content.textContent;
            // edition de la valeur
            if (elt.usage === 'req') {
                s += '<label for="' + uniq + '">';
                s += '<em>obligatoire</em>';
                s += '</label>\n';
            }
            // choix dans une liste
            s +='<select class="listattr" id="' + uniq + '" ';
            s +='onchange="window.ui.setAttr(event, \'' + uniq + '\');" >\n';
            for (let k=0; k < elt.content.vallist.items.length; k++) {
                s += '<option value="' +
                    elt.content.vallist.items[k].ident + '" ';
                if (elt.content.textContent === elt.content.vallist.items[k].ident)
                    s  += 'selected="selected" ';
                s += '>' + elt.content.vallist.items[k].desc + '</option>\n';
            }
            s += '</select>\n';
            break;
        case 'duration':
            elt.textContentID = uniq;
            values[uniq] = elt.content.textContent;
            // edition de la valeur
            s += '<label for="' + uniq + '">';
            if (elt.usage === 'req') {
                s += '<em>obligatoire</em>';
            }
            s += ' ' + styleTime();
            s += '</label>\n';
            s += '<input name="' + uniq + '" id="' + uniq + '" ';
            s += 'onchange="window.ui.checkTime(event, \'' + uniq + '\');"';
            s += ' value="' + formatTime(elt.content.textContent) + '"';
            s += ' />\n';
            break;
        case 'date':
            elt.textContentID = uniq;
            values[uniq] = elt.content.textContent;
            // edition de la valeur
            if (elt.usage === 'req') {
                s += '<label for="' + uniq + '">';
                s += '<em>obligatoire</em>';
                s += '</label>\n';
            }
            s += '<input type="date" name="' + uniq + '" id="' + uniq + '" ';
            s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
            if (elt.content.textContent) s += ' value="' + formatTime(elt.content.textContent) + '"';
            s += ' />\n';
            break;
        case 'string':
        default:
            elt.textContentID = uniq;
            values[uniq] = elt.content.textContent;
            // edition de la valeur
            if (elt.usage === 'req') {
                s += '<label for="' + uniq + '">';
                s += '<em>obligatoire</em>';
                s += '</label>\n';
            }
            s += '<input name="' + uniq + '" id="' + uniq + '" ';
            s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
            if (elt.content.textContent) s += ' value="' + elt.content.textContent + '"';
            s += ' />\n';
            break;
    }
    s += '</div>\n';
    return s;
}

function classOf(usage) {
    switch(usage) {
        case 'req':
            return 'color-required';
        case 'rec':
            return 'color-recommended';
        default:
            return 'color-optional';
    }
}

function editAttr(elt) {
    let s = '<div class="nodeAttr attr-' + classOf(elt.usage) + '">\n';
    for (let i in elt.attr) {
        if (!elt.attr[i].datatype) continue; // pas d'édition de la valeur
        if (elt.attr[i].datatype === 'list') {
            if (!elt.attr[i].items || elt.attr[i].items.length <= 0) {
                // grosse erreur ou manque liste vide
                system.alertUser("pas de liste de valeurs pour l'attribut: " + elt.attr.ident);
                continue;
            }
            // attributs avec liste
            let uniq = createID();
            if (!elt.attr[i].value) // si vide mettre le premier de la liste
                elt.attr[i].value =  elt.attr[i].items[0].ident;
            values[uniq] = elt.attr[i].value;
            elt.attr[i].valueID = uniq;
            if (elt.attr[i].desc) {
                s += '<label for="' + uniq + '">';
                s += '<b>' + odd.textDesc(elt.attr[i].desc, odd.odd.params.language) + '</b>';
                s +='</label>\n';
            }
            s +='<select class="listattr" id="' + uniq + '" ';
            s +='onchange="window.ui.setAttr(event, \'' + uniq + '\');">\n';
            for (let k in elt.attr[i].items) {
                s += '<option value="' +
                    elt.attr[i].items[k].ident + '" ';
                    if (elt.attr[i].value === elt.attr[i].items[k].ident)
                        s  += 'selected="selected" ';
                    s += '>' + elt.attr[i].items[k].desc;
                    s += '</option>\n';
            }
            s += '</select>\n';                    
        } else if (elt.attr[i].datatype === 'openlist') {
            if (!elt.attr[i].items || elt.attr[i].items.length <= 0) {
                // grosse erreur ou manque liste vide
                system.alertUser("pas de liste de valeurs pour l'attribut: " + elt.attr.ident);
                continue;
            }
            // attributs avec liste
            let uniq = createID();
            if (!elt.attr[i].value) // si vide mettre le premier de la liste
                elt.attr[i].value =  elt.attr[i].rend;
            values[uniq] = elt.attr[i].value;
            elt.attr[i].valueID = uniq;
            if (elt.attr[i].desc) {
                s += '<label for="' + uniq + '">';
                s += '<b>' + odd.textDesc(elt.attr[i].desc, odd.odd.params.language) + '</b>';
                s +='</label>\n';
            }
            s +='<input type=text class="listattr" list="' + uniq + '" value="' + elt.attr[i].value + '" ';
            s +='onchange="window.ui.setAttr(event, \'' + uniq + '\');"/>\n';
            s +='<datalist id="' + uniq + '">';
            for (let k in elt.attr[i].items) {
                s += '<option value="' +
                    elt.attr[i].items[k].ident + '" ';
                    s += '>' + elt.attr[i].items[k].desc;
                    s += '</option>\n';
            }
            s += '</datalist>\n';
        } else {
            // attribut sans liste: edition de la valeur
            let uniq = createID();
            values[uniq] = elt.attr[i].value;
            elt.attr[i].valueID = uniq;
            let type = 'text';
            switch (elt.attr[i].datatype) {
                case 'month':
                    type = 'month';
                    break;
                case 'duration':
                    type = 'duration';
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
            if (elt.attr[i].desc) {
                s += '<label for="' + uniq + '">';
                s += '<b>' + odd.textDesc(elt.attr[i].desc, odd.odd.params.language) + '</b>';
                if (type === "duration")
                    s += ' ' + styleTime();
                s += '</label>\n';
            } else if (type === "duration") {
                s += '<label for="' + uniq + '">';
                s += ' ' + styleTime();
                s += '</label>\n';
            }
            if (type === "duration") {
                s += '<input name="' + uniq + '" id="' + uniq + '" ';
                s += 'onchange="window.ui.checkTime(event, \'' + uniq + '\');" ';
                s += ' value="' + formatTime(elt.attr[i].value) + '"';
                s += ' />\n';
            } else {
                s += '<input type = "' + type + '" name="' + uniq + '" id="' + uniq + '"';
                s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
                if (elt.attr[i].value) s += ' value="' + elt.attr[i].value + '"';
                values[uniq] = (elt.attr[i].value) ? elt.attr[i].value : '';
                s += ' />\n';
            }
        }
    }
    s += '</div>\n';
    return s;
}

function generateElement(elt, validatedStyle) {
    // let s = '<div class="element">';
    let s = '';
    let uniq = createID();
    let prof = (elt.absolutepath.match(/\//g) || []).length - 1;
    s += '<div class="nodeField node-' + classOf(elt.usage) + '" title="' + elt.absolutepath + '" style="margin-left: ' + prof*odd.odd.params.leftShift + 'px;">\n';
    if (odd.odd.params.validateRequired && validatedStyle !== 'root') {
        // on peut tout valider donc on ne se pose pas de question
        values[uniq] = elt.validatedES;
        elt.validatedESID = uniq;
        if (elt.validatedES) {
            s += '<i class="validate fa fa-size2 fa-bookmark fa-choice-validated fa-'
                + classOf(elt.usage)
                + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
        } else {
            s += '<i class="validate fa fa-size2 fa-bookmark-o fa-choice-not-validated fa-'
                + classOf(elt.usage)
                + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
        }
    } else {
        // on ne peut pas valider les req - ils sont toujours à validatedES === true
        if ((elt.usage === 'req' && validatedStyle !== 'multiple') || validatedStyle === 'root')
            elt.validatedES = true;
        values[uniq] = elt.validatedES;
        elt.validatedESID = uniq;
        if (validatedStyle !== 'root' && (elt.usage !== 'req' || validatedStyle === 'multiple')) {
            if (elt.validatedES) {
                s += '<i class="validate fa fa-size2 fa-bookmark fa-choice-validated fa-'
                    + classOf(elt.usage)
                    + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
            } else {
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
    if (elt.desc) s += '<div class="eltDesc">' + odd.textDesc(elt.desc, odd.odd.params.language) + '</div>\n';
    // champ texte du noeud
    if (elt.content && elt.content.datatype) s += editDataType(elt);
    // Attributes
    if (elt.attr.length > 0) s += editAttr(elt);
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
