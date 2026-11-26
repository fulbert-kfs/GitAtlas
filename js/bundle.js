(() => {
  // js/utils.js
  var $ = (id) => document.getElementById(id);
  var esc = (s) => String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
  var unesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  var NF = new Intl.NumberFormat("fr-FR");
  var fmtNum = (n) => NF.format(n || 0);
  var DF = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  var MYF = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric"
  });
  var dateLong = (iso) => {
    try {
      return DF.format(new Date(iso));
    } catch (e) {
      return "-";
    }
  };
  var monthYear = (iso) => {
    try {
      return MYF.format(new Date(iso));
    } catch (e) {
      return "-";
    }
  };
  function relTime(iso) {
    if (!iso) return "-";
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1e3);
    if (s < 60) return "\xE0 l'instant";
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
  function fmtSize(b) {
    if (b == null) return "-";
    if (b < 1024) return b + " o";
    if (b < 1048576) return (b / 1024).toFixed(1).replace(".", ",") + " Ko";
    if (b < 1073741824) return (b / 1048576).toFixed(1).replace(".", ",") + " Mo";
    return (b / 1073741824).toFixed(2).replace(".", ",") + " Go";
  }
  var slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var delay = (ms) => new Promise((r) => setTimeout(r, ms));
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PREFIX = "gitatlas:";
  var OLD_PREFIX = "gitscope:";
  function migrate(store, k) {
    try {
      const oldKey = OLD_PREFIX + k;
      const value = store.getItem(oldKey);
      if (value != null) {
        if (store.getItem(PREFIX + k) == null) store.setItem(PREFIX + k, value);
        store.removeItem(oldKey);
      }
    } catch (e) {
    }
  }
  function lsGet(k, d) {
    try {
      migrate(localStorage, k);
      const v = localStorage.getItem(PREFIX + k);
      return v ? JSON.parse(v) : d;
    } catch (e) {
      return d;
    }
  }
  function lsSet(k, v) {
    try {
      localStorage.removeItem(OLD_PREFIX + k);
      localStorage.setItem(PREFIX + k, JSON.stringify(v));
    } catch (e) {
    }
  }
  function lsDel(k) {
    try {
      localStorage.removeItem(OLD_PREFIX + k);
      localStorage.removeItem(PREFIX + k);
    } catch (e) {
    }
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
    } catch (e) {
    }
  }
  function storeDel(store, k) {
    try {
      store.removeItem(OLD_PREFIX + k);
      store.removeItem(PREFIX + k);
    } catch (e) {
    }
  }
  var ssGet = (k, d) => storeGet(sessionStorage, k, d);
  var ssSet = (k, v) => storeSet(sessionStorage, k, v);
  var ssDel = (k) => storeDel(sessionStorage, k);
  async function copyText(t) {
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
  function downloadBlob(name, blob) {
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4e3);
  }
  async function saveBlob(name, blob) {
    if (typeof window.showSaveFilePicker === "function") {
      const ext = (name.match(/\.[a-z0-9]{1,10}$/i) || [""])[0];
      const opts = { suggestedName: name };
      if (ext)
        opts.types = [
          {
            description: "Fichier",
            accept: {
              [(blob.type || "application/octet-stream").split(";")[0].trim()]: [
                ext
              ]
            }
          }
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
  async function downloadUrl(url, name) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw 0;
      return await saveBlob(name, await r.blob());
    } catch (e) {
      window.open(url, "_blank", "noopener");
      return "fallback";
    }
  }
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }
  var AV_HUES = [
    ["#7B6CFF", "#FF6B3D"],
    ["#2BD4F0", "#7B6CFF"],
    ["#34E0A2", "#2BD4F0"],
    ["#FF6B3D", "#FFB224"],
    ["#F26BB5", "#7B6CFF"],
    ["#FFB224", "#34E0A2"]
  ];
  function initialsAvatar(name) {
    const n = String(name || "?");
    const ini = n.split(/[\s\-_.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
    const [c1, c2] = AV_HUES[hashStr(n) % AV_HUES.length];
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><rect width="96" height="96" fill="#0B1122"/><rect width="96" height="96" fill="url(#g)" opacity="0.85"/><circle cx="78" cy="18" r="26" fill="#ffffff" opacity="0.12"/><text x="48" y="60" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">' + ini + "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // js/icons.js
  var IC = {
    branch: '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    fork: '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    key: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chevr: '<polyline points="9 18 15 12 9 6"/>',
    chevd: '<polyline points="6 9 12 15 18 9"/>',
    left: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    ext: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    commit: '<circle cx="12" cy="12" r="4"/><line x1="3" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="21" y2="12"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><line x1="10" y1="12" x2="14" y2="12"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    wrap: '<line x1="3" y1="6" x2="21" y2="6"/><path d="M3 12h15a3 3 0 1 1 0 6h-4"/><polyline points="16 16 14 18 16 20"/><line x1="3" y1="18" x2="7" y2="18"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    cloudoff: '<path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/><line x1="1" y1="1" x2="23" y2="23"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2 6 12 13 22 6"/>',
    fold: '<polyline points="7 20 12 15 17 20"/><polyline points="7 4 12 9 17 4"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
  };
  var BRANDS = {
    github: '<path fill="currentColor" stroke="none" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>',
    gitlab: '<path fill="currentColor" stroke="none" d="M23.6 9.6l-1.2-3.7L20 1.5c-.2-.6-1-.6-1.2 0l-2.4 7.4H7.6L5.2 1.5c-.2-.6-1-.6-1.2 0L1.6 5.9.4 9.6c-.1.3 0 .7.3.9l11.3 8.2 11.3-8.2c.3-.2.4-.6.3-.9z"/>',
    facebook: '<path fill="currentColor" stroke="none" d="M14 8h3V4h-3c-3.3 0-5.5 2.3-5.5 5.5V13H6v4h2.5v7H13v-7h3l1-4h-4V9.5c0-.9.4-1.5 1.5-1.5z"/>',
    x: '<path fill="currentColor" stroke="none" d="M17.5 3H21l-7.6 8.7L22 21h-7l-5.5-7.2L3.3 21H0l8.1-9.3L2 3h7.2l5 6.6L17.5 3zm-1.2 16.2h1.9L7.9 4.7H5.9l10.4 14.5z"/>',
    whatsapp: '<path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.6l.4-.5v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4s-.9.9-.9 2.1.9 2.5 1 2.6c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.2s.2-1.1.2-1.2c-.1-.1-.3-.2-.5-.3z"/>',
    linkedin: '<path fill="currentColor" stroke="none" d="M5.2 3.5a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2zM3 10h4.5v11H3V10zm6.5 0H14v1.5h.1c.7-1.1 2.2-1.8 3.6-1.8 3.1 0 3.9 2 3.9 4.7V21h-4.5v-5.9c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V21H9.5V10z"/>',
    telegram: '<path fill="currentColor" stroke="none" d="M22 2L2.5 9.6c-.9.3-.9 1-.2 1.3l4.8 1.5 1.9 5.8c.2.6.4.9.8.9.3 0 .5-.1 1.1-.7l2.5-2.4 5.1 3.7c.9.5 1.6.2 1.8-.8L23 3.3c.2-.9-.3-1.4-1-1.3zM8.9 13.3l10.4-6.7-8.5 8.6-.3 3.4-1.6-5.3z"/>'
  };
  function icon(n, s = 16, cls = "") {
    const p = IC[n] || BRANDS[n] || IC.file;
    return '<svg class="ic ' + cls + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }
  var logoSeq = 0;
  function brandLogo(s = 32) {
    const gid = "gsLogo" + ++logoSeq;
    return '<svg class="brand-logo" width="' + s + '" height="' + s + '" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8B7CFF"/><stop offset="1" stop-color="#39D0D8"/></linearGradient></defs><circle cx="16" cy="16" r="13" fill="none" stroke="url(#' + gid + ')" stroke-width="2.5"/><path d="M10 13.6v3.8" stroke="#8B7CFF" stroke-width="2.2" stroke-linecap="round"/><path d="M10 11c6 0 6 2 9.4 2" stroke="#39D0D8" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="10" cy="20" r="2.6" fill="#8B7CFF"/><circle cx="10" cy="11" r="2.6" fill="#39D0D8"/><circle cx="22" cy="13" r="2.6" fill="#4ADE80"/></svg>';
  }

  // js/state.js
  function initialToken(key) {
    const session = ssGet(key, null);
    const legacy = lsGet(key, "");
    if (legacy) lsDel(key);
    return session != null ? session : legacy || "";
  }
  var S = {
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
      gitlab: initialToken("token:gitlab")
    },
    rate: { limit: 60, remaining: null, reset: null },
    key: null,
    profCache: /* @__PURE__ */ new Map(),
    repoCache: /* @__PURE__ */ new Map(),
    fileCache: /* @__PURE__ */ new Map(),
    rateTimer: null,
    layout: lsGet("layout", "grid"),
    lockCount: 0,
    lastFocus: null,
    me: { github: null, gitlab: null },
    lang: ["fr", "en"].includes(lsGet("lang", "fr")) ? lsGet("lang", "fr") : "fr"
  };
  function resetAuthCaches() {
    S.me.github = null;
    S.me.gitlab = null;
    S.profCache.clear();
    S.repoCache.clear();
    S.fileCache.clear();
  }
  var normPlatform = (pl) => pl === "gitlab" ? "gitlab" : "github";
  function currentPlatform() {
    if (S.view === "repo" && S.repo) return normPlatform(S.repo.pl);
    if (S.prof) return normPlatform(S.prof.pl);
    return normPlatform(S.platform);
  }
  function authToken(pl) {
    return S.tokens[normPlatform(pl)] || "";
  }
  function hasToken(pl) {
    return !!authToken(pl);
  }
  function setToken(pl, v, persist) {
    const p = normPlatform(pl);
    const key = p === "gitlab" ? "token:gitlab" : "token";
    S.tokens[p] = v || "";
    if (persist && v) ssSet(key, v);
    else ssDel(key);
    lsDel(key);
  }
  function tokenPersisted(pl) {
    const p = normPlatform(pl);
    return !!ssGet(p === "gitlab" ? "token:gitlab" : "token", null);
  }
  var defaultFilters = () => ({
    q: "",
    lang: "all",
    type: "all",
    sort: "stars",
    layout: S.layout
  });
  var LS_TTL = 10 * 60 * 1e3;
  function lsCacheGet(key) {
    const v = lsGet("cache:" + key, null);
    if (v && Date.now() - v.t < LS_TTL) return v;
    return null;
  }
  function lsCacheSet(key, data) {
    lsSet("cache:" + key, { t: Date.now(), ...data });
  }

  // js/seo.js
  var SITE_URL = "https://example.com";
  var BASE = SITE_URL.replace(/\/+$/, "");
  var ROOT = BASE + "/";
  var IMAGE = BASE + "/assets/og-cover.png";
  var DESC_FR = "Entrez un pseudo GitHub ou GitLab : explorez tous ses d\xE9p\xF4ts publics, leur structure, leur code, leurs README, langages et activit\xE9.";
  var DESC_EN = "Enter a GitHub or GitLab username: explore all their public repositories, their structure, their code, their READMEs, languages and activity.";
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
  function pageInfo() {
    const en = S.lang === "en";
    let title = en ? "GitAtlas - GitHub & GitLab profile explorer" : "GitAtlas - Explorateur de profils GitHub & GitLab";
    let desc = en ? DESC_EN : DESC_FR;
    if (S.view === "profile" && S.prof) {
      const p = S.prof.profile;
      const login = p.login || S.prof.login;
      const count = S.prof.repos ? S.prof.repos.length : 0;
      const plat = S.prof.pl === "gitlab" ? "GitLab" : "GitHub";
      title = (p.name || login) + " (@" + login + ") \xB7 " + plat + (en ? " profile - GitAtlas" : " - profil GitAtlas");
      const bio = p.bio ? " " + p.bio : "";
      desc = en ? (p.name || login) + " - " + count + " public repositories on " + plat + "." + bio + " Explore projects, files and commits with GitAtlas." : (p.name || login) + " - " + count + " d\xE9p\xF4ts publics sur " + plat + "." + bio + " Explorez ses projets, fichiers et commits avec GitAtlas.";
    } else if (S.view === "repo" && S.repo && S.repo.meta) {
      const m = S.repo.meta;
      const plat = S.repo.pl === "gitlab" ? "GitLab" : "GitHub";
      title = m.full + " \xB7 " + plat + (en ? " repository - GitAtlas" : " - d\xE9p\xF4t GitAtlas");
      const d = m.desc ? " " + m.desc : "";
      desc = en ? m.full + " on " + plat + "." + d + " Browse the tree, source code and commits with GitAtlas." : m.full + " sur " + plat + "." + d + " Explorez l'arborescence, le code et les commits avec GitAtlas.";
    }
    return { title: title.slice(0, 120), desc: desc.slice(0, 300) };
  }
  function setSeo() {
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
  function shareUrl() {
    const hash = location.hash && location.hash !== "#/" ? location.hash : "";
    return ROOT + hash;
  }
  function shareTargets() {
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
        href: "https://www.facebook.com/sharer/sharer.php?u=" + u
      },
      {
        key: "x",
        label: "X (Twitter)",
        href: "https://twitter.com/intent/tweet?url=" + u + "&text=" + t
      },
      {
        key: "whatsapp",
        label: "WhatsApp",
        href: "https://wa.me/?text=" + encodeURIComponent(text + " " + url)
      },
      {
        key: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/sharing/share-offsite/?url=" + u
      },
      {
        key: "telegram",
        label: "Telegram",
        href: "https://t.me/share/url?url=" + u + "&text=" + t
      },
      {
        key: "mail",
        label: "E-mail",
        href: "mailto:?subject=" + t + "&body=" + encodeURIComponent(text + "\n" + url)
      },
      {
        key: "link",
        label: "Copier le lien",
        action: "share-copy"
      }
    );
    return targets;
  }
  function shareMenuHTML() {
    return shareTargets().map((t) => {
      const tag = t.action ? "button" : "a";
      const attrs = t.action ? 'type="button" data-action="' + t.action + '"' : 'href="' + esc(t.href) + '" target="_blank" rel="noopener noreferrer" data-action="share-close"';
      return "<" + tag + ' class="share-item" ' + attrs + ' aria-label="' + esc(t.label) + '"><span class="share-ico" aria-hidden="true" data-share-icon="' + t.key + '"></span><span>' + esc(t.label) + "</span></" + tag + ">";
    }).join("");
  }

  // js/components.js
  var platIcon = (pl, s = 13) => pl === "gitlab" ? icon("gitlab", s) : pl === "demo" ? icon("sparkle", s) : icon("github", s);
  var platName = (pl) => pl === "gitlab" ? "GitLab" : pl === "demo" ? "D\xE9mo" : "GitHub";
  function favKey(kind, pl, id) {
    return kind + ":" + pl + ":" + id;
  }
  function isFav(key) {
    return S.favs.some((f) => f.key === key);
  }
  function favBtn(kind, pl, id, extra) {
    const key = favKey(kind, pl, id);
    return '<button class="fav-btn' + (isFav(key) ? " on" : "") + '" data-action="fav-' + kind + '" data-pl="' + esc(pl) + '" data-id="' + esc(id) + '" data-favkey="' + esc(key) + '" aria-label="Ajouter aux favoris" title="Favori" ' + (extra || "") + ">" + icon("star", 15) + "</button>";
  }
  function gitLoader() {
    return '<svg class="gitloader" width="52" height="16" viewBox="0 0 52 16"><line x1="4" y1="8" x2="48" y2="8" stroke="#31427A" stroke-width="2"/><circle class="gl-dot" cx="10" cy="8" r="4" fill="#7B6CFF"/><circle class="gl-dot" cx="26" cy="8" r="4" fill="#FF6B3D"/><circle class="gl-dot" cx="42" cy="8" r="4" fill="#2BD4F0"/></svg>';
  }
  function skelProfile(pl) {
    const cards = Array.from(
      { length: 6 },
      (_, i) => '<div class="sk" style="height:150px;--d:' + i + '"></div>'
    ).join("");
    return '<div class="wrap"><div class="skel-status">' + gitLoader() + "<span>Interrogation de " + (pl === "gitlab" ? "gitlab.com" : "api.github.com") + '\u2026</span></div><div class="sk" style="height:170px;border-radius:20px"></div><div class="stats-row"><div class="sk" style="height:76px"></div><div class="sk" style="height:76px"></div><div class="sk" style="height:76px"></div><div class="sk" style="height:76px"></div></div><div class="rgrid">' + cards + "</div></div>";
  }
  function skelRepo() {
    return '<div class="wrap"><div class="skel-status">' + gitLoader() + '<span>Chargement du d\xE9p\xF4t\u2026</span></div><div class="sk" style="height:52px;border-radius:12px"></div><div class="sk" style="height:190px;border-radius:20px"></div><div class="sk" style="height:46px"></div><div class="files-split"><div class="sk" style="height:440px"></div><div class="sk" style="height:440px"></div></div></div>';
  }
  function noticeHTML(ic, cls, title, msg, actions, extra) {
    return '<div class="notice-card reveal in"><div class="n-ic ' + cls + '">' + icon(ic, 30) + "</div><h3>" + title + "</h3><p>" + msg + "</p>" + (extra || "") + '<div class="n-actions">' + (actions || "") + "</div></div>";
  }
  function errorHTML(ctx, e) {
    const demoBtn = '<button class="btn btn-warm btn-sm" data-action="chip" data-p="demo" data-login="lina-forge">' + icon("sparkle", 14) + "Explorer la d\xE9mo</button>";
    if (e.type === "rate") {
      const reset = e.reset ? e.reset * 1e3 : Date.now() + 15 * 60 * 1e3;
      S.errCtx = { ...ctx, kind: ctx.kind, reset };
      return noticeHTML(
        "clock",
        "warn",
        "Limite de requ\xEAtes atteinte",
        "L'API publique GitHub autorise 60 requ\xEAtes/heure par IP. R\xE9essayez apr\xE8s le r\xE9initialisation du compteur, ou ajoutez un jeton gratuit pour monter \xE0 5 000/h.",
        '<button class="btn btn-pri btn-sm" data-action="open-token">' + icon("key", 14) + "Ajouter un jeton</button>" + demoBtn,
        '<div class="rate-count" id="rateCount">--:--</div><div class="rate-bar"><i id="rateBar" style="width:100%"></i></div>'
      );
    }
    if (e.type === "notfound") {
      const other = S.platform === "github" ? "gitlab" : "github";
      const sw = ctx.login ? '<button class="btn btn-ghost btn-sm" data-action="switch-platform" data-login="' + esc(ctx.login) + '">' + platIcon(other, 14) + "Chercher \xAB " + esc(ctx.login) + " \xBB sur " + platName(other) + "</button>" : "";
      return noticeHTML(
        "search",
        "",
        "Profil introuvable",
        ctx.kind === "repo" ? "Ce d\xE9p\xF4t n\u2019existe pas, est priv\xE9, ou a \xE9t\xE9 renomm\xE9. V\xE9rifiez le nom complet \xAB owner/d\xE9p\xF4t \xBB." : "Ce pseudo n\u2019existe pas sur " + platName(ctx.pl) + ". V\xE9rifiez l\u2019orthographe, ou essayez l\u2019autre plateforme.",
        sw + '<button class="btn btn-ghost btn-sm" data-action="focus-search">' + icon("left", 14) + "Modifier la recherche</button>" + demoBtn
      );
    }
    if (e.type === "network") {
      return noticeHTML(
        "cloudoff",
        "",
        "Connexion impossible",
        "Impossible de joindre l'API (" + (ctx.pl === "gitlab" ? "gitlab.com" : "api.github.com") + "). V\xE9rifiez votre connexion - ou explorez le profil de d\xE9monstration, enti\xE8rement hors-ligne.",
        '<button class="btn btn-pri btn-sm" data-action="retry-' + (ctx.kind === "repo" ? "repo" : "profile") + '">' + icon("refresh", 14) + "R\xE9essayer</button>" + demoBtn
      );
    }
    return noticeHTML(
      "alert",
      "",
      "Erreur API " + (e.status || ""),
      "L'API a r\xE9pondu par une erreur inattendue. Vous pouvez r\xE9essayer.",
      '<button class="btn btn-pri btn-sm" data-action="retry-' + (ctx.kind === "repo" ? "repo" : "profile") + '">' + icon("refresh", 14) + "R\xE9essayer</button>" + demoBtn
    );
  }

  // js/languages.js
  var LANG_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Rust: "#dea584",
    Go: "#00ADD8",
    C: "#9b9b9b",
    "C++": "#f34b7d",
    "C#": "#2ea043",
    Java: "#b07219",
    Ruby: "#cc342d",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    Scala: "#c22d40",
    Elixir: "#a074c4",
    Haskell: "#8f7fb8",
    Lua: "#4f6bd8",
    Shell: "#89e051",
    PowerShell: "#3a6ea5",
    HTML: "#e34c26",
    CSS: "#9b6dd6",
    SCSS: "#c6538c",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Markdown: "#4a7fd4",
    Dockerfile: "#6aa5b0",
    Makefile: "#7bb356",
    YAML: "#cb171e",
    TOML: "#c96a3d",
    SQL: "#e38c00",
    R: "#198CE7",
    Perl: "#0298c3",
    "Objective-C": "#438eff",
    Zig: "#ec915c",
    Nim: "#ffc200",
    OCaml: "#ef7a08",
    Clojure: "#db5855",
    Julia: "#a270ba",
    Solidity: "#AA6746",
    Groovy: "#4298b8",
    Astro: "#ff5a03",
    Nix: "#7e7eff",
    HCL: "#844FBA",
    JSON: "#8b93b8",
    TeX: "#3D6117"
  };
  var langColor = (l) => LANG_COLORS[l] || "#8b93b8";
  var IMG_EXT = /* @__PURE__ */ new Set([
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "ico",
    "bmp",
    "avif"
  ]);
  var BIN_EXT = /* @__PURE__ */ new Set([
    "woff",
    "woff2",
    "ttf",
    "otf",
    "eot",
    "pdf",
    "zip",
    "gz",
    "tar",
    "rar",
    "7z",
    "exe",
    "dll",
    "so",
    "dylib",
    "bin",
    "dat",
    "mp3",
    "mp4",
    "webm",
    "mov",
    "wasm",
    "class",
    "jar",
    "pyc",
    "lockb",
    "db",
    "sqlite",
    "o",
    "a",
    "lib"
  ]);
  var EXT_LANG = {
    js: ["clike", "JavaScript"],
    mjs: ["clike", "JavaScript"],
    cjs: ["clike", "JavaScript"],
    jsx: ["clike", "JSX"],
    ts: ["clike", "TypeScript"],
    tsx: ["clike", "TSX"],
    rs: ["clike", "Rust"],
    go: ["clike", "Go"],
    java: ["clike", "Java"],
    c: ["clike", "C"],
    h: ["clike", "C"],
    cpp: ["clike", "C++"],
    cc: ["clike", "C++"],
    hpp: ["clike", "C++"],
    cs: ["clike", "C#"],
    kt: ["clike", "Kotlin"],
    swift: ["clike", "Swift"],
    php: ["clike", "PHP"],
    scala: ["clike", "Scala"],
    py: ["py", "Python"],
    rb: ["py", "Ruby"],
    sh: ["shell", "Shell"],
    bash: ["shell", "Shell"],
    zsh: ["shell", "Shell"],
    yml: ["shell", "YAML"],
    yaml: ["shell", "YAML"],
    toml: ["shell", "TOML"],
    dockerfile: ["shell", "Dockerfile"],
    makefile: ["shell", "Makefile"],
    gitignore: ["shell", "Gitignore"],
    json: ["json", "JSON"],
    css: ["css", "CSS"],
    scss: ["css", "SCSS"],
    less: ["css", "Less"],
    html: ["markup", "HTML"],
    htm: ["markup", "HTML"],
    xml: ["markup", "XML"],
    svg: ["markup", "SVG"],
    vue: ["markup", "Vue"],
    svelte: ["markup", "Svelte"],
    md: ["md", "Markdown"],
    markdown: ["md", "Markdown"],
    sql: ["sql", "SQL"],
    txt: ["plain", "Texte"],
    lock: ["plain", "Lock"]
  };
  function extOf(path) {
    const n = path.split("/").pop().toLowerCase();
    if (n === "dockerfile" || n === "makefile" || n === ".gitignore" || n === ".clang-format")
      return n.replace(".", "");
    const i = n.lastIndexOf(".");
    return i < 0 ? "" : n.slice(i + 1);
  }
  function langOf(path) {
    const e = extOf(path);
    return EXT_LANG[e] || ["plain", e ? e.toUpperCase() : "Texte"];
  }

  // js/ui.js
  var toastSeq = 0;
  var TOAST_ACT = {};
  function toast(type, msg, action) {
    const id = ++toastSeq;
    const icons = { success: "check", info: "info", warn: "warn", error: "x" };
    const el = document.createElement("div");
    el.className = "toast t-" + type;
    el.dataset.id = id;
    el.innerHTML = '<span class="toast-ic">' + icon(icons[type] || "info", 16) + '</span><span class="toast-msg">' + msg + "</span>" + (action ? '<button class="toast-act" data-action="toast-action" data-id="' + id + '">' + esc(action.label) + "</button>" : "") + '<button class="toast-x" data-action="toast-close" data-id="' + id + '" aria-label="Fermer">' + icon("x", 12) + "</button>";
    if (action) TOAST_ACT[id] = action.fn;
    const box = $("toasts");
    box.appendChild(el);
    while (box.children.length > 4) box.firstChild.remove();
    let timer = setTimeout(() => dismissToast(id), 4200);
    el.addEventListener("mouseenter", () => clearTimeout(timer));
    el.addEventListener("mouseleave", () => {
      timer = setTimeout(() => dismissToast(id), 1800);
    });
  }
  function dismissToast(id) {
    const el = $("toasts").querySelector('[data-id="' + id + '"]');
    if (el) {
      el.classList.add("out");
      setTimeout(() => el.remove(), 260);
    }
    delete TOAST_ACT[id];
  }
  function refreshFavUI() {
    const cnt = $("favCount");
    cnt.textContent = S.favs.length;
    cnt.classList.toggle("hidden", !S.favs.length);
    cnt.classList.remove("pop");
    void cnt.offsetWidth;
    cnt.classList.add("pop");
    document.querySelectorAll("[data-favkey]").forEach((b) => {
      const on = isFav(b.dataset.favkey);
      b.classList.toggle("on", on);
    });
    if ($("drawer").classList.contains("open")) renderFavDrawer();
  }
  function toggleFav(kind, pl, id) {
    const key = favKey(kind, pl, id);
    const idx = S.favs.findIndex((f) => f.key === key);
    if (idx >= 0) {
      S.favs.splice(idx, 1);
      toast("info", "Retir\xE9 des favoris.");
    } else {
      let item;
      if (kind === "profile") {
        const p = S.prof && S.prof.pl === pl && S.prof.login === id ? S.prof.profile : null;
        item = {
          key,
          kind,
          pl,
          id,
          name: p ? p.name : id,
          avatar: p ? p.avatar : initialsAvatar(id),
          sub: "@" + id + " \xB7 " + platName(pl)
        };
      } else {
        let m = S.repo && S.repo.meta.full === id ? S.repo.meta : null;
        if (!m && S.prof)
          m = S.prof.repos.find((x) => x.full === id && x.pl === pl);
        item = {
          key,
          kind,
          pl,
          id,
          name: m ? m.name : id.split("/").pop(),
          lang: m ? m.lang : null,
          stars: m ? m.stars : 0,
          sub: id + " \xB7 " + platName(pl)
        };
      }
      S.favs.unshift(item);
      toast("success", "Ajout\xE9 aux favoris \u2B50");
      const b = document.querySelector('[data-favkey="' + CSS.escape(key) + '"]');
      if (b) {
        b.classList.add("burst");
        setTimeout(() => b.classList.remove("burst"), 400);
      }
    }
    lsSet("favs", S.favs);
    refreshFavUI();
  }
  function removeFav(key) {
    const idx = S.favs.findIndex((f) => f.key === key);
    if (idx < 0) return;
    const [item] = S.favs.splice(idx, 1);
    lsSet("favs", S.favs);
    refreshFavUI();
    toast("warn", "Favori retir\xE9.", {
      label: "Annuler",
      fn: () => {
        S.favs.splice(Math.min(idx, S.favs.length), 0, item);
        lsSet("favs", S.favs);
        refreshFavUI();
        toast("success", "Favori restaur\xE9.");
      }
    });
  }
  function renderFavDrawer() {
    const body = $("dwBody");
    if (!S.favs.length) {
      body.innerHTML = '<div class="empty-mini">' + icon("star", 36) + "<span>Aucun favori pour l\u2019instant.<br>Cliquez sur l\u2019\xE9toile d\u2019un profil ou d\u2019un d\xE9p\xF4t pour le retrouver ici.</span></div>";
      return;
    }
    const profs = S.favs.filter((f) => f.kind === "profile"), repos = S.favs.filter((f) => f.kind === "repo");
    const row = (f) => '<div class="fav-row" data-action="fav-go" data-kind="' + f.kind + '" data-pl="' + esc(f.pl) + '" data-id="' + esc(f.id) + '">' + (f.kind === "profile" ? '<img class="fr-ic" src="' + esc(f.avatar || initialsAvatar(f.name)) + '" alt="">' : '<span class="fr-dot"><i class="dot" style="--lc:' + langColor(f.lang) + '"></i></span>') + '<div class="fr-main"><div class="fr-name" role="button" tabindex="0" data-action="fav-go" data-kind="' + f.kind + '" data-pl="' + esc(f.pl) + '" data-id="' + esc(f.id) + '">' + esc(f.name) + '</div><div class="fr-sub">' + esc(f.sub || f.id) + '</div></div><button class="fav-btn on" data-action="fav-remove" data-key="' + esc(f.key) + '" aria-label="Retirer">' + icon("star", 13) + "</button></div>";
    body.innerHTML = (profs.length ? '<div class="dw-sect">Profils \xB7 ' + profs.length + "</div>" + profs.map(row).join("") : "") + (repos.length ? '<div class="dw-sect">D\xE9p\xF4ts \xB7 ' + repos.length + "</div>" + repos.map(row).join("") : "");
  }
  function addRecent(pl, login) {
    if (pl === "demo") return;
    S.recent = S.recent.filter((r) => !(r.pl === pl && r.login === login));
    S.recent.unshift({ pl, login });
    S.recent = S.recent.slice(0, 6);
    lsSet("recent", S.recent);
    renderRecent();
  }
  function renderRecent() {
    const row = $("recentRow");
    if (!S.recent.length) {
      row.innerHTML = "";
      return;
    }
    row.innerHTML = '<span class="chips-lbl">R\xE9cents :</span>' + S.recent.map(
      (r) => '<button class="chip' + (r.pl === "gitlab" ? " gl" : "") + '" data-action="chip" data-p="' + esc(r.pl) + '" data-login="' + esc(r.login) + '">' + platIcon(r.pl, 11) + esc(r.login) + "</button>"
    ).join("") + '<button class="clr" data-action="clear-recent">vider</button>';
  }

  // js/i18n.js
  var LANGS = ["fr", "en"];
  var DICT = {
    "GitAtlas - Explorateur de profils GitHub & GitLab": "GitAtlas - GitHub & GitLab profile explorer",
    "Entrez un pseudo GitHub ou GitLab : explorez tous ses d\xE9p\xF4ts publics, leur structure, leur code, leurs README, langages et activit\xE9.": "Enter a GitHub or GitLab username: explore all their public repositories, their structure, their code, their READMEs, languages and activity.",
    "GitAtlas n\xE9cessite JavaScript pour interroger les API GitHub et GitLab.": "GitAtlas requires JavaScript to query the GitHub and GitLab APIs.",
    "Mode d\xE9monstration": "Demo mode",
    "profil fictif, donn\xE9es locales hors-ligne. Entrez un pseudo r\xE9el ci-dessus pour interroger l\u2019API en direct.": "fictional profile, offline local data. Enter a real username above to query the live API.",
    "Chercher un vrai profil": "Find a real profile",
    "Explorateur de profils Git": "Git profile explorer",
    "Un pseudo.": "One username.",
    "Tous ses projets.": "All their projects.",
    "Chaque fichier.": "Every file.",
    "GitHub ou GitLab : explorez les d\xE9p\xF4ts publics de n'importe quel d\xE9veloppeur - arborescence, code source, README, langages et activit\xE9. Sans compte, sans installation.": "GitHub or GitLab: explore any developer's public repositories - file tree, source code, README, languages and activity. No account, no install.",
    "GitHub ou GitLab : explorez les ": "GitHub or GitLab: explore ",
    "d\xE9p\xF4ts publics de n'importe quel d\xE9veloppeur": "public repositories from any developer",
    " - arborescence, code source, README, langages et activit\xE9.": " - file tree, source code, README, languages and activity.",
    "Sans compte, sans installation.": "No account, no install.",
    "ex. ": "e.g. ",
    "Astuce : collez aussi une URL de profil, ou tapez \xAB owner/d\xE9p\xF4t \xBB pour ouvrir un projet directement.": "Tip: you can also paste a profile URL, or type \xAB owner/repo \xBB to open a project directly.",
    "Astuce : collez aussi une URL de profil, ou tapez \xAB owner/d\xE9p\xF4t \xBB": "Tip: you can also paste a profile URL, or type \xAB owner/repo \xBB",
    " pour ouvrir un projet directement.": " to open a project directly.",
    "pour rechercher": "to search",
    Explorer: "Explore",
    "Accueil GitAtlas": "GitAtlas home",
    "\xC9tat de l'API - cliquez pour configurer un jeton": "API status - click to configure a token",
    "GitHub \xB7 GitLab Explorer": "GitHub \xB7 GitLab explorer",
    Favoris: "Favourites",
    "Jeton API": "API token",
    "Jeton d'acc\xE8s GitHub": "GitHub access token",
    "Jeton d'acc\xE8s \xE0 l'API": "API access token",
    "Jeton d'acc\xE8s": "Access token",
    "Donn\xE9es : API publiques": "Data: public APIs",
    "Aucune donn\xE9e n'est envoy\xE9e ailleurs que sur ces API.": "No data is sent anywhere else than to these APIs.",
    "z\xE9ro d\xE9pendance": "zero dependency",
    Fermer: "Close",
    "Essayez :": "Try:",
    "Profil d\xE9mo": "Demo profile",
    "R\xE9cents :": "Recent:",
    vider: "clear",
    abonnements: "following",
    abonn\u00E9s: "followers",
    "derni\xE8re activit\xE9": "last activity",
    Organisation: "Organisation",
    Fictif: "Fictional",
    "Voir sur ": "View on ",
    "Exporter JSON": "Export JSON",
    "\xE9toiles cumul\xE9es": "total stars",
    "forks cumul\xE9s": "total forks",
    "d\xE9p\xF4ts (dont priv\xE9s)": "repositories (incl. private)",
    "d\xE9p\xF4ts publics": "public repositories",
    "Langages (par d\xE9p\xF4t)": "Languages (per repository)",
    "D\xE9p\xF4ts les plus \xE9toil\xE9s": "Most starred repositories",
    "Activit\xE9 \xB7 pushs par an": "Activity \xB7 pushes per year",
    " d\xE9p\xF4ts": " repositories",
    "Filtrer les d\xE9p\xF4ts\u2026": "Filter repositories\u2026",
    "Filtrer les d\xE9p\xF4ts": "Filter repositories",
    "Filtrer par langage": "Filter by language",
    "Tous les langages": "All languages",
    Trier: "Sort",
    "\xC9toiles \u2193": "Stars \u2193",
    "Activit\xE9 r\xE9cente": "Recent activity",
    "Nom A\u2192Z": "Name A\u2192Z",
    "Cr\xE9\xE9s r\xE9cemment": "Recently created",
    "Vue grille": "Grid view",
    "Vue liste": "List view",
    Tous: "All",
    Sources: "Sources",
    Forks: "Forks",
    Archiv\u00E9s: "Archived",
    "Aucun d\xE9p\xF4t ne correspond \xE0 ces filtres.": "No repositories match these filters.",
    "R\xE9initialiser les filtres": "Reset filters",
    "Ce profil ne poss\xE8de aucun d\xE9p\xF4t public pour le moment.": "This profile has no public repositories yet.",
    "Afficher 24 de plus (": "Show 24 more (",
    " restants)": " remaining)",
    "Tous les d\xE9p\xF4ts sont affich\xE9s": "All repositories are shown",
    "Pas de description.": "No description.",
    "maj ": "updated ",
    "inscrit\xB7e en ": "joined in ",
    Priv\u00E9: "Private",
    Public: "Public",
    Archiv\u00E9: "Archived",
    Fork: "Fork",
    " \xE9toiles": " stars",
    " forks": " forks",
    " issues": " issues",
    "Site / d\xE9mo live": "Website / live demo",
    "Copier le lien GitAtlas": "Copy GitAtlas link",
    "Copier la commande": "Copy command",
    Partager: "Share",
    "Partager GitAtlas": "Share GitAtlas",
    "Partager sur les r\xE9seaux": "Share on social networks",
    "Partage natif": "Native share",
    "Copier le lien": "Copy link",
    Fichiers: "Files",
    Langages: "Languages",
    Commits: "Commits",
    "Arborescence \xB7 ": "Tree \xB7 ",
    " fichiers": " files",
    EXPLORATEUR: "EXPLORER",
    "Tout replier": "Collapse all",
    "Rechercher un fichier\u2026": "Search files\u2026",
    "Rechercher un fichier": "Search files",
    "Arborescence volumineuse : liste partielle.": "Large tree: partial list.",
    "Tout voir sur la plateforme": "View all on the platform",
    "Arborescence indisponible": "Tree unavailable",
    "Impossible de charger la structure de ce d\xE9p\xF4t (": "Could not load this repository's tree (",
    "d\xE9p\xF4t vide ou branche introuvable": "empty repository or branch not found",
    "erreur r\xE9seau": "network error",
    "Limite API atteinte - ajoutez un jeton ou patientez.": "API limit reached - add a token or wait.",
    "Aucun fichier ne correspond.": "No matching files.",
    r\u00E9sultats: "results",
    r\u00E9sultat: "result",
    " (200 affich\xE9s)": " (200 shown)",
    "Explorez le code source": "Explore the source code",
    "S\xE9lectionnez un fichier dans l\u2019arborescence pour visualiser son contenu color\xE9, ou ouvrez l\u2019onglet README.": "Select a file in the tree to view highlighted content, or open the README tab.",
    "Fichier illisible": "Unreadable file",
    "Impossible de r\xE9cup\xE9rer ce fichier (": "Could not fetch this file (",
    r\u00E9seau: "network",
    T\u00E9l\u00E9charger: "Download",
    "Voir le fichier brut": "View raw file",
    Brut: "Raw",
    "Sous-module Git": "Git submodule",
    "Ce chemin pointe vers un autre d\xE9p\xF4t. Ouvrez-le depuis la page ": "This path points to another repository. Open it from the ",
    " du projet.": " project page.",
    "sous-module": "submodule",
    "Aper\xE7u indisponible en d\xE9mo": "Preview unavailable in demo",
    "Fichier volumineux (": "Large file (",
    ") - affichage d\xE9sactiv\xE9 pour garder l\u2019explorateur fluide.": ") - preview disabled to keep the explorer fast.",
    "Fichier binaire - non affichable sous forme de texte.": "Binary file - cannot be displayed as text.",
    "Trop grand pour l\u2019aper\xE7u": "Too large to preview",
    "Contenu binaire": "Binary content",
    "Ouvrir le brut": "Open raw",
    "Voir le code source": "View source code",
    "Code source": "Source code",
    "Aper\xE7u rendu": "Rendered preview",
    Aper\u00E7u: "Preview",
    "Retour \xE0 la ligne": "Word wrap",
    "Copier le fichier": "Copy file",
    Copier: "Copy",
    " lignes \xB7 ": " lines \xB7 ",
    " lignes affich\xE9es": " lines shown",
    "Afficher la suite": "Show more",
    "README du d\xE9p\xF4t": "Repository README",
    "Fiche technique": "Technical details",
    "Cr\xE9\xE9 le": "Created on",
    "Dernier push": "Last push",
    "Branche par d\xE9faut": "Default branch",
    Taille: "Size",
    Licence: "License",
    "Non renseign\xE9e": "Not specified",
    "Clone HTTPS": "HTTPS clone",
    "Site du projet": "Project website",
    "R\xE9partition des langages indisponible pour ce d\xE9p\xF4t.": "Language breakdown unavailable for this repository.",
    "R\xE9cup\xE9ration des derniers commits\u2026": "Fetching latest commits\u2026",
    "Commits indisponibles.": "Commits unavailable.",
    "Activit\xE9 - 12 derni\xE8res semaines": "Activity - last 12 weeks",
    "Commits par semaine": "Commits per week",
    "Contributeurs r\xE9cents": "Recent contributors",
    "Aucun commit public sur cette branche.": "No public commits on this branch.",
    "Copier le SHA": "Copy SHA",
    "Voir le commit": "View commit",
    "Chargement du d\xE9p\xF4t\u2026": "Loading repository\u2026",
    "Interrogation de ": "Querying ",
    R\u00E9essayer: "Retry",
    "Ajouter un jeton": "Add a token",
    "Modifier la recherche": "Edit search",
    "Explorer la d\xE9mo": "Explore the demo",
    "Profil introuvable": "Profile not found",
    "Connexion impossible": "Connection failed",
    "Limite de requ\xEAtes atteinte": "Rate limit reached",
    "L'API publique GitHub autorise 60 requ\xEAtes/heure par IP. R\xE9essayez apr\xE8s le r\xE9initialisation du compteur, ou ajoutez un jeton gratuit pour monter \xE0 5 000/h.": "GitHub's public API allows 60 requests/hour per IP. Retry after the counter resets, or add a free token to raise it to 5,000/h.",
    "L'API a r\xE9pondu par une erreur inattendue. Vous pouvez r\xE9essayer.": "The API returned an unexpected error. You can retry.",
    "Ce d\xE9p\xF4t n\u2019existe pas, est priv\xE9, ou a \xE9t\xE9 renomm\xE9. V\xE9rifiez le nom complet \xAB owner/d\xE9p\xF4t \xBB.": "This repository doesn't exist, is private, or was renamed. Check the full name \xAB owner/repo \xBB.",
    "Ce pseudo n\u2019existe pas sur ": "This username doesn't exist on ",
    ". V\xE9rifiez l\u2019orthographe, ou essayez l\u2019autre plateforme.": ". Check the spelling, or try the other platform.",
    "Chercher \xAB ": "Search for \xAB ",
    " \xBB sur ": " \xBB on ",
    "Impossible de joindre l'API (": "Could not reach the API (",
    "). V\xE9rifiez votre connexion - ou explorez le profil de d\xE9monstration, enti\xE8rement hors-ligne.": "). Check your connection - or explore the fully offline demo profile.",
    "Recherches r\xE9centes effac\xE9es.": "Recent searches cleared.",
    "Jeton enregistr\xE9 - acc\xE8s aux d\xE9p\xF4ts priv\xE9s activ\xE9.": "Token saved - private repositories enabled.",
    "Jeton GitHub enregistr\xE9 - d\xE9p\xF4ts priv\xE9s activ\xE9s.": "GitHub token saved - private repositories enabled.",
    "Jeton GitLab enregistr\xE9 - d\xE9p\xF4ts priv\xE9s activ\xE9s.": "GitLab token saved - private repositories enabled.",
    "Jeton retir\xE9 - d\xE9p\xF4ts priv\xE9s masqu\xE9s.": "Token removed - private repositories hidden.",
    "Collez d\u2019abord un jeton.": "Paste a token first.",
    "Export JSON t\xE9l\xE9charg\xE9.": "JSON export downloaded.",
    "Export JSON annul\xE9.": "JSON export cancelled.",
    "Export JSON lanc\xE9\u2026": "Starting JSON export\u2026",
    "T\xE9l\xE9chargement annul\xE9 : ": "Download cancelled: ",
    "T\xE9l\xE9chargement du README annul\xE9.": "README download cancelled.",
    "Lien GitAtlas copi\xE9 dans le presse-papiers.": "GitAtlas link copied to clipboard.",
    "Copie impossible": "Copy failed",
    "Le ZIP est disponible sur les d\xE9p\xF4ts r\xE9els (pas en d\xE9mo).": "ZIP is available for real repositories (not in demo).",
    "T\xE9l\xE9chargement du ZIP lanc\xE9\u2026": "Starting ZIP download\u2026",
    "Commande de clonage copi\xE9e.": "Clone command copied.",
    "Arborescence repli\xE9e.": "Tree collapsed.",
    "Fichier copi\xE9 (": "File copied (",
    "T\xE9l\xE9chargement impossible : ": "Download failed: ",
    "T\xE9l\xE9chargement indisponible en d\xE9mo pour ce fichier.": "Download unavailable in demo for this file.",
    "T\xE9l\xE9chargement de ": "Downloading ",
    " lanc\xE9.": " started.",
    "README copi\xE9 en Markdown.": "README copied as Markdown.",
    "README t\xE9l\xE9charg\xE9.": "README downloaded.",
    "Bloc de code copi\xE9.": "Code block copied.",
    "SHA copi\xE9 : ": "SHA copied: ",
    "Copi\xE9 !": "Copied!",
    "Ajout\xE9 aux favoris \u2B50": "Added to favourites \u2B50",
    "Retir\xE9 des favoris.": "Removed from favourites.",
    "Favori retir\xE9.": "Favourite removed.",
    "Favori restaur\xE9.": "Favourite restored.",
    Annuler: "Cancel",
    Enregistrer: "Save",
    Retirer: "Remove",
    "Aucun favori pour l\u2019instant.": "No favourites yet.",
    "Cliquez sur l\u2019\xE9toile d\u2019un profil ou d\u2019un d\xE9p\xF4t pour le retrouver ici.": "Click the star on a profile or repository to find it here.",
    "Profils \xB7 ": "Profiles \xB7 ",
    "D\xE9p\xF4ts \xB7 ": "Repositories \xB7 ",
    "Stock\xE9 uniquement dans ce navigateur (sessionStorage). Envoy\xE9": "Stored only in this browser (sessionStorage). Sent",
    "exclusivement \xE0 ": "only to ",
    "Cr\xE9er un jeton sur GitHub": "Create a token on GitHub",
    "Cr\xE9er un jeton sur GitLab": "Create a token on GitLab",
    "Cr\xE9er un jeton sur ": "Create a token on ",
    "Jeton d'acc\xE8s ": "Access token: ",
    "Ajoutez un <b>jeton personnel GitLab</b> (scope <b>read_api</b>) pour voir vos projets priv\xE9s depuis votre profil.": "Add a <b>GitLab personal token</b> (with the <b>read_api</b> scope) to see your private projects from your profile.",
    "Ajoutez un jeton personnel pour voir <b>vos d\xE9p\xF4ts priv\xE9s</b> et portez la limite de l'API GitHub de 60 \xE0 5 000 requ\xEAtes/heure.": "Add a personal token to see <b>your private repositories</b> and raise the GitHub API limit from 60 to 5,000 requests/hour.",
    "GitHub : scope <b>repo</b> (classique) ou <b>Contents: read</b> (jeton affin\xE9).": "GitHub: <b>repo</b> scope (classic) or <b>Contents: read</b> (fine-grained token).",
    "GitLab : cochez le scope <b>read_api</b>. Le jeton reste sur cet appareil.": "GitLab: enable the <b>read_api</b> scope. The token stays on this device.",
    "GitHub : jeton personnel avec <b>read_api</b>.": "GitHub: personal token with <b>read_api</b>.",
    "GitLab : jeton personnel avec ": "GitLab: personal token with ",
    "Ajoutez un ": "Add a ",
    "jeton personnel GitLab": "GitLab personal token",
    "(scope ": "(with the ",
    ") pour voir vos projets priv\xE9s depuis votre profil.": ") to see your private projects from your profile.",
    "Ajoutez un jeton personnel pour voir ": "Add a personal token to see ",
    "vos d\xE9p\xF4ts priv\xE9s": "your private repositories",
    " et portez la limite de l'API GitHub de 60 \xE0 5 000 requ\xEAtes/heure.": " and raise the GitHub API limit from 60 to 5,000 requests/hour.",
    "GitHub : scope ": "GitHub: ",
    " (classique) ou ": " scope (classic) or ",
    "(jeton affin\xE9).": "(fine-grained token).",
    "GitLab : cochez le scope ": "GitLab: enable the ",
    ". Le jeton reste sur cet appareil.": ". The token stays on this device.",
    "Ne pas conserver le jeton (effac\xE9 au rechargement)": "Don't store the token (cleared on reload)",
    "API GitHub": "GitHub API",
    "API GitLab": "GitLab API",
    " \xB7 jeton": " \xB7 token",
    "D\xE9mo \xB7 hors-ligne": "Demo \xB7 offline",
    Langue: "Language",
    "Langue chang\xE9e - interface en anglais.": "Language changed - English interface.",
    "Langue chang\xE9e - interface en fran\xE7ais.": "Language changed - French interface."
  };
  var KEYS = Object.keys(DICT).sort((a, b) => b.length - a.length);
  var SKIP = "script,style,noscript,code,pre,.code-body,.md-body,.cmsg,.pbio,.rc-desc,.rr-desc,.rh-desc,.fr-name,.fr-sub,.fav-row,.pname,.plogin,.tname,.tchip,.sha,.lr-name,.lseg,.clone-url,.stat-num,.rc-lang,.rr-lang";
  var ATTRS = ["placeholder", "title", "aria-label"];
  function translateText(s) {
    if (S.lang === "fr" || !s) return s;
    const lead = /^\s*/.exec(s)[0];
    const trail = /\s*$/.exec(s)[0];
    let out = s.replace(/\s+/g, " ").trim();
    for (const k of KEYS) {
      const key = k.trim();
      if (key && out.includes(key)) out = out.split(key).join(DICT[k].trim());
    }
    out = out.replace(/(\d)[\u202f\u00a0 ](\d{3})\b/g, "$1,$2").replace(/à l'instant/g, "just now").replace(/\bhier\b/g, "yesterday").replace(/il y a (\d+) min/g, "$1 min ago").replace(/il y a (\d+) h\b/g, "$1 hours ago").replace(/il y a (\d+) j\b/g, "$1 days ago").replace(/il y a (\d+) mois\b/g, "$1 months ago").replace(/il y a (\d+) ans\b/g, "$1 years ago").replace(/il y a (\d+) an\b/g, "$1 year ago").replace(/(\d+),(\d+)\s*Ko\b/g, "$1.$2 KB").replace(/(\d+),(\d+)\s*Mo\b/g, "$1.$2 MB").replace(/(\d+),(\d+)\s*Go\b/g, "$1.$2 GB").replace(/(\d+)\s*o\b/g, "$1 B");
    return lead + out + trail;
  }
  var origVals = /* @__PURE__ */ new WeakMap();
  var lastOuts = /* @__PURE__ */ new WeakMap();
  function translateNode(node) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if (!parent || parent.closest(SKIP)) return;
    const cur = node.nodeValue;
    let orig = origVals.get(node);
    const prevOut = lastOuts.get(node);
    if (orig == null || prevOut != null && cur !== prevOut) orig = cur;
    origVals.set(node, orig);
    const next = translateText(orig);
    if (next !== cur) node.nodeValue = next;
    lastOuts.set(node, next);
  }
  function translateAttrs(root) {
    if (!root.querySelectorAll) return;
    root.querySelectorAll("*").forEach((el) => {
      if (el.closest(SKIP)) return;
      for (const a of ATTRS) {
        if (!el.hasAttribute(a)) continue;
        let m = origVals.get(el);
        if (!m) origVals.set(el, m = {});
        const cur = el.getAttribute(a);
        const prevOut = m[a + ":out"];
        let orig = m[a];
        if (orig == null || prevOut != null && cur !== prevOut) orig = cur;
        m[a] = orig;
        const next = translateText(orig);
        if (next !== cur) el.setAttribute(a, next);
        m[a + ":out"] = next;
      }
    });
  }
  function applyLang() {
    document.documentElement.lang = S.lang;
    document.title = translateText(
      "GitAtlas - Explorateur de profils GitHub & GitLab"
    );
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      if (meta.__i18nOriginal == null) meta.__i18nOriginal = meta.content;
      meta.content = translateText(meta.__i18nOriginal);
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while (n = walker.nextNode()) translateNode(n);
    translateAttrs(document.body);
    document.querySelectorAll("[data-action='set-lang']").forEach((b) => {
      b.classList.toggle("on", b.dataset.lang === S.lang);
    });
    setSeo();
  }
  function startI18n() {
    applyLang();
    let queued = false, applying = false;
    const obs = new MutationObserver(() => {
      if (applying || queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        applying = true;
        applyLang();
        applying = false;
      });
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  function setLang(lang, notify = true) {
    if (!LANGS.includes(lang) || lang === S.lang) return;
    S.lang = lang;
    lsSet("lang", lang);
    applyLang();
    if (notify)
      toast(
        "info",
        translateText(
          "Langue chang\xE9e - interface en " + (lang === "en" ? "anglais" : "fran\xE7ais") + "."
        )
      );
  }

  // js/share.js
  var trigger = null;
  var ICONS = {
    native: "share",
    facebook: "facebook",
    x: "x",
    whatsapp: "whatsapp",
    linkedin: "linkedin",
    telegram: "telegram",
    mail: "mail",
    link: "link"
  };
  function initShare() {
    $("shareIco").innerHTML = icon("share", 15);
    renderShare();
  }
  function renderShare() {
    const menu = $("shareMenu");
    menu.innerHTML = shareMenuHTML();
    menu.querySelectorAll("[data-share-icon]").forEach((el) => {
      el.innerHTML = icon(ICONS[el.dataset.shareIcon] || "share", 17);
    });
  }
  function isShareOpen() {
    return !$("shareMenu").hidden;
  }
  function place(btn) {
    const menu = $("shareMenu");
    if (!btn || !document.contains(btn)) return;
    const r = btn.getBoundingClientRect();
    const w = menu.offsetWidth;
    const h = menu.offsetHeight;
    let top = r.bottom + 8;
    if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 8);
    menu.style.top = Math.round(top) + "px";
    menu.style.left = Math.round(Math.min(Math.max(8, r.right - w), innerWidth - w - 8)) + "px";
  }
  function openShare(btn) {
    const menu = $("shareMenu");
    renderShare();
    applyLang();
    trigger = btn || null;
    menu.hidden = false;
    document.querySelectorAll('[data-action="share-open"]').forEach((b) => {
      b.setAttribute("aria-expanded", "true");
    });
    place(btn);
    const first = menu.querySelector(".share-item");
    if (first) first.focus();
  }
  function closeShare(restoreFocus) {
    const menu = $("shareMenu");
    if (menu.hidden) return;
    menu.hidden = true;
    document.querySelectorAll('[data-action="share-open"]').forEach((b) => {
      b.setAttribute("aria-expanded", "false");
    });
    if (restoreFocus && trigger && document.contains(trigger)) trigger.focus();
    trigger = null;
  }
  async function copyShare() {
    const ok = await copyText(shareUrl());
    toast(
      ok ? "success" : "error",
      ok ? "Lien GitAtlas copi\xE9 dans le presse-papiers." : "Copie impossible dans ce contexte."
    );
  }
  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: document.title, url: shareUrl() });
    } catch (e) {
      if (e && e.name !== "AbortError") await copyShare();
    }
  }
  window.addEventListener("scroll", () => place(trigger), { passive: true });
  window.addEventListener("resize", () => place(trigger));

  // js/highlight.js
  var KW_CL = "const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|of|in|this|super|static|interface|type|enum|implements|public|private|protected|readonly|abstract|namespace|declare|as|fn|pub|mut|impl|trait|struct|match|use|mod|crate|where|loop|move|unsafe|dyn|package|func|defer|go|chan|range|select|yield|delete|void|template|typename|constexpr|auto|virtual|override|operator|sizeof|namespace|using|not|and|or";
  var RULES = {};
  RULES.clike = [
    [/\n/y, ""],
    [/[ \t]+/y, ""],
    [/\/\*[\s\S]*?(?:\*\/|$)/y, "c"],
    [/\/\/[^\n]*/y, "c"],
    [/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?/y, "s"],
    [/\b(?:true|false|null|undefined|None|True|False|nil|NaN|Infinity)\b/y, "n"],
    [
      /\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/y,
      "n"
    ],
    [new RegExp("\\b(?:" + KW_CL + ")\\b", "y"), "k"],
    [/@[\w.]+/y, "a"],
    [/#[A-Za-z_]+/y, "a"],
    [/\b[A-Z][A-Za-z0-9_]*\b/y, "t"],
    [/[A-Za-z_$][\w$]*(?=\s*\()/y, "f"],
    [/[A-Za-z_$][\w$]*/y, ""]
  ];
  RULES.py = [
    [/\n/y, ""],
    [/[ \t]+/y, ""],
    [/"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)/y, "s"],
    [/#[^\n]*/y, "c"],
    [/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y, "s"],
    [/\b(?:None|True|False)\b/y, "n"],
    [/\b\d[\d_]*(?:\.\d+)?\b/y, "n"],
    [
      /\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|import|from|as|with|try|except|finally|raise|lambda|pass|break|continue|yield|global|nonlocal|assert|del|is|async|await|self|end|do|then|puts|require|module|include)\b/y,
      "k"
    ],
    [/@[\w.]+/y, "a"],
    [/\b[A-Z][A-Za-z0-9_]*\b/y, "t"],
    [/[A-Za-z_][\w]*(?=\s*\()/y, "f"],
    [/[A-Za-z_][\w]*/y, ""]
  ];
  RULES.shell = [
    [/\n/y, ""],
    [/^[ \t-]*[\w."'/-]+(?=\s*:)/my, "p"],
    [/[ \t]+/y, ""],
    [/#[^\n]*/y, "c"],
    [/"(?:\\.|[^"\\])*"?|'[^']*'?/y, "s"],
    [/\$\w+|\$\([^)]*\)/y, "n"],
    [
      /\b(?:if|then|fi|else|elif|for|do|done|while|case|esac|function|export|echo|cd|set|local|return|exit|shift|trap|source|sudo|apt|npm|npx|yarn|pnpm|git|cargo|pip|python|python3|node|docker|make|curl|nginx|tput|sleep|true|false)\b/y,
      "k"
    ],
    [/\b\d+(?:\.\d+)?\b/y, "n"],
    [/[A-Za-z_][\w-]*/y, ""]
  ];
  RULES.json = [
    [/\n/y, ""],
    [/[ \t]+/y, ""],
    [/"(?:\\.|[^"\\])*"(?=\s*:)/y, "p"],
    [/"(?:\\.|[^"\\])*"/y, "s"],
    [/\b(?:true|false|null)\b/y, "n"],
    [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y, "n"],
    [/[A-Za-z_][\w]*/y, ""]
  ];
  RULES.css = [
    [/\n/y, ""],
    [/[ \t]+/y, ""],
    [/\/\*[\s\S]*?(?:\*\/|$)/y, "c"],
    [/"(?:\\.|[^"\\\n])*"|'[^'\n]*'/y, "s"],
    [/@[\w-]+/y, "k"],
    [/#[0-9a-fA-F]{3,8}\b/y, "n"],
    [/!important/y, "k"],
    [/-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|vmin|s|ms|deg|fr|ch)?/y, "n"],
    [/[A-Za-z-]+(?=\s*:)/y, "p"],
    [/[.#][\w-]+/y, "f"],
    [/[A-Za-z-]+(?=\()/y, "f"],
    [/[A-Za-z_-][\w-]*/y, ""]
  ];
  RULES.markup = [
    [/\n/y, ""],
    [/[ \t]+/y, ""],
    [/<!--[\s\S]*?(?:-->|$)/y, "c"],
    [/<!DOCTYPE[^>]*>/iy, "k"],
    [/<\/?[A-Za-z][\w:.-]*/y, "tag"],
    [/\/?>/y, "tag"],
    [/[A-Za-z_:@][\w:.-]*(?==)/y, "a"],
    [/"[^"]*"?|'[^']*'?/y, "s"],
    [/&[\w#]+;/y, "n"],
    [
      /\b(?:const|let|var|function|return|if|else|import|from|export|new|class)\b/y,
      "k"
    ],
    [/[A-Za-z_][\w-]*/y, ""]
  ];
  RULES.plain = [
    [/\n/y, ""],
    [/[^\n]+/y, ""]
  ];
  RULES.md = [
    [/\n/y, ""],
    [/^```[^\n]*\n?[\s\S]*?(?:\n```[^\n]*|$)/my, "s"],
    [/^~~~[^\n]*\n?[\s\S]*?(?:\n~~~[^\n]*|$)/my, "s"],
    [/^#{1,6}[^\n]*/my, "k"],
    [/^>[^\n]*/my, "c"],
    [/^(?:[-*+]|\d+\.)\s/my, "n"],
    [/[ \t]+/y, ""],
    [/`[^`\n]*`/y, "s"],
    [/\*\*[^*\n]+\*\*/y, "t"],
    [/\[[^\]\n]*\]\([^)\n]*\)/y, "f"],
    [/[A-Za-z_][\w]*/y, ""]
  ];
  RULES.sql = [
    [/\n/y, ""],
    [/[ \t]+/y, ""],
    [/--[^\n]*/y, "c"],
    [/\/\*[\s\S]*?(?:\*\/|$)/y, "c"],
    [/'(?:''|[^'])*'?/y, "s"],
    [/\b\d+(?:\.\d+)?\b/y, "n"],
    [
      /\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|REFERENCES|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|DEFAULT|UNIQUE|BEGIN|COMMIT)\b/iy,
      "k"
    ],
    [/[A-Za-z_][\w]*(?=\s*\()/y, "f"],
    [/[A-Za-z_][\w]*/y, ""]
  ];
  function highlightLines(code, key) {
    code = String(code).replace(/\r\n?/g, "\n");
    const rules = RULES[key];
    if (!rules || code.length > 2e5) return code.split("\n").map(esc);
    const toks = [];
    let i = 0, buf = "";
    const flush = () => {
      if (buf) {
        toks.push(["", buf]);
        buf = "";
      }
    };
    while (i < code.length) {
      let hit = null;
      for (const pair of rules) {
        pair[0].lastIndex = i;
        const m = pair[0].exec(code);
        if (m && m[0]) {
          hit = [pair[1], m[0]];
          break;
        }
      }
      if (hit) {
        flush();
        toks.push(hit);
        i += hit[1].length;
      } else {
        buf += code[i++];
      }
    }
    flush();
    const lines = [];
    let cur = "";
    for (const [t, s] of toks) {
      const parts = s.split("\n");
      for (let k = 0; k < parts.length; k++) {
        if (k > 0) {
          lines.push(cur);
          cur = "";
        }
        if (parts[k])
          cur += t ? '<span class="tk-' + t + '">' + esc(parts[k]) + "</span>" : esc(parts[k]);
      }
    }
    lines.push(cur);
    if (code.endsWith("\n")) lines.pop();
    return lines;
  }

  // js/markdown.js
  var MD_CODE_SEQ = 0;
  var MD_CODES = {};
  var EMOJI = {
    rocket: "\u{1F680}",
    sparkles: "\u2728",
    warning: "\u26A0\uFE0F",
    book: "\u{1F4D6}",
    zap: "\u26A1",
    bug: "\u{1F41B}",
    white_check_mark: "\u2705",
    heavy_check_mark: "\u2714\uFE0F",
    fire: "\u{1F525}",
    tada: "\u{1F389}",
    construction: "\u{1F6A7}",
    memo: "\u{1F4DD}",
    package: "\u{1F4E6}",
    art: "\u{1F3A8}",
    lock: "\u{1F512}",
    globe: "\u{1F310}",
    star: "\u2B50",
    heart: "\u2764\uFE0F",
    eyes: "\u{1F440}",
    wave: "\u{1F44B}",
    hammer: "\u{1F528}",
    wrench: "\u{1F527}",
    bulb: "\u{1F4A1}",
    penguin: "\u{1F427}",
    robot: "\u{1F916}",
    chart_with_upwards_trend: "\u{1F4C8}",
    computer: "\u{1F4BB}",
    seedling: "\u{1F331}",
    gear: "\u2699\uFE0F"
  };
  function codeBlockHTML(code, lang) {
    const k = ++MD_CODE_SEQ;
    MD_CODES[k] = code;
    const aliases = {
      js: "js",
      javascript: "js",
      jsx: "jsx",
      ts: "ts",
      typescript: "ts",
      tsx: "tsx",
      cpp: "cpp",
      cxx: "cpp",
      cc: "cc",
      hpp: "hpp",
      html: "html",
      xml: "xml",
      vue: "vue",
      svelte: "svelte",
      css: "css",
      scss: "scss",
      less: "less",
      py: "py",
      python: "py",
      rb: "rb",
      ruby: "rb",
      sh: "sh",
      bash: "bash",
      zsh: "zsh",
      shell: "sh",
      json: "json",
      md: "md",
      markdown: "md",
      sql: "sql",
      yml: "yml",
      yaml: "yaml",
      toml: "toml"
    };
    const normalized = aliases[String(lang || "").trim().toLowerCase()] || String(lang || "").trim().toLowerCase();
    const key = (EXT_LANG[normalized] || ["plain", ""])[0];
    const label = lang || "texte";
    return '<div class="cb"><div class="cb-head"><span class="cb-lang">' + esc(label) + '</span><button class="cb-copy" data-action="copy-block" data-k="' + k + '">' + icon("copy", 12) + 'Copier</button></div><pre tabindex="0"><code>' + highlightLines(code, RULES[key] ? key : "plain").join("\n") + "</code></pre></div>";
  }
  function safeHref(u) {
    return /^(https?:\/\/|mailto:|#)/i.test(u) ? u : null;
  }
  function mdInline(text, ctx) {
    let s = esc(text);
    const stash = [];
    const put = (h) => {
      stash.push(h);
      return "" + (stash.length - 1) + "";
    };
    s = s.replace(/&lt;!--[\s\S]*?--&gt;/g, "");
    s = s.replace(/`([^`]+)`/g, (m, c) => put("<code>" + c + "</code>"));
    s = s.replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^)]*&quot;)?\)/g,
      (m, alt, u) => {
        const url = ctx.img(unesc(u));
        return put(
          url ? '<img src="' + esc(url) + '" alt="' + alt + '" loading="lazy">' : '<span class="md-img-chip">' + icon("image", 12) + alt + "</span>"
        );
      }
    );
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
      u = unesc(u);
      if (u.startsWith("#"))
        return put('<a href="#' + esc(u.slice(1)) + '">' + t + "</a>");
      const url = /^https?:|^mailto:/i.test(u) ? u : ctx.link(u);
      return put(
        url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + t + "</a>" : "<span>" + t + "</span>"
      );
    });
    if (ctx.refs) {
      s = s.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (m, t, r) => {
        const u = ctx.refs[(r || t).toLowerCase()];
        return u ? put(
          '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + t + "</a>"
        ) : m;
      });
    }
    s = s.replace(
      /&lt;(https?:\/\/[^\s&]+)&gt;/g,
      (m, u) => put(
        '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + "</a>"
      )
    );
    s = s.replace(
      /(^|[\s(])(https?:\/\/[^\s<>()\u0001]+)/g,
      (m, pre, u) => pre + put(
        '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + "</a>"
      )
    );
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>").replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?;:]|$)/g, "$1<em>$2</em>");
    s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    s = s.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
    s = s.replace(
      /&lt;(\/?)(b|strong|em|i|del|sub|sup|kbd|code|summary)&gt;/g,
      "<$1$2>"
    );
    s = s.replace(/&lt;details(?:\s+open)?&gt;/g, "<details>").replace(/&lt;\/details&gt;/g, "</details>");
    s = s.replace(
      /&lt;(p|div)\s+align=&quot;(center|left|right)&quot;&gt;/g,
      (m, t, a) => "<" + t + ' class="md-align-' + a + '">'
    ).replace(/&lt;\/(p|div)&gt;/g, "</$1>");
    s = s.replace(/&lt;img\s+([^&]*?)\s*\/?&gt;/g, (m, attrs) => {
      const get = (n) => {
        const r = attrs.match(new RegExp(n + "=&quot;([^&]*)&quot;"));
        return r ? unesc(r[1]) : null;
      };
      const src = get("src");
      if (!src) return m;
      const url = ctx.img(src);
      if (!url) return m;
      const alt = get("alt") || "";
      const w = get("width");
      return '<img src="' + esc(url) + '" alt="' + esc(alt) + '"' + (w && /^\d+$/.test(w) ? ' width="' + w + '"' : "") + ' loading="lazy">';
    });
    s = s.replace(/&lt;a\s+href=&quot;([^&]+)&quot;[^&]*&gt;/g, (m, u) => {
      const h = safeHref(unesc(u));
      return h ? '<a href="' + esc(h) + '" target="_blank" rel="noopener noreferrer">' : m;
    }).replace(/&lt;\/a&gt;/g, "</a>");
    s = s.replace(/:([a-z_]+):/g, (m, n) => EMOJI[n] || m);
    s = s.replace(/\u0003/g, "<br>");
    for (let p = 0; p < 3; p++)
      s = s.replace(/\u0001(\d+)\u0002/g, (m, i) => stash[+i] || "");
    return s;
  }
  function mdToHtml(src, ctx) {
    ctx = ctx || { img: (u) => safeHref(u), link: (u) => safeHref(u), refs: {} };
    if (!ctx.refs) ctx.refs = {};
    let L = String(src).replace(/\r\n?/g, "\n").split("\n");
    L = L.filter((l) => {
      const m = l.match(/^\s*\[([^\]]+)\]:\s*(\S+)/);
      if (m) {
        ctx.refs[m[1].toLowerCase()] = unesc(esc(m[2]));
        return false;
      }
      return true;
    });
    let out = "", i = 0, para = [];
    const flush = () => {
      if (para.length) {
        out += "<p>" + mdInline(
          para.map((l) => l.replace(/\s{2,}$/, "")).join(" "),
          ctx
        ) + "</p>";
        para = [];
      }
    };
    const blank = (s) => /^\s*$/.test(s);
    const itemRe = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
    while (i < L.length) {
      const line = L[i];
      let m;
      if (blank(line)) {
        flush();
        i++;
        continue;
      }
      if (m = line.match(/^\s*(```|~~~)\s*([^\s`]*)/)) {
        flush();
        const f = m[1], lang = m[2] || "";
        const buf = [];
        i++;
        while (i < L.length && !L[i].trimStart().startsWith(f)) {
          buf.push(L[i]);
          i++;
        }
        i++;
        out += codeBlockHTML(buf.join("\n"), lang);
        continue;
      }
      if (m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/)) {
        flush();
        const n = m[1].length;
        const txt = m[2];
        out += "<h" + n + ' id="md-' + esc(slug(txt)) + '">' + mdInline(txt, ctx) + "</h" + n + ">";
        i++;
        continue;
      }
      if (/^ {0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        flush();
        out += "<hr>";
        i++;
        continue;
      }
      if (/^ {0,3}>/.test(line)) {
        flush();
        const buf = [];
        while (i < L.length && /^ {0,3}>/.test(L[i])) {
          buf.push(L[i].replace(/^ {0,3}>\s?/, ""));
          i++;
        }
        out += "<blockquote>" + mdToHtml(buf.join("\n"), ctx) + "</blockquote>";
        continue;
      }
      if (/^\s*<details/i.test(line)) {
        flush();
        const buf = [];
        let depth = 0;
        while (i < L.length) {
          buf.push(L[i]);
          if (/<details/i.test(L[i])) depth++;
          if (/<\/details>/i.test(L[i])) {
            depth--;
            if (depth <= 0) {
              i++;
              break;
            }
          }
          i++;
        }
        const inner = buf.join("\n").replace(/^\s*<details[^>]*>/i, "").replace(/<\/details>\s*$/i, "");
        const sm = inner.match(/^\s*<summary>([\s\S]*?)<\/summary>/i);
        const summary = sm ? sm[1] : "D\xE9tails";
        const rest = sm ? inner.slice(sm[0].length) : inner;
        out += "<details><summary>" + mdInline(summary, ctx) + "</summary>" + mdToHtml(rest, ctx) + "</details>";
        continue;
      }
      if (line.includes("|") && i + 1 < L.length && /^\s*\|?[\s:|-]*-[\s:|-]*$/.test(L[i + 1]) && L[i + 1].includes("-")) {
        flush();
        const cells = (r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
        const head = cells(line);
        const aligns = cells(L[i + 1]).map((c) => {
          const l = c.startsWith(":"), r = c.endsWith(":");
          return l && r ? "center" : r ? "right" : l ? "left" : "";
        });
        i += 2;
        const rows = [];
        while (i < L.length && L[i].includes("|") && !blank(L[i])) {
          rows.push(cells(L[i]));
          i++;
        }
        out += '<table tabindex="0"><thead><tr>' + head.map(
          (h, j) => "<th" + (aligns[j] ? ' style="text-align:' + aligns[j] + '"' : "") + ">" + mdInline(h, ctx) + "</th>"
        ).join("") + "</tr></thead><tbody>" + rows.map(
          (r) => "<tr>" + head.map(
            (_, j) => "<td" + (aligns[j] ? ' style="text-align:' + aligns[j] + '"' : "") + ">" + mdInline(r[j] || "", ctx) + "</td>"
          ).join("") + "</tr>"
        ).join("") + "</tbody></table>";
        continue;
      }
      if (itemRe.test(line)) {
        flush();
        const items = [];
        while (i < L.length) {
          const im = L[i].match(itemRe);
          if (im) {
            items.push({
              indent: im[1].length,
              ordered: /\d/.test(im[2]),
              text: im[3]
            });
            i++;
          } else if (/^\s{2,}\S/.test(L[i]) && items.length) {
            items[items.length - 1].text += " " + L[i].trim();
            i++;
          } else if (blank(L[i]) && i + 1 < L.length && itemRe.test(L[i + 1])) {
            i++;
          } else break;
        }
        let html = "";
        const stack = [];
        const closeTop = () => {
          const t = stack.pop();
          html += "</" + t.tag + ">";
        };
        for (const it of items) {
          while (stack.length && it.indent < stack[stack.length - 1].indent)
            closeTop();
          const tag = it.ordered ? "ol" : "ul";
          if (!stack.length || it.indent > stack[stack.length - 1].indent) {
            html += "<" + tag + ">";
            stack.push({ indent: it.indent, tag });
          } else if (stack[stack.length - 1].tag !== tag) {
            closeTop();
            html += "<" + tag + ">";
            stack.push({ indent: it.indent, tag });
          }
          const task = it.text.match(/^\[( |x|X)\]\s+(.*)$/);
          html += task ? '<li class="task"><input type="checkbox" disabled' + (task[1] !== " " ? " checked" : "") + "> " + mdInline(task[2], ctx) + "</li>" : "<li>" + mdInline(it.text, ctx) + "</li>";
        }
        while (stack.length) closeTop();
        out += html;
        continue;
      }
      if (/^ {0,3}</.test(line)) {
        flush();
        const buf = [];
        while (i < L.length && !blank(L[i])) {
          buf.push(L[i]);
          i++;
        }
        out += '<div class="md-raw">' + mdInline(buf.join("\n"), ctx) + "</div>";
        continue;
      }
      para.push(line);
      i++;
    }
    flush();
    return out;
  }

  // js/menu.js
  var lastFocus = null;
  var blockWheel = (e) => e.preventDefault();
  function isMenuOpen() {
    return $("hdr").classList.contains("menu-open");
  }
  function openMenu() {
    if (isMenuOpen()) return;
    lastFocus = document.activeElement;
    $("hdr").classList.add("menu-open");
    $("menuScrim").classList.add("show");
    $("menuBtn").setAttribute("aria-expanded", "true");
    $("menuIco").innerHTML = icon("x", 18);
    window.addEventListener("wheel", blockWheel, { passive: false });
    const first = $("hdrActions").querySelector("button");
    if (first) first.focus();
  }
  function closeMenu(restoreFocus = false) {
    if (!isMenuOpen()) return;
    $("hdr").classList.remove("menu-open");
    $("menuScrim").classList.remove("show");
    $("menuBtn").setAttribute("aria-expanded", "false");
    $("menuIco").innerHTML = icon("menu", 18);
    window.removeEventListener("wheel", blockWheel);
    if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }
  function toggleMenu() {
    if (isMenuOpen()) closeMenu(true);
    else openMenu();
  }
  window.addEventListener("resize", () => {
    if (innerWidth > 720 && isMenuOpen()) closeMenu(false);
  });

  // js/demo-data.js
  function raw(strings, ...values) {
    let text = strings.raw[0];
    for (let i = 0; i < values.length; i++) text += values[i] + strings.raw[i + 1];
    const lines = text.replace(/\r\n?/g, "\n").split("\n");
    if (lines[0] === "") lines.shift();
    const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^[ \t]*/)[0].length);
    const pad = indents.length ? Math.min(...indents) : 0;
    return lines.map((line) => line.trim() ? line.slice(pad) : "").join("\n");
  }
  var DEMO_USER = {
    pl: "demo",
    login: "lina-forge",
    name: "Lina Forge",
    avatar: initialsAvatar("Lina Forge"),
    bio: "D\xE9veloppeuse syst\xE8mes & cr\xE9ative. Je construis des outils rapides, accessibles et joliment document\xE9s. Rendu temps r\xE9el le jour, open source la nuit.",
    company: "Atelier Nova",
    location: "Lyon, France",
    blog: "https://linaforge.dev",
    twitter: "linaforge",
    followers: 1284,
    following: 182,
    publicRepos: 12,
    created: "2016-03-14T10:22:00Z",
    url: null,
    org: false
  };
  var DEMO_REPOS = [
    {
      meta: {
        name: "pulse-ui",
        desc: "Biblioth\xE8que de composants web l\xE9gers, accessibles et sans d\xE9pendance. 4 Ko gzip, tokens CSS, z\xE9ro framework.",
        stars: 2412,
        forks: 284,
        issues: 14,
        sizeKB: 412,
        lang: "TypeScript",
        topics: ["web-components", "design-system", "a11y", "typescript"],
        license: "MIT",
        fork: false,
        archived: false,
        created: "2021-06-02",
        pushed: "2026-11-14T09:12:00Z",
        branch: "main"
      },
      langs: { TypeScript: 61234, CSS: 18220, JavaScript: 4110, YAML: 2300 },
      files: {
        "README.md": raw`
        # ⚡ pulse-ui

        **v2.4.1** · **MIT** · **0 dépendance** · **4 Ko gzip**

        Des composants web natifs, accessibles par défaut, pilotés par des tokens CSS.
        Pas de framework, pas de build obligatoire : une balise script et c'est parti.

        ~~~ts
        import { PulseButton, PulseTabs } from '@lina-forge/pulse-ui';
        customElements.define('pulse-button', PulseButton);
        customElements.define('pulse-tabs', PulseTabs);
        ~~~

        ## Composants

        | Composant        | Statut | A11y | Poids  |
        | ---------------- | :----: | :--: | -----: |
        | pulse-button     |   ✅   |  AA  | 0,8 Ko |
        | pulse-tabs       |   ✅   |  AA  | 1,1 Ko |
        | pulse-dialog     |   ✅   | AAA  | 1,4 Ko |
        | pulse-tooltip    |   🧪   |  AA  | 0,7 Ko |

        ## Principes

        - **Le plateforme d'abord** : HTMLElement, Shadow DOM, slots natifs.
        - **Accessibilité non négociable** : focus visible, rôles ARIA, clavier complet.
        - **Theming par tokens** : chaque couleur, espace et rayon est une variable CSS.

        > « La meilleure dépendance est celle qu'on n'a pas. »

        ## Développement

        ~~~bash
        npm install
        npm run dev     # serveur de démo sur localhost:5173
        npm test        # vitest + happy-dom
        ~~~

        MIT © Lina Forge — contributions bienvenues !
      `,
        "package.json": raw`
        {
          "name": "@lina-forge/pulse-ui",
          "version": "2.4.1",
          "description": "Composants web légers, accessibles et sans dépendance.",
          "type": "module",
          "main": "dist/index.js",
          "types": "dist/index.d.ts",
          "sideEffects": false,
          "exports": {
            ".": "./dist/index.js",
            "./tokens.css": "./src/tokens.css"
          },
          "scripts": {
            "dev": "esbuild src/index.ts --bundle --servedir=.",
            "build": "esbuild src/index.ts --bundle --minify --outfile=dist/index.js",
            "test": "vitest run",
            "lint": "tsc --noEmit"
          },
          "keywords": ["web-components", "a11y", "design-system"],
          "license": "MIT",
          "devDependencies": {
            "esbuild": "^0.24.0",
            "typescript": "^5.6.0",
            "vitest": "^2.1.0"
          }
        }
      `,
        "tsconfig.json": raw`
        {
          "compilerOptions": {
            "target": "ES2022",
            "module": "ESNext",
            "moduleResolution": "bundler",
            "lib": ["ES2022", "DOM", "DOM.Iterable"],
            "strict": true,
            "noUncheckedIndexedAccess": true,
            "declaration": true,
            "outDir": "dist"
          },
          "include": ["src"]
        }
      `,
        "src/index.ts": raw`
        // Point d'entrée public de pulse-ui.

        export { PulseButton } from './button';
        export { PulseTabs } from './tabs';
        export { clamp, debounce, uid } from './utils';

        export const VERSION = '2.4.1';

        /** Enregistre tous les composants d'un coup. */
        export function registerAll(prefix = 'pulse'): void {
          const { PulseButton } = require('./button');
          const defs: Array<[string, CustomElementConstructor]> = [
            [prefix + '-button', PulseButton],
          ];
          for (const [name, ctor] of defs) {
            if (!customElements.get(name)) customElements.define(name, ctor);
          }
        }
      `,
        "src/button.ts": raw`
        // <pulse-button> — bouton accessible, variantes par tokens.

        const template = document.createElement('template');
        template.innerHTML = [
          '<style>',
          ':host { display: inline-flex; }',
          'button {',
          '  font: inherit; cursor: pointer; border: 0;',
          '  padding: var(--pulse-space-2, 8px) var(--pulse-space-4, 16px);',
          '  border-radius: var(--pulse-radius, 10px);',
          '  background: var(--pulse-accent, #7B6CFF); color: white;',
          '  transition: transform 120ms ease, filter 120ms ease;',
          '}',
          'button:hover { filter: brightness(1.1); }',
          'button:active { transform: scale(0.97); }',
          'button:focus-visible { outline: 2px solid var(--pulse-focus, #2BD4F0); outline-offset: 2px; }',
          'button[disabled] { opacity: 0.5; cursor: not-allowed; }',
          '</style>',
          '<button part="button"><slot></slot></button>',
        ].join('\n');

        export class PulseButton extends HTMLElement {
          static observedAttributes = ['disabled', 'variant'];

          connectedCallback(): void {
            if (!this.shadowRoot) {
              this.attachShadow({ mode: 'open' });
              this.shadowRoot!.appendChild(template.content.cloneNode(true));
            }
            this.#sync();
          }

          attributeChangedCallback(): void {
            this.#sync();
          }

          #sync(): void {
            const btn = this.shadowRoot?.querySelector('button');
            if (!btn) return;
            btn.disabled = this.hasAttribute('disabled');
            btn.dataset.variant = this.getAttribute('variant') ?? 'solid';
          }
        }
      `,
        "src/tokens.css": raw`
        /* Tokens de design pulse-ui — surchargez-les librement. */

        :root {
          --pulse-accent: #7B6CFF;
          --pulse-accent-warm: #FF6B3D;
          --pulse-focus: #2BD4F0;
          --pulse-surface: #101830;
          --pulse-ink: #E8EDFB;
          --pulse-space-1: 4px;
          --pulse-space-2: 8px;
          --pulse-space-3: 12px;
          --pulse-space-4: 16px;
          --pulse-space-6: 24px;
          --pulse-radius: 10px;
          --pulse-radius-lg: 16px;
          --pulse-font: 'Inter', system-ui, sans-serif;
          --pulse-duration: 160ms;
          --pulse-ease: cubic-bezier(0.3, 0.7, 0.3, 1);
        }
      `,
        "src/utils.ts": raw`
        export const clamp = (v: number, min: number, max: number): number =>
          Math.min(max, Math.max(min, v));

        export function debounce<A extends unknown[]>(
          fn: (...args: A) => void,
          wait = 120,
        ): (...args: A) => void {
          let t: ReturnType<typeof setTimeout> | undefined;
          return (...args: A) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
          };
        }

        let counter = 0;
        export const uid = (prefix = 'pulse'): string =>
          prefix + '-' + (++counter).toString(36);
      `,
        "tests/button.test.ts": raw`
        import { describe, it, expect, beforeEach } from 'vitest';
        import { PulseButton } from '../src/button';

        customElements.define('pulse-button', PulseButton);

        describe('PulseButton', () => {
          beforeEach(() => {
            document.body.innerHTML = '';
          });

          it('monte un shadow DOM avec un bouton', () => {
            const el = new PulseButton();
            document.body.appendChild(el);
            expect(el.shadowRoot?.querySelector('button')).toBeTruthy();
          });

          it('répercute disabled sur le bouton interne', () => {
            const el = new PulseButton();
            document.body.appendChild(el);
            el.setAttribute('disabled', '');
            const btn = el.shadowRoot!.querySelector('button')!;
            expect(btn.disabled).toBe(true);
          });
        });
      `,
        ".github/workflows/ci.yml": raw`
        name: CI

        on:
          push:
            branches: [main]
          pull_request:

        jobs:
          test:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with:
                  node-version: 22
              - run: npm ci
              - run: npm run lint
              - run: npm run build
              - run: npm test
      `,
        "docs/theming.md": raw`
        # Theming

        Chaque composant lit ses styles dans des **tokens CSS**.
        Surchargez-les au niveau :root ou sur un conteneur :

        ~~~css
        .checkout {
          --pulse-accent: #FF6B3D;
          --pulse-radius: 999px;
          --pulse-space-4: 20px;
        }
        ~~~

        ## Tokens disponibles

        - Couleurs : accent, accent-warm, focus, surface, ink
        - Espaces : space-1 à space-6
        - Formes : radius, radius-lg
        - Motion : duration, ease

        Les tokens sont hérités : un thème local n'affecte jamais le reste de la page.
      `,
        LICENSE: raw`
        MIT License

        Copyright (c) 2024 Lina Forge

        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
      `,
        ".gitignore": raw`
        node_modules/
        dist/
        coverage/
        *.log
        .DS_Store
      `
      }
    },
    {
      meta: {
        name: "tinyvec",
        desc: "Alg\xE8bre lin\xE9aire SIMD header-only pour le temps r\xE9el. Vec4, Mat4 et quaternions, z\xE9ro allocation.",
        stars: 1893,
        forks: 167,
        issues: 6,
        sizeKB: 188,
        lang: "C++",
        topics: ["simd", "gamedev", "header-only", "math"],
        license: "Zlib",
        fork: false,
        archived: false,
        created: "2020-02-11",
        pushed: "2026-10-28T18:40:00Z",
        branch: "main"
      },
      langs: { "C++": 52310, CMake: 3120, Markdown: 2210 },
      files: {
        "README.md": raw`
        # 🧮 tinyvec

        **Header-only** · **C++17** · **SSE2 / NEON / scalaire**

        Des vecteurs et matrices pour le rendu temps réel, sans allocation,
        sans exceptions, sans RTTI. Une seule inclusion suffit.

        ~~~cpp
        #include <tinyvec.hpp>

        tv::Vec4 a{1, 2, 3, 1};
        tv::Vec4 b{4, 5, 6, 1};
        auto c = tv::normalize(a + b);   // SIMD si disponible
        float d = tv::dot(c, b);
        ~~~

        ## Garanties

        - Zéro allocation sur le chemin chaud
        - Layout aligné 16 octets, compatible chargements SIMD
        - Fallback scalaire testé sur chaque PR
        - Résultats bit-à-bit identiques entre backends (à 1 ulp près)

        ## Bench (Ryzen 7, clang 18, -O3)

        | Opération        | scalaire | SSE2   |
        | ---------------- | -------: | -----: |
        | dot(vec4) ×1M    |  2,1 ms  | 0,6 ms |
        | normalize ×1M    |  3,4 ms  | 0,9 ms |
        | mat4 mul ×1M     |  8,8 ms  | 2,2 ms |
      `,
        "include/tinyvec.hpp": raw`
        // tinyvec — algèbre linéaire SIMD header-only.

        #pragma once
        #include <cmath>
        #if defined(__SSE2__)
        #include <immintrin.h>
        #endif

        namespace tv {

        struct alignas(16) Vec4 {
          float x, y, z, w;

          Vec4 operator+(const Vec4& o) const {
        #if defined(__SSE2__)
            Vec4 r;
            _mm_store_ps(&r.x, _mm_add_ps(_mm_load_ps(&x), _mm_load_ps(&o.x)));
            return r;
        #else
            return {x + o.x, y + o.y, z + o.z, w + o.w};
        #endif
          }

          Vec4 operator*(float s) const { return {x * s, y * s, z * s, w * s}; }
        };

        inline float dot(const Vec4& a, const Vec4& b) {
          return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        }

        inline Vec4 normalize(const Vec4& v) {
          const float len = std::sqrt(dot(v, v));
          return len > 1e-8f ? v * (1.0f / len) : Vec4{0, 0, 0, 0};
        }

        inline Vec4 cross(const Vec4& a, const Vec4& b) {
          return {a.y * b.z - a.z * b.y,
                  a.z * b.x - a.x * b.z,
                  a.x * b.y - a.y * b.x, 0.0f};
        }

        } // namespace tv
      `,
        "bench/bench.cpp": raw`
        #include <tinyvec.hpp>
        #include <chrono>
        #include <cstdio>

        int main() {
          constexpr int N = 1'000'000;
          tv::Vec4 a{1, 2, 3, 1}, b{4, 5, 6, 1};
          volatile float sink = 0;

          auto t0 = std::chrono::steady_clock::now();
          for (int i = 0; i < N; ++i) sink += tv::dot(a, b);
          auto t1 = std::chrono::steady_clock::now();
          for (int i = 0; i < N; ++i) sink += tv::normalize(a).x;
          auto t2 = std::chrono::steady_clock::now();

          std::printf("dot:       %.2f ms\n",
                      std::chrono::duration<double, std::milli>(t1 - t0).count());
          std::printf("normalize: %.2f ms\n",
                      std::chrono::duration<double, std::milli>(t2 - t1).count());
          return 0;
        }
      `,
        "CMakeLists.txt": raw`
        cmake_minimum_required(VERSION 3.16)
        project(tinyvec LANGUAGES CXX)

        add_library(tinyvec INTERFACE)
        target_include_directories(tinyvec INTERFACE include/)
        target_compile_features(tinyvec INTERFACE cxx_std_17)

        option(TINYVEC_BUILD_TESTS "Build tests" ON)
        if(TINYVEC_BUILD_TESTS)
          enable_testing()
          add_executable(test_vec tests/test_vec.cpp)
          target_link_libraries(test_vec PRIVATE tinyvec)
          add_test(NAME vec COMMAND test_vec)
        endif()
      `,
        "tests/test_vec.cpp": raw`
        #include <tinyvec.hpp>
        #include <cassert>
        #include <cmath>

        int main() {
          tv::Vec4 a{1, 0, 0, 0}, b{0, 1, 0, 0};
          assert(std::abs(tv::dot(a, b)) < 1e-6f);
          auto c = tv::cross(a, b);
          assert(std::abs(c.z - 1.0f) < 1e-6f);
          auto n = tv::normalize(tv::Vec4{3, 4, 0, 0});
          assert(std::abs(n.x - 0.6f) < 1e-6f);
          assert(std::abs(n.y - 0.8f) < 1e-6f);
          auto z = tv::normalize(tv::Vec4{0, 0, 0, 0});
          assert(tv::dot(z, z) == 0.0f);
          return 0;
        }
      `,
        ".clang-format": raw`
        BasedOnStyle: LLVM
        IndentWidth: 2
        ColumnLimit: 90
        AlignAfterOpenBracket: Align
        AllowShortFunctionsOnASingleLine: Inline
      `
      }
    },
    {
      meta: {
        name: "orbital",
        desc: "Moteur de particules 2D sur canvas : 60 fps avec 20 000 particules, presets et z\xE9ro d\xE9pendance.",
        stars: 1287,
        forks: 98,
        issues: 9,
        sizeKB: 264,
        lang: "JavaScript",
        topics: ["canvas", "particles", "animation", "creative-coding"],
        license: "MIT",
        fork: false,
        archived: false,
        created: "2022-09-19",
        pushed: "2026-11-08T21:05:00Z",
        branch: "main"
      },
      langs: { JavaScript: 38110, HTML: 5230, CSS: 2140 },
      files: {
        "README.md": raw`
        ![orbital](assets/logo.svg)

        # orbital

        **20 000 particules · 60 fps · 0 dépendance**

        Un moteur de particules 2D qui tient dans une poche. Boucle à pas fixe,
        pool d'objets, rendu par lots sur un seul canvas.

        ~~~js
        import { Engine, presets } from './src/engine.js';

        const engine = new Engine(document.querySelector('canvas'));
        engine.emit(presets.supernova, { count: 12000 });
        engine.start();
        ~~~

        ## Presets inclus

        - **supernova** — explosion radiale avec traînes
        - **fireflies** — lucioles en mouvement brownien
        - **rain** — pluie avec vent et éclaboussures
        - **vortex** — attraction orbitale amortie

        ## Pourquoi c'est rapide

        1. Aucune allocation par frame (pool pré-alloué)
        2. Intégration à pas fixe, interpolation au rendu
        3. Un seul appel drawImage par texture, groupé par blend mode
      `,
        "index.html": raw`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>orbital — démo</title>
          <style>
            body { margin: 0; background: #070B16; overflow: hidden; }
            canvas { display: block; width: 100vw; height: 100vh; }
          </style>
        </head>
        <body>
          <canvas id="scene"></canvas>
          @@STARTSCRIPT@@ type="module">
            import { Engine, presets } from './src/engine.js';
            const engine = new Engine(document.getElementById('scene'));
            engine.emit(presets.supernova, { count: 12000 });
            engine.start();
          @@ENDSCRIPT@@
        </body>
        </html>
      `,
        "src/engine.js": raw`
        // orbital — moteur de particules à pas fixe, pool sans allocation.

        const TAU = Math.PI * 2;
        const STEP = 1 / 120;

        export class Engine {
          constructor(canvas, max = 20000) {
            this.ctx = canvas.getContext('2d');
            this.max = max;
            this.pool = new Float32Array(max * 6); // x, y, vx, vy, vie, taille
            this.alive = 0;
            this.acc = 0;
            this.last = 0;
            this.running = false;
            this.resize();
            addEventListener('resize', () => this.resize());
          }

          resize() {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            this.ctx.canvas.width = innerWidth * dpr;
            this.ctx.canvas.height = innerHeight * dpr;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }

          emit(preset, { count = 4000 } = {}) {
            for (let i = 0; i < count && this.alive < this.max; i++) {
              const o = this.alive++ * 6;
              preset(this.pool, o, innerWidth / 2, innerHeight / 2);
            }
          }

          step() {
            const p = this.pool;
            for (let i = 0; i < this.alive; i++) {
              const o = i * 6;
              p[o] += p[o + 2] * STEP;
              p[o + 1] += p[o + 3] * STEP;
              p[o + 3] += 220 * STEP;       // gravité
              p[o + 4] -= STEP;             // vie
              if (p[o + 4] <= 0) {          // swap-and-pop
                const last = --this.alive * 6;
                for (let k = 0; k < 6; k++) p[o + k] = p[last + k];
                i--;
              }
            }
          }

          frame = (t) => {
            if (!this.running) return;
            this.acc += Math.min((t - this.last) / 1000, 0.1);
            this.last = t;
            while (this.acc >= STEP) {
              this.step();
              this.acc -= STEP;
            }
            const c = this.ctx;
            c.fillStyle = 'rgba(7, 11, 22, 0.28)';
            c.fillRect(0, 0, innerWidth, innerHeight);
            c.fillStyle = '#A89CFF';
            const p = this.pool;
            for (let i = 0; i < this.alive; i++) {
              const o = i * 6;
              c.fillRect(p[o], p[o + 1], p[o + 5], p[o + 5]);
            }
            requestAnimationFrame(this.frame);
          };

          start() {
            if (this.running) return;
            this.running = true;
            this.last = performance.now();
            requestAnimationFrame(this.frame);
          }

          stop() {
            this.running = false;
          }
        }
      `,
        "src/presets.js": raw`
        const TAU = Math.PI * 2;
        const rand = (a, b) => a + Math.random() * (b - a);

        export const presets = {
          supernova(p, o, cx, cy) {
            const a = Math.random() * TAU;
            const sp = rand(60, 480);
            p[o] = cx; p[o + 1] = cy;
            p[o + 2] = Math.cos(a) * sp;
            p[o + 3] = Math.sin(a) * sp - 120;
            p[o + 4] = rand(0.8, 2.6);
            p[o + 5] = rand(1, 3);
          },

          fireflies(p, o, cx, cy) {
            p[o] = cx + rand(-300, 300);
            p[o + 1] = cy + rand(-200, 200);
            p[o + 2] = rand(-30, 30);
            p[o + 3] = rand(-40, -10);
            p[o + 4] = rand(2, 6);
            p[o + 5] = 2;
          },

          vortex(p, o, cx, cy) {
            const a = Math.random() * TAU;
            const r = rand(80, 320);
            p[o] = cx + Math.cos(a) * r;
            p[o + 1] = cy + Math.sin(a) * r;
            p[o + 2] = -Math.sin(a) * 160;
            p[o + 3] = Math.cos(a) * 160;
            p[o + 4] = rand(1.5, 4);
            p[o + 5] = rand(1, 2.5);
          },
        };
      `,
        "assets/logo.svg": raw`
        <svg xmlns="http://www.w3.org/2000/svg" width="560" height="160" viewBox="0 0 560 160">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#7B6CFF"/>
              <stop offset="0.55" stop-color="#FF6B3D"/>
              <stop offset="1" stop-color="#2BD4F0"/>
            </linearGradient>
          </defs>
          <rect width="560" height="160" rx="20" fill="#0B1122"/>
          <g fill="none" stroke="url(#g)" stroke-width="2.5">
            <ellipse cx="110" cy="80" rx="62" ry="26" transform="rotate(-18 110 80)"/>
            <ellipse cx="110" cy="80" rx="62" ry="26" transform="rotate(42 110 80)" opacity="0.6"/>
          </g>
          <circle cx="110" cy="80" r="12" fill="url(#g)"/>
          <circle cx="164" cy="62" r="5" fill="#2BD4F0"/>
          <circle cx="62" cy="102" r="4" fill="#FF6B3D"/>
          <text x="210" y="96" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="#E8EDFB">orbital</text>
          <text x="212" y="124" font-family="monospace" font-size="14" fill="#67739F">20k particles · 60 fps · 0 deps</text>
        </svg>
      `,
        "package.json": raw`
        {
          "name": "orbital-engine",
          "version": "1.7.0",
          "description": "Moteur de particules 2D canvas, zéro dépendance.",
          "type": "module",
          "main": "src/engine.js",
          "scripts": {
            "demo": "npx serve ."
          },
          "license": "MIT"
        }
      `,
        ".gitignore": raw`
        node_modules/
        .DS_Store
        *.log
      `
      }
    },
    {
      meta: {
        name: "forge-cli",
        desc: "G\xE9n\xE9rateur de projets ultra-rapide avec templates interactifs. Un binaire de 2 Mo, d\xE9marrage en 8 ms.",
        stars: 864,
        forks: 61,
        issues: 11,
        sizeKB: 142,
        lang: "Rust",
        topics: ["cli", "rust", "dx", "scaffolding"],
        license: "Apache-2.0",
        fork: false,
        archived: false,
        created: "2023-01-27",
        pushed: "2026-11-02T14:30:00Z",
        branch: "main"
      },
      langs: { Rust: 41230, TOML: 1820, Markdown: 3110 },
      files: {
        "README.md": raw`
        # 🔨 forge-cli

        **8 ms de démarrage · binaire 2 Mo · templates interactifs**

        forge scaffolde un projet complet en posant trois questions.
        Les templates sont de simples dossiers : pas de DSL à apprendre.

        ~~~bash
        cargo install forge-cli
        forge new mon-app --template ts-lib
        ~~~

        ## Roadmap

        - [x] Templates locaux et distants (git)
        - [x] Prompts interactifs avec valeurs par défaut
        - [x] Hooks post-génération
        - [ ] Registre communautaire de templates
        - [ ] Mode dry-run avec diff coloré

        ## Templates embarqués

        | Template    | Langage    | Inclus                |
        | ----------- | ---------- | --------------------- |
        | ts-lib      | TypeScript | esbuild, vitest, CI   |
        | rust-cli    | Rust       | clap, release profile |
        | py-notebook | Python     | uv, ruff, pytest      |
      `,
        "Cargo.toml": raw`
        [package]
        name = "forge-cli"
        version = "0.9.2"
        edition = "2021"
        description = "Générateur de projets ultra-rapide avec templates interactifs."
        license = "Apache-2.0"
        repository = "https://github.com/lina-forge/forge-cli"

        [dependencies]
        anyhow = "1"

        [profile.release]
        lto = true
        codegen-units = 1
        strip = true
        panic = "abort"
      `,
        "src/main.rs": raw`
        mod prompt;
        mod templates;

        use std::env;
        use std::process::ExitCode;

        fn main() -> ExitCode {
            let args: Vec<String> = env::args().skip(1).collect();
            match args.first().map(String::as_str) {
                Some("new") => cmd_new(&args[1..]),
                Some("list") => {
                    for t in templates::builtin() {
                        println!("{:<12} {}", t.name, t.description);
                    }
                    ExitCode::SUCCESS
                }
                Some("version") | Some("--version") => {
                    println!("forge {}", env!("CARGO_PKG_VERSION"));
                    ExitCode::SUCCESS
                }
                _ => {
                    eprintln!("usage: forge <new|list|version> [options]");
                    ExitCode::FAILURE
                }
            }
        }

        fn cmd_new(args: &[String]) -> ExitCode {
            let Some(name) = args.first() else {
                eprintln!("forge new <nom> [--template <id>]");
                return ExitCode::FAILURE;
            };
            let tpl = args
                .iter()
                .position(|a| a == "--template")
                .and_then(|i| args.get(i + 1))
                .map(String::as_str)
                .unwrap_or("ts-lib");
            let Some(template) = templates::find(tpl) else {
                eprintln!("template inconnu: {tpl} (essayez forge list)");
                return ExitCode::FAILURE;
            };
            let author = prompt::ask("Auteur", "vous");
            match template.generate(name, &author) {
                Ok(files) => {
                    println!("✓ {files} fichiers générés dans ./{name}");
                    ExitCode::SUCCESS
                }
                Err(e) => {
                    eprintln!("erreur: {e}");
                    ExitCode::FAILURE
                }
            }
        }
      `,
        "src/templates.rs": raw`
        use std::fs;
        use std::path::Path;

        pub struct Template {
            pub name: &'static str,
            pub description: &'static str,
            pub files: &'static [(&'static str, &'static str)],
        }

        const TS_LIB: Template = Template {
            name: "ts-lib",
            description: "Bibliothèque TypeScript (esbuild + vitest)",
            files: &[
                ("package.json", include_str!("../templates/ts-lib/package.json")),
                ("src/index.ts", "export const hello = () => 'world';\n"),
            ],
        };

        pub fn builtin() -> impl Iterator<Item = &'static Template> {
            [TS_LIB].into_iter()
        }

        pub fn find(name: &str) -> Option<&'static Template> {
            builtin().find(|t| t.name == name)
        }

        impl Template {
            pub fn generate(&self, dir: &str, author: &str) -> anyhow::Result<usize> {
                let root = Path::new(dir);
                fs::create_dir_all(root)?;
                for (rel, content) in self.files {
                    let path = root.join(rel);
                    if let Some(parent) = path.parent() {
                        fs::create_dir_all(parent)?;
                    }
                    fs::write(path, content.replace("__AUTHOR__", author))?;
                }
                Ok(self.files.len())
            }
        }
      `,
        "src/prompt.rs": raw`
        use std::io::{self, BufRead, Write};

        /// Pose une question et retourne la réponse (ou la valeur par défaut).
        pub fn ask(question: &str, default: &str) -> String {
            print!("{question} [{default}]: ");
            let _ = io::stdout().flush();
            let mut line = String::new();
            if io::stdin().lock().read_line(&mut line).is_err() {
                return default.to_string();
            }
            let trimmed = line.trim();
            if trimmed.is_empty() {
                default.to_string()
            } else {
                trimmed.to_string()
            }
        }

        pub fn confirm(question: &str) -> bool {
            matches!(
                ask(&format!("{question} (o/N)"), "N").as_str(),
                "o" | "O" | "oui"
            )
        }
      `,
        ".gitignore": raw`
        /target
        Cargo.lock
        *.swp
      `
      }
    },
    {
      meta: {
        name: "dataverve",
        desc: "Visualisation de donn\xE9es d\xE9clarative pour notebooks. Des graphiques SVG \xE9l\xE9gants en trois lignes de Python.",
        stars: 642,
        forks: 52,
        issues: 7,
        sizeKB: 96,
        lang: "Python",
        topics: ["dataviz", "svg", "notebooks", "python"],
        license: "BSD-3-Clause",
        fork: false,
        archived: false,
        created: "2022-04-08",
        pushed: "2026-09-30T11:00:00Z",
        branch: "main"
      },
      langs: { Python: 28110, TOML: 980, Markdown: 2440 },
      files: {
        "README.md": raw`
        # 📊 dataverve

        **Déclaratif · SVG pur · zéro dépendance runtime**

        Des graphiques publication-ready dans vos notebooks, sans navigateur,
        sans JavaScript, sans kernel lourd.

        ~~~python
        from dataverve import Chart

        ch = Chart(title="Ventes 2026", width=640)
        ch.bars(["Jan", "Fév", "Mar", "Avr"], [120, 180, 150, 240])
        ch.save("ventes.svg")
        ~~~

        <details>
        <summary>Pourquoi pas matplotlib ?</summary>

        matplotlib est excellent, mais lourd à installer et à styliser.
        dataverve produit un SVG déterministe de quelques Ko, parfait pour
        les rapports versionnés et les e-mails.

        </details>

        ## Échelles

        - linéaire (défaut)
        - log base 10
        - temporelle (bientôt)
      `,
        "pyproject.toml": raw`
        [project]
        name = "dataverve"
        version = "0.6.0"
        description = "Visualisation de données déclarative pour notebooks."
        requires-python = ">=3.10"
        license = { text = "BSD-3-Clause" }
        authors = [{ name = "Lina Forge" }]

        [project.optional-dependencies]
        dev = ["pytest>=8", "ruff>=0.6"]

        [build-system]
        requires = ["hatchling"]
        build-backend = "hatchling.build"

        [tool.ruff]
        line-length = 88
      `,
        "dataverve/__init__.py": raw`
        """dataverve — visualisation déclarative, SVG pur."""

        from .chart import Chart
        from .scales import linear, log10

        __version__ = "0.6.0"
        __all__ = ["Chart", "linear", "log10"]
      `,
        "dataverve/chart.py": raw`
        """Rendu SVG déclaratif, sans dépendance."""

        from dataclasses import dataclass, field
        from .scales import linear

        PALETTE = ["#7B6CFF", "#FF6B3D", "#2BD4F0", "#34E0A2", "#FFB224", "#F26BB5"]


        @dataclass
        class Chart:
            title: str = ""
            width: int = 640
            height: int = 360
            padding: int = 48
            _body: list = field(default_factory=list)

            def bars(self, labels, values, color=None):
                scale = linear(0, max(values), 0, self.height - 2 * self.padding)
                n = len(values)
                gap = 12
                bw = (self.width - 2 * self.padding - gap * (n - 1)) / n
                for i, (label, v) in enumerate(zip(labels, values)):
                    h = scale(v)
                    x = self.padding + i * (bw + gap)
                    y = self.height - self.padding - h
                    c = color or PALETTE[i % len(PALETTE)]
                    self._body.append(
                        f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw:.1f}" '
                        f'height="{h:.1f}" rx="6" fill="{c}"/>'
                    )
                    self._body.append(
                        f'<text x="{x + bw / 2:.1f}" y="{self.height - 16}" '
                        f'text-anchor="middle" font-size="12" fill="#A6B1D8">{label}</text>'
                    )
                return self

            def svg(self) -> str:
                head = (
                    f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.width}" '
                    f'height="{self.height}" style="background:#0B1122;border-radius:12px">'
                )
                title = (
                    f'<text x="{self.padding}" y="30" font-size="16" '
                    f'font-weight="700" fill="#E8EDFB">{self.title}</text>'
                )
                return head + title + "".join(self._body) + "</svg>"

            def save(self, path: str) -> None:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(self.svg())
      `,
        "dataverve/scales.py": raw`
        """Échelles numériques pures."""

        import math


        def linear(d0, d1, r0, r1):
            """Retourne une fonction d'échelle linéaire domaine -> plage."""
            span = (d1 - d0) or 1.0

            def scale(v):
                return r0 + (v - d0) / span * (r1 - r0)

            return scale


        def log10(d0, d1, r0, r1):
            if d0 <= 0:
                raise ValueError("log10 exige un domaine strictement positif")
            l0, l1 = math.log10(d0), math.log10(d1)
            inner = linear(l0, l1, r0, r1)

            def scale(v):
                return inner(math.log10(max(v, d0)))

            return scale
      `,
        "examples/quickstart.py": raw`
        """Trois lignes pour un graphique."""

        from dataverve import Chart

        ch = Chart(title="Ventes 2026", width=640)
        ch.bars(["Jan", "Fév", "Mar", "Avr"], [120, 180, 150, 240])
        ch.save("ventes.svg")
        print("ventes.svg écrit ✓")
      `,
        "tests/test_scales.py": raw`
        import math

        import pytest

        from dataverve.scales import linear, log10


        def test_linear_bornes():
            s = linear(0, 10, 0, 100)
            assert s(0) == 0
            assert s(10) == 100
            assert s(5) == 50


        def test_linear_domaine_nul():
            s = linear(3, 3, 0, 100)
            assert s(3) == 0


        def test_log10():
            s = log10(1, 1000, 0, 300)
            assert math.isclose(s(10), 100, rel_tol=1e-6)


        def test_log10_domaine_invalide():
            with pytest.raises(ValueError):
                log10(0, 10, 0, 1)
      `
      }
    },
    {
      meta: {
        name: "relay-edge",
        desc: "Passerelle WebSocket edge-ready avec backpressure et diffusion par topics. Un seul binaire Go.",
        stars: 318,
        forks: 27,
        issues: 4,
        sizeKB: 74,
        lang: "Go",
        topics: ["websocket", "go", "edge", "realtime"],
        license: "MIT",
        fork: false,
        archived: false,
        created: "2023-08-15",
        pushed: "2026-08-21T08:15:00Z",
        branch: "main"
      },
      langs: { Go: 19840, Dockerfile: 640, Markdown: 1730 },
      files: {
        "README.md": raw`
        # 📡 relay-edge

        **Un binaire · backpressure · topics · metrics Prometheus**

        Relay diffuse des messages WebSocket à des milliers de clients
        sans jamais bloquer : chaque connexion a une file bornée, les
        clients lents sont déconnectés proprement.

        ~~~bash
        go build -o relay ../relay --addr :8080 --max-clients 50000
        ~~~

        ## Architecture

        - **Hub** : registre des abonnés par topic, verrou par shard
        - **Files bornées** : 256 messages par client, drop-oldest
        - **Health** : /healthz et /metrics prêts pour le load balancer
      `,
        "go.mod": raw`
        module github.com/lina-forge/relay-edge

        go 1.23

        require nhooyr.io/websocket v1.8.11
      `,
        "main.go": raw`
        package main

        import (
        	"flag"
        	"log"
        	"net/http"
        	"time"
        )

        func main() {
        	addr := flag.String("addr", ":8080", "adresse d'écoute")
        	maxClients := flag.Int("max-clients", 50000, "clients simultanés max")
        	flag.Parse()

        	hub := NewHub(*maxClients)
        	go hub.Run()

        	mux := http.NewServeMux()
        	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
        		topic := r.URL.Query().Get("topic")
        		if topic == "" {
        			http.Error(w, "topic requis", http.StatusBadRequest)
        			return
        		}
        		hub.ServeWS(w, r, topic)
        	})
        	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
        		w.WriteHeader(http.StatusOK)
        		w.Write([]byte("ok"))
        	})

        	srv := &http.Server{
        		Addr:         *addr,
        		Handler:      mux,
        		ReadTimeout:  10 * time.Second,
        		WriteTimeout: 10 * time.Second,
        	}
        	log.Printf("relay-edge en écoute sur %s", *addr)
        	log.Fatal(srv.ListenAndServe())
        }
      `,
        "hub.go": raw`
        package main

        import (
        	"log"
        	"net/http"
        	"sync"

        	"nhooyr.io/websocket"
        )

        type client struct {
        	send chan []byte
        }

        // Hub registre les abonnés par topic. Les clients lents sont éjectés.
        type Hub struct {
        	mu     sync.RWMutex
        	topics map[string]map[*client]struct{}
        	max    int
        	count  int
        }

        func NewHub(max int) *Hub {
        	return &Hub{topics: make(map[string]map[*client]struct{}), max: max}
        }

        func (h *Hub) Run() {} // boucle de metrics à venir

        func (h *Hub) subscribe(topic string, c *client) bool {
        	h.mu.Lock()
        	defer h.mu.Unlock()
        	if h.count >= h.max {
        		return false
        	}
        	if h.topics[topic] == nil {
        		h.topics[topic] = make(map[*client]struct{})
        	}
        	h.topics[topic][c] = struct{}{}
        	h.count++
        	return true
        }

        func (h *Hub) Broadcast(topic string, msg []byte) {
        	h.mu.RLock()
        	defer h.mu.RUnlock()
        	for c := range h.topics[topic] {
        		select {
        		case c.send <- msg:
        		default: // file pleine : client trop lent
        			close(c.send)
        			delete(h.topics[topic], c)
        		}
        	}
        }

        func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request, topic string) {
        	conn, err := websocket.Accept(w, r, nil)
        	if err != nil {
        		log.Printf("accept: %v", err)
        		return
        	}
        	defer conn.Close(websocket.StatusNormalClosure, "bye")

        	c := &client{send: make(chan []byte, 256)}
        	if !h.subscribe(topic, c) {
        		conn.Close(websocket.StatusPolicyViolation, "plein")
        		return
        	}
        	for msg := range c.send {
        		if err := conn.Write(r.Context(), websocket.MessageText, msg); err != nil {
        			return
        		}
        	}
        }
      `,
        Dockerfile: raw`
        FROM golang:1.23-alpine AS build

        WORKDIR /src
        COPY . .
        RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /relay .

        FROM gcr.io/distroless/static-debian12

        COPY --from=build /relay /relay
        EXPOSE 8080
        ENTRYPOINT ["/relay"]
      `,
        ".gitignore": raw`
        relay
        *.test
        coverage.out
      `
      }
    },
    {
      meta: {
        name: "chroma-forge",
        desc: "G\xE9n\xE9rateur de palettes perceptuelles OKLCH pour designers. Export CSS, Tailwind et Figma tokens.",
        stars: 154,
        forks: 12,
        issues: 3,
        sizeKB: 58,
        lang: "Svelte",
        topics: ["oklch", "color", "design-tools", "svelte"],
        license: "MIT",
        fork: false,
        archived: false,
        created: "2024-03-04",
        pushed: "2026-11-10T16:45:00Z",
        branch: "main"
      },
      langs: { Svelte: 14210, JavaScript: 8340, CSS: 3120, HTML: 890 },
      files: {
        "README.md": raw`
        # 🎨 chroma-forge

        Des palettes **perceptuellement uniformes** grâce à OKLCH.
        Choisissez une teinte, chroma-forge dérive 11 luminosités garanties
        lisibles, puis exporte vers CSS, Tailwind ou tokens Figma.

        ## Pourquoi OKLCH ?

        En HSL, un jaune à 50 % de luminosité paraît bien plus clair
        qu'un bleu à 50 %. OKLCH corrige ça : la luminosité est perçue,
        pas calculée. Vos échelles de gris colorés restent homogènes.

        ~~~js
        import { makePalette } from './src/lib/oklch.js';

        const blue = makePalette(255); // teinte 255°
        blue[500].css // 'oklch(0.55 0.18 255)'
        ~~~
      `,
        "package.json": raw`
        {
          "name": "chroma-forge",
          "version": "1.2.0",
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "vite build"
          },
          "devDependencies": {
            "@sveltejs/vite-plugin-svelte": "^4.0.0",
            "svelte": "^5.0.0",
            "vite": "^6.0.0"
          }
        }
      `,
        "src/App.svelte": raw`
        @@STARTSCRIPT@@>
          import { makePalette } from './lib/oklch.js';

          let hue = 262;
          let chroma = 0.16;

          $: palette = makePalette(hue, chroma);
          $: css = palette.map(c => '--brand-' + c.step + ': ' + c.css + ';').join('\n');

          function copy() {
            navigator.clipboard.writeText(':root {\n' + css + '\n}');
          }
        @@ENDSCRIPT@@

        <main>
          <h1>chroma-forge</h1>

          <label>
            Teinte <input type="range" min="0" max="360" bind:value={hue} />
            <output>{hue}°</output>
          </label>

          <label>
            Chroma <input type="range" min="0.02" max="0.32" step="0.01" bind:value={chroma} />
          </label>

          <div class="swatches">
            {#each palette as c}
              <button class="swatch" style="background:{c.css}" title={c.css}>
                <span>{c.step}</span>
              </button>
            {/each}
          </div>

          <button class="export" on:click={copy}>Exporter :root CSS</button>
        </main>
      `,
        "src/lib/oklch.js": raw`
        // Conversion OKLCH -> sRGB (approximation Björn Ottosson).

        const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
        const L = [0.97, 0.93, 0.87, 0.79, 0.68, 0.55, 0.47, 0.39, 0.31, 0.24, 0.17];

        export function makePalette(hue, chroma = 0.16) {
          return STEPS.map((step, i) => ({
            step,
            l: L[i],
            css: 'oklch(' + L[i] + ' ' + chroma + ' ' + hue + ')',
          }));
        }

        export function oklchToSrgb(l, c, h) {
          const hr = (h * Math.PI) / 180;
          const a = c * Math.cos(hr);
          const b = c * Math.sin(hr);
          const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
          const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
          const s_ = l - 0.0894841775 * a - 1.291485548 * b;
          const lc = l_ ** 3, mc = m_ ** 3, sc = s_ ** 3;
          const r = +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
          const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
          const bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc;
          const gam = (x) => {
            x = Math.min(1, Math.max(0, x));
            return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
          };
          return [gam(r), gam(g), gam(bl)].map((v) => Math.round(v * 255));
        }
      `,
        "src/app.css": raw`
        main { max-width: 720px; margin: 40px auto; font-family: system-ui; }

        h1 { letter-spacing: -0.02em; }

        label { display: flex; gap: 12px; align-items: center; margin: 14px 0; }

        input[type="range"] { flex: 1; accent-color: #7B6CFF; }

        .swatches {
          display: grid;
          grid-template-columns: repeat(11, 1fr);
          gap: 6px;
          margin: 20px 0;
        }

        .swatch { aspect-ratio: 1; border: 0; border-radius: 10px; cursor: pointer; }

        .swatch span {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.8);
          mix-blend-mode: difference;
        }

        .export {
          padding: 10px 18px;
          border-radius: 10px;
          border: 1px solid #31427A;
          background: #101830;
          color: #E8EDFB;
          cursor: pointer;
        }
      `,
        "index.html": raw`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>chroma-forge</title>
          <link rel="stylesheet" href="/src/app.css">
        </head>
        <body>
          <div id="app"></div>
          @@STARTSCRIPT@@ type="module" src="/src/main.js">@@ENDSCRIPT@@
        </body>
        </html>
      `
      }
    },
    {
      meta: {
        name: "commitlog",
        desc: "Historique de commits lisible pour vos releases. Parse les conventional commits et g\xE9n\xE8re un changelog.",
        stars: 112,
        forks: 9,
        issues: 2,
        sizeKB: 44,
        lang: "Vue",
        topics: ["changelog", "conventional-commits", "vue", "release"],
        license: "MIT",
        fork: false,
        archived: false,
        created: "2024-07-22",
        pushed: "2026-07-14T10:20:00Z",
        branch: "main"
      },
      langs: { Vue: 11230, JavaScript: 6110, CSS: 1830 },
      files: {
        "README.md": raw`
        # 📜 commitlog

        Transformez un historique git brut en changelog lisible.
        commitlog comprend les **conventional commits** et regroupe
        feat / fix / perf par version.

        ~~~bash
        git log --oneline v1.2.0..HEAD | npx commitlog
        ~~~

        ## Types reconnus

        feat → ✨ Nouveautés · fix → 🐛 Correctifs · perf → ⚡ Performance
        docs → 📖 Documentation · refactor → 🔨 Refactorisation
      `,
        "package.json": raw`
        {
          "name": "commitlog",
          "version": "0.4.0",
          "type": "module",
          "bin": { "commitlog": "cli.js" },
          "scripts": { "dev": "vite", "test": "node --test" },
          "devDependencies": { "vite": "^6.0.0", "vue": "^3.5.0" }
        }
      `,
        "src/App.vue": raw`
        <template>
          <main class="log">
            <h1>commitlog</h1>
            <textarea v-model="raw" placeholder="Collez un git log --oneline…"></textarea>

            <section v-for="(group, type) in grouped" :key="type">
              <h2>{{ labels[type] || type }}</h2>
              <ul>
                <li v-for="c in group" :key="c.sha">
                  <code>{{ c.sha }}</code> {{ c.subject }}
                  <strong v-if="c.breaking">BREAKING</strong>
                </li>
              </ul>
            </section>
          </main>
        </template>

        @@STARTSCRIPT@@>
        import { parseLine } from './parse.js';

        export default {
          data() {
            return {
              raw: '',
              labels: {
                feat: '✨ Nouveautés',
                fix: '🐛 Correctifs',
                perf: '⚡ Performance',
              },
            };
          },
          computed: {
            grouped() {
              const out = {};
              for (const line of this.raw.split('\n')) {
                const c = parseLine(line);
                if (!c) continue;
                (out[c.type] ||= []).push(c);
              }
              return out;
            },
          },
        };
        @@ENDSCRIPT@@
      `,
        "src/parse.js": raw`
        // Parseur de conventional commits.

        const RE = /^(?:([0-9a-f]{7,40})\s+)?(feat|fix|docs|refactor|perf|test|chore|build|ci)(\([^)]*\))?(!)?:\s(.+)$/;

        export function parseLine(line) {
          const m = line.trim().match(RE);
          if (!m) return null;
          return {
            sha: m[1] || '',
            type: m[2],
            scope: m[3] ? m[3].slice(1, -1) : null,
            breaking: Boolean(m[4]) || m[5].includes('BREAKING CHANGE'),
            subject: m[5],
          };
        }

        export function group(commits) {
          const out = new Map();
          for (const c of commits) {
            if (!out.has(c.type)) out.set(c.type, []);
            out.get(c.type).push(c);
          }
          return out;
        }
      `,
        "src/style.css": raw`
        .log { max-width: 760px; margin: 32px auto; font-family: system-ui; }

        textarea {
          width: 100%;
          min-height: 140px;
          font-family: monospace;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #31427A;
          background: #0B1122;
          color: #E8EDFB;
        }

        h2 { margin-top: 24px; font-size: 16px; }

        code { background: #162040; padding: 2px 6px; border-radius: 6px; font-size: 12px; }

        strong { color: #FF4D6D; margin-left: 8px; font-size: 11px; }
      `
      }
    },
    {
      meta: {
        name: "kernel-notes",
        desc: "Notes publiques sur les syst\xE8mes, le rendu graphique et la performance. Apprendre en public, une note \xE0 la fois.",
        stars: 96,
        forks: 14,
        issues: 0,
        sizeKB: 32,
        lang: "Markdown",
        topics: ["notes", "systems", "graphics", "performance"],
        license: "CC-BY-4.0",
        fork: false,
        archived: false,
        created: "2021-11-30",
        pushed: "2026-06-18T19:00:00Z",
        branch: "main"
      },
      langs: { Markdown: 15210 },
      files: {
        "README.md": raw`
        # 📓 kernel-notes

        Mes notes publiques, écrites pour être relues dans six mois
        par quelqu'un qui a tout oublié — c'est-à-dire moi.

        ## Index

        1. [Le pipeline de rendu](notes/render-pipeline.md)
        2. [Allocateurs à arènes](notes/memory-arenas.md)
        3. [SIMD sans pleurer](notes/simd.md)
        4. [Rendu GPU-driven](notes/gpu-driven.md)

        > Écrire, c'est debugger sa propre compréhension.
      `,
        "notes/render-pipeline.md": raw`
        # Le pipeline de rendu, en une page

        ## Les étapes qui comptent

        1. **Culling** — ne pas dessiner ce qu'on ne voit pas (frustum, occlusion)
        2. **Batching** — regrouper par état GPU, pas par objet
        3. **Depth pre-pass** — payer le surcoût de profondeur une fois, économiser le shading
        4. **Shading** — le budget réel : chaque instruction se paie × pixels

        ## Règle des 3 B

        - **Bound CPU ?** Réduire les draw calls.
        - **Bound GPU vertex ?** Réduire la géométrie (LOD, meshlets).
        - **Bound GPU pixel ?** Réduire la résolution ou le coût du shader.

        ~~~text
        frame = cull -> batch -> depth -> shade -> post
        budget 16.6 ms : 2 / 1 / 2 / 8 / 3
        ~~~

        Le profileur d'abord. L'intuition ensuite. Jamais l'inverse.
      `,
        "notes/memory-arenas.md": raw`
        # Allocateurs à arènes

        ## L'idée

        Allouer = incrémenter un pointeur. Libérer = remettre le pointeur à zéro.
        Toute la complexité de malloc disparaît quand la durée de vie est **par frame**.

        ~~~c
        typedef struct { uint8_t* base; size_t used, cap; } Arena;

        void* arena_alloc(Arena* a, size_t n) {
          n = (n + 15) & ~(size_t)15;         // alignement 16
          if (a->used + n > a->cap) return 0; // pas de fallback : c'est un bug
          void* p = a->base + a->used;
          a->used += n;
          return p;
        }
        ~~~

        ## Quand ne PAS utiliser une arène

        - Objets à durée de vie imprévisible (connexions réseau)
        - Structures qui survivent au reset (utiliser une pool dédiée)

        Mesuré sur orbital : **0 allocation frame**, fragmentation nulle,
        et le profileur montre enfin le vrai travail.
      `,
        "notes/simd.md": raw`
        # SIMD sans pleurer

        ## Le contrat

        - Données **contiguës** et **alignées** (SoA, pas AoS)
        - Pas de branchement par voie : calculer les deux, masquer ensuite
        - Le compilateur auto-vectorise si vous l'aidez : restrict, aliasing clair

        ## Ordre de bataille

        1. Mesurer le scalaire propre
        2. Laisser -O3 vectoriser, vérifier le rapport
        3. Intrinsèques seulement pour les 5 % qui restent

        > Le SIMD le plus rapide est celui qu'on n'écrit pas.

        Voir tinyvec pour un exemple complet SSE2 + fallback.
      `,
        "notes/gpu-driven.md": raw`
        # Rendu GPU-driven

        ## Le déplacement du cerveau

        Le CPU prépare des **listes d'instances**, le GPU décide quoi dessiner.
        Draw indirect + compute culling = des millions d'objets sans goulot CPU.

        ~~~text
        CPU: upload instances (1 fois)
        GPU: compute cull -> append visible -> draw indirect
        ~~~

        ## Pièges classiques

        - Oublier les barrières : le draw lit le buffer avant la fin du compute
        - Compteurs non réinitialisés entre frames
        - Tri par profondeur fait sur CPU (ne pas !)

        Étape suivante : mesh shaders, quand le matériel de mes lecteurs suivra.
      `
      }
    },
    {
      meta: {
        name: "nova-deploy",
        desc: "Scripts de d\xE9ploiement blue-green sans downtime. Bascule nginx atomique, healthchecks et rollback en 10 s.",
        stars: 47,
        forks: 6,
        issues: 1,
        sizeKB: 18,
        lang: "Shell",
        topics: ["deployment", "blue-green", "nginx", "devops"],
        license: "MIT",
        fork: false,
        archived: false,
        created: "2022-01-12",
        pushed: "2026-05-02T09:00:00Z",
        branch: "main"
      },
      langs: { Shell: 8120, Markdown: 1610 },
      files: {
        "README.md": raw`
        # 🚀 nova-deploy

        Déploiement **blue-green** sans downtime, avec trois scripts bash
        et un nginx. Pas d'orchestrateur, pas de YAML magique.

        ~~~bash
        ./deploy.sh mon-app v1.8.2
        # ✓ build, ✓ healthcheck, ✓ bascule, ✓ ancien slot gardé 10 min.
        ./rollback.sh mon-app   # retour au slot précédent en 10 s
        ~~~

        ## Garanties

        - Bascule atomique via symlink + nginx -s reload
        - Aucun trafic sur un slot non vérifié
        - Rollback testé à chaque déploiement (dry-run)
      `,
        "deploy.sh": raw`
        #!/usr/bin/env bash
        # Déploiement blue-green atomique.

        set -euo pipefail

        APP=$1
        VERSION=$2
        ROOT=/srv/$APP
        GREEN=$(tput setaf 2); RED=$(tput setaf 1); RESET=$(tput sgr0)

        if [ $# -lt 2 ]; then
          echo "usage: deploy.sh <app> <version>" >&2
          exit 1
        fi

        CURRENT=$(readlink "$ROOT/live" || echo "$ROOT/slots/blue")
        if [ "$CURRENT" = "$ROOT/slots/blue" ]; then
          TARGET="$ROOT/slots/green"; PORT=8082
        else
          TARGET="$ROOT/slots/blue"; PORT=8081
        fi

        echo "→ préparation du slot $TARGET"
        mkdir -p "$TARGET"
        tar -xzf "$ROOT/releases/$APP-$VERSION.tar.gz" -C "$TARGET"

        echo "→ démarrage sur le port $PORT"
        (cd "$TARGET" && PORT=$PORT nohup ./server > "$ROOT/server.log" 2>&1 &)

        echo "→ healthcheck…"
        for i in 1 2 3 4 5 6 7 8 9 10; do
          if curl -fsS "http://127.0.0.1:$PORT/healthz" > /dev/null; then
            ln -sfn "$TARGET" "$ROOT/live"
            nginx -s reload
            echo "✓ bascule effectuée vers $VERSION"
            exit 0
          fi
          sleep 1
        done

        echo "✗ healthcheck échoué — slot abandonné, trafic inchangé"
        exit 1
      `,
        "rollback.sh": raw`
        #!/usr/bin/env bash

        set -euo pipefail

        APP=$1
        ROOT=/srv/$APP
        PREVIOUS=$(cat "$ROOT/previous")

        echo "→ rollback vers $PREVIOUS"
        ln -sfn "$PREVIOUS" "$ROOT/live"
        nginx -s reload
        curl -fsS http://127.0.0.1/healthz > /dev/null
        echo "✓ rollback terminé"
      `,
        "healthcheck.sh": raw`
        #!/usr/bin/env bash
        # Vérifie les deux slots et l'actif.

        set -euo pipefail

        for PORT in 8081 8082; do
          if curl -fsS --max-time 2 "http://127.0.0.1:$PORT/healthz" > /dev/null; then
            echo "slot $PORT : OK"
          else
            echo "slot $PORT : injoignable"
          fi
        done

        echo "live -> $(readlink /srv/$1/live)"
      `,
        "nginx/upstream.conf": raw`
        # L'upstream pointe vers le symlink "live" : bascule atomique.

        upstream app_backend {
          server 127.0.0.1:8081 max_fails=2 fail_timeout=5s;
          server 127.0.0.1:8082 backup;
        }

        server {
          listen 80;
          location / {
            proxy_pass http://app_backend;
            proxy_next_upstream error timeout http_502;
            proxy_connect_timeout 2s;
          }
        }
      `
      }
    },
    {
      meta: {
        name: "pulse-ui-examples",
        desc: "Exemples officiels et recettes communautaires pour pulse-ui (fork maintenu par Lina).",
        stars: 23,
        forks: 5,
        issues: 0,
        sizeKB: 26,
        lang: "JavaScript",
        topics: ["examples", "pulse-ui"],
        license: "MIT",
        fork: true,
        archived: false,
        created: "2023-05-16",
        pushed: "2026-04-11T13:30:00Z",
        branch: "main"
      },
      langs: { JavaScript: 5230, HTML: 4110 },
      files: {
        "README.md": raw`
        # pulse-ui-examples

        Fork communautaire des exemples pulse-ui, maintenu à jour
        avec chaque version mineure.

        - **basic/** — un bouton, un thème, zéro build
        - **dashboard/** — tabs + dialog + tokens sombres

        ~~~bash
        npx serve .
        ~~~
      `,
        "basic/index.html": raw`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>pulse-ui — basic</title>
          @@STARTSCRIPT@@ type="module" src="https://unpkg.com/@lina-forge/pulse-ui">@@ENDSCRIPT@@
          <style>
            body { font-family: system-ui; padding: 40px; background: #0B1122; color: #E8EDFB; }
          </style>
        </head>
        <body>
          <h1>Hello pulse</h1>
          <pulse-button>Valider</pulse-button>
          <pulse-button variant="ghost">Annuler</pulse-button>
        </body>
        </html>
      `,
        "dashboard/index.html": raw`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>pulse-ui — dashboard</title>
          @@STARTSCRIPT@@ type="module" src="https://unpkg.com/@lina-forge/pulse-ui">@@ENDSCRIPT@@
          <style>
            :root { --pulse-accent: #FF6B3D; --pulse-radius: 12px; }
            body { font-family: system-ui; margin: 0; background: #070B16; color: #E8EDFB; }
            main { max-width: 960px; margin: 32px auto; }
          </style>
        </head>
        <body>
          <main>
            <pulse-tabs>
              <button slot="tab">Vue d'ensemble</button>
              <button slot="tab">Alertes</button>
              <section slot="panel">Graphiques ici…</section>
              <section slot="panel">Rien à signaler ✓</section>
            </pulse-tabs>
          </main>
        </body>
        </html>
      `,
        "package.json": raw`
        {
          "name": "pulse-ui-examples",
          "private": true,
          "scripts": { "start": "npx serve ." }
        }
      `
      }
    },
    {
      meta: {
        name: "sandbox-2019",
        desc: "Vieux bacs \xE0 sable d'exp\xE9riences canvas de 2019. Conserv\xE9 pour la post\xE9rit\xE9 et la nostalgie.",
        stars: 8,
        forks: 2,
        issues: 0,
        sizeKB: 22,
        lang: "JavaScript",
        topics: ["archive", "canvas", "experiments"],
        license: null,
        fork: false,
        archived: true,
        created: "2019-08-03",
        pushed: "2019-12-27T22:10:00Z",
        branch: "master"
      },
      langs: { JavaScript: 7810, HTML: 1240 },
      files: {
        "README.md": raw`
        # 🗃️ sandbox-2019

        **Archivé** — mes premières expériences canvas, telles quelles.
        Le code est daté, les souvenirs sont excellents.

        - fireworks.js — feux d'artifice du 14 juillet
        - noise.js — champ de bruit value-noise fait main

        Ne pas utiliser en production. Vraiment.
      `,
        "fireworks.js": raw`
        // feu d'artifice naïf — juillet 2019

        var canvas = document.getElementById('c');
        var ctx = canvas.getContext('2d');
        var sparks = [];

        function burst(x, y) {
          for (var i = 0; i < 80; i++) {
            var a = Math.random() * Math.PI * 2;
            var s = 1 + Math.random() * 4;
            sparks.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 60 });
          }
        }

        canvas.onclick = function (e) {
          burst(e.clientX, e.clientY);
        };

        setInterval(function () {
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          for (var i = sparks.length - 1; i >= 0; i--) {
            var p = sparks[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.life--;
            if (p.life <= 0) {
              sparks.splice(i, 1);
              continue;
            }
            ctx.fillStyle = 'hsl(' + (p.life * 6) + ',90%,60%)';
            ctx.fillRect(p.x, p.y, 2, 2);
          }
        }, 16);
      `,
        "noise.js": raw`
        // value noise artisanal (2019) — lent mais joli

        function hash(x, y) {
          var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
          return n - Math.floor(n);
        }

        function smooth(t) {
          return t * t * (3 - 2 * t);
        }

        function noise(x, y) {
          var xi = Math.floor(x), yi = Math.floor(y);
          var xf = x - xi, yf = y - yi;
          var a = hash(xi, yi), b = hash(xi + 1, yi);
          var c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
          var u = smooth(xf), v = smooth(yf);
          return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
        }
      `,
        "index.html": raw`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>sandbox 2019</title>
        </head>
        <body style="margin:0;background:#000">
          <canvas id="c" width="800" height="600"></canvas>
          @@STARTSCRIPT@@ src="fireworks.js">@@ENDSCRIPT@@
        </body>
        </html>
      `
      }
    }
  ];
  (function finishDemo() {
    const now = Date.now();
    DEMO_REPOS.forEach((r, idx) => {
      const m = r.meta;
      for (const k in r.files) {
        r.files[k] = r.files[k].split("@@STARTSCRIPT@@").join("<script").split("@@ENDSCRIPT@@").join("<\/script>");
      }
      m.pl = "demo";
      m.id = 1e3 + idx;
      m.full = "lina-forge/" + m.name;
      m.owner = "lina-forge";
      m.ownerAvatar = DEMO_USER.avatar;
      m.created = m.created + "T08:00:00Z";
      m.updated = m.pushed;
      m.watchers = null;
      m.url = null;
      m.clone = "https://github.com/lina-forge/" + m.name + ".git";
      m.home = null;
      m.langs = r.langs;
      r.tree = Object.keys(r.files).map((p) => ({
        path: p,
        type: "blob",
        size: new Blob([r.files[p]]).size
      }));
    });
  })();
  var DEMO_MSGS = {
    "pulse-ui": [
      "feat(tabs): navigation clavier compl\xE8te (fl\xE8ches + Home/End)",
      "fix(button): focus visible restaur\xE9 sur Safari 18",
      "perf: shadow templates clon\xE9s une seule fois",
      "docs: guide de theming par tokens",
      "test: couverture a11y des roles ARIA",
      "chore: esbuild 0.24, vitest 2.1"
    ],
    tinyvec: [
      "perf: dot product SSE2 avec shuffle unique",
      "feat: cross product et quaternions de base",
      "fix: alignement 16 octets sur MSVC",
      "bench: harness chrono steady_clock",
      "test: fallback scalaire bit-\xE0-bit",
      "docs: tableau de bench Ryzen actualis\xE9"
    ],
    orbital: [
      "feat: preset vortex avec attraction amortie",
      "perf: swap-and-pop sans allocation par frame",
      "fix: dpr plafonn\xE9 \xE0 2 sur \xE9crans 3x",
      "feat: tra\xEEnes par fillRect semi-transparent",
      "docs: d\xE9mo plein \xE9cran",
      "refactor: pool Float32Array unique"
    ],
    "forge-cli": [
      "feat: templates distants via git clone --depth 1",
      "fix: prompt par d\xE9faut sur stdin non-tty",
      "perf: d\xE9marrage 8 ms (strip + lto)",
      "feat: hooks post-g\xE9n\xE9ration",
      "docs: roadmap registre communautaire",
      "test: g\xE9n\xE9ration sur arborescence profonde"
    ],
    dataverve: [
      "feat: \xE9chelle log10 avec garde-fous",
      "fix: arrondi SVG d\xE9terministe entre plateformes",
      "feat: palette par d\xE9faut accessible",
      "docs: quickstart trois lignes",
      "test: bornes des \xE9chelles lin\xE9aires",
      "chore: ruff 0.6, hatchling"
    ],
    "relay-edge": [
      "feat: files born\xE9es drop-oldest par client",
      "fix: fermeture propre des clients lents",
      "feat: endpoint /healthz",
      "perf: verrous par shard de topics",
      "docs: architecture du hub",
      "chore: go 1.23, websocket 1.8.11"
    ],
    "chroma-forge": [
      "feat: export :root CSS en un clic",
      "feat: curseur de chroma 0.02 \u2192 0.32",
      "fix: gamut mapping sRGB clamp\xE9",
      "docs: pourquoi OKLCH plut\xF4t que HSL",
      "refactor: conversion Ottosson isol\xE9e",
      "chore: svelte 5, vite 6"
    ],
    commitlog: [
      "feat: d\xE9tection BREAKING CHANGE",
      "fix: scope optionnel dans la regex",
      "feat: regroupement par type avec emojis",
      "docs: types reconnus",
      "test: parseur sur 200 messages r\xE9els",
      "chore: node --test natif"
    ],
    "kernel-notes": [
      "note: rendu GPU-driven et mesh shaders",
      "note: allocateurs \xE0 ar\xE8nes, mesures orbital",
      "note: SIMD sans pleurer",
      "note: pipeline de rendu en une page",
      "fix: coquilles et liens internes",
      "docs: index des notes"
    ],
    "nova-deploy": [
      "feat: rollback test\xE9 en dry-run",
      "fix: healthcheck avec max-time 2s",
      "feat: bascule atomique par symlink",
      "docs: garanties sans downtime",
      "refactor: ports par slot constants",
      "fix: nginx backup upstream"
    ],
    "pulse-ui-examples": [
      "feat: exemple dashboard tabs + dialog",
      "fix: version unpkg \xE9pingl\xE9e",
      "docs: recettes communautaires",
      "chore: sync pulse-ui 2.4",
      "feat: th\xE8me sombre par tokens",
      "docs: npx serve ."
    ],
    "sandbox-2019": [
      "archive: derni\xE8re sauvegarde 2019",
      "feat: value noise fait main",
      "feat: feux d artifice click burst",
      "fix: splice en boucle inverse",
      "docs: avertissement production",
      "init: premiers essais canvas"
    ]
  };
  var DEMO_PEOPLE = [
    ["Lina Forge", DEMO_USER.avatar],
    ["Marc Dubois", initialsAvatar("Marc Dubois")],
    ["Awa Ndiaye", initialsAvatar("Awa Ndiaye")]
  ];
  function demoCommits(r) {
    if (r._commits) return r._commits;
    const rnd = mulberry32(hashStr(r.meta.name));
    const msgs = DEMO_MSGS[r.meta.name] || DEMO_MSGS["pulse-ui"];
    let t = new Date(r.meta.pushed).getTime();
    const out = msgs.slice(0, 7).map((msg, i) => {
      const who = rnd() < 0.72 ? DEMO_PEOPLE[0] : DEMO_PEOPLE[1 + Math.floor(rnd() * 2)];
      const sha = Array.from(
        { length: 40 },
        () => "0123456789abcdef"[Math.floor(rnd() * 16)]
      ).join("");
      const c = {
        sha,
        msg,
        author: who[0],
        avatar: who[1],
        date: new Date(t).toISOString(),
        url: null
      };
      t -= (2 + Math.floor(rnd() * 8)) * 864e5;
      return c;
    });
    r._commits = out;
    return out;
  }

  // js/rate.js
  function updateRatePill(pl) {
    const dot = $("rateDot"), txt = $("rateTxt"), btn = $("tokenBtn");
    btn.classList.toggle("tok-on", hasToken(pl));
    if (pl === "demo") {
      dot.className = "rdot demo";
      txt.textContent = "D\xE9mo \xB7 hors-ligne";
      return;
    }
    if (pl === "gitlab") {
      dot.className = "rdot gl";
      txt.textContent = "API GitLab" + (hasToken("gitlab") ? " \xB7 jeton" : "");
      return;
    }
    const r = S.rate;
    if (r.remaining == null) {
      dot.className = "rdot";
      txt.textContent = "API GitHub" + (hasToken("github") ? " \xB7 jeton" : "");
      return;
    }
    dot.className = "rdot " + (r.remaining > 20 ? "" : r.remaining > 5 ? "warn" : "low");
    txt.textContent = "API " + r.remaining + "/" + r.limit;
  }

  // js/api.js
  function err(type, extra) {
    return Object.assign(new Error(type), { type }, extra || {});
  }
  function captureRate(h) {
    const rem = h.get("x-ratelimit-remaining"), lim = h.get("x-ratelimit-limit"), res = h.get("x-ratelimit-reset");
    if (rem != null) {
      S.rate = { limit: +lim || 60, remaining: +rem, reset: res ? +res : null };
      updateRatePill("github");
    }
  }
  function ghHeaders(extra = {}) {
    const h = { ...extra };
    const t = authToken("github");
    if (t) h.Authorization = "Bearer " + t;
    return h;
  }
  function glHeaders(extra = {}) {
    const h = { ...extra };
    const t = authToken("gitlab");
    if (t) h["PRIVATE-TOKEN"] = t;
    return h;
  }
  async function ghFetch(path, opts = {}) {
    const url = path.startsWith("http") ? path : "https://api.github.com" + path;
    const headers = ghHeaders({
      Accept: opts.accept || "application/vnd.github+json"
    });
    let res;
    try {
      res = await fetch(url, { headers });
    } catch (e) {
      throw err("network");
    }
    captureRate(res.headers);
    if (res.status === 404) throw err("notfound");
    if ((res.status === 403 || res.status === 429) && (S.rate.remaining === 0 || res.headers.get("x-ratelimit-remaining") === "0")) {
      throw err("rate", {
        reset: S.rate.reset || +(res.headers.get("retry-after") || 0)
      });
    }
    if (!res.ok) throw err("http", { status: res.status });
    return opts.text ? res.text() : res.json();
  }
  async function glFetch(path, opts = {}) {
    const url = path.startsWith("http") ? path : "https://gitlab.com/api/v4" + path;
    let res;
    try {
      res = await fetch(url, { headers: glHeaders() });
    } catch (e) {
      throw err("network");
    }
    if (res.status === 404) throw err("notfound");
    if (res.status === 429)
      throw err("rate", { reset: Math.floor(Date.now() / 1e3) + 60 });
    if (!res.ok) throw err("http", { status: res.status });
    return opts.text ? res.text() : res.json();
  }
  async function authLogin(pl) {
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
  async function isOwnProfile(pl, login) {
    const me = await authLogin(pl);
    return !!me && me === String(login || "").toLowerCase();
  }
  async function rawText(url) {
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
  var encPath = (p) => p.split("/").map(encodeURIComponent).join("/");
  function ghFileText(repo, path) {
    return ghFetch(
      "/repos/" + repo.full + "/contents/" + encPath(path) + "?ref=" + encodeURIComponent(repo.branch),
      { accept: "application/vnd.github.raw+json", text: true }
    );
  }
  function glFileText(repo, path) {
    return glFetch(
      "/projects/" + repo.id + "/repository/files/" + encodeURIComponent(path) + "/raw?ref=" + encodeURIComponent(repo.branch),
      { text: true }
    );
  }
  function fileText(repo, path) {
    if (repo.pl === "github") return ghFileText(repo, path);
    if (repo.pl === "gitlab") return glFileText(repo, path);
    return null;
  }
  async function ghFileBlob(repo, path) {
    const res = await fetch(
      "https://api.github.com/repos/" + repo.full + "/contents/" + encPath(path) + "?ref=" + encodeURIComponent(repo.branch),
      {
        headers: ghHeaders({ Accept: "application/vnd.github.raw+json" })
      }
    );
    if (!res.ok) throw err("http", { status: res.status });
    return res.blob();
  }
  async function glFileBlob(repo, path) {
    const res = await fetch(
      "https://gitlab.com/api/v4/projects/" + repo.id + "/repository/files/" + encodeURIComponent(path) + "/raw?ref=" + encodeURIComponent(repo.branch),
      { headers: glHeaders() }
    );
    if (!res.ok) throw err("http", { status: res.status });
    return res.blob();
  }
  function fileBlob(repo, path) {
    if (repo.pl === "github") return ghFileBlob(repo, path);
    if (repo.pl === "gitlab") return glFileBlob(repo, path);
    return null;
  }
  async function fileDataUrl(repo, path) {
    const b = await fileBlob(repo, path);
    return b ? blobToDataURL(b) : rawUrl(repo, path);
  }
  function useAuthFiles(repo) {
    return !!repo && repo.pl !== "demo" && !!authToken(repo.pl);
  }
  function rawUrl(repo, path) {
    if (repo.pl === "demo") {
      const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
      const c = r && r.files[path];
      if (c != null && extOf(path) === "svg")
        return "data:image/svg+xml;utf8," + encodeURIComponent(c);
      return null;
    }
    if (repo.pl === "github")
      return "https://raw.githubusercontent.com/" + repo.full + "/" + repo.branch + "/" + encPath(path);
    return "https://gitlab.com/" + repo.full + "/-/raw/" + repo.branch + "/" + encPath(path);
  }
  function blobUrl(repo, path) {
    if (repo.pl === "demo") return null;
    if (repo.pl === "github")
      return "https://github.com/" + repo.full + "/blob/" + repo.branch + "/" + encPath(path);
    return "https://gitlab.com/" + repo.full + "/-/blob/" + repo.branch + "/" + encPath(path);
  }
  function treeUrl(repo) {
    if (repo.pl === "demo") return null;
    if (repo.pl === "github")
      return "https://github.com/" + repo.full + "/tree/" + encodeURIComponent(repo.branch);
    return "https://gitlab.com/" + repo.full + "/-/tree/" + encodeURIComponent(repo.branch);
  }
  function zipUrl(repo) {
    if (repo.pl === "demo") return null;
    if (repo.pl === "github")
      return "https://codeload.github.com/" + repo.full + "/zip/refs/heads/" + repo.branch;
    return repo.url + "/-/archive/" + repo.branch + "/" + repo.name + "-" + repo.branch + ".zip";
  }
  function mapGhRepo(r) {
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
      license: r.license ? r.license.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : r.license.name : null,
      fork: !!r.fork,
      private: !!r.private,
      archived: !!r.archived,
      created: r.created_at,
      updated: r.updated_at,
      pushed: r.pushed_at,
      branch: r.default_branch || "main",
      url: r.html_url,
      clone: r.clone_url,
      home: r.homepage || null
    };
  }
  function mapGlProject(p, owner, avatar) {
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
      sizeKB: p.statistics ? Math.round(p.statistics.repository_size / 1024) : null,
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
      home: null
    };
  }
  async function loadProfileData(pl, login) {
    if (pl === "demo") {
      await delay(320);
      return {
        profile: { ...DEMO_USER },
        repos: DEMO_REPOS.map((r) => ({ ...r.meta }))
      };
    }
    if (pl === "github") {
      const own2 = await isOwnProfile(pl, login);
      const u = own2 ? await ghFetch("/user") : await ghFetch("/users/" + encodeURIComponent(login));
      const reposPath = own2 ? "/user/repos?affiliation=owner&per_page=100&sort=pushed" : "/users/" + encodeURIComponent(login) + "/repos?per_page=100&sort=pushed&type=owner";
      let repos = await ghFetch(reposPath);
      if (repos.length === 100) {
        const more = await Promise.all(
          [2, 3].map((p) => ghFetch(reposPath + "&page=" + p).catch(() => []))
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
          publicRepos: own2 ? repos.length : u.public_repos,
          own: own2,
          created: u.created_at,
          url: u.html_url,
          org: u.type === "Organization"
        },
        repos: repos.map(mapGhRepo)
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
        fetch("https://gitlab.com/api/v4/users/" + id + "/followers?per_page=1").then((r) => +r.headers.get("x-total") || null).catch(() => null),
        fetch("https://gitlab.com/api/v4/users/" + id + "/following?per_page=1").then((r) => +r.headers.get("x-total") || null).catch(() => null)
      ]);
    }
    const projectsPath = own ? "/projects?owned=true&per_page=100&order_by=last_activity_at" : "/users/" + det.id + "/projects?per_page=100&order_by=last_activity_at&visibility=public";
    let projects = await glFetch(projectsPath);
    if (projects.length === 100) {
      const more = await Promise.all(
        [2, 3].map((p) => glFetch(projectsPath + "&page=" + p).catch(() => []))
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
        org: false
      },
      repos: projects.map((p) => mapGlProject(p, det.username, det.avatar_url))
    };
  }
  async function loadRepoMeta(pl, full) {
    if (pl === "demo") {
      const r = DEMO_REPOS.find((x) => x.meta.full === full);
      if (!r) throw err("notfound");
      return { ...r.meta };
    }
    if (pl === "github") return mapGhRepo(await ghFetch("/repos/" + full));
    return mapGlProject(
      await glFetch(
        "/projects/" + encodeURIComponent(full) + "?statistics=true&license=true"
      ),
      null,
      null
    );
  }
  async function loadTreeData(repo) {
    if (repo.pl === "demo") {
      await delay(260);
      const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
      return { entries: r.tree, truncated: false };
    }
    if (repo.pl === "github") {
      const d = await ghFetch(
        "/repos/" + repo.full + "/git/trees/" + encodeURIComponent(repo.branch) + "?recursive=1"
      );
      return {
        entries: (d.tree || []).map((e) => ({
          path: e.path,
          type: e.type,
          size: e.size
        })),
        truncated: !!d.truncated
      };
    }
    let entries = [], truncated = false;
    for (let page = 1; page <= 5; page++) {
      const d = await glFetch(
        "/projects/" + repo.id + "/repository/tree?recursive=true&per_page=100&page=" + page + "&ref=" + encodeURIComponent(repo.branch)
      );
      entries = entries.concat(
        d.map((e) => ({ path: e.path, type: e.type, size: null }))
      );
      if (d.length < 100) break;
      if (page === 5) truncated = true;
    }
    return { entries, truncated };
  }
  async function loadReadmeData(repo, entries) {
    const cand = entries.filter(
      (e) => e.type === "blob" && /(?:^|\/)readme(?:\.(?:md|markdown|rst|txt))?$/i.test(e.path)
    );
    cand.sort(
      (a, b) => (a.path.includes("/") ? 1 : 0) - (b.path.includes("/") ? 1 : 0) || (/\.md$/i.test(b.path) ? 1 : 0) - (/\.md$/i.test(a.path) ? 1 : 0)
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
        "https://gitlab.com/api/v4/projects/" + repo.id + "/repository/files/" + encodeURIComponent(path) + "/raw?ref=" + encodeURIComponent(repo.branch)
      );
    }
    return { path, text, plain: !/\.(md|markdown)$/i.test(path) };
  }
  async function loadLangsData(repo) {
    const toArr = (obj) => {
      const tot = Object.values(obj).reduce((a, b) => a + b, 0) || 1;
      return Object.entries(obj).map(([name, v]) => ({ name, pct: v / tot * 100, bytes: v })).sort((a, b) => b.pct - a.pct);
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
    return Object.entries(d).map(([name, pct]) => ({ name, pct, bytes: null })).sort((a, b) => b.pct - a.pct);
  }
  async function loadCommitsData(repo) {
    if (repo.pl === "demo") {
      await delay(240);
      const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
      return demoCommits(r);
    }
    if (repo.pl === "github") {
      const d2 = await ghFetch("/repos/" + repo.full + "/commits?per_page=15");
      return d2.map((c) => ({
        sha: c.sha,
        msg: c.commit && c.commit.message || "",
        author: c.commit && c.commit.author && c.commit.author.name || "?",
        avatar: c.author && c.author.avatar_url || initialsAvatar(c.commit && c.commit.author && c.commit.author.name),
        date: c.commit && c.commit.author && c.commit.author.date,
        url: c.html_url
      }));
    }
    const d = await glFetch(
      "/projects/" + repo.id + "/repository/commits?per_page=15&ref_name=" + encodeURIComponent(repo.branch)
    );
    return d.map((c) => ({
      sha: c.id,
      msg: c.message || c.title || "",
      author: c.author_name,
      avatar: initialsAvatar(c.author_name),
      date: c.created_at,
      url: c.web_url
    }));
  }
  async function loadFileData(repo, node) {
    const ext = extOf(node.path);
    if (IMG_EXT.has(ext))
      return {
        kind: "image",
        url: useAuthFiles(repo) ? await fileDataUrl(repo, node.path) : rawUrl(repo, node.path),
        size: node.size,
        path: node.path
      };
    if (BIN_EXT.has(ext))
      return { kind: "binary", size: node.size, path: node.path };
    if (node.size != null && node.size > 4e5)
      return {
        kind: "large",
        size: node.size,
        url: useAuthFiles(repo) ? null : rawUrl(repo, node.path),
        path: node.path
      };
    let text;
    if (repo.pl === "demo") {
      const ck = "demo:" + repo.full + ":" + node.path;
      if (S.fileCache.has(ck)) text = S.fileCache.get(ck);
      else {
        await delay(120);
        const r = DEMO_REPOS.find((x) => x.meta.full === repo.full);
        text = r ? r.files[node.path] : void 0;
        if (text == null) throw err("notfound");
        S.fileCache.set(ck, text);
      }
    } else {
      const ck = repo.pl + ":" + repo.full + ":" + repo.branch + ":" + node.path;
      if (S.fileCache.has(ck)) text = S.fileCache.get(ck);
      else {
        text = useAuthFiles(repo) ? await fileText(repo, node.path) : repo.pl === "github" ? await rawText(rawUrl(repo, node.path)) : await rawText(
          "https://gitlab.com/api/v4/projects/" + repo.id + "/repository/files/" + encodeURIComponent(node.path) + "/raw?ref=" + encodeURIComponent(repo.branch)
        );
        if (S.fileCache.size > 60)
          S.fileCache.delete(S.fileCache.keys().next().value);
        S.fileCache.set(ck, text);
      }
    }
    if (text.slice(0, 8e3).includes("\0"))
      return { kind: "binary", size: node.size, path: node.path };
    const [langKey, langLabel] = langOf(node.path);
    return {
      kind: "text",
      text,
      size: node.size != null ? node.size : new Blob([text]).size,
      path: node.path,
      langKey,
      langLabel
    };
  }

  // js/effects.js
  var IO = null;
  function observeReveals(root) {
    if (!IO) {
      IO = new IntersectionObserver(
        (es) => es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            IO.unobserve(e.target);
          }
        }),
        { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
      );
    }
    (root || document).querySelectorAll(".reveal:not(.in)").forEach((el) => IO.observe(el));
  }
  function postRender() {
    observeReveals($("stage"));
    requestAnimationFrame(
      () => requestAnimationFrame(() => {
        document.querySelectorAll(".dseg[data-da]").forEach((c) => {
          c.style.strokeDasharray = c.dataset.da;
        });
      })
    );
    const nums = $("stage").querySelectorAll("[data-count]");
    nums.forEach((el) => {
      const target = +el.dataset.count || 0;
      if (REDUCED || target === 0) {
        el.textContent = fmtNum(target);
        return;
      }
      const t0 = performance.now(), dur = 850;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmtNum(Math.round(target * e));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // js/repo.js
  function freshRepoState(pl, meta) {
    return {
      pl,
      meta,
      tree: null,
      treeStatus: "loading",
      truncated: false,
      treeOpen: /* @__PURE__ */ new Set(),
      treeQ: "",
      readme: null,
      readmeStatus: "loading",
      readmeSource: false,
      langs: null,
      langsStatus: "loading",
      commits: null,
      commitsStatus: "idle",
      tab: "files",
      sel: null,
      file: null,
      fileStatus: "idle",
      fileErr: null,
      fileReq: 0,
      fileSource: false,
      fileShown: 1200,
      wrap: false,
      mobileTree: false
    };
  }
  function renderRepoShell() {
    const r = S.repo, m = r.meta;
    updateRatePill(r.pl);
    const badges = (m.private ? '<span class="badge b-priv">' + icon("lock", 10) + "Priv\xE9</span>" : '<span class="badge b-pub">' + icon("globe", 10) + "Public</span>") + (m.fork ? '<span class="badge b-fork">' + icon("fork", 10) + "Fork</span>" : "") + (m.archived ? '<span class="badge b-arch">' + icon("archive", 10) + "Archiv\xE9</span>" : "") + (m.license ? '<span class="badge b-lic">' + icon("shield", 10) + esc(m.license) + "</span>" : "");
    const pills = [
      '<span class="pill st">' + icon("star", 13) + fmtNum(m.stars) + " \xE9toiles</span>",
      '<span class="pill">' + icon("fork", 13) + fmtNum(m.forks) + " forks</span>"
    ];
    if (m.watchers != null)
      pills.push(
        '<span class="pill">' + icon("eye", 13) + fmtNum(m.watchers) + " abonn\xE9s</span>"
      );
    if (m.issues != null)
      pills.push(
        '<span class="pill">' + icon("alert", 13) + fmtNum(m.issues) + " issues</span>"
      );
    if (m.sizeKB != null)
      pills.push(
        '<span class="pill">' + icon("db", 13) + fmtSize(m.sizeKB * 1024) + "</span>"
      );
    pills.push(
      '<span class="pill br">' + icon("branch", 13) + esc(m.branch) + "</span>"
    );
    pills.push(
      '<span class="pill">' + icon("clock", 13) + "maj " + relTime(m.pushed || m.updated) + "</span>"
    );
    $("stage").innerHTML = '<div class="wrap"><div class="backbar reveal in"><button class="btn btn-ghost btn-sm" data-action="go-profile" data-pl="' + esc(r.pl) + '" data-login="' + esc(m.owner) + '">' + icon("left", 14) + esc(m.owner) + '</button><span class="crumb mono">' + esc(m.owner) + " / <b>" + esc(m.name) + '</b></span><div class="bb-actions">' + favBtn("repo", r.pl, m.full) + '<button class="btn-icon" data-action="share-repo" title="Partager sur les r\xE9seaux" aria-label="Partager">' + icon("share", 15) + "</button>" + (m.url ? '<a class="btn btn-ghost btn-sm" href="' + esc(m.url) + '" target="_blank" rel="noopener noreferrer">' + platIcon(r.pl, 14) + platName(r.pl) + icon("ext", 12) + "</a>" : "") + '<button class="btn btn-pri btn-sm" data-action="zip-repo">' + icon("download", 14) + 'ZIP</button></div></div><section class="rhead reveal in"><div class="rh-top"><h2 class="rh-title">' + icon("book", 22) + "<span>" + esc(m.name) + "</span></h2>" + badges + "</div>" + (m.desc ? '<p class="rh-desc">' + esc(m.desc) + "</p>" : "") + ((m.topics || []).length ? '<div class="rh-topics">' + m.topics.map((t) => '<span class="tchip">' + esc(t) + "</span>").join("") + "</div>" : "") + '<div class="rh-stats">' + pills.join("") + "</div>" + (m.home ? '<div><a class="btn btn-warm btn-sm" href="' + esc(m.home) + '" target="_blank" rel="noopener noreferrer">' + icon("globe", 14) + "Site / d\xE9mo live" + icon("ext", 12) + "</a></div>" : "") + '<div class="clone-row"><span class="cl-label mono">HTTPS</span><code class="clone-url" tabindex="0">git clone ' + esc(m.clone) + '</code><button class="btn-icon" data-action="copy-clone" title="Copier la commande" aria-label="Copier">' + icon("copy", 14) + '</button></div></section><div class="tabs" id="repoTabs" role="tablist"><button class="tab on" data-action="tab" data-tab="files" role="tab" aria-selected="true">' + icon("folder", 15) + 'Fichiers<span class="tcount" id="tabFileCount">\u2026</span></button><button class="tab" data-action="tab" data-tab="readme" role="tab" aria-selected="false">' + icon("book", 15) + 'README</button><button class="tab" data-action="tab" data-tab="langs" role="tab" aria-selected="false">' + icon("chart", 15) + 'Langages</button><button class="tab" data-action="tab" data-tab="commits" role="tab" aria-selected="false">' + icon("commit", 15) + 'Commits</button><i class="tab-ind" id="tabInd"></i></div><div class="pane" id="pane-files"><div class="files-split"><div class="sk" style="height:440px"></div><div class="sk" style="height:440px"></div></div></div><div class="pane hidden" id="pane-readme"><div class="sk" style="height:300px"></div></div><div class="pane hidden" id="pane-langs"><div class="sk" style="height:220px"></div></div><div class="pane hidden" id="pane-commits"></div></div>';
    requestAnimationFrame(() => moveTabInd());
    postRender();
  }
  function moveTabInd() {
    const ind = $("tabInd"), tabs = $("repoTabs");
    if (!ind || !tabs) return;
    const on = tabs.querySelector(".tab.on");
    if (!on) return;
    ind.style.left = on.offsetLeft + "px";
    ind.style.width = on.offsetWidth + "px";
  }
  function fileIconName(path, type) {
    if (type === "tree") return ["folder", "#A89CFF"];
    if (type === "commit") return ["box", "#67739F"];
    const e = extOf(path);
    if (IMG_EXT.has(e)) return ["image", "#F26BB5"];
    if (BIN_EXT.has(e)) return ["lock", "#67739F"];
    const map = {
      ts: ["code", "#3178c6"],
      tsx: ["code", "#3178c6"],
      js: ["code", "#f1e05a"],
      jsx: ["code", "#f1e05a"],
      mjs: ["code", "#f1e05a"],
      py: ["code", "#3572A5"],
      rs: ["code", "#dea584"],
      go: ["code", "#00ADD8"],
      c: ["code", "#9b9b9b"],
      h: ["code", "#9b9b9b"],
      cpp: ["code", "#f34b7d"],
      hpp: ["code", "#f34b7d"],
      cs: ["code", "#2ea043"],
      json: ["file", "#FFB224"],
      md: ["book", "#2BD4F0"],
      markdown: ["book", "#2BD4F0"],
      html: ["code", "#e34c26"],
      css: ["code", "#9b6dd6"],
      scss: ["code", "#c6538c"],
      vue: ["code", "#41b883"],
      svelte: ["code", "#ff3e00"],
      yml: ["file", "#F26BB5"],
      yaml: ["file", "#F26BB5"],
      toml: ["file", "#c96a3d"],
      sh: ["terminal", "#34E0A2"],
      bash: ["terminal", "#34E0A2"],
      sql: ["db", "#e38c00"],
      lock: ["lock", "#67739F"],
      txt: ["file", "#67739F"],
      svg: ["image", "#F26BB5"]
    };
    if (e === "dockerfile") return ["box", "#6aa5b0"];
    if (e === "gitignore" || e === "clang-format") return ["file", "#67739F"];
    if (path === "LICENSE") return ["shield", "#34E0A2"];
    return map[e] || ["file", "#8b93b8"];
  }
  function treeRowHTML(n, q) {
    const [icn, col] = fileIconName(n.path, n.type);
    let name = esc(n.name);
    if (q) {
      const i = n.name.toLowerCase().indexOf(q.toLowerCase());
      if (i >= 0)
        name = esc(n.name.slice(0, i)) + "<mark>" + esc(n.name.slice(i, i + q.length)) + "</mark>" + esc(n.name.slice(i + q.length));
    }
    if (n.type === "tree") {
      const open = S.repo.treeOpen.has(n.path) && !q;
      const kids = open ? treeRowsHTML(n.children, q) : "";
      return '<div class="tn"><button class="trow' + (open ? " open" : "") + '" data-action="tree-toggle" data-path="' + esc(n.path) + '" aria-expanded="' + open + '">' + icon("chevr", 11, "chev") + '<span class="f-ic" style="color:' + col + '">' + icon(icn, 14) + '</span><span class="tname">' + name + '</span><span class="tmeta">' + n.count + '</span></button><div class="tkids"' + (open ? ' data-loaded="1"' : " hidden") + ">" + kids + "</div></div>";
    }
    return '<button class="trow tfile' + (S.repo.sel === n.path ? " sel" : "") + '" data-action="tree-file" data-path="' + esc(n.path) + '"><span class="tsp"></span><span style="color:' + col + ';display:inline-flex">' + icon(icn, 14) + '</span><span class="tname">' + name + "</span>" + (n.size ? '<span class="tmeta">' + fmtSize(n.size) + "</span>" : "") + "</button>";
  }
  function treeRowsHTML(children, q) {
    return children.map((n) => treeRowHTML(n, q)).join("");
  }
  function renderTreePane() {
    const pane = $("pane-files");
    if (!pane || !S.repo) return;
    const r = S.repo;
    if (r.treeStatus === "err") {
      pane.innerHTML = noticeHTML(
        "alert",
        "",
        "Arborescence indisponible",
        r.treeErr && r.treeErr.type === "rate" ? "Limite API atteinte - ajoutez un jeton ou patientez." : "Impossible de charger la structure de ce d\xE9p\xF4t (" + (r.treeErr && r.treeErr.type === "notfound" ? "d\xE9p\xF4t vide ou branche introuvable" : "erreur r\xE9seau") + ").",
        '<button class="btn btn-pri btn-sm" data-action="retry-repo">' + icon("refresh", 14) + "R\xE9essayer</button>"
      );
      return;
    }
    const nFiles = r.tree.root.count;
    const treeLink = r.truncated ? treeUrl(r.meta) : null;
    const fc = $("tabFileCount");
    if (fc) fc.textContent = nFiles;
    pane.innerHTML = '<div class="files-split"><button class="tree-mtoggle btn btn-ghost" data-action="tree-mtoggle">' + icon("folder", 15) + "Arborescence \xB7 " + nFiles + " fichiers" + icon("chevd", 14) + '</button><aside class="tree-pane' + (r.mobileTree ? " open" : "") + '" id="treePane"><div class="tree-head"><span class="th-label mono">EXPLORATEUR</span><span class="th-count">' + nFiles + ' fichiers</span><button class="btn-icon" title="Tout replier" aria-label="Tout replier" data-action="tree-collapse-all">' + icon("fold", 14) + '</button></div><div class="tree-search">' + icon("search", 13) + '<input id="treeSearch" placeholder="Rechercher un fichier\u2026" value="' + esc(r.treeQ) + '" aria-label="Rechercher un fichier"></div><div class="tree-scroll" id="treeScroll"><div id="treeRoot">' + (r.treeQ ? treeFilteredHTML(r.treeQ) : treeRowsHTML(r.tree.root.children, "")) + "</div></div>" + (r.truncated ? '<div class="tree-note">' + icon("warn", 13) + "<span>Arborescence volumineuse : liste partielle." + (treeLink ? ' <a class="tree-note-link" href="' + esc(treeLink) + '" target="_blank" rel="noopener noreferrer">Tout voir sur la plateforme' + icon("ext", 11) + "</a>" : "") + "</span></div>" : "") + '</aside><section class="code-pane" id="codePane"></section></div>';
    renderViewer();
  }
  function treeFilteredHTML(q) {
    const r = S.repo;
    const matches = [];
    (function walk(n) {
      for (const c of n.children) {
        if (c.type === "tree") walk(c);
        else if (c.path.toLowerCase().includes(q.toLowerCase())) matches.push(c);
      }
    })(r.tree.root);
    if (!matches.length)
      return '<div class="empty-mini" style="padding:22px">' + icon("search", 24) + "<span>Aucun fichier ne correspond.</span></div>";
    const cap = matches.slice(0, 200);
    const inc = /* @__PURE__ */ new Set();
    cap.forEach((m) => {
      let p = m.path;
      inc.add(p);
      while (p.includes("/")) {
        p = p.slice(0, p.lastIndexOf("/"));
        inc.add(p);
      }
    });
    function rows(n) {
      return n.children.filter((c) => inc.has(c.path)).map((c) => {
        if (c.type !== "tree") return treeRowHTML(c, q);
        const [icn, col] = fileIconName(c.path, "tree");
        return '<div class="tn"><button class="trow open" data-action="tree-toggle" data-path="' + esc(c.path) + '" aria-expanded="true">' + icon("chevr", 11, "chev") + '<span class="f-ic" style="color:' + col + '">' + icon(icn, 14) + '</span><span class="tname">' + esc(c.name) + '</span></button><div class="tkids" data-loaded="1">' + rows(c) + "</div></div>";
      }).join("");
    }
    return '<div style="font-family:var(--fm);font-size:10.5px;color:var(--faint);padding:4px 8px 8px">' + matches.length + " r\xE9sultat" + (matches.length > 1 ? "s" : "") + (matches.length > 200 ? " (200 affich\xE9s)" : "") + "</div>" + rows(r.tree.root);
  }
  function applyTreeSel() {
    const sc = $("treeScroll");
    if (!sc || !S.repo) return;
    sc.querySelectorAll(".trow.sel").forEach((el) => el.classList.remove("sel"));
    if (!S.repo.sel) return;
    for (const el of sc.querySelectorAll(".trow.tfile")) {
      if (el.dataset.path === S.repo.sel) {
        el.classList.add("sel");
        el.scrollIntoView({ block: "nearest" });
        break;
      }
    }
  }
  function viewerBarHTML(title, metaTxt, actions) {
    return '<div class="pane-bar"><span class="pb-path">' + title + '</span><span class="pb-meta">' + metaTxt + '</span><div class="pb-actions">' + actions + "</div></div>";
  }
  function crumbsHTML(path) {
    const parts = path.split("/");
    return parts.map(
      (p, i) => i === parts.length - 1 ? "<b>" + esc(p) + "</b>" : esc(p) + '<span class="sep">/</span>'
    ).join("");
  }
  function renderViewer() {
    const pane = $("codePane");
    if (!pane || !S.repo) return;
    const r = S.repo, m = r.meta;
    if (r.fileStatus === "idle") {
      pane.innerHTML = '<div class="viewer-empty"><div class="ve-ic">' + icon("code", 28) + '</div><h4>Explorez le code source</h4><p>S\xE9lectionnez un fichier dans l\u2019arborescence pour visualiser son contenu color\xE9, ou ouvrez l\u2019onglet README.</p><div class="ve-stats"><span class="pill br">' + icon("branch", 12) + esc(m.branch) + '</span><span class="pill">' + icon("file", 12) + (r.tree ? r.tree.root.count : "\u2026") + " fichiers</span>" + (m.sizeKB != null ? '<span class="pill">' + icon("db", 12) + fmtSize(m.sizeKB * 1024) + "</span>" : "") + "</div></div>";
      return;
    }
    if (r.fileStatus === "loading") {
      pane.innerHTML = '<div style="padding:16px"><div class="skel-status">' + gitLoader() + '<span class="mono" style="font-size:12px">' + esc(r.sel || "") + "</span></div>" + Array.from(
        { length: 12 },
        (_, i) => '<div class="sk" style="height:14px;margin:9px 0;width:' + (55 + i * 37 % 40) + '%"></div>'
      ).join("") + "</div>";
      return;
    }
    if (r.fileStatus === "err") {
      pane.innerHTML = noticeHTML(
        "alert",
        "",
        "Fichier illisible",
        "Impossible de r\xE9cup\xE9rer ce fichier (" + (r.fileErr && r.fileErr.type === "network" ? "r\xE9seau" : "API") + ")",
        '<button class="btn btn-pri btn-sm" data-action="retry-file">' + icon("refresh", 14) + "R\xE9essayer</button>"
      );
      return;
    }
    const f = r.file;
    const dlBtn = '<button class="btn-icon" data-action="download-file" title="T\xE9l\xE9charger" aria-label="T\xE9l\xE9charger">' + icon("download", 14) + "</button>";
    const rawLink = f.kind === "text" || f.kind === "image" || f.kind === "large" ? useAuthFiles(m) ? blobUrl(m, f.path) : rawUrl(m, f.path) : null;
    const rawBtn = rawLink ? '<a class="btn-icon" href="' + esc(rawLink) + '" target="_blank" rel="noopener noreferrer" title="Voir le fichier brut" aria-label="Brut">' + icon("ext", 14) + "</a>" : "";
    if (f.kind === "submodule") {
      pane.innerHTML = viewerBarHTML(crumbsHTML(f.path), "sous-module", "") + '<div class="viewer-empty"><div class="ve-ic">' + icon("box", 26) + "</div><h4>Sous-module Git</h4><p>Ce chemin pointe vers un autre d\xE9p\xF4t. Ouvrez-le depuis la page " + platName(r.pl) + " du projet.</p></div>";
      return;
    }
    if (f.kind === "image") {
      pane.innerHTML = viewerBarHTML(
        crumbsHTML(f.path),
        (f.size ? fmtSize(f.size) + " \xB7 " : "") + "image",
        rawBtn + dlBtn
      ) + '<div class="img-view">' + (f.url ? '<img src="' + esc(f.url) + '" alt="' + esc(f.path) + '">' : '<span class="md-img-chip">' + icon("image", 14) + "Aper\xE7u indisponible en d\xE9mo</span>") + "</div>";
      return;
    }
    if (f.kind === "binary" || f.kind === "large") {
      const why = f.kind === "large" ? "Fichier volumineux (" + fmtSize(f.size) + ") - affichage d\xE9sactiv\xE9 pour garder l\u2019explorateur fluide." : "Fichier binaire - non affichable sous forme de texte.";
      pane.innerHTML = viewerBarHTML(
        crumbsHTML(f.path),
        f.size ? fmtSize(f.size) : "",
        rawBtn + dlBtn
      ) + '<div class="viewer-empty"><div class="ve-ic">' + icon(f.kind === "large" ? "db" : "lock", 26) + "</div><h4>" + (f.kind === "large" ? "Trop grand pour l\u2019aper\xE7u" : "Contenu binaire") + "</h4><p>" + why + '</p><div class="ve-stats">' + (rawLink ? '<a class="btn btn-ghost btn-sm" href="' + esc(rawLink) + '" target="_blank" rel="noopener noreferrer">' + icon("ext", 13) + "Ouvrir le brut</a>" : "") + '<button class="btn btn-pri btn-sm" data-action="download-file">' + icon("download", 13) + "T\xE9l\xE9charger</button></div></div>";
      return;
    }
    const isMd = f.langKey === "md";
    if (isMd && !r.fileSource) {
      const ctx = mdCtx(m, f.path);
      const actions2 = '<button class="btn-icon' + (r.fileSource ? " on" : "") + '" data-action="md-view-toggle" title="Voir le code source" aria-label="Code source">' + icon("code", 14) + '</button><button class="btn-icon" data-action="copy-file" title="Copier" aria-label="Copier">' + icon("copy", 14) + "</button>" + dlBtn + rawBtn;
      pane.innerHTML = viewerBarHTML(
        crumbsHTML(f.path),
        fmtSize(f.size) + " \xB7 Markdown",
        actions2
      ) + '<div class="md-scroll"><div class="md-body">' + mdToHtml(f.text, ctx) + "</div></div>";
      hydrateAuthImages(pane, m);
      return;
    }
    const lines = r.fileSource && isMd ? highlightLines(f.text, "md") : r.fileLines || highlightLines(f.text, f.langKey);
    if (!r.fileSource) r.fileLines = lines;
    const shown = Math.min(r.fileShown, lines.length, 15e3);
    const rows = lines.slice(0, shown).map(
      (h, i) => '<div class="cl"><span class="ln">' + (i + 1) + '</span><span class="lc">' + (h === "" ? "&#8203;" : h) + "</span></div>"
    ).join("");
    const actions = (isMd ? '<button class="btn-icon" data-action="md-view-toggle" title="Aper\xE7u rendu" aria-label="Aper\xE7u">' + icon("book", 14) + "</button>" : "") + '<button class="btn-icon' + (r.wrap ? " on" : "") + '" data-action="wrap-toggle" title="Retour \xE0 la ligne" aria-label="Wrap" aria-pressed="' + r.wrap + '">' + icon("wrap", 14) + '</button><button class="btn-icon" data-action="copy-file" title="Copier le fichier" aria-label="Copier">' + icon("copy", 14) + "</button>" + dlBtn + rawBtn;
    pane.innerHTML = viewerBarHTML(
      crumbsHTML(f.path),
      lines.length + " lignes \xB7 " + fmtSize(f.size) + " \xB7 " + esc(f.langLabel),
      actions
    ) + '<div class="code-scroll"><div class="code-body' + (r.wrap ? " wrap" : "") + '" style="--gw:' + (String(lines.length).length + 2) + 'ch">' + rows + "</div></div>" + (lines.length > shown ? '<div class="code-more"><span>' + fmtNum(shown) + " / " + fmtNum(lines.length) + ' lignes affich\xE9es</span><button class="btn btn-ghost btn-sm" data-action="load-rest-file">' + icon("chevd", 13) + "Afficher la suite</button></div>" : "");
  }
  async function hydrateAuthImages(root, repo) {
    if (!root || !useAuthFiles(repo)) return;
    root.querySelectorAll('img[src^="gitfile:"]').forEach(async (img) => {
      const p = decodeURIComponent(
        img.getAttribute("src").slice("gitfile:".length)
      );
      try {
        img.src = await fileDataUrl(repo, p);
      } catch (e) {
        img.replaceWith(
          Object.assign(document.createElement("span"), {
            className: "md-img-chip",
            textContent: "Image indisponible : " + p
          })
        );
      }
    });
  }
  function mdCtx(repo, readmePath) {
    const dir = readmePath.includes("/") ? readmePath.slice(0, readmePath.lastIndexOf("/") + 1) : "";
    const norm = (p) => {
      const out = [];
      for (const seg of (dir + p).split("/")) {
        if (seg === "" || seg === ".") continue;
        if (seg === "..") out.pop();
        else out.push(seg);
      }
      return out.join("/");
    };
    return {
      refs: {},
      img: (u) => /^(https?:|data:image\/)/i.test(u) ? u : useAuthFiles(repo) ? "gitfile:" + encodeURIComponent(norm(u)) : rawUrl(repo, norm(u)),
      link: (u) => /^https?:|^mailto:/i.test(u) ? u : blobUrl(repo, norm(u))
    };
  }
  function renderReadmePane() {
    const pane = $("pane-readme");
    if (!pane || !S.repo) return;
    const r = S.repo;
    if (r.readmeStatus === "loading") {
      pane.innerHTML = '<div class="sk" style="height:300px"></div>';
      return;
    }
    if (r.readmeStatus === "err" || !r.readme) {
      pane.innerHTML = '<div class="empty-mini">' + icon("book", 36) + "<span>" + (r.readmeStatus === "err" ? "README impossible \xE0 charger pour le moment." : "Ce d\xE9p\xF4t n\u2019a pas de README \xE0 la racine.") + "</span>" + (r.readmeStatus === "err" ? '<button class="btn btn-ghost btn-sm" data-action="retry-repo">' + icon("refresh", 13) + "R\xE9essayer</button>" : "") + "</div>";
      return;
    }
    const rd = r.readme;
    const actions = '<button class="btn-icon' + (r.readmeSource ? " on" : "") + '" data-action="readme-src-toggle" title="Basculer aper\xE7u / source" aria-label="Source">' + icon("code", 14) + '</button><button class="btn-icon" data-action="readme-copy" title="Copier le Markdown" aria-label="Copier">' + icon("copy", 14) + '</button><button class="btn-icon" data-action="readme-dl" title="T\xE9l\xE9charger" aria-label="T\xE9l\xE9charger">' + icon("download", 14) + "</button>";
    const body = r.readmeSource || rd.plain ? '<div class="code-scroll"><div class="code-body" style="--gw:' + (String(rd.text.split("\n").length).length + 2) + 'ch">' + highlightLines(rd.text, rd.plain ? "plain" : "md").map(
      (h, i) => '<div class="cl"><span class="ln">' + (i + 1) + '</span><span class="lc">' + (h === "" ? "&#8203;" : h) + "</span></div>"
    ).join("") + "</div></div>" : '<div class="md-scroll"><div class="md-body">' + mdToHtml(rd.text, mdCtx(r.meta, rd.path)) + "</div></div>";
    pane.innerHTML = '<div class="code-pane">' + viewerBarHTML(
      icon("book", 13) + " " + crumbsHTML(rd.path),
      "README du d\xE9p\xF4t",
      actions
    ) + body + "</div>";
    hydrateAuthImages(pane, r.meta);
  }
  function renderLangsPane() {
    const pane = $("pane-langs");
    if (!pane || !S.repo) return;
    const r = S.repo, m = r.meta;
    const spec = [];
    const sp = (k, v) => spec.push(
      '<div class="spec"><div class="spec-k">' + k + '</div><div class="spec-v">' + v + "</div></div>"
    );
    sp("Cr\xE9\xE9 le", dateLong(m.created));
    sp(
      "Dernier push",
      dateLong(m.pushed) + ' <span style="color:var(--faint)">(' + relTime(m.pushed) + ")</span>"
    );
    sp(
      "Branche par d\xE9faut",
      '<span class="mono" style="color:var(--cyan)">' + esc(m.branch) + "</span>"
    );
    sp("Taille", m.sizeKB != null ? fmtSize(m.sizeKB * 1024) : "-");
    sp("Licence", m.license ? esc(m.license) : "Non renseign\xE9e");
    sp(
      "Clone HTTPS",
      '<span class="mono" style="font-size:11.5px">' + esc(m.clone) + "</span>"
    );
    if ((m.topics || []).length)
      sp(
        "Topics",
        m.topics.map((t) => '<span class="tchip">' + esc(t) + "</span>").join("")
      );
    if (m.home)
      sp(
        "Site du projet",
        '<a href="' + esc(m.home) + '" target="_blank" rel="noopener noreferrer">' + esc(m.home) + "</a>"
      );
    let langHTML;
    if (r.langsStatus === "loading")
      langHTML = '<div class="sk" style="height:90px"></div>';
    else if (r.langsStatus === "err" || !r.langs || !r.langs.length)
      langHTML = '<div class="chart-empty">R\xE9partition des langages indisponible pour ce d\xE9p\xF4t.</div>';
    else {
      const ls = r.langs.slice(0, 8);
      langHTML = '<div class="lbar">' + ls.map(
        (l, i) => '<div class="lseg" style="width:' + l.pct + "%;background:" + langColor(l.name) + ";--d:" + i * 70 + 'ms" title="' + esc(l.name) + " \xB7 " + l.pct.toFixed(1) + '%"></div>'
      ).join("") + '</div><div class="lrows">' + ls.map(
        (l) => '<div class="lrow"><i class="lr-dot" style="background:' + langColor(l.name) + ";color:" + langColor(l.name) + '"></i><span class="lr-name">' + esc(l.name) + '</span><span class="lr-pct">' + l.pct.toFixed(1).replace(".", ",") + " %</span>" + (l.bytes != null ? '<span class="lr-bytes">' + fmtSize(l.bytes) + "</span>" : "") + "</div>"
      ).join("") + "</div>";
    }
    pane.innerHTML = '<div class="langs-pane">' + langHTML + '<h3 class="sect-t">' + icon("info", 13) + 'Fiche technique</h3><div class="spec-grid">' + spec.join("") + "</div></div>";
  }
  function activityHtml(commits) {
    const weeks = new Array(12).fill(0), week = 7 * 864e5, now = Date.now();
    for (const c of commits) {
      const t = Date.parse(c.date);
      if (!Number.isFinite(t)) continue;
      const i = Math.floor((now - t) / week);
      if (i >= 0 && i < 12) weeks[11 - i]++;
    }
    const max = Math.max(1, ...weeks);
    const bars = weeks.map((v, i) => {
      const h = v / max * 46, x = 8 + i * 21;
      return '<rect class="' + (v ? "act-bar" : "act-bar-empty") + '" x="' + x + '" y="' + (58 - h) + '" width="13" height="' + Math.max(h, v ? 3 : 1.5) + '" rx="3"' + (v ? ' fill="url(#gradAct)"' : "") + "/>" + (v ? '<text class="act-n" x="' + (x + 6.5) + '" y="' + (52 - h) + '" text-anchor="middle" font-size="8">' + v + "</text>" : "");
    }).join("");
    const chart = '<div class="act-card"><div class="ac-title">' + icon("chart", 13) + 'Activit\xE9 - 12 derni\xE8res semaines</div><svg class="act-svg" viewBox="0 0 260 72" role="img" aria-label="Commits par semaine"><defs><linearGradient id="gradAct" x1="0" y1="1" x2="0" y2="0"><stop class="grad-a" offset="0"/><stop class="grad-b" offset="1"/></linearGradient></defs><line class="act-axis" x1="4" y1="58.5" x2="256" y2="58.5"/>' + bars + '<text class="act-label" x="14" y="69" font-size="7">S-11</text><text class="act-label" x="120" y="69" font-size="7">S-6</text><text class="act-label" x="236" y="69" font-size="7">S-0</text></svg></div>';
    const byAuthor = /* @__PURE__ */ new Map();
    for (const c of commits) {
      const name = c.author || "?";
      const e = byAuthor.get(name) || { n: 0, avatar: c.avatar || "" };
      e.n++;
      byAuthor.set(name, e);
    }
    const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const contribs = '<div class="act-card"><div class="ac-title">' + icon("users", 13) + 'Contributeurs r\xE9cents</div><div class="contribs">' + Array.from(byAuthor).sort((a, b) => b[1].n - a[1].n).slice(0, 6).map(([name, v]) => {
      const av = v.avatar ? '<img src="' + esc(v.avatar) + '" alt="">' : '<span class="c-init">' + esc(initials(name)) + "</span>";
      return '<span class="contrib">' + av + esc(name) + " <b>" + v.n + " commit" + (v.n > 1 ? "s" : "") + "</b></span>";
    }).join("") + "</div></div>";
    return chart + contribs;
  }
  function renderCommitsPane() {
    const pane = $("pane-commits");
    if (!pane || !S.repo) return;
    const r = S.repo;
    if (r.commitsStatus === "idle" || r.commitsStatus === "loading") {
      pane.innerHTML = '<div style="padding:6px"><div class="skel-status">' + gitLoader() + "<span>R\xE9cup\xE9ration des derniers commits\u2026</span></div>" + Array.from(
        { length: 5 },
        () => '<div class="sk" style="height:52px;margin:10px 0"></div>'
      ).join("") + "</div>";
      return;
    }
    if (r.commitsStatus === "err") {
      pane.innerHTML = '<div class="empty-mini">' + icon("alert", 30) + '<span>Commits indisponibles.</span><button class="btn btn-ghost btn-sm" data-action="retry-commits">' + icon("refresh", 13) + "R\xE9essayer</button></div>";
      return;
    }
    if (!r.commits.length) {
      pane.innerHTML = '<div class="empty-mini">' + icon("commit", 30) + "<span>Aucun commit public sur cette branche.</span></div>";
      return;
    }
    let html = '<div class="commits">' + activityHtml(r.commits), lastDay = "";
    for (const c of r.commits) {
      const day = dateLong(c.date);
      if (day !== lastDay) {
        html += '<div class="cday">' + icon("calendar", 12) + day + "</div>";
        lastDay = day;
      }
      const first = (c.msg || "").split("\n")[0];
      html += '<div class="crow"><img class="cavatar" src="' + esc(c.avatar || initialsAvatar(c.author)) + '" alt=""><div class="cmain"><div class="cmsg" title="' + esc(c.msg) + '">' + esc(first) + '</div><div class="csub">' + esc(c.author) + " \xB7 " + relTime(c.date) + '</div></div><button class="sha" data-action="copy-sha" data-sha="' + esc(c.sha) + '" title="Copier le SHA">' + esc(c.sha.slice(0, 7)) + "</button>" + (c.url ? '<a class="btn-icon" href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer" aria-label="Voir le commit">' + icon("ext", 13) + "</a>" : "") + "</div>";
    }
    pane.innerHTML = html + "</div>";
  }

  // js/modal.js
  var blockWheel2 = (e) => {
    if (e.target instanceof Element && e.target.closest(".drawer.open, .modal.open")) return;
    e.preventDefault();
  };
  function lockBody(on) {
    S.lockCount = Math.max(0, S.lockCount + (on ? 1 : -1));
    const locked = S.lockCount > 0;
    document.body.classList.toggle("lock", locked);
    if (locked) window.addEventListener("wheel", blockWheel2, { passive: false });
    else window.removeEventListener("wheel", blockWheel2);
  }
  function openDrawer() {
    S.lastFocus = document.activeElement;
    renderFavDrawer();
    $("drawer").classList.add("open");
    $("dwScrim").classList.add("show");
    lockBody(true);
    $("dwClose").focus();
  }
  function closeDrawer() {
    if (!$("drawer").classList.contains("open")) return;
    $("drawer").classList.remove("open");
    $("dwScrim").classList.remove("show");
    lockBody(false);
    if (S.lastFocus) S.lastFocus.focus();
  }
  function openModal() {
    S.lastFocus = document.activeElement;
    const gl = currentPlatform() === "gitlab";
    const name = gl ? "GitLab" : "GitHub";
    $("tokenModal").dataset.pl = gl ? "gitlab" : "github";
    $("tokenModal").setAttribute("aria-label", "Jeton d'acc\xE8s " + name);
    $("mdTitle").textContent = name;
    $("mdDesc").innerHTML = gl ? "Ajoutez un <b>jeton personnel GitLab</b> (scope <b>read_api</b>) pour voir vos projets priv\xE9s depuis votre profil." : "Ajoutez un jeton personnel pour voir <b>vos d\xE9p\xF4ts priv\xE9s</b> et portez la limite de l'API GitHub de 60 \xE0 5 000 requ\xEAtes/heure.";
    $("mdHost").textContent = gl ? "gitlab.com/api/v4" : "api.github.com";
    $("tokenInput").placeholder = gl ? "glpat-\u2026" : "github_pat_\u2026 ou ghp_\u2026";
    $("tokenInput").setAttribute("aria-label", "Jeton " + name);
    $("mdLink").href = gl ? "https://gitlab.com/-/user_settings/personal_access_tokens" : "https://github.com/settings/tokens?type=beta";
    $("mdLinkTxt").textContent = "Cr\xE9er un jeton sur " + name;
    $("mdScopes").innerHTML = gl ? "GitLab : cochez le scope <b>read_api</b>. Le jeton reste sur cet appareil." : "GitHub : scope <b>repo</b> (classique) ou <b>Contents: read</b> (jeton affin\xE9).";
    $("tokenInput").value = S.tokens[gl ? "gitlab" : "github"] || "";
    $("tokMemory").checked = !tokenPersisted(gl ? "gitlab" : "github");
    $("tokClear").style.display = hasToken(gl ? "gitlab" : "github") ? "" : "none";
    $("tokenModal").classList.add("open");
    $("mdScrim").classList.add("show");
    lockBody(true);
    setTimeout(() => $("tokenInput").focus(), 80);
  }
  function closeModal() {
    if (!$("tokenModal").classList.contains("open")) return;
    $("tokenModal").classList.remove("open");
    $("mdScrim").classList.remove("show");
    lockBody(false);
    if (S.lastFocus) S.lastFocus.focus();
  }

  // js/tree.js
  function buildTree(entries) {
    const root = { name: "", path: "", type: "tree", children: [], count: 0 };
    const map = /* @__PURE__ */ new Map([["", root]]);
    function ensureDir(path) {
      if (map.has(path)) return map.get(path);
      const idx = path.lastIndexOf("/");
      const parent = ensureDir(idx < 0 ? "" : path.slice(0, idx));
      const node = {
        name: path.slice(idx + 1),
        path,
        type: "tree",
        children: [],
        count: 0
      };
      parent.children.push(node);
      map.set(path, node);
      return node;
    }
    for (const e of entries) {
      const idx = e.path.lastIndexOf("/");
      const parent = ensureDir(idx < 0 ? "" : e.path.slice(0, idx));
      if (e.type === "tree") ensureDir(e.path);
      else {
        const node = {
          name: e.path.slice(idx + 1),
          path: e.path,
          type: e.type === "commit" ? "commit" : "blob",
          size: e.size || 0,
          children: null,
          count: 0
        };
        parent.children.push(node);
        map.set(e.path, node);
      }
    }
    (function fin(n) {
      if (n.type !== "tree") return;
      n.children.sort(
        (a, b) => (a.type === "tree" ? 0 : 1) - (b.type === "tree" ? 0 : 1) || a.name.localeCompare(b.name, "fr")
      );
      let c = 0;
      for (const ch of n.children) {
        fin(ch);
        c += ch.type === "tree" ? ch.count : 1;
      }
      n.count = c;
    })(root);
    return { root, map };
  }

  // js/charts.js
  function donutHTML(repos) {
    const counts = {};
    repos.forEach((r) => {
      const l = r.lang || "Autres";
      counts[l] = (counts[l] || 0) + 1;
    });
    let items = Object.entries(counts).map(([name, value]) => ({ name, value, color: langColor(name) })).sort((a, b) => b.value - a.value);
    if (!items.length)
      return '<div class="chart-empty">Aucun d\xE9p\xF4t public \xE0 graphique.</div>';
    if (items.length > 7) {
      const rest = items.slice(6);
      items = items.slice(0, 6);
      items.push({
        name: "Autres",
        value: rest.reduce((a, b) => a + b.value, 0),
        color: "#8b93b8"
      });
    }
    const total = items.reduce((a, b) => a + b.value, 0);
    const R = 52, C = 2 * Math.PI * R;
    let off = 0;
    const segs = items.map((it, i) => {
      const len = it.value / total * C;
      const s = '<circle class="dseg" r="' + R + '" cx="70" cy="70" fill="none" stroke="' + it.color + '" stroke-width="15" stroke-dasharray="0 ' + C.toFixed(2) + '" data-da="' + Math.max(len - 2.5, 0.6).toFixed(2) + " " + (C - len + 2.5).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" style="transition-delay:' + i * 70 + 'ms"><title>' + esc(it.name) + " \xB7 " + it.value + " d\xE9p\xF4t" + (it.value > 1 ? "s" : "") + "</title></circle>";
      off += len;
      return s;
    }).join("");
    const legend = items.map(
      (it) => '<div class="dl-row"><i class="dl-dot" style="background:' + it.color + ";color:" + it.color + '"></i><span class="dl-name">' + esc(it.name) + '</span><span class="dl-val">' + it.value + " \xB7 " + Math.round(it.value / total * 100) + "%</span></div>"
    ).join("");
    return '<div class="donut-wrap"><svg width="140" height="140" viewBox="0 0 140 140"><g transform="rotate(-90 70 70)">' + segs + '</g><text x="70" y="68" text-anchor="middle" class="dcenter-n">' + total + '</text><text x="70" y="86" text-anchor="middle" class="dcenter-l">d\xE9p\xF4ts</text></svg><div class="dlegend">' + legend + "</div></div>";
  }
  function barsHTML(repos) {
    const top = [...repos].filter((r) => r.stars > 0).sort((a, b) => b.stars - a.stars).slice(0, 6);
    if (!top.length)
      return '<div class="chart-empty">Pas encore d\u2019\xE9toiles - les premiers projets arrivent.</div>';
    const max = top[0].stars;
    return '<div class="bars">' + top.map(
      (r, i) => '<div class="bar-row" data-action="go-repo" data-pl="' + esc(r.pl) + '" data-full="' + esc(r.full) + '" role="button" tabindex="0"><span class="bar-name" title="' + esc(r.name) + '">' + esc(r.name) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.max(r.stars / max * 100, 4) + "%;--lc:" + langColor(r.lang) + ";--d:" + i * 90 + 'ms"></div></div><span class="bar-val">' + icon("star", 11) + fmtNum(r.stars) + "</span></div>"
    ).join("") + "</div>";
  }
  function histHTML(repos) {
    if (!repos.length)
      return '<div class="chart-empty">Aucune activit\xE9 publique.</div>';
    const nowY = (/* @__PURE__ */ new Date()).getFullYear();
    const years = {};
    let minY = nowY;
    repos.forEach((r) => {
      const y = new Date(r.pushed || r.updated || r.created).getFullYear();
      if (!isNaN(y)) {
        years[y] = (years[y] || 0) + 1;
        minY = Math.min(minY, y);
      }
    });
    const start = Math.max(minY, nowY - 7);
    const cols = [];
    for (let y = start; y <= nowY; y++) cols.push({ y, n: years[y] || 0 });
    const max = Math.max(...cols.map((c) => c.n), 1);
    const last = [...repos].sort(
      (a, b) => new Date(b.pushed || 0) - new Date(a.pushed || 0)
    )[0];
    return '<div class="hist">' + cols.map(
      (c, i) => '<div class="hcol" title="' + c.y + " \xB7 " + c.n + " d\xE9p\xF4t" + (c.n > 1 ? "s" : "") + " actif" + (c.n > 1 ? "s" : "") + '"><div class="hbar" style="height:' + Math.max(c.n / max * 82, c.n ? 10 : 3) + "px;--d:" + i * 60 + "ms;" + (c.n ? "" : "opacity:.25") + '"></div><span class="hyear">' + String(c.y).slice(2) + "</span></div>"
    ).join("") + '</div><p class="chart-foot">' + icon("clock", 13) + "Dernier push " + relTime(last.pushed || last.updated) + "</p>";
  }

  // js/profile.js
  function heroMode() {
    const h = $("hero");
    h.classList.toggle("micro", S.view === "repo");
    h.classList.toggle("compact", S.view === "profile" && S.userNav);
  }
  function renderProfile() {
    const { pl, login, profile: p, repos } = S.prof;
    S.errCtx = null;
    stopRateTimer();
    updateRatePill(pl);
    const totalStars = repos.reduce((a, r) => a + (r.stars || 0), 0);
    const totalForks = repos.reduce((a, r) => a + (r.forks || 0), 0);
    const f4 = p.followers != null ? { v: p.followers, l: "abonn\xE9s", ic: "users", cls: "s-green" } : {
      v: null,
      l: "derni\xE8re activit\xE9",
      ic: "clock",
      cls: "s-green",
      txt: repos.length ? relTime(repos[0].pushed) : "-"
    };
    const meta = [];
    if (p.company)
      meta.push(
        '<span class="mchip">' + icon("building", 13) + esc(p.company) + "</span>"
      );
    if (p.location)
      meta.push(
        '<span class="mchip">' + icon("pin", 13) + esc(p.location) + "</span>"
      );
    if (p.blog)
      meta.push(
        '<span class="mchip">' + icon("link", 13) + '<a href="' + esc(/^https?:/.test(p.blog) ? p.blog : "https://" + p.blog) + '" target="_blank" rel="noopener noreferrer">' + esc(p.blog.replace(/^https?:\/\//, "")) + "</a></span>"
      );
    if (p.twitter)
      meta.push(
        '<span class="mchip">' + icon("globe", 13) + "@" + esc(p.twitter) + "</span>"
      );
    if (p.created)
      meta.push(
        '<span class="mchip">' + icon("calendar", 13) + "inscrit\xB7e en " + monthYear(p.created) + "</span>"
      );
    const langs = [...new Set(repos.map((r) => r.lang).filter(Boolean))].sort(
      (a, b) => repos.filter((r) => r.lang === b).length - repos.filter((r) => r.lang === a).length
    );
    const banner = pl === "demo" ? '<div class="demo-banner reveal in">' + icon("sparkle", 16) + '<span><b>Mode d\xE9monstration</b> : profil fictif, donn\xE9es locales hors-ligne. Entrez un pseudo r\xE9el ci-dessus pour interroger l\u2019API en direct.</span><span class="sp"></span><button class="btn btn-warm btn-sm" data-action="focus-search">Chercher un vrai profil ' + icon("ext", 13) + "</button></div>" : "";
    const statTile = (cls, ic, val, label, txt) => '<div class="stat ' + cls + ' reveal"><div class="stat-ic">' + icon(ic, 20) + '</div><div><div class="stat-num"' + (txt ? "" : ' data-count="' + val + '"') + ">" + (txt || "0") + '</div><div class="stat-label">' + label + "</div></div></div>";
    $("stage").innerHTML = '<div class="wrap">' + banner + '<section class="pcard reveal"><div class="pmain"><div class="avatar-ring"><img class="pavatar" src="' + esc(p.avatar || initialsAvatar(p.name)) + '" alt="Avatar de ' + esc(p.name) + '"></div><div class="pinfo"><div class="pname-row"><h2 class="pname">' + esc(p.name) + "</h2>" + (p.org ? '<span class="badge b-pub">Organisation</span>' : "") + (pl === "demo" ? '<span class="badge b-arch">Fictif</span>' : "") + '</div><div class="plogin"><span class="plat-badge ' + pl + '">' + platIcon(pl, 11) + platName(pl) + "</span>@" + esc(p.login) + "</div>" + (p.bio ? '<p class="pbio">' + esc(p.bio) + "</p>" : "") + '<div class="pmeta">' + meta.join("") + '</div></div></div><div class="pside"><div class="pfollow">' + (p.followers != null ? '<div><b data-count="' + p.followers + '">0</b><span>abonn\xE9s</span></div>' : "") + (p.following != null ? '<div><b data-count="' + p.following + '">0</b><span>abonnements</span></div>' : "") + '</div><div class="pactions">' + (p.url ? '<a class="btn btn-ghost btn-sm" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + platIcon(pl, 14) + "Voir sur " + platName(pl) + icon("ext", 12) + "</a>" : "") + favBtn("profile", pl, p.login) + '<button class="btn btn-ghost btn-sm" data-action="export-profile">' + icon("download", 14) + 'Exporter JSON</button></div></div></section><section class="stats-row">' + statTile("s-gold", "star", totalStars, "\xE9toiles cumul\xE9es") + statTile("s-vio", "fork", totalForks, "forks cumul\xE9s") + statTile(
      "s-cyan",
      "box",
      p.publicRepos != null ? p.publicRepos : repos.length,
      p.own ? "d\xE9p\xF4ts (dont priv\xE9s)" : "d\xE9p\xF4ts publics"
    ) + statTile(f4.cls, f4.ic, f4.v, f4.l, f4.txt) + '</section><section class="charts-row"><div class="chart-card reveal" style="--d:60ms"><h3 class="chart-title">' + icon("code", 13) + "Langages (par d\xE9p\xF4t)</h3>" + donutHTML(repos) + '</div><div class="chart-card reveal" style="--d:120ms"><h3 class="chart-title">' + icon("star", 13) + "D\xE9p\xF4ts les plus \xE9toil\xE9s</h3>" + barsHTML(repos) + '</div><div class="chart-card reveal" style="--d:180ms"><h3 class="chart-title">' + icon("chart", 13) + "Activit\xE9 \xB7 pushs par an</h3>" + histHTML(repos) + '</div></section><div class="toolbar" id="toolbar"><div class="tsearch">' + icon("search", 14) + '<input id="repoFilter" placeholder="Filtrer les d\xE9p\xF4ts\u2026" value="' + esc(S.filters.q) + '" aria-label="Filtrer les d\xE9p\xF4ts"></div><select class="sel" id="langSel" aria-label="Filtrer par langage"><option value="all">Tous les langages</option>' + langs.map(
      (l) => '<option value="' + esc(l) + '"' + (S.filters.lang === l ? " selected" : "") + ">" + esc(l) + " (" + repos.filter((r) => r.lang === l).length + ")</option>"
    ).join("") + '</select><select class="sel" id="sortSel" aria-label="Trier"><option value="stars"' + (S.filters.sort === "stars" ? " selected" : "") + '>\xC9toiles \u2193</option><option value="recent"' + (S.filters.sort === "recent" ? " selected" : "") + '>Activit\xE9 r\xE9cente</option><option value="name"' + (S.filters.sort === "name" ? " selected" : "") + '>Nom A\u2192Z</option><option value="created"' + (S.filters.sort === "created" ? " selected" : "") + '>Cr\xE9\xE9s r\xE9cemment</option></select><div class="seg seg-sm" id="typeSeg">' + [
      ["all", "Tous"],
      ["source", "Sources"],
      ["fork", "Forks"],
      ["arch", "Archiv\xE9s"]
    ].map(
      ([t, l]) => '<button data-action="ftype" data-t="' + t + '" class="' + (S.filters.type === t ? "on" : "") + '">' + l + "</button>"
    ).join("") + '</div><span class="rcount"><b id="repoCount">' + repos.length + '</b> d\xE9p\xF4ts</span><div class="seg seg-sm"><button data-action="layout" data-l="grid" class="' + (S.filters.layout === "grid" ? "on" : "") + '" aria-label="Vue grille">' + icon("grid", 14) + '</button><button data-action="layout" data-l="list" class="' + (S.filters.layout === "list" ? "on" : "") + '" aria-label="Vue liste">' + icon("list", 14) + '</button></div></div><div id="repoArea"></div><div id="moreArea"></div></div>';
    renderRepos();
    postRender();
  }
  function filteredRepos() {
    const { repos } = S.prof;
    const f = S.filters;
    let out = repos.filter((r) => {
      if (f.type === "source" && r.fork) return false;
      if (f.type === "fork" && !r.fork) return false;
      if (f.type === "arch" && !r.archived) return false;
      if (f.lang !== "all" && r.lang !== f.lang) return false;
      if (f.q) {
        const q = f.q.toLowerCase();
        if (!(r.name.toLowerCase().includes(q) || (r.desc || "").toLowerCase().includes(q) || (r.topics || []).join(" ").toLowerCase().includes(q)))
          return false;
      }
      return true;
    });
    const by = {
      stars: (a, b) => b.stars - a.stars || a.name.localeCompare(b.name),
      recent: (a, b) => new Date(b.pushed || 0) - new Date(a.pushed || 0),
      name: (a, b) => a.name.localeCompare(b.name, "fr"),
      created: (a, b) => new Date(b.created || 0) - new Date(a.created || 0)
    };
    out.sort(by[f.sort] || by.stars);
    return out;
  }
  function repoCardHTML(r, i) {
    const lc = langColor(r.lang);
    const badges = (r.private ? '<span class="badge b-priv">' + icon("lock", 10) + "Priv\xE9</span>" : "") + (r.fork ? '<span class="badge b-fork">' + icon("fork", 10) + "Fork</span>" : "") + (r.archived ? '<span class="badge b-arch">' + icon("archive", 10) + "Archiv\xE9</span>" : "");
    const topics = (r.topics || []).slice(0, 3).map((t) => '<span class="tchip">' + esc(t) + "</span>").join("") + ((r.topics || []).length > 3 ? '<span class="tchip">+' + (r.topics.length - 3) + "</span>" : "");
    return '<article class="rcard reveal" style="--lc:' + lc + ";--d:" + Math.min(i, 10) * 45 + 'ms" data-action="go-repo" data-pl="' + esc(r.pl) + '" data-full="' + esc(r.full) + '"><div class="rc-top"><span class="rc-lang"><i class="dot"></i>' + esc(r.lang || "-") + '</span><div class="rc-badges">' + badges + "</div>" + favBtn("repo", r.pl, r.full) + '</div><h4 class="rc-name"><button type="button" class="name-open" data-action="go-repo" data-pl="' + esc(r.pl) + '" data-full="' + esc(r.full) + '" aria-label="Ouvrir ' + esc(r.name) + '">' + icon("book", 15) + "<span>" + esc(r.name) + '</span></button></h4><p class="rc-desc">' + esc(r.desc || "Pas de description.") + "</p>" + (topics ? '<div class="rc-topics">' + topics + "</div>" : "") + '<div class="rc-foot"><span class="rc-stat st">' + icon("star", 12) + fmtNum(r.stars) + '</span><span class="rc-stat">' + icon("fork", 12) + fmtNum(r.forks) + "</span>" + (r.issues != null ? '<span class="rc-stat">' + icon("alert", 12) + fmtNum(r.issues) + "</span>" : "") + '<span class="rc-upd">maj ' + relTime(r.pushed || r.updated) + "</span></div></article>";
  }
  function repoRowHTML(r, i) {
    const lc = langColor(r.lang);
    return '<article class="rrow reveal" style="--lc:' + lc + ";--d:" + Math.min(i, 12) * 30 + 'ms" data-action="go-repo" data-pl="' + esc(r.pl) + '" data-full="' + esc(r.full) + '"><div class="rr-main"><button type="button" class="rr-name name-open" data-action="go-repo" data-pl="' + esc(r.pl) + '" data-full="' + esc(r.full) + '"><span>' + esc(r.name) + "</span>" + (r.archived ? '<span class="badge b-arch">Archiv\xE9</span>' : "") + (r.fork ? '<span class="badge b-fork">Fork</span>' : "") + '</button><span class="rr-desc">' + esc(r.desc || "") + '</span></div><span class="rr-lang"><i class="dot"></i><span>' + esc(r.lang || "-") + '</span></span><span class="rr-num st">' + icon("star", 12) + fmtNum(r.stars) + '</span><span class="rr-num rr-forks">' + icon("fork", 12) + fmtNum(r.forks) + '</span><span class="rr-upd">' + relTime(r.pushed || r.updated) + "</span>" + favBtn("repo", r.pl, r.full) + "</article>";
  }
  function renderRepos() {
    const area = $("repoArea"), more = $("moreArea");
    if (!area) return;
    const list = filteredRepos();
    const total = S.prof.repos.length;
    const cnt = $("repoCount");
    if (cnt)
      cnt.textContent = list.length === total ? total : list.length + " / " + total;
    if (!total) {
      area.innerHTML = '<div class="empty-mini">' + icon("inbox", 36) + "<span>Ce profil ne poss\xE8de aucun d\xE9p\xF4t public pour le moment.</span></div>";
      more.innerHTML = "";
      return;
    }
    if (!list.length) {
      area.innerHTML = '<div class="empty-mini">' + icon("search", 36) + '<span>Aucun d\xE9p\xF4t ne correspond \xE0 ces filtres.</span><button class="btn btn-ghost btn-sm" data-action="reset-filters">' + icon("refresh", 13) + "R\xE9initialiser les filtres</button></div>";
      more.innerHTML = "";
      return;
    }
    const shown = list.slice(0, S.batch);
    area.innerHTML = S.filters.layout === "grid" ? '<div class="rgrid">' + shown.map(repoCardHTML).join("") + "</div>" : '<div class="rlist">' + shown.map(repoRowHTML).join("") + "</div>";
    more.innerHTML = list.length > S.batch ? '<div class="more-wrap"><button class="btn btn-ghost" data-action="load-more-repos">' + icon("chevd", 14) + "Afficher 24 de plus (" + (list.length - S.batch) + " restants)</button></div>" : list.length > 10 ? '<div class="end-note">' + icon("check", 13) + "Tous les d\xE9p\xF4ts sont affich\xE9s</div>" : "";
    observeReveals(area);
    observeReveals(more);
  }
  function saveFilters() {
    const key = S.prof.pl + ":" + S.prof.login;
    const c = S.profCache.get(key);
    if (c) c.filters = { ...S.filters };
  }

  // js/flows.js
  function stopRateTimer() {
    if (S.rateTimer) {
      clearInterval(S.rateTimer);
      S.rateTimer = null;
    }
  }
  function startRateTimer(resetMs, ctx) {
    stopRateTimer();
    const tick = () => {
      const el = $("rateCount"), bar = $("rateBar");
      const left = Math.max(0, resetMs - Date.now());
      if (el) {
        const m = Math.floor(left / 6e4), s = Math.floor(left % 6e4 / 1e3);
        el.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      }
      if (bar)
        bar.style.width = Math.min(100, left / (60 * 60 * 1e3) * 100) + "%";
      if (left <= 0) {
        stopRateTimer();
        if (S.errCtx && S.errCtx.kind === "profile")
          profileFlow(S.errCtx.pl, S.errCtx.login);
      }
    };
    tick();
    S.rateTimer = setInterval(tick, 1e3);
  }
  async function profileFlow(pl, login) {
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
      S.filters = cached.filters ? { ...cached.filters, layout: S.layout } : defaultFilters();
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
        startRateTimer((e.reset || Date.now() / 1e3 + 900) * 1e3, {
          pl,
          login
        });
      observeReveals($("stage"));
    }
  }
  async function repoFlow(pl, full) {
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
      loadTreeData(meta).then(async (t) => {
        if (gen !== S.gen) return;
        S.repo.tree = buildTree(t.entries);
        S.repo.truncated = t.truncated;
        S.repo.treeStatus = "ok";
        renderTreePane();
        const rd = t.entries.find(
          (e) => e.type === "blob" && /^readme(\.(md|markdown|rst|txt))?$/i.test(e.path) && !e.path.includes("/")
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
      }).catch((e) => {
        if (gen !== S.gen) return;
        S.repo.treeStatus = "err";
        S.repo.treeErr = e;
        S.repo.readmeStatus = "err";
        renderTreePane();
        renderReadmePane();
      });
      loadLangsData(meta).then((l) => {
        if (gen !== S.gen) return;
        S.repo.langs = l;
        S.repo.langsStatus = "ok";
        renderLangsPane();
      }).catch(() => {
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
  function selectFile(path, silent) {
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
    loadFileData(r.meta, node).then((f) => {
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
            block: "start"
          });
      }
    }).catch((e) => {
      if (req !== r.fileReq || S.view !== "repo") return;
      r.fileStatus = "err";
      r.fileErr = e;
      renderViewer();
    });
  }
  function switchTab(t) {
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
      loadCommitsData(r.meta).then((c) => {
        if (gen !== S.gen) return;
        r.commits = c;
        r.commitsStatus = "ok";
        renderCommitsPane();
      }).catch(() => {
        if (gen !== S.gen) return;
        r.commitsStatus = "err";
        renderCommitsPane();
      });
    }
  }
  function navigate(hash, user) {
    if (user !== false) S.userNav = true;
    if (location.hash === hash) route();
    else location.hash = hash;
  }
  function route() {
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

  // js/search.js
  function parseSearch(rawInput, pl) {
    let v = rawInput.trim();
    if (!v) return null;
    let m = v.match(
      /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)(?:\/([\w.-]+))?/i
    );
    if (m)
      return m[2] ? { kind: "repo", pl: "github", value: m[1] + "/" + m[2] } : { kind: "profile", pl: "github", value: m[1] };
    m = v.match(
      /^https?:\/\/(?:www\.)?gitlab\.com\/([\w.-]+(?:\/[\w.-]+)*?)(?:\/-\/.*)?\/?$/i
    );
    if (m) {
      const segs = m[1].split("/");
      return segs.length >= 2 ? { kind: "repo", pl: "gitlab", value: segs.join("/") } : { kind: "profile", pl: "gitlab", value: segs[0] };
    }
    v = v.replace(/^@/, "");
    if (/^[\w.-]+\/[\w./-]+$/.test(v))
      return { kind: "repo", pl, value: v.replace(/\.git$/, "") };
    if (/^[\w.-]+$/.test(v)) return { kind: "profile", pl, value: v };
    return { kind: "invalid" };
  }
  function submitSearch() {
    const q = $("q");
    const parsed = parseSearch(q.value, S.platform);
    if (!parsed || parsed.kind === "invalid") {
      const w = $("qWrap");
      w.classList.remove("shake");
      void w.offsetWidth;
      w.classList.add("shake");
      toast(
        "warn",
        "Pseudo invalide - lettres, chiffres, tirets et points uniquement."
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
        "#/r/" + parsed.pl + "/" + parsed.value.split("/").map(encodeURIComponent).join("/")
      );
  }
  function renderPlatSeg() {
    $("segGh").innerHTML = icon("github", 15) + "GitHub";
    $("segGl").innerHTML = icon("gitlab", 15) + "GitLab";
    $("segGh").className = S.platform === "github" ? "on-p-github" : "";
    $("segGl").className = S.platform === "gitlab" ? "on-p-gitlab" : "";
    $("searchForm").classList.toggle("p-gitlab", S.platform === "gitlab");
    $("q").placeholder = S.platform === "gitlab" ? "ex. dzaporozhets, sytses\u2026" : "ex. torvalds, gaearon, yyx990803\u2026";
  }
  function renderChips() {
    const sugg = [
      ["github", "torvalds"],
      ["github", "yyx990803"],
      ["github", "sindresorhus"],
      ["github", "gaearon"],
      ["gitlab", "dzaporozhets"]
    ];
    $("chipsRow").innerHTML = '<span class="chips-lbl">Essayez :</span>' + sugg.map(
      ([p, l]) => '<button class="chip' + (p === "gitlab" ? " gl" : "") + '" data-action="chip" data-p="' + p + '" data-login="' + l + '">' + platIcon(p, 12) + l + "</button>"
    ).join("") + '<button class="chip chip-demo" data-action="chip" data-p="demo" data-login="lina-forge">' + icon("sparkle", 12) + "Profil d\xE9mo</button>";
  }

  // js/events.js
  function refreshAfterAuth() {
    if (S.errCtx && S.errCtx.kind === "profile")
      profileFlow(S.errCtx.pl, S.errCtx.login);
    else if (S.view === "profile" && S.prof) profileFlow(S.prof.pl, S.prof.login);
    else if (S.view === "repo" && S.repo) repoFlow(S.repo.pl, S.repo.full);
  }
  document.addEventListener("click", async (e) => {
    const mdAnchor = e.target.closest('.md-body a[href^="#"]');
    if (mdAnchor) {
      e.preventDefault();
      const id = mdAnchor.getAttribute("href").slice(1);
      const target = document.getElementById("md-" + id) || document.getElementById(id);
      if (target)
        target.scrollIntoView({
          behavior: REDUCED ? "auto" : "smooth",
          block: "start"
        });
      return;
    }
    if (isShareOpen() && !e.target.closest("#shareMenu") && !e.target.closest('[data-action="share-open"]'))
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
        const p = el.dataset.p, l = el.dataset.login;
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
        toast("info", "Recherches r\xE9centes effac\xE9es.");
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
          "#/r/" + el.dataset.pl + "/" + el.dataset.full.split("/").map(encodeURIComponent).join("/")
        );
        break;
      case "go-profile":
        closeMenu(true);
        navigate(
          "#/u/" + el.dataset.pl + "/" + encodeURIComponent(el.dataset.login)
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
            "#/u/" + el.dataset.pl + "/" + encodeURIComponent(el.dataset.id)
          );
        else
          navigate(
            "#/r/" + el.dataset.pl + "/" + el.dataset.id.split("/").map(encodeURIComponent).join("/")
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
          "Jeton " + (pl === "gitlab" ? "GitLab" : "GitHub") + " enregistr\xE9 - d\xE9p\xF4ts priv\xE9s activ\xE9s."
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
        toast("info", "Jeton retir\xE9 - d\xE9p\xF4ts priv\xE9s masqu\xE9s.");
        refreshAfterAuth();
        break;
      }
      case "export-profile": {
        if (!S.prof) break;
        const payload = {
          exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
          tool: "GitAtlas",
          platform: S.prof.pl,
          profile: S.prof.profile,
          repositories: S.prof.repos
        };
        const result = await saveBlob(
          "gitatlas-" + S.prof.login + ".json",
          new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json"
          })
        );
        toast(
          result === "cancelled" ? "info" : "success",
          result === "cancelled" ? "Export JSON annul\xE9." : result === "fallback" ? "Export JSON lanc\xE9\u2026" : "Export JSON t\xE9l\xE9charg\xE9."
        );
        break;
      }
      case "share-repo":
      case "share-open":
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
            "Le ZIP est disponible sur les d\xE9p\xF4ts r\xE9els (pas en d\xE9mo)."
          );
          break;
        }
        toast("info", "T\xE9l\xE9chargement du ZIP lanc\xE9\u2026");
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
          ok ? "Commande de clonage copi\xE9e." : "Copie impossible."
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
        $("typeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.t === el.dataset.t));
        renderRepos();
        break;
      case "layout":
        S.filters.layout = el.dataset.l;
        S.layout = el.dataset.l;
        lsSet("layout", S.layout);
        saveFilters();
        el.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.l === el.dataset.l));
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
          toast("info", "Arborescence repli\xE9e.");
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
          ok ? "Fichier copi\xE9 (" + S.repo.file.path.split("/").pop() + ")." : "Copie impossible."
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
            new Blob([f.text], { type: "text/plain;charset=utf-8" })
          );
        else if (useAuthFiles(S.repo.meta)) {
          try {
            const blob = await fileBlob(S.repo.meta, f.path);
            result = await saveBlob(name, blob);
          } catch (e2) {
            toast("alert", "T\xE9l\xE9chargement impossible : " + (e2.message || e2));
            break;
          }
        } else {
          const u = rawUrl(S.repo.meta, f.path);
          if (u) result = await downloadUrl(u, name);
          else {
            toast("info", "T\xE9l\xE9chargement indisponible en d\xE9mo pour ce fichier.");
            break;
          }
        }
        toast(
          result === "cancelled" ? "info" : "success",
          result === "cancelled" ? "T\xE9l\xE9chargement annul\xE9 : " + name : "T\xE9l\xE9chargement de " + name + " lanc\xE9."
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
          ok ? "README copi\xE9 en Markdown." : "Copie impossible."
        );
        break;
      }
      case "readme-dl": {
        if (!S.repo || !S.repo.readme) break;
        const result = await saveBlob(
          S.repo.readme.path.split("/").pop(),
          new Blob([S.repo.readme.text], {
            type: "text/markdown;charset=utf-8"
          })
        );
        toast(
          result === "cancelled" ? "info" : "success",
          result === "cancelled" ? "T\xE9l\xE9chargement du README annul\xE9." : "README t\xE9l\xE9charg\xE9."
        );
        break;
      }
      case "copy-block": {
        const code = MD_CODES[el.dataset.k];
        if (code == null) break;
        const ok = await copyText(code);
        if (ok) {
          const old = el.innerHTML;
          el.innerHTML = icon("check", 12) + "Copi\xE9 !";
          setTimeout(() => {
            el.innerHTML = old;
          }, 1300);
        }
        toast(
          ok ? "success" : "error",
          ok ? "Bloc de code copi\xE9." : "Copie impossible."
        );
        break;
      }
      case "copy-sha": {
        const ok = await copyText(el.dataset.sha);
        toast(
          ok ? "success" : "error",
          ok ? "SHA copi\xE9 : " + el.dataset.sha.slice(0, 7) : "Copie impossible."
        );
        break;
      }
      case "load-rest-file": {
        if (!S.repo || !S.repo.fileLines) break;
        S.repo.fileShown = Math.min(S.repo.fileShown + 5e3, 15e3);
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
      $("treeRoot").innerHTML = S.repo.treeQ ? treeFilteredHTML(S.repo.treeQ) : treeRowsHTML(S.repo.tree.root.children, "");
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
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if (e.key === "/" && !typing) {
      e.preventDefault();
      $("q").focus();
      $("q").select();
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-action][tabindex]")) {
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
    true
  );
  window.addEventListener(
    "scroll",
    () => {
      $("hdr").classList.toggle("scrolled", window.scrollY > 8);
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    if (S.view === "repo") moveTabInd();
  });
  window.addEventListener("hashchange", () => closeMenu());
  window.addEventListener("hashchange", route);

  // js/hero-graph.js
  function heroGraph() {
    const rnd = mulberry32(7);
    const lanes = [70, 130, 190];
    const cols = ["#7B6CFF", "#FF6B3D", "#2BD4F0", "#34E0A2", "#FFB224"];
    let lane = 1, x = 60;
    const nodes = [];
    for (let i = 0; i < 14; i++) {
      if (i > 0) {
        const r = rnd();
        if (r < 0.28 && lane > 0) lane--;
        else if (r > 0.72 && lane < 2) lane++;
      }
      nodes.push({ x, y: lanes[lane], c: cols[i % cols.length] });
      x += 76 + Math.floor(rnd() * 14);
    }
    let edges = "";
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1], b = nodes[i];
      const mx = (a.x + b.x) / 2;
      edges += '<path d="M' + a.x + " " + a.y + " C" + mx + " " + a.y + ", " + mx + " " + b.y + ", " + b.x + " " + b.y + '" fill="none" stroke="' + b.c + '" stroke-width="2" opacity="0.45" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="animation:drawTo .7s ' + (0.3 + i * 0.07) + 's cubic-bezier(.4,0,.3,1) forwards"/>';
    }
    let dots = "";
    nodes.forEach((n, i) => {
      dots += '<circle cx="' + n.x + '" cy="' + n.y + '" r="7" fill="#0B1122" stroke="' + n.c + '" stroke-width="2"/><circle cx="' + n.x + '" cy="' + n.y + '" r="3" fill="' + n.c + '"/><circle cx="' + n.x + '" cy="' + n.y + '" r="7" fill="none" stroke="' + n.c + '" stroke-width="1.5" opacity="0" style="animation:ping 3s ' + i * 0.3 + 's infinite"/>';
    });
    const last = nodes[nodes.length - 1];
    const head = '<g style="animation:fadeUp .6s 1.4s both"><rect x="' + (last.x - 24) + '" y="' + (last.y - 38) + '" width="48" height="20" rx="6" fill="#162040" stroke="#31427A"/><text x="' + last.x + '" y="' + (last.y - 24) + '" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10" fill="#A89CFF">HEAD</text><line x1="' + last.x + '" y1="' + (last.y - 18) + '" x2="' + last.x + '" y2="' + (last.y - 9) + '" stroke="#31427A"/></g>';
    $("heroGraph").innerHTML = '<svg width="100%" height="100%" viewBox="0 0 1200 240" preserveAspectRatio="xMidYMid slice">' + edges + dots + head + "</svg>";
    const st = document.createElement("style");
    st.textContent = "@keyframes drawTo{to{stroke-dashoffset:0}}@keyframes ping{0%{opacity:.7;r:7}70%{opacity:0;r:16}100%{opacity:0;r:16}}";
    document.head.appendChild(st);
  }

  // js/main.js
  function init() {
    $("brandMark").innerHTML = brandLogo(32);
    $("footBrand").innerHTML = brandLogo(18) + "GitAtlas";
    $("favIco").innerHTML = icon("star", 15);
    $("keyIco").innerHTML = icon("key", 15);
    $("dwStar").innerHTML = icon("star", 17);
    $("dwClose").innerHTML = icon("x", 15);
    $("menuIco").innerHTML = icon("menu", 18);
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
})();
