/**
 * help.ts
 */

import * as system from './opensave';

export let version = '0.4.0 - 15-05-2017';

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
</br>
Pour toute information, aller sur <a href="http://ct3.ortolang.fr/teimeta/readme.php" target="_blank">http://ct3.ortolang.fr/teimeta/readme.php</a><br/>
Pour télécharger ce logiciel, aller sur <a href="https://github.com/christopheparisse/tei-meta" target="_blank">https://github.com/christopheparisse/tei-meta</a><br/>
Pour signaler une erreur ou proposer une fonctionnalité, aller sur <a href="https://github.com/christopheparisse/tei-meta/issues" target="_blank">https://github.com/christopheparisse/tei-meta/issues</a><br/>
`;
    // system.alertUser(s);
    system.alertUser(s);
};
