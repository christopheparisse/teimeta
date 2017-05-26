# tei-meta-edit

**Outil d'édition de champs xml dans un fichier xml à partir d'une description odd**

## Accès à l'outil
Utilisation en ligne: [http://ct3.ortolang.fr/teimeta/](http://ct3.ortolang.fr/teimeta/)

Téléchargement application autonome pour MacOs: [http://ct3.ortolang.fr/download/tei-meta-v0.4.0-macos.zip](http://ct3.ortolang.fr/download/tei-meta-v0.4.0-macos.zip)

Téléchargement application windows 64 bits: [http://ct3.ortolang.fr/download/tei-meta-x64.exe](http://ct3.ortolang.fr/download/tei-meta-v0.4.0-x64.exe)

## Description générale

L'outil est conçu pour une utilisation TEI mais peut être utilsé pour d'autres fichiers XML.
Dans ce cas il faut éditer un fichier ayant un namespace correct ou modifier le namespace du fichier final à la main.
L'édition du namespace destination n'est pas encore implémentée.

L'outil permet d'éditer un noeud XML où qu'il soit mais pas de le déplacer.
Tout noeud édité garde sa position. Un noeud inexistant peut être créé, mais selon la position décrite dans l'ODD.
L'ODD doit décrire toute l'arborescence depuis la racine.
Les valeurs d'un fichier XML non décrites dans l'ODD ne doivent pas être modifiées.
Les valeurs décrites pevuent être créées, modifiées et vidées. La suppression est possible en désactivant les noeuds non-obligatoires.
Il est possible en option (pas encore implémentée d'autoriser la suppression des noeuds obligatoires).

Les fonctions d'édition principales sont:
-  création d'un noeud (si on y ajoute une valeur)
- édition du champ texte d'un noeud avec un format
  - texte libre
  - vocabulaire
  - nombre (à faire)
  - date (à faire)
- édition d'un des attributs d'un noeud avec un format
  - texte libre
  - vocabulaire
  - nombre (à faire)
  - date (à faire)

## Edition de l'ODD et exemples XML

L'ODD respecte le format de la TEI prévu pour ajouter des tags à la TEI.
On utilise les champs desc pour fournir des informations.
Les champs corresp, rend et rendition ont une fonctionnalité supplémentaire par rapport à la TEI pour notre implémentation.
Les autres champs respectent complétement le format TEI.

### Format de description des noeuds XML

Le contenu du ODD consiste en des éléments elementSpec qui peuvent référencer d'autres éléments avec elementRef.
Les moduleRef ne sont pas utilisés pour l'instant: ils sont là pour les autres usages des ODD.

  * schemaSpec
    * start = racine du fichier xml résultat
    * ns = namespace pour le fichier xml résultat

  * elementSpec
    * ident="nom du tag dans la TEI" corresp="tag optionel à utiliser si ident n'est pas unique"
    * desc: multilingue possible voir champ xml:lang
    * content: contenu du noeud y compris partie texte
    * attList: listes des attributs

  * content
    * sequence minOccurs maxOccurs (s'il y a plus d'un élément)
      * elementRef key="nom du tag dans la TEI" corresp="tag optionel à utiliser si ident n'est pas unique"
      * elementRef key=...
      * elementRef minOccurs maxOccurs (min et max sont optionels: omis ils valent 1)
    * textNode
      * dataRef : pour indiquer le format du noeud (à la place de textNode)
      * integer decimal NCName string duration anyURI data - si rien pas de contrôle de format exemple titre
      * valList : si le node ne peut prendre que certaines valeurs prédéfinies

  * attList
    * attDef ident="attribut-dans-TEI" rend="valeur par défaut de l'attribut dans les valeurs de la liste" usage="rec ou req"
      * desc (multilingue)
      * desc = nom de la rubrique pour les sections, les élements à saisir, pour les valList =bulle d'aide
    * datatype
      * dataRef : format de l'attribut
      * ... ou sinon une liste de valeurs: si une seule pas de choix valeur obigatoire
    * valList ==> choix multiples type ascenseur
      * valItem ident="valeur-dans-TEI"
      * desc (multilingue) + rendition (champ aide optionel ? - emplacement à affiner)

#### Exemple

```
<elementSpec ident="tag_TEI" module="header"
    corresp="nom_pour_identification_unique">
    <desc xml:lang="fr">... en français ... - partie affichée pour décrire
        l'élément</desc>
    <desc xml:lang="en">... en anglais ...</desc>
    <content>
        <sequence minOccurs="0" maxOccurs="unbounded">
            <elementRef key="sous_tag_1"
                corresp="autre_nom_pour_identification_unique"/>
            <elementRef key="sous_tag_2"/>
        </sequence>
        <elementRef key="idno" corresp="handle" minOccurs="1" maxOccurs="unbounded"/>
        <textNode/>
        <dataRef name="NCName"/>
    </content>
    <attList>
        <attDef ident="mimeType" usage="req" mode="change">
            <valList type="closed">
                <valItem ident="audio/wav"/>
                <valItem ident="audio/mp3"/>
                <valItem ident="other"/>
            </valList>
        </attDef>
        <attDef ident="dur-iso" usage="req" mode="change">
            <desc xml:lang="fr">durée du média : chaque medias peut avoir une durée
                différente</desc>
            <desc xml:lang="en">media duration : each media could have a different
                duration </desc>
            <datatype>
                <dataRef name="duration"/>
            </datatype>
        </attDef>
    </attList>
</elementSpec>
```

## Utilisation

### Version Page Html (fonctionnelle)

Le soft comprend une page html autonome pouvant être utilisée localement ou à distance.
Il est possible de charger un ODD local et un XML local
La sauvegarde se fait dans le répertoire de téléchargement (ou ailleurs selon les paramètres du navigateur web).

```
npm run page
# creation d'un sous-répertoire temp-page
$ open temp-page/teimeta.html
```

### Version application indépendante

#### Application TEIMETA

Le soft est intégré à Electron. Il présente les mêmes fonctionnalités que la version page html, mais peut être lancé
depuis le gestionnaire de fichiers ou d'application, et être associé à une extension de programme. Possibilité d'avoir un menu
fichiers récents et une vraie sauvegarde.

```
npm run electron
# creation d'un sous-répertoire temp-electron
npm start
```

#### Utilisation en librairie dans un soft
Inclure le repertoire teimeta/*.ts
Toutes les instructions pour l'utilisation sont à la fin du fichier tei.ts

##### AEEC et TRJS (pas encore implémentés)
Le soft est intégré à l'outil AEEC et l'outil TRJS. Il est possible d'éditer un des fichiers listé dans la base.

Note: Il pourrait être intéressant d'éditer une série de fichiers d'un coup. Par exemple on pourrait créer un fichier XML et
fusionner le résultat avec un fichier XML quelconque pour modifier d'un coup une série de fichiers.

```
# utiliser la librairie dans une autre application.
import * from 'teimeta/tei'
... innerHTML = openODD(dataOdd)
... innerHTML = openODDTEI(dataTei, dataOdd)
... insérer innerHTML dans un éléement du navigateur
... generateTEI(innerHTML)
```

## Informations complémentaires
Téléchargement du code source: [https://github.com/christopheparisse/tei-meta/](https://github.com/christopheparisse/tei-meta/)

Signaler erreurs et commentaires dans [issues](https://github.com/christopheparisse/tei-meta/issues).

#### License [CC0 (Public Domain)](LICENSE.md)
