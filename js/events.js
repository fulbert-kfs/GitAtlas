// ÉVÉNEMENTS
import { $ } from "./utils.js";
import { closeShare } from "./share.js";
import { copyShare } from "./share.js";
import { isShareOpen } from "./share.js";
import { nativeShare } from "./share.js";
import { openShare } from "./share.js";
import { MD_CODES } from "./markdown.js";
import { closeMenu, isMenuOpen, toggleMenu } from "./menu.js";
import { REDUCED } from "./utils.js";
import { S } from "./state.js";
import { TOAST_ACT } from "./ui.js";
import { applyTreeSel } from "./repo.js";
import { closeDrawer } from "./modal.js";
import { closeModal } from "./modal.js";
import { copyText } from "./utils.js";
import { defaultFilters } from "./state.js";
import { fileBlob } from "./api.js";
import { resetAuthCaches } from "./state.js";
import { setToken } from "./state.js";
import { dismissToast } from "./ui.js";
import { saveBlob } from "./utils.js";
import { downloadUrl } from "./utils.js";
import { icon } from "./icons.js";
import { setLang } from "./i18n.js";
import { initialsAvatar } from "./utils.js";
import { lsSet } from "./utils.js";
import { moveTabInd } from "./repo.js";
import { navigate } from "./flows.js";
import { openDrawer } from "./modal.js";
import { openModal } from "./modal.js";
import { profileFlow } from "./flows.js";
import { rawUrl } from "./api.js";
import { useAuthFiles } from "./api.js";
import { removeFav } from "./ui.js";
import { renderPlatSeg } from "./search.js";
import { renderProfile } from "./profile.js";
import { renderReadmePane } from "./repo.js";
import { renderRecent } from "./ui.js";
import { renderRepos } from "./profile.js";
import { renderViewer } from "./repo.js";
import { repoFlow } from "./flows.js";
import { route } from "./flows.js";
import { saveFilters } from "./profile.js";
import { selectFile } from "./flows.js";
import { submitSearch } from "./search.js";
import { switchTab } from "./flows.js";
import { toast } from "./ui.js";
import { toggleFav } from "./ui.js";
import { treeFilteredHTML } from "./repo.js";
import { treeRowsHTML } from "./repo.js";
import { updateRatePill } from "./rate.js";
import { zipUrl } from "./api.js";

function refreshAfterAuth() {
  if (S.errCtx && S.errCtx.kind === "profile")
    profileFlow(S.errCtx.pl, S.errCtx.login);
  else if (S.view === "profile" && S.prof) profileFlow(S.prof.pl, S.prof.login);
  else if (S.view === "repo" && S.repo) repoFlow(S.repo.pl, S.repo.full);
}

/* ============================== ÉVÉNEMENTS ============================== */
document.addEventListener("click", async (e) => {
  const mdAnchor = e.target.closest('.md-body a[href^="#"]');
  if (mdAnchor) {
    e.preventDefault();
    const id = mdAnchor.getAttribute("href").slice(1);
    const target =
      document.getElementById("md-" + id) || document.getElementById(id);
    if (target)
      target.scrollIntoView({
        behavior: REDUCED ? "auto" : "smooth",
        block: "start",
      });
    return;
  }
  if (
    isShareOpen() &&
    !e.target.closest("#shareMenu") &&
    !e.target.closest('[data-action="share-open"]')
  )
    closeShare();
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action;
  switch (a) {
    case "brand":
      closeMenu(true);
      S.userNav = false;
      navigate("#/", false);
      break;
    case "platform":
      S.platform = el.dataset.p;
      renderPlatSeg();
      $("q").focus();
      break;
    case "chip": {
      closeMenu(true);
      const p = el.dataset.p,
        l = el.dataset.login;
      if (p !== "demo" && p !== S.platform) {
        S.platform = p;
        renderPlatSeg();
      }
      $("q").value = p === "demo" ? "" : l;
      navigate("#/u/" + p + "/" + encodeURIComponent(l));
      break;
    }
    case "clear-recent":
      S.recent = [];
      lsSet("recent", []);
      renderRecent();
      toast("info", "Recherches récentes effacées.");
      break;
    case "focus-search":
      closeMenu(true);
      window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
      setTimeout(() => $("q").focus(), REDUCED ? 0 : 350);
      break;
    case "switch-platform": {
      closeMenu(true);
      const other = S.platform === "github" ? "gitlab" : "github";
      S.platform = other;
      renderPlatSeg();
      $("q").value = el.dataset.login;
      navigate("#/u/" + other + "/" + encodeURIComponent(el.dataset.login));
      break;
    }
    case "go-repo":
      closeMenu(true);
      navigate(
        "#/r/" +
          el.dataset.pl +
          "/" +
          el.dataset.full.split("/").map(encodeURIComponent).join("/"),
      );
      break;
    case "go-profile":
      closeMenu(true);
      navigate(
        "#/u/" + el.dataset.pl + "/" + encodeURIComponent(el.dataset.login),
      );
      break;
    case "fav-profile":
      toggleFav("profile", el.dataset.pl, el.dataset.id);
      break;
    case "fav-repo":
      e.stopPropagation();
      toggleFav("repo", el.dataset.pl, el.dataset.id);
      break;
    case "fav-remove":
      e.stopPropagation();
      removeFav(el.dataset.key);
      break;
    case "fav-go":
      closeDrawer();
      closeMenu(true);
      if (el.dataset.kind === "profile")
        navigate(
          "#/u/" + el.dataset.pl + "/" + encodeURIComponent(el.dataset.id),
        );
      else
        navigate(
          "#/r/" +
            el.dataset.pl +
            "/" +
            el.dataset.id.split("/").map(encodeURIComponent).join("/"),
        );
      break;
    case "menu-toggle":
      toggleMenu();
      break;
    case "menu-close":
      closeMenu(true);
      break;
    case "open-favs":
      openDrawer();
      break;
    case "set-lang":
      setLang(el.dataset.lang);
      break;
    case "close-favs":
      closeDrawer();
      break;
    case "open-token":
      openModal();
      break;
    case "close-modal":
      closeModal();
      break;
    case "save-token": {
      const v = $("tokenInput").value.trim();
      if (!v) {
        toast("warn", "Collez d\u2019abord un jeton.");
        break;
      }
      const pl = $("tokenModal").dataset.pl === "gitlab" ? "gitlab" : "github";
      setToken(pl, v, !$("tokMemory").checked);
      resetAuthCaches();
      closeModal();
      updateRatePill(pl);
      toast(
        "success",
        "Jeton " +
          (pl === "gitlab" ? "GitLab" : "GitHub") +
          " enregistré - dépôts privés activés.",
      );
      refreshAfterAuth();
      break;
    }
    case "clear-token": {
      const pl = $("tokenModal").dataset.pl === "gitlab" ? "gitlab" : "github";
      setToken(pl, "", false);
      resetAuthCaches();
      $("tokenInput").value = "";
      closeModal();
      updateRatePill(pl);
      toast("info", "Jeton retiré - dépôts privés masqués.");
      refreshAfterAuth();
      break;
    }
    case "export-profile": {
      if (!S.prof) break;
      const payload = {
        exportedAt: new Date().toISOString(),
        tool: "GitAtlas",
        platform: S.prof.pl,
        profile: S.prof.profile,
        repositories: S.prof.repos,
      };
      const result = await saveBlob(
        "gitatlas-" + S.prof.login + ".json",
        new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        }),
      );
      toast(
        result === "cancelled" ? "info" : "success",
        result === "cancelled"
          ? "Export JSON annulé."
          : result === "fallback"
            ? "Export JSON lancé…"
            : "Export JSON téléchargé.",
      );
      break;
    }
    case "share-repo":
    case "share-open":
      // Depuis le panneau mobile, on libère le menu et on ancre le menu de
      // partage au hamburger resté visible dans l'en-tête.
      if (isMenuOpen() && $("hdrActions").contains(el)) {
        closeMenu();
        openShare($("menuBtn"));
      } else openShare(el);
      break;
    case "share-close":
      closeShare();
      break;
    case "share-copy":
      closeShare();
      await copyShare();
      break;
    case "share-native":
      closeShare();
      await nativeShare();
      break;
    case "zip-repo": {
      if (!S.repo) break;
      const u = zipUrl(S.repo.meta);
      if (!u) {
        toast(
          "info",
          "Le ZIP est disponible sur les dépôts réels (pas en démo).",
        );
        break;
      }
      toast("info", "Téléchargement du ZIP lancé…");
      window.open(u, "_blank", "noopener");
      break;
    }
    case "copy-clone": {
      if (!S.repo) break;
      const ok = await copyText("git clone " + S.repo.meta.clone);
      if (ok) {
        el.innerHTML = icon("check", 14);
        setTimeout(() => {
          el.innerHTML = icon("copy", 14);
        }, 1300);
      }
      toast(
        ok ? "success" : "error",
        ok ? "Commande de clonage copiée." : "Copie impossible.",
      );
      break;
    }
    case "tab":
      switchTab(el.dataset.tab);
      break;
    case "ftype":
      S.filters.type = el.dataset.t;
      S.batch = 24;
      saveFilters();
      $("typeSeg")
        .querySelectorAll("button")
        .forEach((b) => b.classList.toggle("on", b.dataset.t === el.dataset.t));
      renderRepos();
      break;
    case "layout":
      S.filters.layout = el.dataset.l;
      S.layout = el.dataset.l;
      lsSet("layout", S.layout);
      saveFilters();
      el.parentElement
        .querySelectorAll("button")
        .forEach((b) => b.classList.toggle("on", b.dataset.l === el.dataset.l));
      renderRepos();
      break;
    case "load-more-repos":
      S.batch += 24;
      renderRepos();
      break;
    case "reset-filters":
      S.filters = defaultFilters();
      S.batch = 24;
      saveFilters();
      renderProfile();
      break;
    case "retry-profile":
      if (S.prof) profileFlow(S.prof.pl, S.prof.login);
      else if (S.errCtx) profileFlow(S.errCtx.pl, S.errCtx.login);
      else route();
      break;
    case "retry-repo":
      if (S.repo) repoFlow(S.repo.pl, S.repo.meta.full);
      else route();
      break;
    case "retry-commits":
      if (S.repo) {
        S.repo.commitsStatus = "idle";
        switchTab("commits");
      }
      break;
    case "retry-file":
      if (S.repo && S.repo.sel) selectFile(S.repo.sel, true);
      break;
    case "tree-toggle": {
      if (!S.repo || !S.repo.tree) break;
      if (S.repo.treeQ) {
        S.repo.treeQ = "";
        const ts = $("treeSearch");
        if (ts) ts.value = "";
        $("treeRoot").innerHTML = treeRowsHTML(S.repo.tree.root.children, "");
        applyTreeSel();
      }
      const path = el.dataset.path;
      const node = S.repo.tree.map.get(path);
      if (!node) break;
      const kids = el.nextElementSibling;
      const open = el.classList.toggle("open");
      el.setAttribute("aria-expanded", open);
      if (open) {
        if (!kids.dataset.loaded) {
          kids.innerHTML = treeRowsHTML(node.children, "");
          kids.dataset.loaded = "1";
        }
        kids.hidden = false;
        S.repo.treeOpen.add(path);
        applyTreeSel();
      } else {
        kids.hidden = true;
        S.repo.treeOpen.delete(path);
      }
      break;
    }
    case "tree-file":
      selectFile(el.dataset.path);
      break;
    case "tree-collapse-all":
      if (S.repo && S.repo.tree) {
        S.repo.treeOpen.clear();
        S.repo.treeQ = "";
        const ts = $("treeSearch");
        if (ts) ts.value = "";
        $("treeRoot").innerHTML = treeRowsHTML(S.repo.tree.root.children, "");
        applyTreeSel();
        toast("info", "Arborescence repliée.");
      }
      break;
    case "tree-mtoggle": {
      if (!S.repo) break;
      S.repo.mobileTree = !S.repo.mobileTree;
      const tp = $("treePane");
      if (tp) tp.classList.toggle("open", S.repo.mobileTree);
      break;
    }
    case "copy-file": {
      if (!S.repo || !S.repo.file || S.repo.file.kind !== "text") break;
      const ok = await copyText(S.repo.file.text);
      if (ok) {
        el.innerHTML = icon("check", 14);
        setTimeout(() => {
          el.innerHTML = icon("copy", 14);
        }, 1300);
      }
      toast(
        ok ? "success" : "error",
        ok
          ? "Fichier copié (" + S.repo.file.path.split("/").pop() + ")."
          : "Copie impossible.",
      );
      break;
    }
    case "download-file": {
      if (!S.repo || !S.repo.file) break;
      const f = S.repo.file;
      const name = f.path.split("/").pop();
      let result;
      if (f.kind === "text")
        result = await saveBlob(
          name,
          new Blob([f.text], { type: "text/plain;charset=utf-8" }),
        );
      else if (useAuthFiles(S.repo.meta)) {
        try {
          const blob = await fileBlob(S.repo.meta, f.path);
          result = await saveBlob(name, blob);
        } catch (e) {
          toast("alert", "Téléchargement impossible : " + (e.message || e));
          break;
        }
      } else {
        const u = rawUrl(S.repo.meta, f.path);
        if (u) result = await downloadUrl(u, name);
        else {
          toast("info", "Téléchargement indisponible en démo pour ce fichier.");
          break;
        }
      }
      toast(
        result === "cancelled" ? "info" : "success",
        result === "cancelled"
          ? "Téléchargement annulé : " + name
          : "Téléchargement de " + name + " lancé.",
      );
      break;
    }
    case "wrap-toggle": {
      if (!S.repo) break;
      S.repo.wrap = !S.repo.wrap;
      el.classList.toggle("on", S.repo.wrap);
      el.setAttribute("aria-pressed", S.repo.wrap);
      const body = document.querySelector("#codePane .code-body");
      if (body) body.classList.toggle("wrap", S.repo.wrap);
      break;
    }
    case "md-view-toggle":
      if (S.repo) {
        S.repo.fileSource = !S.repo.fileSource;
        renderViewer();
      }
      break;
    case "readme-src-toggle":
      if (S.repo) {
        S.repo.readmeSource = !S.repo.readmeSource;
        renderReadmePane();
      }
      break;
    case "readme-copy": {
      if (!S.repo || !S.repo.readme) break;
      const ok = await copyText(S.repo.readme.text);
      toast(
        ok ? "success" : "error",
        ok ? "README copié en Markdown." : "Copie impossible.",
      );
      break;
    }
    case "readme-dl": {
      if (!S.repo || !S.repo.readme) break;
      const result = await saveBlob(
        S.repo.readme.path.split("/").pop(),
        new Blob([S.repo.readme.text], {
          type: "text/markdown;charset=utf-8",
        }),
      );
      toast(
        result === "cancelled" ? "info" : "success",
        result === "cancelled"
          ? "Téléchargement du README annulé."
          : "README téléchargé.",
      );
      break;
    }
    case "copy-block": {
      const code = MD_CODES[el.dataset.k];
      if (code == null) break;
      const ok = await copyText(code);
      if (ok) {
        const old = el.innerHTML;
        el.innerHTML = icon("check", 12) + "Copié !";
        setTimeout(() => {
          el.innerHTML = old;
        }, 1300);
      }
      toast(
        ok ? "success" : "error",
        ok ? "Bloc de code copié." : "Copie impossible.",
      );
      break;
    }
    case "copy-sha": {
      const ok = await copyText(el.dataset.sha);
      toast(
        ok ? "success" : "error",
        ok ? "SHA copié : " + el.dataset.sha.slice(0, 7) : "Copie impossible.",
      );
      break;
    }
    case "load-rest-file": {
      if (!S.repo || !S.repo.fileLines) break;
      S.repo.fileShown = Math.min(S.repo.fileShown + 5000, 15000);
      renderViewer();
      break;
    }
    case "toast-close":
      dismissToast(el.dataset.id);
      break;
    case "toast-action": {
      const fn = TOAST_ACT[el.dataset.id];
      dismissToast(el.dataset.id);
      if (fn) fn();
      break;
    }
  }
});
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.id === "repoFilter" && S.filters) {
    S.filters.q = t.value;
    S.batch = 24;
    saveFilters();
    renderRepos();
  } else if (t.id === "treeSearch" && S.repo && S.repo.tree) {
    S.repo.treeQ = t.value.trim();
    $("treeRoot").innerHTML = S.repo.treeQ
      ? treeFilteredHTML(S.repo.treeQ)
      : treeRowsHTML(S.repo.tree.root.children, "");
    applyTreeSel();
  }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.id === "langSel" && S.filters) {
    S.filters.lang = t.value;
    S.batch = 24;
    saveFilters();
    renderRepos();
  } else if (t.id === "sortSel" && S.filters) {
    S.filters.sort = t.value;
    S.batch = 24;
    saveFilters();
    renderRepos();
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "searchForm") {
    e.preventDefault();
    submitSearch();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (isShareOpen()) closeShare(true);
    else if ($("tokenModal").classList.contains("open")) closeModal();
    else if ($("drawer").classList.contains("open")) closeDrawer();
    else if (isMenuOpen()) closeMenu(true);
    return;
  }
  const typing =
    /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) ||
    e.target.isContentEditable;
  if (e.key === "/" && !typing) {
    e.preventDefault();
    $("q").focus();
    $("q").select();
    return;
  }
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.matches &&
    e.target.matches("[data-action][tabindex]")
  ) {
    e.preventDefault();
    e.target.click();
  }
});
document.addEventListener(
  "error",
  (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.fb) {
      t.dataset.fb = "1";
      t.src = initialsAvatar(t.alt || "?");
    }
  },
  true,
);
window.addEventListener(
  "scroll",
  () => {
    $("hdr").classList.toggle("scrolled", window.scrollY > 8);
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  if (S.view === "repo") moveTabInd();
});
window.addEventListener("hashchange", () => closeMenu());
window.addEventListener("hashchange", route);
