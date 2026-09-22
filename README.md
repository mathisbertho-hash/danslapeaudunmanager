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
