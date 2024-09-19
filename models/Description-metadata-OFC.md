# Descriptions des métadonnées de niveau 0 pour l'Open French Corpus (OFC)

## 1- Titre
	teiHeader/fileDesc/titleStmt/title
	teiHeader/fileDesc/titleStmt/title/desc

## 2- Responsable corpus
	teiHeader/fileDesc/titleStmt/respStmt/resp
		resp.annotator
		resp.compiler
		resp.interviewer
		resp.recorder
		resp.transcriber
		resp.translator
		resp.data_inputter
		resp.OTHER

	teiHeader/fileDesc/titleStmt/respStmt/name
	teiHeader/fileDesc/titleStmt/respStmt/name#type
		name.organism
		name.project
		name.person
		name.other

## 3- Identifiant, URL, ...
	teiHeader/fileDesc/publicationStmt/pubPlace
		nom du dépot
	teiHeader/fileDesc/publicationStmt/pubPlace/ref
		url description
	teiHeader/fileDesc/publicationStmt/pubPlace/ref#target
		url exact

## 4- Date de production (publication ?)
	teiHeader/fileDesc/publicationStmt/date
		date écrite
	teiHeader/fileDesc/publicationStmt/date#when-iso
		date normalisée

## 5- Mode
	teiHeader/fileDesc/profileDesc/textDesc/channel#mode
		mode.audio
		mode.video
		mode.written
		mode.multimodal
		mode.CMC
		mode.unknown
	teiHeader/fileDesc/profileDesc/textDesc/channel#submode
		submode.recording
		submode.radio
		submode.phone
		submode.tv
		submode.visioconf
		submode.print
		submode.poster
		submode.poster.other
		submode.poster.graffiti
		submode.poster.tag
		submode.handwritten
		submode.keyboard
		submode.unknown

### 5-1 Sources
	teiHeader/fileDesc/sourceDesc/recordingStmt/recording
		- corpus
		- image
		- audio
		- video
		- autre
			par exemple capture de mouvements, capture de clavier, etc.

## 6- Scripteur - locuteur - producteur?
	teiHeader/fileDesc/profileDesc/textDesc/channel

## 7- Domaine
	teiHeader/fileDesc/profileDesc/textDesc/domain

		administratif
		professionnel
		presse
		institutionnel
		juridique
		politique
		écrits scolaires
		professionnel
		privé
		scientifique
		littéraire
		autre

		acte de la pratique
		didactique
		historique
		juridique
		littéraire
		politique
		religieux

		artistique
		didactique

## 8- Genre
	teiHeader/fileDesc/profileDesc/textClass/catRef

### Comptes rendus de séance
### Textes simplifiés
### Presse
	article, interview...?
### Rapports
	rapport  d'auto-évaluation HCERES 
	compte rendu de séance (verbatim)
### Ecrits scolaires
### Interactions orales
	entretien
	réunion
	conversation
	cours
	histoire
	conversation
	transaction
	repas
	jeu 
### textes scientifiques
### Interactions écrites
	Forum, Twitch, Discussion Wikipédia, Blog...
### Français médiéval
	bestiaire
	biographie
	cérémonial
	charte
	chronique
	commentaire
	comput
	coutumier
	débat
	dialogue
	divers
	dramatique
	encyclopédie
	épique
	hagiographie
	hagographie
	histoire
	journal
	lapidaire
	lettre
	lois
	lyrique
	manuel
	mémoires
	miracle
	monologue
	nouvelle
	plaid
	poème
	poème narratif
	précepte
	proposition
	psautier
	recette
	récit bref
	récit de voyage
	registre
	règle
	répertoire
	roman
	serment
	sermon
	traite
	traité
	vidimus
### Retranscription
### Textes juridiques

## 9- Thèmes
	teiHeader/fileDesc/profileDesc/textClass/keywords
		vie universitaire
		ville d'Orléans
		travail
		vie quotidienne
		prose

## 10- Language
	teiHeader/fileDesc/profileDesc/langUsage

## 11- Place
	teiHeader/fileDesc/profileDesc/settingDesc	
