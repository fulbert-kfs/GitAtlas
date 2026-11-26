// EXPORT DES DÉPÔTS FILTRÉS
// Les deux formats sont construits à partir de filteredRepos(), donc ils
// respectent la recherche, le langage, le type et le tri affichés à l'écran.
import { S } from "./state.js";

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function date(v) {
  return v ? String(v).slice(0, 10) : "";
}

function csvCell(v) {
  return '"' + String(v ?? "").replace(/"/g, '""') + '"';
}

function mdCell(v) {
  return String(v ?? "").replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}

function kind(r) {
  return r.fork ? "Fork" : r.archived ? "Archivé" : "Source";
}

function csvText(repos) {
  const head = [
    "Nom",
    "Dépôt",
    "Plateforme",
    "Description",
    "Langage",
    "Étoiles",
    "Forks",
    "Issues",
    "Topics",
    "Type",
    "Visibilité",
    "Créé le",
    "Mis à jour le",
    "URL",
  ];
  const rows = repos.map((r) => [
    r.name,
    r.full,
    r.pl === "demo" ? "Démo" : r.pl,
    r.desc,
    r.lang || "",
    r.stars,
    r.forks,
    r.issues ?? "",
    (r.topics || []).join(", "),
    kind(r),
    r.private ? "Privé" : "Public",
    date(r.created),
    date(r.updated),
    r.url,
  ]);
  // BOM et séparateur « ; » : ouverture directe dans Excel en français.
  return (
    "\uFEFF" +
    [head, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n") +
    "\r\n"
  );
}

function markdownText(profile, repos) {
  const who = profile.name ? profile.name + " (@" + profile.login + ")" : "@" + profile.login;
  const lines = [
    "# Dépôts de " + who + " — GitAtlas",
    "",
    "Généré le " +
      new Date().toLocaleDateString("fr-FR") +
      " · " +
      repos.length +
      " dépôts · plateforme " +
      (profile.pl === "demo" ? "Démo" : profile.pl),
    "",
    "| Dépôt | Description | Langage | Étoiles | Forks | Mis à jour |",
    "| --- | --- | --- | ---: | ---: | --- |",
  ];
  for (const r of repos) {
    lines.push(
      "| [" +
        mdCell(r.full) +
        "](" +
        r.url +
        ") | " +
        mdCell(r.desc) +
        " | " +
        mdCell(r.lang || "—") +
        " | " +
        r.stars +
        " | " +
        r.forks +
        " | " +
        date(r.updated) +
        " |",
    );
  }
  return lines.join("\n") + "\n";
}

export function repoExport(format, repos) {
  const p = S.prof;
  const base = "gitatlas-" + p.login + "-repos-" + stamp();
  return format === "csv"
    ? {
        name: base + ".csv",
        blob: new Blob([csvText(repos)], { type: "text/csv;charset=utf-8" }),
      }
    : {
        name: base + ".md",
        blob: new Blob([markdownText(p, repos)], {
          type: "text/markdown;charset=utf-8",
        }),
      };
}
