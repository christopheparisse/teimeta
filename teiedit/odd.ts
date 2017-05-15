/**
 * @module odd.ts
 * @author: Christophe Parisse
 * lecture du fichier odd et récupération de toutes
 * les informatons qui permettront l'édition de la tei
 * @exports loadOdd
 * @exports Element ElementCount ElementCountItem ElementSpec Content Attr Val ValItem
 */

import * as system from '../ui/opensave';

let dom = require('xmldom').DOMParser;
let xpath = require('xpath');
let select;
// import * as system from '../system/opensave';

class ODD {
    listElementSpec = {}; // avoir tous les elementSpec sous la main et les controler
    listElementRef = {}; // avoir tous les elementRef sous la main et les controler
    rootTEI = null; // pointeur de base du schema (attribut start de schemaSpec)
    rootIdent = ''; // valeur de l'attribut ident du schemaSpec de root
    // PARAMETRES
    defaultNewElement = true; // si true les éléments non existants sont inclus par défaut
    leftShift = 5; // taille en pixel du décalage des imbrications
    groupingStyle = 'border';
    validateRequired = false;
    language = 'fr';
    displayFullpath = true;
}

export let odd : ODD = null;

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
export function getChildrenByName(node, name) {
    let children = [];
    for (let child in node.childNodes) {
        if (node.childNodes[child].nodeType === 1) {
            if (node.childNodes[child].tagName === name) children.push(node.childNodes[child]);
        }
    }
    return children;
}

export class ElementSpec {
    // Informations de l'ODD
    ident = ''; // nom de l'élément
    corresp = ''; // complément du nom pour unicité dans le fichier XML
    access = ''; // combinaison unique ident+corresp indentifiant de manière unique les elementSpec
    desc = null; // structure de type Desc
    module = ''; // non utilisé
    mode = ''; // non utilisé
    content = null; // pointeur sur les enfants.
    attr = []; // les attributs
    usage = ''; // champ indiquant l'usage: obligatory (req), recommended (rec), optional (opt ou '')
    // Informations pour éditer la TEI
    absolutepath = '';
    validatedES = ''; // champ indiquant le statut de la part de l'utilisateur
    // '' (vide) champ pas validé ou effacé
    // 'del' = champ à effacer
    // 'ok' = champ validé
    // 'edit' = champ à conserver mais en cours d'édition
    validatedESID = '';
    node = null; // utilisé pour retrouver les éléments orignaux
    // si null alors création ex nihilo dans un emplacement absolu
    readOdd(node) {
        // console.log(nodes);
        // find all about elementSpec

        // récupérer tous les attributs potentiels
        this.ident = node.getAttribute("ident");
        this.corresp = node.getAttribute("corresp");
        this.module = node.getAttribute("module");
        this.mode = node.getAttribute("mode");
        // les autres attributs sont ignorés
        this.access = tagES(this.ident, this.corresp);

        // le champ desc
        let d =  new Desc();
        if (d.readOdd(node)) this.desc = d;

        // le champ content
        let c =  new Content();
        if (c.readOdd(node)) this.content = c;

        // le champ attr
        let a = getChildrenByName(node, 'attList');
        if (a.length > 0) {
            let ad = getChildrenByName(a[0], 'attDef');
            for (let i in ad) {
                let adv = new AttrDef();
                adv.readOdd(ad[i]);
                adv.valList(ad[i]);
                this.attr.push(adv);
            }
        }
    }
}

function getDataRef(node) : string {
    let d = getChildrenByName(node, 'dataRef');
    if (d.length < 1) return '';
    let n = d[0].getAttribute('name');
    if (!n) return '';
    switch(n) {
        case 'string':
            return 'string';
        case 'decimal':
            return 'decimal';
        case 'NCName':
            return 'NCName';
        case 'integer':
            return 'integer';
        case 'anyURI':
            return 'anyURI';
        case 'duration':
            return 'duration';
        default:
            console.log('unknow type for dataRef:', n, 'in', node.tagName);
            return 'string';
    }
}

export class Content {
    sequencesRefs = []; // des ElementCount contenant des sequence ou des elementRef
    datatype = ''; // infos pour l'edition
    vallist = null; // utilisé si ensemble de valeurs prédéfinies
    textContent = ''; // value pour le texte si nécessaire
    textContentID = ''; // ID pour le texte si nécessaire
    // obligatory = false; // true if element cannot be removed
    readOdd(node) {
        let d = getChildrenByName(node, 'content');
        if (d.length > 1) {
            // standard syntax is not more than one content ?
            console.log('more than one content in node: only first is processed', node.tagName);
        }
        if (d.length > 0) {
            // find elementRef
            let e = getChildrenByName(d[0], 'elementRef');
            for (let ei in e) {
                let ec = new ElementCount();
                ec.getElementRef(e[ei]);
                this.sequencesRefs.push(ec);
            }
            // find sequence
            e = getChildrenByName(d[0], 'sequence');
            for (let ei in e) {
                let ec = new ElementCount();
                ec.getSequence(e[ei]);
                this.sequencesRefs.push(ec);
            }
            // find dataRef
            this.datatype = getDataRef(d[0]); // si rien alors datatype === ''
            // find textNode
            let t = getChildrenByName(d[0], 'textNode');
            if (t.length > 0) {
                if (this.datatype === '') {
                    this.datatype = 'string'; // type par defaut
                }
                // sinon on respecte le type de dataRef
            }
            // find if there are values predefined
            let vl = new AttrDef();
            let n = vl.valList(d[0]);
            if (n > 0) {
                this.vallist = vl;
                // mettre une valeur par défaut s'il y en a une
                this.datatype = 'list';
            }
        }
        return d.length;
    }
}

export class ElementCount {
    // les tableaux contiennent des éléments étendus
    // un élément étendu est un objet qui permet de gérer
    // un nombre quelconque d'éléments dupliqués et validés ou non
    minOccurs = '1'; // 0, 1, 2, unbounded
    maxOccurs = '1'; // 0, 1, 2, unbounded
    model = null; // nom de l'elementSpec de référence (elementRef) ou des elementSpec (tableau pour la sequence)
    ident = null; //
    type = ''; // elementRef or sequence
    eCI = []; // element Count Items
    parent = null; // utilisé pour retrouver les éléments orignaux et les nouveaux nodes
    // si null alors un élément doit être créé et ajouté au node parent
    getMinMax(node) {
        let a = node.getAttribute('minOccurs');
        if (a) this.minOccurs = a;
        a = node.getAttribute('maxOccurs');
        if (a) this.maxOccurs = a;
    }
    getElementRef(node) {
        this.getMinMax(node);
        this.model = this.tagElementSpec(node);
        this.ident = this.keyElementSpec(node);
        this.type = 'elementRef';
        if (odd.listElementRef[this.model] === undefined)
            odd.listElementRef[this.model] = 1;
        else
            odd.listElementRef[this.model]++;
    }
    getSequence(node) {
        this.getMinMax(node);
        this.type = 'sequence';
        let s = getChildrenByName(node, 'elementRef');
        this.model = [];
        this.ident = [];
        for (let i in s) {
            let t = this.keyElementSpec(s[i]);
            this.ident.push(t);
            t = this.tagElementSpec(s[i]);
            this.model.push(t);
            if (odd.listElementRef[t] === undefined)
                odd.listElementRef[t] = 1;
            else
                odd.listElementRef[t]++;
        }
    }
    tagElementSpec(node) {
        let k = node.getAttribute('key');
        let c = node.getAttribute('corresp');
        return tagES(k, c);
    }
    keyElementSpec(node) {
        return node.getAttribute('key');
    }
}

export class ElementCountItem {
    validatedEC = true; // is false element not used, si true element used
    validatedECID = '';
    // obligatory = false; // true if element cannot be removed
    type = '';
    model = null; // pour la copie du modèle dans le parent
    element = null; // pointeur ElementSpec vers des elementSpec ou sur des Sequence
    node = null; // utilisé pour retrouver les éléments orignaux et les nouveaux nodes
    // si null alors un élément doit être créé et ajouté au node parent
}

export class Desc {
    // Informations de l'ODD
    langs = []; // langues codées
    texts = []; // autant que de langues
    renditions = []; // autant que de langues
    text(lg) {
        if (lg === undefined) return this.texts.length > 0 ? this.texts[0] : '';
        for (let i=0; i<this.langs.length; i++) {
            if (lg === this.langs[i]) return this.texts[i];
        }
        return this.texts.length > 0 ? this.texts[0] : '';
    }
    rendition(lg) {
        if (lg === undefined) return this.rendition.length > 0 ? this.rendition[0] : '';
        for (let i=0; i<this.langs.length; i++) {
            if (lg === this.langs[i]) return this.rendition[i];
        }
        return this.rendition.length > 0 ? this.rendition[0] : '';
    }
    readOdd(node) {
        let d = getChildrenByName(node, 'desc');
        for (let i in d) {
            this.texts.push(d[i].textContent);
            this.langs.push(d[i].getAttribute('xml:lang'));
            this.renditions.push(d[i].getAttribute('rendition'));
        }
        return d.length;
    }
}

export class AttrDef {
    // Informations de l'ODD
    ident = '';
    rend = '';
    usage = ''; // champ indiquant l'usage: obligatory (req), recommanded (rec), optional (opt ou '')
    mode = '';
    desc = null;
    items = [];
    // Informations pour éditer la TEI
    editing = '';
    valueID = '';
    value = '';

    readOdd(node) {
        this.ident = node.getAttribute('ident');
        this.usage = node.getAttribute('usage');
        this.mode = node.getAttribute('mode');
        this.rend = node.getAttribute('rend');

        // le champ desc
        let d =  new Desc();
        if (d.readOdd(node)) this.desc = d;

        // le champ datatype
        let a = getChildrenByName(node, 'datatype');
        if (a.length > 0) {
            this.editing = getDataRef(a[0]);
        }
    }
    /**
     * @method valList
     * fonction de traitement des listes de valeurs pour les attributs
     * @param Attr structure 
     * @param node 
     */
    valList(node) {
        let valList = node.getElementsByTagName("valList");
        if (valList.length > 0) {
            // find all about element
            let valItem = node.getElementsByTagName("valItem");
            for (let k=0; k < valItem.length; k++) {
                let vi = new ValItem();
                let attr = valItem[k].getAttribute("ident");
                if (attr) vi.ident = attr;
                let desc = valItem[k].getElementsByTagName("desc");
                if (desc.length>0) vi.desc = desc[0].textContent;
                if (!vi.desc) vi.desc = vi.ident;
                this.items.push(vi);
            }
            this.editing = 'list';
        }
        return valList.length;
    }
}

export class ValItem {
    // Informations de l'ODD
    ident = '';
    desc = '';
}

/**
 * @method loadOdd
 * parse tous les elementSpec du odd et appele sous-fonction pour les champs Content
 * @param data : contenu d'un fichier xml
 * @returns structure teiOdd (modèle de données du ODD)
 */
export function loadOdd(data) {
    let error = '';
    // get XML ready
    let parser = new DOMParser();
    // let doc = parser.parseFromString(data, "text/xml");
    let doc = new dom().parseFromString(data.toString(), 'text/xml');
    let ns = doc.documentElement.namespaceURI;
    select = xpath.useNamespaces({"tei": ns});
    let schemaSpec = select("//tei:schemaSpec", doc);
    if (schemaSpec.length < 1) {
        let s = "Pas d'élément schemaSpec dans le fichier ODD";
        system.alertUser(s);
        return null;
    }
    // récupérer attribut start
    let attr = schemaSpec[0].getAttribute("start");
    // valeur retour de la fonction
    if (attr) {
        odd = new ODD();
        odd.rootTEI = attr;
    } else {
        let s = "Pas d'attribut racine (@start) dans le fichier ODD";
        system.alertUser(s);
        odd = null;
        return null;
    }
    // récupérer attribut ident
    odd.rootIdent = schemaSpec[0].getAttribute("ident");
    let eSpec = getChildrenByName(schemaSpec[0], 'elementSpec');
    // lire les elementSpec
    for (let i=0; i < eSpec.length ; i++) {
        var es = new ElementSpec();
        es.readOdd(eSpec[i]);
        if (odd.listElementSpec[es.access]) {
            error += 'ERREUR: redefinition de ' + es.access;
        }
        odd.listElementSpec[es.access] = es;
    }
    for (let i in odd.listElementRef) {
        // check if all elementRef exist as elementSpec
        if (!odd.listElementSpec[i]) {
            error += 'ERREUR: elementRef ' + i + " n'est pas défini";
        }
    }
    let rootElt = odd.listElementSpec[odd.rootTEI];
    if (!rootElt) {
        error += "Pas de définition pour l'élément racine " + odd.rootTEI;
    } else {
        rootElt.usage = 'req';
    }
    console.log(odd);
    if (error) {
        system.alertUser(error);
        return null;
    }
    return odd;
}

export function copyElementSpec(obj): any {
    let cp: any = {};
    cp.ident = obj.ident; // nom de l'élément
    cp.desc = obj.desc;
    cp.corresp = obj.corresp;
    cp.access = obj.access;
    cp.module = obj.module;
    cp.mode = obj.mode; // change=oneOrMore, replace=one, add=zeroOrMore
    cp.validatedES = obj.validatedES; // is false element not used, si non element used
    cp.validatedESID = obj.validatedESID;
    cp.content = (obj.content !== null)
        ? copyContentOdd(obj.content)
        : null; // pointeur sur les enfants.
    cp.attr = (obj.attr !== null)
        ? copyAttrOdd(obj.attr)
        : null; // contenu pour l'édition du noeud lui même, champ texte, attributs et categories
    cp.absolutepath = obj.absolutepath;
    cp.node = null; // utilisé pour retrouver les éléments orignaux
    return cp;
}

export function copyContentOdd(obj): any {
    let cp: any = {};
    cp.datatype = obj.datatype;
    cp.textContent = obj.textContent;
    cp.textContentID = obj.textContentID;
    cp.vallist = obj.vallist; // pas de duplication necessaire car ces elements ne sont pas modifiés
    cp.sequencesRefs = [];
    cpBloc(cp.sequencesRefs, obj.sequencesRefs);
    return cp;
}

function cpBloc(cp, obj) {
    for (let i in obj) {
        let inner: any = {};
        inner.minOccurs = obj[i].minOccurs; // oneOrMore, one, zeroOrMore, twoOrMore
        inner.maxOccurs = obj[i].maxOccurs; // oneOrMore, one, zeroOrMore, twoOrMore
        inner.model = obj[i].model; // model ne sera jamais modifié
        inner.ident = obj[i].ident; // model ne sera jamais modifié
        inner.type = obj[i].type;
        inner.parent = obj[i].parent;
        inner.eCI = []; // element Count Items
        // pas besoin de copier, n'est pas utilisé dans ODD et sont générés dans load
        /*
        for (let k in obj[i].eCI) {
            let eci = new ElementCountItem();
            let e = obj[i].eCI[k];
            eci.validatedEC = e.validatedEC;
            eci.validatedECID = e.validatedECID;
            eci.type = e.type;
            inner.eCI.push(eci);
        }
        */
        cp.push(inner);
    }
}

export function copyAttrOdd(oldattr): any {
    let newattr = [];
    for (let obj of oldattr) {
        let cp: any = {};
        cp.ident = obj.ident; // nom de l'élément
        cp.rend = obj.rend;
        cp.usage = obj.usage; // req ou rien
        cp.mode = obj.mode;
        cp.desc = obj.desc;
        cp.items = obj.items; // les items ne sont pas modifiés
        cp.editing = obj.editing;
        cp.valueID = obj.valueID;
        cp.value = obj.value;
        newattr.push(cp);
    }
    return newattr;
}

/*
export function setNodesToNullCT(obj) {
    for (let i in obj.one) {
        for (let k in obj.one[i].eCI)
            setNodesToNull(obj.one[i].eCI[k].element);
    }
    for (let i in obj.zeroOrMore) {
        for (let k in obj.zeroOrMore[i].eCI)
            setNodesToNull(obj.zeroOrMore[i].eCI[k].element);
    }
    for (let i in obj.oneOrMore) {
        for (let k in obj.oneOrMore[i].eCI)
            setNodesToNull(obj.oneOrMore[i].eCI[k].element);
    }
    for (let i in obj.twoOrMore) {
        for (let k in obj.twoOrMore[i].eCI)
            setNodesToNull(obj.twoOrMore[i].eCI[k].element);
    }
}

export function setNodesToNull(obj) {
    obj.node = null;
    if (obj.content)
        setNodesToNullCT(obj.content);
}
*/
