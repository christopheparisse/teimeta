/**
 * @name edit.js
 * @author Christophe Parisse
 */

/**
 * @function generateHtml
 * @param {*} elist 
 */

export function generateHTML(elist) {
    let s = '';
    for (let i in elist) {
        let es = elist[i];
        // ElementSpec
        s += '<div class="elementSpec">';
        s += '<h2>Tag TEI / Localisation: ' + es.predeclare + ' -/- ' + es.ident + '</h2>';
        s += '<p>Description: ' + es.desc + '</p>';
        s += (es.usage === "change" || es.usage === "replace") ? 'Usage: <b>Obligatoire</b><br/>' : '';
        // console.log(elist[i]);
        if (es.content) s += generateContent(es.content);
        s += '</div>';
    }
    return s;
}

function generateContent(ct) {
    let s = '<div class="content">';
    for (let i=0; i < ct.one.length; i++) {
        s += generateElement(ct.one[i], "one");
    }
    for (let i=0; i < ct.oneOrMore.length; i++) {
        s += generateElement(ct.oneOrMore[i], "oneOrMore");
    }
    for (let i=0; i < ct.zeroOrMore.length; i++) {
        s += generateElement(ct.zeroOrMore[i], "zeroOrMore");
    }
    for (let i=0; i < ct.twoOrMore.length; i++) {
        s += generateElement(ct.twoOrMore[i], "twoOrMore");
    }
    return s + 'div';
}

function generateElement(elt) {
    let s = '<div class="element">';
    /*
    this.name = '';
    this.module = '';
    this.usage = '';
    this.mode = '';
    this.desc = '';
    this.attr = [];
    this.category = [];
    this.content = null;
    */
    s += "<h3>Element " + (elt.usage === 'req' ? 'obligatoire' : '') + elt.name + "</h3>";
    s += '<p>Description: ' + elt.desc + '</p>';
    return s + 'div';
}
