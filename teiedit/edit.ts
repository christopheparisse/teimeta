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

export let values = {};
let lastId = 0;

export function createID() {
    let id = 'id' + lastId;
    lastId++;
    return id;
}

export function setOnOff(event, id) {
    if (event.target.className.indexOf('fa-red') >= 0) {
        event.target.className = 'validate fa fa-2x fa-bookmark fa-green';
        values[id] = true;
    } else {
        event.target.className = 'validate fa fa-2x fa-bookmark-o fa-red';
        values[id] = false;
    }
    //console.log(event);
}

export function setOnOffEC(event, id) {
    if (event.target.className.indexOf('fa-red') >= 0) {
        event.target.className = 'validate fa fa-circle fa-green';
        values[id] = true;
    } else {
        event.target.className = 'validate fa fa-circle-o fa-red';
        values[id] = false;
    }
    //console.log(event, id);
}

export function createEC(event, id) {
    let c = values[id];
    // values[uniqCreate] = {elt: ec.model, tab: ec.eCI, id: uniqCreate};
    let eci = new odd.ElementCountItem();
    eci.element = odd.copyElementOdd(c.elt);
    // propager à tous les enfants la mise à zéro des champs node
    odd.setNodesToNull(eci.element);
    eci.validatedEC = false;
    eci.validatedECID = createID();
    values[eci.validatedECID] = false;
    c.tab.push(eci);
    let s = '<div class="headCM">';
    s += '<i class="validate fa fa-circle-o fa-red" '
        + 'onclick="window.ui.setOnOffEC(event, \'' + eci.validatedECID + '\')"></i>';
    s += generateElement(eci.element);
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

/**
 * @function generateHtml
 * @param {*} elist 
 */
export function generateHTML(dataTei) {
    let s = '';
    let nth = 0;
    for (let i in dataTei) {
        let es = dataTei[i];
        //console.log(es);
        // ElementSpec
        if (es.ec.length > 0) {
            for (let k=0; k < es.ec.length; k++) {
                if (nth % 2 === 1)
                    s += '<div class="elementSpec">';
                else
                    s += '<div class="elementSpec odd">';
                nth ++;
                let uniq = createID();
                if (es.ec[k].validatedES) {
                    s += '<i class="validate fa fa-2x fa-bookmark fa-green" '
                        + 'onclick="window.ui.setOnOff(event, \'' + uniq + '\')"></i>';
                } else {
                    s += '<i class="validate fa fa-2x fa-bookmark-o fa-red" '
                        + 'onclick="window.ui.setOnOff(event, \'' + uniq + '\')"></i>';
                }
                values[uniq] = es.ec[k].validatedES;
                es.ec[k].validatedESID = uniq;
                s += '<div class="tagnameESpec" title="' + es.absolutepath + '">' + es.ident + '</div>';

                s += generateElement(es.ec[k].element, "ESpec");

                s += (es.mode === "replace" || es.mode === "change")
                    ? '<div class="usageESpec">Usage: <b>Obligatoire</b></div>' 
                    : '';
                if (es.desc) s += '<div class="descESpec">Description: <b>' + es.desc + '</b></div>';

                if (es.ec[k].content)
                    s += generateContent(es.ec[k].content);
                s += '</div>';
            }
        } else {
            s += '<div class="elementSpec">';
            s += '<div class="tagnameESpec">' + es.ident + '</div>';
            s += '<div class="pathESpec">Non éditable</div>';
            if (es.desc) s += '<div class="descESpec">Description: <b>' + es.desc + '</b></div>';
            s += '</div>';
        }
    }
    return s;
}

function generateContent(ct) {
    let s = '<div class="content">';
    for (let i=0; i < ct.one.length; i++) {
        let uniq = createID();
        values[uniq] = ct.one[i].eCI[0].validatedEC;
        ct.one[i].eCI[0].validatedECID = uniq;
        s += '<div class="groupCountOne">';
        s += '<div class="headCM">';
        s += '<i class="validate fa fa-circle fa-green"></i>';
        // pas de fancy stuff car l'élément est toujours présent
        s += generateElement(ct.one[i].eCI[0].element);
        s += '</div>';
        s += '</div>';
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        s += groupXOrMore(ct.oneOrMore[i], true);
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        s += groupXOrMore(ct.zeroOrMore[i], false);
    }
    for (let i=0; i < ct.twoOrMore.length; i++) {
        s += groupXOrMore(ct.twoOrMore[i], true);
    }
    return s + '</div>';
}

function groupXOrMore(ec, x) {
    // ec est un ElementCount
    let s = '';
    let uniqCreate = createID();
    s += '<div class="groupCountMany" id="' + uniqCreate + '" >';
    // on peut en rajouter ... ou supprimer
    s += '<div class="plusCM"><i class="create fa fa-plus fa-blue" '
        + 'onclick="window.ui.createEC(event, \'' + uniqCreate + '\')"></i></div>';
    values[uniqCreate] = {elt: ec.eCI[0].element, tab: ec.eCI, id: uniqCreate};
    for (let i in ec.eCI) {
        let uniq = createID();
        ec.eCI[i].validatedECID = uniq;
        s += '<div class="headCM">';
        values[uniq] = ec.eCI[i].validatedEC;
        // l'élément peut être validé ou non
        if (values[uniq])
            s += '<i class="validate fa fa-circle fa-green" '
                + 'onclick="window.ui.setOnOffEC(event, \'' + uniq + '\')"></i>';
        else
            s += '<i class="validate fa fa-circle-o fa-red" '
                + 'onclick="window.ui.setOnOffEC(event, \'' + uniq + '\')"></i>';
        s += generateElement(ec.eCI[i].element);
        s += '</div>';
    }
    s += '</div>';
    return s;
}

function generateElement(elt, style='') {
    // let s = '<div class="element">';
    let s = '';
    let uniq;
    let txct = elt.textContent;
    if (elt.category.length === 0 && elt.ana === 'none') {
        // rien à editer
        if (style !== 'ESpec')
            s += '<div class="eltName">' + elt.name + '</div>';
    } else {
        s += '<div class="elementBlock" title="' + elt.absolutepath + '">';
        if (elt.category.length > 0) {
            uniq = createID();
            if (!elt.textContent) {
                elt.textContent =  elt.category[0].ident;
                txct = elt.textContent;
            } // si vide mettre le premier de la liste
            values[uniq] = (txct) ? txct : '';
            elt.textContentID = uniq;
            s += '<label for="' + uniq + '">';
            s += '<b>' + elt.name + '</b>';
            if (elt.usage === 'req') s += ' <em>obligatoire</em></span>';
            s += '</label>';
            // choix dans une liste
            s +='<select class="listattr" id="' + uniq + '" ';
            s +='onchange="window.ui.setAttr(event, \'' + uniq + '\');" >';
            for (let k=0; k < elt.category.length; k++) {
                s += '<option value="' +
                    elt.category[k].desc + '" ';
                if (txct === elt.category[k].ident)
                    s  += 'selected="selected" ';
                s += '>' + elt.category[k].desc + '</option>';
            }
            s += '</select>';        
        } else if (elt.ana !== 'none') {
            uniq = createID();
            values[uniq] = (txct) ? txct : '';
            elt.textContentID = uniq;
            if (style !== 'ESpec') {
                s += '<label for="' + uniq + '">';
                s += '<b>' + elt.name + '</b>';
                if (elt.usage === 'req') s += ' <em>obligatoire</em></span>';
                s += '</label>';
            }
            // edition de la valeur
            s += '<input name="' + uniq + '" id="' + uniq + '" ';
            s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
            if (elt.textContent) s += ' value="' + txct + '"';
            s += ' />';
        }
        s += '</div>';
        if (elt.desc && style !== 'ESpec') s += '<div class="eltDesc">Description: <b>' + elt.desc + '</b></div>';
    }
    if (elt.attr.length > 0)  {
        s += '<div class="attrs">';
        for (let i in elt.attr) {
            if (elt.attr[i].items && elt.attr[i].items.length > 0) {
                // attributs avec liste
                uniq = createID();
                if (!elt.attr[i].value) // si vide mettre le premier de la liste
                    elt.attr[i].value =  elt.attr[i].items[0].ident;
                values[uniq] = elt.attr[i].value;
                elt.attr[i].valueID = uniq;
                s += '<label for="' + uniq + '">';
                s += '<b>' + elt.attr[i].desc + '</b></label>';
                s +='<select class="listattr" id="' + uniq + '" ';
                s +='onchange="window.ui.setAttr(event, \'' + uniq + '\');">';
                for (let k in elt.attr[i].items) {
                    s += '<option value="' +
                        elt.attr[i].items[k].ident + '" ';
                        if (elt.attr[i].value === elt.attr[i].items[k].ident)
                            s  += 'selected="selected" ';
                        s += '>' + elt.attr[i].items[k].desc;
                        s += '</option>';
                }
                s += '</select>';                    
            } else if (elt.attr[i].ana !== 'none') {
                // attribut sans liste: edition de la valeur
                uniq = createID();
                values[uniq] = elt.attr[i].value;
                elt.attr[i].valueID = uniq;
                s += '<label for="' + uniq + '">';
                s += '<b>' + elt.attr[i].desc + '</b></label>';
                s += '<input name="' + uniq + '" id="' + uniq + '"';
                s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
                if (elt.attr[i].value) s += ' value="' + elt.attr[i].value + '"';
                values[uniq] = (elt.attr[i].value) ? elt.attr[i].value : '';
                s += ' />';
            }
        }
        s += '</div>';
    }

    if (elt.content && style !== 'ESpec') {
        s += '<div class="innerContent">';
        s += generateContent(elt.content);
        s += '</div>';
    }
    return s; // + '</div>';
}
