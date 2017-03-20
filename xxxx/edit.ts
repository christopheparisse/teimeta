/**
 * @name edit.js
 * @author Christophe Parisse
 */

import * as odd from './odd';
import * as tei from './tei';

export let values = {};
let lastId = 0;

function createID() {
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
    console.log(event);
}

export function setOnOffEC(event, id) {
    if (event.target.className.indexOf('fa-red') >= 0) {
        event.target.className = 'validate fa fa-circle-o fa-green';
        values[id] = true;
    } else {
        event.target.className = 'validate fa fa-circle-o fa-red';
        values[id] = false;
    }
    console.log(event, id);
}

export function createEC(event, id) {
    let c = values[id];
    // values[uniqCreate] = {elt: ec.model, tab: ec.eCI, id: uniqCreate};
    let eci = new odd.ElementCountItem();
    eci.element = tei.copy(c.elt);
    eci.validated = false;
    c.tab.push(eci);
    
    let uniq = createID();
    let s = '<div class="headCM">';
    values[uniq] = false;
    s += '<i class="validate fa fa-circle-o fa-red" '
        + 'onclick="window.ui.setOnOffEC(event, \'' + uniq + '\')"></i>';
    s += generateElement(eci.element);
    s += '</div>';
    console.log(event, id);
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
    console.log(event);
}

/**
 * @function generateHtml
 * @param {*} elist 
 */
export function generateHTML(dataTei) {
    let s = '';
    for (let i in dataTei) {
        let es = dataTei[i];
        //console.log(es);
        // ElementSpec
        s += '<div class="elementSpec">';
        if (es.predeclare) {
            let uniq = createID();
            if (es.validated) {
                s += '<i class="validate fa fa-2x fa-bookmark fa-green" '
                    + 'onclick="window.ui.setOnOff(event, \'' + uniq + '\')"></i>';
            } else {
                s += '<i class="validate fa fa-2x fa-bookmark-o fa-red" '
                    + 'onclick="window.ui.setOnOff(event, \'' + uniq + '\')"></i>';
            }
            values[uniq] = es.validated;
            es.validatedID = uniq;
            s += '<div class="tagnameESpec">' + es.ident + '</div>';
            s += '<div class="pathESpec">' + es.absolutepath + '</div>';
            s += (es.mode === "replace" || es.mode === "change")
                ? '<div class="usageESpec">Usage: <b>Obligatoire</b></div>' 
                : '';
            if (es.content)
                s += generateContent(es.content);
        } else {
            s += '<div class="tagnameESpec">' + es.ident + '</div>';
            s += '<div class="pathESpec">Non éditable</div>';
        }
        if (es.desc) s += '<div class="descESpec">Description: <b>' + es.desc + '</b></div>';
        s += '</div>';
    }
    return s;
}

function generateContent(ct) {
    let s = '<div class="content">';
    for (let i=0; i < ct.one.length; i++) {
        s += '<div class="groupCountOne">';
        s += '<i class="validate fa fa-circle fa-green"></i>';
        // pas de fancy stuff car l'élément est toujours présent
        s += generateElement(ct.one[i].eCI[0].element);
        s += '</div>';
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        s += groupXOrMore(ct.oneOrMore[i], true);
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        s += groupXOrMore(ct.zeroOrMore[i], false);
    }
    return s + '</div>';
}

function groupXOrMore(ec, x) {
    // ec est un ElementCount
    let s = '';
    let uniqCreate = createID();
    s += '<div class="groupCountMany" id="' + uniqCreate + '" >';
    // on peut en rajouter ... ou supprimer
    s += '<i class="create fa fa-plus fa-blue" '
        + 'onclick="window.ui.createEC(event, \'' + uniqCreate + '\')"></i>';
    values[uniqCreate] = {elt: ec.eCI[0].element, tab: ec.eCI, id: uniqCreate};
    for (let i in ec.eCI) {
        let uniq = createID();
        ec.eCI[i].validatedID = uniq;
        s += '<div class="headCM">';
        values[uniq] = ec.eCI[i].validated;
        // l'élément peut être validé ou non
        if (values[uniq])
            s += '<i class="validate fa fa-circle-o fa-green" '
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

function generateElement(elt) {
    // let s = '<div class="element">';
    let s = '';
    let uniq = createID();
    s += '<div class="eltName">';
    s += '<label for="' + uniq + '">';
    s += '<b>' + elt.name + '</b></label>';
    s += '<input name="' + uniq + '" id="' + uniq + '"';
    s += 'onchange="window.ui.setText(event, \'' + uniq + '\')"';
    if (elt.textContent) s += ' value="' + elt.textContent + '"';
    values[uniq] = (elt.textContent) ? elt.textContent : '';
    elt.textContentID = uniq;
    s += ' />';
    if (elt.usage === 'req') s += ' <em>obligatoire</em>';
    s += '</div>';
    if (elt.desc) s += '<div class="eltDesc">Description: <b>' + elt.desc + '</b></div>';
    if (elt.content) {
        s += '<div class="innerContent">';
        s += generateContent(elt.content);
        s += '</div>';
    }
    return s; // + '</div>';
}
