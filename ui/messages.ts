import { message } from "gulp-typescript/release/utils";

/**
 * messages.ts
 * author: Christophe Parisse
 */

let shortHelp_fra = `
<b>Usage:</b> Il faut d'abord charger un fichier ODD local (cliquer "Ouvrir ODD").</br>
Il est possible d'éditer directement un nouveau fichier à partir du ODD chargé puis de 
le sauvegarder sous un nouveau nom (cliquer sur "Sauver").</br>
Il est aussi possible de charger également un fichier XML (cliquer sur "Ouvrir").</br>
Dans ce cas, le fichier XML sera modifié selon les consignes de l'ODD. Les éléments XML non
décrits dans l'ODD ne seront pas modifiés.</br>
La sauvegarde (cliquer sur "Sauver") se fait dans le répertoire de téléchargement (ou ailleurs selon les paramètres du navigateur web).</br>
<br/>
<i class="validate fa fa-size2 fa-bookmark fa-color-required"></i> <i class="validate fa fa-size2 fa-bookmark fa-color-optional"></i> indique qu'un élément est inclus dans le fichier.</br>
<i class="validate fa fa-size2 fa-bookmark-o fa-color-required"></i> <i class="validate fa fa-size2 fa-bookmark-o fa-color-optional"></i> indique qu'un élément est supprimé du fichier.</br>
<i class="create fa fa-plus-square fa-color-expand"></i> indique qu'un élément ou un bloc peut être ajouté au fichier. Il sera validé ou non en utilisant les icones précédentes.</br>
<i class="hidebutton fa fa-size2 fa-star-half-o fa-color-toggle"></i> permet de montrer ou cacher une partie du fichier.</br>
</br>
Pour toute information, aller sur <a href="http://ct3.ortolang.fr/teimeta/readme.php" target="_blank">http://ct3.ortolang.fr/teimeta/readme.php</a><br/>
Pour télécharger ce logiciel, aller sur <a href="https://github.com/christopheparisse/teimeta" target="_blank">https://github.com/christopheparisse/teimeta</a><br/>
Pour signaler une erreur ou proposer une fonctionnalité, aller sur <a href="https://github.com/christopheparisse/teimeta/issues" target="_blank">https://github.com/christopheparisse/teimeta/issues</a><br/>
`;

 
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
    title: "Edition de métadonnées TEI / CORLI",
    xmlopen: "Ouvrir",
    xmlsave: "Sauver",
    oddopen: "Ouvrir ODD",
    menuhelp: "Aide",
    oddpredef: "ODD prédéfinis:",
    teispoken: "TEI Oral",
    oddolac: "Olac / Dublin Core",
    oddmedia: "Médias",
    menuparam: "Paramètres",
    paramfullpath: "Afficher les chemins complets ",
    paramshift: "Décalage en pixels des imbrications: ",
    paramdefincl: "Elements vides ou absents inclus automatiquement ",
    paramsupprobl: "Autoriser la suppression des éléments obligatoires ",
    paramcanrm: "Autoriser la suppression d'éléments (sinon seulement modification) ",
    shorthelp: shortHelp_fra,
    versionname: "Version prototype de TEIMETA javascript : ",
    askforsave: "Le fichier n'est pas sauvegardé. Voulez vous le sauver, quitter sans sauver ou annuler ?",
    file: "Fichier: ",
    nofilename: "Pas de nom de fichier",
    predefoddmedia: 'Odd prédéfini Média',
    predefoddolacdc: 'Odd prédéfini Olac DC',
    predefoddteispoken: 'Odd prédéfini TEI Oral',
    newfile: 'nouveau-fichier.xml',
};

let messages_spa = {
    norootattr: "Sin atributo raíz (@start) en el archivo ODD",
};

let shortHelp_eng = `
<b>Usage:</b> It is first necessary to load a local ODD file (click "Open ODD") or a predefined ODD.</br>
It is possible to edit directly a new file starting from the ODD and then 
save it with a new name (click "Save").</br>
It is also possile to load an XML file after choosing the ODD (click "Open").</br>
In this case, the XML file will be modified according to the specifications of the ODD. The XML elemets
not described in the ODD will not be modified in any way.</br>
Saving (click "Save") is performed in the download directory (or elsewhere, according to the web browser parameters).</br>
<br/>
<i class="validate fa fa-size2 fa-bookmark fa-color-required"></i> <i class="validate fa fa-size2 fa-bookmark fa-color-optional"></i> indicate whether an element is included in the file or not.</br>
<i class="validate fa fa-size2 fa-bookmark-o fa-color-required"></i> <i class="validate fa fa-size2 fa-bookmark-o fa-color-optional"></i> indicate if an element is removed or not.</br>
<i class="create fa fa-plus-square fa-color-expand"></i> indicate whether an element or a bloc can be added to the file. It will be validated or not using the previous icons.</br>
<i class="hidebutton fa fa-size2 fa-star-half-o fa-color-toggle"></i> allows to show or hide part of the file.</br>
</br>
For all information, go to <a href="http://ct3.ortolang.fr/teimeta/readme.php" target="_blank">http://ct3.ortolang.fr/teimeta/readme.php</a><br/>
To download the tool, go to <a href="https://github.com/christopheparisse/teimeta" target="_blank">https://github.com/christopheparisse/teimeta</a><br/>
To signal an error or a problem, or ask for improvments, go to <a href="https://github.com/christopheparisse/teimeta/issues" target="_blank">https://github.com/christopheparisse/teimeta/issues</a><br/>
`;

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
    title: "Metadata edition TEI / CORLI",
    xmlopen: "Open",
    xmlsave: "Save",
    oddopen: "Open ODD",
    menuhelp: "Help",
    oddpredef: "Predefined ODD:",
    teispoken: "TEI Spoken",
    oddolac: "Olac / Dublin Core",
    oddmedia: "Media",
    menuparam: "Parameters",
    paramfullpath: "Display full paths ",
    paramshift: "Number of pixel for imbrication shift: ",
    paramdefincl: "Empty or absent elements included automatically ",
    paramsupprobl: "Allow removal of obligatory elements ",
    paramcanrm: "Allow removal of elements (if not change only) ",
    shorthelp: shortHelp_eng,
    versionname: "Prototype version of javascript TEIMETA: ",
    askforsave: "The file was not saved. Do you want to save it, to quit without saving or to cancel?",
    file: "File: ",
    nofilename: "No file name",
    predefoddmedia: 'predefined ODD Media',
    predefoddolacdc: 'predefined ODD  Olac DC',
    predefoddteispoken: 'predefined ODD TEI Spoken language',
    newfile: 'new-file.xml',
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
