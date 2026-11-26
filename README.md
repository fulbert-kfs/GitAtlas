# GitAtlas

Explorateur de profils GitHub et GitLab en page unique, sans backend ni dépendance à l'exécution. GitAtlas fonctionne hors-ligne avec un profil de démonstration, ou interroge les API publiques pour examiner de vrais comptes : dépôts, arborescence, code source, README, langages et activité. L'interface est disponible en français et en anglais, avec une attention particulière portée à l'accessibilité et au mobile.

## Sommaire

- [Démarrage rapide](#démarrage-rapide)
- [Fonctionnalités](#fonctionnalités)
- [Mode démo et API réelle](#mode-démo-et-api-réelle)
- [Jeton API et dépôts privés](#jeton-api-et-dépôts-privés)
- [Accessibilité et mobile](#accessibilité-et-mobile)
- [Référencement et partage](#référencement-et-partage)
- [Architecture](#architecture)
- [Commandes utiles](#commandes-utiles)
- [Modifier le projet](#modifier-le-projet)
- [Dépannage](#dépannage)

## Démarrage rapide

Aucune installation n'est nécessaire pour utiliser l'application :

1. ouvrez `index.html` dans un navigateur moderne avec JavaScript ;
2. le profil de démonstration s'affiche automatiquement sur `#/u/demo/lina-forge` ;
3. saisissez un pseudo GitHub ou GitLab pour interroger l'API en direct.

Un serveur local reste utile pour tester le routage ou les modules ES sources :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Node.js et `npx` ne servent qu'à régénérer le bundle après une modification du code source (voir [Modifier le projet](#modifier-le-projet)).

## Fonctionnalités

- **Recherche** GitHub ou GitLab avec suggestions, validation du pseudo et bascule de plateforme.
- **Profil** : statistiques, langages, graphiques d'activité, liste des dépôts filtrable et triable.
- **Dépôt** : arborescence navigable, fichiers colorés, README rendu en Markdown, tableau de bord des commits et contributeurs récents.
- **Favoris et dépôts récents** conservés dans le navigateur.
- **Jeton API** par plateforme pour accéder aux dépôts privés.
- **Bascule FR / EN** : seuls les textes de l'interface sont traduits, pas les contenus distants.
- **Partage** : Facebook, X, WhatsApp, LinkedIn, Telegram, e-mail, copie du lien et partage natif du navigateur.
- **Export** : fichiers, README et archive du dépôt, avec un message explicite si le téléchargement est annulé.

## Mode démo et API réelle

Le mode démo lit exclusivement `js/demo-data.js` : aucun appel réseau, aucun pseudo réel, aucune limite d'API. C'est le mode par défaut et il reste accessible même hors connexion.

La recherche d'un vrai compte passe directement par `api.github.com` ou `gitlab.com/api/v4`. Les API publiques imposent des limites de requêtes : sans jeton, un profil très fourni peut donc afficher un message de limite atteinte. Un jeton personnel augmente le quota et ouvre les dépôts privés.

## Jeton API et dépôts privés

Le bouton **Jeton API** de l'en-tête gère un jeton par plateforme.

| Plateforme | Jeton attendu | Clé de stockage |
| --- | --- | --- |
| GitHub | jeton classique avec le scope `repo`, ou jeton affiné avec *Contents: read* | `gitatlas:token` |
| GitLab | jeton personnel avec le scope `read_api` | `gitatlas:token:gitlab` |

Quand le pseudo saisi correspond au compte du jeton, GitAtlas liste également les dépôts privés et lit leur arborescence, leurs fichiers, leurs README et leurs images via les endpoints authentifiés. Ces dépôts portent un badge **Privé**.

**Confidentialité :**

- par défaut, le jeton va dans le `sessionStorage` et disparaît à la fermeture de l'onglet ; il n'est jamais écrit dans le `localStorage` (les anciennes valeurs y sont supprimées automatiquement) ;
- la case **« Ne pas conserver le jeton »** le garde uniquement en mémoire : il est effacé au rechargement de la page, ce qui est préférable sur un ordinateur partagé ;
- le jeton n'est envoyé qu'à l'hôte de la plateforme choisie, via un en-tête `Authorization` ou `PRIVATE-TOKEN`. Aucun serveur intermédiaire n'est utilisé ;
- le bouton **Retirer** efface le jeton de ce navigateur. Pour le révoquer réellement, supprimez-le dans les paramètres GitHub ou GitLab.

Les données enregistrées sous les anciennes clés `gitscope:*` sont migrées automatiquement vers `gitatlas:*` au premier chargement.

## Accessibilité et mobile

L'interface est conçue pour fonctionner du desktop au petit écran :

- aucune barre de défilement horizontale de 320 à 1024 px de large ;
- sur mobile et tablette (≤ 1024 px), les actions de l'en-tête (état de l'API, langues, partage, favoris, jeton) sont regroupées dans un menu hamburger : zone de clic transparente, `aria-expanded`, focus clavier, fermeture par Échap et retour automatique au bouton lors d'une navigation ;
- sur mobile, la carte profil garde l'avatar à côté de l'identité (64 à 76 px) et étire ses actions en bas avec des cibles de 44 px ;
- en vue liste mobile, chaque dépôt passe sur deux rangs (nom/étoiles/favori puis langage/forks/date) au lieu de colonnes trop étroites ;
- sur mobile, la barre des dépôts se réorganise en grille (recherche, langage/tri, types, compte/vue) dans l'ordre du balisage, avec des cibles tactiles de 44 px ;
- sur mobile, les onglets d'un dépôt (Fichiers, README, Langages, Commits) restent sur une seule ligne et défilent horizontalement sans se chevaucher, avec un indicateur aligné sur l'onglet actif ;
- les boutons grille/liste sont des carrés dont l'icône est centrée par la grille CSS, et la gouttière de la barre verticale reste réservée pour éviter tout décalage horizontal à l'ouverture d'un voile, d'un tiroir ou d'une modale ;
- sur tablette (721–1024 px), la mise en page reste celle du desktop mais les contrôles tactiles gardent une cible de 44 px (filtres, onglets, arborescence, copie, modale) ;
- cibles tactiles d'au moins 44 × 44 px, effets de survol réservés aux pointeurs fins et retour au `:active` sur appui ;
- navigation clavier, focus visible, zones défilantes accessibles au clavier, annonces des notifications via une région live ;
- respect de `prefers-reduced-motion` : les animations sont remplacées par des transitions légères ou supprimées.

Les vues testées avec axe-core 4.12.1 (accueil, profil, dépôt, menu de partage, FR/EN, 320 px) ne présentent aucune violation. Les contrastes des textes à dégradé, que l'outil ne peut pas calculer automatiquement, sont vérifiés manuellement.

## Référencement et partage

`index.html` contient les balises `canonical`, Open Graph et Twitter Card, ainsi qu'un bloc JSON-LD `WebSite`. L'image de partage est `assets/og-cover.png` (1200 × 630), générée depuis `assets/og-cover.svg`. Le titre et la description des métadonnées suivent la vue affichée pour les onglets et les aperçus qui exécutent JavaScript.

Le routage utilise un fragment `#/…` : les crawlers ne voient qu'une URL côté serveur. `sitemap.xml` ne référence donc que la racine, volontairement, puisque les profils et dépôts sont générés côté client. Les réseaux sociaux ne lisent pas le fragment ni le JavaScript : les balises statiques du `<head>` restent la source de leurs aperçus.

Le domaine de production est configuré sur `https://gitatlas-explorer.netlify.app` dans quatre endroits synchronisés :

1. `SITE_URL` dans `js/seo.js`, utilisé à l'exécution ;
2. le bloc statique du `<head>` de `index.html` (canonical, OG, Twitter et JSON-LD) ;
3. `sitemap.xml` ;
4. `robots.txt` (URL du sitemap).

Si le nom Netlify change, mettre à jour ces quatre emplacements puis régénérer `js/bundle.js`.

Après une modification du visuel source, régénérer le PNG avec un navigateur pour conserver le rendu exact des dégradés de texte :

```bash
chromium --headless --no-sandbox --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --screenshot=assets/og-cover.png \
  "file://$PWD/assets/og-cover.svg"
```

## Architecture

GitAtlas est une application statique : une seule page, un routeur par fragment d'URL et des modules ES compilés en un script classique autonome. Il n'y a ni serveur applicatif ni base de données. Le jeton reste dans le navigateur et les données sont demandées directement aux plateformes.

- `js/main.js` : point d'entrée, initialise les modules au chargement.
- `js/flows.js` : routage `#/u/<plateforme>/<pseudo>` et `#/r/<plateforme>/<pseudo>/<dépôt>`, orchestration des chargements.
- `js/api.js` : appels GitHub et GitLab, gestion des erreurs et des limites.
- `js/state.js` : état global, caches et lecture des jetons.
- `js/profile.js`, `js/repo.js`, `js/components.js` : rendu des vues et des composants.
- `js/tree.js`, `js/markdown.js`, `js/highlight.js`, `js/languages.js`, `js/charts.js` : affichage des fichiers, du Markdown, de la coloration et des graphiques.
- `js/search.js`, `js/modal.js`, `js/ui.js`, `js/rate.js` : recherche, modale, favoris, notifications et état de l'API.
- `js/menu.js` : menu hamburger mobile/tablette (voile, focus, `aria-expanded`, fermeture au resize desktop).
- `js/i18n.js` : dictionnaire FR/EN et traduction du DOM après rendu.
- `js/seo.js`, `js/share.js` : métadonnées dynamiques et menu de partage.
- `js/effects.js`, `js/hero-graph.js` : animations et visuel d'accueil.
- `js/demo-data.js` : jeu de données hors-ligne.

```text
gitscope/
├── index.html              # page unique, métadonnées statiques et structure
├── css/styles.css          # styles, thème sombre, responsive et mobile
├── js/
│   ├── main.js             # point d'entrée source
│   ├── bundle.js           # bundle généré, chargé par index.html
│   ├── api.js              # GitHub / GitLab et chargement des données
│   ├── flows.js            # routage et flux
│   ├── state.js            # état, caches et jetons
│   ├── profile.js          # vue profil
│   ├── repo.js             # vue dépôt
│   ├── components.js       # composants HTML réutilisables
│   ├── tree.js             # arborescence
│   ├── markdown.js         # rendu Markdown
│   ├── highlight.js        # coloration syntaxique
│   ├── languages.js        # langages et couleurs de fichiers
│   ├── charts.js           # graphiques
│   ├── search.js           # recherche et suggestions
│   ├── modal.js            # modale et tiroir
│   ├── menu.js             # menu hamburger mobile/tablette
│   ├── ui.js               # favoris, récents, toasts
│   ├── rate.js             # état de l'API
│   ├── i18n.js             # interface FR / EN
│   ├── seo.js              # métadonnées et URL de partage
│   ├── share.js            # menu social
│   ├── effects.js          # animations après rendu
│   ├── hero-graph.js       # graphe d'accueil
│   ├── icons.js            # icônes SVG
│   ├── utils.js            # utilitaires et téléchargements
│   ├── demo-data.js        # données de démonstration
│   └── events.js           # délégation des événements
├── assets/
│   ├── og-cover.svg        # source de la carte de partage
│   └── og-cover.png        # carte de partage 1200 × 630
├── robots.txt
├── sitemap.xml
└── README.md
```

**Choix de conception :**

- le bundle IIFE permet d'ouvrir `index.html` en `file://` sans serveur ni import de modules ;
- le routage par fragment évite toute configuration de réécriture d'URL côté hébergement ;
- les métadonnées statiques garantissent l'aperçu social quand le crawler n'exécute pas JS ;
- les jetons ne transitent jamais par un backend, ce qui supprime un point de défaillance et un stockage serveur.

## Commandes utiles

| Commande | Usage |
| --- | --- |
| ouvrir `index.html` | Utiliser l'application, y compris la démo hors-ligne |
| `python3 -m http.server 8000` | Servir le dossier en HTTP pour tester les modules ES |
| `npx esbuild js/main.js --bundle --format=iife --target=es2020 --outfile=js/bundle.js` | Régénérer le bundle après une modification JS |
| commande `chromium --headless …` ci-dessus | Régénérer `assets/og-cover.png` |

## Déploiement Netlify

Le dépôt contient un `netlify.toml` : la racine est publiée directement, sans commande de build. Importez `fulbert-kfs/GitAtlas` dans Netlify et lancez le déploiement ; les en-têtes de sécurité du fichier de configuration sont appliqués automatiquement. Le routage par fragment (`#/...`) ne nécessite aucune réécriture d'URL.

La politique `Content-Security-Policy` n'autorise pas les scripts inline : le badge « Powered by Netlify » injecté par la plateforme sur les projets gratuits ne peut donc pas s'afficher, sans abonnement payant. Les appels aux API GitHub/GitLab et les images distantes restent autorisés. Si vous désactivez cette politique, le badge réapparaîtra.

## Modifier le projet

Les sources sont dans `js/`. `index.html` charge `js/bundle.js` : modifier un module source sans régénérer le bundle n'a aucun effet visible. Après chaque modification JS :

```bash
npx esbuild js/main.js --bundle --format=iife --target=es2020 --outfile=js/bundle.js
```

Pour travailler directement avec les modules ES, servez le dossier en HTTP et remplacez dans `index.html` :

```html
<script src="js/bundle.js"></script>
<!-- devient -->
<script type="module" src="js/main.js"></script>
```

Deux points à connaître :

- dans `js/demo-data.js`, les contenus de fichiers utilisent des templates `raw` dont l'indentation commune est retirée et dont les antislashs sont préservés ; gardez ce format si vous ajoutez des fichiers à la démo ;
- dans `js/i18n.js`, les clés du dictionnaire doivent correspondre exactement aux textes sources, y compris la ponctuation et les espaces, sinon la traduction ne s'applique pas.

## Dépannage

| Symptôme | Cause probable | Action |
| --- | --- | --- |
| Message « Limite API atteinte » | Quota des API publiques épuisé | Patienter jusqu'au rétablissement ou ajouter un jeton |
| Dépôts privés absents | Aucun jeton, ou pseudo différent du compte du jeton | Vérifier le jeton et le pseudo dans la modale |
| Métadonnées avec l'ancien domaine | Nom Netlify modifié depuis la configuration | Mettre à jour les quatre emplacements puis régénérer le bundle |
| Téléchargement annulé signalé | Sélecteur de fichier natif fermé par l'utilisateur | Recommencer et confirmer l'enregistrement |
| Modification JS invisible | Bundle non régénéré | Relancer la commande `esbuild` ci-dessus |
