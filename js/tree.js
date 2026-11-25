// MODÈLE D'ARBORESCENCE
/* ============================== MODÈLE D'ARBORESCENCE ============================== */
export function buildTree(entries) {
  const root = { name: "", path: "", type: "tree", children: [], count: 0 };
  const map = new Map([["", root]]);
  function ensureDir(path) {
    if (map.has(path)) return map.get(path);
    const idx = path.lastIndexOf("/");
    const parent = ensureDir(idx < 0 ? "" : path.slice(0, idx));
    const node = {
      name: path.slice(idx + 1),
      path,
      type: "tree",
      children: [],
      count: 0,
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
        count: 0,
      };
      parent.children.push(node);
      map.set(e.path, node);
    }
  }
  (function fin(n) {
    if (n.type !== "tree") return;
    n.children.sort(
      (a, b) =>
        (a.type === "tree" ? 0 : 1) - (b.type === "tree" ? 0 : 1) ||
        a.name.localeCompare(b.name, "fr"),
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
