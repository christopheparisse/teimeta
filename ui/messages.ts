import { message } from "gulp-typescript/release/utils";

/**
 * messages.ts
 * author: Christophe Parisse
 */

let messages_fra = {
    norootattr: "Pas d'attribut racine (@start) dans le fichier ODD",
    remarksnodatatype: 'attention: remarks pour champ content sans datatype dans content: remarks ignoré',
    remarksmultab: "attention: plusieurs champs ab dans remarks. Seul le premier est utilisé",
    remarksabplusnote: "attention: le champ ab et le champ note sont présent: seul ab sera utilisé",
    nooddinelementspec: "Pas d'élément schemaSpec dans le fichier ODD",
    redefelementspec: 'ERREUR: redefinition de ',
    notdefelementref1: 'ERREUR: elementRef ',
    notdefelementref2: " n'est pas défini",
    notusedelementref1: 'ATTENTION: elementSpec ',
    notusedelementref2: " n'est pas utilisé",
    nodefrootelement: "Pas de définition pour l'élément racine ",
    toomanyelements: "Attention: trop d'éléments pour ",
    morethanoneroot: "Ficher invalide: Interdit d'avoir plus d'un élément racine",
    norootinodd: "Ficher invalide: pas d'élément racine dans le ODD",
    badtimeformat: 'Mauvais format de temps. Format correct: HhMmSs.ms',
    badtimeminutes: 'Mauvais format des minutes: entre 0 et 59',
    badtimeseconds: 'Mauvais format des secondes: entre 0 et 59',
    badtimeformat2: 'Mauvais format de temps. Format correct: H:M:S.ms',
    formatinseconds: "Format en secondes",
    askremove: 'Voulez vous supprimer cet élément et tous ses descendants ?',
    editvalue: '-saisir une valeur-',
    givevalue: "Donner la nouvelle valeur",
    nolistdatatype: "pas de liste de valeurs pour le datatype: ",
    leavinghtml: 'Il semble que vous avez édité quelque chose. Si vous partez sans sauver vos changements seront perdus.',
};

let messages_spa = {
    norootattr: "Sin atributo raíz (@start) en el archivo ODD",
};

let messages_eng = {
    norootattr: "No root attribut (@start) in the ODD file",
    remarksnodatatype: 'warning: remarks for content without datatype in content: remarks ignored',
    remarksmultab: "warning: multiple ab fields in remarks. Only first one processed",
    remarksabplusnote: "warning: field ab is used and note also: only the ab field is used",
    nooddinelementspec: "No schemaSpec element in the ODD file",
    redefelementspec: 'ERROR: redefinition of ',
    notdefelementref1: 'ERROR: elementRef ',
    notdefelementref2: " is not defined",
    notusedelementref1: 'warning: elementSpec ',
    notusedelementref2: " is not used",
    nodefrootelement: "No definition for the root element ",
    toomanyelements: "Warning: too many elements for ",
    morethanoneroot: "Invalid file: Cannot have more than one root element",
    norootinodd: "Invalid file: no root in ODD",
    badtimeformat: 'Bad time format. Correct format: HhMmSs.ms',
    badtimeminutes: 'Bad format for minutes: from 0 to 59',
    badtimeseconds: 'Bad format for seconds: from 0 to 59',
    badtimeformat2: 'Bad time format. Correct format: H:M:S.ms',
    formatinseconds: "Format in seconds",
    askremove: 'Do you want to remove this element and all its descendants ?',
    editvalue: '-edit a value-',
    givevalue: "Give the new value",
    nolistdatatype: "no list of values for the datatype: ",
    leavinghtml: 'It looks like you have been editing something. If you leave before saving, your changes will be lost.',
};

let language: any = messages_eng;

export function setLanguage(lang) {
    if (lang.toLowerCase() === 'fr' || lang.toLowerCase() === 'fra') {
        language = messages_fra;
    } else if (lang.toLowerCase() === 'sp' || lang.toLowerCase() === 'spa') {
        language = messages_spa;
    } else {
        language = messages_eng;
    }
}

export function msg(tag) {
    if (language[tag]) return language[tag];
    if (messages_eng[tag]) return messages_eng[tag];
    return "message: " + tag + " (unknow information)";
}
