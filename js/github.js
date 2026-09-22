// Écrit les fichiers data/*.json dans le dépôt GitHub via l'API Contents.
// Le token (Personal Access Token "fine-grained", limité à ce seul dépôt,
// permission "Contents: Read and write") reste UNIQUEMENT dans le
// localStorage du navigateur de l'admin — il n'est jamais envoyé ailleurs
// qu'à api.github.com.

const GH_CONF_KEY = 'gruppetto_gh_conf'; // { owner, repo, branch, token }

function ghGetConf() {
  try {
    return JSON.parse(localStorage.getItem(GH_CONF_KEY) || 'null');
  } catch {
    return null;
  }
}

function ghSetConf(conf) {
  localStorage.setItem(GH_CONF_KEY, JSON.stringify(conf));
}

function ghClearConf() {
  localStorage.removeItem(GH_CONF_KEY);
}

function b64EncodeUtf8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/** Écrit (crée ou met à jour) un fichier data/xxx.json dans le repo. */
async function ghWriteJsonFile(path, dataObj, message) {
  const conf = ghGetConf();
  if (!conf || !conf.token) throw new Error('Aucun token GitHub configuré.');
  const apiUrl = `https://api.github.com/repos/${conf.owner}/${conf.repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${conf.token}`,
    Accept: 'application/vnd.github+json',
  };

  // Récupère le sha actuel du fichier (nécessaire pour une mise à jour)
  let sha;
  const getRes = await fetch(`${apiUrl}?ref=${conf.branch || 'main'}`, { headers });
  if (getRes.ok) {
    const info = await getRes.json();
    sha = info.sha;
  } else if (getRes.status !== 404) {
    throw new Error(`Lecture du fichier échouée (${getRes.status}) : ${(await getRes.json()).message || ''}`);
  }

  const content = b64EncodeUtf8(JSON.stringify(dataObj, null, 2));
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message || `Mise à jour ${path}`,
      content,
      sha,
      branch: conf.branch || 'main',
    }),
  });
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(`Échec de l'écriture (${putRes.status}) : ${err.message || 'erreur inconnue'}`);
  }
  return putRes.json();
}

/** Vérifie que le token/repo sont valides en lisant un fichier connu. */
async function ghTestConnection() {
  const conf = ghGetConf();
  if (!conf) throw new Error('Rien de configuré.');
  const apiUrl = `https://api.github.com/repos/${conf.owner}/${conf.repo}`;
  const res = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${conf.token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`Dépôt introuvable ou token invalide (${res.status})`);
  return res.json();
}
