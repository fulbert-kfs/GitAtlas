// GRAPHE HÉROS
import { $ } from "./utils.js";
import { mulberry32 } from "./utils.js";

/* ============================== GRAPHE HÉROS ============================== */
export function heroGraph() {
  const rnd = mulberry32(7);
  const lanes = [70, 130, 190];
  const cols = ["#7B6CFF", "#FF6B3D", "#2BD4F0", "#34E0A2", "#FFB224"];
  let lane = 1,
    x = 60;
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
    const a = nodes[i - 1],
      b = nodes[i];
    const mx = (a.x + b.x) / 2;
    edges +=
      '<path d="M' +
      a.x +
      " " +
      a.y +
      " C" +
      mx +
      " " +
      a.y +
      ", " +
      mx +
      " " +
      b.y +
      ", " +
      b.x +
      " " +
      b.y +
      '" fill="none" stroke="' +
      b.c +
      '" stroke-width="2" opacity="0.45" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="animation:drawTo .7s ' +
      (0.3 + i * 0.07) +
      's cubic-bezier(.4,0,.3,1) forwards"/>';
  }
  let dots = "";
  nodes.forEach((n, i) => {
    dots +=
      '<circle cx="' +
      n.x +
      '" cy="' +
      n.y +
      '" r="7" fill="#0B1122" stroke="' +
      n.c +
      '" stroke-width="2"/>' +
      '<circle cx="' +
      n.x +
      '" cy="' +
      n.y +
      '" r="3" fill="' +
      n.c +
      '"/>' +
      '<circle cx="' +
      n.x +
      '" cy="' +
      n.y +
      '" r="7" fill="none" stroke="' +
      n.c +
      '" stroke-width="1.5" opacity="0" style="animation:ping 3s ' +
      i * 0.3 +
      's infinite"/>';
  });
  const last = nodes[nodes.length - 1];
  const head =
    '<g style="animation:fadeUp .6s 1.4s both"><rect x="' +
    (last.x - 24) +
    '" y="' +
    (last.y - 38) +
    '" width="48" height="20" rx="6" fill="#162040" stroke="#31427A"/><text x="' +
    last.x +
    '" y="' +
    (last.y - 24) +
    '" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10" fill="#A89CFF">HEAD</text><line x1="' +
    last.x +
    '" y1="' +
    (last.y - 18) +
    '" x2="' +
    last.x +
    '" y2="' +
    (last.y - 9) +
    '" stroke="#31427A"/></g>';
  $("heroGraph").innerHTML =
    '<svg width="100%" height="100%" viewBox="0 0 1200 240" preserveAspectRatio="xMidYMid slice">' +
    edges +
    dots +
    head +
    "</svg>";
  const st = document.createElement("style");
  st.textContent =
    "@keyframes drawTo{to{stroke-dashoffset:0}}@keyframes ping{0%{opacity:.7;r:7}70%{opacity:0;r:16}100%{opacity:0;r:16}}";
  document.head.appendChild(st);
}
