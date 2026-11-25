// FLUX & ROUTAGE
import { $ } from "./utils.js";
import { REDUCED } from "./utils.js";
import { S } from "./state.js";
import { addRecent } from "./ui.js";
import { applyTreeSel } from "./repo.js";
import { buildTree } from "./tree.js";
import { defaultFilters } from "./state.js";
import { errorHTML } from "./components.js";
import { freshRepoState } from "./repo.js";
import { heroMode } from "./profile.js";
import { highlightLines } from "./highlight.js";
import { loadCommitsData } from "./api.js";
import { loadFileData } from "./api.js";
import { loadLangsData } from "./api.js";
import { loadProfileData } from "./api.js";
import { loadReadmeData } from "./api.js";
import { loadRepoMeta } from "./api.js";
import { loadTreeData } from "./api.js";
import { lsCacheGet } from "./state.js";
import { lsCacheSet } from "./state.js";
import { moveTabInd } from "./repo.js";
import { observeReveals } from "./effects.js";
import { setSeo } from "./seo.js";
import { renderCommitsPane } from "./repo.js";
import { renderLangsPane } from "./repo.js";
import { renderProfile } from "./profile.js";
import { renderReadmePane } from "./repo.js";
import { renderRepoShell } from "./repo.js";
import { renderTreePane } from "./repo.js";
import { renderViewer } from "./repo.js";
import { skelProfile } from "./components.js";
import { skelRepo } from "./components.js";

/* ============================== FLUX & ROUTAGE ============================== */
export function stopRateTimer() {
  if (S.rateTimer) {
    clearInterval(S.rateTimer);
    S.rateTimer = null;
  }
}
export function startRateTimer(resetMs, ctx) {
  stopRateTimer();
  const tick = () => {
    const el = $("rateCount"),
      bar = $("rateBar");
    const left = Math.max(0, resetMs - Date.now());
    if (el) {
      const m = Math.floor(left / 60000),
        s = Math.floor((left % 60000) / 1000);
      el.textContent =
        String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }
    if (bar)
      bar.style.width = Math.min(100, (left / (60 * 60 * 1000)) * 100) + "%";
    if (left <= 0) {
      stopRateTimer();
      if (S.errCtx && S.errCtx.kind === "profile")
        profileFlow(S.errCtx.pl, S.errCtx.login);
    }
  };
  tick();
  S.rateTimer = setInterval(tick, 1000);
}
export async function profileFlow(pl, login) {
  const gen = ++S.gen;
  S.view = "profile";
  S.errCtx = null;
  stopRateTimer();
  heroMode();
  window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
  const key = pl + ":" + login;
  const cached = S.profCache.get(key) || lsCacheGet(key);
  if (cached) {
    S.prof = { pl, login, profile: cached.profile, repos: cached.repos };
    S.profCache.set(key, cached);
    S.filters = cached.filters
      ? { ...cached.filters, layout: S.layout }
      : defaultFilters();
    S.batch = 24;
    renderProfile();
    setSeo();
    return;
  }
  $("stage").innerHTML = skelProfile(pl);
  try {
    const data = await loadProfileData(pl, login);
    if (gen !== S.gen) return;
    S.prof = { pl, login, profile: data.profile, repos: data.repos };
    S.profCache.set(key, { profile: data.profile, repos: data.repos });
    if (pl !== "demo")
      lsCacheSet(key, { profile: data.profile, repos: data.repos });
    S.filters = defaultFilters();
    S.batch = 24;
    addRecent(pl, login);
    renderProfile();
    setSeo();
  } catch (e) {
    if (gen !== S.gen) return;
    $("stage").innerHTML = errorHTML({ kind: "profile", pl, login }, e);
    if (e.type === "rate")
      startRateTimer((e.reset || Date.now() / 1000 + 900) * 1000, {
        pl,
        login,
      });
    observeReveals($("stage"));
  }
}
export async function repoFlow(pl, full) {
  const gen = ++S.gen;
  S.view = "repo";
  S.errCtx = null;
  stopRateTimer();
  heroMode();
  window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
  $("stage").innerHTML = skelRepo();
  try {
    let meta = S.repoCache.get(pl + ":" + full);
    if (!meta && S.prof && S.prof.pl === pl)
      meta = S.prof.repos.find((x) => x.full === full) || null;
    if (!meta) meta = await loadRepoMeta(pl, full);
    if (gen !== S.gen) return;
    S.repoCache.set(pl + ":" + full, meta);
    S.repo = freshRepoState(pl, meta);
    renderRepoShell();
    setSeo();
    loadTreeData(meta)
      .then(async (t) => {
        if (gen !== S.gen) return;
        S.repo.tree = buildTree(t.entries);
        S.repo.truncated = t.truncated;
        S.repo.treeStatus = "ok";
        renderTreePane();
        const rd = t.entries.find(
          (e) =>
            e.type === "blob" &&
            /^readme(\.(md|markdown|rst|txt))?$/i.test(e.path) &&
            !e.path.includes("/"),
        );
        if (rd) selectFile(rd.path, true);
        try {
          const readme = await loadReadmeData(meta, t.entries);
          if (gen !== S.gen) return;
          S.repo.readme = readme;
          S.repo.readmeStatus = "ok";
          renderReadmePane();
        } catch (e) {
          if (gen !== S.gen) return;
          S.repo.readmeStatus = "err";
          renderReadmePane();
        }
      })
      .catch((e) => {
        if (gen !== S.gen) return;
        S.repo.treeStatus = "err";
        S.repo.treeErr = e;
        S.repo.readmeStatus = "err";
        renderTreePane();
        renderReadmePane();
      });
    loadLangsData(meta)
      .then((l) => {
        if (gen !== S.gen) return;
        S.repo.langs = l;
        S.repo.langsStatus = "ok";
        renderLangsPane();
      })
      .catch(() => {
        if (gen !== S.gen) return;
        S.repo.langsStatus = "err";
        renderLangsPane();
      });
    renderLangsPane();
  } catch (e) {
    if (gen !== S.gen) return;
    $("stage").innerHTML = errorHTML({ kind: "repo", pl, login: null }, e);
    observeReveals($("stage"));
  }
}
export function selectFile(path, silent) {
  const r = S.repo;
  if (!r || !r.tree) return;
  const node = r.tree.map.get(path);
  if (!node) return;
  r.sel = path;
  r.fileSource = false;
  r.fileShown = 1200;
  applyTreeSel();
  if (node.type === "commit") {
    r.file = { kind: "submodule", path };
    r.fileStatus = "ok";
    renderViewer();
    return;
  }
  r.fileStatus = "loading";
  renderViewer();
  const req = ++r.fileReq;
  loadFileData(r.meta, node)
    .then((f) => {
      if (req !== r.fileReq || S.view !== "repo") return;
      r.file = f;
      r.fileStatus = "ok";
      if (f.kind === "text") r.fileLines = highlightLines(f.text, f.langKey);
      renderViewer();
      if (!silent && window.innerWidth < 900) {
        r.mobileTree = false;
        const tp = $("treePane");
        if (tp) tp.classList.remove("open");
        const cp = $("codePane");
        if (cp)
          cp.scrollIntoView({
            behavior: REDUCED ? "auto" : "smooth",
            block: "start",
          });
      }
    })
    .catch((e) => {
      if (req !== r.fileReq || S.view !== "repo") return;
      r.fileStatus = "err";
      r.fileErr = e;
      renderViewer();
    });
}
export function switchTab(t) {
  const r = S.repo;
  if (!r) return;
  r.tab = t;
  const tabs = $("repoTabs");
  tabs.querySelectorAll(".tab").forEach((b) => {
    const on = b.dataset.tab === t;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", on);
  });
  ["files", "readme", "langs", "commits"].forEach((k) => {
    const p = $("pane-" + k);
    if (p) p.classList.toggle("hidden", k !== t);
  });
  moveTabInd();
  if (t === "commits" && r.commitsStatus === "idle") {
    r.commitsStatus = "loading";
    renderCommitsPane();
    const gen = S.gen;
    loadCommitsData(r.meta)
      .then((c) => {
        if (gen !== S.gen) return;
        r.commits = c;
        r.commitsStatus = "ok";
        renderCommitsPane();
      })
      .catch(() => {
        if (gen !== S.gen) return;
        r.commitsStatus = "err";
        renderCommitsPane();
      });
  }
}
export function navigate(hash, user) {
  if (user !== false) S.userNav = true;
  if (location.hash === hash) route();
  else location.hash = hash;
}
export function route() {
  const h = location.hash.replace(/^#\/?/, "");
  const parts = h.split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] === "u" && parts[1] && parts[2]) {
    profileFlow(parts[1], parts.slice(2).join("/"));
    return;
  }
  if (parts[0] === "r" && parts[1] && parts[2] && parts.length >= 4) {
    repoFlow(parts[1], parts.slice(2).join("/"));
    return;
  }
  history.replaceState(null, "", "#/u/demo/lina-forge");
  profileFlow("demo", "lina-forge");
}
