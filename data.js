// Couche de données : charge les fichiers JSON du dossier /data et fournit
// des index pratiques (par id). Tout le site lit uniquement ces fichiers ;
// l'admin les réécrit via js/github.js.

const DATA_FILES = {
  equipes: 'data/equipes.json',
  coureurs: 'data/coureurs.json',
  effectifs: 'data/effectifs.json',
  saisons: 'data/saisons.json',
  categories: 'data/categories.json',
  courses: 'data/courses.json',
  resultats: 'data/resultats.json',
  bareme: 'data/bareme.json',
};

async function loadAllData() {
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, path]) => {
      const res = await fetch(path + '?_=' + Date.now());
      if (!res.ok) throw new Error(`Impossible de charger ${path} (${res.status})`);
      return [key, await res.json()];
    })
  );
  const db = Object.fromEntries(entries);

  db.coureursById = Object.fromEntries(db.coureurs.map(c => [c.id, c]));
  db.equipesById = Object.fromEntries(db.equipes.map(e => [e.id, e]));
  db.coursesById = Object.fromEntries(db.courses.map(c => [c.id, c]));
  db.categoriesById = Object.fromEntries(db.categories.map(c => [c.id, c]));

  // équipe d'un coureur pour une saison donnée (référentiel d'effectifs daté)
  db.equipeDuCoureur = (coureurId, saisonId) => {
    const entry = db.effectifs.find(e => e.coureur_id === coureurId && e.saison === saisonId);
    return entry ? entry.equipe : null;
  };

  return db;
}

function slugify(s) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
