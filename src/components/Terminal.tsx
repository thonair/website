import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const MatrixRain = lazy(() => import("./MatrixRain"));

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
  { text: "__PROGRESS__", type: "highlight", delay: 600 },
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

// ASCII representation of the ThonAir logo (circle + double lightning)
const THONAIR_LOGO_DESKTOP = [
  "             `,;!iIIii!,             ",
  "         '!l|+|lIIIIIllI: `iIlIii:,'",
  "       :i|*+!:`     ,;l:,;+*+**?o0?l`",
  "     `I?*!`      `;Il|ii|l+|++*oo*!` ",
  "    ,+?I,     ';Il+*+Il++|++*?0?l;   ",
  "   ,+oI'    `!++||?+|+|||+*?0*I;i*!  ",
  "  '!o|`   ;Il+IIl+*+*+|++*00oI,`!?+: ",
  "  `|oI`,!++|I!I**+oo*+|+++??o??+l|oi ",
  "  `|ol:lo?*li!!i|+*???o?+|+?o?|;;|?! ",
  "  'iol,':i+o?I!!!i+*+*?+*??+i,  ;?*: ",
  "   :+*;`:l**li!i|*||***?*|;'   ,|ol' ",
  "    ,!il+*li!!Il|Il*??+i,     :+oI`  ",
  "    ,I?*Ii!!i||i;I*|I:'     `i??i'   ",
  "  '!?o?+|IIlll::;I:`     ,!l**I,     ",
  "   `;iIl|l|l:'`!lii!IIll|**l!`       ",
  "          '   ':lIl+++|!;,'          ",
];

const THONAIR_LOGO_MOBILE = [
  "      :!iiIII! '::`'   ",
  "   'iII:` `:i!;|+*?*!  ",
  "  ,+I'  `!l+l|++*?+i   ",
  " '*I  ;I||**+++ooi;+:  ",
  " :?;i*|ii|*?**+?o+i+I  ",
  " '*i,I?l!i|+*?*l; ,?;  ",
  "  ,II|iiIl|*|i`  :*i   ",
  " 'I?+III!!i:' `;ll:    ",
  "  `,:;; `IIl|II!`      ",
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

const PROJECTS: Record<
  string,
  { title: string; stack: string[]; summary: string[]; links?: string[] }
> = {
  "01": {
    title: "Home Lab — Environnement de pentest",
    stack: ["Kali Linux", "Metasploit", "Burp Suite", "Nmap", "Wireshark"],
    summary: [
      "Lab isolé sur Proxmox pour pratiquer le pentest offensif :",
      "  - Réseau segmenté (VLANs) + machines vulnérables (DVWA, Metasploitable)",
      "  - Workflow reconnaissance → exploitation → post-exploit → reporting",
    ],
  },
  "02": {
    title: "CTF Challenges",
    stack: ["HackTheBox", "TryHackMe", "Root-Me", "PicoCTF"],
    summary: [
      "Participation régulière à des CTF (web, crypto, reverse, pwn).",
      "  - Focus sur l'exploitation web et l'escalade de privilèges Linux",
      "  - Writeups privés pour suivre la progression",
    ],
  },
  "03": {
    title: "Sécurisation Cloud",
    stack: ["Azure", "AWS", "Terraform", "Defender for Cloud"],
    summary: [
      "Configuration sécurisée d'infrastructures cloud :",
      "  - IAM least-privilege, MFA, conditional access",
      "  - Monitoring (Sentinel/GuardDuty), durcissement réseau",
    ],
  },
};

const COMMANDS = [
  "help", "ls", "cat", "whoami", "banner", "skills", "certifications", "certs",
  "infra", "network", "net", "status", "ping", "traceroute", "tracert",
  "fortune", "date", "neofetch", "theme", "matrix", "hack", "coffee",
  "clear", "sudo",
];

const FILES = ["about", "services", "contact", "projets", "projets/01", "projets/02", "projets/03"];

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
    lines.push({ text: "║  traceroute [h]  → trace la route réseau         ║", type: "output" });
    lines.push({ text: "║  fortune         → citation aléatoire            ║", type: "output" });
    lines.push({ text: "║  date            → date actuelle                 ║", type: "output" });
    lines.push({ text: "║  neofetch        → infos système                 ║", type: "output" });
    lines.push({ text: "║  theme [name]    → matrix | amber | cyan         ║", type: "output" });
    lines.push({ text: "║  matrix          → easter egg 🌧                 ║", type: "output" });
    lines.push({ text: "║  hack            → scan de ports animé           ║", type: "output" });
    lines.push({ text: "║  coffee          → ☕                            ║", type: "output" });
    lines.push({ text: "║  sudo rm -rf /   → 😈                            ║", type: "output" });
    lines.push({ text: "║  clear           → efface l'écran                ║", type: "output" });
    lines.push({ text: "╠══════════════════════════════════════════════════╣", type: "highlight" });
    lines.push({ text: "║  💡 Tab = autocomplétion  ·  ↑/↓ = historique    ║", type: "system" });
    lines.push({ text: "╚══════════════════════════════════════════════════╝", type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "ls") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "📁 about.txt    📁 services.txt    📁 contact.txt    📁 projets/", type: "highlight" });
    lines.push({ text: "   projets/01.txt   projets/02.txt   projets/03.txt", type: "system" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "cat about" || trimmed === "cat about.txt") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "┌─────────────────────────────────────────────┐", type: "highlight" });
    lines.push({ text: "│              À PROPOS DE BERA               │", type: "highlight" });
    lines.push({ text: "└─────────────────────────────────────────────┘", type: "highlight" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  Nom       : Mustafa Bera Tcholakov", type: "output" });
    lines.push({ text: "  Titre     : Étudiant en Cybersécurité", type: "output" });
    lines.push({ text: "  Focus     : Sécurité offensive, réseau & cloud", type: "output" });
    lines.push({ text: "  Location  : 📍 Bruxelles, Belgique", type: "output" });
    lines.push({ text: "  Langues   : 🇫🇷 FR  |  🇬🇧 EN  |  🇳🇱 NL", type: "output" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  Passionné par la sécurité informatique et le", type: "system" });
    lines.push({ text: "  hacking éthique. Toujours en quête de nouvelles", type: "system" });
    lines.push({ text: "  vulnérabilités à explorer et de systèmes à", type: "system" });
    lines.push({ text: "  sécuriser, sur mon homelab comme sur le terrain.", type: "system" });
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
    lines.push({ text: "  🐙  __GH__https://github.com/BeraTch", type: "output" });
    lines.push({ text: "  💼  __LI__https://www.linkedin.com/in/mustafa-bera-tcholakov", type: "output" });
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
    Object.entries(PROJECTS).forEach(([id, p]) => {
      lines.push({ text: `  [${id}]  ${p.title}`, type: "output" });
      lines.push({ text: `        ${p.stack.join(", ")}`, type: "system" });
      lines.push({ text: "", type: "output" });
    });
    lines.push({ text: "  💡 Tape 'cat projets/01' pour le détail.", type: "system" });
    lines.push({ text: "", type: "output" });
  } else if (/^cat projets\/(\d{2})(\.txt)?$/.test(trimmed)) {
    const id = trimmed.match(/^cat projets\/(\d{2})/)![1];
    const p = PROJECTS[id];
    lines.push({ text: "", type: "output" });
    if (!p) {
      lines.push({ text: `  cat: projets/${id}: aucun projet`, type: "error" });
    } else {
      lines.push({ text: "┌─────────────────────────────────────────────┐", type: "highlight" });
      lines.push({ text: `│  PROJET ${id} — ${p.title.padEnd(28).slice(0, 28)} │`, type: "highlight" });
      lines.push({ text: "└─────────────────────────────────────────────┘", type: "highlight" });
      lines.push({ text: "", type: "output" });
      lines.push({ text: `  Stack : ${p.stack.join(", ")}`, type: "output" });
      lines.push({ text: "", type: "output" });
      p.summary.forEach((s) => lines.push({ text: `  ${s}`, type: "system" }));
    }
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "whoami" || trimmed === "whois bera") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  bera@cyberos — Mustafa Bera Tcholakov", type: "highlight" });
    lines.push({ text: "  Étudiant en cybersécurité | Bruxelles 🇧🇪", type: "output" });
    lines.push({ text: "  Sécurité offensive • Réseau • Cloud • Self-host", type: "output" });
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
    lines.push({ text: "  Self-host   ██████████████████░░░░  80%", type: "output" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  Outils: Kali Linux, Metasploit, Burp Suite,", type: "system" });
    lines.push({ text: "  Wireshark, Nmap, Azure, AWS, Docker, Proxmox", type: "system" });
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
    lines.push({ text: "__STATUS_LIVE__", type: "system" });
  } else if (trimmed === "traceroute" || trimmed === "tracert" || trimmed.startsWith("traceroute ") || trimmed.startsWith("tracert ")) {
    lines.push({ text: "__TRACEROUTE__" + trimmed.replace(/^(traceroute|tracert)\s*/, ""), type: "system" });
  } else if (trimmed === "matrix") {
    lines.push({ text: "__MATRIX_BOOST__", type: "system" });
  } else if (trimmed === "hack" || trimmed === "hack the planet") {
    lines.push({ text: "__HACK__", type: "system" });
  } else if (trimmed === "coffee" || trimmed === "brew coffee") {
    lines.push({ text: "", type: "output" });
    lines.push({ text: "        (  )   (   )  )", type: "ascii" });
    lines.push({ text: "         ) (   )  (  (", type: "ascii" });
    lines.push({ text: "         ( )  (    ) )", type: "ascii" });
    lines.push({ text: "        _____________", type: "ascii" });
    lines.push({ text: "       <_____________> ___", type: "ascii" });
    lines.push({ text: "       |             |/ _ \\", type: "ascii" });
    lines.push({ text: "       |               | | |", type: "ascii" });
    lines.push({ text: "       |               |_| |", type: "ascii" });
    lines.push({ text: "    ___|             |\\___/", type: "ascii" });
    lines.push({ text: "   /    \\___________/    \\", type: "ascii" });
    lines.push({ text: "   \\_____________________/", type: "ascii" });
    lines.push({ text: "", type: "output" });
    lines.push({ text: "  ☕ Un café bien serré, comme il se doit.", type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed.startsWith("theme")) {
    const arg = trimmed.replace(/^theme\s*/, "").trim();
    if (!arg) {
      lines.push({ text: "", type: "output" });
      lines.push({ text: "  Usage: theme [matrix|amber|cyan]", type: "system" });
      lines.push({ text: "  Thème actuel sauvegardé dans le navigateur.", type: "system" });
      lines.push({ text: "", type: "output" });
    } else if (["matrix", "green", "amber", "cyan"].includes(arg)) {
      lines.push({ text: "__THEME__" + (arg === "green" ? "matrix" : arg), type: "system" });
    } else {
      lines.push({ text: `  theme: '${arg}' inconnu. Essaye matrix, amber ou cyan.`, type: "error" });
    }
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
  } else if (trimmed === "fortune") {
    const random = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    lines.push({ text: "", type: "output" });
    lines.push({ text: `  ${random}`, type: "highlight" });
    lines.push({ text: "", type: "output" });
  } else if (trimmed === "ping" || trimmed.startsWith("ping ")) {
    const arg = trimmed === "ping" ? "" : trimmed.slice(5).trim();
    const targets = arg
      ? SUBDOMAINS.filter(
          (s) => s.name === arg || s.host === arg || arg === s.host.split(".")[0],
        )
      : SUBDOMAINS;
    lines.push({ text: "", type: "output" });
    if (targets.length === 0) {
      lines.push({ text: `  ping: ${arg}: hôte inconnu`, type: "error" });
      lines.push({ text: `  Cibles disponibles: ${SUBDOMAINS.map((s) => s.name).join(", ")}`, type: "system" });
      lines.push({ text: "", type: "output" });
    } else {
      targets.forEach((t) => {
        const seq = Math.floor(Math.random() * 4) + 3;
        const lat = (Math.random() * 30 + 8).toFixed(1);
        const ttl = 50 + Math.floor(Math.random() * 14);
        lines.push({
          text: `  64 bytes from ${t.host}: icmp_seq=${seq} ttl=${ttl} time=${lat} ms ${t.protected ? "🔒" : ""}`,
          type: "output",
        });
      });
      const avg = (Math.random() * 25 + 10).toFixed(2);
      lines.push({ text: "", type: "output" });
      lines.push({
        text: `  --- ping statistics --- ${targets.length} packets transmitted, ${targets.length} received, 0% loss, avg ${avg} ms`,
        type: "system",
      });
      lines.push({ text: "", type: "output" });
    }
  } else if (trimmed === "date") {
    lines.push({ text: `  ${new Date().toLocaleString("fr-BE")}`, type: "output" });
  } else if (trimmed === "neofetch") {
    const logo = mobile ? THONAIR_LOGO_MOBILE : THONAIR_LOGO_DESKTOP;
    const info = [
      "  mbt@cyberos",
      "  ─────────────",
      "  OS: CyberOS v3.1",
      "  Host: ThonAir Terminal",
      "  Kernel: security-core-v3.1",
      "  Shell: mbt-shell 1.0",
      "  Location: Bruxelles 🇧🇪",
      "  Uptime: 24/7 self-hosted",
      "  Languages: FR / EN / NL",
      "  Theme: $(theme)",
    ];
    lines.push({ text: "", type: "output" });
    if (mobile) {
      logo.forEach((l) => lines.push({ text: l, type: "ascii" }));
      lines.push({ text: "", type: "output" });
      info.forEach((l) => lines.push({ text: l, type: "output" }));
    } else {
      const logoWidth = Math.max(...logo.map((l) => l.length));
      const startInfo = Math.max(0, Math.floor((logo.length - info.length) / 2));
      const max = Math.max(logo.length, info.length + startInfo);
      for (let i = 0; i < max; i++) {
        const left = (logo[i] ?? "").padEnd(logoWidth, " ");
        const infoIdx = i - startInfo;
        const right = infoIdx >= 0 && infoIdx < info.length ? info[infoIdx] : "";
        lines.push({ text: `${left}  ${right}`, type: "ascii" });
      }
    }
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

// Render a terminal line, turning hostnames + GH/LinkedIn markers into clickable links
function renderLineContent(text: string): React.ReactNode {
  if (!text) return "\u00A0";

  // Special markers for social links
  const ghMatch = text.match(/^(.*?)__GH__(\S+)(.*)$/);
  if (ghMatch) {
    return (
      <>
        {ghMatch[1]}
        <a
          href={ghMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 text-glow hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          GitHub — {ghMatch[2].replace(/^https?:\/\//, "")}
        </a>
        {ghMatch[3]}
      </>
    );
  }
  const liMatch = text.match(/^(.*?)__LI__(\S+)(.*)$/);
  if (liMatch) {
    return (
      <>
        {liMatch[1]}
        <a
          href={liMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 text-glow hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          LinkedIn — Mustafa Bera Tcholakov
        </a>
        {liMatch[3]}
      </>
    );
  }

  const regex = /([a-z0-9-]+\.thonair\.com)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const host = match[0];
    parts.push(
      <a
        key={`lnk-${key++}`}
        href={`https://${host}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 text-glow hover:text-primary transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {host}
      </a>
    );
    lastIndex = match.index + host.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : text;
}

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const HISTORY_KEY = "thonair_cmd_history";
const THEME_KEY = "thonair_theme";

const Terminal = () => {
  const isMobile = useIsMobile();
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [input, setInput] = useState("");
  const [booted, setBooted] = useState(false);
  const [booting, setBooting] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestion, setSuggestion] = useState("");
  const [matrixBoost, setMatrixBoost] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const bootSequence = useMemo(() => buildBootSequence(isMobile), [isMobile]);

  // Apply persisted theme on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) || "matrix";
    document.body.classList.remove("theme-amber", "theme-cyan");
    if (stored === "amber") document.body.classList.add("theme-amber");
    else if (stored === "cyan") document.body.classList.add("theme-cyan");
  }, []);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(commandHistory.slice(0, 50)));
    } catch { /* ignore */ }
  }, [commandHistory]);

  // Boot sequence
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    setLines([]);
    setBooted(false);
    setBooting(true);

    const buildProgressLine = (pct: number) => {
      const total = isMobile ? 24 : 48;
      const filled = Math.round((pct / 100) * total);
      const bar = "█".repeat(filled) + "░".repeat(total - filled);
      return `  [${bar}] ${String(pct).padStart(3, " ")}%`;
    };

    const animateProgress = (onDone: () => void) => {
      setLines((prev) => [...prev, { text: buildProgressLine(0), type: "highlight" }]);
      let pct = 0;
      const step = 4;
      const tick = setInterval(() => {
        if (cancelled) { clearInterval(tick); return; }
        pct = Math.min(100, pct + step);
        setLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = { text: buildProgressLine(pct), type: "highlight" };
          return next;
        });
        if (pct >= 100) {
          clearInterval(tick);
          setTimeout(onDone, 250);
        }
      }, 60);
    };

    const advance = () => {
      if (cancelled) return;
      if (i >= bootSequence.length) {
        setBooted(true);
        setBooting(false);
        return;
      }
      const currentLine = bootSequence[i];
      i++;
      if (currentLine.text === "__PROGRESS__") {
        animateProgress(advance);
        return;
      }
      setLines((prev) => [...prev, currentLine]);
      setTimeout(advance, 80);
    };

    const startTimer = setTimeout(advance, 80);
    return () => { cancelled = true; clearTimeout(startTimer); };
  }, [bootSequence, isMobile]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  // Focus input
  useEffect(() => { if (booted) inputRef.current?.focus(); }, [booted]);

  const handleFocusTerminal = useCallback(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);

  const runStatusCommand = useCallback(async () => {
    // animated spinner placeholder
    let spinIdx = 0;
    setLines((prev) => [
      ...prev,
      { text: "", type: "output" },
      { text: `  ${SPINNER[0]} Interrogation de stats.thonair.com (Uptime Kuma)...`, type: "system" },
    ]);
    const spinTick = setInterval(() => {
      spinIdx = (spinIdx + 1) % SPINNER.length;
      setLines((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].text.includes("Interrogation de stats.thonair.com")) {
            next[i] = { ...next[i], text: `  ${SPINNER[spinIdx]} Interrogation de stats.thonair.com (Uptime Kuma)...` };
            break;
          }
        }
        return next;
      });
    }, 100);

    type Row = { name: string; host: string; up: boolean | null; protected: boolean; uptime?: number };
    const rows: Row[] = SUBDOMAINS.map((s) => ({ ...s, up: null }));
    let liveSource: "kuma" | "fallback" = "fallback";

    try {
      const slugs = ["thonair", "default", "status"];
      let heartbeat: any = null;
      for (const slug of slugs) {
        try {
          const res = await fetch(
            `https://stats.thonair.com/api/status-page/heartbeat/${slug}`,
            { cache: "no-store" },
          );
          if (res.ok) { heartbeat = await res.json(); liveSource = "kuma"; break; }
        } catch { /* try next slug */ }
      }

      if (heartbeat?.heartbeatList) {
        const uptimeList = heartbeat.uptimeList ?? {};
        Object.values(heartbeat.heartbeatList).forEach((arr: any) => {
          if (!Array.isArray(arr) || arr.length === 0) return;
          const last = arr[arr.length - 1];
          const monitorName: string = String(last?.name || last?.monitor_name || "").toLowerCase();
          rows.forEach((r) => {
            if (monitorName.includes(r.name) || monitorName.includes(r.host)) {
              r.up = last?.status === 1;
            }
          });
        });
        Object.entries(uptimeList).forEach(([key, val]) => {
          const k = String(key).toLowerCase();
          rows.forEach((r) => {
            if (k.includes(r.name) || k.includes(r.host)) {
              r.uptime = typeof val === "number" ? val * 100 : undefined;
            }
          });
        });
      }
    } catch { liveSource = "fallback"; }

    if (liveSource === "fallback") {
      await Promise.all(
        rows.map(async (r) => {
          try {
            await fetch(`https://${r.host}/favicon.ico`, { mode: "no-cors", cache: "no-store" });
            r.up = true;
          } catch { r.up = null; }
        }),
      );
    }

    clearInterval(spinTick);

    const pad = (s: string, n: number) => s + " ".repeat(Math.max(0, n - s.length));
    const fmtRow = (r: Row) => {
      const dot = r.up === true ? "●" : r.up === false ? "✕" : "○";
      const label = r.up === true ? "EN LIGNE" : r.up === false ? "DOWN    " : "INCONNU ";
      const lock = r.protected ? "🔒" : "  ";
      const upt = r.uptime !== undefined ? `${r.uptime.toFixed(2)}%` : "  —   ";
      return `│  ${pad(r.name, 8)}  │  ${dot} ${label} — ${pad(r.host, 22)} ${lock}  │  ${pad(upt, 7)} │`;
    };

    const output: OutputLine[] = [
      { text: "", type: "output" },
      { text: "┌────────────────────────────────────────────────────────────────────┐", type: "highlight" },
      { text: "│                      ÉTAT LIVE DES SERVICES                        │", type: "highlight" },
      { text: "├────────────┬─────────────────────────────────────────┬─────────────┤", type: "highlight" },
      { text: "│  SERVICE   │  ÉTAT                                    │   UPTIME    │", type: "highlight" },
      { text: "├────────────┼─────────────────────────────────────────┼─────────────┤", type: "highlight" },
      ...rows.map((r) => ({ text: fmtRow(r), type: "output" as const })),
      { text: "├────────────┴─────────────────────────────────────────┴─────────────┤", type: "highlight" },
      {
        text:
          liveSource === "kuma"
            ? "│  📡 Source: Uptime Kuma — stats.thonair.com (live)                 │"
            : "│  ⚠ Uptime Kuma indisponible — sondage navigateur best-effort      │",
        type: "system",
      },
      { text: "│  🔒 = Accès protégé par Cloudflare Zero Trust                      │", type: "system" },
      { text: "└────────────────────────────────────────────────────────────────────┘", type: "highlight" },
      { text: "", type: "output" },
    ];

    setLines((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].text.includes("Interrogation de stats.thonair.com")) {
          next.splice(i - 1, 2);
          break;
        }
      }
      return [...next, ...output];
    });
  }, []);

  const runTraceroute = useCallback((targetArg: string) => {
    const target = targetArg.trim() || "home.thonair.com";
    const match = SUBDOMAINS.find(
      (s) => s.name === target || s.host === target || target === s.host.split(".")[0],
    );
    const host = match ? match.host : target;

    const hops = [
      { name: "router.local", ip: "192.168.1.1" },
      { name: "isp-gateway.brussels.be", ip: "84.198.x.x" },
      { name: "cloudflare-edge", ip: "1.1.1.1" },
      { name: "cf-tunnel.thonair", ip: "172.x.x.x" },
      { name: "proxmox.thonair.lan", ip: "10.0.0.2" },
      { name: host, ip: "10.0.0.x" },
    ];

    setLines((prev) => [
      ...prev,
      { text: "", type: "output" },
      { text: `  traceroute to ${host}, 30 hops max`, type: "system" },
    ]);

    let i = 0;
    const tick = () => {
      if (i >= hops.length) return;
      const h = hops[i];
      const lat1 = (Math.random() * 20 + 1).toFixed(1);
      const lat2 = (Math.random() * 20 + 1).toFixed(1);
      const lat3 = (Math.random() * 20 + 1).toFixed(1);
      setLines((prev) => [
        ...prev,
        {
          text: `  ${String(i + 1).padStart(2, " ")}  ${h.name.padEnd(28, " ")} (${h.ip.padEnd(14, " ")})  ${lat1} ms  ${lat2} ms  ${lat3} ms`,
          type: "output",
        },
      ]);
      i++;
      setTimeout(tick, 250);
    };
    setTimeout(tick, 200);
    setTimeout(() => {
      setLines((prev) => [
        ...prev,
        { text: "", type: "output" },
        { text: `  ✓ Trace complète — ${hops.length} hops, destination atteinte.`, type: "highlight" },
        { text: "", type: "output" },
      ]);
    }, 200 + hops.length * 250 + 100);
  }, []);

  const runHack = useCallback(() => {
    const target = "203.0.113.42";
    const ports = [22, 80, 443, 3306, 8080, 5432, 6379, 9000];
    setLines((prev) => [
      ...prev,
      { text: "", type: "output" },
      { text: `  [*] Initiating scan on ${target}...`, type: "system" },
      { text: "  [*] Resolving target... OK", type: "system" },
    ]);
    let i = 0;
    const tick = () => {
      if (i >= ports.length) {
        setLines((prev) => [
          ...prev,
          { text: "", type: "output" },
          { text: "  [✓] Scan complete. Just kidding — c'est un script de démo 😉", type: "highlight" },
          { text: "", type: "output" },
        ]);
        return;
      }
      const p = ports[i];
      const open = Math.random() > 0.5;
      setLines((prev) => [
        ...prev,
        {
          text: `  [+] Port ${String(p).padStart(5, " ")}/tcp  →  ${open ? "OPEN  " : "closed"}  ${open ? "🟢" : "·"}`,
          type: open ? "output" : "system",
        },
      ]);
      i++;
      setTimeout(tick, 180);
    };
    setTimeout(tick, 300);
  }, []);

  const applyTheme = useCallback((name: string) => {
    document.body.classList.remove("theme-amber", "theme-cyan");
    if (name === "amber") document.body.classList.add("theme-amber");
    else if (name === "cyan") document.body.classList.add("theme-cyan");
    localStorage.setItem(THEME_KEY, name);
    setLines((prev) => [
      ...prev,
      { text: "", type: "output" },
      { text: `  ✓ Thème activé : ${name}`, type: "highlight" },
      { text: "", type: "output" },
    ]);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!booted) return;

      const cmd = input;
      setInput("");
      setSuggestion("");
      setHistoryIndex(-1);

      if (cmd.trim()) {
        setCommandHistory((prev) => [cmd, ...prev].slice(0, 50));
      }

      setLines((prev) => [...prev, { text: `mbt@cyberos:~$ ${cmd}`, type: "command" }]);

      const result = processCommand(cmd, isMobile);
      if (result.length === 1 && result[0].text === "__CLEAR__") {
        setLines([]);
        return;
      }
      if (result.length === 1 && result[0].text === "__STATUS_LIVE__") {
        runStatusCommand();
        return;
      }
      if (result.length === 1 && result[0].text.startsWith("__TRACEROUTE__")) {
        runTraceroute(result[0].text.replace("__TRACEROUTE__", ""));
        return;
      }
      if (result.length === 1 && result[0].text === "__HACK__") {
        runHack();
        return;
      }
      if (result.length === 1 && result[0].text === "__MATRIX_BOOST__") {
        setMatrixBoost(true);
        setLines((prev) => [
          ...prev,
          { text: "", type: "output" },
          { text: "  ▒▓█ Wake up, Neo... █▓▒", type: "highlight" },
          { text: "", type: "output" },
        ]);
        setTimeout(() => setMatrixBoost(false), 5000);
        return;
      }
      if (result.length === 1 && result[0].text.startsWith("__THEME__")) {
        applyTheme(result[0].text.replace("__THEME__", ""));
        return;
      }
      setLines((prev) => [...prev, ...result]);
    },
    [input, booted, isMobile, runStatusCommand, runTraceroute, runHack, applyTheme]
  );

  // Tab completion
  const computeCompletion = useCallback((value: string): string => {
    if (!value) return "";
    const lower = value.toLowerCase();
    // file completion for 'cat '
    if (lower.startsWith("cat ")) {
      const partial = lower.slice(4);
      const match = FILES.find((f) => f.startsWith(partial));
      return match ? "cat " + match : "";
    }
    // ping/traceroute host completion
    const hostCmds = ["ping ", "traceroute ", "tracert "];
    for (const hc of hostCmds) {
      if (lower.startsWith(hc)) {
        const partial = lower.slice(hc.length);
        const match = SUBDOMAINS.find((s) => s.name.startsWith(partial));
        return match ? hc + match.name : "";
      }
    }
    if (lower.startsWith("theme ")) {
      const partial = lower.slice(6);
      const match = ["matrix", "amber", "cyan"].find((t) => t.startsWith(partial));
      return match ? "theme " + match : "";
    }
    const match = COMMANDS.find((c) => c.startsWith(lower));
    return match || "";
  }, []);

  useEffect(() => {
    if (!input) { setSuggestion(""); return; }
    const c = computeCompletion(input);
    setSuggestion(c && c.toLowerCase() !== input.toLowerCase() ? c : "");
  }, [input, computeCompletion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (suggestion) setInput(suggestion);
        return;
      }
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
    [commandHistory, historyIndex, suggestion]
  );

  const getLineColor = (type: OutputLine["type"]) => {
    switch (type) {
      case "ascii": return "text-foreground text-glow-strong";
      case "highlight": return "text-foreground text-glow";
      case "command": return "text-foreground";
      case "error": return "text-terminal-red";
      case "system": return "text-muted-foreground";
      case "output":
      default: return "text-foreground opacity-90";
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background p-2 sm:p-4 md:p-8 relative overflow-hidden">
      <Suspense fallback={null}>
        <MatrixRain boost={matrixBoost} />
      </Suspense>
      <div className="crt-scanlines" />

      <div className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col rounded-lg overflow-hidden border border-border shadow-2xl shadow-primary/10">
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

        <div
          ref={scrollRef}
          onClick={handleFocusTerminal}
          aria-live="polite"
          aria-label="Terminal output"
          role="log"
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background crt-flicker cursor-text font-mono text-sm leading-relaxed"
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={`${getLineColor(line.type)} whitespace-pre-wrap animate-fade-in-line`}
              style={{ animationDelay: booting ? `${i * 20}ms` : "0ms" }}
            >
              {renderLineContent(line.text)}
            </div>
          ))}

          {booted && (
            <form onSubmit={handleSubmit} className="flex items-center mt-1">
              <span className="text-foreground text-glow whitespace-pre">
                mbt@cyberos:~${" "}
              </span>
              <div className="relative flex-1">
                {/* ghost suggestion */}
                {suggestion && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 font-mono text-sm pointer-events-none text-muted-foreground/60 whitespace-pre"
                  >
                    <span className="invisible">{input}</span>
                    {suggestion.slice(input.length)}
                  </span>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-foreground text-glow outline-none caret-transparent font-mono text-sm relative"
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal command input"
                  autoFocus
                />
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
