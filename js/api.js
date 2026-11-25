// COUCHE RÉSEAU
import { BIN_EXT } from "./languages.js";
import { blobToDataURL } from "./utils.js";
import { DEMO_REPOS } from "./demo-data.js";
import { DEMO_USER } from "./demo-data.js";
import { IMG_EXT } from "./languages.js";
import { S } from "./state.js";
import { authToken } from "./state.js";
import { delay } from "./utils.js";
import { demoCommits } from "./demo-data.js";
import { extOf } from "./languages.js";
import { initialsAvatar } from "./utils.js";
import { langOf } from "./languages.js";
import { updateRatePill } from "./rate.js";

/* ============================== COUCHE RÉSEAU ============================== */ 
export function err(type, extra) {
  return Object.assign(new Error(type), { type }, extra || {});
}
export function captureRate(h) {
  const rem = h.get("x-ratelimit-remaining"),
    lim = h.get("x-ratelimit-limit"),
    res = h.get("x-ratelimit-reset");
  if (rem != null) {
    S.rate = { limit: +lim || 60, remaining: +rem, reset: res ? +res : null };
    updateRatePill("github");
  }
}

export function ghHeaders(extra = {}) {
  const h = { ...extra };
  const t = authToken("github");
  if (t) h.Authorization = "Bearer " + t;
  return h;
}
export function glHeaders(extra = {}) {
  const h = { ...extra };
  const t = authToken("gitlab");
  if (t) h["PRIVATE-TOKEN"] = t;
  return h;
}
export async function ghFetch(path, opts = {}) {
  const url = path.startsWith("http") ? path : "https://api.github.com" + path;
  const headers = ghHeaders({
    Accept: opts.accept || "application/vnd.github+json",
  });
  let res;
  try {
    res = await fetch(url, { headers });
  } catch (e) {
    throw err("network");
  }
  captureRate(res.headers);
  if (res.status === 404) throw err("notfound");
  if (
    (res.status === 403 || res.status === 429) &&
    (S.rate.remaining === 0 || res.headers.get("x-ratelimit-remaining") === "0")
  ) {
    throw err("rate", {
      reset: S.rate.reset || +(res.headers.get("retry-after") || 0),
    });
  }
  if (!res.ok) throw err("http", { status: res.status });
  return opts.text ? res.text() : res.json();
}
export async function glFetch(path, opts = {}) {
  const url = path.startsWith("http")
    ? path
    : "https://gitlab.com/api/v4" + path;
  let res;
  try {
    res = await fetch(url, { headers: glHeaders() });
  } catch (e) {
    throw err("network");
  }
  if (res.status === 404) throw err("notfound");
  if (res.status === 429)
    throw err("rate", { reset: Math.floor(Date.now() / 1000) + 60 });
  if (!res.ok) throw err("http", { status: res.status });
  return opts.text ? res.text() : res.json();
}
export async function authLogin(pl) {
  if (!authToken(pl)) return null;
  if (S.me[pl]) return S.me[pl];
  try {
    const u = pl === "github" ? await ghFetch("/user") : await glFetch("/user");
    S.me[pl] = String(u.login || u.username || "").toLowerCase();
  } catch (e) {
    S.me[pl] = "";
  }
  return S.me[pl];
}
export async function isOwnProfile(pl, login) {
  const me = await authLogin(pl);
  return !!me && me === String(login || "").toLowerCase();
}
export async function rawText(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw err("network");
  }
  if (res.status === 404) throw err("notfound");
  if (!res.ok) throw err("http", { status: res.status });
  return res.text();
}
export const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");
export function ghFileText(repo, path) {
  return ghFetch(
    "/repos/" +
      repo.full +
      "/contents/" +
      encPath(path) +
      "?ref=" +
      encodeURIComponent(repo.branch),
    { accept: "application/vnd.github.raw+json", text: true },
  );
}
export function glFileText(repo, path) {
  return glFetch(
    "/projects/" +
      repo.id +
      "/repository/files/" +
      encodeURIComponent(path) +
      "/raw?ref=" +
      encodeURIComponent(repo.branch),
    { text: true },
  );
}
export function fileText(repo, path) {
  if (repo.pl === "github") return ghFileText(repo, path);
  if (repo.pl === "gitlab") return glFileText(repo, path);
  return null;
}
export async function ghFileBlob(repo, path) {
  const res = await fetch(
    "https://api.github.com/repos/" +
      repo.full +
      "/contents/" +
      encPath(path) +
      "?ref=" +
      encodeURIComponent(repo.branch),
    {
      headers: ghHeaders({ Accept: "application/vnd.github.raw+json" }),
    },
  );
  if (!res.ok) throw err("http", { status: res.status });
  return res.blob();
}
export async function glFileBlob(repo, path) {
  const res = await fetch(
    "https://gitlab.com/api/v4/projects/" +
      repo.id +
      "/repository/files/" +
      encodeURIComponent(path) +
      "/raw?ref=" +
      encodeURIComponent(repo.branch),
    { headers: glHeaders() },
  );
  if (!res.ok) throw err("http", { status: res.status });
  return res.blob();
}
export function fileBlob(repo, path) {
  if (repo.pl === "github") return ghFileBlob(repo, path);
  if (repo.pl === "gitlab") return glFileBlob(repo, path);
  return null;
}
export async function fileDataUrl(repo, path) {
  const b = await fileBlob(repo, path);
  return b ? blobToDataURL(b) : rawUrl(repo, path);
}
export function useAuthFiles(repo) {
  return !!repo && repo.pl !== "demo" && !!authToken(repo.pl);
}
export function rawUrl(repo, path) {
  if (repo.pl === "demo") {
    const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
    const c = r && r.files[path];
    if (c != null && extOf(path) === "svg")
      return "data:image/svg+xml;utf8," + encodeURIComponent(c);
    return null;
  }
  if (repo.pl === "github")
    return (
      "https://raw.githubusercontent.com/" +
      repo.full +
      "/" +
      repo.branch +
      "/" +
      encPath(path)
    );
  return (
    "https://gitlab.com/" +
    repo.full +
    "/-/raw/" +
    repo.branch +
    "/" +
    encPath(path)
  );
}
export function blobUrl(repo, path) {
  if (repo.pl === "demo") return null;
  if (repo.pl === "github")
    return (
      "https://github.com/" +
      repo.full +
      "/blob/" +
      repo.branch +
      "/" +
      encPath(path)
    );
  return (
    "https://gitlab.com/" +
    repo.full +
    "/-/blob/" +
    repo.branch +
    "/" +
    encPath(path)
  );
}
export function treeUrl(repo) {
  if (repo.pl === "demo") return null;
  if (repo.pl === "github")
    return (
      "https://github.com/" +
      repo.full +
      "/tree/" +
      encodeURIComponent(repo.branch)
    );
  return (
    "https://gitlab.com/" +
    repo.full +
    "/-/tree/" +
    encodeURIComponent(repo.branch)
  );
}
export function zipUrl(repo) {
  if (repo.pl === "demo") return null;
  if (repo.pl === "github")
    return (
      "https://codeload.github.com/" +
      repo.full +
      "/zip/refs/heads/" +
      repo.branch
    );
  return (
    repo.url +
    "/-/archive/" +
    repo.branch +
    "/" +
    repo.name +
    "-" +
    repo.branch +
    ".zip"
  );
}
export function mapGhRepo(r) {
  return {
    pl: "github",
    id: r.id,
    name: r.name,
    full: r.full_name,
    owner: r.owner.login,
    ownerAvatar: r.owner.avatar_url,
    desc: r.description || "",
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    issues: r.open_issues_count ?? null,
    watchers: r.subscribers_count ?? null,
    sizeKB: r.size ?? null,
    lang: r.language || null,
    topics: r.topics || [],
    license: r.license
      ? r.license.spdx_id && r.license.spdx_id !== "NOASSERTION"
        ? r.license.spdx_id
        : r.license.name
      : null,
    fork: !!r.fork,
    private: !!r.private,
    archived: !!r.archived,
    created: r.created_at,
    updated: r.updated_at,
    pushed: r.pushed_at,
    branch: r.default_branch || "main",
    url: r.html_url,
    clone: r.clone_url,
    home: r.homepage || null,
  };
}
export function mapGlProject(p, owner, avatar) {
  return {
    pl: "gitlab",
    id: p.id,
    name: p.name,
    full: p.path_with_namespace,
    owner: owner || p.path_with_namespace.split("/")[0],
    ownerAvatar: p.avatar_url || avatar,
    desc: p.description || "",
    stars: p.star_count || 0,
    forks: p.forks_count || 0,
    issues: p.open_issues_count ?? null,
    watchers: null,
    sizeKB: p.statistics
      ? Math.round(p.statistics.repository_size / 1024)
      : null,
    lang: null,
    topics: p.topics || p.tag_list || [],
    license: p.license ? p.license.nickname || p.license.name : null,
    fork: !!p.forked_from_project,
    private: p.visibility === "private" || p.visibility === "internal",
    archived: !!p.archived,
    created: p.created_at,
    updated: p.last_activity_at,
    pushed: p.last_activity_at,
    branch: p.default_branch || "main",
    url: p.web_url,
    clone: p.http_url_to_repo,
    home: null,
  };
}
export async function loadProfileData(pl, login) {
  if (pl === "demo") {
    await delay(320);
    return {
      profile: { ...DEMO_USER },
      repos: DEMO_REPOS.map((r) => ({ ...r.meta })),
    };
  }
  if (pl === "github") {
    const own = await isOwnProfile(pl, login);
    const u = own
      ? await ghFetch("/user")
      : await ghFetch("/users/" + encodeURIComponent(login));
    const reposPath = own
      ? "/user/repos?affiliation=owner&per_page=100&sort=pushed"
      : "/users/" +
        encodeURIComponent(login) +
        "/repos?per_page=100&sort=pushed&type=owner";
    let repos = await ghFetch(reposPath);
    if (repos.length === 100) {
      const more = await Promise.all(
        [2, 3].map((p) => ghFetch(reposPath + "&page=" + p).catch(() => [])),
      );
      for (const m of more) {
        repos = repos.concat(m);
        if (m.length < 100) break;
      }
    }
    return {
      profile: {
        pl: "github",
        login: u.login,
        name: u.name || u.login,
        avatar: u.avatar_url,
        bio: u.bio || "",
        company: u.company,
        location: u.location,
        blog: u.blog,
        twitter: u.twitter_username,
        followers: u.followers,
        following: u.following,
        publicRepos: own ? repos.length : u.public_repos,
        own,
        created: u.created_at,
        url: u.html_url,
        org: u.type === "Organization",
      },
      repos: repos.map(mapGhRepo),
    };
  }
  const own = await isOwnProfile(pl, login);
  let det, followers, following;
  if (own) {
    det = await glFetch("/user");
  } else {
    const found = await glFetch("/users?username=" + encodeURIComponent(login));
    if (!Array.isArray(found) || !found.length) throw err("notfound");
    const id = found[0].id;
    [det, followers, following] = await Promise.all([
      glFetch("/users/" + id).catch(() => found[0]),
      fetch("https://gitlab.com/api/v4/users/" + id + "/followers?per_page=1")
        .then((r) => +r.headers.get("x-total") || null)
        .catch(() => null),
      fetch("https://gitlab.com/api/v4/users/" + id + "/following?per_page=1")
        .then((r) => +r.headers.get("x-total") || null)
        .catch(() => null),
    ]);
  }
  const projectsPath = own
    ? "/projects?owned=true&per_page=100&order_by=last_activity_at"
    : "/users/" +
      det.id +
      "/projects?per_page=100&order_by=last_activity_at&visibility=public";
  let projects = await glFetch(projectsPath);
  if (projects.length === 100) {
    const more = await Promise.all(
      [2, 3].map((p) => glFetch(projectsPath + "&page=" + p).catch(() => [])),
    );
    for (const m of more) {
      projects = projects.concat(m);
      if (m.length < 100) break;
    }
  }
  updateRatePill("gitlab");
  return {
    profile: {
      pl: "gitlab",
      login: det.username,
      name: det.name || det.username,
      avatar: det.avatar_url || initialsAvatar(det.name),
      bio: det.bio || "",
      company: det.organization,
      location: det.location,
      blog: det.website_url,
      twitter: null,
      followers,
      following,
      publicRepos: projects.length,
      own,
      created: det.created_at,
      url: det.web_url,
      org: false,
    },
    repos: projects.map((p) => mapGlProject(p, det.username, det.avatar_url)),
  };
}
export async function loadRepoMeta(pl, full) {
  if (pl === "demo") {
    const r = DEMO_REPOS.find((x) => x.meta.full === full);
    if (!r) throw err("notfound");
    return { ...r.meta };
  }
  if (pl === "github") return mapGhRepo(await ghFetch("/repos/" + full));
  return mapGlProject(
    await glFetch(
      "/projects/" + encodeURIComponent(full) + "?statistics=true&license=true",
    ),
    null,
    null,
  );
}
export async function loadTreeData(repo) {
  if (repo.pl === "demo") {
    await delay(260);
    const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
    return { entries: r.tree, truncated: false };
  }
  if (repo.pl === "github") {
    const d = await ghFetch(
      "/repos/" +
        repo.full +
        "/git/trees/" +
        encodeURIComponent(repo.branch) +
        "?recursive=1",
    );
    return {
      entries: (d.tree || []).map((e) => ({
        path: e.path,
        type: e.type,
        size: e.size,
      })),
      truncated: !!d.truncated,
    };
  }
  let entries = [],
    truncated = false;
  for (let page = 1; page <= 5; page++) {
    const d = await glFetch(
      "/projects/" +
        repo.id +
        "/repository/tree?recursive=true&per_page=100&page=" +
        page +
        "&ref=" +
        encodeURIComponent(repo.branch),
    );
    entries = entries.concat(
      d.map((e) => ({ path: e.path, type: e.type, size: null })),
    );
    if (d.length < 100) break;
    if (page === 5) truncated = true;
  }
  return { entries, truncated };
}
export async function loadReadmeData(repo, entries) {
  const cand = entries.filter(
    (e) =>
      e.type === "blob" &&
      /(?:^|\/)readme(?:\.(?:md|markdown|rst|txt))?$/i.test(e.path),
  );
  cand.sort(
    (a, b) =>
      (a.path.includes("/") ? 1 : 0) - (b.path.includes("/") ? 1 : 0) ||
      (/\.md$/i.test(b.path) ? 1 : 0) - (/\.md$/i.test(a.path) ? 1 : 0),
  );
  if (!cand.length) return null;
  const path = cand[0].path;
  let text;
  if (repo.pl === "demo") {
    const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
    text = r.files[path];
  } else if (useAuthFiles(repo)) {
    text = await fileText(repo, path);
  } else if (repo.pl === "github") {
    text = await rawText(rawUrl(repo, path));
  } else {
    text = await rawText(
      "https://gitlab.com/api/v4/projects/" +
        repo.id +
        "/repository/files/" +
        encodeURIComponent(path) +
        "/raw?ref=" +
        encodeURIComponent(repo.branch),
    );
  }
  return { path, text, plain: !/\.(md|markdown)$/i.test(path) };
}
export async function loadLangsData(repo) {
  const toArr = (obj) => {
    const tot = Object.values(obj).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(obj)
      .map(([name, v]) => ({ name, pct: (v / tot) * 100, bytes: v }))
      .sort((a, b) => b.pct - a.pct);
  };
  if (repo.pl === "demo") {
    await delay(180);
    const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
    return toArr(r.langs);
  }
  if (repo.pl === "github") {
    return toArr(await ghFetch("/repos/" + repo.full + "/languages"));
  }
  const d = await glFetch("/projects/" + repo.id + "/languages");
  return Object.entries(d)
    .map(([name, pct]) => ({ name, pct, bytes: null }))
    .sort((a, b) => b.pct - a.pct);
}
export async function loadCommitsData(repo) {
  if (repo.pl === "demo") {
    await delay(240);
    const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
    return demoCommits(r);
  }
  if (repo.pl === "github") {
    const d = await ghFetch("/repos/" + repo.full + "/commits?per_page=15");
    return d.map((c) => ({
      sha: c.sha,
      msg: (c.commit && c.commit.message) || "",
      author: (c.commit && c.commit.author && c.commit.author.name) || "?",
      avatar:
        (c.author && c.author.avatar_url) ||
        initialsAvatar(c.commit && c.commit.author && c.commit.author.name),
      date: c.commit && c.commit.author && c.commit.author.date,
      url: c.html_url,
    }));
  }
  const d = await glFetch(
    "/projects/" +
      repo.id +
      "/repository/commits?per_page=15&ref_name=" +
      encodeURIComponent(repo.branch),
  );
  return d.map((c) => ({
    sha: c.id,
    msg: c.message || c.title || "",
    author: c.author_name,
    avatar: initialsAvatar(c.author_name),
    date: c.created_at,
    url: c.web_url,
  }));
}
export async function loadFileData(repo, node) {
  const ext = extOf(node.path);
  if (IMG_EXT.has(ext))
    return {
      kind: "image",
      url: useAuthFiles(repo)
        ? await fileDataUrl(repo, node.path)
        : rawUrl(repo, node.path),
      size: node.size,
      path: node.path,
    };
  if (BIN_EXT.has(ext))
    return { kind: "binary", size: node.size, path: node.path };
  if (node.size != null && node.size > 400000)
    return {
      kind: "large",
      size: node.size,
      url: useAuthFiles(repo) ? null : rawUrl(repo, node.path),
      path: node.path,
    };
  let text;
  if (repo.pl === "demo") {
    const ck = "demo:" + repo.full + ":" + node.path;
    if (S.fileCache.has(ck)) text = S.fileCache.get(ck);
    else {
      await delay(120);
      const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
      text = r ? r.files[node.path] : undefined;
      if (text == null) throw err("notfound");
      S.fileCache.set(ck, text);
    }
  } else {
    const ck = repo.pl + ":" + repo.full + ":" + repo.branch + ":" + node.path;
    if (S.fileCache.has(ck)) text = S.fileCache.get(ck);
    else {
      text = useAuthFiles(repo)
        ? await fileText(repo, node.path)
        : repo.pl === "github"
          ? await rawText(rawUrl(repo, node.path))
          : await rawText(
              "https://gitlab.com/api/v4/projects/" +
                repo.id +
                "/repository/files/" +
                encodeURIComponent(node.path) +
                "/raw?ref=" +
                encodeURIComponent(repo.branch),
            );
      if (S.fileCache.size > 60)
        S.fileCache.delete(S.fileCache.keys().next().value);
      S.fileCache.set(ck, text);
    }
  }
  if (text.slice(0, 8000).includes("\u0000"))
    return { kind: "binary", size: node.size, path: node.path };
  const [langKey, langLabel] = langOf(node.path);
  return {
    kind: "text",
    text,
    size: node.size != null ? node.size : new Blob([text]).size,
    path: node.path,
    langKey,
    langLabel,
  };
}
