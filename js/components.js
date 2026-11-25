// COMPOSANTS HTML
import { S } from "./state.js";
import { esc } from "./utils.js";
import { icon } from "./icons.js";

/* ============================== COMPOSANTS HTML ============================== */
export const platIcon = (pl, s = 13) =>
  pl === "gitlab"
    ? icon("gitlab", s)
    : pl === "demo"
      ? icon("sparkle", s)
      : icon("github", s);
export const platName = (pl) =>
  pl === "gitlab" ? "GitLab" : pl === "demo" ? "Démo" : "GitHub";
export function favKey(kind, pl, id) {
  return kind + ":" + pl + ":" + id;
}
export function isFav(key) {
  return S.favs.some((f) => f.key === key);
}
export function favBtn(kind, pl, id, extra) {
  const key = favKey(kind, pl, id);
  return (
    '<button class="fav-btn' +
    (isFav(key) ? " on" : "") +
    '" data-action="fav-' +
    kind +
    '" data-pl="' +
    esc(pl) +
    '" data-id="' +
    esc(id) +
    '" data-favkey="' +
    esc(key) +
    '" aria-label="Ajouter aux favoris" title="Favori" ' +
    (extra || "") +
    ">" +
    icon("star", 15) +
    "</button>"
  );
}
export function gitLoader() {
  return '<svg class="gitloader" width="52" height="16" viewBox="0 0 52 16"><line x1="4" y1="8" x2="48" y2="8" stroke="#31427A" stroke-width="2"/><circle class="gl-dot" cx="10" cy="8" r="4" fill="#7B6CFF"/><circle class="gl-dot" cx="26" cy="8" r="4" fill="#FF6B3D"/><circle class="gl-dot" cx="42" cy="8" r="4" fill="#2BD4F0"/></svg>';
}
export function skelProfile(pl) {
  const cards = Array.from(
    { length: 6 },
    (_, i) => '<div class="sk" style="height:150px;--d:' + i + '"></div>',
  ).join("");
  return (
    '<div class="wrap"><div class="skel-status">' +
    gitLoader() +
    "<span>Interrogation de " +
    (pl === "gitlab" ? "gitlab.com" : "api.github.com") +
    '…</span></div><div class="sk" style="height:170px;border-radius:20px"></div><div class="stats-row"><div class="sk" style="height:76px"></div><div class="sk" style="height:76px"></div><div class="sk" style="height:76px"></div><div class="sk" style="height:76px"></div></div><div class="rgrid">' +
    cards +
    "</div></div>"
  );
}
export function skelRepo() {
  return (
    '<div class="wrap"><div class="skel-status">' +
    gitLoader() +
    '<span>Chargement du dépôt…</span></div><div class="sk" style="height:52px;border-radius:12px"></div><div class="sk" style="height:190px;border-radius:20px"></div><div class="sk" style="height:46px"></div><div class="files-split"><div class="sk" style="height:440px"></div><div class="sk" style="height:440px"></div></div></div>'
  );
}
export function noticeHTML(ic, cls, title, msg, actions, extra) {
  return (
    '<div class="notice-card reveal in"><div class="n-ic ' +
    cls +
    '">' +
    icon(ic, 30) +
    "</div><h3>" +
    title +
    "</h3><p>" +
    msg +
    "</p>" +
    (extra || "") +
    '<div class="n-actions">' +
    (actions || "") +
    "</div></div>"
  );
}
export function errorHTML(ctx, e) {
  const demoBtn =
    '<button class="btn btn-warm btn-sm" data-action="chip" data-p="demo" data-login="lina-forge">' +
    icon("sparkle", 14) +
    "Explorer la démo</button>";
  if (e.type === "rate") {
    const reset = e.reset ? e.reset * 1000 : Date.now() + 15 * 60 * 1000;
    S.errCtx = { ...ctx, kind: ctx.kind, reset };
    return noticeHTML(
      "clock",
      "warn",
      "Limite de requêtes atteinte",
      "L'API publique GitHub autorise 60 requêtes/heure par IP. Réessayez après le réinitialisation du compteur, ou ajoutez un jeton gratuit pour monter à 5 000/h.",
      '<button class="btn btn-pri btn-sm" data-action="open-token">' +
        icon("key", 14) +
        "Ajouter un jeton</button>" +
        demoBtn,
      '<div class="rate-count" id="rateCount">--:--</div><div class="rate-bar"><i id="rateBar" style="width:100%"></i></div>',
    );
  }
  if (e.type === "notfound") {
    const other = S.platform === "github" ? "gitlab" : "github";
    const sw = ctx.login
      ? '<button class="btn btn-ghost btn-sm" data-action="switch-platform" data-login="' +
        esc(ctx.login) +
        '">' +
        platIcon(other, 14) +
        "Chercher « " +
        esc(ctx.login) +
        " » sur " +
        platName(other) +
        "</button>"
      : "";
    return noticeHTML(
      "search",
      "",
      "Profil introuvable",
      ctx.kind === "repo"
        ? "Ce dépôt n\u2019existe pas, est privé, ou a été renommé. Vérifiez le nom complet « owner/dépôt »."
        : "Ce pseudo n\u2019existe pas sur " +
            platName(ctx.pl) +
            ". Vérifiez l\u2019orthographe, ou essayez l\u2019autre plateforme.",
      sw +
        '<button class="btn btn-ghost btn-sm" data-action="focus-search">' +
        icon("left", 14) +
        "Modifier la recherche</button>" +
        demoBtn,
    );
  }
  if (e.type === "network") {
    return noticeHTML(
      "cloudoff",
      "",
      "Connexion impossible",
      "Impossible de joindre l'API (" +
        (ctx.pl === "gitlab" ? "gitlab.com" : "api.github.com") +
        "). Vérifiez votre connexion - ou explorez le profil de démonstration, entièrement hors-ligne.",
      '<button class="btn btn-pri btn-sm" data-action="retry-' +
        (ctx.kind === "repo" ? "repo" : "profile") +
        '">' +
        icon("refresh", 14) +
        "Réessayer</button>" +
        demoBtn,
    );
  }
  return noticeHTML(
    "alert",
    "",
    "Erreur API " + (e.status || ""),
    "L'API a répondu par une erreur inattendue. Vous pouvez réessayer.",
    '<button class="btn btn-pri btn-sm" data-action="retry-' +
      (ctx.kind === "repo" ? "repo" : "profile") +
      '">' +
      icon("refresh", 14) +
      "Réessayer</button>" +
      demoBtn,
  );
}
