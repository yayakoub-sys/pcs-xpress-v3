# PCS XPRESS V3 — Production V1

Site statique premium. Stack : HTML / CSS / JS — zéro dépendance, zéro build.

## Lancer en local

Trois méthodes. Toutes valides.

**1. Python (le plus simple, aucune installation)**
```
cd 08-production
python -m http.server 8080
```
Ouvrir http://localhost:8080

**2. Node (si http-server installé)**
```
npx http-server 08-production -p 8080
```

**3. Double-clic**
Ouvrir `index.html` directement dans Chrome / Firefox / Edge. Les polices locales se chargeront en file:// dans la plupart des navigateurs récents.

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
