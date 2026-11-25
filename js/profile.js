// RENDU PROFIL
import { $ } from "./utils.js";
import { S } from "./state.js";
import { barsHTML } from "./charts.js";
import { donutHTML } from "./charts.js";
import { esc } from "./utils.js";
import { favBtn } from "./components.js";
import { fmtNum } from "./utils.js";
import { histHTML } from "./charts.js";
import { icon } from "./icons.js";
import { initialsAvatar } from "./utils.js";
import { langColor } from "./languages.js";
import { monthYear } from "./utils.js";
import { observeReveals } from "./effects.js";
import { platIcon } from "./components.js";
import { platName } from "./components.js";
import { postRender } from "./effects.js";
import { relTime } from "./utils.js";
import { stopRateTimer } from "./flows.js";
import { updateRatePill } from "./rate.js";

/* ============================== RENDU PROFIL ============================== */
export function heroMode() {
  const h = $("hero");
  h.classList.toggle("micro", S.view === "repo");
  h.classList.toggle("compact", S.view === "profile" && S.userNav);
}
export function renderProfile() {
  const { pl, login, profile: p, repos } = S.prof;
  S.errCtx = null;
  stopRateTimer();
  updateRatePill(pl);
  const totalStars = repos.reduce((a, r) => a + (r.stars || 0), 0);
  const totalForks = repos.reduce((a, r) => a + (r.forks || 0), 0);
  const f4 =
    p.followers != null
      ? { v: p.followers, l: "abonnés", ic: "users", cls: "s-green" }
      : {
          v: null,
          l: "dernière activité",
          ic: "clock",
          cls: "s-green",
          txt: repos.length ? relTime(repos[0].pushed) : "-",
        };
  const meta = [];
  if (p.company)
    meta.push(
      '<span class="mchip">' +
        icon("building", 13) +
        esc(p.company) +
        "</span>",
    );
  if (p.location)
    meta.push(
      '<span class="mchip">' + icon("pin", 13) + esc(p.location) + "</span>",
    );
  if (p.blog)
    meta.push(
      '<span class="mchip">' +
        icon("link", 13) +
        '<a href="' +
        esc(/^https?:/.test(p.blog) ? p.blog : "https://" + p.blog) +
        '" target="_blank" rel="noopener noreferrer">' +
        esc(p.blog.replace(/^https?:\/\//, "")) +
        "</a></span>",
    );
  if (p.twitter)
    meta.push(
      '<span class="mchip">' +
        icon("globe", 13) +
        "@" +
        esc(p.twitter) +
        "</span>",
    );
  if (p.created)
    meta.push(
      '<span class="mchip">' +
        icon("calendar", 13) +
        "inscrit·e en " +
        monthYear(p.created) +
        "</span>",
    );
  const langs = [...new Set(repos.map((r) => r.lang).filter(Boolean))].sort(
    (a, b) =>
      repos.filter((r) => r.lang === b).length -
      repos.filter((r) => r.lang === a).length,
  );
  const banner =
    pl === "demo"
      ? '<div class="demo-banner reveal in">' +
        icon("sparkle", 16) +
        '<span><b>Mode démonstration</b> : profil fictif, données locales hors-ligne. Entrez un pseudo réel ci-dessus pour interroger l\u2019API en direct.</span><span class="sp"></span><button class="btn btn-warm btn-sm" data-action="focus-search">Chercher un vrai profil ' +
        icon("ext", 13) +
        "</button></div>"
      : "";
  const statTile = (cls, ic, val, label, txt) =>
    '<div class="stat ' +
    cls +
    ' reveal"><div class="stat-ic">' +
    icon(ic, 20) +
    '</div><div><div class="stat-num"' +
    (txt ? "" : ' data-count="' + val + '"') +
    ">" +
    (txt || "0") +
    '</div><div class="stat-label">' +
    label +
    "</div></div></div>";
  $("stage").innerHTML =
    '<div class="wrap">' +
    banner +
    '<section class="pcard reveal"><div class="pmain"><div class="avatar-ring"><img class="pavatar" src="' +
    esc(p.avatar || initialsAvatar(p.name)) +
    '" alt="Avatar de ' +
    esc(p.name) +
    '"></div><div class="pinfo">' +
    '<div class="pname-row"><h2 class="pname">' +
    esc(p.name) +
    "</h2>" +
    (p.org ? '<span class="badge b-pub">Organisation</span>' : "") +
    (pl === "demo" ? '<span class="badge b-arch">Fictif</span>' : "") +
    "</div>" +
    '<div class="plogin"><span class="plat-badge ' +
    pl +
    '">' +
    platIcon(pl, 11) +
    platName(pl) +
    "</span>@" +
    esc(p.login) +
    "</div>" +
    (p.bio ? '<p class="pbio">' + esc(p.bio) + "</p>" : "") +
    '<div class="pmeta">' +
    meta.join("") +
    "</div></div></div>" +
    '<div class="pside"><div class="pfollow">' +
    (p.followers != null
      ? '<div><b data-count="' +
        p.followers +
        '">0</b><span>abonnés</span></div>'
      : "") +
    (p.following != null
      ? '<div><b data-count="' +
        p.following +
        '">0</b><span>abonnements</span></div>'
      : "") +
    "</div>" +
    '<div class="pactions">' +
    (p.url
      ? '<a class="btn btn-ghost btn-sm" href="' +
        esc(p.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        platIcon(pl, 14) +
        "Voir sur " +
        platName(pl) +
        icon("ext", 12) +
        "</a>"
      : "") +
    favBtn("profile", pl, p.login) +
    '<button class="btn btn-ghost btn-sm" data-action="export-profile">' +
    icon("download", 14) +
    "Exporter JSON</button></div></div></section>" +
    '<section class="stats-row">' +
    statTile("s-gold", "star", totalStars, "étoiles cumulées") +
    statTile("s-vio", "fork", totalForks, "forks cumulés") +
    statTile(
      "s-cyan",
      "box",
      p.publicRepos != null ? p.publicRepos : repos.length,
      p.own ? "dépôts (dont privés)" : "dépôts publics",
    ) +
    statTile(f4.cls, f4.ic, f4.v, f4.l, f4.txt) +
    "</section>" +
    '<section class="charts-row">' +
    '<div class="chart-card reveal" style="--d:60ms"><h3 class="chart-title">' +
    icon("code", 13) +
    "Langages (par dépôt)</h3>" +
    donutHTML(repos) +
    "</div>" +
    '<div class="chart-card reveal" style="--d:120ms"><h3 class="chart-title">' +
    icon("star", 13) +
    "Dépôts les plus étoilés</h3>" +
    barsHTML(repos) +
    "</div>" +
    '<div class="chart-card reveal" style="--d:180ms"><h3 class="chart-title">' +
    icon("chart", 13) +
    "Activité · pushs par an</h3>" +
    histHTML(repos) +
    "</div>" +
    "</section>" +
    '<div class="toolbar" id="toolbar">' +
    '<span class="rcount"><b id="repoCount">' +
    repos.length +
    "</b> dépôts</span>" +
    '<div class="tsearch">' +
    icon("search", 14) +
    '<input id="repoFilter" placeholder="Filtrer les dépôts…" value="' +
    esc(S.filters.q) +
    '" aria-label="Filtrer les dépôts"></div>' +
    '<select class="sel" id="langSel" aria-label="Filtrer par langage"><option value="all">Tous les langages</option>' +
    langs
      .map(
        (l) =>
          '<option value="' +
          esc(l) +
          '"' +
          (S.filters.lang === l ? " selected" : "") +
          ">" +
          esc(l) +
          " (" +
          repos.filter((r) => r.lang === l).length +
          ")</option>",
      )
      .join("") +
    "</select>" +
    '<div class="seg seg-sm" id="typeSeg">' +
    [
      ["all", "Tous"],
      ["source", "Sources"],
      ["fork", "Forks"],
      ["arch", "Archivés"],
    ]
      .map(
        ([t, l]) =>
          '<button data-action="ftype" data-t="' +
          t +
          '" class="' +
          (S.filters.type === t ? "on" : "") +
          '">' +
          l +
          "</button>",
      )
      .join("") +
    "</div>" +
    '<select class="sel" id="sortSel" aria-label="Trier"><option value="stars"' +
    (S.filters.sort === "stars" ? " selected" : "") +
    '>Étoiles ↓</option><option value="recent"' +
    (S.filters.sort === "recent" ? " selected" : "") +
    '>Activité récente</option><option value="name"' +
    (S.filters.sort === "name" ? " selected" : "") +
    '>Nom A→Z</option><option value="created"' +
    (S.filters.sort === "created" ? " selected" : "") +
    ">Créés récemment</option></select>" +
    '<div class="seg seg-sm"><button data-action="layout" data-l="grid" class="' +
    (S.filters.layout === "grid" ? "on" : "") +
    '" aria-label="Vue grille">' +
    icon("grid", 14) +
    '</button><button data-action="layout" data-l="list" class="' +
    (S.filters.layout === "list" ? "on" : "") +
    '" aria-label="Vue liste">' +
    icon("list", 14) +
    "</button></div>" +
    "</div>" +
    '<div id="repoArea"></div><div id="moreArea"></div>' +
    "</div>";
  renderRepos();
  postRender();
}
export function filteredRepos() {
  const { repos } = S.prof;
  const f = S.filters;
  let out = repos.filter((r) => {
    if (f.type === "source" && r.fork) return false;
    if (f.type === "fork" && !r.fork) return false;
    if (f.type === "arch" && !r.archived) return false;
    if (f.lang !== "all" && r.lang !== f.lang) return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      if (
        !(
          r.name.toLowerCase().includes(q) ||
          (r.desc || "").toLowerCase().includes(q) ||
          (r.topics || []).join(" ").toLowerCase().includes(q)
        )
      )
        return false;
    }
    return true;
  });
  const by = {
    stars: (a, b) => b.stars - a.stars || a.name.localeCompare(b.name),
    recent: (a, b) => new Date(b.pushed || 0) - new Date(a.pushed || 0),
    name: (a, b) => a.name.localeCompare(b.name, "fr"),
    created: (a, b) => new Date(b.created || 0) - new Date(a.created || 0),
  };
  out.sort(by[f.sort] || by.stars);
  return out;
}
export function repoCardHTML(r, i) {
  const lc = langColor(r.lang);
  const badges =
    (r.private
      ? '<span class="badge b-priv">' + icon("lock", 10) + "Privé</span>"
      : "") +
    (r.fork
      ? '<span class="badge b-fork">' + icon("fork", 10) + "Fork</span>"
      : "") +
    (r.archived
      ? '<span class="badge b-arch">' + icon("archive", 10) + "Archivé</span>"
      : "");
  const topics =
    (r.topics || [])
      .slice(0, 3)
      .map((t) => '<span class="tchip">' + esc(t) + "</span>")
      .join("") +
    ((r.topics || []).length > 3
      ? '<span class="tchip">+' + (r.topics.length - 3) + "</span>"
      : "");
  return (
    '<article class="rcard reveal" style="--lc:' +
    lc +
    ";--d:" +
    Math.min(i, 10) * 45 +
    'ms" data-action="go-repo" data-pl="' +
    esc(r.pl) +
    '" data-full="' +
    esc(r.full) +
    '">' +
    '<div class="rc-top"><span class="rc-lang"><i class="dot"></i>' +
    esc(r.lang || "-") +
    '</span><div class="rc-badges">' +
    badges +
    "</div>" +
    favBtn("repo", r.pl, r.full) +
    "</div>" +
    '<h4 class="rc-name"><button type="button" class="name-open" data-action="go-repo" data-pl="' +
    esc(r.pl) +
    '" data-full="' +
    esc(r.full) +
    '" aria-label="Ouvrir ' +
    esc(r.name) +
    '">' +
    icon("book", 15) +
    "<span>" +
    esc(r.name) +
    "</span></button></h4>" +
    '<p class="rc-desc">' +
    esc(r.desc || "Pas de description.") +
    "</p>" +
    (topics ? '<div class="rc-topics">' + topics + "</div>" : "") +
    '<div class="rc-foot"><span class="rc-stat st">' +
    icon("star", 12) +
    fmtNum(r.stars) +
    '</span><span class="rc-stat">' +
    icon("fork", 12) +
    fmtNum(r.forks) +
    "</span>" +
    (r.issues != null
      ? '<span class="rc-stat">' +
        icon("alert", 12) +
        fmtNum(r.issues) +
        "</span>"
      : "") +
    '<span class="rc-upd">maj ' +
    relTime(r.pushed || r.updated) +
    "</span></div></article>"
  );
}
export function repoRowHTML(r, i) {
  const lc = langColor(r.lang);
  return (
    '<article class="rrow reveal" style="--lc:' +
    lc +
    ";--d:" +
    Math.min(i, 12) * 30 +
    'ms" data-action="go-repo" data-pl="' +
    esc(r.pl) +
    '" data-full="' +
    esc(r.full) +
    '">' +
    '<div class="rr-main"><button type="button" class="rr-name name-open" data-action="go-repo" data-pl="' +
    esc(r.pl) +
    '" data-full="' +
    esc(r.full) +
    '"><span>' +
    esc(r.name) +
    "</span>" +
    (r.archived ? '<span class="badge b-arch">Archivé</span>' : "") +
    (r.fork ? '<span class="badge b-fork">Fork</span>' : "") +
    '</button><span class="rr-desc">' +
    esc(r.desc || "") +
    "</span></div>" +
    '<span class="rr-lang"><i class="dot"></i><span>' +
    esc(r.lang || "-") +
    "</span></span>" +
    '<span class="rr-num st">' +
    icon("star", 12) +
    fmtNum(r.stars) +
    "</span>" +
    '<span class="rr-num rr-forks">' +
    icon("fork", 12) +
    fmtNum(r.forks) +
    "</span>" +
    '<span class="rr-upd">' +
    relTime(r.pushed || r.updated) +
    "</span>" +
    favBtn("repo", r.pl, r.full) +
    "</article>"
  );
}
export function renderRepos() {
  const area = $("repoArea"),
    more = $("moreArea");
  if (!area) return;
  const list = filteredRepos();
  const total = S.prof.repos.length;
  const cnt = $("repoCount");
  if (cnt)
    cnt.textContent =
      list.length === total ? total : list.length + " / " + total;
  if (!total) {
    area.innerHTML =
      '<div class="empty-mini">' +
      icon("inbox", 36) +
      "<span>Ce profil ne possède aucun dépôt public pour le moment.</span></div>";
    more.innerHTML = "";
    return;
  }
  if (!list.length) {
    area.innerHTML =
      '<div class="empty-mini">' +
      icon("search", 36) +
      '<span>Aucun dépôt ne correspond à ces filtres.</span><button class="btn btn-ghost btn-sm" data-action="reset-filters">' +
      icon("refresh", 13) +
      "Réinitialiser les filtres</button></div>";
    more.innerHTML = "";
    return;
  }
  const shown = list.slice(0, S.batch);
  area.innerHTML =
    S.filters.layout === "grid"
      ? '<div class="rgrid">' + shown.map(repoCardHTML).join("") + "</div>"
      : '<div class="rlist">' + shown.map(repoRowHTML).join("") + "</div>";
  more.innerHTML =
    list.length > S.batch
      ? '<div class="more-wrap"><button class="btn btn-ghost" data-action="load-more-repos">' +
        icon("chevd", 14) +
        "Afficher 24 de plus (" +
        (list.length - S.batch) +
        " restants)</button></div>"
      : list.length > 10
        ? '<div class="end-note">' +
          icon("check", 13) +
          "Tous les dépôts sont affichés</div>"
        : "";
  observeReveals(area);
  observeReveals(more);
}
export function saveFilters() {
  const key = S.prof.pl + ":" + S.prof.login;
  const c = S.profCache.get(key);
  if (c) c.filters = { ...S.filters };
}
