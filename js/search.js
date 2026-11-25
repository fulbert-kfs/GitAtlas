// RECHERCHE
import { $ } from "./utils.js";
import { S } from "./state.js";
import { icon } from "./icons.js";
import { navigate } from "./flows.js";
import { platIcon } from "./components.js";
import { toast } from "./ui.js";

/* ============================== RECHERCHE ============================== */
export function parseSearch(rawInput, pl) {
  let v = rawInput.trim();
  if (!v) return null;
  let m = v.match(
    /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)(?:\/([\w.-]+))?/i,
  );
  if (m)
    return m[2]
      ? { kind: "repo", pl: "github", value: m[1] + "/" + m[2] }
      : { kind: "profile", pl: "github", value: m[1] };
  m = v.match(
    /^https?:\/\/(?:www\.)?gitlab\.com\/([\w.-]+(?:\/[\w.-]+)*?)(?:\/-\/.*)?\/?$/i,
  );
  if (m) {
    const segs = m[1].split("/");
    return segs.length >= 2
      ? { kind: "repo", pl: "gitlab", value: segs.join("/") }
      : { kind: "profile", pl: "gitlab", value: segs[0] };
  }
  v = v.replace(/^@/, "");
  if (/^[\w.-]+\/[\w./-]+$/.test(v))
    return { kind: "repo", pl, value: v.replace(/\.git$/, "") };
  if (/^[\w.-]+$/.test(v)) return { kind: "profile", pl, value: v };
  return { kind: "invalid" };
}
export function submitSearch() {
  const q = $("q");
  const parsed = parseSearch(q.value, S.platform);
  if (!parsed || parsed.kind === "invalid") {
    const w = $("qWrap");
    w.classList.remove("shake");
    void w.offsetWidth;
    w.classList.add("shake");
    toast(
      "warn",
      "Pseudo invalide - lettres, chiffres, tirets et points uniquement.",
    );
    q.focus();
    return;
  }
  if (parsed.pl !== S.platform) {
    S.platform = parsed.pl;
    renderPlatSeg();
  }
  if (parsed.kind === "profile")
    navigate("#/u/" + parsed.pl + "/" + encodeURIComponent(parsed.value));
  else
    navigate(
      "#/r/" +
        parsed.pl +
        "/" +
        parsed.value.split("/").map(encodeURIComponent).join("/"),
    );
}
export function renderPlatSeg() {
  $("segGh").innerHTML = icon("github", 15) + "GitHub";
  $("segGl").innerHTML = icon("gitlab", 15) + "GitLab";
  $("segGh").className = S.platform === "github" ? "on-p-github" : "";
  $("segGl").className = S.platform === "gitlab" ? "on-p-gitlab" : "";
  $("searchForm").classList.toggle("p-gitlab", S.platform === "gitlab");
  $("q").placeholder =
    S.platform === "gitlab"
      ? "ex. dzaporozhets, sytses…"
      : "ex. torvalds, gaearon, yyx990803…";
}
export function renderChips() {
  const sugg = [
    ["github", "torvalds"],
    ["github", "yyx990803"],
    ["github", "sindresorhus"],
    ["github", "gaearon"],
    ["gitlab", "dzaporozhets"],
  ];
  $("chipsRow").innerHTML =
    '<span class="chips-lbl">Essayez :</span>' +
    sugg
      .map(
        ([p, l]) =>
          '<button class="chip' +
          (p === "gitlab" ? " gl" : "") +
          '" data-action="chip" data-p="' +
          p +
          '" data-login="' +
          l +
          '">' +
          platIcon(p, 12) +
          l +
          "</button>",
      )
      .join("") +
    '<button class="chip chip-demo" data-action="chip" data-p="demo" data-login="lina-forge">' +
    icon("sparkle", 12) +
    "Profil démo</button>";
}
