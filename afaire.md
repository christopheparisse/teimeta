### En cours
* Validation automatique des éléments lorsqu’on les édite
* Validation automatique des éléments père lorsque l’on valide un fils
* Confirmation si dévalidation d’éléments 
* Intégration comme plugin dans un autre soft
* Unifier datatype dans nodes et attributs
* Widgets améliorés

## Notes précedentes

Fait: XML encoding limité

Voilà le nouveau fichier Odd avec les modifs balayées ensemble, j'en ai certainement oublié donc n'hésitez pas à compléter, si tu peux le basculer christophe on regardera ensemble lundi
La liste des modifs suit
Bises et bon week-end
Carole

A) remarques générales sur l'outil

1) OK- paramètre par défaut : sans affichage des balises TEI

2) OK- seuls les éléments fils à remplir  sont affichés par les pères : par ex TitleStmt n'apparaitra pas => vérifier ce que ça donne du coup dans textDesc avec channel, interaction, ...

3) seuls les attributs n'ayant pas une valeur figée sont affichés : par ex licence restricted ne sera pas affiché car c'est toujours restricted

4) pour les listes non fermées Christophe cherche un widget pour afficher l'option par défaut si elle existe et la possibilité d'ajouter un nouveau champ dans un choix "autre" sinon actuellement on ne voit pas qu'il s'agit d'une liste

==> du coup dans les listes, prévoir une valeur "inconnue" et une valeur "autre" avec qd autre choisi une bascule sur une saisie d'un nouveau choix

5) OK- remplacer le nom de l'élémentref aujourd'hui affiché et insipide comme idno/desc trop général/... par un titre qu'on donnerait dans le odd champ desc


B) modif de l'ordre des éléments

1) appinfo=infos actuellement sur TeiCorpo passe après transcriptionDesc qui contient :  nature des annotations/logiciel de transcription/anonymisation/convention de transcription


C) abandon de certaines rubriques pour alléger

1) abandonner projectdesc dans encodingDesc ==>  est-ce bien utile on a déjà une description courte dans title et une longue dans setting/activity , ce serait plutôt dans le module "Objet du corpus?"

2) abandonner interaction =nb de participants actifs/passifs à garder pour le module avancé locuteur

3) abandon de <p> dans <activity> dans <setting>


D) Divers

Ramener la liste des licences avec le bon sigle dans le champ licence plutôt qu'un texte libre, cf Ortolang

