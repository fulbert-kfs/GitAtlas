// PILULE API
import { $ } from "./utils.js";
import { S } from "./state.js";
import { hasToken } from "./state.js";

/* ============================== PILULE API ============================== */
export function updateRatePill(pl) {
  const dot = $("rateDot"),
    txt = $("rateTxt"),
    btn = $("tokenBtn");
  btn.classList.toggle("tok-on", hasToken(pl));
  if (pl === "demo") {
    dot.className = "rdot demo";
    txt.textContent = "Démo · hors-ligne";
    return;
  }
  if (pl === "gitlab") {
    dot.className = "rdot gl";
    txt.textContent = "API GitLab" + (hasToken("gitlab") ? " · jeton" : "");
    return;
  }
  const r = S.rate;
  if (r.remaining == null) {
    dot.className = "rdot";
    txt.textContent = "API GitHub" + (hasToken("github") ? " · jeton" : "");
    return;
  }
  dot.className =
    "rdot " + (r.remaining > 20 ? "" : r.remaining > 5 ? "warn" : "low");
  txt.textContent = "API " + r.remaining + "/" + r.limit;
}
