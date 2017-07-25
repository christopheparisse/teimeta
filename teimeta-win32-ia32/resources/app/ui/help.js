"use strict";
/**
 * help.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
var system = require("./opensave");
exports.version = '0.4.4 - 24-07-2017';
function about() {
    var s = "Version prototype de TEIMETA javascript : " + exports.version + "</br></br>";
    s += "\n<b>Usage:</b> Il faut d'abord charger un fichier ODD local (cliquer \"Ouvrir ODD\").</br>\nIl est possible d'\u00E9diter directement un nouveau fichier \u00E0 partir du ODD charg\u00E9 puis de \nle sauvegarder sous un nouveau nom (cliquer sur \"Sauver\").</br>\nIl est aussi possible de charger \u00E9galement un fichier XML (cliquer sur \"Ouvrir\").</br>\nDans ce cas, le fichier XML sera modifi\u00E9 selon les consignes de l'ODD. Les \u00E9l\u00E9ments XML non\nd\u00E9crits dans l'ODD ne seront pas modifi\u00E9s.</br>\nLa sauvegarde (cliquer sur \"Sauver\") se fait dans le r\u00E9pertoire de t\u00E9l\u00E9chargement (ou ailleurs selon les param\u00E8tres du navigateur web).</br>\n<br/>\n<i class=\"validate fa fa-size2 fa-bookmark fa-color-required\"></i> <i class=\"validate fa fa-size2 fa-bookmark fa-color-optional\"></i> indique qu'un \u00E9l\u00E9ment est inclus dans le fichier.</br>\n<i class=\"validate fa fa-size2 fa-bookmark-o fa-color-required\"></i> <i class=\"validate fa fa-size2 fa-bookmark-o fa-color-optional\"></i> indique qu'un \u00E9l\u00E9ment est supprim\u00E9 du fichier.</br>\n<i class=\"create fa fa-plus-square fa-color-expand\"></i> indique qu'un \u00E9l\u00E9ment ou un bloc peut \u00EAtre ajout\u00E9 au fichier. Il sera valid\u00E9 ou non en utilisant les icones pr\u00E9c\u00E9dentes.</br>\n<i class=\"hidebutton fa fa-size2 fa-star-half-o fa-color-toggle\"></i> permet de montrer ou cacher une partie du fichier.</br>\n</br>\nPour toute information, aller sur <a href=\"http://ct3.ortolang.fr/teimeta/readme.php\" target=\"_blank\">http://ct3.ortolang.fr/teimeta/readme.php</a><br/>\nPour t\u00E9l\u00E9charger ce logiciel, aller sur <a href=\"https://github.com/christopheparisse/teimeta\" target=\"_blank\">https://github.com/christopheparisse/teimeta</a><br/>\nPour signaler une erreur ou proposer une fonctionnalit\u00E9, aller sur <a href=\"https://github.com/christopheparisse/teimeta/issues\" target=\"_blank\">https://github.com/christopheparisse/teimeta/issues</a><br/>\n";
    // system.alertUser(s);
    system.alertUser(s);
}
exports.about = about;
;
