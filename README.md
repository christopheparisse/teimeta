# tei-meta-edit

**Outil d'édition de champs xml dans un fichier xml à partir d'une description odd**

## Description générale

L'outil est conçu pour une utilisation TEI mais peut être étendu à d'autres fichiers XML 
à condition de gérer correctement les namespaces

L'outil permet d'éditer un noeud XML où qu'il soit mais pas de le déplacer.
Tout noeud édité garde sa position absolue. Un noeud inexistant peut être crée, mais dans une position absolue.
Toute l'arborescence sous un noeud peut être éditée si elle est décrite comme telle dans l'ODD.
Les valeurs d'un fichier XML non décrites dans l'ODD ne doivent pas être modifiées.
Les valeurs décrites pevuent être créées, modifiées et vidées (la suppression n'est pas possible 
s'il y a des enfants à un noeud pour respecter la conservation des éléments existants non-décrits).

Les fonctions d'édition principales sont:
-  création d'un noeud (si on y ajoute une valeur)
- édition du champ texte d'un noeud avec un format
  - texte libre
  - vocabulaire
  - nombre?
  - date?
- édition d'un des attributs d'un noeud avec un format
  - texte libre
  - vocabulaire
  - nombre?
  - date?

## Edition de l'ODD et exemples XML

### Format de description des noeuds XML

#### Format des "racines" et "arborenscence"

Seuls les éléments obligatoires sont listés. Les autres éléments sont ignorés.

```
<elementSpec ident="nom_du_noeud" mode="replace/change/add" predeclare="/emplacement_du_noeud" ana="mode_d_edition/none/text/number/date">
    <desc>
        Texte de description du noeud
    </desc>
    <content>
        <element name="nom_du_sous_noeud" usage="req/vide">
            <content>
                ... structure récursive sur le tag "content" ...
            </content>
        </element>
        <one>
            ... même chose que élément seul ...
            ... le champ doit être présent et est le seul qui existe ...
        </one>
        <oneOrMore>
            ... le champ doit être présent et il peut y en avoir d'autres ...
        </oneOrMore>
        <zeroOrMore>
            ... le champ n'est pas obligatoire et il peut en avoir pluieurs ...
        </zeroOrMore>
    </content>
</elementSpec>
```

#### Format des "éléments"

Seuls les éléments obligatoires sont listés. Les autres éléments sont ignorés.

```
<element name="nom_du_noeud" usage="req/vide" ana="mode_d_edition/list/none/text/number/date">
    <desc>
        Texte de description du noeud
    </desc>
    ... si category choix dans cette liste ...
    <category>
        <catDesc xml:lang="fr">nom_en_francais</catDesc>
        <catDesc xml:lang="en">nom_en_anglais</catDesc>
    </category>
    ... répétition d'autant de catégories que nécessaire
    <attList>
        <attDef ident="nom_attribut" usage="req/vide" mode="change" value="valeur obligatoire" ana="mode_d_edition/list/none/text/number/date">
            ... si valList choix des valeurs du vocabulaire ...
            <valList type="nom_du_type" mode="replace">
                <valItem ident="id_a_mettre_dans_fichier_TEI">
                    <desc>Description du champ à coder</desc>
                </valItem>
                ... autres valitems ...
            </valList>
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
$ open teimeta.html
```

### Version application indépendante (pas encore implémentée)

#### Application TEIMETA

Le soft est intégré à Electron. Il présente les mêmes fonctionnalités que la version page html, mais peut être lancé
depuis le gestionnaire de fichiers ou d'application, et être associé à une extension de programme. Possibilité d'avoir un menu 
fichiers récents et une vraie sauvegarde.

```
npm run app
# utiliser la librairie dans une autre application.
```

#### AEEC
Le soft est intégré à l'outil AEEC. Il est possible d'éditer un des fichiers listé dans la base.

Note: Il pourrait être intéressant d'éditer une série de fichiers d'un coup. Par exemple on pourrait créer un fichier XML et 
fusionner le résultat avec un fichier XML quelconque pour modifier d'un coup une série de fichiers.

```
npm run lib
# utiliser la librairie dans une autre application.
```

## Informations complémentaires
Signaler erreurs et commentaires dans [issues](http://christopheparisse/tei-meta/issues/).
Voir aussi [documentation](http://christopheparisse/tei-meta/wiki/).

#### License [CC0 (Public Domain)](LICENSE.md)
