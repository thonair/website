import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import MatrixRain from "./MatrixRain";
import { useIsMobile } from "@/hooks/use-mobile";

type OutputLine = {
  text: string;
  type: "system" | "command" | "output" | "error" | "ascii" | "highlight";
  delay?: number;
};

const CYBEROS_ASCII_DESKTOP = [
  "  ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ███████╗",
  " ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔════╝",
  " ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║   ██║███████╗",
  " ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║   ██║╚════██║",
  " ╚██████╗   ██║   ██████╔╝███████╗██║  ██║╚██████╔╝███████║",
  "  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝",
];

const CYBEROS_ASCII_MOBILE = [
  "  ╔═╗╦ ╦╔╗ ╔═╗╦═╗╔═╗╔═╗",
  "  ║  ╚╦╝╠╩╗║╣ ╠╦╝║ ║╚═╗",
  "  ╚═╝ ╩ ╚═╝╚═╝╩╚═╚═╝╚═╝",
];

const buildBootSequence = (mobile: boolean): OutputLine[] => [
  { text: "", type: "system" },
  ...(mobile ? CYBEROS_ASCII_MOBILE : CYBEROS_ASCII_DESKTOP).map(
    (text) => ({ text, type: "ascii" as const })
  ),
  { text: "", type: "system" },
  { text: "  Booting CyberOS v3.1...", type: "system", delay: 400 },
  { text: "  Chargement des modules de cybersécurité .............. [OK]", type: "system", delay: 300 },
  { text: "  Chargement du noyau security-core-v3.1 .............. [OK]", type: "system", delay: 250 },
  { text: "  Connexion à la matrice .............................. [OK]", type: "system", delay: 350 },
  { text: "  Initialisation du terminal sécurisé ................. [OK]", type: "system", delay: 200 },
  { text: "  Vérification des pare-feux .......................... [OK]", type: "system", delay: 150 },
  { text: "  Chargement des outils de pentest .................... [OK]", type: "system", delay: 200 },
  { text: "", type: "system" },
  { text: "  [████████████████████████████████████████████████] 100%", type: "highlight", delay: 600 },
  { text: "", type: "system" },
  { text: "  ✓ System Ready. Bienvenue, visiteur.", type: "highlight", delay: 300 },
  { text: "  Tape 'help' pour voir les commandes disponibles.", type: "system" },
  { text: "", type: "system" },
];

const ASCII_BANNER_DESKTOP = [
  "  ████████╗██╗  ██╗ ██████╗ ███╗   ██╗ █████╗ ██╗██████╗ ",
  "  ╚══██╔══╝██║  ██║██╔═══██╗████╗  ██║██╔══██╗██║██╔══██╗",
  "     ██║   ███████║██║   ██║██╔██╗ ██║███████║██║██████╔╝",
  "     ██║   ██╔══██║██║   ██║██║╚██╗██║██╔══██║██║██╔══██╗",
  "     ██║   ██║  ██║╚██████╔╝██║ ╚████║██║  ██║██║██║  ██║",
  "     ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝",
];

const ASCII_BANNER_MOBILE = [
  "  ╔╦╗╦ ╦╔═╗╔╗╔╔═╗╦╦═╗",
  "   ║ ╠═╣║ ║║║║╠═╣║╠╦╝",
  "   ╩ ╩ ╩╚═╝╝╚╝╩ ╩╩╩╚═",
];

const FORTUNES = [
  "\"The quieter you become, the more you are able to hear.\" - Kali Linux",
  "\"Hack the planet!\" - Hackers (1995)",
  "\"There is no patch for human stupidity.\" - Kevin Mitnick",
  "\"In the middle of difficulty lies opportunity.\" - Albert Einstein",
  "\"Security is not a product, but a process.\" - Bruce Schneier",
  "\"Given enough eyeballs, all bugs are shallow.\" - Linus's Law",
  "\"The only truly secure system is one that is powered off.\" - Gene Spafford",
  "\"Privacy is not for the passive.\" - Jeffrey Rosen",
  "\"It's not a bug, it's an undocumented feature.\"",
  "\"There are 10 types of people: those who understand binary and those who don't.\"",
];

const SUBDOMAINS = [
  { name: "home", host: "home.thonair.com", protected: false },
  { name: "files", host: "files.thonair.com", protected: true },
  { name: "nas", host: "nas.thonair.com", protected: true },
  { name: "pve", host: "pve.thonair.com", protected: true },
  { name: "search", host: "search.thonair.com", protected: false },
  { name: "stats", host: "stats.thonair.com", protected: false },
];

function processCommand(cmd: string, mobile: boolean = false): OutputLine[] {
  const trimmed = cmd.trim().toLowerCase();
  const lines: OutputLine[] = [];

  if (trimmed === "help") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "╔══════════════════════════════════════════════════╗", type: "highlight" });
    lines.push({ text: "║              COMMANDES DISPONIBLES               ║", type: "highlight" });
    lines.push({ text: "╠══════════════════════════════════════════════════╣", type: "highlight" });
    lines.push({ text: "║  ls              → liste les fichiers            ║", type: "output" });
    lines.push({ text: "║  cat [fichier]   → affiche le contenu            ║", type: "output" });
    lines.push({ text: "║  whoami          → qui suis-je ?                 ║", type: "output" });
    lines.push({ text: "║  banner          → affiche le banner ThonAir     ║", type: "output" });
    lines.push({ text: "║  skills          → compétences techniques        ║", type: "output" });
    lines.push({ text: "║  certifications  → certifications & formations   ║", type: "output" });
    lines.push({ text: "║  infra           → infrastructure homelab        ║", type: "output" });
    lines.push({ text: "║  network         → schéma réseau ASCII           ║", type: "output" });
    lines.push({ text: "║  status          → état live des services        ║", type: "output" });
    lines.push({ text: "║  ping [host]     → ping un sous-domaine          ║", type: "output" });
    lines.push({ text: "║  fortune         → citation aléatoire            ║", type: "output" });
    lines.push({ text: "║  date            → date actuelle                 ║", type: "output" });
    lines.push({ text: "║  neofetch        → infos système                 ║", type: "output" });
    lines.push({ text: "║  sudo rm -rf /   → 😈                            ║", type: "output" });
    lines.push({ text: "║  clear           → efface l'écran                ║", type: "output" });
    lines.push({ text: "╚══════════════════════════════════════════════════╝", type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "ls") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "📁 about.txt    📁 services.txt    📁 contact.txt    📁 projets.txt", type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "cat about" || trimmed === "cat about.txt") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌─────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│              À PROPOS DE BERA               │", type: "highlight" });
    lines.push({ text: "└─────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  Nom       : Mustafa Bera Tcholakov", type: "output" });
    lines.push({ text: "  Titre     : Étudiant en Cybersécurité", type: "output" });
    lines.push({ text: "  Passion   : Tech, Réseau, Cloud & Muscu 💪", type: "output" });
    lines.push({ text: "  Location  : 📍 Bruxelles, Belgique", type: "output" });
    lines.push({ text: "  Langues   : 🇫🇷 FR  |  🇬🇧 EN  |  🇳🇱 NL", type: "output" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  Passionné par la sécurité informatique et le", type: "system" });
    lines.push({ text: "  hacking éthique. Toujours en quête de nouvelles", type: "system" });
    lines.push({ text: "  vulnérabilités à explorer et de systèmes à", type: "system" });
    lines.push({ text: "  sécuriser. Quand je ne suis pas devant un", type: "system" });
    lines.push({ text: "  terminal, vous me trouverez à la salle de sport.", type: "system" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "cat services" || trimmed === "cat services.txt") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌─────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│             SERVICES PROPOSÉS                │", type: "highlight" });
    lines.push({ text: "└─────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  🔍  Analyse de sécurité réseau", type: "output" });
    lines.push({ text: "      Audit complet de votre infrastructure", type: "system" });
    lines.push({ text: "      réseau et identification des failles.", type: "system" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  🎣  Simulations de phishing & sensibilisation", type: "output" });
    lines.push({ text: "      Campagnes de test et formation de vos", type: "system" });
    lines.push({ text: "      équipes contre l'ingénierie sociale.", type: "system" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  ☁️   Sécurité Cloud (Azure, AWS)", type: "output" });
    lines.push({ text: "      Configuration et durcissement de vos", type: "system" });
    lines.push({ text: "      environnements cloud.", type: "system" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  📊  Monitoring & Patch Management", type: "output" });
    lines.push({ text: "      Surveillance continue et gestion des", type: "system" });
    lines.push({ text: "      mises à jour de sécurité.", type: "system" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "cat contact" || trimmed === "cat contact.txt") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌─────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│                 CONTACT                      │", type: "highlight" });
    lines.push({ text: "└─────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  📧  eslembera@gmail.com", type: "output" });
    lines.push({ text: "  📞  +32 0486 60 79 96", type: "output" });
    lines.push({ text: "  📍  Bruxelles, Belgique", type: "output" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  N'hésitez pas à me contacter pour toute", type: "system" });
    lines.push({ text: "  question ou collaboration !", type: "system" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "cat projets" || trimmed === "cat projets.txt") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌─────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│               PROJETS & LABS                 │", type: "highlight" });
    lines.push({ text: "└─────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  [01]  Home Lab - Environnement de pentest", type: "output" });
    lines.push({ text: "        Kali Linux, Metasploit, Burp Suite", type: "system" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  [02]  CTF Challenges", type: "output" });
    lines.push({ text: "        Participation active sur HackTheBox,", type: "system" });
    lines.push({ text: "        TryHackMe et Root-Me", type: "system" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  [03]  Sécurisation Cloud", type: "output" });
    lines.push({ text: "        Configuration sécurisée d'infra Azure/AWS", type: "system" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "whoami" || trimmed === "whois bera") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  bera@cyberos — Mustafa Bera Tcholakov", type: "highlight" });
    lines.push({ text: "  Étudiant en cybersécurité | Bruxelles 🇧🇪", type: "output" });
    lines.push({ text: "  Passionné de tech, réseau, cloud & muscu 💪", type: "output" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "banner") {
    lines.push({ text: "", type: "output" });
    const banner = mobile ? ASCII_BANNER_MOBILE : ASCII_BANNER_DESKTOP;
    banner.forEach((l) => lines.push({ text: l, type: "ascii" }));
    lines.push({ text: "", type: "output" });
    lines.push({ text: "        Cybersécurité • Réseau • Cloud", type: "highlight" });
    lines.push({ text: "           thonair.com | Bruxelles 🇧🇪", type: "system" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "skills") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌─────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│           COMPÉTENCES TECHNIQUES             │", type: "highlight" });
    lines.push({ text: "└─────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  Sécurité    ████████████████████░░  90%", type: "output" });
    lines.push({ text: "  Réseau      ██████████████████░░░░  80%", type: "output" });
    lines.push({ text: "  Cloud       ████████████████░░░░░░  70%", type: "output" });
    lines.push({ text: "  Linux       ██████████████████░░░░  80%", type: "output" });
    lines.push({ text: "  Scripting   ████████████████░░░░░░  70%", type: "output" });
    lines.push({ text: "  Muscu       ████████████████████████ 100% 💪", type: "highlight" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  Outils: Kali Linux, Metasploit, Burp Suite,", type: "system" });
    lines.push({ text: "  Wireshark, Nmap, Azure, AWS, Docker", type: "system" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "certifications" || trimmed === "certs") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌─────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│         CERTIFICATIONS & FORMATIONS          │", type: "highlight" });
    lines.push({ text: "└─────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  🎓  Étudiant en Cybersécurité", type: "output" });
    lines.push({ text: "  📚  En cours de certification...", type: "system" });
    lines.push({ text: "  🏆  CTF Player actif", type: "output" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "infra") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌──────────────────────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│                    INFRASTRUCTURE HOMELAB                     │", type: "highlight" });
    lines.push({ text: "├──────────────┬───────────────────────────────────────────────┤", type: "highlight" });
    lines.push({ text: "│  SERVICE     │  DESCRIPTION                                  │", type: "highlight" });
    lines.push({ text: "├──────────────┼───────────────────────────────────────────────┤", type: "highlight" });
    lines.push({ text: "│  Proxmox VE  │  Hyperviseur — VMs & containers LXC           │", type: "output" });
    lines.push({ text: "│  Synology    │  NAS — stockage, backups, partage fichiers     │", type: "output" });
    lines.push({ text: "│  SearXNG     │  Moteur de recherche self-hosted & privé       │", type: "output" });
    lines.push({ text: "│  Uptime Kuma │  Monitoring & alertes uptime des services      │", type: "output" });
    lines.push({ text: "│  Homarr      │  Dashboard centralisé avec stats live          │", type: "output" });
    lines.push({ text: "│  Cloudflare  │  Zero Trust — accès sécurisé & tunnels         │", type: "output" });
    lines.push({ text: "├──────────────┴───────────────────────────────────────────────┤", type: "highlight" });
    lines.push({ text: "│  🔒 Tous les services sont protégés par Cloudflare Zero Trust │", type: "system" });
    lines.push({ text: "│  📡 Hébergé sur serveur personnel — Bruxelles, BE             │", type: "system" });
    lines.push({ text: "└──────────────────────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "status") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌──────────────────────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│                     ÉTAT DES SERVICES                         │", type: "highlight" });
    lines.push({ text: "├──────────────┬───────────────────────────────────────────────┤", type: "highlight" });
    lines.push({ text: "│  home        │  ● EN LIGNE — home.thonair.com                │", type: "output" });
    lines.push({ text: "│  files       │  ● EN LIGNE — files.thonair.com  🔒           │", type: "output" });
    lines.push({ text: "│  nas         │  ● EN LIGNE — nas.thonair.com   🔒           │", type: "output" });
    lines.push({ text: "│  pve         │  ● EN LIGNE — pve.thonair.com   🔒           │", type: "output" });
    lines.push({ text: "│  search      │  ● EN LIGNE — search.thonair.com              │", type: "output" });
    lines.push({ text: "│  stats       │  ● EN LIGNE — stats.thonair.com               │", type: "output" });
    lines.push({ text: "├──────────────┴───────────────────────────────────────────────┤", type: "highlight" });
    lines.push({ text: "│  🔒 = Accès protégé par Cloudflare Zero Trust                │", type: "system" });
    lines.push({ text: "│  📊 Monitoring détaillé → stats.thonair.com                  │", type: "system" });
    lines.push({ text: "└──────────────────────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "network" || trimmed === "net") {
    lines.push({ text: "", type: "output" });
    if (mobile) {
      lines.push({ text: "  ┌─────────────────────┐", type: "highlight" });
      lines.push({ text: "  │  ARCHITECTURE NET   │", type: "highlight" });
      lines.push({ text: "  └─────────────────────┘", type: "highlight" });
      lines.push({ text: "", type: "output" });
      lines.push({ text: "      🌍 Internet", type: "output" });
      lines.push({ text: "          │", type: "system" });
      lines.push({ text: "          ▼", type: "system" });
      lines.push({ text: "  ┌──────────────┐", type: "output" });
      lines.push({ text: "  │ ☁ Cloudflare │", type: "highlight" });
      lines.push({ text: "  │  Zero Trust  │", type: "system" });
      lines.push({ text: "  └──────┬───────┘", type: "output" });
      lines.push({ text: "         │ tunnel", type: "system" });
      lines.push({ text: "         ▼", type: "system" });
      lines.push({ text: "  ┌──────────────┐", type: "output" });
      lines.push({ text: "  │ 🖥 Proxmox VE │", type: "highlight" });
      lines.push({ text: "  └──┬────────┬──┘", type: "output" });
      lines.push({ text: "     │        │", type: "system" });
      lines.push({ text: "     ▼        ▼", type: "system" });
      lines.push({ text: "   VMs       LXCs", type: "output" });
      lines.push({ text: "     │        │", type: "system" });
      lines.push({ text: "     └────┬───┘", type: "system" });
      lines.push({ text: "          ▼", type: "system" });
      lines.push({ text: "  ┌──────────────┐", type: "output" });
      lines.push({ text: "  │  SERVICES    │", type: "highlight" });
      lines.push({ text: "  ├──────────────┤", type: "output" });
      lines.push({ text: "  │ • SearXNG    │", type: "output" });
      lines.push({ text: "  │ • Uptime Kuma│", type: "output" });
      lines.push({ text: "  │ • Homarr     │", type: "output" });
      lines.push({ text: "  │ • Synology   │", type: "output" });
      lines.push({ text: "  └──────────────┘", type: "output" });
    } else {
      lines.push({ text: "┌────────────────────────────────────────────────────────────────┐", type: "highlight" });
      lines.push({ text: "│                  ARCHITECTURE RÉSEAU — THONAIR                 │", type: "highlight" });
      lines.push({ text: "└────────────────────────────────────────────────────────────────┘", type: "highlight" });
      lines.push({ text: "", type: "output" });
      lines.push({ text: "                          🌍  Internet", type: "output" });
      lines.push({ text: "                              │", type: "system" });
      lines.push({ text: "                              ▼", type: "system" });
      lines.push({ text: "                ┌───────────────────────────┐", type: "output" });
      lines.push({ text: "                │   ☁  Cloudflare DNS/CDN   │", type: "highlight" });
      lines.push({ text: "                │      Zero Trust Tunnel    │", type: "system" });
      lines.push({ text: "                └─────────────┬─────────────┘", type: "output" });
      lines.push({ text: "                              │ HTTPS / cloudflared", type: "system" });
      lines.push({ text: "                              ▼", type: "system" });
      lines.push({ text: "                ┌───────────────────────────┐", type: "output" });
      lines.push({ text: "                │   🖥  Proxmox VE (host)   │", type: "highlight" });
      lines.push({ text: "                │     Hyperviseur — KVM      │", type: "system" });
      lines.push({ text: "                └──────┬─────────────┬──────┘", type: "output" });
      lines.push({ text: "                       │             │", type: "system" });
      lines.push({ text: "             ┌─────────┘             └─────────┐", type: "system" });
      lines.push({ text: "             ▼                                  ▼", type: "system" });
      lines.push({ text: "      ┌─────────────┐                    ┌─────────────┐", type: "output" });
      lines.push({ text: "      │  VMs        │                    │  LXCs       │", type: "highlight" });
      lines.push({ text: "      │  (KVM)      │                    │ (containers)│", type: "system" });
      lines.push({ text: "      └──────┬──────┘                    └──────┬──────┘", type: "output" });
      lines.push({ text: "             │                                  │", type: "system" });
      lines.push({ text: "             └────────────────┬─────────────────┘", type: "system" });
      lines.push({ text: "                              ▼", type: "system" });
      lines.push({ text: "  ┌──────────────────────────────────────────────────────────────┐", type: "output" });
      lines.push({ text: "  │                       SERVICES SELF-HOSTED                    │", type: "highlight" });
      lines.push({ text: "  ├──────────────┬──────────────┬──────────────┬─────────────────┤", type: "output" });
      lines.push({ text: "  │  SearXNG     │  Uptime Kuma │   Homarr     │   Synology NAS  │", type: "output" });
      lines.push({ text: "  │  (search)    │  (monitoring)│  (dashboard) │   (storage)     │", type: "system" });
      lines.push({ text: "  └──────────────┴──────────────┴──────────────┴─────────────────┘", type: "output" });
      lines.push({ text: "", type: "output" });
      lines.push({ text: "  🔒 Tout le trafic externe transite par Cloudflare Zero Trust", type: "system" });
      lines.push({ text: "  📡 Aucun port direct ouvert vers Internet — tunnel sortant only", type: "system" });
    }
    lines.push({ text: "", type: "output" });
    const random = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    lines.push({ text: "", type: "output" });
    lines.push({ text: `  ${random}`, type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "date") {
    lines.push({ text: `  ${new Date().toLocaleString("fr-BE")}`, type: "output" });
  } else if (trimmed === "neofetch") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "         ▄▄▄▄▄▄▄▄▄▄▄       mbt@cyberos", type: "ascii" });
    lines.push({ text: "        ██████████████      ─────────────", type: "ascii" });
    lines.push({ text: "       ████████████████     OS: CyberOS v3.1", type: "output" });
    lines.push({ text: "      ██████████████████    Host: ThonAir Terminal", type: "output" });
    lines.push({ text: "     ████████████████████   Kernel: security-core-v3.1", type: "output" });
    lines.push({ text: "      ██████████████████    Shell: mbt-shell 1.0", type: "output" });
    lines.push({ text: "       ████████████████     Location: Bruxelles 🇧🇪", type: "output" });
    lines.push({ text: "        ██████████████      Uptime: always grinding", type: "output" });
    lines.push({ text: "         ▀▀▀▀▀▀▀▀▀▀▀       Languages: FR/EN/NL", type: "output" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "sudo rm -rf /" || trimmed === "sudo rm -rf") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  ⚠️  Nice try... 😏", type: "error" });
    lines.push({ text: "  Permission denied: tu croyais que j'allais", type: "error" });
    lines.push({ text: "  me laisser faire ?", type: "error" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "sudo reboot") {
    lines.push({ text: "  Rebooting system...", type: "system" });
    lines.push({ text: "  Lol non, pas aujourd'hui.", type: "error" });
  } else if (trimmed === "sudo make me a sandwich") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  🥪 Okay.", type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "clear") {
    return [{ text: "__CLEAR__", type: "system" }];
  } else if (trimmed === "") {
    return [];
  } else {
    lines.push({ text: `  bash: ${cmd.trim()}: commande introuvable`, type: "error" });
    lines.push({ text: "  Tape 'help' pour voir les commandes disponibles.", type: "system" });
  }

  return lines;
}

const Terminal = () => {
  const isMobile = useIsMobile();
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [input, setInput] = useState("");
  const [booted, setBooted] = useState(false);
  const [booting, setBooting] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const bootSequence = useMemo(() => buildBootSequence(isMobile), [isMobile]);

  // Boot sequence
  useEffect(() => {
    let i = 0;
    setLines([]);
    setBooted(false);
    setBooting(true);
    const bootTimer = setInterval(() => {
      if (i < bootSequence.length) {
        const currentLine = bootSequence[i];
        setLines((prev) => [...prev, currentLine]);
        i++;
      } else {
        clearInterval(bootTimer);
        setBooted(true);
        setBooting(false);
      }
    }, 80);
    return () => clearInterval(bootTimer);
  }, [bootSequence]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input
  useEffect(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);

  const handleFocusTerminal = useCallback(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!booted) return;

      const cmd = input;
      setInput("");
      setHistoryIndex(-1);

      if (cmd.trim()) {
        setCommandHistory((prev) => [cmd, ...prev]);
      }

      // Add command line
      setLines((prev) => [
        ...prev,
        { text: `mbt@cyberos:~$ ${cmd}`, type: "command" },
      ]);

      const result = processCommand(cmd, isMobile);
      if (result.length === 1 && result[0].text === "__CLEAR__") {
        setLines([]);
      } else {
        setLines((prev) => [...prev, ...result]);
      }
    },
    [input, booted, isMobile]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        } else {
          setHistoryIndex(-1);
          setInput("");
        }
      }
    },
    [commandHistory, historyIndex]
  );

  const getLineColor = (type: OutputLine["type"]) => {
    switch (type) {
      case "ascii":
        return "text-foreground text-glow-strong";
      case "highlight":
        return "text-foreground text-glow";
      case "command":
        return "text-foreground";
      case "error":
        return "text-terminal-red";
      case "system":
        return "text-muted-foreground";
      case "output":
      default:
        return "text-foreground opacity-90";
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background p-2 sm:p-4 md:p-8 relative overflow-hidden">
      {/* Matrix Rain background */}
      <MatrixRain />
      {/* CRT Scanlines overlay */}
      <div className="crt-scanlines" />

      {/* Terminal window */}
      <div className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col rounded-lg overflow-hidden border border-border shadow-2xl shadow-primary/10">
        {/* Title bar */}
        <div className="flex items-center px-4 py-2.5 bg-terminal-header border-b border-border">
          <div className="flex gap-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-terminal-red opacity-80 hover:opacity-100 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-terminal-amber opacity-80 hover:opacity-100 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-foreground opacity-80 hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-sm text-muted-foreground font-mono">
              Terminal — mbt@cyberos
            </span>
          </div>
          <div className="w-16" />
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          onClick={handleFocusTerminal}
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background crt-flicker cursor-text font-mono text-sm leading-relaxed"
        >
          {/* Output lines */}
          {lines.map((line, i) => (
            <div
              key={i}
              className={`${getLineColor(line.type)} whitespace-pre-wrap animate-fade-in-line`}
              style={{ animationDelay: booting ? `${i * 20}ms` : "0ms" }}
            >
              {line.text || "\u00A0"}
            </div>
          ))}

          {/* Input line */}
          {booted && (
            <form onSubmit={handleSubmit} className="flex items-center mt-1">
              <span className="text-foreground text-glow whitespace-pre">
                mbt@cyberos:~${" "}
              </span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-foreground text-glow outline-none caret-transparent font-mono text-sm"
                  spellCheck={false}
                  autoComplete="off"
                  autoFocus
                />
                {/* Custom cursor */}
                <span
                  className="absolute top-0 animate-cursor-blink bg-foreground"
                  style={{
                    left: `${input.length}ch`,
                    width: "0.6ch",
                    height: "1.2em",
                    opacity: 0.9,
                  }}
                />
              </div>
            </form>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-terminal-header border-t border-border text-xs text-muted-foreground font-mono">
          <span>CyberOS v3.1</span>
          <span>thonair.com</span>
          <span>Bruxelles 🇧🇪</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
