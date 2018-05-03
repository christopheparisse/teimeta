# teimeta-edit

**An editor (generated automatically from a ODD description) for subparts of a XML file**

## Downloading or using the tool

Online use: [http://ct3.ortolang.fr/teimeta/](http://ct3.ortolang.fr/teimeta/)

Downloading the tool for MacOs: [http://ct3.ortolang.fr/download/teimeta-macos.zip](http://ct3.ortolang.fr/download/teimeta-macos.zip)

Downloading the tool for windows 64: [http://ct3.ortolang.fr/download/teimeta-x64.exe](http://ct3.ortolang.fr/download/teimeta-x64.exe)

Downloading the tool for windows 32: [http://ct3.ortolang.fr/download/teimeta-x86.exe](http://ct3.ortolang.fr/download/teimeta-x86.exe)

## Description

TEIMETA is a tool for editing XML files. The editing structure, possibilies, and information are described in an XML ODD TEI file. TEIMETA uses this description (the model) to produce automatically a user interface in a webbrowser or an independant Electron application.

The tool was created to edit TEI files, but it can be used for any type of XML format. XML schema control is not implemented. The quality of the final format is automatically controled by the description (the model) but the quality of the model is not (yet) controlled by TEIMETA.

TEIMETA allows to edit any XML node but not to move this node around in the XML file. New nodes can be created and nodes can be erased (if this is allowed by the model). The ODD describes node position from the root. **The values of an XML node not described in the ODD file will never be modified. This means that it is possible to edit parts of an XML file respecting the integrity of the rest of the file.**

## Version information
0.5.0 - 2 may 2018 - ODD files can describe the visual presentation of the data edited using CSS features.
0.4.9 - feb 2018 - correction of bugs and namespace implementation

## Organization of the data

The main editing features are:
- creating a node, adding node to other nodes
- editing a node with a specific format
  - free text
  - vocabulary (open or closed)
  - number
  - date
  - duration
- editing attributes from a node with a format
  - free text
  - vocabulary (open or closed)
  - number
  - date
  - duration

## Editing the ODD and XML examples

The ODD is using the TEI support for inserting tags into the TEI. Actually, we don't do that but
we use desc field to provide rich information that will be provided to the user when editing data.
The corresp, rend et rendition have a different fonctionnaly than in the TEI. They allow to describe
the control of the data edited by TEIMETA. This is also the case for the remarks tag which is used
to describe the visual presentation of the data to be edited. The other fields follow the TEI guidelines.

### Description format for the XML nodes

The ODD is made of elementSpec elements that can refer (using elementRef) to other elements of the same type. Each elementSpec contains the description of the node content, attributes, and pointer to descendants.
moduleRef are not used.

  * schemaSpec
    * start = root for the result xml
    * ns = namespace for the result xml

  * elementSpec
    * ident="name of the tag in the TEI" corresp="optional tag to be used when ident is not unique"
    * desc: multilingual description (see xml:lang)
    * content: content of the node, subelement and text node
    * attList: list of the attributes
    * remarks: CSS presentation of an elementSpec and/or the content field

  * content
    * sequence minOccurs maxOccurs (if there is more than one element)
      * elementRef key="name of the tag in the TEI" corresp="optional tag to be used when ident is not unique"
      * elementRef minOccurs maxOccurs (min and max are optionals: if omitted their value is 1)
    * textNode
      * dataRef : to be indicate the format of the node (instead of text)
      * integer decimal NCName string duration anyURI data open closed - if nothing, then no format control
      * valList : to be used if the node can take a series of values

  * attList
    * attDef ident="attribute-in-the-TEI" rend="default value of the attribute" usage="rec or req"
      * desc (multilingual)
      * desc = name of the section, information for the user
    * datatype
      * dataRef : format of the attribute
      * ... or a list of values: if only one they this is the default value
      * remarks: CSS presentation of the datatype editing field
    * valList ==> multiple choices presented to the user
      * valItem ident="value-in-the-TEI"
      * desc (multilingue) + rendition (optional help)

#### Example

```
<elementSpec ident="tag_TEI" module="header"
    corresp="name_for_a_unique_identification">
    <desc xml:lang="fr">... in French ... - partie affichée pour décrire
        l'élément</desc>
    <desc xml:lang="en">... in English ... - information for the user</desc>
    <content>
        <sequence minOccurs="0" maxOccurs="unbounded">
            <elementRef key="sub_tag_1"
                corresp="another_name_for_unique_identification"/>
            <elementRef key="sub_tag_2"/>
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
            <!-- this will display the current attribute (mimeType) as it is described in the <ab> field -->
            <remarks>
                <ab>color:red; width: 400px;</ab>
            </remarks>
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
    <!-- this will display the elementSpec block as it is described in the <ab> field -->
    <remarks style="element">
        <ab>background-color: lightgreen; border-radius: 8px; margin: 3px; margin-top: 10px;</ab>
    </remarks>
    <!-- this will display the texnode/datatype in the content part as it is described in the <ab> field -->
    <remarks style="content">
        <ab>color: blue; width: 500px;</ab>
    </remarks>
</elementSpec>
```

## Use

### HTML Page Version (implemented)

Le soft comprend une page html autonome pouvant être utilisée localement ou à distance.
Il est possible de charger un ODD local et un XML local
La sauvegarde se fait dans le répertoire de téléchargement (ou ailleurs selon les paramètres du navigateur web).

```
npm run page
# creation d'un sous-répertoire temp-page
$ open temp-page/teimeta.html
```

### Stand Alone Version (implemented)

####  TEIMETA Application

The soft is integrated within Electron. It has the same functionnalities as the Html version. It can be started as a classical software.

```
npm run electron
# creating a sub-directory temp-electron
npm start
```

#### Use as a library in another software
Include directory teimeta/*.ts
Instructions are within tei.ts file

```
# use the library in another application.
import * from 'teimeta/tei'
... innerHTML = openODD(dataOdd)
... innerHTML = openODDTEI(dataTei, dataOdd)
... insert innerHTML in an HTML element
... generateTEI(innerHTML)
```

## Other information
Download source code: [https://github.com/christopheparisse/teimeta/](https://github.com/christopheparisse/teimeta/)

Issues, questions and comments [issues](https://github.com/christopheparisse/teimeta/issues).

#### License [CC0 (Public Domain)](LICENSE.md)

# teimeta-edit

**Outil d'édition de champs xml dans un fichier xml à partir d'une description odd**

## Accès à l'outil
Utilisation en ligne: [http://ct3.ortolang.fr/teimeta/](http://ct3.ortolang.fr/teimeta/)

Téléchargement application autonome pour MacOs: [http://ct3.ortolang.fr/download/teimeta-macos.zip](http://ct3.ortolang.fr/download/teimeta-macos.zip)

Téléchargement application windows 64 bits: [http://ct3.ortolang.fr/download/teimeta-x64.exe](http://ct3.ortolang.fr/download/teimeta-x64.exe)

Téléchargement application windows 32 bits: [http://ct3.ortolang.fr/download/teimeta-x86.exe](http://ct3.ortolang.fr/download/teimeta-x86.exe)

## Description générale

TEIMETA est un outil qui permet d'éditer des fichiers XML à partir d'une description, elle-même au format XML ODD de la TEI. A partir de cette description, TEIMETA produit automatiquement une interface utilisateur qui prend place dans un navigateur web ou dans une application indépendante ELECTRON.

L'outil est conçu pour une utilisation TEI mais peut être utilsé pour d'autres fichiers XML.
La vérification du schéma XML n'est pas implémentée non plus. Liberté est laissé à l'utilisateur de traiter cette partie. Le programme TEIMETA garantit que les fichiers créés seront conformes aux modèles conçus par les utilisateurs mais ne garantit pas la qualité de ces modèles produits par des utilisateurs avancés.

L'outil permet d'éditer un noeud XML où qu'il soit mais pas de le déplacer.
Tout noeud édité garde sa position. Un noeud inexistant peut être créé, mais selon la position décrite dans l'ODD.
L'ODD doit décrire toute l'arborescence depuis la racine. **Les valeurs d'un fichier XML non décrites dans l'ODD ne sont pas modifiées lors de l'édition du fichier XML par TEIMETA. TEIMETA permet donc d'éditer une partie d'un fichier XML en respectant l'intégrité du reste du fichier.** Les valeurs décrites pevuent être créées, modifiées et vidées. La suppression est possible en désactivant les noeuds non-obligatoires. Il est possible en option (pas encore implémentée d'autoriser la suppression des noeuds obligatoires).

## Versions disponibles
0.5.0 - 2 mai 2018 - version permettant une présentation visuelle à façon en éditant les fichiers ODD
0.4.9 - février 2018 - correction de bugs, implémentation des namespaces dans les fichiers résultats

## Organisation des données

Les fonctions d'édition principales sont:
-  création d'un noeud (si on y ajoute une valeur)
- édition du champ texte d'un noeud avec un format
  - texte libre
  - vocabulaire ouvert ou fermé
  - nombre
  - date
- édition d'un des attributs d'un noeud avec un format
  - texte libre
  - vocabulaire ouvert ou fermé
  - nombre
  - date

## Edition de l'ODD et exemples XML

L'ODD respecte le format de la TEI prévu pour ajouter des tags à la TEI.
On utilise les champs desc *pour fournir des informations qui seront visibles dans l'outil d'édition*.
Les champs corresp, rend et rendition ont une fonctionnalité supplémentaire par rapport à la TEI pour notre implémentation. Le champ remarks permet d'insérer des informations de présentation visuelle (de type CSS).
Les autres champs respectent le format TEI.

### Description format for the XML nodes

The ODD is made of elementSpec elements that can refer to other elements of the same type. Each elementSpec contains the description of the node content, attributes, and pointer to descendants.
qui peuvent référencer d'autres éléments avec .
Les moduleRef ne sont pas utilisés pour l'instant: ils sont là pour les autres usages des ODD.

  * schemaSpec
    * start = racine du fichier xml résultat
    * ns = namespace pour le fichier xml résultat

  * elementSpec
    * ident="nom du tag dans la TEI" corresp="tag optionel à utiliser si ident n'est pas unique"
    * desc: multilingue possible voir champ xml:lang
    * content: contenu du noeud y compris partie texte
    * attList: listes des attributs
    * remarks: valeurs de présentation CSS d'un elementSpec et/ou de son champ content

  * content
    * sequence minOccurs maxOccurs (s'il y a plus d'un élément)
      * elementRef key="nom du tag dans la TEI" corresp="tag optionel à utiliser si ident n'est pas unique"
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
      * remarks: valeurs de présentation CSS d'un champ d'édition datatype
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
            <!-- this will display the current attribute (mimeType) as it is described in the <ab> field -->
            <remarks>
                <ab>color:red; width: 400px;</ab>
            </remarks>
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
    <!-- this will display the elementSpec block as it is described in the <ab> field -->
    <remarks style="element">
        <ab>background-color: lightgreen; border-radius: 8px; margin: 3px; margin-top: 10px;</ab>
    </remarks>
    <!-- this will display the texnode/datatype in the content part as it is described in the <ab> field -->
    <remarks style="content">
        <ab>color: blue; width: 500px;</ab>
    </remarks>
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

```
# utiliser la librairie dans une autre application.
import * from 'teimeta/tei'
... innerHTML = openODD(dataOdd)
... innerHTML = openODDTEI(dataTei, dataOdd)
... insérer innerHTML dans un éléement du navigateur
... generateTEI(innerHTML)
```

##### AEEC et TRJS (pas encore implémentés)
Le soft est intégré à l'outil AEEC et l'outil TRJS. Il est possible d'éditer un des fichiers listé dans la base.

Note: Il pourrait être intéressant d'éditer une série de fichiers d'un coup. Par exemple on pourrait créer un fichier XML et fusionner le résultat avec un fichier XML quelconque pour modifier d'un coup une série de fichiers.

## Informations complémentaires
Téléchargement du code source: [https://github.com/christopheparisse/teimeta/](https://github.com/christopheparisse/teimeta/)

Signaler erreurs et commentaires dans [issues](https://github.com/christopheparisse/teimeta/issues).

#### License [CC0 (Public Domain)](LICENSE.md)
