// Parse le texte copié-collé depuis le forum. Chaque ligne de résultat
// ressemble à :
//   1  Ronald Aponte Bardiani CSF Faizanè 5h48'44
//   2   Gunnar Ólafsson Alpecin-Deceuninck s.t.
//   36 Andreas Riedl B&B HOTELS KTM + 1'40
//
// Le nom du coureur et celui de l'équipe (PCM, souvent sans rapport avec
// l'équipe réelle du jeu) sont collés sans séparateur fiable : on retrouve
// le coureur par rapprochement avec le référentiel connu (ordre des mots
// libre : "Ronald Aponte" doit matcher "APONTE Ronald"), tout le reste de
// la ligne (l'équipe PCM) est ignoré — l'équipe réelle vient du
// référentiel d'effectifs, jamais du texte.

function normWord(s) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/** Index des coureurs connus par empreinte de mots (triés, insensible à l'ordre/accents/casse). */
function buildRiderIndex(coureurs) {
  const index = new Map(); // key: sorted normalized words joined by '+' -> rider
  for (const c of coureurs) {
    const words = c.nom.split(/\s+/).filter(Boolean).map(normWord).filter(Boolean);
    if (words.length < 2) continue;
    const key = [...words].sort().join('+');
    index.set(key, c);
  }
  return index;
}

// Temps absolu (heures optionnelles : "5h48'44" ou juste "45'12" pour un
// CLM de moins d'une heure), écarts avec heures/minutes/secondes, écarts en
// secondes seules ("+ 45"" ou juste "+ 8"), et "même temps".
const TIME_RE = /(?:\d{1,2}h)?\d{1,2}['’]\d{2}(?:["”]\d{0,2})?|\+\s*\d{1,2}h\d{2}['’]\d{2}|\+\s*\d{1,3}['’]\d{2}(?:["”]\d{0,2})?|\+\s*\d{1,3}["”]|\+\s*\d{1,3}(?![\d'’"”])|(?<![a-zA-Z])s\.?\s*t\.?(?![a-zA-Z])/i;

const MARKER_CHARS = /^[\*\+\~\^\u2020\u2021\u25CF\u25CB\u2022•]\s*/;

/**
 * Parse un bloc de texte de résultats. Retourne
 * { nomCourse, lignes: [{ raw, place, statut, temps, coureurId|null, nomBrut, ambigu }], erreurs }
 */
function parseTexteResultats(texte, coureurs) {
  const riderIndex = buildRiderIndex(coureurs);
  const lines = texte.split('\n').map(l => l.trim());
  let nomCourse = null;
  const lignes = [];

  for (const rawLine of lines) {
    if (!rawLine) continue;

    // Ligne "place  Nom... Equipe... Temps"
    const m = rawLine.match(/^(\d{1,3})\s+(.*)$/);
    if (!m) {
      // Première ligne non vide sans numéro = probablement le nom de la course
      if (!nomCourse && !/déjà signé|contrat/i.test(rawLine)) {
        nomCourse = rawLine;
      }
      continue;
    }

    const place = parseInt(m[1], 10);
    let reste = m[2].replace(MARKER_CHARS, '').trim();

    // Extraire le temps (en fin de ligne le plus souvent)
    const timeMatch = reste.match(TIME_RE);
    let temps = null;
    let statut = 'classe';
    if (timeMatch) {
      temps = timeMatch[0].trim();
      reste = (reste.slice(0, timeMatch.index) + ' ' + reste.slice(timeMatch.index + timeMatch[0].length)).trim();
      if (/^s\.?\s*t\.?$/i.test(temps)) statut = 'classe'; // même temps = classé normalement
    }
    // Abandon / hors délai explicite dans le texte
    if (/\b(DNF|abandon|ab\.)\b/i.test(reste)) {
      statut = 'abandon';
      reste = reste.replace(/\b(DNF|abandon|ab\.)\b/gi, '').trim();
    }

    const words = reste.split(/\s+/).filter(Boolean);

    // Cherche le plus long préfixe de mots qui correspond à un coureur connu
    let coureurId = null;
    let nomTrouve = null;
    let longueurNom = 0;
    for (let len = Math.min(5, words.length); len >= 2; len--) {
      const candidate = words.slice(0, len).map(normWord).filter(Boolean);
      if (candidate.length < 2) continue;
      const key = [...candidate].sort().join('+');
      const rider = riderIndex.get(key);
      if (rider) {
        coureurId = rider.id;
        nomTrouve = rider.nom;
        longueurNom = len;
        break;
      }
    }

    lignes.push({
      raw: rawLine,
      place,
      statut,
      temps,
      coureurId,
      nomBrut: nomTrouve || words.slice(0, Math.min(3, words.length)).join(' '),
      equipeBrute: words.slice(longueurNom || 2).join(' ') || null,
      ambigu: !coureurId,
    });
  }

  return { nomCourse, lignes };
}
