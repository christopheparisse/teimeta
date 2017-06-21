/**
 * help.ts
 */

import * as system from './opensave';

export let version = '0.4.1 - 22-06-2017';

export function about() {
    var s = "Version prototype de TEIMETA javascript : " + version + "</br></br>";
    s += `
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
Pour télécharger ce logiciel, aller sur <a href="https://github.com/christopheparisse/tei-meta" target="_blank">https://github.com/christopheparisse/tei-meta</a><br/>
Pour signaler une erreur ou proposer une fonctionnalité, aller sur <a href="https://github.com/christopheparisse/tei-meta/issues" target="_blank">https://github.com/christopheparisse/tei-meta/issues</a><br/>
`;
    // system.alertUser(s);
    system.alertUser(s);
};
