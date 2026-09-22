// Calcul des classements à partir de resultats.json + bareme.json.
//
// Règles retenues avec le commanditaire :
// - classement par équipes = somme de TOUS les coureurs classés (pas de top N)
// - pas de transferts en cours de saison : l'équipe d'un coureur pour une
//   saison vient uniquement du référentiel d'effectifs (data/effectifs.json)
// - DNF compte dans le palmarès (participation) mais ne rapporte pas de points
// - victoire d'étape et victoire finale/classique comptent pareil au
//   classement aux victoires
// - égalités : affichées ex æquo, pas de départage

/** Points pour un résultat donné, selon le barème. */
function pointsPourResultat(bareme, categorieId, type, place) {
  let table;
  if (type === 'scratch' || type === 'general') {
    table = bareme.individuel_scratch?.[categorieId];
  } else if (type === 'etape') {
    table = bareme.etape?.[categorieId];
  } else if (['points', 'montagne', 'jeune'].includes(type)) {
    table = bareme.classement_annexe?.[type];
  }
  if (!table) return 0;
  const v = table[String(place)];
  return typeof v === 'number' ? v : 0;
}

/**
 * Construit les 4 classements (individuel points/victoires, équipes
 * points/victoires) pour un ensemble de résultats déjà filtré (saison,
 * catégorie, période — le filtrage se fait en amont, sur `resultats`).
 */
function calculerClassements(db, resultats, saisonId) {
  const indivPoints = new Map(); // coureurId -> points
  const indivVictoires = new Map(); // coureurId -> nb victoires
  const equipePoints = new Map(); // equipeId -> points
  const equipeVictoires = new Map(); // equipeId -> nb victoires

  for (const res of resultats) {
    const course = db.coursesById[res.courseId];
    if (!course) continue;
    for (const ligne of res.classement) {
      if (ligne.statut !== 'classe') continue; // DNF ne rapporte pas de points
      const pts = pointsPourResultat(db.bareme, course.categorie, res.type, ligne.place);
      const equipeId = db.equipeDuCoureur(ligne.coureurId, saisonId);

      if (pts > 0) {
        indivPoints.set(ligne.coureurId, (indivPoints.get(ligne.coureurId) || 0) + pts);
        if (equipeId) equipePoints.set(equipeId, (equipePoints.get(equipeId) || 0) + pts);
      }
      if (ligne.place === 1 && (res.type === 'scratch' || res.type === 'general' || res.type === 'etape')) {
        indivVictoires.set(ligne.coureurId, (indivVictoires.get(ligne.coureurId) || 0) + 1);
        if (equipeId) equipeVictoires.set(equipeId, (equipeVictoires.get(equipeId) || 0) + 1);
      }
    }
  }

  const toSortedArray = (map, labelFn) =>
    [...map.entries()]
      .map(([id, valeur]) => ({ id, label: labelFn(id), valeur }))
      .sort((a, b) => b.valeur - a.valeur);

  return {
    individuelPoints: toSortedArray(indivPoints, id => db.coureursById[id]?.nom || id),
    individuelVictoires: toSortedArray(indivVictoires, id => db.coureursById[id]?.nom || id),
    equipePoints: toSortedArray(equipePoints, id => db.equipesById[id]?.nom || id),
    equipeVictoires: toSortedArray(equipeVictoires, id => db.equipesById[id]?.nom || id),
  };
}

/** Filtre resultats.json par saison / catégorie avant calcul. */
function filtrerResultats(db, resultats, { saisonId, categorieId }) {
  return resultats.filter(res => {
    if (saisonId && res.saison !== saisonId) return false;
    if (categorieId) {
      const course = db.coursesById[res.courseId];
      if (!course || course.categorie !== categorieId) return false;
    }
    return true;
  });
}

/** Ajoute un rang (avec égalités ex æquo, pas de départage) à un classement trié. */
function avecRang(liste) {
  let rang = 0;
  let dernierePosition = 0;
  let derniereValeur = null;
  return liste.map((item, i) => {
    rang = i + 1;
    if (item.valeur !== derniereValeur) {
      dernierePosition = rang;
      derniereValeur = item.valeur;
    }
    return { ...item, rang: dernierePosition };
  });
}
