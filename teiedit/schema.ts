
/**
 * schema.ts
 * @author Christophe Parisse
 * general structure that holds the schema that can be described in different formats
 * the description of the schema and the loading edition saving of the xml files are now independant
 */

export let version = "3.1"; // version du format

export class PARAMS {
    // Default PARAMETRES
    defaultNewElement = true; // si true les éléments non existants sont inclus par défaut
    leftShift = 5; // taille en pixel du décalage des imbrications
    groupingStyle = 'border'; // style d'affichage des groupes d'éléments duplicables
    validateRequired = false; // si true on a le droit de ne pas valider (de supprimer) les éléments obligatoires
    language = 'fr'; // nom de la langue des champs desc
    displayFullpath = true; // affichage ou non du chemin complet des tags
    canRemove = false; // allows to remove existing nodes
    fmt = '?:00:00'; // format for time length of media
    nbdigits = 0; // number of digits allowed in the decimal part of a number
}

export class SCHEMA {
    listElementSpec = {}; // avoir tous les elementSpec sous la main et les controler
    listElementRef = {}; // avoir tous les elementRef sous la main et les controler
    rootTEI = null; // pointeur de base du schema (attribut start de schemaSpec)
    rootIdent = ''; // valeur de l'attribut ident du schemaSpec de root
    params =  new PARAMS();
    namespace = ''; // namespace of the resulting xml
    entries = null; // entry points other than rootTEI

    init() {
        this.listElementSpec = {}; // avoir tous les elementSpec sous la main et les controler
        this.listElementRef = {}; // avoir tous les elementRef sous la main et les controler
        this.rootTEI = null; // pointeur de base du schema (attribut start de schemaSpec)
        this.rootIdent = ''; // valeur de l'attribut ident du schemaSpec de root
    }
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
}

export class Content {
    sequencesRefs = []; // des ElementCount contenant des sequence ou des elementRef
    datatype = ''; // infos pour l'edition
    vallist = null; // utilisé si ensemble de valeurs prédéfinies
    textContent = ''; // value pour le texte si nécessaire
    textContentID = ''; // ID pour le texte si nécessaire
    // obligatory = false; // true if element cannot be removed
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
}

export class AttrDef {
    // Informations de l'ODD
    ident = '';
    rend = '';
    usage = ''; // champ indiquant l'usage: obligatory (req), recommanded (rec), optional (opt ou '')
    mode = '';
    desc = null;
    items = [];
    datatype = '';
    // Informations pour éditer la TEI
    valueID = '';
    value = '';
}

export class ValItem {
    // Informations de l'ODD
    ident = '';
    desc = '';
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
        ? copyContent(obj.content)
        : null; // pointeur sur les enfants.
    cp.attr = (obj.attr !== null)
        ? copyAttr(obj.attr)
        : null; // contenu pour l'édition du noeud lui même, champ texte, attributs et categories
    cp.absolutepath = obj.absolutepath;
    cp.node = null; // utilisé pour retrouver les éléments orignaux
    return cp;
}

function copyContent(obj): any {
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

function copyAttr(oldattr): any {
    let newattr = [];
    for (let obj of oldattr) {
        let cp: any = {};
        cp.ident = obj.ident; // nom de l'élément
        cp.rend = obj.rend;
        cp.usage = obj.usage; // req ou rien
        cp.mode = obj.mode;
        cp.desc = obj.desc;
        cp.items = obj.items; // les items ne sont pas modifiés
        cp.datatype = obj.datatype;
        cp.valueID = obj.valueID;
        cp.value = obj.value;
        newattr.push(cp);
    }
    return newattr;
}
