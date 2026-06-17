## Problème actuel

Sur mobile, la commande `help` affiche un tableau ASCII de 52 colonnes de large (`╔═══...═══╗`). L'écran ne fait pas cette largeur, donc chaque ligne wrap et casse l'alignement des bordures `║`. Résultat: bouillie visuelle.

Le même souci touche plusieurs autres commandes qui utilisent des cadres larges (`status`, `infra`, `whoami`, `skills`, `certifications`, encadrés `cat about/services/contact/projets`).

## Partie 1 — Fix du `help` mobile (à implémenter)

Dans `src/components/Terminal.tsx`, la fonction `processCommand(cmd, mobile)` reçoit déjà le flag `mobile`. Ajouter une branche dédiée pour `help` quand `mobile === true`.

Approche: version mobile compacte sans cadre ASCII, format à deux colonnes courtes (commande + verbe) qui tient dans ~32 caractères max.

```text
╭─ COMMANDES ─────────────╮
  ls            fichiers
  cat [f]       contenu
  whoami        identité
  banner        logo
  skills        compétences
  certs         certifs
  infra         homelab
  network       schéma net
  status        état live
  ping [h]      ping host
  traceroute    trace route
  fortune       citation
  date          horloge
  neofetch      sys info
  theme [n]     matrix/amber/cyan
  matrix        easter egg
  hack          port scan
  coffee        ☕
  clear         efface

  Tab = autocomplete
  ↑/↓ = historique
╰─────────────────────────╯
```

Largeur cible: 28-30 colonnes, qui rentre confortablement sur un viewport de 360px en `font-mono text-sm`.

## Partie 2 — Autres pistes d'amélioration (juste listées, à choisir ensuite)

### Mobile / responsive
1. **Mêmes fix mobile pour les autres commandes encadrées**: `status`, `infra`, `whoami`, `skills`, `certifications`, `cat about/services/contact/projets/NN`. Toutes ont des tableaux 52-68 colonnes qui cassent pareil.
2. **Boot sequence mobile**: les lignes "Chargement des modules de cybersécurité .............. [OK]" sont trop longues et wrap. Raccourcir en mobile.
3. **Détection de largeur dynamique** plutôt que juste `isMobile` booléen — adapter la largeur des cadres au viewport réel.
4. **Auto-scroll input**: sur mobile, quand le clavier s'ouvre, scroller pour garder l'input visible.

### Contenu / portfolio
5. **CV téléchargeable** via une commande `cv` ou `download cv` (fichier PDF dans `public/`).
6. **`projets` enrichis**: ajouter liens GitHub par projet, screenshots ASCII, dates, statut (en cours / terminé).
7. **Commande `blog` ou `writeups`** si tu as des writeups CTF à partager.
8. **Commande `now`** (style nownownow.com) — sur quoi tu bosses cette semaine.

### Polish visuel
9. **Effet typing char-par-char** sur les sorties courtes (whoami, fortune) pour renforcer le côté terminal.
10. **Easter egg `sl`** (le train ASCII classique quand on tape `ls` trop vite).
11. **Mini son optionnel** (toggle via `sound on/off`) — bip de touche + boot sound.
12. **Curseur cliquable / sélectionnable**: actuellement le caret custom rend le copier-coller bizarre, à vérifier.

### Technique / SEO
13. **SEO**: vérifier `<title>`, meta description FR, OG tags, JSON-LD `Person` avec tes liens sociaux (le site est un portfolio, ça aide).
14. **PWA**: manifest + service worker pour installation "ajouter à l'écran d'accueil" — cohérent avec l'esthétique terminal.
15. **Partage de commande via URL**: `?cmd=skills` exécute la commande au boot, utile pour partager un lien direct vers une section.
16. **Accessibilité**: ajouter un mode "lecture simple" (`accessible on`) qui désactive scanlines + flicker + matrix rain et augmente le contraste.

### Détails techniques
- Le fichier `Terminal.tsx` fait 1159 lignes, ça commence à mériter un split: extraire `commands/` (un fichier par commande ou par groupe), `data/` (SUBDOMAINS, PROJECTS, FORTUNES), `effects/` (MatrixRain est déjà séparé).
- `processCommand` est une grosse cascade `if/else if`, un dispatch object `{ help: () => [...], ls: () => [...] }` serait plus maintenable.

## Livrable de cette étape

- Patch sur `Terminal.tsx` qui rend `help` lisible sur mobile (branche `mobile` dans le `if (trimmed === "help")`).
- Aucune autre commande touchée pour le moment.
- Tu choisis ensuite parmi les 16 pistes ci-dessus celles à enchaîner.
