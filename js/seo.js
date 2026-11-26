// SEO & MÉTADONNÉES DE PARTAGE
import { S } from "./state.js";
import { esc } from "./utils.js";

/* ⚠️ SEULE valeur à remplacer avant la mise en ligne (avec le bloc statique
   équivalent dans index.html, lu par les crawlers qui n'exécutent pas JS). */
export const SITE_URL = "https://gitatlas.netlify.app";

const BASE = SITE_URL.replace(/\/+$/, "");
const ROOT = BASE + "/";
const IMAGE = BASE + "/assets/og-cover.png";
const DESC_FR =
  "Entrez un pseudo GitHub ou GitLab : explorez tous ses dépôts publics, leur structure, leur code, leurs README, langages et activité.";
const DESC_EN =
  "Enter a GitHub or GitLab username: explore all their public repositories, their structure, their code, their READMEs, languages and activity.";

function setMeta(attr, key, value) {
  let el = document.head.querySelector("meta[" + attr + '="' + key + '"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (el.content !== value) el.content = value;
}

function setProp(key, value) {
  setMeta("property", key, value);
}

function setName(key, value) {
  setMeta("name", key, value);
}

/* Les crawlers sociaux ne reçoivent pas le fragment # : la page partagée est
   donc toujours la racine. Le titre et la description suivent la vue courante
   pour les onglets et les aperçus qui exécutent JS. */
export function pageInfo() {
  const en = S.lang === "en";
  let title = en
    ? "GitAtlas - GitHub & GitLab profile explorer"
    : "GitAtlas - Explorateur de profils GitHub & GitLab";
  let desc = en ? DESC_EN : DESC_FR;

  if (S.view === "profile" && S.prof) {
    const p = S.prof.profile;
    const login = p.login || S.prof.login;
    const count = S.prof.repos ? S.prof.repos.length : 0;
    const plat = S.prof.pl === "gitlab" ? "GitLab" : "GitHub";
    title =
      (p.name || login) +
      " (@" +
      login +
      ") · " +
      plat +
      (en ? " profile - GitAtlas" : " - profil GitAtlas");
    const bio = p.bio ? " " + p.bio : "";
    desc = en
      ? (p.name || login) +
        " - " +
        count +
        " public repositories on " +
        plat +
        "." +
        bio +
        " Explore projects, files and commits with GitAtlas."
      : (p.name || login) +
        " - " +
        count +
        " dépôts publics sur " +
        plat +
        "." +
        bio +
        " Explorez ses projets, fichiers et commits avec GitAtlas.";
  } else if (S.view === "repo" && S.repo && S.repo.meta) {
    const m = S.repo.meta;
    const plat = S.repo.pl === "gitlab" ? "GitLab" : "GitHub";
    title = m.full + " · " + plat + (en ? " repository - GitAtlas" : " - dépôt GitAtlas");
    const d = m.desc ? " " + m.desc : "";
    desc = en
      ? m.full +
        " on " +
        plat +
        "." +
        d +
        " Browse the tree, source code and commits with GitAtlas."
      : m.full +
        " sur " +
        plat +
        "." +
        d +
        " Explorez l'arborescence, le code et les commits avec GitAtlas.";
  }

  return { title: title.slice(0, 120), desc: desc.slice(0, 300) };
}

export function setSeo() {
  const { title, desc } = pageInfo();
  const en = S.lang === "en";
  document.title = title;
  setProp("og:title", title);
  setName("twitter:title", title);
  setProp("og:description", desc);
  setName("twitter:description", desc);
  setProp("og:locale", en ? "en_US" : "fr_FR");
  setProp("og:image:alt", en ? "GitAtlas - GitHub & GitLab explorer" : "GitAtlas - explorateur de profils GitHub et GitLab");
  setName("twitter:image:alt", en ? "GitAtlas - GitHub & GitLab explorer" : "GitAtlas - explorateur de profils GitHub et GitLab");

  const canon = document.querySelector('link[rel="canonical"]');
  if (canon && canon.href !== ROOT) canon.href = ROOT;
  setProp("og:url", ROOT);
  setProp("og:image", IMAGE);
  setProp("og:image:secure_url", IMAGE);
  setName("twitter:image", IMAGE);
}

/* URL partagée : Produit uniquement l'URL publique configurée, jamais un
   file:// local. Le fragment conserve la vue profil/dépôt. */
export function shareUrl() {
  const hash = location.hash && location.hash !== "#/" ? location.hash : "";
  return ROOT + hash;
}

export function shareTargets() {
  const url = shareUrl();
  const u = encodeURIComponent(url);
  const text = pageInfo().title;
  const t = encodeURIComponent(text);
  const targets = [];
  if (typeof navigator !== "undefined" && typeof navigator.share === "function")
    targets.push({ key: "native", label: "Partage natif", action: "share-native" });
  targets.push(
    {
      key: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/sharer/sharer.php?u=" + u,
    },
    {
      key: "x",
      label: "X (Twitter)",
      href: "https://twitter.com/intent/tweet?url=" + u + "&text=" + t,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: "https://wa.me/?text=" + encodeURIComponent(text + " " + url),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/sharing/share-offsite/?url=" + u,
    },
    {
      key: "telegram",
      label: "Telegram",
      href: "https://t.me/share/url?url=" + u + "&text=" + t,
    },
    {
      key: "mail",
      label: "E-mail",
      href:
        "mailto:?subject=" +
        t +
        "&body=" +
        encodeURIComponent(text + "\n" + url),
    },
    {
      key: "link",
      label: "Copier le lien",
      action: "share-copy",
    },
  );
  return targets;
}

export function shareMenuHTML() {
  return shareTargets()
    .map((t) => {
      const tag = t.action ? "button" : "a";
      const attrs = t.action
        ? 'type="button" data-action="' + t.action + '"'
        : 'href="' +
          esc(t.href) +
          '" target="_blank" rel="noopener noreferrer" data-action="share-close"';
      return (
        '<' +
        tag +
        ' class="share-item" ' +
        attrs +
        ' aria-label="' +
        esc(t.label) +
        '">' +
        '<span class="share-ico" aria-hidden="true" data-share-icon="' +
        t.key +
        '"></span>' +
        '<span>' +
        esc(t.label) +
        "</span></" +
        tag +
        ">"
      );
    })
    .join("");
}
