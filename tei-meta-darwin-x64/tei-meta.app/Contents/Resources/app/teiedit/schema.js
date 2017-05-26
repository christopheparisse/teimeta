"use strict";
/**
 * schema.ts
 * @author Christophe Parisse
 * general structure that holds the schema that can be described in different formats
 * the description of the schema and the loading edition saving of the xml files are now independant
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = "3"; // version du format
var PARAMS = (function () {
    function PARAMS() {
        // Default PARAMETRES
        this.defaultNewElement = true; // si true les éléments non existants sont inclus par défaut
        this.leftShift = 5; // taille en pixel du décalage des imbrications
        this.groupingStyle = 'border'; // style d'affichage des groupes d'éléments duplicables
        this.validateRequired = false; // si true on a le droit de ne pas valider (de supprimer) les éléments obligatoires
        this.language = 'fr'; // nom de la langue des champs desc
        this.displayFullpath = true; // affichage ou non du chemin complet des tags
        this.canRemove = false; // allows to remove existing nodes
    }
    return PARAMS;
}());
exports.PARAMS = PARAMS;
var SCHEMA = (function () {
    function SCHEMA() {
        this.listElementSpec = {}; // avoir tous les elementSpec sous la main et les controler
        this.listElementRef = {}; // avoir tous les elementRef sous la main et les controler
        this.rootTEI = null; // pointeur de base du schema (attribut start de schemaSpec)
        this.rootIdent = ''; // valeur de l'attribut ident du schemaSpec de root
        this.params = new PARAMS();
        this.namespace = ''; // namespace of the resulting xml
        this.entries = null; // entry points other than rootTEI
    }
    SCHEMA.prototype.init = function () {
        this.listElementSpec = {}; // avoir tous les elementSpec sous la main et les controler
        this.listElementRef = {}; // avoir tous les elementRef sous la main et les controler
        this.rootTEI = null; // pointeur de base du schema (attribut start de schemaSpec)
        this.rootIdent = ''; // valeur de l'attribut ident du schemaSpec de root
    };
    return SCHEMA;
}());
exports.SCHEMA = SCHEMA;
var ElementSpec = (function () {
    function ElementSpec() {
        // Informations de l'ODD
        this.ident = ''; // nom de l'élément
        this.corresp = ''; // complément du nom pour unicité dans le fichier XML
        this.access = ''; // combinaison unique ident+corresp indentifiant de manière unique les elementSpec
        this.desc = null; // structure de type Desc
        this.module = ''; // non utilisé
        this.mode = ''; // non utilisé
        this.content = null; // pointeur sur les enfants.
        this.attr = []; // les attributs
        this.usage = ''; // champ indiquant l'usage: obligatory (req), recommended (rec), optional (opt ou '')
        // Informations pour éditer la TEI
        this.absolutepath = '';
        this.validatedES = ''; // champ indiquant le statut de la part de l'utilisateur
        // '' (vide) champ pas validé ou effacé
        // 'del' = champ à effacer
        // 'ok' = champ validé
        // 'edit' = champ à conserver mais en cours d'édition
        this.validatedESID = '';
        this.node = null; // utilisé pour retrouver les éléments orignaux
        // si null alors création ex nihilo dans un emplacement absolu
    }
    return ElementSpec;
}());
exports.ElementSpec = ElementSpec;
var Content = (function () {
    function Content() {
        this.sequencesRefs = []; // des ElementCount contenant des sequence ou des elementRef
        this.datatype = ''; // infos pour l'edition
        this.vallist = null; // utilisé si ensemble de valeurs prédéfinies
        this.textContent = ''; // value pour le texte si nécessaire
        this.textContentID = ''; // ID pour le texte si nécessaire
        // obligatory = false; // true if element cannot be removed
    }
    return Content;
}());
exports.Content = Content;
var ElementCount = (function () {
    function ElementCount() {
        // les tableaux contiennent des éléments étendus
        // un élément étendu est un objet qui permet de gérer
        // un nombre quelconque d'éléments dupliqués et validés ou non
        this.minOccurs = '1'; // 0, 1, 2, unbounded
        this.maxOccurs = '1'; // 0, 1, 2, unbounded
        this.model = null; // nom de l'elementSpec de référence (elementRef) ou des elementSpec (tableau pour la sequence)
        this.ident = null; //
        this.type = ''; // elementRef or sequence
        this.eCI = []; // element Count Items
        this.parent = null; // utilisé pour retrouver les éléments orignaux et les nouveaux nodes
        // si null alors un élément doit être créé et ajouté au node parent
    }
    return ElementCount;
}());
exports.ElementCount = ElementCount;
var ElementCountItem = (function () {
    function ElementCountItem() {
        this.validatedEC = true; // is false element not used, si true element used
        this.validatedECID = '';
        // obligatory = false; // true if element cannot be removed
        this.type = '';
        this.model = null; // pour la copie du modèle dans le parent
        this.element = null; // pointeur ElementSpec vers des elementSpec ou sur des Sequence
        this.node = null; // utilisé pour retrouver les éléments orignaux et les nouveaux nodes
        // si null alors un élément doit être créé et ajouté au node parent
    }
    return ElementCountItem;
}());
exports.ElementCountItem = ElementCountItem;
var Desc = (function () {
    function Desc() {
        // Informations de l'ODD
        this.langs = []; // langues codées
        this.texts = []; // autant que de langues
        this.renditions = []; // autant que de langues
    }
    return Desc;
}());
exports.Desc = Desc;
var AttrDef = (function () {
    function AttrDef() {
        // Informations de l'ODD
        this.ident = '';
        this.rend = '';
        this.usage = ''; // champ indiquant l'usage: obligatory (req), recommanded (rec), optional (opt ou '')
        this.mode = '';
        this.desc = null;
        this.items = [];
        this.datatype = '';
        // Informations pour éditer la TEI
        this.valueID = '';
        this.value = '';
    }
    return AttrDef;
}());
exports.AttrDef = AttrDef;
var ValItem = (function () {
    function ValItem() {
        // Informations de l'ODD
        this.ident = '';
        this.desc = '';
    }
    return ValItem;
}());
exports.ValItem = ValItem;
function copyElementSpec(obj) {
    var cp = {};
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
exports.copyElementSpec = copyElementSpec;
function copyContent(obj) {
    var cp = {};
    cp.datatype = obj.datatype;
    cp.textContent = obj.textContent;
    cp.textContentID = obj.textContentID;
    cp.vallist = obj.vallist; // pas de duplication necessaire car ces elements ne sont pas modifiés
    cp.sequencesRefs = [];
    cpBloc(cp.sequencesRefs, obj.sequencesRefs);
    return cp;
}
function cpBloc(cp, obj) {
    for (var i in obj) {
        var inner = {};
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
function copyAttr(oldattr) {
    var newattr = [];
    for (var _i = 0, oldattr_1 = oldattr; _i < oldattr_1.length; _i++) {
        var obj = oldattr_1[_i];
        var cp = {};
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
