// ÉTAT & CACHES
import { lsGet } from "./utils.js";
import { lsDel } from "./utils.js";
import { lsSet } from "./utils.js";
import { ssGet } from "./utils.js";
import { ssSet } from "./utils.js";
import { ssDel } from "./utils.js";

function initialToken(key) {
  const session = ssGet(key, null);
  const legacy = lsGet(key, "");
  if (legacy) lsDel(key);
  return session != null ? session : legacy || "";
}

/* ============================== ÉTAT & CACHES ============================== */
export const S = {
  platform: "github",
  gen: 0,
  view: null,
  userNav: false,
  prof: null,
  filters: null,
  batch: 24,
  repo: null,
  errCtx: null,
  favs: lsGet("favs", []),
  recent: lsGet("recent", []),
  tokens: {
    github: initialToken("token"),
    gitlab: initialToken("token:gitlab"),
  },
  rate: { limit: 60, remaining: null, reset: null },
  key: null,
  profCache: new Map(),
  repoCache: new Map(),
  fileCache: new Map(),
  rateTimer: null,
  layout: lsGet("layout", "grid"),
  lockCount: 0,
  lastFocus: null,
  me: { github: null, gitlab: null },
  lang: ["fr", "en"].includes(lsGet("lang", "fr")) ? lsGet("lang", "fr") : "fr",
};
export function resetAuthCaches() {
  S.me.github = null;
  S.me.gitlab = null;
  S.profCache.clear();
  S.repoCache.clear();
  S.fileCache.clear();
}
export const normPlatform = (pl) => (pl === "gitlab" ? "gitlab" : "github");
export function currentPlatform() {
  if (S.view === "repo" && S.repo) return normPlatform(S.repo.pl);
  if (S.prof) return normPlatform(S.prof.pl);
  return normPlatform(S.platform);
}
export function authToken(pl) {
  return S.tokens[normPlatform(pl)] || "";
}
export function hasToken(pl) {
  return !!authToken(pl);
}
export function setToken(pl, v, persist) {
  const p = normPlatform(pl);
  const key = p === "gitlab" ? "token:gitlab" : "token";
  S.tokens[p] = v || "";
  if (persist && v) ssSet(key, v);
  else ssDel(key);
  lsDel(key);
}
export function tokenPersisted(pl) {
  const p = normPlatform(pl);
  return !!ssGet(p === "gitlab" ? "token:gitlab" : "token", null);
}
export const defaultFilters = () => ({
  q: "",
  lang: "all",
  type: "all",
  sort: "stars",
  layout: S.layout,
});
export const LS_TTL = 10 * 60 * 1000;
export function lsCacheGet(key) {
  const v = lsGet("cache:" + key, null);
  if (v && Date.now() - v.t < LS_TTL) return v;
  return null;
}
export function lsCacheSet(key, data) {
  lsSet("cache:" + key, { t: Date.now(), ...data });
}
