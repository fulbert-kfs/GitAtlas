// MENU HAMBURGER MOBILE
import { $ } from "./utils.js";
import { icon } from "./icons.js";

/* ============================== MENU MOBILE ============================== */
/* Le panneau réutilise les contrôles de l'en-tête : un seul état à gérer,
   partagé avec le desktop où le menu n'est jamais ouvert. */
let lastFocus = null;

/* On ne touche pas à `body.lock` : retirer la barre verticale décalerait toute
   la page de sa largeur. Le voile bloque le défilement tactile et ce listener
   bloque la molette tant que le panneau est ouvert. */
const blockWheel = (e) => e.preventDefault();

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
  window.addEventListener("wheel", blockWheel, { passive: false });
  const first = $("hdrActions").querySelector("button");
  if (first) first.focus();
}

export function closeMenu(restoreFocus = false) {
  if (!isMenuOpen()) return;
  $("hdr").classList.remove("menu-open");
  $("menuScrim").classList.remove("show");
  $("menuBtn").setAttribute("aria-expanded", "false");
  $("menuIco").innerHTML = icon("menu", 18);
  window.removeEventListener("wheel", blockWheel);
  if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}

export function toggleMenu() {
  if (isMenuOpen()) closeMenu(true);
  else openMenu();
}

// Sur desktop, le panneau redevient une simple barre d'actions : on retire
// le voile même si le menu a été ouvert avant la rotation.
window.addEventListener("resize", () => {
  if (innerWidth > 720 && isMenuOpen()) closeMenu(false);
});
