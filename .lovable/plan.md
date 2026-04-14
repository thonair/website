

# Analyse et améliorations de tes sous-domaines thonair.com

## Ce que j'ai observé

### 1. home.thonair.com — Homepage / Dashboard
- **Outil** : Homarr ou similaire (Next.js powered)
- **Contenu** : Dashboard bien organisé avec sections Infrastructure, Services, Storage, System, Monitoring, Developer, Social, Admin, Docs
- **Stats live** : CPU, MEM, RX, TX pour chaque service
- **Points positifs** : Bien structuré, stats en temps réel, météo Brussels
- **Améliorations possibles** :
  - Personnaliser le titre "Welcome to the Main Hub" avec ton branding (ex: "ThonAir Command Center")
  - Ajouter des icônes/favicons personnalisés pour chaque service
  - Configurer des alertes visuelles (rouge/orange) quand un service dépasse un seuil CPU/MEM
  - Ajouter un dark mode plus contrasté ou un thème qui match ton portfolio CyberOS

### 2. stats.thonair.com — Uptime Kuma
- **Outil** : Uptime Kuma (self-hosted)
- **Contenu** : Page de login standard Uptime Kuma
- **Améliorations possibles** :
  - Activer une **status page publique** pour montrer l'uptime de tes services sans login — c'est un excellent ajout pour ton portfolio (montre ta fiabilité d'infra)
  - Personnaliser la status page avec ton branding ThonAir
  - Ajouter des monitors pour tous tes sous-domaines
  - Configurer des notifications (Telegram, Discord, email) pour les downtimes

### 3. search.thonair.com — SearXNG
- **Outil** : SearXNG 2026.3.20
- **Contenu** : Instance fonctionnelle, thème sombre, propre
- **Améliorations possibles** :
  - Personnaliser le branding : remplacer le logo "SearXNG" par ton propre logo/nom
  - Configurer les moteurs de recherche préférés dans les Preferences
  - Activer les catégories utiles (IT, science, files)
  - Ajouter un mot de passe ou restriction d'accès si ce n'est pas déjà fait (éviter l'abus)

### 4. files.thonair.com — Synology Drive
- **Non accessible** (derrière auth) — C'est normal et sécurisé
- **Améliorations possibles** :
  - S'assurer que l'accès est bien protégé par Zero Trust Cloudflare
  - Activer le 2FA sur le compte Synology
  - Configurer des snapshots automatiques pour la protection des données

### 5. nas.thonair.com — Synology DSM
- **Non accessible** (derrière auth) — Normal
- **Améliorations possibles** :
  - Mettre à jour DSM régulièrement
  - Désactiver les ports inutiles
  - Configurer les alertes email pour l'état des disques (SMART)

### 6. pve.thonair.com — Proxmox VE
- **Non accessible** (derrière Zero Trust Cloudflare) — Bonne pratique
- **Améliorations possibles** :
  - Configurer des backups automatiques des VMs/LXCs
  - Mettre en place du HA (High Availability) si tu as un second noeud
  - Monitorer les températures et l'état des disques

---

## Ce qu'on peut faire dans ton portfolio (thonair.com)

Intégrer une commande `infra` ou `services` dans ton terminal CyberOS qui affiche ton infrastructure homelab de manière professionnelle. Cela montrerait aux recruteurs tes compétences en :
- Administration système (Proxmox, Synology)
- Self-hosting (SearXNG, Uptime Kuma)
- Sécurité réseau (Cloudflare Zero Trust)
- Monitoring (Uptime Kuma, homepage stats)

### Plan d'implémentation

1. **Ajouter une commande `infra`** dans Terminal.tsx qui affiche un tableau ASCII de tes services avec descriptions
2. **Ajouter une commande `status`** qui affiche les liens vers tes status pages (si tu actives la status page publique d'Uptime Kuma)
3. **Mettre à jour la commande `help`** pour inclure ces nouvelles commandes

### Détails techniques
- Fichier modifié : `src/components/Terminal.tsx`
- Ajout de handlers pour les commandes `infra` et `status` dans le switch/case existant
- Affichage en format ASCII art / tableau aligné pour rester cohérent avec le thème terminal

