// GRAPHIQUES
import { esc } from "./utils.js";
import { fmtNum } from "./utils.js";
import { icon } from "./icons.js";
import { langColor } from "./languages.js";
import { relTime } from "./utils.js";

/* ============================== GRAPHIQUES ============================== */

export function donutHTML(repos) {
  const counts = {};
  repos.forEach((r) => {
    const l = r.lang || "Autres";
    counts[l] = (counts[l] || 0) + 1;
  });
  let items = Object.entries(counts)
    .map(([name, value]) => ({ name, value, color: langColor(name) }))
    .sort((a, b) => b.value - a.value);
  if (!items.length)
    return '<div class="chart-empty">Aucun dépôt public à graphique.</div>';
  if (items.length > 7) {
    const rest = items.slice(6);
    items = items.slice(0, 6);
    items.push({
      name: "Autres",
      value: rest.reduce((a, b) => a + b.value, 0),
      color: "#8b93b8",
    });
  }

  const total = items.reduce((a, b) => a + b.value, 0);
  const R = 52, C = 2 * Math.PI * R;
  let off = 0;

  const segs = items
    .map((it, i) => {
      const len = (it.value / total) * C;
      const s =
        '<circle class="dseg" r="' +
        R +
        '" cx="70" cy="70" fill="none" stroke="' +
        it.color +
        '" stroke-width="15" stroke-dasharray="0 ' +
        C.toFixed(2) +
        '" data-da="' +
        Math.max(len - 2.5, 0.6).toFixed(2) +
        " " +
        (C - len + 2.5).toFixed(2) +
        '" stroke-dashoffset="' +
        (-off).toFixed(2) +
        '" style="transition-delay:' +
        i * 70 +
        'ms"><title>' +
        esc(it.name) +
        " · " +
        it.value +
        " dépôt" +
        (it.value > 1 ? "s" : "") +
        "</title></circle>";
      off += len;
      return s;
    })
    .join("");
  const legend = items
    .map(
      (it) =>
        '<div class="dl-row"><i class="dl-dot" style="background:' +
        it.color +
        ";color:" +
        it.color +
        '"></i><span class="dl-name">' +
        esc(it.name) +
        '</span><span class="dl-val">' +
        it.value +
        " · " +
        Math.round((it.value / total) * 100) +
        "%</span></div>",
    )
    .join("");
  return (
    '<div class="donut-wrap"><svg width="140" height="140" viewBox="0 0 140 140"><g transform="rotate(-90 70 70)">' +
    segs +
    '</g><text x="70" y="68" text-anchor="middle" class="dcenter-n">' +
    total +
    '</text><text x="70" y="86" text-anchor="middle" class="dcenter-l">dépôts</text></svg><div class="dlegend">' +
    legend +
    "</div></div>"
  );
}
export function barsHTML(repos) {
  const top = [...repos]
    .filter((r) => r.stars > 0)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6);
  if (!top.length)
    return '<div class="chart-empty">Pas encore d\u2019étoiles - les premiers projets arrivent.</div>';
  const max = top[0].stars;
  return (
    '<div class="bars">' +
    top
      .map(
        (r, i) =>
          '<div class="bar-row" data-action="go-repo" data-pl="' +
          esc(r.pl) +
          '" data-full="' +
          esc(r.full) +
          '" role="button" tabindex="0"><span class="bar-name" title="' +
          esc(r.name) +
          '">' +
          esc(r.name) +
          '</span><div class="bar-track"><div class="bar-fill" style="width:' +
          Math.max((r.stars / max) * 100, 4) +
          "%;--lc:" +
          langColor(r.lang) +
          ";--d:" +
          i * 90 +
          'ms"></div></div><span class="bar-val">' +
          icon("star", 11) +
          fmtNum(r.stars) +
          "</span></div>",
      )
      .join("") +
    "</div>"
  );
}
export function histHTML(repos) {
  if (!repos.length)
    return '<div class="chart-empty">Aucune activité publique.</div>';
  const nowY = new Date().getFullYear();
  const years = {};
  let minY = nowY;
  repos.forEach((r) => {
    const y = new Date(r.pushed || r.updated || r.created).getFullYear();
    if (!isNaN(y)) {
      years[y] = (years[y] || 0) + 1;
      minY = Math.min(minY, y);
    }
  });
  const start = Math.max(minY, nowY - 7);
  const cols = [];
  for (let y = start; y <= nowY; y++) cols.push({ y, n: years[y] || 0 });
  const max = Math.max(...cols.map((c) => c.n), 1);
  const last = [...repos].sort(
    (a, b) => new Date(b.pushed || 0) - new Date(a.pushed || 0),
  )[0];
  return (
    '<div class="hist">' +
    cols
      .map(
        (c, i) =>
          '<div class="hcol" title="' +
          c.y +
          " · " +
          c.n +
          " dépôt" +
          (c.n > 1 ? "s" : "") +
          " actif" +
          (c.n > 1 ? "s" : "") +
          '"><div class="hbar" style="height:' +
          Math.max((c.n / max) * 82, c.n ? 10 : 3) +
          "px;--d:" +
          i * 60 +
          "ms;" +
          (c.n ? "" : "opacity:.25") +
          '"></div><span class="hyear">' +
          String(c.y).slice(2) +
          "</span></div>",
      )
      .join("") +
    '</div><p class="chart-foot">' +
    icon("clock", 13) +
    "Dernier push " +
    relTime(last.pushed || last.updated) +
    "</p>"
  );
}
