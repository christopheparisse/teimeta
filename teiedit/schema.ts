/**
 * schema.ts
 * @author Christophe Parisse
 * general structure that holds the schema that can be described in different formats
 * the description of the schema and the loading edition saving of the xml files are now independant
 */

export let version = "3.3"; // version of the format

export class PARAMS {
    // Default PARAMETRES
    defaultNewElement = true; // if true the non existing elements are included by default
    leftShift = 5; // size in pixel of the hanging size of the imbrications
    groupingStyle = 'border'; // display style of the groups of duplicable elements
    validateRequired = false; // if true it is possible to not validate (ie remove) obligatory elements
    language = 'fr'; // language name of the desc fields
    displayFullpath = false; // display or not the full path of the tags
    canRemove = false; // allows to remove existing nodes
    fmt = '?:00:00'; // format for time length of media
    nbdigits = 0; // number of digits allowed in the decimal part of a number
    encodeXMLFull = false; // if true use entities.encodeXML otherwise only encodes < and >
}

export class SCHEMA {
    listElementSpec = {}; // all the elementSpec available here so as to be able to control and check
    listElementRef = {}; // all the elementRef available here so as to be able to control and check
    rootTEI = null; // pointer to schema root (start attribute of schemaSpec)
    rootIdent = ''; // value of the attribute ident in the root schemaSpec
    params =  new PARAMS();
    namespace = ''; // namespace of the resulting xml
    altIdent = []; // other namespace information
    // entries = null; // entry points other than rootTEI - not used
    cssfile = ''; // information about user specified presentation
    remarks = false; // if there is some user css then don't use full css default design

    init() {
        this.listElementSpec = {}; // contains all elementSpec to access and check them easily
        this.listElementRef = {}; // conntains all elementRef to access and check them easily
        this.rootTEI = null; // pointer to the root of the schema (start attribute of schemaSpec)
        this.rootIdent = ''; // ident attribute of the root of the schemaSpec
    }
}

export class ElementSpec {
    // Information from the ODD
    ident = ''; // name of the element
    corresp = ''; // addon to the name (ident) to ensure unicity in the XML when several
                    // node have the same name but a different presentation
    access = ''; // unique combinaison of ident+corresp that identify in unique manner elementSpec
    desc = null; // Desc type structure
    module = ''; // not used
    mode = ''; // not used
    content = null; // pointer the node children
    attr = []; // the attributes
    usage = ''; // field for usage: obligatory (req), recommended (rec), optional (opt ou '')
    // Information to edit the TEI
    absolutepath = '';
    validatedES = ''; // field to provide the status from the user
    // '' (empty) not validated or removed
    // 'del' = to be removed
    // 'ok' = validated field
    // 'edit' = field not to be removed but in editing process
    validatedESID = '';
    node = null; // pointing to the original elements of the DOM
    // if node === null then ex nihilo creation in an absolute xml path
    parentElementSpec = null; // pointer to parent element for validation when validating elementSpec
    style = ''; // style for presenting the data (block or hidden)
    remarks = null; // class Remarks for CSS presentation of the global element
    // remarksContent = null; // class Remarks for CSS presentation of the main field of content.datatype
    // if exist it is the datatype
    // either default style (empty) or user specified style
    recursive = false; // if true the node point another node that is above in the tree
}

export class Content {
    sequencesRefs = []; // contains ElementCount with sequence or elementRef
    datatype = null; // information (format) for edition
}

export class DataType {
    type = ''; // format of the type to edit
    vallist = null; // utilisé si ensemble de valeurs prédéfinies
    valueContent = ''; // valeur du contenu quelque soit le format
    valueContentID = ''; // ID pour les callback
    parentElementSpec = null; // pointeur sur l'elementSpec à mettre à vrai si modifié
    // obligatory = false; // true if element cannot be removed
    remarks = null; // class Remarks for CSS presentation
}

export class ElementCount {
    // the arrays contain extended elements
    // an extended element is an object that allows to handle
    // an unlimited number of duplicated elements, validated or not
    minOccurs = '1'; // 0, 1, 2, unbounded
    maxOccurs = '1'; // 0, 1, 2, unbounded
    model = null; // name of the elementSpec of reference (elementRef) or of several elementSpec (array for sequences)
    ident = null; // identifier
    corresp = null; // complement for the identifiant
    type = ''; // elementRef or sequence
    eCI = []; // element Count Items
    parentElementSpec = null; // pointer to parent element for validation when editing datatype
}

export class ElementCountItem {
    type = '';
    model = null; // for a copy of the model of the parent
    element = null; // pointer ElementSpec to other elementSpec or to Sequence
    node = null; // used to find original nodes or new nodes 
    // if null then an element has to be created and added to the parent
    parentElementSpec = null; // pointer to parent element for validation when validating elementSpec
}

export class Desc {
    // Informations de l'ODD
    langs = []; // coded languages
    texts = []; // as many as languages : the content of the description
    renditions = []; // as many as languages : a content supplementary values for lists
}

export class AttrDef {
    // Information from the ODD
    // content of an attribute
    ident = '';
    rend = '';
    usage = ''; // field marquing use: obligatory (req), recommanded (rec), optional (opt or '')
    mode = '';
    desc = null;
    datatype = null;
}

export class ValItem {
    // Information from the ODD
    // list of items
    ident = '';
    desc = null; // type Desc structure
}

export class Remarks {
    // Information from the ODD/CSS
    // for css presentation
    cssvalue = '';
    ident = '';
}

/**
 * utilirary function to make a deep copy of elementSpec data
 * @param {Object} obj - elementSpec pointer 
 * @return {Object} - the copy
 */
export function copyElementSpec(obj): any {
    let cp: any = {};
    cp.ident = obj.ident; // nom de l'élément
    cp.desc = obj.desc;
    cp.corresp = obj.corresp;
    cp.access = obj.access;
    cp.module = obj.module;
    cp.rend = obj.rend;
    cp.mode = obj.mode; // change=oneOrMore, replace=one, add=zeroOrMore
    cp.validatedES = obj.validatedES; // is false element not used, si non element used
    cp.validatedESID = obj.validatedESID;
    cp.content = (obj.content !== null)
        ? copyContent(obj.content, cp)
        : null; // pointeur sur les enfants.
    cp.attr = (obj.attr !== null)
        ? copyAttr(obj.attr, cp)
        : null; // contenu pour l'édition du noeud lui même, champ texte, attributs et categories
    cp.absolutepath = obj.absolutepath;
    cp.parentElementSpec = obj.parentElementSpec;
    cp.node = null; // utilisé pour retrouver les éléments orignaux
    cp.remarks = obj.remarks;
    return cp;
}

/**
 * copy of content within an elementSpec
 * @param obj 
 * @param parent 
 */
function copyContent(obj, parent): any {
    let cp: any = {};
    cp.datatype = (obj.datatype) ? copyDataType(obj.datatype, parent) : null;
    cp.rend = obj.rend;
    cp.sequencesRefs = [];
    cpBloc(cp.sequencesRefs, obj.sequencesRefs);
    return cp;
}

/**
 * copy of array of children nodes within a elementSpec - recursive function
 * @param cp 
 * @param obj 
 */
function cpBloc(cp, obj) {
    for (let i in obj) {
        let inner: any = {};
        inner.minOccurs = obj[i].minOccurs; // oneOrMore, one, zeroOrMore, twoOrMore
        inner.maxOccurs = obj[i].maxOccurs; // oneOrMore, one, zeroOrMore, twoOrMore
        inner.model = obj[i].model; // model is never modified
        inner.ident = obj[i].ident; // ident is never modified
        inner.corresp = obj[i].corresp; // corresp is never modified
        inner.type = obj[i].type;
        inner.parent = obj[i].parent;
        inner.eCI = []; // element Count Items
        // copy of eCI is not necessary: elements not modified or handled in load.ts
        cp.push(inner);
    }
}

/**
 * copy of attribute within a elementSpec
 * @param oldattr 
 * @param parent 
 */
function copyAttr(oldattr, parent): any {
    let newattr = [];
    for (let obj of oldattr) {
        let cp: any = {};
        cp.ident = obj.ident; // name of the element
        cp.rend = obj.rend;
        cp.usage = obj.usage; // req or nothing
        cp.mode = obj.mode;
        cp.desc = obj.desc;
        cp.datatype = (obj.datatype) ? copyDataType(obj.datatype, parent) : null;
        newattr.push(cp);
    }
    return newattr;
}

/**
 * copy of dataType within a elementSpec
 * @param obj 
 * @param parent 
 */
function copyDataType(obj, parent): any {
    let cp: any = {};
    cp.type = obj.type;
    cp.rend = obj.rend;
    cp.remarks = obj.remarks;
    cp.valueContent = obj.valueContent;
    cp.valueContentID = obj.valueContentID;
    cp.parentElementSpec = parent;
    cp.vallist = obj.vallist; // no duplication necessary because these elements wont be modified
    return cp;
}

// From Ben N.
export function stripBOM(content) {
    // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
    // because the buffer-to-string conversion in `fs.readFileSync()`
    // translates it to FEFF, the UTF-16 BOM.
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
}
  