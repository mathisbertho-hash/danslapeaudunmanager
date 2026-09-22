const NAV_ITEMS = [
  { href: 'index.html', label: 'Accueil' },
  { href: 'classements.html', label: 'Classements' },
  { href: 'coureurs.html', label: 'Coureurs' },
  { href: 'equipes.html', label: 'Équipes' },
  { href: 'courses.html', label: 'Courses' },
  { href: 'admin.html', label: 'Admin' },
];

function renderNav(activeHref) {
  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML = `
    <a href="index.html" class="brand">Dans la peau d'un manager</a>`;

  const tabs = document.createElement('nav');
  tabs.className = 'tabs';
  tabs.innerHTML = NAV_ITEMS.map(
    item => `<a href="${item.href}" class="${item.href === activeHref ? 'active' : ''}">${item.label}</a>`
  ).join('');

  document.body.prepend(tabs);
  document.body.prepend(topbar);

  const footer = document.createElement('footer');
  footer.className = 'site';
  footer.textContent = "Données saisies pour le jeu communautaire de management cycliste — Dans la peau d'un manager.";
  document.body.appendChild(footer);
}

document.addEventListener('DOMContentLoaded', () => {
  const active = document.body.dataset.page;
  renderNav(active);
});
