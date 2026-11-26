// CARTE DE PARTAGE PNG
// Rendu 1200 × 630 entièrement côté navigateur : aucun service externe,
// aucune police distante. Le canvas reste « clean » car l'avatar distant est
// chargé en CORS, avec repli sur les initiales générées localement.
import { S } from "./state.js";
import { fmtNum } from "./utils.js";
import { initialsAvatar } from "./utils.js";
import { saveBlob } from "./utils.js";
import { langColor } from "./languages.js";
import { toast } from "./ui.js";

const W = 1200;
const H = 630;

function platformName(pl) {
  return pl === "gitlab" ? "GitLab" : pl === "demo" ? "Démo" : "GitHub";
}

function topLanguages(repos) {
  const counts = new Map();
  for (const r of repos || []) {
    if (r.lang) counts.set(r.lang, (counts.get(r.lang) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => ({ name, color: langColor(name) }));
}

function context() {
  if (S.view === "repo" && S.repo && S.repo.meta) {
    const m = S.repo.meta;
    const langs = m.lang
      ? [{ name: m.lang, color: langColor(m.lang) }]
      : (m.topics || []).slice(0, 3).map((t) => ({
          name: t,
          color: langColor(t),
        }));
    const avatar =
      (S.prof && S.prof.profile && S.prof.profile.avatar) ||
      initialsAvatar(m.full || "?");
    return {
      slug: (m.full || "depot").replace(/[^a-z0-9-_]+/gi, "-"),
      platform: platformName(S.repo.pl),
      eyebrow: "DÉPÔT",
      title: m.full || "",
      subtitle: m.desc || "",
      avatar,
      initialsName: m.full || "?",
      stats: [
        { n: m.stars || 0, l: "étoiles" },
        { n: m.forks || 0, l: "forks" },
        { n: m.issues ?? 0, l: "issues" },
      ],
      langs,
    };
  }
  const p = (S.prof && S.prof.profile) || {};
  const repos = (S.prof && S.prof.repos) || [];
  const login = p.login || (S.prof && S.prof.login) || "";
  const stars = repos.reduce((a, r) => a + (r.stars || 0), 0);
  return {
    slug: login || "profil",
    platform: platformName(S.prof ? S.prof.pl : S.platform),
    eyebrow: "PROFIL",
    title: p.name || "@" + login,
    subtitle: p.bio || "",
    avatar: p.avatar || initialsAvatar(p.name || login || "?"),
    initialsName: p.name || login || "?",
    stats: [
      { n: p.followers != null ? p.followers : repos.length, l: "abonnés / dépôts" },
      { n: stars, l: "étoiles cumulées" },
      { n: repos.length, l: "dépôts" },
    ],
    langs: topLanguages(repos),
  };
}

function loadAvatar(src) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    const img = new Image();
    img.onload = () => finish(img);
    img.onerror = () => finish(null);
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.src = src;
    setTimeout(() => finish(null), 1500);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fit(ctx, text, max) {
  let s = String(text || "");
  if (ctx.measureText(s).width <= max) return s;
  while (s.length > 1 && ctx.measureText(s + "…").width > max) {
    s = s.slice(0, -1);
  }
  return s + "…";
}

function wrap(ctx, text, max, lines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const out = [];
  let line = "";
  for (const w of words) {
    const next = line ? line + " " + w : w;
    if (ctx.measureText(next).width > max && line) {
      out.push(line);
      line = w;
      if (out.length === lines - 1) break;
    } else line = next;
  }
  if (line && out.length < lines) out.push(line);
  return out;
}

function background(ctx) {
  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, "#0d1329");
  base.addColorStop(1, "#070b16");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const cyan = ctx.createRadialGradient(1080, 70, 0, 1080, 70, 560);
  cyan.addColorStop(0, "rgba(43,212,240,.26)");
  cyan.addColorStop(1, "rgba(43,212,240,0)");
  ctx.fillStyle = cyan;
  ctx.fillRect(0, 0, W, H);

  const violet = ctx.createRadialGradient(90, 600, 0, 90, 600, 520);
  violet.addColorStop(0, "rgba(123,108,255,.28)");
  violet.addColorStop(1, "rgba(123,108,255,0)");
  ctx.fillStyle = violet;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,.05)";
  ctx.lineWidth = 1;
  for (let x = 60; x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(123,108,255,.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
}

function draw(ctx, data, img) {
  background(ctx);

  // Avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(150, 152, 82, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    const s = Math.max(img.width, img.height);
    ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 68, 70, 164, 164);
  } else {
    ctx.fillStyle = "#171d38";
    ctx.fillRect(68, 70, 164, 164);
    ctx.fillStyle = "#e8ecff";
    ctx.font = "600 54px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      (data.initialsName || "?").slice(0, 2).toUpperCase(),
      150,
      152,
    );
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(43,212,240,.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(150, 152, 82, 0, Math.PI * 2);
  ctx.stroke();

  // Plateforme
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const pw = ctx.measureText(data.platform).width + 48;
  roundRect(ctx, W - 70 - pw, 72, pw, 52, 26);
  ctx.fillStyle = "rgba(43,212,240,.12)";
  ctx.fill();
  ctx.strokeStyle = "rgba(43,212,240,.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#8ee9fb";
  ctx.fillText(data.platform, W - 94, 99);

  // Titres
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillStyle = "#8ee9fb";
  ctx.fillText(data.eyebrow, 88, 300);
  ctx.font = "700 62px system-ui, sans-serif";
  ctx.fillStyle = "#f5f7ff";
  ctx.fillText(fit(ctx, data.title, 1024), 88, 372);

  ctx.font = "400 28px system-ui, sans-serif";
  ctx.fillStyle = "#aab2d5";
  wrap(ctx, data.subtitle, 1024, 2).forEach((line, i) => {
    ctx.fillText(line, 88, 420 + i * 38);
  });

  // Statistiques
  const bw = 344;
  const gap = 24;
  data.stats.slice(0, 3).forEach((s, i) => {
    const x = 88 + i * (bw + gap);
    roundRect(ctx, x, 470, bw, 104, 16);
    ctx.fillStyle = "rgba(255,255,255,.045)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = "700 46px system-ui, sans-serif";
    ctx.fillStyle = "#f5f7ff";
    ctx.fillText(fit(ctx, fmtNum(s.n), bw - 36), x + 18, 524);
    ctx.font = "500 20px system-ui, sans-serif";
    ctx.fillStyle = "#8890b5";
    ctx.fillText(fit(ctx, s.l, bw - 36), x + 18, 557);
  });

  // Langages
  let lx = 88;
  ctx.font = "600 19px system-ui, sans-serif";
  ctx.fillStyle = "#7982a8";
  ctx.fillText("LANGAGES", lx, 612);
  lx += ctx.measureText("LANGAGES").width + 22;
  for (const l of data.langs) {
    ctx.beginPath();
    ctx.arc(lx + 6, 605, 7, 0, Math.PI * 2);
    ctx.fillStyle = l.color;
    ctx.fill();
    ctx.font = "500 19px system-ui, sans-serif";
    ctx.fillStyle = "#c9cfeb";
    ctx.fillText(l.name, lx + 20, 612);
    lx += ctx.measureText(l.name).width + 46;
    if (lx > 960) break;
  }

  // Signature
  ctx.textAlign = "right";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillStyle = "#f5f7ff";
  ctx.fillText("GitAtlas", W - 70, 612);
}

function render(data) {
  return loadAvatar(data.avatar).then(
    (img) =>
      new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        draw(ctx, data, img);
        canvas.toBlob((b) => resolve(b), "image/png");
      }),
  );
}

export async function sharePng() {
  if (!S.prof && !(S.view === "repo" && S.repo)) {
    toast("info", "Ouvrez d'abord un profil ou un dépôt.");
    return;
  }
  try {
    const data = context();
    const blob = await render(data);
    if (!blob) {
      toast("error", "Carte PNG indisponible.");
      return;
    }
    const result = await saveBlob("gitatlas-" + data.slug + ".png", blob);
    toast(
      result === "cancelled" ? "info" : "success",
      result === "cancelled"
        ? "Carte PNG annulée."
        : result === "fallback"
          ? "Carte PNG lancée…"
          : "Carte PNG téléchargée.",
    );
  } catch (e) {
    toast("error", "Carte PNG indisponible.");
  }
}
