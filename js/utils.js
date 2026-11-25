// UTILITAIRES
/* ============================== UTILITAIRES ============================== */
export const $ = (id) => document.getElementById(id);
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const unesc = (s) =>
  String(s)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
export const NF = new Intl.NumberFormat("fr-FR");
export const fmtNum = (n) => NF.format(n || 0);
export const DF = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
export const MYF = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});
export const dateLong = (iso) => {
  try {
    return DF.format(new Date(iso));
  } catch (e) {
    return "-";
  }
};
export const monthYear = (iso) => {
  try {
    return MYF.format(new Date(iso));
  } catch (e) {
    return "-";
  }
};
export function relTime(iso) {
  if (!iso) return "-";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return "il y a " + m + " min";
  const h = Math.floor(m / 60);
  if (h < 24) return "il y a " + h + " h";
  const d = Math.floor(h / 24);
  if (d === 1) return "hier";
  if (d < 30) return "il y a " + d + " j";
  const mo = Math.floor(d / 30);
  if (mo < 12) return "il y a " + mo + " mois";
  const y = Math.floor(d / 365);
  return "il y a " + y + (y > 1 ? " ans" : " an");
}
export function fmtSize(b) {
  if (b == null) return "-";
  if (b < 1024) return b + " o";
  if (b < 1048576) return (b / 1024).toFixed(1).replace(".", ",") + " Ko";
  if (b < 1073741824) return (b / 1048576).toFixed(1).replace(".", ",") + " Mo";
  return (b / 1073741824).toFixed(2).replace(".", ",") + " Go";
}
export const slug = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
export const REDUCED =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const PREFIX = "gitatlas:";
const OLD_PREFIX = "gitscope:";

// Les données enregistrées sous l'ancien nom sont migrées à la première lecture.
function migrate(store, k) {
  try {
    const oldKey = OLD_PREFIX + k;
    const value = store.getItem(oldKey);
    if (value != null) {
      if (store.getItem(PREFIX + k) == null) store.setItem(PREFIX + k, value);
      store.removeItem(oldKey);
    }
  } catch (e) {}
}

export function lsGet(k, d) {
  try {
    migrate(localStorage, k);
    const v = localStorage.getItem(PREFIX + k);
    return v ? JSON.parse(v) : d;
  } catch (e) {
    return d;
  }
}
export function lsSet(k, v) {
  try {
    localStorage.removeItem(OLD_PREFIX + k);
    localStorage.setItem(PREFIX + k, JSON.stringify(v));
  } catch (e) {}
}
export function lsDel(k) {
  try {
    localStorage.removeItem(OLD_PREFIX + k);
    localStorage.removeItem(PREFIX + k);
  } catch (e) {}
}
function storeGet(store, k, d) {
  try {
    migrate(store, k);
    const v = store.getItem(PREFIX + k);
    return v ? JSON.parse(v) : d;
  } catch (e) {
    return d;
  }
}
function storeSet(store, k, v) {
  try {
    store.removeItem(OLD_PREFIX + k);
    store.setItem(PREFIX + k, JSON.stringify(v));
  } catch (e) {}
}
function storeDel(store, k) {
  try {
    store.removeItem(OLD_PREFIX + k);
    store.removeItem(PREFIX + k);
  } catch (e) {}
}
export const ssGet = (k, d) => storeGet(sessionStorage, k, d);
export const ssSet = (k, v) => storeSet(sessionStorage, k, v);
export const ssDel = (k) => storeDel(sessionStorage, k);
export async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e2) {
      return false;
    }
  }
}
export function downloadBlob(name, blob) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}
// Retourne "saved", "cancelled" ou "fallback" : contrairement au clic sur un
// lien <a download>, le sélecteur de fichier permet de détecter un "Annuler".
export async function saveBlob(name, blob) {
  if (typeof window.showSaveFilePicker === "function") {
    const ext = (name.match(/\.[a-z0-9]{1,10}$/i) || [""])[0];
    const opts = { suggestedName: name };
    if (ext)
      opts.types = [
        {
          description: "Fichier",
          accept: {
            [(blob.type || "application/octet-stream").split(";")[0].trim()]: [
              ext,
            ],
          },
        },
      ];
    let handle;
    try {
      handle = await window.showSaveFilePicker(opts);
    } catch (e) {
      if (e && (e.name === "AbortError" || e.code === 20)) return "cancelled";
      downloadBlob(name, blob);
      return "fallback";
    }
    try {
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return "saved";
    } catch (e) {
      downloadBlob(name, blob);
      return "fallback";
    }
  }
  downloadBlob(name, blob);
  return "fallback";
}
export async function downloadUrl(url, name) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw 0;
    return await saveBlob(name, await r.blob());
  } catch (e) {
    window.open(url, "_blank", "noopener");
    return "fallback";
  }
}
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
export const AV_HUES = [
  ["#7B6CFF", "#FF6B3D"],
  ["#2BD4F0", "#7B6CFF"],
  ["#34E0A2", "#2BD4F0"],
  ["#FF6B3D", "#FFB224"],
  ["#F26BB5", "#7B6CFF"],
  ["#FFB224", "#34E0A2"],
];
export function initialsAvatar(name) {
  const n = String(name || "?");
  const ini =
    n
      .split(/[\s\-_.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?";
  const [c1, c2] = AV_HUES[hashStr(n) % AV_HUES.length];
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' +
    c1 +
    '"/><stop offset="1" stop-color="' +
    c2 +
    '"/></linearGradient></defs><rect width="96" height="96" fill="#0B1122"/><rect width="96" height="96" fill="url(#g)" opacity="0.85"/><circle cx="78" cy="18" r="26" fill="#ffffff" opacity="0.12"/><text x="48" y="60" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">' +
    ini +
    "</text></svg>";
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
