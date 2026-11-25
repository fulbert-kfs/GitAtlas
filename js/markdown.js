// RENDU MARKDOWN
import { EXT_LANG } from "./languages.js";
import { RULES } from "./highlight.js";
import { esc } from "./utils.js";
import { highlightLines } from "./highlight.js";
import { icon } from "./icons.js";
import { slug } from "./utils.js";
import { unesc } from "./utils.js";

/* ============================== RENDU MARKDOWN ============================== */
export let MD_CODE_SEQ = 0;
export const MD_CODES = {};
export const EMOJI = {
  rocket: "🚀",
  sparkles: "✨",
  warning: "⚠️",
  book: "📖",
  zap: "⚡",
  bug: "🐛",
  white_check_mark: "✅",
  heavy_check_mark: "✔️",
  fire: "🔥",
  tada: "🎉",
  construction: "🚧",
  memo: "📝",
  package: "📦",
  art: "🎨",
  lock: "🔒",
  globe: "🌐",
  star: "⭐",
  heart: "❤️",
  eyes: "👀",
  wave: "👋",
  hammer: "🔨",
  wrench: "🔧",
  bulb: "💡",
  penguin: "🐧",
  robot: "🤖",
  chart_with_upwards_trend: "📈",
  computer: "💻",
  seedling: "🌱",
  gear: "⚙️",
};
export function codeBlockHTML(code, lang) {
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
    toml: "toml",
  };
  const normalized =
    aliases[
      String(lang || "")
        .trim()
        .toLowerCase()
    ] ||
    String(lang || "")
      .trim()
      .toLowerCase();
  const key = (EXT_LANG[normalized] || ["plain", ""])[0];
  const label = lang || "texte";
  return (
    '<div class="cb"><div class="cb-head"><span class="cb-lang">' +
    esc(label) +
    '</span><button class="cb-copy" data-action="copy-block" data-k="' +
    k +
    '">' +
    icon("copy", 12) +
    'Copier</button></div><pre tabindex="0"><code>' +
    highlightLines(code, RULES[key] ? key : "plain").join("\n") +
    "</code></pre></div>"
  );
}
export function safeHref(u) {
  return /^(https?:\/\/|mailto:|#)/i.test(u) ? u : null;
}
export function mdInline(text, ctx) {
  let s = esc(text);
  const stash = [];
  const put = (h) => {
    stash.push(h);
    return "\u0001" + (stash.length - 1) + "\u0002";
  };
  s = s.replace(/&lt;!--[\s\S]*?--&gt;/g, "");
  s = s.replace(/`([^`]+)`/g, (m, c) => put("<code>" + c + "</code>"));
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^)]*&quot;)?\)/g,
    (m, alt, u) => {
      const url = ctx.img(unesc(u));
      return put(
        url
          ? '<img src="' + esc(url) + '" alt="' + alt + '" loading="lazy">'
          : '<span class="md-img-chip">' + icon("image", 12) + alt + "</span>",
      );
    },
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
    u = unesc(u);
    if (u.startsWith("#"))
      return put('<a href="#' + esc(u.slice(1)) + '">' + t + "</a>");
    const url = /^https?:|^mailto:/i.test(u) ? u : ctx.link(u);
    return put(
      url
        ? '<a href="' +
            esc(url) +
            '" target="_blank" rel="noopener noreferrer">' +
            t +
            "</a>"
        : "<span>" + t + "</span>",
    );
  });
  if (ctx.refs) {
    s = s.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (m, t, r) => {
      const u = ctx.refs[(r || t).toLowerCase()];
      return u
        ? put(
            '<a href="' +
              esc(u) +
              '" target="_blank" rel="noopener noreferrer">' +
              t +
              "</a>",
          )
        : m;
    });
  }
  s = s.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, (m, u) =>
    put(
      '<a href="' +
        u +
        '" target="_blank" rel="noopener noreferrer">' +
        u +
        "</a>",
    ),
  );
  s = s.replace(
    /(^|[\s(])(https?:\/\/[^\s<>()\u0001]+)/g,
    (m, pre, u) =>
      pre +
      put(
        '<a href="' +
          u +
          '" target="_blank" rel="noopener noreferrer">' +
          u +
          "</a>",
      ),
  );
  s = s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?;:]|$)/g, "$1<em>$2</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = s.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  s = s.replace(
    /&lt;(\/?)(b|strong|em|i|del|sub|sup|kbd|code|summary)&gt;/g,
    "<$1$2>",
  );
  s = s
    .replace(/&lt;details(?:\s+open)?&gt;/g, "<details>")
    .replace(/&lt;\/details&gt;/g, "</details>");
  s = s
    .replace(
      /&lt;(p|div)\s+align=&quot;(center|left|right)&quot;&gt;/g,
      (m, t, a) => "<" + t + ' class="md-align-' + a + '">',
    )
    .replace(/&lt;\/(p|div)&gt;/g, "</$1>");
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
    return (
      '<img src="' +
      esc(url) +
      '" alt="' +
      esc(alt) +
      '"' +
      (w && /^\d+$/.test(w) ? ' width="' + w + '"' : "") +
      ' loading="lazy">'
    );
  });
  s = s
    .replace(/&lt;a\s+href=&quot;([^&]+)&quot;[^&]*&gt;/g, (m, u) => {
      const h = safeHref(unesc(u));
      return h
        ? '<a href="' + esc(h) + '" target="_blank" rel="noopener noreferrer">'
        : m;
    })
    .replace(/&lt;\/a&gt;/g, "</a>");
  s = s.replace(/:([a-z_]+):/g, (m, n) => EMOJI[n] || m);
  s = s.replace(/\u0003/g, "<br>");
  for (let p = 0; p < 3; p++)
    s = s.replace(/\u0001(\d+)\u0002/g, (m, i) => stash[+i] || "");
  return s;
}
export function mdToHtml(src, ctx) {
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
  let out = "",
    i = 0,
    para = [];
  const flush = () => {
    if (para.length) {
      out +=
        "<p>" +
        mdInline(
          para.map((l) => l.replace(/\s{2,}$/, "\u0003")).join(" "),
          ctx,
        ) +
        "</p>";
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
    if ((m = line.match(/^\s*(```|~~~)\s*([^\s`]*)/))) {
      flush();
      const f = m[1],
        lang = m[2] || "";
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
    if ((m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/))) {
      flush();
      const n = m[1].length;
      const txt = m[2];
      out +=
        "<h" +
        n +
        ' id="md-' +
        esc(slug(txt)) +
        '">' +
        mdInline(txt, ctx) +
        "</h" +
        n +
        ">";
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
      const inner = buf
        .join("\n")
        .replace(/^\s*<details[^>]*>/i, "")
        .replace(/<\/details>\s*$/i, "");
      const sm = inner.match(/^\s*<summary>([\s\S]*?)<\/summary>/i);
      const summary = sm ? sm[1] : "Détails";
      const rest = sm ? inner.slice(sm[0].length) : inner;
      out +=
        "<details><summary>" +
        mdInline(summary, ctx) +
        "</summary>" +
        mdToHtml(rest, ctx) +
        "</details>";
      continue;
    }
    if (
      line.includes("|") &&
      i + 1 < L.length &&
      /^\s*\|?[\s:|-]*-[\s:|-]*$/.test(L[i + 1]) &&
      L[i + 1].includes("-")
    ) {
      flush();
      const cells = (r) =>
        r
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      const head = cells(line);
      const aligns = cells(L[i + 1]).map((c) => {
        const l = c.startsWith(":"),
          r = c.endsWith(":");
        return l && r ? "center" : r ? "right" : l ? "left" : "";
      });
      i += 2;
      const rows = [];
      while (i < L.length && L[i].includes("|") && !blank(L[i])) {
        rows.push(cells(L[i]));
        i++;
      }
      out +=
        '<table tabindex="0"><thead><tr>' +
        head
          .map(
            (h, j) =>
              "<th" +
              (aligns[j] ? ' style="text-align:' + aligns[j] + '"' : "") +
              ">" +
              mdInline(h, ctx) +
              "</th>",
          )
          .join("") +
        "</tr></thead><tbody>" +
        rows
          .map(
            (r) =>
              "<tr>" +
              head
                .map(
                  (_, j) =>
                    "<td" +
                    (aligns[j] ? ' style="text-align:' + aligns[j] + '"' : "") +
                    ">" +
                    mdInline(r[j] || "", ctx) +
                    "</td>",
                )
                .join("") +
              "</tr>",
          )
          .join("") +
        "</tbody></table>";
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
            text: im[3],
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
        html += task
          ? '<li class="task"><input type="checkbox" disabled' +
            (task[1] !== " " ? " checked" : "") +
            "> " +
            mdInline(task[2], ctx) +
            "</li>"
          : "<li>" + mdInline(it.text, ctx) + "</li>";
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
