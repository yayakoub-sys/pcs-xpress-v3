/* PCS XPRESS V3 — map-pos.js
   Carte interactive Leaflet pour points-de-vente.html.
   Chargée uniquement sur cette page. Data externe : data/points-de-vente.json.
*/

(function () {
  'use strict';

  const CATEGORIES = {
    'zone-strategique': { label: 'Zone stratégique', color: '#C9A14B' },
    'ville-couverte':   { label: 'Ville couverte',   color: '#FD3F5C' },
    'assistance':       { label: 'Assistance',       color: '#01D39A' },
    'bientot':          { label: 'Bientôt disponible', color: '#9CA3AF' }
  };

  const SERVICES = {
    achat:      { label: 'Achat carte',  color: '#FD3F5C' },
    recharge:   { label: 'Recharge',     color: '#322B3A' },
    assistance: { label: 'Assistance',   color: '#01D39A' }
  };

  const mapEl = document.getElementById('pos-map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map(mapEl, {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([6.5, -5.3], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Scroll-wheel zoom uniquement au focus (UX)
  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur',  function () { map.scrollWheelZoom.disable(); });
  mapEl.addEventListener('click', function () { map.scrollWheelZoom.enable(); });
  mapEl.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function makeIcon(cat) {
    const c = CATEGORIES[cat] || { color: '#322B3A' };
    const isBientot = cat === 'bientot';
    const opacity = isBientot ? '0.7' : '1';
    return L.divIcon({
      className: 'pos-marker',
      html: '<span class="pos-marker__dot" style="background:' + c.color + '; opacity:' + opacity + ';"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  function renderBadges(list) {
    if (!list || !list.length) return '';
    return list.map(function (k) {
      const s = SERVICES[k];
      if (!s) return '';
      return '<span class="pos-popup__badge" style="background:' + s.color + '1a; color:' + s.color + '; border:1px solid ' + s.color + '40;">' + escapeHtml(s.label) + '</span>';
    }).join('');
  }

  function renderPopup(pt) {
    const cat = CATEGORIES[pt.category] || { label: pt.category, color: '#322B3A' };
    let html = '<div class="pos-popup">';
    html += '<div class="pos-popup__cat" style="color:' + cat.color + ';">' + escapeHtml(cat.label) + '</div>';
    html += '<h4 class="pos-popup__name">' + escapeHtml(pt.name) + '</h4>';
    if (pt.subtitle) html += '<p class="pos-popup__subtitle">' + escapeHtml(pt.subtitle) + '</p>';
    if (pt.description) html += '<p class="pos-popup__desc">' + escapeHtml(pt.description) + '</p>';
    if (pt.address) html += '<p class="pos-popup__address">' + escapeHtml(pt.address) + '</p>';
    const badges = renderBadges(pt.services);
    if (badges) html += '<div class="pos-popup__services">' + badges + '</div>';
    html += '</div>';
    return html;
  }

  const markersByCat = {};
  const allMarkers = [];

  function buildMarkers(data) {
    data.forEach(function (pt) {
      if (typeof pt.lat !== 'number' || typeof pt.lng !== 'number') return;
      const m = L.marker([pt.lat, pt.lng], {
        icon: makeIcon(pt.category),
        title: pt.name
      });
      m.bindPopup(renderPopup(pt), { maxWidth: 320, minWidth: 240 });
      allMarkers.push(m);
      if (!markersByCat[pt.category]) markersByCat[pt.category] = [];
      markersByCat[pt.category].push(m);
      m.addTo(map);
    });
  }

  function buildFilters(container) {
    Object.keys(CATEGORIES).forEach(function (cat) {
      const c = CATEGORIES[cat];
      const chip = document.createElement('label');
      chip.className = 'pos-filter-chip pos-filter-chip--active';
      chip.setAttribute('data-cat', cat);

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = true;

      const dot = document.createElement('span');
      dot.className = 'pos-filter-chip__dot';
      dot.style.background = c.color;

      const txt = document.createTextNode(' ' + c.label);

      chip.appendChild(input);
      chip.appendChild(dot);
      chip.appendChild(txt);

      input.addEventListener('change', function () {
        const active = input.checked;
        chip.classList.toggle('pos-filter-chip--active', active);
        const list = markersByCat[cat] || [];
        list.forEach(function (m) {
          if (active) m.addTo(map);
          else map.removeLayer(m);
        });
      });

      container.appendChild(chip);
    });
  }

  fetch('./data/points-de-vente.json', { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      buildMarkers(data);
      const filtersEl = document.getElementById('pos-map-filters');
      if (filtersEl) buildFilters(filtersEl);

      if (allMarkers.length) {
        const group = L.featureGroup(allMarkers);
        map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 9 });
      }
    })
    .catch(function (err) {
      console.error('[map-pos] failed:', err);
      mapEl.insertAdjacentHTML('afterbegin',
        '<div style="padding:24px;color:#888;font-size:0.9rem;text-align:center;">Carte momentanément indisponible. Appelez le <strong>1382</strong> pour trouver un point de vente près de chez vous.</div>');
    });
})();
