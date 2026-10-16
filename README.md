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

## Depuis la dernière version — calendrier, catégories, Coupes

- **Calendrier complet de la saison 1** : les 77 courses de l'année (janvier → octobre, dont les 3 Grands Tours, les Monuments, les championnats nationaux et du monde) sont importées dans `data/courses.json` (nom, pays, dates, profil, nombre d'étapes, coupe(s) éventuelle(s)).
- **Catégories retravaillées** pour correspondre à la vraie colonne « classification » du calendrier : Grand Tour, Legend Tour, World Tour, World Classic, Tour national, Classique nationale, Championnat national, Championnat du monde (+ Course test, réservée à la saison 0). L'ancien schéma (monument / cpe-wt / classique-conti…) a été remplacé — `data/bareme.json` a été réorganisé avec les mêmes clés, et comme le barème était encore entièrement vide, aucune donnée n'a été perdue dans l'opération.
- **Système de Coupes** ajouté : Coupe du Monde + 4 coupes nationales (Italie, Espagne, France, Belgique), chacune avec son propre barème (`data/bareme.json → coupe`). Chaque course du calendrier porte désormais un champ `coupes` listant les coupes auxquelles elle compte. Nouvelles pages `coupes.html` (liste) et `coupe.html?id=...` (classement individuel/équipes d'une coupe, par saison). Le barème des coupes est vide pour l'instant — colle-le dans l'admin (à ajouter à l'écran barème) ou dis-moi les valeurs et je les intègre directement dans `data/bareme.json`.
- **Historique par saison** sur la fiche coureur : pour chaque saison officielle où le coureur a couru, son rang (et ses points) au classement général de la saison, et son rang dans chaque coupe où il a marqué des points, avec lien vers la coupe correspondante.
- **Admin** : la création manuelle d'une course propose maintenant un choix de coupe(s) (cases à cocher) et l'option de profil « Semi-pavé », pour rester cohérent avec les courses importées du calendrier.
- **Page classement complet d'une course** (`resultat.html?id=...`) et badges de coupe sur `course.html`/`courses.html` (déjà en place depuis le tour précédent, listés ici pour mémoire du lot de fichiers à recopier).

## Nouveau calendrier (v. 14 octobre) — Espoirs et Juniors

- **Calendrier remplacé** par `Calendrier_1.xlsx` : 101 courses saison 1 (contre 77), dont 24 nouvelles épreuves Espoirs/Juniors. Changements sur les courses existantes : le **GP du Luxembourg devient le Tour de Russie** (mêmes dates), le **Classic du Mercantour passe en World Classic**, et les championnats reprennent les noms exacts du calendrier (« CN ITT », « CN Ligne », « Championnats du Monde CLM / en Ligne »).
- **3 nouvelles catégories** : Tour Espoirs (`Dev Tour`), Classique Espoirs (`Dev Classic`) et Juniors. Chaque catégorie porte maintenant un champ `circuit` (`pro`, `espoirs`, `juniors`).
- **Classements par circuit** : la page Classements (et l'accueil) affiche par défaut le **circuit Pro** uniquement ; un sélecteur permet de voir Espoirs, Juniors ou tous les circuits. Les catégories proposées s'adaptent au circuit choisi, la liste des courses les groupe par circuit.
- **Fiche coureur** : l'historique par saison indique le rang Pro, et ajoute une ligne Espoirs / Juniors si le coureur y a marqué des points.
- **Barème** : emplacements vides ajoutés pour `dev-classic`, `dev-tour` et `juniors` (scratch/général, et étape pour les tours). À remplir comme les autres.
- **Lien PCMMOD** : la colonne du calendrier est conservée (`lienPcmmod`) et affichée sur la fiche course quand elle est renseignée.

## Barèmes, primes et refonte des classements (16 octobre)

- **Barèmes importés** depuis `Barèmes.xlsx` dans `data/bareme.json` : pour chaque place, `{ "pts": …, "prime": … }`. Un tour utilise le tableau **Étapes** (`etape`) pour chaque étape et le tableau **Général** (`individuel_scratch`) pour le classement final ; les deux se cumulent. Aucun barème pour les championnats ni les classements annexes : 0 point, 0 prime.
- **Espoirs / Juniors** : ils empruntent le barème National Classic (course en un jour) ou National Tour (par étapes), **sans prime** — réglable dans `bareme.json` (`alias_categories`, `sans_prime`).
- **Classements** (page unique, 3 circuits) :
  - *Pro* : global, World Tour (Grand Tour + World Tour + World Classic + Legend Tour), Continental (National Tour + National Classic), victoires, primes — en individuel ou par équipes.
  - *Espoirs* : global, individuel ou par équipes. *Juniors* : global, individuel ou par pays (nationalité du coureur).
  - Filtres : saison, pays, équipe, recherche par nom. Le rang affiché reste celui du classement complet.
  - Le niveau « World » / « Continental » se règle par catégorie dans `data/categories.json` (champ `niveau`).
- **Coupes** : le classement de chaque coupe additionne les points du barème de la course (une victoire sur une World Classic vaut 110, sur une National Classic 50…). Le barème de coupe dédié a été supprimé.
- **Fiche coureur** : onglets par saison, tuiles (points, primes, rang, victoires, podiums, top 10), résultats groupés par épreuve avec la distinction Classique / Tour / Étape (points et primes à chaque ligne), meilleurs résultats, statistiques clés, historique des équipes et historique par saison (rang points, rang primes, coupes). Les champs optionnels `taille` (cm) et `poids` (kg) de `data/coureurs.json` s'affichent dès qu'ils sont renseignés, comme `age`.
- **Fiche équipe** : onglets par saison, points, primes, rang global et rang des primes, victoires, podiums, effectif avec points/primes par coureur, meilleurs résultats, victoires, historique par saison.
- **Classement complet d'une course** : colonnes points et primes.

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
- `resultat.html` *(nouveau fichier)*
- `coupes.html` *(nouveau fichier)*
- `coupe.html` *(nouveau fichier)*
- `admin.html`
- `README.md`
- `css/style.css`
- `js/nav.js`
- `js/data.js`
- `js/points.js`
- `js/parse.js`
- `data/effectifs.json`
- `data/saisons.json`
- `data/coureurs.json`
- `data/equipes.json`
- `data/courses.json`
- `data/categories.json`
- `data/bareme.json`
- `data/coupes.json` *(nouveau fichier)*
- `data/pays.json`
- `data/pays_iso.json` *(nouveau fichier)*

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
