/**
 * @module edit.js
 * @author Christophe Parisse
 * creation of the HTML structures that will allow the edition of the ODD and the TEI
 * all the underlying structures have been created before in the odd.loadOdd and tei.load functions
 * the xxID fields than allow to get the final values are created here
 */

import * as odd from './odd';
import * as schema from './schema';
import * as load from './load';
import * as alert from '../ui/alert';
import * as msg from '../ui/messages';

let resizeList = [];

export let values = {};
let changed = false; // start with no change made. If set to true then the data has to be saved.
export function change(newval=undefined) {
    if (newval === undefined) return changed;
    changed = newval; // If the parameter is set, set the value
}
let recursiveDepth = 0; // recursive depth is zero at start

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

    let ms = '0.0';
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
        values[id].value = '';
        return;
    }
    let newt = 0;
    if (odd.odd.params.fmt === 'hms') {
        var m = tx.split(/[hmsHMS]/);
        if (m.length !== 3) {
            alert.alertUser(msg.msg('badtimeformat'));
            return;
        }
        var h = parseInt(m[0]);
        var mn = parseInt(m[1]);
        var s = parseFloat(m[2]);
        if (mn > 59 || mn < 0) {
            alert.alertUser(msg.msg('badtimeminutes'));
            return;
        }
        if (s > 59 || s < 0) {
            alert.alertUser(msg.msg('badtimeseconds'));
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
            alert.alertUser(msg.msg('badtimeformat2'));
            return;
        } else {
            let h = parseInt(m[0]);
            let mn = parseInt(m[1]);
            let s = parseFloat(m[2]);
            if (mn > 59 || mn < 0) {
                alert.alertUser(msg.msg('badtimeminutes'));
                return;
            }
            if (s > 59 || s < 0) {
                alert.alertUser(msg.msg('badtimeseconds'));
                return;
            }
            newt = h * 3600 + mn * 60 + s;
        }
    }
    // sets the time to newt
    values[id].value = newt;
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
            s = msg.msg('formatinseconds');
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
        values[id].select = 'ok';
        // ici il faut mettre à 'ok' les parentElementSpec.
        setOnParents(values[id].eltSpec);
    } else {
        alert.askUserModal(
            msg.msg('askremove'),
            (ret) => {
                if (ret) {
                    event.target.className = 'validate fa fa-size2 fa-choice-not-validated ' + styleOff;
                    values[id].select = '';
                    setOffChildren(values[id].eltSpec);
                }
            }
        );
        /*
        if (alert.askUser('Voulez vous supprimer cet élément et tous ses descendants de votre document ?')) {
            console.log("mettre les enfants à ---", eltSpec);
            event.target.className = 'validate fa fa-size2 fa-choice-not-validated ' + styleOff;
            values[id].select = '';
            setOffChildren(values[id].eltSpec);
        }
        */
    }
}

function setStyleOnOff(id, val: boolean, styleOn, styleOff) {
    let node = document.getElementById(id);
    if (!node) {
        //console.log("no id found for ", id);
        return;
    }
    if (val) {
        node.className = 'validate fa fa-size2 fa-choice-validated ' + styleOn;
    } else {
        node.className = 'validate fa fa-size2 fa-choice-not-validated ' + styleOff;
    }
    //console.log(event);
}

function setOnParents(eltSpec) {
    //console.log("mettre les parents à +++", eltSpec);
    values[eltSpec.validatedESID].select = 'ok';
    if (eltSpec.usage === 'req')
        setStyleOnOff(eltSpec.validatedESID, true, 'fa-bookmark fa-color-required', 'fa-bookmark-o fa-color-required');
    else
        setStyleOnOff(eltSpec.validatedESID, true, 'fa-bookmark fa-color-optional', 'fa-bookmark-o fa-color-optional');
    if (eltSpec.parentElementSpec)
        setOnParents(eltSpec.parentElementSpec);
}

function setOffChildren(eltSpec) {
    console.log("put the children to ---", eltSpec);
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

/**
 * @method createEC
 * @param event // informed by the navigator
 * @param id // reference to the content in the ODD/TEI
 */
export function createEC(event, id) {
    change(true);
    let c = values[id];
    // values[uniqCreate] = {elt: ec.model, tab: ec.eCI, id: uniqCreate, path: ec.absolutepath};
    let eci = new schema.ElementCountItem();
    eci.parentElementSpec = c.eltSpec;
    eci.type = c.elt.type;
    if (c.elt.type === 'elementRef') {
        eci.model = c.elt.model;
        let h = load.ptrListElementSpec[eci.model];
        eci.element = load.loadElementSpec(h, null, c.path + '/' + eci.model, "0", "unbounded", c.eltSpec);
    } else {
        eci.model = [];
        eci.element = [];
        for (let ece of c.elt.model) {
            eci.model.push(ece);
            let h = load.ptrListElementSpec[ece];
            eci.element.push(load.loadElementSpec(h, null, c.path + '/' + ece, "0", "unbounded", c.eltSpec));
        }
    }
    
    // la duplication ne concerne que le premier niveau ?
    // propager à tous les enfants la mise à zéro des champs node
    // normalement pas copié à vérifier
    // odd.setNodesToNull(eci.element);
    c.tab.push(eci);
    let s = '<div class="content">\n';
    if (eci.type === 'elementRef') {
        s += generateElement(eci.element, 'optional');
    } else {
        for (let ece of eci.element) {
            s += generateElement(ece, 'optional');
        }
    }
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
    change(true);
    values[id].value = event.target.value;
    setOnParents(values[id].eltSpec);
    //console.log(event);
}

function openchoice() {
    return msg.msg('editvalue');
}

export function setOpenlist(event, id) {
    if (event.target.value === "--openchoice--") {
        alert.promptUserModal(
            msg.msg('givevalue'),
            (ret) => {
                if (ret) {
                    change(true);
                    values[id].value = ret;
                    setOnParents(values[id].eltSpec);
                    var select:any = document.getElementById(id);
                    var option = document.createElement("option");
                    option.value = ret;
                    option.innerHTML = ret;
                    select.appendChild(option);
                    select.value = ret;
                }
            }
        );
        return;
    }
    change(true);
    values[id].value = event.target.value;
    setOnParents(values[id].eltSpec);
    //console.log(event);
}

export function initOpenlist(event, id) {
    alert.promptUserModal(
        msg.msg('givevalue'),
        (ret) => {
            if (ret) {
                change(true);
                values[id].value = ret;
                setOnParents(values[id].eltSpec);
                var select:any = document.getElementById(id);
                var option = document.createElement("option");
                option.value = ret;
                option.innerHTML = ret;
                select.appendChild(option);
                select.value = ret;
                select.onclick = null; // remove this handler
            }
        }
    );
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
    recursiveDepth = 0;
    resizeList = [];
    let r = generateElement(teiData.dataTei, 'root');
    return {script: resizeList, html: r};
}

export function highlight(e) {
    e = e || window.event;
    // console.log(e);
//    if (e.button !== 2) return;
    if (!e.altKey) return;
    let el = e.target;
    if (e.target.className === "headHRef") {
        e.target.className = "headHRef highlight";
        setTimeout(function() { e.target.className = "headHRef"; }, 5000);
    }
}

function generateContent(ct, abspath) {
    let s = '';
    for (let ec of ct.sequencesRefs) {
        //console.log(">>>",ec.model);
        if (ec.minOccurs === '1' && ec.maxOccurs === '1') {
            //console.log("1-1",ec.model);
            s += '<div class="headHRef" onmouseover="window.ui.highlight(event)">';
            if (ec.type === 'elementRef') {
                s += generateElement(ec.eCI[0].element, 'obligatory');
            } else {
                for (let ece of ec.eCI[0].element) {
                    s += generateElement(ece, 'obligatory');
                }
            }
            s += '</div>';
        } else {
            // console.log("multiple",ec.eCI[0].model);
            s += generateMultiple(ec, abspath);
        }
    }
    return s;
}

function generateMultiple(ec, abspath) {
    // ec est un ElementCount
    let s = '';
    let uniqCreate = createID();
    // console.log(ec); // ec.parentElementSpec.ident
    let idm = typeof(ec.ident) === 'string' ? ec.ident : (ec.ident.join('-'));
    s += '<div class="contentCountMany UPCM-' + idm + '" id="' + uniqCreate + '" ';
    if (odd.odd.remarks === false)
        s += ' style="border: 1px solid black; border-radius: 4px;"';
    s += ' >\n';
    // on peut en rajouter ... ou supprimer
    s += '<div class="plusCM"><i class="create fa fa-plus-square fa-color-expand" '
        + 'onclick="window.ui.createEC(event, \'' + uniqCreate + '\')"></i></div>\n';
    values[uniqCreate] = {elt: ec.eCI[0], tab: ec.eCI, id: uniqCreate, path: abspath, eltSpec: ec.parentElementSpec};
    for (let i in ec.eCI) {
        // HERE can put info about expansions
        s += '<div class="content">\n';
        if (ec.eCI[i].type === 'elementRef') {
            s += generateElement(ec.eCI[i].element, 'obligatory');
        } else {
            for (let ece of ec.eCI[i].element) {
                s += generateElement(ece, 'obligatory');
            }
        }
        s += '</div>\n';
    }
    s += '</div>\n';
    return s;
}

function editDataType(datatype, ident) {
//    console.log('DATATYPE', datatype);
    // if (datatype.remarks) console.log("datatype remarks", datatype.remarks.ident, datatype.remarks, datatype);
    let s = '<div class="nodeEdit">\n';
    // il faut editer l'élément texte du noeud
    let uniq = createID();
    let UPname = 'UPI-' + datatype.parentElementSpec.ident + (datatype.parentElementSpec.corresp ? '-' + datatype.parentElementSpec.corresp : '') + '-' + ident;
    // gérer le type d'édition du champ
    switch(datatype.type) {
        case 'list':
            if (!datatype.vallist || datatype.vallist.length <= 0) {
                // grosse erreur ou manque liste vide
                alert.alertUser(msg.msg('nolistdatatype') + datatype.type);
                return '';
            }
            if (datatype.vallist.length <= 1) {
                // liste avec un seul element
                //console.log("1datatype:", datatype.valueContent, datatype.rend, datatype);
                values[uniq] = { value: (datatype.valueContent?datatype.valueContent:datatype.rend), eltSpec: datatype.parentElementSpec };
                datatype.valueContentID = uniq;
                return '';
            }
            //console.log("datatype:", datatype.valueContent, datatype.rend, datatype);
            datatype.valueContentID = uniq;
            if (!datatype.valueContent) {
                // if empty put rend value if exists else put first element
                if (datatype.rend) {
                    datatype.valueContent = datatype.rend;
                } else if (datatype.vallist) {
                    datatype.valueContent = (datatype.vallist.length>0) ? datatype.vallist[0].ident: "";
                }
            }
            values[uniq] = { value: datatype.valueContent, eltSpec: datatype.parentElementSpec };
            // edition de la valeur
            /*
            if (usage === 'req') {
                s += '<label for="' + uniq + '">';
                s += '<em>obligatoire</em>';
                s += '</label>\n';
            }
            */
            // choix dans une liste
            s +='<select class="listattr ' + UPname;
            if (datatype.remarks && datatype.remarks.ident) {
                s += ' ' + datatype.remarks.ident;
            }
            s += '" id="' + uniq + '" ';
            if (datatype.remarks) {
                s += 'style="' + datatype.remarks.cssvalue + '" \n';
            }
            s +='onchange="window.ui.setText(event, \'' + uniq + '\');" >\n';
            for (let k=0; k < datatype.vallist.length; k++) {
                s += '<option value="' +
                    datatype.vallist[k].ident + '" ';
                if (datatype.valueContent === datatype.vallist[k].ident)
                    s  += 'selected="selected" ';
                s += '>' + odd.textDesc(datatype.vallist[k].desc, odd.odd.params.language) + '</option>\n';
            }
            s += '</select>\n';
            break;
        case 'openlist':
            // attributs avec liste
            datatype.valueContentID = uniq;
            if (!datatype.valueContent) {
                // if empty put rend value if exists else put first element
                if (datatype.rend) {
                    datatype.valueContent = datatype.rend;
                } else if (datatype.vallist) {
                    datatype.valueContent = (datatype.vallist.length > 0) ? datatype.vallist[0].ident : "";
                }
            }
            values[uniq] = { value: datatype.valueContent, eltSpec: datatype.parentElementSpec };
            /*
            s +='<input type=text class="awesomplete listattr" data-minchars="0" list="' + uniq + '" value="' + datatype.valueContent + '" ';
            s +='onchange="window.ui.setAttr(event, \'' + uniq + '\');"/>\n';
            s +='<datalist id="' + uniq + '">';
            for (let k in datatype.vallist) {
                s += '<option value="' +
                    datatype.vallist[k].ident + '" ';
                    s += '>' + odd.textDesc(datatype.vallist[k].desc, odd.odd.params.language);
                    s += '</option>\n';
            }
            s += '</datalist>\n';
            */
            // choix dans une liste avec ajout possible
            s += '<select class="listattr ' + UPname;
            if (datatype.remarks && datatype.remarks.ident) {
                s += ' ' + datatype.remarks.ident;
            }
            s += '" id="' + uniq + '" \n';
            if (datatype.remarks) {
                s += 'style="' + datatype.remarks.cssvalue + '" \n';
            }
            s += 'onchange="window.ui.setOpenlist(event, \'' + uniq + '\');" \n';
            if (datatype.vallist.length === 0) {
                s += 'onclick="window.ui.initOpenlist(event, \'' + uniq + '\');" \n';
                // ne faire cela que pour des listes pas encore remplie. Pas nécessaire pour les autres.                
            }
            s += '>\n';
            s += '<option value="--openchoice--">';
            s += openchoice() + '</option>\n';
            let selected: boolean = false;
            for (let k=0; k < datatype.vallist.length; k++) {
                if (datatype.valueContent === datatype.vallist[k].ident) {
                    selected = true;                    
                }
            }
            for (let k=0; k < datatype.vallist.length; k++) {
                s += '<option value="' +
                    datatype.vallist[k].ident + '" ';
                if (datatype.valueContent === datatype.vallist[k].ident || k === 0 && selected === false) {
                    s  += 'selected="selected" ';
                    selected = true;                    
                }
                s += '>' + odd.textDesc(datatype.vallist[k].desc, odd.odd.params.language) + '</option>\n';
            }
            s += '</select>\n';
            break;
        case 'duration':
            datatype.valueContentID = uniq;
            values[uniq] = { value: datatype.valueContent, eltSpec: datatype.parentElementSpec };
            // edition de la valeur
            s += '<label for="' + uniq + '">';
            /*
            if (usage === 'req') {
                s += '<em>obligatoire</em>';
            }
            */
            s += ' ' + styleTime();
            s += '</label>\n';
            s += '<input class="' + UPname;
            if (datatype.remarks && datatype.remarks.ident) {
                s += ' ' + datatype.remarks.ident;
            }
            s += '" name="' + uniq + '" id="' + uniq + '" ';
            resizeList.push(uniq);
            if (datatype.remarks) {
                s += 'style="' + datatype.remarks.cssvalue + '" \n';
            }
            s += 'onchange="window.ui.checkTime(event, \'' + uniq + '\');"';
            s += ' value="' + formatTime(datatype.valueContent) + '"';
            s += ' />\n';
            break;
        case 'date':
        case 'month':
            datatype.valueContentID = uniq;
            values[uniq] = { value: datatype.valueContent, eltSpec: datatype.parentElementSpec };
            // edition de la valeur
            /*
            if (usage === 'req') {
                s += '<label for="' + uniq + '">';
                s += '<em>obligatoire</em>';
                s += '</label>\n';
            }
            */
            s += '<input class="' + UPname;
            if (datatype.remarks && datatype.remarks.ident) {
                s += ' ' + datatype.remarks.ident;
            }
            s += '" type="date" name="' + uniq + '" id="' + uniq + '" ';
            resizeList.push(uniq);
            if (datatype.remarks) {
                s += 'style="' + datatype.remarks.cssvalue + '" \n';
            }
            s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
            if (datatype.valueContent) s += ' value="' + datatype.valueContent + '"';
            s += ' />\n';
            break;
        case 'anyURI':
        case 'uri':
        case 'url':
        case 'string':
        default:
            datatype.valueContentID = uniq;
            values[uniq] = { value: datatype.valueContent, eltSpec: datatype.parentElementSpec };
            // edition de la valeur
            /*
            if (usage === 'req') {
                s += '<label for="' + uniq + '">';
                s += '<em>obligatoire</em>';
                s += '</label>\n';
            }
            */
            s += '<input class="' + UPname;
            if (datatype.remarks && datatype.remarks.ident) {
                s += ' ' + datatype.remarks.ident;
            }
            s += '" name="' + uniq + '" id="' + uniq + '" ';
            resizeList.push(uniq);
            if (datatype.remarks) {
                s += 'style="' + datatype.remarks.cssvalue + '" \n';
            }
            s += 'onchange="window.ui.setText(event, \'' + uniq + '\');"';
            if (datatype.valueContent) s += ' value="' + datatype.valueContent + '"';
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
    if (elt.attr.length < 1) return;
    let s = '<div class="nodeAttr">\n';
    for (let i in elt.attr) {
        if (!elt.attr[i].datatype) continue; // pas d'édition de la valeur
        if (elt.attr[i].rend) elt.attr[i].valueContent = elt.attr[i].rend;
        s += '<span class="eltNodeAttr-' + classOf(elt.attr[i].usage) + '">\n';
        if (elt.attr[i].desc) {
            s += '<span class="descAttr">';
            s += odd.textDesc(elt.attr[i].desc, odd.odd.params.language);
            s +='</span>\n';
        }
        s += editDataType(elt.attr[i].datatype, elt.attr[i].ident);
        s += '</span>\n';
    }
    s += '</div>\n';
    return s;
}

function generateElement(elt, validatedStyle) {
    // let s = '<div class="element">';
    let s = '';
    let uniq = createID();
    recursiveDepth ++; // increase depth of edition
    if (validatedStyle === 'optional')
        elt.usage = 'opt'; // created by the user
    // test if the elemennt is to be displayed or if this is something to edit in it
    let classdisplay = "UP-" + elt.ident;
    if (elt.corresp) classdisplay += "-" + elt.corresp;
    if (odd.odd.params.displayFullpath || elt.attr.length > 0 || (elt.content && elt.content.datatype)) {
        let lprof = recursiveDepth * odd.odd.params.leftShift;
        if (odd.odd.params.displayFullpath && (elt.attr.length === 0 && (!elt.content || !elt.content.datatype)))
            classdisplay = "noUP";
        // if (elt.remarks) console.log("elt remarks (on) ", elt.ident, elt);
        if (elt.remarks) {
            s += '<div title="' + elt.absolutepath + '" ';
            s += 'class="nodeField node-' + classOf(elt.usage) + " " + classdisplay;
            s += (elt.remarks.ident) ? " " + elt.remarks.ident + '" ' : '" ';
            s += 'style="' + elt.remarks.cssvalue + '">\n';
        } else {
            s += '<div class="nodeField node-' + classOf(elt.usage) + " " + classdisplay + '" title="' 
                + elt.absolutepath + '" style="margin-left: ' + lprof + 'px;">\n';
        }
        if (odd.odd.params.validateRequired && validatedStyle !== 'root') {
            // on peut tout valider donc on ne se pose pas de question
            values[uniq] = { select: elt.validatedES, eltSpec: elt.parentElementSpec };
            elt.validatedESID = uniq;
            if (elt.validatedES) {
                s += '<i id="' + elt.validatedESID + '" class="validate fa fa-size2 fa-bookmark fa-choice-validated fa-'
                    + classOf(elt.usage)
                    + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
            } else {
                s += '<i id="' + elt.validatedESID + '" class="validate fa fa-size2 fa-bookmark-o fa-choice-not-validated fa-'
                    + classOf(elt.usage)
                    + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
            }
        } else {
            // on ne peut pas valider les req - ils sont toujours à validatedES === 'ok'
            if (elt.usage === 'req') // || validatedStyle === 'root')
                elt.validatedES = 'ok';
            values[uniq] = { select: elt.validatedES, eltSpec: elt.parentElementSpec };
            elt.validatedESID = uniq;
            if (validatedStyle !== 'root' && (elt.usage !== 'req' || validatedStyle === 'optional')) {
                if (elt.validatedES) {
                    s += '<i id="' + elt.validatedESID + '" class="validate fa fa-size2 fa-bookmark fa-choice-validated fa-'
                        + classOf(elt.usage)
                        + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
                } else {
                    s += '<i id="' + elt.validatedESID + '" class="validate fa fa-size2 fa-bookmark-o fa-choice-not-validated fa-'
                        + classOf(elt.usage)
                        + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
                }
            }
        }

        // contenu (node principal)
        s += '<i class="hidebutton fa fa-size2 fa-star-half-o fa-color-toggle" '
            + 'onclick="window.ui.toggleES(event, \'' + uniq + '\')"></i>';
        if (odd.odd.params.displayFullpath) {
            s += '<span class="nodeIdent">' + elt.ident + '</span>\n';
            s += '<span class="nodeAbspath">' + elt.absolutepath + '</span>\n';
            s += '<div class="toggle" id="show' + uniq + '">';
            // description
            if (elt.desc) s += '<div class="eltDescBlock ' + classdisplay + '-desc' + '">' + odd.textDesc(elt.desc, odd.odd.params.language) + '</div>\n';
        } else {
            s += '<div class="toggle" id="show' + uniq + '">';
            // description
            if (elt.desc)
                s += '<div class="eltDesc ' + classdisplay + '-desc' + '">' + odd.textDesc(elt.desc, odd.odd.params.language) + '</div>\n';
            else
                s += '<div class="eltDesc ' + classdisplay + '-desc' + '">' + elt.ident + '</div>\n';
        }

        // champ texte du noeud
        if (elt.content && elt.content.datatype) s += editDataType(elt.content.datatype, elt.ident);
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
    } else {
        recursiveDepth --; // cancel recursiveDepth
        let lprof = recursiveDepth * odd.odd.params.leftShift;
        if (elt.remarks) {
            // if (elt.remarks) console.log("elt remarks (off) ", elt.ident, elt);
            s += '<div class="nodeField noUP node-' + classOf(elt.usage) + " " + classdisplay;
            s += (elt.remarks.ident) ? " " + elt.remarks.ident + '" ' : '" ';
            s += 'style="' + elt.remarks.cssvalue + '">\n';
        } else {
            s += '<div class="nodeField node-' + classOf(elt.usage) 
                + ' noUP" style="margin-left: ' + lprof + 'px;">\n';
        }
        values[uniq] = { select: 'ok', eltSpec: elt.parentElementSpec };
        // on ne peut pas accepter les éléments non validés car ils sont cachés
        elt.validatedESID = uniq;
        if (validatedStyle === 'optional') {
            // on peut valider
            s += '<i id="' + elt.validatedESID + '" class="validate fa fa-size2 fa-bookmark fa-choice-validated fa-'
                + classOf(elt.usage)
                + '" onclick="window.ui.setOnOffES(event, \'' + uniq + '\', \'' + elt.usage + '\')"></i>';
        }
        // description
        if (elt.desc)
            s += '<div class="eltDesc ' + classdisplay + '-desc' + '">' + odd.textDesc(elt.desc, odd.odd.params.language) + '</div>\n';
        else if (odd.odd.params.displayFullpath)
            s += '<div class="eltDesc ' + classdisplay + '-desc' + '">' + elt.ident + '</div>\n';
        if (elt.content && elt.content.sequencesRefs.length > 0) {
            s += '<div class="nodeContent">';
            s += generateContent(elt.content, elt.absolutepath);
            s += '</div>\n';
        }
        s += '</div>\n';
        recursiveDepth ++; // reset recursiveDepth
    }
    recursiveDepth --;
    return s;
}
