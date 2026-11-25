// MENU DE PARTAGE
import { $ } from "./utils.js";
import { copyText } from "./utils.js";
import { icon } from "./icons.js";
import { applyLang } from "./i18n.js";
import { toast } from "./ui.js";
import { shareMenuHTML } from "./seo.js";
import { shareUrl } from "./seo.js";

let trigger = null;

const ICONS = {
  native: "share",
  facebook: "facebook",
  x: "x",
  whatsapp: "whatsapp",
  linkedin: "linkedin",
  telegram: "telegram",
  mail: "mail",
  link: "link",
};

export function initShare() {
  $("shareIco").innerHTML = icon("share", 15);
  renderShare();
}

function renderShare() {
  const menu = $("shareMenu");
  menu.innerHTML = shareMenuHTML();
  menu.querySelectorAll("[data-share-icon]").forEach((el) => {
    el.innerHTML = icon(ICONS[el.dataset.shareIcon] || "share", 17);
  });
}

export function isShareOpen() {
  return !$("shareMenu").hidden;
}

function place(btn) {
  const menu = $("shareMenu");
  if (!btn || !document.contains(btn)) return;
  const r = btn.getBoundingClientRect();
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  let top = r.bottom + 8;
  if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 8);
  menu.style.top = Math.round(top) + "px";
  menu.style.left =
    Math.round(Math.min(Math.max(8, r.right - w), innerWidth - w - 8)) + "px";
}

export function openShare(btn) {
  const menu = $("shareMenu");
  renderShare();
  applyLang();
  trigger = btn || null;
  menu.hidden = false;
  document.querySelectorAll('[data-action="share-open"]').forEach((b) => {
    b.setAttribute("aria-expanded", "true");
  });
  place(btn);
  const first = menu.querySelector(".share-item");
  if (first) first.focus();
}

export function closeShare(restoreFocus) {
  const menu = $("shareMenu");
  if (menu.hidden) return;
  menu.hidden = true;
  document.querySelectorAll('[data-action="share-open"]').forEach((b) => {
    b.setAttribute("aria-expanded", "false");
  });
  if (restoreFocus && trigger && document.contains(trigger)) trigger.focus();
  trigger = null;
}

export async function copyShare() {
  const ok = await copyText(shareUrl());
  toast(
    ok ? "success" : "error",
    ok
      ? "Lien GitAtlas copié dans le presse-papiers."
      : "Copie impossible dans ce contexte.",
  );
}

export async function nativeShare() {
  if (!navigator.share) return;
  try {
    await navigator.share({ title: document.title, url: shareUrl() });
  } catch (e) {
    if (e && e.name !== "AbortError") await copyShare();
  }
}

window.addEventListener("scroll", () => place(trigger), { passive: true });
window.addEventListener("resize", () => place(trigger));
