// LANGUE DE L'INTERFACE
import { S } from "./state.js";
import { setSeo } from "./seo.js";
import { lsSet } from "./utils.js";
import { toast } from "./ui.js";

export const LANGS = ["fr", "en"];

// Phrases remplacées quand l'anglais est actif. Les plus longues sont
// appliquées en premier pour éviter les remplacements partiels.
const DICT = {
  "GitAtlas - Explorateur de profils GitHub & GitLab":
    "GitAtlas - GitHub & GitLab profile explorer",
  "Entrez un pseudo GitHub ou GitLab : explorez tous ses dépôts publics, leur structure, leur code, leurs README, langages et activité.":
    "Enter a GitHub or GitLab username: explore all their public repositories, their structure, their code, their READMEs, languages and activity.",
  "GitAtlas nécessite JavaScript pour interroger les API GitHub et GitLab.":
    "GitAtlas requires JavaScript to query the GitHub and GitLab APIs.",
  "Mode démonstration": "Demo mode",
  "profil fictif, données locales hors-ligne. Entrez un pseudo réel ci-dessus pour interroger l’API en direct.":
    "fictional profile, offline local data. Enter a real username above to query the live API.",
  "Chercher un vrai profil": "Find a real profile",
  "Explorateur de profils Git": "Git profile explorer",
  "Un pseudo.": "One username.",
  "Tous ses projets.": "All their projects.",
  "Chaque fichier.": "Every file.",
  "GitHub ou GitLab : explorez les dépôts publics de n'importe quel développeur - arborescence, code source, README, langages et activité. Sans compte, sans installation.":
    "GitHub or GitLab: explore any developer's public repositories - file tree, source code, README, languages and activity. No account, no install.",
  "GitHub ou GitLab : explorez les ": "GitHub or GitLab: explore ",
  "dépôts publics de n'importe quel développeur":
    "public repositories from any developer",
  " - arborescence, code source, README, langages et activité.":
    " - file tree, source code, README, languages and activity.",
  "Sans compte, sans installation.": "No account, no install.",
  "ex. ": "e.g. ",
  "Astuce : collez aussi une URL de profil, ou tapez « owner/dépôt » pour ouvrir un projet directement.":
    "Tip: you can also paste a profile URL, or type « owner/repo » to open a project directly.",
  "Astuce : collez aussi une URL de profil, ou tapez « owner/dépôt »":
    "Tip: you can also paste a profile URL, or type « owner/repo »",
  " pour ouvrir un projet directement.": " to open a project directly.",
  "pour rechercher": "to search",
  Explorer: "Explore",
  "Accueil GitAtlas": "GitAtlas home",
  "État de l'API - cliquez pour configurer un jeton":
    "API status - click to configure a token",
  "GitHub · GitLab Explorer": "GitHub · GitLab explorer",
  Favoris: "Favourites",
  "Jeton API": "API token",
  "Jeton d'accès GitHub": "GitHub access token",
  "Jeton d'accès à l'API": "API access token",
  "Jeton d'accès": "Access token",
  "Données : API publiques": "Data: public APIs",
  "Aucune donnée n'est envoyée ailleurs que sur ces API.":
    "No data is sent anywhere else than to these APIs.",
  "zéro dépendance": "zero dependency",
  Fermer: "Close",
  "Essayez :": "Try:",
  "Profil démo": "Demo profile",
  "Récents :": "Recent:",
  vider: "clear",
  abonnements: "following",
  abonnés: "followers",
  "dernière activité": "last activity",
  Organisation: "Organisation",
  Fictif: "Fictional",
  "Voir sur ": "View on ",
  "Exporter JSON": "Export JSON",
  "étoiles cumulées": "total stars",
  "forks cumulés": "total forks",
  "dépôts (dont privés)": "repositories (incl. private)",
  "dépôts publics": "public repositories",
  "Langages (par dépôt)": "Languages (per repository)",
  "Dépôts les plus étoilés": "Most starred repositories",
  "Activité · pushs par an": "Activity · pushes per year",
  " dépôts": " repositories",
  "Filtrer les dépôts…": "Filter repositories…",
  "Filtrer les dépôts": "Filter repositories",
  "Filtrer par langage": "Filter by language",
  "Tous les langages": "All languages",
  Trier: "Sort",
  "Étoiles ↓": "Stars ↓",
  "Activité récente": "Recent activity",
  "Nom A→Z": "Name A→Z",
  "Créés récemment": "Recently created",
  "Vue grille": "Grid view",
  "Vue liste": "List view",
  Tous: "All",
  Sources: "Sources",
  Forks: "Forks",
  Archivés: "Archived",
  "Aucun dépôt ne correspond à ces filtres.":
    "No repositories match these filters.",
  "Réinitialiser les filtres": "Reset filters",
  "Ce profil ne possède aucun dépôt public pour le moment.":
    "This profile has no public repositories yet.",
  "Afficher 24 de plus (": "Show 24 more (",
  " restants)": " remaining)",
  "Tous les dépôts sont affichés": "All repositories are shown",
  "Pas de description.": "No description.",
  "maj ": "updated ",
  "inscrit·e en ": "joined in ",
  Privé: "Private",
  Public: "Public",
  Archivé: "Archived",
  Fork: "Fork",
  " étoiles": " stars",
  " forks": " forks",
  " issues": " issues",
  "Site / démo live": "Website / live demo",
  "Copier le lien GitAtlas": "Copy GitAtlas link",
  "Copier la commande": "Copy command",
  Partager: "Share",
  "Partager GitAtlas": "Share GitAtlas",
  "Partager sur les réseaux": "Share on social networks",
  "Partage natif": "Native share",
  "Copier le lien": "Copy link",
  Fichiers: "Files",
  Langages: "Languages",
  Commits: "Commits",
  "Arborescence · ": "Tree · ",
  " fichiers": " files",
  EXPLORATEUR: "EXPLORER",
  "Tout replier": "Collapse all",
  "Rechercher un fichier…": "Search files…",
  "Rechercher un fichier": "Search files",
  "Arborescence volumineuse : liste partielle.": "Large tree: partial list.",
  "Tout voir sur la plateforme": "View all on the platform",
  "Arborescence indisponible": "Tree unavailable",
  "Impossible de charger la structure de ce dépôt (":
    "Could not load this repository's tree (",
  "dépôt vide ou branche introuvable": "empty repository or branch not found",
  "erreur réseau": "network error",
  "Limite API atteinte - ajoutez un jeton ou patientez.":
    "API limit reached - add a token or wait.",
  "Aucun fichier ne correspond.": "No matching files.",
  résultats: "results",
  résultat: "result",
  " (200 affichés)": " (200 shown)",
  "Explorez le code source": "Explore the source code",
  "Sélectionnez un fichier dans l’arborescence pour visualiser son contenu coloré, ou ouvrez l’onglet README.":
    "Select a file in the tree to view highlighted content, or open the README tab.",
  "Fichier illisible": "Unreadable file",
  "Impossible de récupérer ce fichier (": "Could not fetch this file (",
  réseau: "network",
  Télécharger: "Download",
  "Voir le fichier brut": "View raw file",
  Brut: "Raw",
  "Sous-module Git": "Git submodule",
  "Ce chemin pointe vers un autre dépôt. Ouvrez-le depuis la page ":
    "This path points to another repository. Open it from the ",
  " du projet.": " project page.",
  "sous-module": "submodule",
  "Aperçu indisponible en démo": "Preview unavailable in demo",
  "Fichier volumineux (": "Large file (",
  ") - affichage désactivé pour garder l’explorateur fluide.":
    ") - preview disabled to keep the explorer fast.",
  "Fichier binaire - non affichable sous forme de texte.":
    "Binary file - cannot be displayed as text.",
  "Trop grand pour l’aperçu": "Too large to preview",
  "Contenu binaire": "Binary content",
  "Ouvrir le brut": "Open raw",
  "Voir le code source": "View source code",
  "Code source": "Source code",
  "Aperçu rendu": "Rendered preview",
  Aperçu: "Preview",
  "Retour à la ligne": "Word wrap",
  "Copier le fichier": "Copy file",
  Copier: "Copy",
  " lignes · ": " lines · ",
  " lignes affichées": " lines shown",
  "Afficher la suite": "Show more",
  "README du dépôt": "Repository README",
  "Fiche technique": "Technical details",
  "Créé le": "Created on",
  "Dernier push": "Last push",
  "Branche par défaut": "Default branch",
  Taille: "Size",
  Licence: "License",
  "Non renseignée": "Not specified",
  "Clone HTTPS": "HTTPS clone",
  "Site du projet": "Project website",
  "Répartition des langages indisponible pour ce dépôt.":
    "Language breakdown unavailable for this repository.",
  "Récupération des derniers commits…": "Fetching latest commits…",
  "Commits indisponibles.": "Commits unavailable.",
  "Activité - 12 dernières semaines": "Activity - last 12 weeks",
  "Commits par semaine": "Commits per week",
  "Contributeurs récents": "Recent contributors",
  "Aucun commit public sur cette branche.": "No public commits on this branch.",
  "Copier le SHA": "Copy SHA",
  "Voir le commit": "View commit",
  "Chargement du dépôt…": "Loading repository…",
  "Interrogation de ": "Querying ",
  Réessayer: "Retry",
  "Ajouter un jeton": "Add a token",
  "Modifier la recherche": "Edit search",
  "Explorer la démo": "Explore the demo",
  "Profil introuvable": "Profile not found",
  "Connexion impossible": "Connection failed",
  "Limite de requêtes atteinte": "Rate limit reached",
  "L'API publique GitHub autorise 60 requêtes/heure par IP. Réessayez après le réinitialisation du compteur, ou ajoutez un jeton gratuit pour monter à 5 000/h.":
    "GitHub's public API allows 60 requests/hour per IP. Retry after the counter resets, or add a free token to raise it to 5,000/h.",
  "L'API a répondu par une erreur inattendue. Vous pouvez réessayer.":
    "The API returned an unexpected error. You can retry.",
  "Ce dépôt n’existe pas, est privé, ou a été renommé. Vérifiez le nom complet « owner/dépôt ».":
    "This repository doesn't exist, is private, or was renamed. Check the full name « owner/repo ».",
  "Ce pseudo n’existe pas sur ": "This username doesn't exist on ",
  ". Vérifiez l’orthographe, ou essayez l’autre plateforme.":
    ". Check the spelling, or try the other platform.",
  "Chercher « ": "Search for « ",
  " » sur ": " » on ",
  "Impossible de joindre l'API (": "Could not reach the API (",
  "). Vérifiez votre connexion - ou explorez le profil de démonstration, entièrement hors-ligne.":
    "). Check your connection - or explore the fully offline demo profile.",
  "Recherches récentes effacées.": "Recent searches cleared.",
  "Jeton enregistré - accès aux dépôts privés activé.":
    "Token saved - private repositories enabled.",
  "Jeton GitHub enregistré - dépôts privés activés.":
    "GitHub token saved - private repositories enabled.",
  "Jeton GitLab enregistré - dépôts privés activés.":
    "GitLab token saved - private repositories enabled.",
  "Jeton retiré - dépôts privés masqués.":
    "Token removed - private repositories hidden.",
  "Collez d’abord un jeton.": "Paste a token first.",
  "Export JSON téléchargé.": "JSON export downloaded.",
  "Export JSON annulé.": "JSON export cancelled.",
  "Export JSON lancé…": "Starting JSON export…",
  "Téléchargement annulé : ": "Download cancelled: ",
  "Téléchargement du README annulé.": "README download cancelled.",
  "Lien GitAtlas copié dans le presse-papiers.":
    "GitAtlas link copied to clipboard.",
  "Copie impossible": "Copy failed",
  "Le ZIP est disponible sur les dépôts réels (pas en démo).":
    "ZIP is available for real repositories (not in demo).",
  "Téléchargement du ZIP lancé…": "Starting ZIP download…",
  "Commande de clonage copiée.": "Clone command copied.",
  "Arborescence repliée.": "Tree collapsed.",
  "Fichier copié (": "File copied (",
  "Téléchargement impossible : ": "Download failed: ",
  "Téléchargement indisponible en démo pour ce fichier.":
    "Download unavailable in demo for this file.",
  "Téléchargement de ": "Downloading ",
  " lancé.": " started.",
  "README copié en Markdown.": "README copied as Markdown.",
  "README téléchargé.": "README downloaded.",
  "Bloc de code copié.": "Code block copied.",
  "SHA copié : ": "SHA copied: ",
  "Copié !": "Copied!",
  "Ajouté aux favoris ⭐": "Added to favourites ⭐",
  "Retiré des favoris.": "Removed from favourites.",
  "Favori retiré.": "Favourite removed.",
  "Favori restauré.": "Favourite restored.",
  Annuler: "Cancel",
  Enregistrer: "Save",
  Retirer: "Remove",
  "Aucun favori pour l’instant.": "No favourites yet.",
  "Cliquez sur l’étoile d’un profil ou d’un dépôt pour le retrouver ici.":
    "Click the star on a profile or repository to find it here.",
  "Profils · ": "Profiles · ",
  "Dépôts · ": "Repositories · ",
  "Stocké uniquement dans ce navigateur (sessionStorage). Envoyé":
    "Stored only in this browser (sessionStorage). Sent",
  "exclusivement à ": "only to ",
  "Créer un jeton sur GitHub": "Create a token on GitHub",
  "Créer un jeton sur GitLab": "Create a token on GitLab",
  "Créer un jeton sur ": "Create a token on ",
  "Jeton d'accès ": "Access token: ",
  "Ajoutez un <b>jeton personnel GitLab</b> (scope <b>read_api</b>) pour voir vos projets privés depuis votre profil.":
    "Add a <b>GitLab personal token</b> (with the <b>read_api</b> scope) to see your private projects from your profile.",
  "Ajoutez un jeton personnel pour voir <b>vos dépôts privés</b> et portez la limite de l'API GitHub de 60 à 5 000 requêtes/heure.":
    "Add a personal token to see <b>your private repositories</b> and raise the GitHub API limit from 60 to 5,000 requests/hour.",
  "GitHub : scope <b>repo</b> (classique) ou <b>Contents: read</b> (jeton affiné).":
    "GitHub: <b>repo</b> scope (classic) or <b>Contents: read</b> (fine-grained token).",
  "GitLab : cochez le scope <b>read_api</b>. Le jeton reste sur cet appareil.":
    "GitLab: enable the <b>read_api</b> scope. The token stays on this device.",
  "GitHub : jeton personnel avec <b>read_api</b>.":
    "GitHub: personal token with <b>read_api</b>.",
  "GitLab : jeton personnel avec ": "GitLab: personal token with ",
  "Ajoutez un ": "Add a ",
  "jeton personnel GitLab": "GitLab personal token",
  "(scope ": "(with the ",
  ") pour voir vos projets privés depuis votre profil.":
    ") to see your private projects from your profile.",
  "Ajoutez un jeton personnel pour voir ": "Add a personal token to see ",
  "vos dépôts privés": "your private repositories",
  " et portez la limite de l'API GitHub de 60 à 5 000 requêtes/heure.":
    " and raise the GitHub API limit from 60 to 5,000 requests/hour.",
  "GitHub : scope ": "GitHub: ",
  " (classique) ou ": " scope (classic) or ",
  "(jeton affiné).": "(fine-grained token).",
  "GitLab : cochez le scope ": "GitLab: enable the ",
  ". Le jeton reste sur cet appareil.": ". The token stays on this device.",
  "Ne pas conserver le jeton (effacé au rechargement)":
    "Don't store the token (cleared on reload)",
  "API GitHub": "GitHub API",
  "API GitLab": "GitLab API",
  " · jeton": " · token",
  "Démo · hors-ligne": "Demo · offline",
  Langue: "Language",
  "Langue changée - interface en anglais.":
    "Language changed - English interface.",
  "Langue changée - interface en français.":
    "Language changed - French interface.",
};

const KEYS = Object.keys(DICT).sort((a, b) => b.length - a.length);
const SKIP =
  "script,style,noscript,code,pre,.code-body,.md-body,.cmsg,.pbio,.rc-desc,.rr-desc,.rh-desc,.fr-name,.fr-sub,.fav-row,.pname,.plogin,.tname,.tchip,.sha,.lr-name,.lseg,.clone-url,.stat-num,.rc-lang,.rr-lang";
const ATTRS = ["placeholder", "title", "aria-label"];

// Les textes HTML contiennent des retours à la ligne : on normalise les
// espaces avant de chercher une phrase, puis on restaure les bords.
function translateText(s) {
  if (S.lang === "fr" || !s) return s;
  const lead = /^\s*/.exec(s)[0];
  const trail = /\s*$/.exec(s)[0];
  let out = s.replace(/\s+/g, " ").trim();
  // Les clés peuvent contenir des espaces en bordure : on compare sur des
  // versions rognées, les espaces d'origine étant restaurés avec lead/trail.
  for (const k of KEYS) {
    const key = k.trim();
    if (key && out.includes(key)) out = out.split(key).join(DICT[k].trim());
  }
  // Dates relatives, tailles et nombres produits par utils.js.
  out = out
    .replace(/(\d)[\u202f\u00a0 ](\d{3})\b/g, "$1,$2")
    .replace(/à l'instant/g, "just now")
    .replace(/\bhier\b/g, "yesterday")
    .replace(/il y a (\d+) min/g, "$1 min ago")
    .replace(/il y a (\d+) h\b/g, "$1 hours ago")
    .replace(/il y a (\d+) j\b/g, "$1 days ago")
    .replace(/il y a (\d+) mois\b/g, "$1 months ago")
    .replace(/il y a (\d+) ans\b/g, "$1 years ago")
    .replace(/il y a (\d+) an\b/g, "$1 year ago")
    .replace(/(\d+),(\d+)\s*Ko\b/g, "$1.$2 KB")
    .replace(/(\d+),(\d+)\s*Mo\b/g, "$1.$2 MB")
    .replace(/(\d+),(\d+)\s*Go\b/g, "$1.$2 GB")
    .replace(/(\d+)\s*o\b/g, "$1 B");
  return lead + out + trail;
}

// WeakMaps : mémorise la valeur d'origine et la dernière valeur produite,
// pour ne pas écraser un texte modifié ensuite par le code de l'application.
const origVals = new WeakMap();
const lastOuts = new WeakMap();

function translateNode(node) {
  if (node.nodeType !== Node.TEXT_NODE) return;
  const parent = node.parentElement;
  if (!parent || parent.closest(SKIP)) return;
  const cur = node.nodeValue;
  let orig = origVals.get(node);
  const prevOut = lastOuts.get(node);
  if (orig == null || (prevOut != null && cur !== prevOut)) orig = cur;
  origVals.set(node, orig);
  const next = translateText(orig);
  if (next !== cur) node.nodeValue = next;
  lastOuts.set(node, next);
}

function translateAttrs(root) {
  if (!root.querySelectorAll) return;
  root.querySelectorAll("*").forEach((el) => {
    if (el.closest(SKIP)) return;
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      let m = origVals.get(el);
      if (!m) origVals.set(el, (m = {}));
      const cur = el.getAttribute(a);
      const prevOut = m[a + ":out"];
      let orig = m[a];
      if (orig == null || (prevOut != null && cur !== prevOut)) orig = cur;
      m[a] = orig;
      const next = translateText(orig);
      if (next !== cur) el.setAttribute(a, next);
      m[a + ":out"] = next;
    }
  });
}

export function applyLang() {
  document.documentElement.lang = S.lang;
  document.title = translateText(
    "GitAtlas - Explorateur de profils GitHub & GitLab",
  );
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    if (meta.__i18nOriginal == null) meta.__i18nOriginal = meta.content;
    meta.content = translateText(meta.__i18nOriginal);
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) translateNode(n);
  translateAttrs(document.body);
  document.querySelectorAll("[data-action='set-lang']").forEach((b) => {
    b.classList.toggle("on", b.dataset.lang === S.lang);
  });
  setSeo();
}

export function startI18n() {
  applyLang();
  let queued = false,
    applying = false;
  const obs = new MutationObserver(() => {
    if (applying || queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applying = true;
      applyLang();
      applying = false;
    });
  });
  obs.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

export function setLang(lang, notify = true) {
  if (!LANGS.includes(lang) || lang === S.lang) return;
  S.lang = lang;
  lsSet("lang", lang);
  applyLang();
  if (notify)
    toast(
      "info",
      translateText(
        "Langue changée - interface en " +
          (lang === "en" ? "anglais" : "français") +
          ".",
      ),
    );
}
