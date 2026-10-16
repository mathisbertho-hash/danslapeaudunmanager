// Calcul des classements à partir de resultats.json + bareme.json.
//
// Règles retenues avec le commanditaire :
// - classement par équipes = somme de TOUS les coureurs classés (pas de top N)
// - pas de transferts en cours de saison : l'équipe d'un coureur pour une
//   saison vient uniquement du référentiel d'effectifs (data/effectifs.json)
// - DNF compte dans le palmarès (participation) mais ne rapporte ni points ni primes
// - victoire d'étape et victoire finale/classique comptent pareil au
//   classement aux victoires
// - égalités : affichées ex æquo, pas de départage
// - un résultat de course par étapes rapporte les points/primes de l'étape
//   (barème `etape`) ET ceux du général (barème `individuel_scratch`)
// - classements annexes (points, montagne, jeune) et championnats : pas de barème => 0
// - espoirs / juniors : barème emprunté (bareme.alias_categories), sans prime (bareme.sans_prime)
// - coupes : somme des points du barème de la course, sur les courses rattachées à la coupe

/** Lit une entrée de barème : nombre (ancien format) ou { pts, prime }. */
function lireEntreeBareme(entree) {
  if (typeof entree === 'number') return { pts: entree, prime: 0 };
  if (entree && typeof entree === 'object') {
    return { pts: Number(entree.pts) || 0, prime: Number(entree.prime) || 0 };
  }
  return { pts: 0, prime: 0 };
}

/**
 * Points et prime d'une place pour une course et un type de résultat.
 * course : objet course (porte la catégorie). type : scratch | general | etape | points | montagne | jeune
 */
function pointsEtPrime(db, course, type, place) {
  const b = db.bareme || {};
  const categorie = course.categorie;
  const alias = b.alias_categories?.[categorie];
  const sansPrime = (b.sans_prime || []).includes(categorie);
  const estTour = type === 'general' || type === 'etape';

  let table;
  if (type === 'scratch' || type === 'general') {
    const cat = alias ? (estTour ? alias.tour : alias.scratch) : categorie;
    table = b.individuel_scratch?.[cat];
  } else if (type === 'etape') {
    const cat = alias ? alias.tour : categorie;
    table = b.etape?.[cat];
  } else if (['points', 'montagne', 'jeune'].includes(type)) {
    table = b.classement_annexe?.[type];
  }
  if (!table) return { pts: 0, prime: 0 };
  const { pts, prime } = lireEntreeBareme(table[String(place)]);
  return { pts, prime: sansPrime ? 0 : prime };
}

/** Compatibilité : points seuls. */
function pointsPourResultat(db, course, type, place) {
  return pointsEtPrime(db, course, type, place).pts;
}

const TYPES_VICTOIRE = ['scratch', 'general', 'etape'];

/**
 * Une ligne par coureur classé de chaque résultat, avec points, prime et victoire.
 * C'est la brique commune à tous les classements et aux fiches coureur/équipe.
 */
function calculerLignes(db, resultats, saisonId) {
  const lignes = [];
  for (const res of resultats) {
    const course = db.coursesById[res.courseId];
    if (!course) continue;
    const saison = saisonId || res.saison;
    for (const l of res.classement) {
      if (l.statut !== 'classe') continue; // DNF : ni points ni primes
      const { pts, prime } = pointsEtPrime(db, course, res.type, l.place);
      const coureur = db.coureursById[l.coureurId];
      lignes.push({
        coureurId: l.coureurId,
        equipeId: db.equipeDuCoureur(l.coureurId, saison),
        pays: coureur?.nationalite || null,
        course, res,
        type: res.type,
        etapeNumero: res.etapeNumero ?? null,
        saison: res.saison,
        place: l.place,
        pts, prime,
        victoire: l.place === 1 && TYPES_VICTOIRE.includes(res.type),
      });
    }
  }
  return lignes;
}

/**
 * Agrège les lignes par coureur, équipe ou pays.
 * Retourne [{ id, label, pts, prime, victoires, nbResultats }], non trié.
 */
function agreger(db, lignes, cle) {
  const map = new Map();
  for (const l of lignes) {
    const id = cle === 'coureur' ? l.coureurId : cle === 'equipe' ? l.equipeId : l.pays;
    if (!id) continue;
    let a = map.get(id);
    if (!a) {
      const label = cle === 'coureur' ? (db.coureursById[id]?.nom || id)
        : cle === 'equipe' ? (db.equipesById[id]?.nom || id) : id;
      a = { id, label, pts: 0, prime: 0, victoires: 0, nbResultats: 0 };
      map.set(id, a);
    }
    a.pts += l.pts;
    a.prime += l.prime;
    if (l.victoire) a.victoires += 1;
    a.nbResultats += 1;
  }
  return [...map.values()];
}

/**
 * Trie selon une métrique ('pts' | 'prime' | 'victoires'), écarte les valeurs nulles
 * et pose `valeur` (attendu par avecRang). Ordre stable : alphabétique à valeur égale.
 */
function classerPar(items, metrique) {
  return items
    .filter(i => i[metrique] > 0)
    .map(i => ({ ...i, valeur: i[metrique] }))
    .sort((a, b) => b.valeur - a.valeur || a.label.localeCompare(b.label));
}

/**
 * Compatibilité : les classements « classiques » sur un ensemble de résultats déjà filtré.
 */
function calculerClassements(db, resultats, saisonId) {
  const lignes = calculerLignes(db, resultats, saisonId);
  const coureurs = agreger(db, lignes, 'coureur');
  const equipes = agreger(db, lignes, 'equipe');
  return {
    individuelPoints: classerPar(coureurs, 'pts'),
    individuelVictoires: classerPar(coureurs, 'victoires'),
    individuelPrimes: classerPar(coureurs, 'prime'),
    equipePoints: classerPar(equipes, 'pts'),
    equipeVictoires: classerPar(equipes, 'victoires'),
    equipePrimes: classerPar(equipes, 'prime'),
  };
}

/** Circuit d'une course : 'pro' | 'espoirs' | 'juniors' (porté par sa catégorie). */
function circuitDeCourse(db, course) {
  return db.categoriesById[course.categorie]?.circuit || 'pro';
}

/** Filtre resultats.json par saison / catégorie / circuit / niveau (world | continental). */
function filtrerResultats(db, resultats, { saisonId, categorieId, circuit, niveau } = {}) {
  return resultats.filter(res => {
    if (saisonId && res.saison !== saisonId) return false;
    if (categorieId || circuit || niveau) {
      const course = db.coursesById[res.courseId];
      if (!course) return false;
      if (categorieId && course.categorie !== categorieId) return false;
      if (circuit && circuitDeCourse(db, course) !== circuit) return false;
      if (niveau && db.categoriesById[course.categorie]?.niveau !== niveau) return false;
    }
    return true;
  });
}

/** Ajoute un rang (égalités ex æquo, pas de départage) à un classement trié par `valeur`. */
function avecRang(liste) {
  let dernierePosition = 0;
  let derniereValeur = null;
  return liste.map((item, i) => {
    if (item.valeur !== derniereValeur) {
      dernierePosition = i + 1;
      derniereValeur = item.valeur;
    }
    return { ...item, rang: dernierePosition };
  });
}

/**
 * Classement d'une coupe pour une saison : points du barème de chaque course
 * rattachée à la coupe (course.coupes contient coupeId), résultats scratch/général.
 * Les primes ne comptent pas dans les coupes.
 */
function calculerClassementCoupe(db, coupeId, saisonId) {
  const resultatsCoupe = db.resultats.filter(res => {
    if (res.saison !== saisonId) return false;
    if (res.type !== 'scratch' && res.type !== 'general') return false;
    const course = db.coursesById[res.courseId];
    return course && Array.isArray(course.coupes) && course.coupes.includes(coupeId);
  });
  const lignes = calculerLignes(db, resultatsCoupe, saisonId);
  return {
    individuel: classerPar(agreger(db, lignes, 'coureur'), 'pts'),
    equipes: classerPar(agreger(db, lignes, 'equipe'), 'pts'),
    nbCourses: resultatsCoupe.length,
  };
}

/** Prime formatée : 1 250 000 € */
function fmtPrime(n) {
  return (n || 0).toLocaleString('fr-FR').replace(/ /g, ' ') + ' €';
}
