// COLORATION SYNTAXIQUE
import { esc } from "./utils.js";

/* ============================== COLORATION SYNTAXIQUE ============================== */
export const KW_CL = "const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|of|in|this|super|static|interface|type|enum|implements|public|private|protected|readonly|abstract|namespace|declare|as|fn|pub|mut|impl|trait|struct|match|use|mod|crate|where|loop|move|unsafe|dyn|package|func|defer|go|chan|range|select|yield|delete|void|template|typename|constexpr|auto|virtual|override|operator|sizeof|namespace|using|not|and|or";
export const RULES = {};
RULES.clike = [
  [/\n/y, ""],
  [/[ \t]+/y, ""],
  [/\/\*[\s\S]*?(?:\*\/|$)/y, "c"],
  [/\/\/[^\n]*/y, "c"],
  [/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?/y, "s"],
  [/\b(?:true|false|null|undefined|None|True|False|nil|NaN|Infinity)\b/y, "n"],
  [
    /\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/y,
    "n",
  ],
  [new RegExp("\\b(?:" + KW_CL + ")\\b", "y"), "k"],
  [/@[\w.]+/y, "a"],
  [/#[A-Za-z_]+/y, "a"],
  [/\b[A-Z][A-Za-z0-9_]*\b/y, "t"],
  [/[A-Za-z_$][\w$]*(?=\s*\()/y, "f"],
  [/[A-Za-z_$][\w$]*/y, ""],
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
    "k",
  ],
  [/@[\w.]+/y, "a"],
  [/\b[A-Z][A-Za-z0-9_]*\b/y, "t"],
  [/[A-Za-z_][\w]*(?=\s*\()/y, "f"],
  [/[A-Za-z_][\w]*/y, ""],
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
    "k",
  ],
  [/\b\d+(?:\.\d+)?\b/y, "n"],
  [/[A-Za-z_][\w-]*/y, ""],
];
RULES.json = [
  [/\n/y, ""],
  [/[ \t]+/y, ""],
  [/"(?:\\.|[^"\\])*"(?=\s*:)/y, "p"],
  [/"(?:\\.|[^"\\])*"/y, "s"],
  [/\b(?:true|false|null)\b/y, "n"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y, "n"],
  [/[A-Za-z_][\w]*/y, ""],
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
  [/[A-Za-z_-][\w-]*/y, ""],
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
    "k",
  ],
  [/[A-Za-z_][\w-]*/y, ""],
];
RULES.plain = [
  [/\n/y, ""],
  [/[^\n]+/y, ""],
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
  [/[A-Za-z_][\w]*/y, ""],
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
    "k",
  ],
  [/[A-Za-z_][\w]*(?=\s*\()/y, "f"],
  [/[A-Za-z_][\w]*/y, ""],
];
export function highlightLines(code, key) {
  code = String(code).replace(/\r\n?/g, "\n");
  const rules = RULES[key];
  if (!rules || code.length > 200000) return code.split("\n").map(esc);
  const toks = [];
  let i = 0,
    buf = "";
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
        cur += t
          ? '<span class="tk-' + t + '">' + esc(parts[k]) + "</span>"
          : esc(parts[k]);
    }
  }
  lines.push(cur);
  if (code.endsWith("\n")) lines.pop();
  return lines;
}
