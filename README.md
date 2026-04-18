# PCS XPRESS V3 — Production V1

**Repo** : https://github.com/yayakoub-sys/pcs-xpress-v3

Site statique premium. Stack : HTML / CSS / JS — zéro dépendance, zéro build.

## Cibles de déploiement (3 hébergeurs simultanés)

Chaque `git push origin main` déclenche en parallèle 3 déploiements distincts. Si l'un est bloqué (quota, panne), les 2 autres restent disponibles.

| Cible | URL | Build | Coût | Activation |
|---|---|---|---|---|
| **Netlify** (principal) | https://pcs-xpress-v3-270.netlify.app | ~10-15 s | Gratuit (free tier) | Déjà actif |
| **Cloudflare Pages** (secours principal recommandé) | `https://<projet>.pages.dev` | ~30 s | Gratuit (bandwidth illimité, 500 builds/mois) | Procédure manuelle 5 min — voir `09-documentation/deploy-backup-flow.md` |
| **GitHub Pages** (secours tertiaire — toujours dispo) | `https://yayakoub-sys.github.io/pcs-xpress-v3/` | ~1 min | Gratuit (illimité repo public) | Activation auto via `.github/workflows/deploy-pages.yml` (déjà committé) |

## Lancer en local (preview de secours)

**1. Script Node fourni (recommandé — aucune installation)**
```
cd 08-production
node scripts/preview-local.cjs
```
Ouvre automatiquement http://localhost:8080 dans le navigateur.
Supporte les pretty URLs (`/tarifs` → `tarifs.html`) comme Netlify.

**2. Python (alternative — si Node indisponible)**
```
cd 08-production
python -m http.server 8080
```
Ouvrir http://localhost:8080

**3. Node http-server (alternative npm)**
```
npx http-server 08-production -p 8080
```

**4. Double-clic**
Ouvrir `index.html` directement dans Chrome / Firefox / Edge. Fonctionne mais quelques limitations CORS sur fonts locales.

## Arborescence

```
08-production/
├── index.html
├── la-carte.html
├── tarifs.html
├── comment-ca-marche.html
├── points-de-vente.html
├── faq.html
├── contact.html
├── mentions-legales.html
├── 404.html
├── 500.html
├── maintenance.html
├── sitemap.xml
├── robots.txt
├── README.md
├── assets/
│   ├── fonts/      (6 poids Montserrat Alternates)
│   └── images/
│       ├── logos/
│       ├── cartes/
│       ├── hero/
│       ├── ui/
│       ├── pictos/
│       └── illustrations/
├── css/
│   ├── main.css         (entry — importe les 4 suivants)
│   ├── tokens.css       (variables du design system)
│   ├── base.css         (reset, typographie, fonts)
│   ├── layout.css       (container, grid, sections)
│   └── components.css   (12 blocs)
└── js/
    └── main.js          (nav mobile, FAQ accordéon, année footer)
```

## Règles d'or

- **Tokens uniquement.** Aucune valeur en dur de couleur / espacement / radius / typo hors de `css/tokens.css`.
- **12 blocs plafond.** Ne pas créer de nouveau bloc sans justification consignée.
- **Mobile-first.** Vérifier chaque page à 375 px avant desktop.
- **Accessibilité.** Focus visibles, alt images, aria-label sur contrôles sans texte, contraste AA.
- **Performance.** Images PNG à optimiser (export WebP prévu en J+). Pas de JS inutile.

## Statut J1

- 8 pages éditoriales livrées avec header / footer cohérents.
- 3 pages utilitaires (404, 500, maintenance).
- Design system en tokens centralisés.
- 12 blocs CSS documentés.
- JS minimal : nav mobile + FAQ + année footer.
- Sitemap + robots.txt en place.

## À faire après J1

- Validation du porteur projet sur navigation, tons, visuels.
- Optimisation images (conversion WebP).
- Export SVG du logo et des pictos clés.
- Contenus définitifs (texte, FAQ, points de vente réels, tarifs arrêtés).
- Référent juridique sur mentions-legales.html.
- Choix hébergeur et domaine.
- Favicon et OpenGraph images.

## Licence / marques

Logos et visuels produit : propriété PCS XPRESS Côte d'Ivoire.
Mastercard : marque déposée de Mastercard International Incorporated.
