/**
 * @module odd.ts
 * @author: Christophe Parisse
 * lecture du fichier odd et récupération de toutes
 * les informatons qui permettront l'édition de la tei
 * @exports loadOdd
 * @exports Element ElementCount ElementCountItem ElementSpec Content Attr Val ValItem
 */

let dom = require('xmldom').DOMParser;
let xpath = require('xpath');
let select;
// import * as system from '../system/opensave';

export class ElementSpec {
    // Informations de l'ODD
    ident = ''; // nom de l'élément
    predeclare = ''; // path dans le fichier XML
    desc = '';
    module = '';
    mode = ''; // change=oneOrMore, replace=one, add=zeroOrMore
    ana = 'text'; // mode d'édtion - texte par défaut
    content = null; // pointeur sur les enfants.
    // Informations pour éditer la TEI
    absolutepath = '';
    ec = []; // si plusieurs elementSpec,
    // cela permet de les mettre dans un tableau
    // cette partie est initialisée dans load() dans le module tei()
    // chaque ec est une copie de l'élément principal
    element = null; // contenu pour l'édtion du noeud lui même, champ texte, attributs et categories
    validatedES = false; // is false element not used, si non element used
    validatedESID = '';
    node = null; // utilisé pour retrouver les éléments orignaux
    // si null alors création ex nihilo dans un emplacement absoulu
    // si d'autres créations, alors frères
    // dans la version courante on ne peut pas créer de frères
}

export class Content {
    // les tableaux contiennent des éléments étendus
    // un élément étendu est un objet qui permet de gérer
    // un nombre quelconque d'éléments dupliqués et validés ou non 
    one = [];
    zeroOrMore = [];
    oneOrMore = [];
    twoOrMore = [];
}

export class ElementCount {
    count = ''; // oneOrMore, one, zeroOrMore, twoOrMore
    model = null;
    eCI = []; // element Count Items
}

export class ElementCountItem {
    validatedEC = false; // is false element not used, si non element used
    validatedECID = '';
    // obligatory = false; // true if element cannot be removed
    element = null; // seulement utilisé pour les noeuds internes
}

export class Element {
    // Informations de l'ODD
    name = ''; // nom de l'élément
    module = '';
    usage = ''; // req ou rien
    mode = '';
    desc = '';
    ana = 'text'; // mode d'édtion - texte par défaut - si none pas modifiable
    attr = [];
    category = [];
    content = null;
    // Informations pour éditer la TEI
    absolutepath = '';
    textContent = ''; // value pour le texte si nécessaire
    textContentID = ''; // ID pour le texte si nécessaire
    useTextContent = true; // is false element not used, si non element used
    // obligatory = false; // true if element cannot be removed
    node = null; // utilisé pour retrouver les éléments orignaux
    // si null alors un élément doit être créé et ajouté au node parent
}

export class Attr {
    // Informations de l'ODD
    ident = '';
    value = '';
    usage = '';
    mode = '';
    desc = '';
    ana = 'text'; // mode d'édtion - texte par défaut - si none pas modifiable
    type = '';
    items = [];
    // Informations pour éditer la TEI
    editing = '';
    valueID = '';
}

export class ValItem {
    // Informations de l'ODD
    ident = '';
    desc = '';
}

export function copyESOdd(obj): any {
    let cp: any = {};
    cp.ident = obj.ident; // nom de l'élément
    cp.predeclare = obj.predeclare; // path dans le fichier XML
    cp.desc = obj.desc;
    cp.module = obj.module;
    cp.mode = obj.mode; // change=oneOrMore, replace=one, add=zeroOrMore
    cp.ana = obj.ana; // mode d'édtion - texte par défaut
    cp.absolutepath = obj.absolutepath;
    cp.validatedES = obj.validatedES; // is false element not used, si non element used
    cp.validatedESID = obj.validatedESID;
    cp.content = (obj.content !== null)
        ? copyContentOdd(obj.content)
        : null; // pointeur sur les enfants.
    cp.element = (obj.element !== null)
        ? copyElementOdd(obj.element)
        : null; // contenu pour l'édtion du noeud lui même, champ texte, attributs et categories
    cp.ec = []; // si plusieurs elementSpec: normalement pas besoin de copie récursive, la copie sert à cela
    cp.node = null; // utilisé pour retrouver les éléments orignaux
    return cp;
}

function cpBloc(cp, obj) {
    for (let i in obj) {
        if (obj[i].count !== undefined) {
            let inner: any = {};
            inner.count = obj[i].count; // oneOrMore, one, zeroOrMore, twoOrMore
            inner.model = obj[i].model;
            inner.eCI = []; // element Count Items
            for (let k in obj[i].eCI) {
                let eci = new ElementCountItem();
                let e = obj[i].eCI[k];
                eci.validatedEC = e.validatedEC;
                eci.validatedECID = e.validatedECID;
                eci.element = copyElementOdd(e.element);
                inner.eCI.push(eci);
            }
            cp.push(inner);
        } else {
            cp.push(copyElementOdd(obj[i]));
        }
    }
}

export function copyContentOdd(obj): any {
    let cp: any = {};
    cp.one = [];
    cpBloc(cp.one, obj.one);
    cp.zeroOrMore = [];
    cpBloc(cp.zeroOrMore, obj.zeroOrMore);
    cp.oneOrMore = [];
    cpBloc(cp.oneOrMore, obj.oneOrMore);
    cp.twoOrMore = [];
    cpBloc(cp.twoOrMore, obj.twoOrMore);
    /*
    cp.one = [];
    for (let i in obj.one) {
        if (obj.one[i].count !== undefined) {
            let inner: any = {};
            inner.count = obj.one[i].count; // oneOrMore, one, zeroOrMore, twoOrMore
            inner.model = obj.one[i].model;
            inner.eCI = []; // element Count Items
            for (let k in obj.one[i].eCI) {
                let eci = new ElementCountItem();
                let e = obj.one[i].eCI[k];
                eci.validatedEC = e.validatedEC;
                eci.validatedECID = e.validatedECID;
                eci.element = copyElementOdd(e.element);
                inner.eCI.push(eci);
            }
            cp.one.push(inner);
        } else {
            cp.one.push(copyElementOdd(obj.one[i]));
        }
    }
    cp.oneOrMore = [];
    for (let i in obj.oneOrMore) {
        if (obj.oneOrMore[i].count !== undefined) {
            let inner: any = {};
            inner.count = obj.oneOrMore[i].count; // oneOrMore, one, zeroOrMore, twoOrMore
            inner.model = obj.oneOrMore[i].model;
            inner.eCI = []; // element Count Items
            for (let k in obj.oneOrMore[i].eCI) {
                let eci = new ElementCountItem();
                let e = obj.oneOrMore[i].eCI[k];
                eci.validatedEC = e.validatedEC;
                eci.validatedECID = e.validatedECID;
                eci.element = copyElementOdd(e.element);
                inner.eCI.push(eci);
            }
            cp.oneOrMore.push(inner);
        } else {
            cp.oneOrMore.push(copyElementOdd(obj.oneOrMore[i]));
        }
    }
    cp.zeroOrMore = [];
    for (let i in obj.zeroOrMore) {
        if (obj.zeroOrMore[i].count !== undefined) {
            let inner: any = {};
            inner.count = obj.zeroOrMore[i].count; // oneOrMore, one, zeroOrMore, twoOrMore
            inner.model = obj.zeroOrMore[i].model;
            inner.eCI = []; // element Count Items
            for (let k in obj.zeroOrMore[i].eCI) {
                let eci = new ElementCountItem();
                let e = obj.zeroOrMore[i].eCI[k];
                eci.validatedEC = e.validatedEC;
                eci.validatedECID = e.validatedECID;
                eci.element = copyElementOdd(e.element);
                inner.eCI.push(eci);
            }
            cp.zeroOrMore.push(inner);
        } else {
            cp.zeroOrMore.push(copyElementOdd(obj.zeroOrMore[i]));
        }
    }
    cp.twoOrMore = [];
    for (let i in obj.twoOrMore) {
        if (obj.twoOrMore[i].count !== undefined) {
            let inner: any = {};
            inner.count = obj.twoOrMore[i].count; // oneOrMore, one, zeroOrMore, twoOrMore
            inner.model = obj.twoOrMore[i].model;
            inner.eCI = []; // element Count Items
            for (let k in obj.twoOrMore[i].eCI) {
                let eci = new ElementCountItem();
                let e = obj.twoOrMore[i].eCI[k];
                eci.validatedEC = e.validatedEC;
                eci.validatedECID = e.validatedECID;
                eci.element = copyElementOdd(e.element);
                inner.eCI.push(eci);
            }
            cp.twoOrMore.push(inner);
        } else {
            cp.twoOrMore.push(copyElementOdd(obj.twoOrMore[i]));
        }
    }
    */
    return cp;
}

export function copyElementOdd(obj): any {
    let cp: any = {};
    cp.name = obj.name; // nom de l'élément
    cp.module = obj.module;
    cp.usage = obj.usage; // req ou rien
    cp.mode = obj.mode;
    cp.desc = obj.desc;
    cp.ana = obj.ana; // mode d'édtion - texte par défaut - si none pas modifiable
    cp.absolutepath = obj.absolutepath;
    cp.textContent = obj.textContent; // value pour le texte si nécessaire
    cp.textContentID = obj.textContentID; // ID pour le texte si nécessaire
    cp.useTextContent = obj.useTextContent; // is false element not used, si non element used
    let p = JSON.stringify(obj.attr);
    cp.attr = JSON.parse(p);
    cp.category = JSON.parse(JSON.stringify(obj.category));
    cp.content = (obj.content !== null)
        ? copyContentOdd(obj.content)
        : null; // pointeur sur les enfants.
    // Informations pour éditer la TEI
    cp.node = null; // utilisé pour retrouver les éléments orignaux
    return cp;
}

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

/**
 * @method valList
 * fonction de traitement des listes de valeurs pour les attributs
 * @param Attr structure 
 * @param node 
 */
function valList(attrdef, node) {
    let valList = node.getElementsByTagName("valList");
    if (valList.length) {
        // find all about element
        let attr = valList[0].getAttribute("type");
        if (attr.length) attrdef.type = attr[0].textContent;
        attr = valList[0].getAttribute("mode");
        if (attr.length) attrdef.mode = attr[0].textContent;
        let valItem = node.getElementsByTagName("valItem");
        for (let k=0; k < valItem.length; k++) {
            let vi = new ValItem();
            attr = valItem[k].getAttribute("ident");
            if (attr) vi.ident = attr;
            let desc = valItem[k].getElementsByTagName("desc");
            if (desc.length>0) vi.desc = desc[0].textContent;
            if (!vi.desc) vi.desc = vi.ident;
            attrdef.items.push(vi);
        }
    }
}

/**
 * @method parseElement
 * traite tout le contenu d'un élément de description
 * @param doc
 * @returns structure Element()
 */
function parseElement(doc, eltSpec) {
    let hp = (eltSpec) ? '/exm:elementSpec' : '/exm:element';
    // DOM method
    // initialize DOM
    let doc1 = new dom().parseFromString(doc, 'text/xml');
    let el = new Element();
    // find all about element
    let attr;
    if (eltSpec)
        attr = select(hp + '/@ident', doc1); // .value;
    else
        attr = select(hp + '/@name', doc1); // .value;
    if (attr.length) el.name = attr[0].textContent;
    attr = select(hp + '/@module', doc1); // .value;
    if (attr.length) el.module = attr[0].textContent;
    attr = select(hp + '/@ana', doc1); // .value;
    if (attr.length) el.ana = attr[0].textContent;
    attr = select(hp + '/@usage', doc1); // .value;
    if (attr.length) el.usage = attr[0].textContent;

    let attList = select(hp + '/exm:attList', doc1);
    for (let k=0; k < attList.length; k++) {
        let attDef = attList[k].getElementsByTagName("attDef");
        for (let l=0; l < attDef.length; l++) {
            let a = new Attr();
            attr = attDef[l].getAttribute("ident");
            if (attr) a.ident = attr;
            attr = attDef[l].getAttribute("usage");
            if (attr) a.usage = attr;
            attr = attDef[l].getAttribute("value");
            if (attr) a.value = attr;
            attr = attDef[l].getAttribute("mode");
            if (attr) a.mode = attr;
            attr = attDef[l].getAttribute("ana");
            if (attr) a.ana = attr;
            let desc = attDef[l].getElementsByTagName("desc");
            if (desc.length>0) a.desc = desc[0].textContent;
            if (!a.desc) a.desc = a.ident;
            valList(a, attDef[l]);
            el.attr.push(a);
        }
    }

    let category = select(hp + '/exm:category', doc1);
    for (let k=0; k < category.length; k++) {
        let cat = category[k].getElementsByTagName("catDesc");
        let vi = new ValItem();
        for (let l=0; l < cat.length; l++) {
            attr = cat[l].getAttribute("xml:lang");
            if (attr && attr === 'fr') {
                vi.desc = cat[l].textContent;
            }
            if (!vi.desc) vi.desc = cat[l].textContent;
        }
        attr = category[k].getAttribute("xml:id");
        if (attr) vi.ident = attr;
        if (!vi.desc) vi.desc = vi.ident;
        el.category.push(vi);
    }
 
    let desc = select(hp + '/exm:desc', doc1);
    if (desc.length>0) el.desc = desc[0].textContent;

    if (eltSpec) return el; // fin du calcul pour elementSpec

    let content = select(hp + '/exm:content', doc1);
    if (content.length > 1) {
        console.log("content différent de 1 at ", el.name);
    }
    if (content.length > 0)
        el.content = parseContent(content[0].toString());
    return el;
}

/**
 * @method parseContent
 * liste tous les elements d'un content et lance leur traitement
 * @param doc chaime contenant du xml
 * @returns structure Content()
 */
function parseContent(doc) {
    // DOM method
    // initialize DOM
    let doc1 = new dom().parseFromString(doc, 'text/xml');
    let ei = new Content();
    // find all elements
    let content = select('/exm:content/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.one.push(parseElement(content[k].toString(), false));
    content = select('/exm:content/exm:one/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.one.push(parseElement(content[k].toString(), false));
    content = select('/exm:content/exm:oneOrMore/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.oneOrMore.push(parseElement(content[k].toString(), false));
    content = select('/exm:content/exm:zeroOrMore/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.zeroOrMore.push(parseElement(content[k].toString(), false));
    content = select('/exm:content/exm:twoOrMore/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.twoOrMore.push(parseElement(content[k].toString(), false));
    /*
    content = select('/exm:content/exm:twoOrMore/exm:element', doc1);
    for (let k=0; k < content.length; k++)
        ei.twoOrMore.push(parseElement(content[k].toString()));
    */
    return ei;
}

/**
 * @method loadOdd
 * parse tous les elementSpec du odd et appele sous-fonction pour les champs Content
 * @param data : contenu d'un fichier xml
 * @returns structure teiOdd (modèle de données du ODD)
 */
export function loadOdd(data) {
    // get XML ready
    let parser = new DOMParser();
    // let doc = parser.parseFromString(data, "text/xml");
    let doc = new dom().parseFromString(data.toString(), 'text/xml');
    let ns = doc.documentElement.namespaceURI;
    select = xpath.useNamespaces({"tei": ns, "exm": ns});
    let egxml = select("//exm:egXML", doc);
    if (egxml.length < 1) {
        select = xpath.useNamespaces({"tei": ns, "exm": "http://www.tei-c.org/ns/Examples"});
        egxml = select("//exm:egXML", doc);
        if (egxml.length < 1) {
            let s = "Pas d'élément egXML dans le fichier ODD";
            console.log(s);
            return null;
        }
    }
    let eSpec = [];
    let nodes = select("//exm:elementSpec", doc);
    for (let i=0; i < nodes.length ; i++) {
        // console.log(nodes[i]);
        let s = nodes[i].toString();
        // DOM method
        // initialize DOM
        let doc1 = new dom().parseFromString(s, 'text/xml');
        // find all about elementSpec
        let content = select('/exm:elementSpec/exm:content', doc1);
        let attr = select('/exm:elementSpec/@ident', doc1); // .value;
        let ident = '?';
        if (attr.length) ident = attr[0].textContent;
        if (content.length > 1) {
            s = "content différent de 1 à " + ident + " seulement premier de traité.";
            console.log(s);
            // system.alertUser(s);
        }
        if (content.length <= 0) continue;
        let esElt = new ElementSpec();
        // insertion des données attribut du ElementSpec
        esElt.ident = ident;
        attr = select('/exm:elementSpec/@ident', doc1); // .value;
        if (attr.length) esElt.ident = attr[0].textContent;
        attr = select('/exm:elementSpec/@module', doc1); // .value;
        if (attr.length) esElt.module = attr[0].textContent;
        attr = select('/exm:elementSpec/@ana', doc1); // .value;
        if (attr.length) esElt.ana = attr[0].textContent;
        attr = select('/exm:elementSpec/@mode', doc1); // .value;
        if (attr.length) esElt.mode = attr[0].textContent;
        attr = select('/exm:elementSpec/@predeclare', doc1); // .value;
        if (attr.length) esElt.predeclare = attr[0].textContent;

        let e = esElt.predeclare.substring(esElt.predeclare.length-1);
        if (e === '/') esElt.predeclare = esElt.predeclare.substring(0,esElt.predeclare.length-1);
        // if (!es.predeclare) es.predeclare = '***NEPASEDITER***';
        esElt.absolutepath = esElt.predeclare + '/' + esElt.ident;

        let desc = select('/exm:elementSpec/exm:desc', doc1);
        if (desc.length>0) esElt.desc = desc[0].textContent;

        // décryptage des valeurs possible pour les attributs et les catégories
        esElt.element = parseElement(s, true);

        // décryptage du champ Content
        esElt.content = parseContent(content[0].toString());
        eSpec.push(esElt);
    }
    // console.log(eSpec);
    return eSpec;
}
