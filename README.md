# Site de résultats — Dans la peau d'un manager

## Mise en ligne (10 minutes, gratuit, aucune carte bancaire)

1. Crée un compte GitHub si tu n'en as pas (github.com, gratuit).
2. Crée un nouveau dépôt **public** (bouton vert "New repository"), par exemple `gruppetto-resultats`.
3. Dans ce dépôt, utilise "Add file → Upload files" et dépose **tout le contenu de ce dossier** (les fichiers `.html`, les dossiers `css/`, `js/`, `data/`).
4. Va dans **Settings → Pages** du dépôt. Dans "Build and deployment", choisis "Deploy from a branch", branche `main`, dossier `/ (root)`. Sauvegarde.
5. Au bout d'une à deux minutes, GitHub te donne une URL du type `https://ton-pseudo.github.io/gruppetto-resultats/` — c'est le lien à partager aux autres DS. Ils n'ont besoin d'aucun compte pour le consulter.

## Te donner les droits d'écriture (toi uniquement)

1. Sur GitHub : Settings (de ton compte, pas du dépôt) → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Limite-le à **ce seul dépôt** (`gruppetto-resultats`), permission **Contents: Read and write**, et donne-lui une durée de validité (ex. 1 an).
3. Copie le token généré (il ne sera plus jamais affiché).
4. Va sur `admin.html` de ton site, mot de passe : `tre-berg-1` (à changer, voir ci-dessous), renseigne ton pseudo GitHub, le nom du dépôt, la branche `main`, et colle le token. Clique "Enregistrer" puis "Tester la connexion".

## Changer le mot de passe admin

Ouvre `admin.html`, cherche la ligne `const ADMIN_PASSWORD = 'tre-berg-1';` tout en bas, et remplace la valeur par ton mot de passe. Recommande-toi de le faire avant de partager le lien du site.

**Important à savoir** : ce mot de passe protège seulement l'écran d'admin dans le navigateur — n'importe qui pourrait le contourner en lisant le code source de la page. La vraie protection contre les écritures non autorisées, c'est que **seul toi possèdes le token GitHub**. Ne partage jamais ce token, et ne le colle que dans `admin.html` sur ton propre navigateur.

## Sauvegarde / export

Le dossier `data/*.json` EST la sauvegarde complète du site : équipes, coureurs, effectifs, courses, résultats, barème. Comme il vit dans un dépôt Git, chaque écriture depuis l'admin crée un commit — tu as donc un historique complet et réversible (onglet "Commits" du dépôt sur GitHub). Pour une sauvegarde à part, télécharge simplement le dossier `data/` depuis GitHub ("Download ZIP" sur le dépôt) quand tu veux.

## Depuis la dernière version (3) — gros passage

### Data

- **Pas de vrais doublons** dans les référentiels (équipes, coureurs, effectifs) — vérifié, propre.
- **5 courses de la saison 0 mal étiquetées, corrigées sans perte de données.** Ce que tu prenais pour des doublons ne l'était pas : ce sont 10 courses différentes (coureurs 0% en commun entre chaque paire) qui ont récupéré le même nom/identifiant à l'import — sans doute le champ « nom de la course » pas remis à jour entre deux imports. J'ai séparé chaque paire en deux fiches distinctes : celle qui portait déjà le bon nom (Gent Wevelgem, Classique de Québec, GP Hageland, GP Matteotti, Chrono des Nations) reste inchangée ; l'autre a été isolée sous un nom provisoire « ⚠️ À renommer — podium : … ». **Il m'en faut le vrai nom** pour chacune (visible sur `courses.html`, filtre saison 0) :
  - `gent-wevelgem-saison-0-a-renommer-3lf7t` — podium Modeste / Onyshchenko / Górski
  - `classique-de-quebec-saison-0-a-renommer-32xsu` — podium Van Rensburg / Baptiste / Chaouchi
  - `gp-hageland-saison-0-a-renommer-bxhdd` — podium Lin / Van Rossem / Novosel
  - `gp-matteotti-saison-0-a-renommer-pf0ib` — podium Narine / Åkerlund / Harun
  - `chrono-des-nations-saison-0-a-renommer-sr2pg` — podium Ngauamo / Zhao / Ramli
- **Garde-fou ajouté dans l'admin** pour que ça ne se reproduise pas : impossible de créer une « nouvelle course » si son nom+saison existe déjà (il faut la sélectionner dans le menu existant) ; et si tu rattaches un résultat scratch/général/annexe à une course qui en a déjà un pour cette saison, l'admin demande confirmation avant d'enregistrer. Le bouton « Valider » se désactive aussi pendant l'enregistrement (évite les doubles clics).
- **Lecture des temps corrigée** : gérait mal les écarts en secondes seules (`+ 8`, `+ 45"`) et les temps absolus sans heure (CLM de moins d'une heure, ex. `45'12`). Testé et validé sur ces cas, sans régression sur le format complet (`5h48'44`).

### Équipes / managers — besoin de ta confirmation

Tu signales que CCC et Vinted sont en réalité **la même équipe** (renommée en cours de jeu), ce qui expliquerait un mauvais comptage. Je n'ai **pas fusionné automatiquement** — fusionner à tort ferait perdre la distinction entre deux vraies équipes si je me trompe. Dis-moi :
1. Est-ce uniquement CCC/Vinted, ou d'autres équipes de la liste des 26 sont dans le même cas (renommées en cours de route) ?
2. Pour chaque cas, quel est le nom à garder (le plus récent, j'imagine) ?
Dès que j'ai ta réponse, je fusionne proprement : un seul id d'équipe, tous les effectifs et résultats redirigés dessus, l'ancien nom gardé en historique sur la fiche.

### UX

- **Thème sombre** complet (fond quasi-noir, panneaux, tableaux, boutons), dans l'esprit de tes captures. Premier passage — dis-moi ce qui ne va pas encore.
- **Drapeaux** 🇫🇷 ajoutés à côté de la nationalité des coureurs (liste + fiche), à partir du fichier des 1000. Pas encore sur les équipes (le champ nationalité équipe est toujours vide, voir plus haut) ni sur les pays de course (le champ `pays` des courses n'est jamais rempli pour l'instant — dis-moi si tu veux qu'on l'ajoute à la création de course dans l'admin).
- **Pastilles de couleur par catégorie de course** (Monument, Grand Tour, WT, Conti, championnat national) sur la liste des courses et la fiche course.
- **Nouvelle page `resultat.html`** : classement complet d'un résultat (tous les coureurs classés, pas juste le vainqueur), avec équipe et nationalité de chacun. Accessible depuis chaque ligne « classement complet → » sur la fiche course.
- Maillots : pas encore fait, comme prévu « dans un temps 2 ».

## Depuis la dernière version (2)

- **Créer un coureur pas encore sous contrat, depuis l'import** : pour la saison 0 notamment, un coureur peut apparaître dans un résultat sans être dans `data/coureurs.json` (pas encore recruté). Sur une ligne non reconnue, l'admin propose maintenant, en plus du menu « associer à un coureur déjà créé », un champ texte avec autocomplétion sur les 1000 noms du fichier PCM (`data/pool_noms.json`, un simple référentiel de lookup, **pas** une liste de coureurs du jeu) et un bouton « + Créer ». La nationalité et l'ID PCM se remplissent automatiquement si le nom correspond à une entrée du fichier ; sinon le coureur est créé quand même, nationalité à compléter à la main plus tard. Ce coureur n'a pas d'équipe tant que tu ne lui crées pas d'entrée dans `data/effectifs.json` (à faire le jour où il signe).

## Depuis la dernière version

- **Profil de course** : nouveau champ `profil` sur les courses (plat / accidenté / montagne / CLM / pavés / mixte), renseignable à la création dans l'admin, affiché sur la fiche course.
- **Étapes reliées entre elles** : les résultats de type « étape » ont maintenant un numéro (`etapeNumero`). L'admin te le demande, te signale les étapes déjà enregistrées pour la course sélectionnée (pour repérer les doublons), et la fiche course affiche désormais un tableau « Étapes » trié par numéro, séparé du tableau des vainqueurs scratch/général.
- **Classements annexes** (points/montagne/jeune, version finale) ajoutés au menu déroulant de l'admin — ils étaient calculés par `points.js` mais impossibles à saisir jusqu'ici.
- Rappel sur le rattachement à une course : l'admin ne devine jamais silencieusement — il propose un nom détecté dans le texte collé, mais te demande toujours de confirmer ou choisir la bonne course existante avant d'enregistrer.

## Depuis la v1

- **Bug corrigé** : les effectifs par équipe étaient vides à cause d'un référentiel qui stockait le *nom* de l'équipe au lieu de son identifiant technique. C'est réparé — les 574 coureurs sont maintenant bien rattachés à leur équipe sur les fiches équipe.
- **Nom du site** changé en « Dans la peau d'un manager », sans référence à une équipe en particulier.
- **Saison 0 (pré-saison)** ajoutée aux référentiels (`data/saisons.json`, `preSaison: true`). Tu peux importer ses résultats depuis l'admin comme n'importe quelle saison : ils s'affichent sur les fiches coureur (badge « pré-saison ») mais sont exclus des classements officiels et du palmarès (victoires/podiums), comme demandé. Comme ces coureurs jouaient sous des équipes PCM aléatoires, ne crée pas d'effectif daté pour la saison 0 — le classement par équipes ignorera simplement ces lignes (déjà géré).
- **Identifiants PCM et nationalité des coureurs** ajoutés à `data/coureurs.json` (champs `pcm_id`, `nationalite_code`, `nationalite`) à partir de `Pays_pour_créations_de_noms.xlsx`. Recoupement à **574/574 coureurs (100%)** grâce à un rapprochement par lettres qui ignore la façon dont le fichier découpe prénom/nom (utile pour les noms composés comme « Van Rensburg »). Affiché sur les fiches coureur et dans la liste des coureurs.
- **Nationalité des équipes** : champ `nationalite` ajouté à `data/equipes.json`, affiché sur les fiches et la liste des équipes — mais **vide pour l'instant, je n'ai pas cette donnée**. Le tableau des managers que tu m'as donné avait bien une colonne « Nationalité » mais elle était vide pour toutes les lignes. Renvoie-la moi remplie et je l'intègre.
- **Âge des coureurs** : champ `age` ajouté, toujours vide — le fichier Excel ne contient pas l'âge, il te faut m'envoyer un autre fichier pour ça.

## Fichiers modifiés depuis ta dernière mise à jour du repo

À remplacer dans ton dépôt GitHub (les autres fichiers n'ont pas changé) :

- `index.html`
- `coureurs.html`
- `coureur.html`
- `equipes.html`
- `equipe.html`
- `classements.html`
- `courses.html`
- `course.html`
- `admin.html`
- `README.md`
- `js/nav.js`
- `data/effectifs.json`
- `data/saisons.json`
- `data/coureurs.json`
- `data/equipes.json`
- `data/pays.json` *(nouveau fichier)*

## Où en est cette v1

Déjà là :
- Référentiels : 26 équipes (avec manager forum et lien de maillot), 574 coureurs, effectifs saison 1.
- Import de texte copié-collé avec aperçu, résolution des temps (absolu / écart / même temps), et rapprochement des noms au référentiel (signalement des noms non reconnus pour association manuelle).
- Classement individuel et par équipes, aux points et aux victoires, filtrable par saison et catégorie.
- Fiches coureur, équipe et course avec palmarès.
- Barème éditable (actuellement vide — colle le barème fourni par l'organisateur dans l'admin dès que tu l'as).

À itérer ensuite (comme prévu dans le brief) :
- Import CSV/Excel depuis PCM.
- Classements annexes des courses par étapes (points, montagne, jeune) et maillots portés.
- Filtrage par période de la saison.
- Édition des effectifs et création de coureurs/équipes directement depuis l'admin (pour l'instant, modifie `data/*.json` à la main sur GitHub ou demande-moi de le faire).
- Gel des saisons clôturées (le champ `statut` existe déjà dans `data/saisons.json`, la logique de gel reste à écrire).
