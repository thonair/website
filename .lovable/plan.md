# Plan — Logo ASCII ThonAir dans `neofetch` + pistes d'améliorations

## 1. Remplacer le logo ASCII de `neofetch`

Actuellement, la commande `neofetch` affiche un blob générique en forme d'œil/bulle. Je vais le remplacer par une représentation ASCII du **cercle ThonAir avec les deux éclairs** (rouge à gauche, bleu à droite), en ne reprenant **que ce qui est dans le cercle rouge annoté** sur ton image (donc sans le mot "THONAIR" en dessous).

### Approche visuelle

ASCII art monochrome (le terminal est mono-couleur vert/glow) — l'identité passera par la forme : cercle + double éclair en V inversé / Z miroir.

Esquisse cible (~11 lignes, taille comparable à l'actuel) :

```text
ajouter la photo donnée maintenant en ascii
```

- Garde le bloc d'infos système à droite (OS, Host, Kernel, Shell, Location, Uptime, Languages), aligné comme aujourd'hui.
- Version mobile compacte (~7 lignes, largeur ~22 cols) pour rester lisible sur téléphone via `useIsMobile`.

### Détails techniques

- Fichier : `src/components/Terminal.tsx`
- Remplacer le bloc ASCII actuel dans le handler `trimmed === "neofetch"` par deux constantes `THONAIR_LOGO_DESKTOP` / `THONAIR_LOGO_MOBILE` et faire un `zip` ligne-par-ligne logo + infos.
- Type `ascii` conservé pour bénéficier du `text-glow-strong`.

## 2. Autres pistes d'améliorations proposées

Tu choisiras lesquelles tu veux que j'implémente ensuite.

### UX / Terminal

1. **Autocomplétion `Tab**` sur les commandes (help, status, network, ping…) + suggestions inline en gris.
2. **Indicateur de chargement plus riche** pour `status` (spinner ASCII animé `| / - \` au lieu du simple ⏳ statique).
3. **Commande `theme**` pour switcher entre 2-3 palettes (vert Matrix actuel / ambre vintage / cyan tron) — sauvegarde en `localStorage`.
4. **Commande `traceroute**` déjà évoquée : simulation Internet → Cloudflare → Proxmox → Service avec hops et latences progressifs (effet ligne-par-ligne).
5. **Historique persistant** des commandes dans `localStorage` (re-rechargement = on garde la flèche ↑).

### Contenu / Identité

6. **Lien GitHub / LinkedIn cliquable** dans `cat contact` (et icônes ASCII).
7. **Section `cat cv` ou commande `download cv**` qui télécharge ton CV PDF.
8. **Commande `projects --verbose**` ou `cat projets/01` pour drill-down sur un projet précis (techno utilisée, captures ASCII, lien repo).

### Polish visuel

9. **Effet "typing" sur la sortie des commandes** (pas seulement au boot) — chaque ligne s'écrit caractère par caractère pour les commandes longues comme `infra` ou `network`.
10. **Sound design optionnel** : petits "beep" mécaniques de clavier (toggle via commande `mute`), désactivé par défaut.
11. **Easter eggs** supplémentaires : `matrix` (intensifie la pluie Matrix 5s), `hack` (faux scan de ports animé), `coffee` (☕ ASCII).
12. **SEO / partage** : og:image générée avec le logo ThonAir + tagline, meta description FR optimisée pour "Mustafa Bera Tcholakov cybersécurité Bruxelles".

### Performance / Tech

13. **Lazy-load** de `MatrixRain` (composant lourd) après le boot — gain au premier paint.
14. **A11y** : ajouter `aria-live="polite"` sur la zone de sortie pour les lecteurs d'écran, et un mode "no-effects" (sans CRT/flicker/matrix) déclenché par `prefers-reduced-motion`.

## Ce qui sera fait dans ce plan

Uniquement le **point 1** (logo ASCII ThonAir dans `neofetch`, desktop + mobile). Dis-moi ensuite quels points parmi 1-14 tu veux que j'attaque.