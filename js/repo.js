// RENDU DÉPÔT
import { $ } from "./utils.js";
import { BIN_EXT } from "./languages.js";
import { IMG_EXT } from "./languages.js";
import { S } from "./state.js";
import { blobUrl } from "./api.js";
import { treeUrl } from "./api.js";
import { fileDataUrl } from "./api.js";
import { useAuthFiles } from "./api.js";
import { dateLong } from "./utils.js";
import { esc } from "./utils.js";
import { extOf } from "./languages.js";
import { favBtn } from "./components.js";
import { fmtNum } from "./utils.js";
import { fmtSize } from "./utils.js";
import { gitLoader } from "./components.js";
import { highlightLines } from "./highlight.js";
import { icon } from "./icons.js";
import { initialsAvatar } from "./utils.js";
import { langColor } from "./languages.js";
import { mdToHtml } from "./markdown.js";
import { noticeHTML } from "./components.js";
import { platIcon } from "./components.js";
import { platName } from "./components.js";
import { postRender } from "./effects.js";
import { rawUrl } from "./api.js";
import { relTime } from "./utils.js";
import { updateRatePill } from "./rate.js";

/* ============================== RENDU DÉPÔT ============================== */
export function freshRepoState(pl, meta) {
  return {
    pl,
    meta,
    tree: null,
    treeStatus: "loading",
    truncated: false,
    treeOpen: new Set(),
    treeQ: "",
    readme: null,
    readmeStatus: "loading",
    readmeSource: false,
    langs: null,
    langsStatus: "loading",
    commits: null,
    commitsStatus: "idle",
    tab: "files",
    sel: null,
    file: null,
    fileStatus: "idle",
    fileErr: null,
    fileReq: 0,
    fileSource: false,
    fileShown: 1200,
    wrap: false,
    mobileTree: false,
  };
}
export function renderRepoShell() {
  const r = S.repo,
    m = r.meta;
  updateRatePill(r.pl);
  const badges =
    (m.private
      ? '<span class="badge b-priv">' + icon("lock", 10) + "Privé</span>"
      : '<span class="badge b-pub">' + icon("globe", 10) + "Public</span>") +
    (m.fork
      ? '<span class="badge b-fork">' + icon("fork", 10) + "Fork</span>"
      : "") +
    (m.archived
      ? '<span class="badge b-arch">' + icon("archive", 10) + "Archivé</span>"
      : "") +
    (m.license
      ? '<span class="badge b-lic">' +
        icon("shield", 10) +
        esc(m.license) +
        "</span>"
      : "");
  const pills = [
    '<span class="pill st">' +
      icon("star", 13) +
      fmtNum(m.stars) +
      " étoiles</span>",
    '<span class="pill">' +
      icon("fork", 13) +
      fmtNum(m.forks) +
      " forks</span>",
  ];
  if (m.watchers != null)
    pills.push(
      '<span class="pill">' +
        icon("eye", 13) +
        fmtNum(m.watchers) +
        " abonnés</span>",
    );
  if (m.issues != null)
    pills.push(
      '<span class="pill">' +
        icon("alert", 13) +
        fmtNum(m.issues) +
        " issues</span>",
    );
  if (m.sizeKB != null)
    pills.push(
      '<span class="pill">' +
        icon("db", 13) +
        fmtSize(m.sizeKB * 1024) +
        "</span>",
    );
  pills.push(
    '<span class="pill br">' + icon("branch", 13) + esc(m.branch) + "</span>",
  );
  pills.push(
    '<span class="pill">' +
      icon("clock", 13) +
      "maj " +
      relTime(m.pushed || m.updated) +
      "</span>",
  );
  $("stage").innerHTML =
    '<div class="wrap">' +
    '<div class="backbar reveal in"><button class="btn btn-ghost btn-sm" data-action="go-profile" data-pl="' +
    esc(r.pl) +
    '" data-login="' +
    esc(m.owner) +
    '">' +
    icon("left", 14) +
    esc(m.owner) +
    "</button>" +
    '<span class="crumb mono">' +
    esc(m.owner) +
    " / <b>" +
    esc(m.name) +
    "</b></span>" +
    '<div class="bb-actions">' +
    favBtn("repo", r.pl, m.full) +
    '<button class="btn-icon" data-action="share-repo" title="Partager sur les réseaux" aria-label="Partager">' +
    icon("share", 15) +
    "</button>" +
    (m.url
      ? '<a class="btn btn-ghost btn-sm" href="' +
        esc(m.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        platIcon(r.pl, 14) +
        platName(r.pl) +
        icon("ext", 12) +
        "</a>"
      : "") +
    '<button class="btn btn-pri btn-sm" data-action="zip-repo">' +
    icon("download", 14) +
    "ZIP</button></div></div>" +
    '<section class="rhead reveal in"><div class="rh-top"><h2 class="rh-title">' +
    icon("book", 22) +
    "<span>" +
    esc(m.name) +
    "</span></h2>" +
    badges +
    "</div>" +
    (m.desc ? '<p class="rh-desc">' + esc(m.desc) + "</p>" : "") +
    ((m.topics || []).length
      ? '<div class="rh-topics">' +
        m.topics
          .map((t) => '<span class="tchip">' + esc(t) + "</span>")
          .join("") +
        "</div>"
      : "") +
    '<div class="rh-stats">' +
    pills.join("") +
    "</div>" +
    (m.home
      ? '<div><a class="btn btn-warm btn-sm" href="' +
        esc(m.home) +
        '" target="_blank" rel="noopener noreferrer">' +
        icon("globe", 14) +
        "Site / démo live" +
        icon("ext", 12) +
        "</a></div>"
      : "") +
    '<div class="clone-row"><span class="cl-label mono">HTTPS</span><code class="clone-url" tabindex="0">git clone ' +
    esc(m.clone) +
    '</code><button class="btn-icon" data-action="copy-clone" title="Copier la commande" aria-label="Copier">' +
    icon("copy", 14) +
    "</button></div></section>" +
    '<div class="tabs" id="repoTabs" role="tablist">' +
    '<button class="tab on" data-action="tab" data-tab="files" role="tab" aria-selected="true">' +
    icon("folder", 15) +
    'Fichiers<span class="tcount" id="tabFileCount">…</span></button>' +
    '<button class="tab" data-action="tab" data-tab="readme" role="tab" aria-selected="false">' +
    icon("book", 15) +
    "README</button>" +
    '<button class="tab" data-action="tab" data-tab="langs" role="tab" aria-selected="false">' +
    icon("chart", 15) +
    "Langages</button>" +
    '<button class="tab" data-action="tab" data-tab="commits" role="tab" aria-selected="false">' +
    icon("commit", 15) +
    "Commits</button>" +
    '<i class="tab-ind" id="tabInd"></i></div>' +
    '<div class="pane" id="pane-files"><div class="files-split"><div class="sk" style="height:440px"></div><div class="sk" style="height:440px"></div></div></div>' +
    '<div class="pane hidden" id="pane-readme"><div class="sk" style="height:300px"></div></div>' +
    '<div class="pane hidden" id="pane-langs"><div class="sk" style="height:220px"></div></div>' +
    '<div class="pane hidden" id="pane-commits"></div>' +
    "</div>";
  requestAnimationFrame(() => moveTabInd());
  postRender();
}
export function moveTabInd() {
  const ind = $("tabInd"),
    tabs = $("repoTabs");
  if (!ind || !tabs) return;
  const on = tabs.querySelector(".tab.on");
  if (!on) return;
  ind.style.left = on.offsetLeft + "px";
  ind.style.top = on.offsetTop + on.offsetHeight - 1 + "px";
  ind.style.width = on.offsetWidth + "px";
}
export function fileIconName(path, type) {
  if (type === "tree") return ["folder", "#A89CFF"];
  if (type === "commit") return ["box", "#67739F"];
  const e = extOf(path);
  if (IMG_EXT.has(e)) return ["image", "#F26BB5"];
  if (BIN_EXT.has(e)) return ["lock", "#67739F"];
  const map = {
    ts: ["code", "#3178c6"],
    tsx: ["code", "#3178c6"],
    js: ["code", "#f1e05a"],
    jsx: ["code", "#f1e05a"],
    mjs: ["code", "#f1e05a"],
    py: ["code", "#3572A5"],
    rs: ["code", "#dea584"],
    go: ["code", "#00ADD8"],
    c: ["code", "#9b9b9b"],
    h: ["code", "#9b9b9b"],
    cpp: ["code", "#f34b7d"],
    hpp: ["code", "#f34b7d"],
    cs: ["code", "#2ea043"],
    json: ["file", "#FFB224"],
    md: ["book", "#2BD4F0"],
    markdown: ["book", "#2BD4F0"],
    html: ["code", "#e34c26"],
    css: ["code", "#9b6dd6"],
    scss: ["code", "#c6538c"],
    vue: ["code", "#41b883"],
    svelte: ["code", "#ff3e00"],
    yml: ["file", "#F26BB5"],
    yaml: ["file", "#F26BB5"],
    toml: ["file", "#c96a3d"],
    sh: ["terminal", "#34E0A2"],
    bash: ["terminal", "#34E0A2"],
    sql: ["db", "#e38c00"],
    lock: ["lock", "#67739F"],
    txt: ["file", "#67739F"],
    svg: ["image", "#F26BB5"],
  };
  if (e === "dockerfile") return ["box", "#6aa5b0"];
  if (e === "gitignore" || e === "clang-format") return ["file", "#67739F"];
  if (path === "LICENSE") return ["shield", "#34E0A2"];
  return map[e] || ["file", "#8b93b8"];
}
export function treeRowHTML(n, q) {
  const [icn, col] = fileIconName(n.path, n.type);
  let name = esc(n.name);
  if (q) {
    const i = n.name.toLowerCase().indexOf(q.toLowerCase());
    if (i >= 0)
      name =
        esc(n.name.slice(0, i)) +
        "<mark>" +
        esc(n.name.slice(i, i + q.length)) +
        "</mark>" +
        esc(n.name.slice(i + q.length));
  }
  if (n.type === "tree") {
    const open = S.repo.treeOpen.has(n.path) && !q;
    const kids = open ? treeRowsHTML(n.children, q) : "";
    return (
      '<div class="tn"><button class="trow' +
      (open ? " open" : "") +
      '" data-action="tree-toggle" data-path="' +
      esc(n.path) +
      '" aria-expanded="' +
      open +
      '">' +
      icon("chevr", 11, "chev") +
      '<span class="f-ic" style="color:' +
      col +
      '">' +
      icon(icn, 14) +
      '</span><span class="tname">' +
      name +
      '</span><span class="tmeta">' +
      n.count +
      '</span></button><div class="tkids"' +
      (open ? ' data-loaded="1"' : " hidden") +
      ">" +
      kids +
      "</div></div>"
    );
  }
  return (
    '<button class="trow tfile' +
    (S.repo.sel === n.path ? " sel" : "") +
    '" data-action="tree-file" data-path="' +
    esc(n.path) +
    '"><span class="tsp"></span><span style="color:' +
    col +
    ';display:inline-flex">' +
    icon(icn, 14) +
    '</span><span class="tname">' +
    name +
    "</span>" +
    (n.size ? '<span class="tmeta">' + fmtSize(n.size) + "</span>" : "") +
    "</button>"
  );
}
export function treeRowsHTML(children, q) {
  return children.map((n) => treeRowHTML(n, q)).join("");
}
export function renderTreePane() {
  const pane = $("pane-files");
  if (!pane || !S.repo) return;
  const r = S.repo;
  if (r.treeStatus === "err") {
    pane.innerHTML = noticeHTML(
      "alert",
      "",
      "Arborescence indisponible",
      r.treeErr && r.treeErr.type === "rate"
        ? "Limite API atteinte - ajoutez un jeton ou patientez."
        : "Impossible de charger la structure de ce dépôt (" +
            (r.treeErr && r.treeErr.type === "notfound"
              ? "dépôt vide ou branche introuvable"
              : "erreur réseau") +
            ").",
      '<button class="btn btn-pri btn-sm" data-action="retry-repo">' +
        icon("refresh", 14) +
        "Réessayer</button>",
    );
    return;
  }
  const nFiles = r.tree.root.count;
  const treeLink = r.truncated ? treeUrl(r.meta) : null;
  const fc = $("tabFileCount");
  if (fc) fc.textContent = nFiles;
  pane.innerHTML =
    '<div class="files-split">' +
    '<button class="tree-mtoggle btn btn-ghost" data-action="tree-mtoggle">' +
    icon("folder", 15) +
    "Arborescence · " +
    nFiles +
    " fichiers" +
    icon("chevd", 14) +
    "</button>" +
    '<aside class="tree-pane' +
    (r.mobileTree ? " open" : "") +
    '" id="treePane">' +
    '<div class="tree-head"><span class="th-label mono">EXPLORATEUR</span><span class="th-count">' +
    nFiles +
    ' fichiers</span><button class="btn-icon" title="Tout replier" aria-label="Tout replier" data-action="tree-collapse-all">' +
    icon("fold", 14) +
    "</button></div>" +
    '<div class="tree-search">' +
    icon("search", 13) +
    '<input id="treeSearch" placeholder="Rechercher un fichier…" value="' +
    esc(r.treeQ) +
    '" aria-label="Rechercher un fichier"></div>' +
    '<div class="tree-scroll" id="treeScroll"><div id="treeRoot">' +
    (r.treeQ
      ? treeFilteredHTML(r.treeQ)
      : treeRowsHTML(r.tree.root.children, "")) +
    "</div></div>" +
    (r.truncated
      ? '<div class="tree-note">' +
        icon("warn", 13) +
        "<span>Arborescence volumineuse : liste partielle." +
        (treeLink
          ? ' <a class="tree-note-link" href="' +
            esc(treeLink) +
            '" target="_blank" rel="noopener noreferrer">Tout voir sur la plateforme' +
            icon("ext", 11) +
            "</a>"
          : "") +
        "</span></div>"
      : "") +
    "</aside>" +
    '<section class="code-pane" id="codePane"></section></div>';
  renderViewer();
}
export function treeFilteredHTML(q) {
  const r = S.repo;
  const matches = [];
  (function walk(n) {
    for (const c of n.children) {
      if (c.type === "tree") walk(c);
      else if (c.path.toLowerCase().includes(q.toLowerCase())) matches.push(c);
    }
  })(r.tree.root);
  if (!matches.length)
    return (
      '<div class="empty-mini" style="padding:22px">' +
      icon("search", 24) +
      "<span>Aucun fichier ne correspond.</span></div>"
    );
  const cap = matches.slice(0, 200);
  const inc = new Set();
  cap.forEach((m) => {
    let p = m.path;
    inc.add(p);
    while (p.includes("/")) {
      p = p.slice(0, p.lastIndexOf("/"));
      inc.add(p);
    }
  });
  function rows(n) {
    return n.children
      .filter((c) => inc.has(c.path))
      .map((c) => {
        if (c.type !== "tree") return treeRowHTML(c, q);
        const [icn, col] = fileIconName(c.path, "tree");
        return (
          '<div class="tn"><button class="trow open" data-action="tree-toggle" data-path="' +
          esc(c.path) +
          '" aria-expanded="true">' +
          icon("chevr", 11, "chev") +
          '<span class="f-ic" style="color:' +
          col +
          '">' +
          icon(icn, 14) +
          '</span><span class="tname">' +
          esc(c.name) +
          '</span></button><div class="tkids" data-loaded="1">' +
          rows(c) +
          "</div></div>"
        );
      })
      .join("");
  }
  return (
    '<div style="font-family:var(--fm);font-size:10.5px;color:var(--faint);padding:4px 8px 8px">' +
    matches.length +
    " résultat" +
    (matches.length > 1 ? "s" : "") +
    (matches.length > 200 ? " (200 affichés)" : "") +
    "</div>" +
    rows(r.tree.root)
  );
}
export function applyTreeSel() {
  const sc = $("treeScroll");
  if (!sc || !S.repo) return;
  sc.querySelectorAll(".trow.sel").forEach((el) => el.classList.remove("sel"));
  if (!S.repo.sel) return;
  for (const el of sc.querySelectorAll(".trow.tfile")) {
    if (el.dataset.path === S.repo.sel) {
      el.classList.add("sel");
      el.scrollIntoView({ block: "nearest" });
      break;
    }
  }
}
export function viewerBarHTML(title, metaTxt, actions) {
  return (
    '<div class="pane-bar"><span class="pb-path">' +
    title +
    '</span><span class="pb-meta">' +
    metaTxt +
    '</span><div class="pb-actions">' +
    actions +
    "</div></div>"
  );
}
export function crumbsHTML(path) {
  const parts = path.split("/");
  return parts
    .map((p, i) =>
      i === parts.length - 1
        ? "<b>" + esc(p) + "</b>"
        : esc(p) + '<span class="sep">/</span>',
    )
    .join("");
}
export function renderViewer() {
  const pane = $("codePane");
  if (!pane || !S.repo) return;
  const r = S.repo,
    m = r.meta;
  if (r.fileStatus === "idle") {
    pane.innerHTML =
      '<div class="viewer-empty"><div class="ve-ic">' +
      icon("code", 28) +
      '</div><h4>Explorez le code source</h4><p>Sélectionnez un fichier dans l\u2019arborescence pour visualiser son contenu coloré, ou ouvrez l\u2019onglet README.</p><div class="ve-stats"><span class="pill br">' +
      icon("branch", 12) +
      esc(m.branch) +
      '</span><span class="pill">' +
      icon("file", 12) +
      (r.tree ? r.tree.root.count : "…") +
      " fichiers</span>" +
      (m.sizeKB != null
        ? '<span class="pill">' +
          icon("db", 12) +
          fmtSize(m.sizeKB * 1024) +
          "</span>"
        : "") +
      "</div></div>";
    return;
  }
  if (r.fileStatus === "loading") {
    pane.innerHTML =
      '<div style="padding:16px"><div class="skel-status">' +
      gitLoader() +
      '<span class="mono" style="font-size:12px">' +
      esc(r.sel || "") +
      "</span></div>" +
      Array.from(
        { length: 12 },
        (_, i) =>
          '<div class="sk" style="height:14px;margin:9px 0;width:' +
          (55 + ((i * 37) % 40)) +
          '%"></div>',
      ).join("") +
      "</div>";
    return;
  }
  if (r.fileStatus === "err") {
    pane.innerHTML = noticeHTML(
      "alert",
      "",
      "Fichier illisible",
      "Impossible de récupérer ce fichier (" +
        (r.fileErr && r.fileErr.type === "network" ? "réseau" : "API") +
        ")",
      '<button class="btn btn-pri btn-sm" data-action="retry-file">' +
        icon("refresh", 14) +
        "Réessayer</button>",
    );
    return;
  }
  const f = r.file;
  const dlBtn =
    '<button class="btn-icon" data-action="download-file" title="Télécharger" aria-label="Télécharger">' +
    icon("download", 14) +
    "</button>";
  const rawLink =
    f.kind === "text" || f.kind === "image" || f.kind === "large"
      ? useAuthFiles(m)
        ? blobUrl(m, f.path)
        : rawUrl(m, f.path)
      : null;
  const rawBtn = rawLink
    ? '<a class="btn-icon" href="' +
      esc(rawLink) +
      '" target="_blank" rel="noopener noreferrer" title="Voir le fichier brut" aria-label="Brut">' +
      icon("ext", 14) +
      "</a>"
    : "";
  if (f.kind === "submodule") {
    pane.innerHTML =
      viewerBarHTML(crumbsHTML(f.path), "sous-module", "") +
      '<div class="viewer-empty"><div class="ve-ic">' +
      icon("box", 26) +
      "</div><h4>Sous-module Git</h4><p>Ce chemin pointe vers un autre dépôt. Ouvrez-le depuis la page " +
      platName(r.pl) +
      " du projet.</p></div>";
    return;
  }
  if (f.kind === "image") {
    pane.innerHTML =
      viewerBarHTML(
        crumbsHTML(f.path),
        (f.size ? fmtSize(f.size) + " · " : "") + "image",
        rawBtn + dlBtn,
      ) +
      '<div class="img-view">' +
      (f.url
        ? '<img src="' + esc(f.url) + '" alt="' + esc(f.path) + '">'
        : '<span class="md-img-chip">' +
          icon("image", 14) +
          "Aperçu indisponible en démo</span>") +
      "</div>";
    return;
  }
  if (f.kind === "binary" || f.kind === "large") {
    const why =
      f.kind === "large"
        ? "Fichier volumineux (" +
          fmtSize(f.size) +
          ") - affichage désactivé pour garder l\u2019explorateur fluide."
        : "Fichier binaire - non affichable sous forme de texte.";
    pane.innerHTML =
      viewerBarHTML(
        crumbsHTML(f.path),
        f.size ? fmtSize(f.size) : "",
        rawBtn + dlBtn,
      ) +
      '<div class="viewer-empty"><div class="ve-ic">' +
      icon(f.kind === "large" ? "db" : "lock", 26) +
      "</div><h4>" +
      (f.kind === "large"
        ? "Trop grand pour l\u2019aperçu"
        : "Contenu binaire") +
      "</h4><p>" +
      why +
      '</p><div class="ve-stats">' +
      (rawLink
        ? '<a class="btn btn-ghost btn-sm" href="' +
          esc(rawLink) +
          '" target="_blank" rel="noopener noreferrer">' +
          icon("ext", 13) +
          "Ouvrir le brut</a>"
        : "") +
      '<button class="btn btn-pri btn-sm" data-action="download-file">' +
      icon("download", 13) +
      "Télécharger</button></div></div>";
    return;
  }
  const isMd = f.langKey === "md";
  if (isMd && !r.fileSource) {
    const ctx = mdCtx(m, f.path);
    const actions =
      '<button class="btn-icon' +
      (r.fileSource ? " on" : "") +
      '" data-action="md-view-toggle" title="Voir le code source" aria-label="Code source">' +
      icon("code", 14) +
      '</button><button class="btn-icon" data-action="copy-file" title="Copier" aria-label="Copier">' +
      icon("copy", 14) +
      "</button>" +
      dlBtn +
      rawBtn;
    pane.innerHTML =
      viewerBarHTML(
        crumbsHTML(f.path),
        fmtSize(f.size) + " · Markdown",
        actions,
      ) +
      '<div class="md-scroll"><div class="md-body">' +
      mdToHtml(f.text, ctx) +
      "</div></div>";
    hydrateAuthImages(pane, m);
    return;
  }
  const lines =
    r.fileSource && isMd
      ? highlightLines(f.text, "md")
      : r.fileLines || highlightLines(f.text, f.langKey);
  if (!r.fileSource) r.fileLines = lines;
  const shown = Math.min(r.fileShown, lines.length, 15000);
  const rows = lines
    .slice(0, shown)
    .map(
      (h, i) =>
        '<div class="cl"><span class="ln">' +
        (i + 1) +
        '</span><span class="lc">' +
        (h === "" ? "&#8203;" : h) +
        "</span></div>",
    )
    .join("");
  const actions =
    (isMd
      ? '<button class="btn-icon" data-action="md-view-toggle" title="Aperçu rendu" aria-label="Aperçu">' +
        icon("book", 14) +
        "</button>"
      : "") +
    '<button class="btn-icon' +
    (r.wrap ? " on" : "") +
    '" data-action="wrap-toggle" title="Retour à la ligne" aria-label="Wrap" aria-pressed="' +
    r.wrap +
    '">' +
    icon("wrap", 14) +
    "</button>" +
    '<button class="btn-icon" data-action="copy-file" title="Copier le fichier" aria-label="Copier">' +
    icon("copy", 14) +
    "</button>" +
    dlBtn +
    rawBtn;
  pane.innerHTML =
    viewerBarHTML(
      crumbsHTML(f.path),
      lines.length + " lignes · " + fmtSize(f.size) + " · " + esc(f.langLabel),
      actions,
    ) +
    '<div class="code-scroll"><div class="code-body' +
    (r.wrap ? " wrap" : "") +
    '" style="--gw:' +
    (String(lines.length).length + 2) +
    'ch">' +
    rows +
    "</div></div>" +
    (lines.length > shown
      ? '<div class="code-more"><span>' +
        fmtNum(shown) +
        " / " +
        fmtNum(lines.length) +
        ' lignes affichées</span><button class="btn btn-ghost btn-sm" data-action="load-rest-file">' +
        icon("chevd", 13) +
        "Afficher la suite</button></div>"
      : "");
}
export async function hydrateAuthImages(root, repo) {
  if (!root || !useAuthFiles(repo)) return;
  root.querySelectorAll('img[src^="gitfile:"]').forEach(async (img) => {
    const p = decodeURIComponent(
      img.getAttribute("src").slice("gitfile:".length),
    );
    try {
      img.src = await fileDataUrl(repo, p);
    } catch (e) {
      img.replaceWith(
        Object.assign(document.createElement("span"), {
          className: "md-img-chip",
          textContent: "Image indisponible : " + p,
        }),
      );
    }
  });
}
export function mdCtx(repo, readmePath) {
  const dir = readmePath.includes("/")
    ? readmePath.slice(0, readmePath.lastIndexOf("/") + 1)
    : "";
  const norm = (p) => {
    const out = [];
    for (const seg of (dir + p).split("/")) {
      if (seg === "" || seg === ".") continue;
      if (seg === "..") out.pop();
      else out.push(seg);
    }
    return out.join("/");
  };
  return {
    refs: {},
    img: (u) =>
      /^(https?:|data:image\/)/i.test(u)
        ? u
        : useAuthFiles(repo)
          ? "gitfile:" + encodeURIComponent(norm(u))
          : rawUrl(repo, norm(u)),
    link: (u) => (/^https?:|^mailto:/i.test(u) ? u : blobUrl(repo, norm(u))),
  };
}
export function renderReadmePane() {
  const pane = $("pane-readme");
  if (!pane || !S.repo) return;
  const r = S.repo;
  if (r.readmeStatus === "loading") {
    pane.innerHTML = '<div class="sk" style="height:300px"></div>';
    return;
  }
  if (r.readmeStatus === "err" || !r.readme) {
    pane.innerHTML =
      '<div class="empty-mini">' +
      icon("book", 36) +
      "<span>" +
      (r.readmeStatus === "err"
        ? "README impossible à charger pour le moment."
        : "Ce dépôt n\u2019a pas de README à la racine.") +
      "</span>" +
      (r.readmeStatus === "err"
        ? '<button class="btn btn-ghost btn-sm" data-action="retry-repo">' +
          icon("refresh", 13) +
          "Réessayer</button>"
        : "") +
      "</div>";
    return;
  }
  const rd = r.readme;
  const actions =
    '<button class="btn-icon' +
    (r.readmeSource ? " on" : "") +
    '" data-action="readme-src-toggle" title="Basculer aperçu / source" aria-label="Source">' +
    icon("code", 14) +
    '</button><button class="btn-icon" data-action="readme-copy" title="Copier le Markdown" aria-label="Copier">' +
    icon("copy", 14) +
    '</button><button class="btn-icon" data-action="readme-dl" title="Télécharger" aria-label="Télécharger">' +
    icon("download", 14) +
    "</button>";
  const body =
    r.readmeSource || rd.plain
      ? '<div class="code-scroll"><div class="code-body" style="--gw:' +
        (String(rd.text.split("\n").length).length + 2) +
        'ch">' +
        highlightLines(rd.text, rd.plain ? "plain" : "md")
          .map(
            (h, i) =>
              '<div class="cl"><span class="ln">' +
              (i + 1) +
              '</span><span class="lc">' +
              (h === "" ? "&#8203;" : h) +
              "</span></div>",
          )
          .join("") +
        "</div></div>"
      : '<div class="md-scroll"><div class="md-body">' +
        mdToHtml(rd.text, mdCtx(r.meta, rd.path)) +
        "</div></div>";
  pane.innerHTML =
    '<div class="code-pane">' +
    viewerBarHTML(
      icon("book", 13) + " " + crumbsHTML(rd.path),
      "README du dépôt",
      actions,
    ) +
    body +
    "</div>";
  hydrateAuthImages(pane, r.meta);
}
export function renderLangsPane() {
  const pane = $("pane-langs");
  if (!pane || !S.repo) return;
  const r = S.repo,
    m = r.meta;
  const spec = [];
  const sp = (k, v) =>
    spec.push(
      '<div class="spec"><div class="spec-k">' +
        k +
        '</div><div class="spec-v">' +
        v +
        "</div></div>",
    );
  sp("Créé le", dateLong(m.created));
  sp(
    "Dernier push",
    dateLong(m.pushed) +
      ' <span style="color:var(--faint)">(' +
      relTime(m.pushed) +
      ")</span>",
  );
  sp(
    "Branche par défaut",
    '<span class="mono" style="color:var(--cyan)">' + esc(m.branch) + "</span>",
  );
  sp("Taille", m.sizeKB != null ? fmtSize(m.sizeKB * 1024) : "-");
  sp("Licence", m.license ? esc(m.license) : "Non renseignée");
  sp(
    "Clone HTTPS",
    '<span class="mono" style="font-size:11.5px">' + esc(m.clone) + "</span>",
  );
  if ((m.topics || []).length)
    sp(
      "Topics",
      m.topics.map((t) => '<span class="tchip">' + esc(t) + "</span>").join(""),
    );
  if (m.home)
    sp(
      "Site du projet",
      '<a href="' +
        esc(m.home) +
        '" target="_blank" rel="noopener noreferrer">' +
        esc(m.home) +
        "</a>",
    );
  let langHTML;
  if (r.langsStatus === "loading")
    langHTML = '<div class="sk" style="height:90px"></div>';
  else if (r.langsStatus === "err" || !r.langs || !r.langs.length)
    langHTML =
      '<div class="chart-empty">Répartition des langages indisponible pour ce dépôt.</div>';
  else {
    const ls = r.langs.slice(0, 8);
    langHTML =
      '<div class="lbar">' +
      ls
        .map(
          (l, i) =>
            '<div class="lseg" style="width:' +
            l.pct +
            "%;background:" +
            langColor(l.name) +
            ";--d:" +
            i * 70 +
            'ms" title="' +
            esc(l.name) +
            " · " +
            l.pct.toFixed(1) +
            '%"></div>',
        )
        .join("") +
      "</div>" +
      '<div class="lrows">' +
      ls
        .map(
          (l) =>
            '<div class="lrow"><i class="lr-dot" style="background:' +
            langColor(l.name) +
            ";color:" +
            langColor(l.name) +
            '"></i><span class="lr-name">' +
            esc(l.name) +
            '</span><span class="lr-pct">' +
            l.pct.toFixed(1).replace(".", ",") +
            " %</span>" +
            (l.bytes != null
              ? '<span class="lr-bytes">' + fmtSize(l.bytes) + "</span>"
              : "") +
            "</div>",
        )
        .join("") +
      "</div>";
  }
  pane.innerHTML =
    '<div class="langs-pane">' +
    langHTML +
    '<h3 class="sect-t">' +
    icon("info", 13) +
    'Fiche technique</h3><div class="spec-grid">' +
    spec.join("") +
    "</div></div>";
}
function activityHtml(commits) {
  const weeks = new Array(12).fill(0),
    week = 7 * 86400000,
    now = Date.now();
  for (const c of commits) {
    const t = Date.parse(c.date);
    if (!Number.isFinite(t)) continue;
    const i = Math.floor((now - t) / week);
    if (i >= 0 && i < 12) weeks[11 - i]++;
  }
  const max = Math.max(1, ...weeks);
  const bars = weeks
    .map((v, i) => {
      const h = (v / max) * 46,
        x = 8 + i * 21;
      return (
        '<rect class="' +
        (v ? "act-bar" : "act-bar-empty") +
        '" x="' +
        x +
        '" y="' +
        (58 - h) +
        '" width="13" height="' +
        Math.max(h, v ? 3 : 1.5) +
        '" rx="3"' +
        (v ? ' fill="url(#gradAct)"' : "") +
        "/>" +
        (v
          ? '<text class="act-n" x="' +
            (x + 6.5) +
            '" y="' +
            (52 - h) +
            '" text-anchor="middle" font-size="8">' +
            v +
            "</text>"
          : "")
      );
    })
    .join("");
  const chart =
    '<div class="act-card"><div class="ac-title">' +
    icon("chart", 13) +
    "Activité - 12 dernières semaines</div>" +
    '<svg class="act-svg" viewBox="0 0 260 72" role="img" aria-label="Commits par semaine">' +
    '<defs><linearGradient id="gradAct" x1="0" y1="1" x2="0" y2="0">' +
    '<stop class="grad-a" offset="0"/><stop class="grad-b" offset="1"/>' +
    "</linearGradient></defs>" +
    '<line class="act-axis" x1="4" y1="58.5" x2="256" y2="58.5"/>' +
    bars +
    '<text class="act-label" x="14" y="69" font-size="7">S-11</text>' +
    '<text class="act-label" x="120" y="69" font-size="7">S-6</text>' +
    '<text class="act-label" x="236" y="69" font-size="7">S-0</text>' +
    "</svg></div>";

  const byAuthor = new Map();
  for (const c of commits) {
    const name = c.author || "?";
    const e = byAuthor.get(name) || { n: 0, avatar: c.avatar || "" };
    e.n++;
    byAuthor.set(name, e);
  }
  const initials = (name) =>
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const contribs =
    '<div class="act-card"><div class="ac-title">' +
    icon("users", 13) +
    'Contributeurs récents</div><div class="contribs">' +
    Array.from(byAuthor)
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, 6)
      .map(([name, v]) => {
        const av = v.avatar
          ? '<img src="' + esc(v.avatar) + '" alt="">'
          : '<span class="c-init">' + esc(initials(name)) + "</span>";
        return (
          '<span class="contrib">' +
          av +
          esc(name) +
          " <b>" +
          v.n +
          " commit" +
          (v.n > 1 ? "s" : "") +
          "</b></span>"
        );
      })
      .join("") +
    "</div></div>";
  return chart + contribs;
}
export function renderCommitsPane() {
  const pane = $("pane-commits");
  if (!pane || !S.repo) return;
  const r = S.repo;
  if (r.commitsStatus === "idle" || r.commitsStatus === "loading") {
    pane.innerHTML =
      '<div style="padding:6px"><div class="skel-status">' +
      gitLoader() +
      "<span>Récupération des derniers commits…</span></div>" +
      Array.from(
        { length: 5 },
        () => '<div class="sk" style="height:52px;margin:10px 0"></div>',
      ).join("") +
      "</div>";
    return;
  }
  if (r.commitsStatus === "err") {
    pane.innerHTML =
      '<div class="empty-mini">' +
      icon("alert", 30) +
      '<span>Commits indisponibles.</span><button class="btn btn-ghost btn-sm" data-action="retry-commits">' +
      icon("refresh", 13) +
      "Réessayer</button></div>";
    return;
  }
  if (!r.commits.length) {
    pane.innerHTML =
      '<div class="empty-mini">' +
      icon("commit", 30) +
      "<span>Aucun commit public sur cette branche.</span></div>";
    return;
  }
  let html = '<div class="commits">' + activityHtml(r.commits),
    lastDay = "";
  for (const c of r.commits) {
    const day = dateLong(c.date);
    if (day !== lastDay) {
      html += '<div class="cday">' + icon("calendar", 12) + day + "</div>";
      lastDay = day;
    }
    const first = (c.msg || "").split("\n")[0];
    html +=
      '<div class="crow"><img class="cavatar" src="' +
      esc(c.avatar || initialsAvatar(c.author)) +
      '" alt=""><div class="cmain"><div class="cmsg" title="' +
      esc(c.msg) +
      '">' +
      esc(first) +
      '</div><div class="csub">' +
      esc(c.author) +
      " · " +
      relTime(c.date) +
      '</div></div><button class="sha" data-action="copy-sha" data-sha="' +
      esc(c.sha) +
      '" title="Copier le SHA">' +
      esc(c.sha.slice(0, 7)) +
      "</button>" +
      (c.url
        ? '<a class="btn-icon" href="' +
          esc(c.url) +
          '" target="_blank" rel="noopener noreferrer" aria-label="Voir le commit">' +
          icon("ext", 13) +
          "</a>"
        : "") +
      "</div>";
  }
  pane.innerHTML = html + "</div>";
}
