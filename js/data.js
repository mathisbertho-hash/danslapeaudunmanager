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
  paysIso: 'data/pays_iso.json',
};

const SPECIAL_FLAGS = {
  'GB-WLS': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}',
  'GB-SCT': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
  'GB-ENG': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
  'GB-NIR': '🇬🇧',
};

function flagEmoji(alpha2) {
  if (!alpha2) return '';
  if (SPECIAL_FLAGS[alpha2]) return SPECIAL_FLAGS[alpha2];
  if (alpha2.length !== 2) return '';
  return [...alpha2.toUpperCase()].map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

// Drapeaux réels (images) via flagcdn.com — plus fiable que l'emoji, qui ne
// s'affiche pas en couleur sur toutes les plateformes (Windows notamment).
// Codes spéciaux (Pays de Galles) : pas de code ISO standard, on retombe sur
// l'emoji. Sans code du tout (ex. Bougainville) : pas d'image, juste rien.
function flagImg(alpha2, alt) {
  if (!alpha2) return '';
  if (alpha2.startsWith('GB-')) {
    return `<span class="flag-emoji" title="${alt || ''}">${flagEmoji(alpha2)}</span>`;
  }
  const code = alpha2.toLowerCase();
  return `<img class="flag-img" src="https://flagcdn.com/24x18/${code}.png" srcset="https://flagcdn.com/48x36/${code}.png 2x" width="24" height="18" alt="${alt || alpha2}" loading="lazy">`;
}

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

  db.flagForCountry = (nomPays) => flagImg(db.paysIso[nomPays], nomPays);
  db.flagForCode = (code, nomPays) => flagImg(code, nomPays);

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
