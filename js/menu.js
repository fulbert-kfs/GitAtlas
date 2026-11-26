// MENU HAMBURGER MOBILE
import { $ } from "./utils.js";
import { icon } from "./icons.js";
import { lockBody } from "./modal.js";

/* ============================== MENU MOBILE ============================== */
/* Le panneau réutilise les contrôles de l'en-tête : un seul état à gérer,
   partagé avec le desktop où le menu n'est jamais ouvert. */
let lastFocus = null;

export function isMenuOpen() {
  return $("hdr").classList.contains("menu-open");
}

export function openMenu() {
  if (isMenuOpen()) return;
  lastFocus = document.activeElement;
  $("hdr").classList.add("menu-open");
  $("menuScrim").classList.add("show");
  $("menuBtn").setAttribute("aria-expanded", "true");
  $("menuIco").innerHTML = icon("x", 18);
  lockBody(true);
  const first = $("hdrActions").querySelector("button");
  if (first) first.focus();
}

export function closeMenu(restoreFocus = false) {
  if (!isMenuOpen()) return;
  $("hdr").classList.remove("menu-open");
  $("menuScrim").classList.remove("show");
  $("menuBtn").setAttribute("aria-expanded", "false");
  $("menuIco").innerHTML = icon("menu", 18);
  lockBody(false);
  if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}

export function toggleMenu() {
  if (isMenuOpen()) closeMenu(true);
  else openMenu();
}

// Sur desktop, le panneau redevient une simple barre d'actions : on libère
// le voile et le verrou du corps même si le menu a été ouvert avant la rotation.
window.addEventListener("resize", () => {
  if (innerWidth > 720 && isMenuOpen()) closeMenu(false);
});
