import "./events.js";
// INITIALISATION
import { $ } from "./utils.js";
import { S } from "./state.js";
import { currentPlatform, hasToken } from "./state.js";
import { heroGraph } from "./hero-graph.js";
import { startI18n } from "./i18n.js";
import { brandLogo, icon } from "./icons.js";
import { renderChips } from "./search.js";
import { renderPlatSeg } from "./search.js";
import { initShare } from "./share.js";
import { renderRecent } from "./ui.js";
import { route } from "./flows.js";

/* ============================== INITIALISATION ============================== */
export function init() {
  $("brandMark").innerHTML = brandLogo(32);
  $("footBrand").innerHTML = brandLogo(18) + "GitAtlas";
  $("favIco").innerHTML = icon("star", 15);
  $("keyIco").innerHTML = icon("key", 15);
  $("dwStar").innerHTML = icon("star", 17);
  $("dwClose").innerHTML = icon("x", 15);
  $("mdKey").innerHTML = icon("key", 18);
  $("mdShield").innerHTML = icon("shield", 15);
  $("mdExt").innerHTML = icon("ext", 11);
  $("goBtn").innerHTML = "Explorer " + icon("ext", 14);
  initShare();
  renderPlatSeg();
  renderChips();
  renderRecent();
  heroGraph();
  const cnt = $("favCount");
  cnt.textContent = S.favs.length;
  cnt.classList.toggle("hidden", !S.favs.length);
  $("tokenBtn").classList.toggle("tok-on", hasToken(currentPlatform()));
  $("hdr").classList.toggle("scrolled", window.scrollY > 8);
  startI18n();
  route();
}
init();
