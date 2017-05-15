/**
 * @module edit.js
 * @author Christophe Parisse
 * création des structures HTML permettant l'édiion d'un ODD et d'un TEI
 * toutes les structures sous-jacentes (contenus à éditer)
 * ont été générés précédemment dans les fonctions odd.loadOdd et tei.load
 * les champs xxID qui permettent de récupérer les valeurs sont créés ici
 */

import * as odd from './odd';
import * as tei from './tei';
import * as load from './load';
import * as system from '../ui/opensave';

export let values = {};
let lastId = 0;

export function createID() {
    let id = 'id' + lastId;
    lastId++;
    return id;
}

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

export function setOnOffEC(event, id) {
    setOnOff(event, id, 'fa-circle fa-color-expand', 'fa-circle-o fa-color-expand');
}

export function createEC(event, id) {
    let c = values[id];
    // values[uniqCreate] = {elt: ec.model, tab: ec.eCI, id: uniqCreate};
    let eci = new odd.ElementCountItem();
    eci.type = c.elt.type;
    if (c.elt.type === 'elementRef') {
        eci.model = c.elt.model;
        let h = load.ptrListElementSpec[eci.model];
        eci.element = load.loadElementSpec(h, null, "///", "0", "unbounded");
    } else {
        eci.model = [];
        eci.element = [];
        for (let ece of c.elt.model) {
            eci.model.push(ece);
            let h = load.ptrListElementSpec[ece];
            eci.element.push(load.loadElementSpec(h, null, "///", "0", "unbounded"));
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
    let s = '<div class="headCM">\n';
    s += '<i class="validate fa fa-circle-o fa-choice-not-validated fa-color-expand " '
        + 'onclick="window.ui.setOnOffEC(event, \'' + eci.validatedECID + '\')"></i>\n';
    s += '<div class="content">\n';
    if (eci.type === 'elementRef') {
        s += generateElement(eci.element);
    } else {
        for (let ece of eci.element) {
            s += generateElement(ece);
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
export function generateHTML(dataTei) {
    // for user interface in html pages
    window['ui'] = {};
    window['ui'].setOnOffES = setOnOffES;    
    window['ui'].setOnOffEC = setOnOffEC;    
    window['ui'].setText = setText;
    window['ui'].createEC = createEC;    
    window['ui'].setAttr = setAttr;
    window['ui'].toggleES = toggleES;
    window['ui'].odd = odd.odd;

    return generateElement(dataTei);
}

function generateContent(ct) {
    let s = '';
    for (let ec of ct.sequencesRefs) {
        if (ec.minOccurs === '1' && ec.maxOccurs === '1') {
            s = '<div class="headHRef">';
            if (ec.type === 'elementRef') {
                s += generateElement(ec.eCI[0].element);
            } else {
                for (let ece of ec.eCI[0].element) {
                    s += generateElement(ece);
                }
            }
            s += '</div>';
        } else {
            s += generateMultiple(ec);
        }
    }
    return s;
}

function generateMultiple(ec) {
    // ec est un ElementCount
    let s = '';
    let uniqCreate = createID();
    s += '<div class="contentCountMany" id="' + uniqCreate + '" >\n';
    // on peut en rajouter ... ou supprimer
    s += '<div class="plusCM"><i class="create fa fa-plus fa-color-expand" '
        + 'onclick="window.ui.createEC(event, \'' + uniqCreate + '\')"></i></div>\n';
    values[uniqCreate] = {elt: ec.eCI[0], tab: ec.eCI, id: uniqCreate};
    for (let i in ec.eCI) {
        let uniq = createID();
        ec.eCI[i].validatedECID = uniq;
        s += '<div class="headSequence">\n';
        values[uniq] = ec.eCI[i].validatedEC;
        // l'élément peut être validé ou non
        if (values[uniq])
            s += '<i class="validate fa fa-circle fa-choice-validated fa-color-expand" '
                + 'onclick="window.ui.setOnOffEC(event, \'' + uniq + '\')"></i>\n';
        else
            s += '<i class="validate fa fa-circle-o fa-choice-not-validated fa-color-expand" '
                + 'onclick="window.ui.setOnOffEC(event, \'' + uniq + '\')"></i>\n';
        if (ec.eCI[i].type === 'elementRef') {
            s += generateElement(ec.eCI[i].element);
        } else {
            for (let ece of ec.eCI[i].element) {
                s += generateElement(ece);
            }
        }
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
                    elt.content.vallist.items[k].desc + '" ';
                if (elt.content.textContent === elt.content.vallist.items[k].ident)
                    s  += 'selected="selected" ';
                s += '>' + elt.content.vallist.items[k].desc + '</option>\n';
            }
            s += '</select>\n';
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
        if (!elt.attr[i].editing) continue; // pas d'édition de la valeur
        if (elt.attr[i].editing === 'list') {
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
                s += '<b>' + elt.attr[i].desc.text(odd.odd.language) + '</b>';
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
        } else {
            // attribut sans liste: edition de la valeur
            let uniq = createID();
            values[uniq] = elt.attr[i].value;
            elt.attr[i].valueID = uniq;
            if (elt.attr[i].desc) {
                s += '<label for="' + uniq + '">';
                s += '<b>' + elt.attr[i].desc.text(odd.odd.language) + '</b>';
                s += '</label>\n';
            }
            s += '<input name="' + uniq + '" id="' + uniq + '"';
            s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
            if (elt.attr[i].value) s += ' value="' + elt.attr[i].value + '"';
            values[uniq] = (elt.attr[i].value) ? elt.attr[i].value : '';
            s += ' />\n';
        }
    }
    s += '</div>\n';
    return s;
}

function generateElement(elt) {
    // let s = '<div class="element">';
    let s = '';
    let uniq = createID();
    let prof = (elt.absolutepath.match(/\//g) || []).length - 1;
    s += '<div class="nodeField node-' + classOf(elt.usage) + '" title="' + elt.absolutepath + '" style="margin-left: ' + prof*odd.odd.leftShift + 'px;">\n';
    if (odd.odd.validateRequired) {
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
        if (elt.usage === 'req')
            elt.validatedES = true;
        values[uniq] = elt.validatedES;
        elt.validatedESID = uniq;
        if (elt.usage !== 'req') {
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
    if (odd.odd.displayFullpath)
        s += '<span class="nodeAbspath">' + elt.absolutepath + '</span>\n';
    s += '<div class="toggle" id="show' + uniq + '">';
    // description
    if (elt.desc) s += '<div class="eltDesc">' + elt.desc.text(odd.odd.language) + '</div>\n';
    // champ texte du noeud
    if (elt.content && elt.content.datatype) s += editDataType(elt);
    // Attributes
    if (elt.attr.length > 0) s += editAttr(elt);
    // enfants
    if (elt.content && elt.content.sequencesRefs.length > 0) {
        s += '<div class="nodeContent">';
        s += generateContent(elt.content);
        s += '</div>\n';
    }
    s += '</div>\n';
    s += '</div>\n';
    return s;
}
