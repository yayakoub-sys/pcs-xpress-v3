/* PCS XPRESS V3 — main.js
   Interactions minimales : nav mobile, header au scroll, année footer, lien actif.
*/

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.site-nav');

  // --- Nav mobile ---
  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.classList.remove('is-locked');
  };
  const openNav = () => {
    if (!nav || !toggle) return;
    nav.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer le menu');
    document.body.classList.add('is-locked');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));

    // Escape ferme le menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });

    // Clic en dehors ferme le menu
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });
  }

  // --- Header : transition au scroll ---
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Année footer ---
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // --- Lien actif selon pathname ---
  const path = location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === 'index.html' && href === './index.html')) {
      a.classList.add('is-active');
    }
  });
});
