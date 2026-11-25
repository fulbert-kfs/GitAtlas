// FAVORIS / RÉCENTS / TOASTS
import { $ } from "./utils.js";
import { S } from "./state.js";
import { esc } from "./utils.js";
import { favKey } from "./components.js";
import { icon } from "./icons.js";
import { initialsAvatar } from "./utils.js";
import { isFav } from "./components.js";
import { langColor } from "./languages.js";
import { lsSet } from "./utils.js";
import { platIcon } from "./components.js";
import { platName } from "./components.js";

/* ============================== FAVORIS / RÉCENTS / TOASTS ============================== */
export let toastSeq = 0;
export const TOAST_ACT = {};
export function toast(type, msg, action) {
  const id = ++toastSeq;
  const icons = { success: "check", info: "info", warn: "warn", error: "x" };
  const el = document.createElement("div");
  el.className = "toast t-" + type;
  el.dataset.id = id;
  el.innerHTML =
    '<span class="toast-ic">' +
    icon(icons[type] || "info", 16) +
    '</span><span class="toast-msg">' +
    msg +
    "</span>" +
    (action
      ? '<button class="toast-act" data-action="toast-action" data-id="' +
        id +
        '">' +
        esc(action.label) +
        "</button>"
      : "") +
    '<button class="toast-x" data-action="toast-close" data-id="' +
    id +
    '" aria-label="Fermer">' +
    icon("x", 12) +
    "</button>";
  if (action) TOAST_ACT[id] = action.fn;
  const box = $("toasts");
  box.appendChild(el);
  while (box.children.length > 4) box.firstChild.remove();
  let timer = setTimeout(() => dismissToast(id), 4200);
  el.addEventListener("mouseenter", () => clearTimeout(timer));
  el.addEventListener("mouseleave", () => {
    timer = setTimeout(() => dismissToast(id), 1800);
  });
}
export function dismissToast(id) {
  const el = $("toasts").querySelector('[data-id="' + id + '"]');
  if (el) {
    el.classList.add("out");
    setTimeout(() => el.remove(), 260);
  }
  delete TOAST_ACT[id];
}
export function refreshFavUI() {
  const cnt = $("favCount");
  cnt.textContent = S.favs.length;
  cnt.classList.toggle("hidden", !S.favs.length);
  cnt.classList.remove("pop");
  void cnt.offsetWidth;
  cnt.classList.add("pop");
  document.querySelectorAll("[data-favkey]").forEach((b) => {
    const on = isFav(b.dataset.favkey);
    b.classList.toggle("on", on);
  });
  if ($("drawer").classList.contains("open")) renderFavDrawer();
}
export function toggleFav(kind, pl, id) {
  const key = favKey(kind, pl, id);
  const idx = S.favs.findIndex((f) => f.key === key);
  if (idx >= 0) {
    S.favs.splice(idx, 1);
    toast("info", "Retiré des favoris.");
  } else {
    let item;
    if (kind === "profile") {
      const p =
        S.prof && S.prof.pl === pl && S.prof.login === id
          ? S.prof.profile
          : null;
      item = {
        key,
        kind,
        pl,
        id,
        name: p ? p.name : id,
        avatar: p ? p.avatar : initialsAvatar(id),
        sub: "@" + id + " · " + platName(pl),
      };
    } else {
      let m = S.repo && S.repo.meta.full === id ? S.repo.meta : null;
      if (!m && S.prof)
        m = S.prof.repos.find((x) => x.full === id && x.pl === pl);
      item = {
        key,
        kind,
        pl,
        id,
        name: m ? m.name : id.split("/").pop(),
        lang: m ? m.lang : null,
        stars: m ? m.stars : 0,
        sub: id + " · " + platName(pl),
      };
    }
    S.favs.unshift(item);
    toast("success", "Ajouté aux favoris ⭐");
    const b = document.querySelector('[data-favkey="' + CSS.escape(key) + '"]');
    if (b) {
      b.classList.add("burst");
      setTimeout(() => b.classList.remove("burst"), 400);
    }
  }
  lsSet("favs", S.favs);
  refreshFavUI();
}
export function removeFav(key) {
  const idx = S.favs.findIndex((f) => f.key === key);
  if (idx < 0) return;
  const [item] = S.favs.splice(idx, 1);
  lsSet("favs", S.favs);
  refreshFavUI();
  toast("warn", "Favori retiré.", {
    label: "Annuler",
    fn: () => {
      S.favs.splice(Math.min(idx, S.favs.length), 0, item);
      lsSet("favs", S.favs);
      refreshFavUI();
      toast("success", "Favori restauré.");
    },
  });
}
export function renderFavDrawer() {
  const body = $("dwBody");
  if (!S.favs.length) {
    body.innerHTML =
      '<div class="empty-mini">' +
      icon("star", 36) +
      "<span>Aucun favori pour l\u2019instant.<br>Cliquez sur l\u2019étoile d\u2019un profil ou d\u2019un dépôt pour le retrouver ici.</span></div>";
    return;
  }
  const profs = S.favs.filter((f) => f.kind === "profile"),
    repos = S.favs.filter((f) => f.kind === "repo");
  const row = (f) =>
    '<div class="fav-row" data-action="fav-go" data-kind="' +
    f.kind +
    '" data-pl="' +
    esc(f.pl) +
    '" data-id="' +
    esc(f.id) +
    '">' +
    (f.kind === "profile"
      ? '<img class="fr-ic" src="' +
        esc(f.avatar || initialsAvatar(f.name)) +
        '" alt="">'
      : '<span class="fr-dot"><i class="dot" style="--lc:' +
        langColor(f.lang) +
        '"></i></span>') +
    '<div class="fr-main"><div class="fr-name" role="button" tabindex="0" data-action="fav-go" data-kind="' +
    f.kind +
    '" data-pl="' +
    esc(f.pl) +
    '" data-id="' +
    esc(f.id) +
    '">' +
    esc(f.name) +
    '</div><div class="fr-sub">' +
    esc(f.sub || f.id) +
    "</div></div>" +
    '<button class="fav-btn on" data-action="fav-remove" data-key="' +
    esc(f.key) +
    '" aria-label="Retirer">' +
    icon("star", 13) +
    "</button></div>";
  body.innerHTML =
    (profs.length
      ? '<div class="dw-sect">Profils · ' +
        profs.length +
        "</div>" +
        profs.map(row).join("")
      : "") +
    (repos.length
      ? '<div class="dw-sect">Dépôts · ' +
        repos.length +
        "</div>" +
        repos.map(row).join("")
      : "");
}
export function addRecent(pl, login) {
  if (pl === "demo") return;
  S.recent = S.recent.filter((r) => !(r.pl === pl && r.login === login));
  S.recent.unshift({ pl, login });
  S.recent = S.recent.slice(0, 6);
  lsSet("recent", S.recent);
  renderRecent();
}
export function renderRecent() {
  const row = $("recentRow");
  if (!S.recent.length) {
    row.innerHTML = "";
    return;
  }
  row.innerHTML =
    '<span class="chips-lbl">Récents :</span>' +
    S.recent
      .map(
        (r) =>
          '<button class="chip' +
          (r.pl === "gitlab" ? " gl" : "") +
          '" data-action="chip" data-p="' +
          esc(r.pl) +
          '" data-login="' +
          esc(r.login) +
          '">' +
          platIcon(r.pl, 11) +
          esc(r.login) +
          "</button>",
      )
      .join("") +
    '<button class="clr" data-action="clear-recent">vider</button>';
}
