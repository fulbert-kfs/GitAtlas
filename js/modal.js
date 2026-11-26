// MODALE / TIROIR
import { $ } from "./utils.js";
import { S } from "./state.js";
import { currentPlatform } from "./state.js";
import { hasToken } from "./state.js";
import { tokenPersisted } from "./state.js";
import { renderFavDrawer } from "./ui.js";

/* ============================== MODALE / TIROIR ============================== */
/* La fenêtre défile via <html> (le `overflow-x` est porté par la racine pour
   garder une gouttière stable). `body.lock` seul ne suffit donc pas : on bloque
   aussi la molette, sauf dans le tiroir ou la modale qui ont leur propre zone
   défilante. */
const blockWheel = (e) => {
  if (e.target instanceof Element && e.target.closest(".drawer.open, .modal.open")) return;
  e.preventDefault();
};

export function lockBody(on) {
  S.lockCount = Math.max(0, S.lockCount + (on ? 1 : -1));
  const locked = S.lockCount > 0;
  document.body.classList.toggle("lock", locked);
  if (locked) window.addEventListener("wheel", blockWheel, { passive: false });
  else window.removeEventListener("wheel", blockWheel);
}
export function openDrawer() {
  S.lastFocus = document.activeElement;
  renderFavDrawer();
  $("drawer").classList.add("open");
  $("dwScrim").classList.add("show");
  lockBody(true);
  $("dwClose").focus();
}
export function closeDrawer() {
  if (!$("drawer").classList.contains("open")) return;
  $("drawer").classList.remove("open");
  $("dwScrim").classList.remove("show");
  lockBody(false);
  if (S.lastFocus) S.lastFocus.focus();
}
export function openModal() {
  S.lastFocus = document.activeElement;
  const gl = currentPlatform() === "gitlab";
  const name = gl ? "GitLab" : "GitHub";
  $("tokenModal").dataset.pl = gl ? "gitlab" : "github";
  $("tokenModal").setAttribute("aria-label", "Jeton d'accès " + name);
  $("mdTitle").textContent = name;
  $("mdDesc").innerHTML = gl
    ? "Ajoutez un <b>jeton personnel GitLab</b> (scope <b>read_api</b>) pour voir vos projets privés depuis votre profil."
    : "Ajoutez un jeton personnel pour voir <b>vos dépôts privés</b> et portez la limite de l'API GitHub de 60 à 5 000 requêtes/heure.";
  $("mdHost").textContent = gl ? "gitlab.com/api/v4" : "api.github.com";
  $("tokenInput").placeholder = gl ? "glpat-…" : "github_pat_… ou ghp_…";
  $("tokenInput").setAttribute("aria-label", "Jeton " + name);
  $("mdLink").href = gl
    ? "https://gitlab.com/-/user_settings/personal_access_tokens"
    : "https://github.com/settings/tokens?type=beta";
  $("mdLinkTxt").textContent = "Créer un jeton sur " + name;
  $("mdScopes").innerHTML = gl
    ? "GitLab : cochez le scope <b>read_api</b>. Le jeton reste sur cet appareil."
    : "GitHub : scope <b>repo</b> (classique) ou <b>Contents: read</b> (jeton affiné).";
  $("tokenInput").value = S.tokens[gl ? "gitlab" : "github"] || "";
  $("tokMemory").checked = !tokenPersisted(gl ? "gitlab" : "github");
  $("tokClear").style.display = hasToken(gl ? "gitlab" : "github")
    ? ""
    : "none";
  $("tokenModal").classList.add("open");
  $("mdScrim").classList.add("show");
  lockBody(true);
  setTimeout(() => $("tokenInput").focus(), 80);
}
export function closeModal() {
  if (!$("tokenModal").classList.contains("open")) return;
  $("tokenModal").classList.remove("open");
  $("mdScrim").classList.remove("show");
  lockBody(false);
  if (S.lastFocus) S.lastFocus.focus();
}
