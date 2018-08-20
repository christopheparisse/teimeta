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
Pour toute information (documentation, téléchargement), aller sur <a href="http://ct3.ortolang.fr/teimeta-doc/" target="_blank">http://ct3.ortolang.fr/teimeta-doc/</a><br/>
Pour télécharger les sources de ce logiciel, aller sur <a href="https://github.com/christopheparisse/teimeta" target="_blank">https://github.com/christopheparisse/teimeta</a><br/>
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
    title: "Edition de métadonnées TEI / ORTOLANG / CORLI",
    xmlopen: "Ouvrir",
    xmlsave1: "Sauver",
    xmlsave2: "Sauver le fichier XML",
    xmlsaveas: "Sauver sous ...",
    xmlnew: "Nouveau",
    oddapply: "Appliquer fichier ODD",
    cssapply: "Appliquer fichier CSS",
    cssclean: "Vider fichier CSS",
    menuhelp: "Aide",
    applyoddcss: "Appliquer ODD/CSS",
    oddpredef: "ODD prédéfinis",
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
    predefoddmedia: 'Média (TEI)',
    predefoddolacdc: 'Olac DC',
    predefoddteispoken: 'TEI Oral',
    newfile: 'nouveau-fichier.xml',
    choicelanguage: 'Langues',
    predefodd: "ODD prédéfinis",
    ok: 'OK',
    cancel: 'Annuler',
    pleaseloadcss1: "Le fichier CSS original ",
    pleaseloadcss2: " est absent: voulez vous le charger ?",
    usedefaultcss: "Le fichier CSS est absent. La CSS par défaut sera utilisée",
    pleaseloadodd1: "Le fichier ODD ",
    pleaseloadodd2: " est absent: vous devez indiquer son emplacement.",
    nooddavailable: "Le fichier ODD est absent. Il est impossible d'éditer le fichier XML.",
    askoddInfo: "Vous devez choisir un fichier ODD.",
    askoddCurrent: "Utiliser le fichier ODD actuel ",
    askoddLocalOdd: "Choisir un fichier ODD sur votre ordinateur",
    askoddPredef: "Choisir un fichier ODD prédéfini",
    paramlinks: "Paramètres / Liens",
};

let messages_spa = {
    norootattr: "Sin atributo raíz (@start) en el archivo ODD",
/*
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
*/
    title: "Editar metadatos TEI / ORTOLANG / CORLI",
    xmlopen: "Abrir",
    xmlsave1: "Guardar",
    xmlsave2: "Guardar XML archivo",
    xmlsaveas: "Guardar como ...",
    xmlnew: "Nuevo",
    oddapply: "Aplicar el archivo ODD",
    cssapply: "Aplicar el archivo CSS",
    cssclean: "Limpiar el archivo CSS",
    menuhelp: "Ayuda",
    applyoddcss: "Aplicar ODD/CSS",
    oddpredef: "ODD predefinida:",
    oddteispoken: "TEI Oral",
    oddolac: "Olac/DC",
    oddmedia: "Medios",
    menuparam: "Configuraciones",
    paramfullpath: "Ver rutas completas ",
    paramshift: "Desplazamiento de píxeles de las anidaciones: ",
    paramdefincl: "Elementos vacíos o faltantes incluidos automáticamente ",
    paramsupprobl: "Permitir la eliminación de elementos obligatorios ",
    paramcanrm: "Permitir eliminación de elementos (si no solo cambio) ",
/*
    shorthelp: shortHelp_fra,
    versionname: "Version prototype de TEIMETA javascript : ",
    askforsave: "Le fichier n'est pas sauvegardé. Voulez vous le sauver, quitter sans sauver ou annuler ?",
    file: "Fichier: ",
    nofilename: "Pas de nom de fichier",
    predefoddmedia: 'Média (TEI)',
    predefoddolacdc: 'Olac DC',
    predefoddteispoken: 'TEI Oral',
    newfile: 'nouveau-fichier.xml',
*/
    choicelanguage: 'Languages',
    predefodd: "ODD predefinda",
    ok: 'OK',
    cancel: 'Cancelar',
    paramlinks: "Parameters / Links",
};

let messages_jpn = {
    norootattr: "ODDファイルにルート属性（@start）がありません",
/*
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
*/
    title: "メタデータの編集 TEI / ORTOLANG / CORLI",
    xmlopen: "開いた",
    xmlsave1: "セーブ",
    xmlsave2: "セーブ XML file",
    xmlsaveas: "セーブ as ...",
    xmlnew: "新しい",
    oddapply: "Apply ODD file",
    cssapply: "Apply CSS file",
    cssclean: "Clean CSS file",
    menuhelp: "助けて",
    applyoddcss: "Apply ODD/CSS",
    oddpredef: "定義済みODD",
    oddteispoken: "TEI 話された",
    oddolac: "Olac/DC",
    oddmedia: "メディア",
    menuparam: "パラメーター",
    paramfullpath: "完全なパスを表示する ",
    paramshift: "ネスティングのピクセルオフセット: ",
    paramdefincl: "空または不足要素が自動的に含まれる ",
    paramsupprobl: "必須要素の削除を許可する ",
    paramcanrm: "アイテムの削除を許可する（変更だけでなく） ",
/*
    shorthelp: shortHelp_fra,
    versionname: "Version prototype de TEIMETA javascript : ",
    askforsave: "Le fichier n'est pas sauvegardé. Voulez vous le sauver, quitter sans sauver ou annuler ?",
    file: "Fichier: ",
    nofilename: "Pas de nom de fichier",
    predefoddmedia: 'Média (TEI)',
    predefoddolacdc: 'Olac DC',
    predefoddteispoken: 'TEI Oral',
    newfile: 'nouveau-fichier.xml',
*/
    choicelanguage: '語',
    predefodd: "定義済みODD",
    ok: 'OK',
    cancel: 'キャンセル',
    paramlinks: "Parameters / Links",
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
For all information (downloading, documentation), go to <a href="http://ct3.ortolang.fr/teimeta-doc/" target="_blank">http://ct3.ortolang.fr/teimeta-doc/</a><br/>
To download the sources of the tool, go to <a href="https://github.com/christopheparisse/teimeta" target="_blank">https://github.com/christopheparisse/teimeta</a><br/>
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
    title: "Metadata edition TEI / ORTOLANG / CORLI",
    xmlopen: "Open",
    xmlsave1: "Save",
    xmlsave2: "Save XML file",
    xmlsaveas: "SaveAs ...",
    xmlnew: "New",
    oddapply: "Apply ODD file",
    cssapply: "Apply CSS file",
    cssclean: "Clean CSS file",
    menuhelp: "Help",
    applyoddcss: "Apply ODD/CSS",
    oddpredef: "Predefined ODD:",
    oddteispoken: "TEI Spoken",
    oddolac: "Olac/DC",
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
    predefoddmedia: 'Media (TEI)',
    predefoddolacdc: 'Olac DC',
    predefoddteispoken: 'TEI Spoken',
    newfile: 'new-file.xml',
    choicelanguage: 'Languages',
    predefodd: "Predefined ODD",
    ok: 'OK',
    cancel: 'Cancel',
    pleaseloadcss1: "The original CSS file ",
    pleaseloadcss2: " is absent: do you want to load it?",
    usedefaultcss: "The CSS file is not found. Default CSS values will be used",
    pleaseloadodd1: "The ODD file ",
    pleaseloadodd2: " is absent: you have to give its location.",
    nooddavailable: "The ODD file is not found. The XML file cannot be edited.",
    askoddInfo: "You must choose an ODD file.",
    askoddCurrent: "Use the currently loaded ODD",
    askoddLocalOdd: "Choose and ODD file on your computer",
    askoddPredef: "Choose a predefined ODD file",
    paramlinks: "Parameters / Links",
};

let language: any = messages_eng;

export function setLanguage(lang) {
    if (lang.toLowerCase() === 'fr' || lang.toLowerCase() === 'fra' || lang.toLowerCase() === 'fre') {
        language = messages_fra;
    } else if (lang.toLowerCase() === 'es' || lang.toLowerCase() === 'spa') {
        language = messages_spa;
    } else if (lang.toLowerCase() === 'ja' || lang.toLowerCase() === 'jpn') {
        language = messages_jpn;
    } else {
        language = messages_eng;
    }
}

export function msg(tag) {
    if (language[tag]) return language[tag];
    if (messages_eng[tag]) return messages_eng[tag];
    return "message: " + tag + " (unknow information)";
}
