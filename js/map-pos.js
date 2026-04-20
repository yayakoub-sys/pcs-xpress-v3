/* PCS XPRESS V3 — map-pos.js v2
   Carte interactive Leaflet premium pour points-de-vente.html.
   - PCS XPRESS : markers prioritaires (hors cluster)
   - POI Abidjan (Overpass / OSM) : clusterisés
   - 7 filtres : Tous · PCS XPRESS · Acheter · Recharger · Pharmacies · Stations · Centres commerciaux
   Data : data/points-de-vente.json + data/poi-abidjan.json
*/

(function () {
  'use strict';

  // --- Catégories PCS XPRESS (markers premium) ---
  var PCS_CATS = {
    'zone-strategique': { label: 'Zone stratégique',   color: '#C9A14B', size: 'lg' },
    'ville-couverte':   { label: 'Ville couverte',     color: '#FD3F5C', size: 'md' },
    'assistance':       { label: 'Assistance',         color: '#01D39A', size: 'lg' },
    'bientot':          { label: 'Bientôt disponible', color: '#9CA3AF', size: 'sm' }
  };

  // --- Services PCS XPRESS (badges popup) ---
  var SERVICES = {
    achat:      { label: 'Achat carte',  color: '#FD3F5C' },
    recharge:   { label: 'Recharge',     color: '#322B3A' },
    assistance: { label: 'Assistance',   color: '#01D39A' }
  };

  // --- POI Abidjan (OSM) ---
  // Seules les catégories mappées ici apparaissent sur la carte.
  // bank / atm : chargés mais NON rendus (pas dans la liste de filtres utilisateur).
  var POI_CATS = {
    pharmacy:    { label: 'Pharmacie',       color: '#01A778', filter: 'pharmacy' },
    fuel:        { label: 'Station-service', color: '#3B7DD8', filter: 'fuel' },
    supermarket: { label: 'Supermarché',     color: '#E8833A', filter: 'retail' },
    mall:        { label: 'Centre commercial', color: '#E8833A', filter: 'retail' }
    // bank, atm : intentionnellement non inclus → non rendus
  };

  // --- Filtres (ordre de rendu des chips) ---
  var FILTERS = [
    { id: 'pcs',       label: 'PCS XPRESS',          color: '#C9A14B', kind: 'pcs' },
    { id: 'achat',     label: 'Acheter carte',       color: '#FD3F5C', kind: 'service' },
    { id: 'recharge',  label: 'Recharger',           color: '#322B3A', kind: 'service' },
    { id: 'pharmacy',  label: 'Pharmacies',          color: '#01A778', kind: 'poi' },
    { id: 'fuel',      label: 'Stations',            color: '#3B7DD8', kind: 'poi' },
    { id: 'retail',    label: 'Centres commerciaux', color: '#E8833A', kind: 'poi' }
  ];

  // --- State ---
  var mapEl = document.getElementById('pos-map');
  if (!mapEl || typeof L === 'undefined') return;

  var map = L.map(mapEl, {
    scrollWheelZoom: false,
    zoomControl: true,
    minZoom: 6,
    maxZoom: 18
  }).setView([5.35, -4.00], 11); // Abidjan centered

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abc'
  }).addTo(map);

  // Scroll-wheel zoom uniquement au focus/click
  mapEl.addEventListener('click', function () { map.scrollWheelZoom.enable(); });
  mapEl.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });
  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur', function () { map.scrollWheelZoom.disable(); });

  // --- Utils ---
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function makePcsIcon(cat) {
    var c = PCS_CATS[cat] || { color: '#322B3A', size: 'md' };
    var klass = 'pos-marker pos-marker--pcs pos-marker--' + c.size;
    return L.divIcon({
      className: klass,
      html: '<span class="pos-marker__pulse" style="background:' + c.color + ';"></span>'
          + '<span class="pos-marker__dot" style="background:' + c.color + ';"></span>',
      iconSize: c.size === 'lg' ? [28, 28] : (c.size === 'md' ? [22, 22] : [16, 16]),
      iconAnchor: c.size === 'lg' ? [14, 14] : (c.size === 'md' ? [11, 11] : [8, 8])
    });
  }

  function makePoiIcon(cat) {
    var c = POI_CATS[cat];
    if (!c) return null;
    return L.divIcon({
      className: 'pos-marker pos-marker--poi',
      html: '<span class="pos-marker__pin" style="background:' + c.color + ';"></span>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  }

  function renderBadges(list) {
    if (!list || !list.length) return '';
    return list.map(function (k) {
      var s = SERVICES[k];
      if (!s) return '';
      return '<span class="pos-popup__badge" style="background:' + s.color + '1a; color:' + s.color + '; border:1px solid ' + s.color + '40;">' + escapeHtml(s.label) + '</span>';
    }).join('');
  }

  function renderPcsPopup(pt) {
    var cat = PCS_CATS[pt.category] || { label: pt.category, color: '#322B3A' };
    var html = '<div class="pos-popup">';
    html += '<div class="pos-popup__cat" style="color:' + cat.color + ';">' + escapeHtml(cat.label) + '</div>';
    html += '<h4 class="pos-popup__name">' + escapeHtml(pt.name) + '</h4>';
    if (pt.subtitle) html += '<p class="pos-popup__subtitle">' + escapeHtml(pt.subtitle) + '</p>';
    if (pt.description) html += '<p class="pos-popup__desc">' + escapeHtml(pt.description) + '</p>';
    if (pt.address) html += '<p class="pos-popup__address">' + escapeHtml(pt.address) + '</p>';
    var badges = renderBadges(pt.services);
    if (badges) html += '<div class="pos-popup__services">' + badges + '</div>';
    html += '</div>';
    return html;
  }

  function renderPoiPopup(poi) {
    var c = POI_CATS[poi.cat] || { label: poi.cat, color: '#322B3A' };
    var html = '<div class="pos-popup pos-popup--poi">';
    html += '<div class="pos-popup__cat" style="color:' + c.color + ';">' + escapeHtml(c.label) + '</div>';
    html += '<h4 class="pos-popup__name" style="font-size: 0.98rem;">' + escapeHtml(poi.name || c.label + ' (sans nom)') + '</h4>';
    html += '<p class="pos-popup__source">Données OpenStreetMap</p>';
    html += '</div>';
    return html;
  }

  // --- Clusters ---
  var hasClustering = typeof L.markerClusterGroup === 'function';

  var clusterGroup = hasClustering
    ? L.markerClusterGroup({
        maxClusterRadius: 42,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 15,
        iconCreateFunction: function (cluster) {
          var count = cluster.getChildCount();
          // Determine dominant category color from children
          var colors = { pharmacy: 0, fuel: 0, supermarket: 0, mall: 0 };
          cluster.getAllChildMarkers().forEach(function (m) {
            if (m.__poiCat && colors.hasOwnProperty(m.__poiCat)) colors[m.__poiCat]++;
          });
          var dominant = Object.keys(colors).sort(function (a, b) { return colors[b] - colors[a]; })[0];
          var color = (POI_CATS[dominant] && POI_CATS[dominant].color) || '#322B3A';
          var size = count < 10 ? 36 : (count < 50 ? 44 : (count < 200 ? 52 : 60));
          return L.divIcon({
            className: 'pos-cluster',
            html: '<div class="pos-cluster__inner" style="background:' + color + ';">'
                + '<span class="pos-cluster__count">' + count + '</span></div>',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });
        }
      })
    : null;

  // --- Registers ---
  var allMarkers = [];       // { marker, filters: string[], kind: 'pcs'|'poi' }
  var activeFilters = new Set(FILTERS.map(function (f) { return f.id; })); // all on by default

  function computeMarkerFilters(pt, kind) {
    if (kind === 'pcs') {
      // PCS markers match 'pcs' + each service they provide
      var arr = ['pcs'];
      (pt.services || []).forEach(function (s) { if (s === 'achat' || s === 'recharge') arr.push(s); });
      return arr;
    }
    // POI → 1 filter id
    var c = POI_CATS[pt.cat];
    return c ? [c.filter] : [];
  }

  function isMarkerVisible(entry) {
    for (var i = 0; i < entry.filters.length; i++) {
      if (activeFilters.has(entry.filters[i])) return true;
    }
    return false;
  }

  function applyFilters() {
    allMarkers.forEach(function (entry) {
      var v = isMarkerVisible(entry);
      if (entry.kind === 'poi' && clusterGroup) {
        if (v && !entry.inCluster) {
          clusterGroup.addLayer(entry.marker);
          entry.inCluster = true;
        } else if (!v && entry.inCluster) {
          clusterGroup.removeLayer(entry.marker);
          entry.inCluster = false;
        }
      } else {
        if (v && !entry.onMap) {
          entry.marker.addTo(map);
          entry.onMap = true;
        } else if (!v && entry.onMap) {
          map.removeLayer(entry.marker);
          entry.onMap = false;
        }
      }
    });
  }

  // --- Build PCS markers (priority, not clustered) ---
  function buildPcsMarkers(data) {
    data.forEach(function (pt) {
      if (typeof pt.lat !== 'number' || typeof pt.lng !== 'number') return;
      var m = L.marker([pt.lat, pt.lng], {
        icon: makePcsIcon(pt.category),
        title: pt.name,
        riseOnHover: true,
        zIndexOffset: 1000 // priority over POI
      });
      m.bindPopup(renderPcsPopup(pt), { maxWidth: 320, minWidth: 240 });
      m.addTo(map);
      allMarkers.push({
        marker: m,
        filters: computeMarkerFilters(pt, 'pcs'),
        kind: 'pcs',
        onMap: true
      });
    });
  }

  // --- Build POI markers (clustered) ---
  function buildPoiMarkers(data) {
    data.forEach(function (poi) {
      if (!POI_CATS[poi.cat]) return; // skip bank/atm
      if (typeof poi.lat !== 'number' || typeof poi.lng !== 'number') return;
      var icon = makePoiIcon(poi.cat);
      if (!icon) return;
      var m = L.marker([poi.lat, poi.lng], { icon: icon });
      m.__poiCat = poi.cat;
      m.bindPopup(renderPoiPopup(poi), { maxWidth: 260, minWidth: 180 });
      allMarkers.push({
        marker: m,
        filters: computeMarkerFilters(poi, 'poi'),
        kind: 'poi',
        inCluster: false
      });
    });

    if (clusterGroup) {
      // Add all visible POIs to cluster
      allMarkers.forEach(function (e) {
        if (e.kind === 'poi' && isMarkerVisible(e)) {
          clusterGroup.addLayer(e.marker);
          e.inCluster = true;
        }
      });
      map.addLayer(clusterGroup);
    } else {
      // Fallback : add POIs directly (no clustering available)
      allMarkers.forEach(function (e) {
        if (e.kind === 'poi' && isMarkerVisible(e)) {
          e.marker.addTo(map);
          e.onMap = true;
        }
      });
    }
  }

  // --- Build filter chips ---
  function buildFilters(container) {
    // "Tous" button
    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'pos-filter-chip pos-filter-chip--all pos-filter-chip--active';
    allBtn.textContent = 'Tous';
    allBtn.addEventListener('click', function () {
      FILTERS.forEach(function (f) { activeFilters.add(f.id); });
      updateChipStates(container);
      applyFilters();
    });
    container.appendChild(allBtn);

    FILTERS.forEach(function (f) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pos-filter-chip pos-filter-chip--active';
      chip.setAttribute('data-filter', f.id);

      var dot = document.createElement('span');
      dot.className = 'pos-filter-chip__dot';
      dot.style.background = f.color;

      var label = document.createTextNode(f.label);

      chip.appendChild(dot);
      chip.appendChild(label);

      chip.addEventListener('click', function () {
        if (activeFilters.has(f.id)) {
          activeFilters.delete(f.id);
          chip.classList.remove('pos-filter-chip--active');
        } else {
          activeFilters.add(f.id);
          chip.classList.add('pos-filter-chip--active');
        }
        updateAllBtnState(container);
        applyFilters();
      });

      container.appendChild(chip);
    });
  }

  function updateChipStates(container) {
    container.querySelectorAll('.pos-filter-chip[data-filter]').forEach(function (chip) {
      var id = chip.getAttribute('data-filter');
      if (activeFilters.has(id)) chip.classList.add('pos-filter-chip--active');
      else chip.classList.remove('pos-filter-chip--active');
    });
    var allBtn = container.querySelector('.pos-filter-chip--all');
    if (allBtn) allBtn.classList.add('pos-filter-chip--active');
  }

  function updateAllBtnState(container) {
    var allBtn = container.querySelector('.pos-filter-chip--all');
    if (!allBtn) return;
    if (activeFilters.size === FILTERS.length) {
      allBtn.classList.add('pos-filter-chip--active');
    } else {
      allBtn.classList.remove('pos-filter-chip--active');
    }
  }

  // --- Reset view button ---
  function wireResetView() {
    var btn = document.getElementById('pos-map-reset');
    if (!btn) return;
    btn.addEventListener('click', function () {
      // Fit to PCS markers (national view)
      var pcsMarkers = allMarkers.filter(function (e) { return e.kind === 'pcs' && isMarkerVisible(e); });
      if (pcsMarkers.length) {
        var group = L.featureGroup(pcsMarkers.map(function (e) { return e.marker; }));
        map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 9 });
      } else {
        map.setView([6.5, -5.3], 7);
      }
    });
  }

  function wireAbidjanView() {
    var btn = document.getElementById('pos-map-abidjan');
    if (!btn) return;
    btn.addEventListener('click', function () {
      map.setView([5.35, -4.00], 11);
    });
  }

  // --- Fetch both datasets in parallel ---
  function fetchJson(url) {
    return fetch(url, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' HTTP ' + r.status);
      return r.json();
    });
  }

  Promise.all([
    fetchJson('./data/points-de-vente.json'),
    fetchJson('./data/poi-abidjan.json').catch(function () { return []; }) // graceful degrade
  ]).then(function (results) {
    var pcsData = results[0] || [];
    var poiData = results[1] || [];

    buildPcsMarkers(pcsData);
    buildPoiMarkers(poiData);

    var filtersEl = document.getElementById('pos-map-filters');
    if (filtersEl) buildFilters(filtersEl);

    wireResetView();
    wireAbidjanView();

    // Expose stats to info element
    var info = document.getElementById('pos-map-info');
    if (info) {
      var nPcs = pcsData.length;
      var nPoi = poiData.filter(function (p) { return POI_CATS[p.cat]; }).length;
      info.textContent = nPcs + ' zones PCS XPRESS · ' + nPoi.toLocaleString('fr-FR') + ' points d\'intérêt référencés à Abidjan';
    }
  }).catch(function (err) {
    console.error('[map-pos] failed:', err);
    mapEl.insertAdjacentHTML('afterbegin',
      '<div style="padding:24px;color:#888;font-size:0.9rem;text-align:center;">Carte momentanément indisponible. Appelez le <strong>1382</strong> pour trouver un point de vente près de chez vous.</div>');
  });
})();
