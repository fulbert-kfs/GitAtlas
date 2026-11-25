// DONNÉES DE DÉMONSTRATION
import { hashStr } from "./utils.js";
import { initialsAvatar } from "./utils.js";
import { mulberry32 } from "./utils.js";

/* ============================== DONNÉES DE DÉMONSTRATION ============================== */
// Balise de template qui conserve les backslashes tels quels (comme String.raw)
// et supprime l'indentation commune aux lignes : les fichiers démo restent
// lisibles dans le source et s'affichent avec leurs vrais retours à la ligne.
export function raw(strings, ...values) {
  let text = strings.raw[0];
  for (let i = 0; i < values.length; i++) text += values[i] + strings.raw[i + 1];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines[0] === "") lines.shift();
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)[0].length);
  const pad = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => (line.trim() ? line.slice(pad) : "")).join("\n");
}

export const DEMO_USER = {
  pl: "demo",
  login: "lina-forge",
  name: "Lina Forge",
  avatar: initialsAvatar("Lina Forge"),
  bio: "Développeuse systèmes & créative. Je construis des outils rapides, accessibles et joliment documentés. Rendu temps réel le jour, open source la nuit.",
  company: "Atelier Nova",
  location: "Lyon, France",
  blog: "https://linaforge.dev",
  twitter: "linaforge",
  followers: 1284,
  following: 182,
  publicRepos: 12,
  created: "2016-03-14T10:22:00Z",
  url: null,
  org: false,
};
export const DEMO_REPOS = [
  {
    meta: {
      name: "pulse-ui",
      desc: "Bibliothèque de composants web légers, accessibles et sans dépendance. 4 Ko gzip, tokens CSS, zéro framework.",
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "tinyvec",
      desc: "Algèbre linéaire SIMD header-only pour le temps réel. Vec4, Mat4 et quaternions, zéro allocation.",
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "orbital",
      desc: "Moteur de particules 2D sur canvas : 60 fps avec 20 000 particules, presets et zéro dépendance.",
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "forge-cli",
      desc: "Générateur de projets ultra-rapide avec templates interactifs. Un binaire de 2 Mo, démarrage en 8 ms.",
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "dataverve",
      desc: "Visualisation de données déclarative pour notebooks. Des graphiques SVG élégants en trois lignes de Python.",
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
      branch: "main",
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
      `,
    },
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "chroma-forge",
      desc: "Générateur de palettes perceptuelles OKLCH pour designers. Export CSS, Tailwind et Figma tokens.",
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "commitlog",
      desc: "Historique de commits lisible pour vos releases. Parse les conventional commits et génère un changelog.",
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "kernel-notes",
      desc: "Notes publiques sur les systèmes, le rendu graphique et la performance. Apprendre en public, une note à la fois.",
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "nova-deploy",
      desc: "Scripts de déploiement blue-green sans downtime. Bascule nginx atomique, healthchecks et rollback en 10 s.",
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
      branch: "main",
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
      `,
    },
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
      branch: "main",
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
      `,
    },
  },
  {
    meta: {
      name: "sandbox-2019",
      desc: "Vieux bacs à sable d'expériences canvas de 2019. Conservé pour la postérité et la nostalgie.",
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
      branch: "master",
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
      `,
    },
  },
];
(function finishDemo() {
  const now = Date.now();
  DEMO_REPOS.forEach((r, idx) => {
    const m = r.meta;
    for (const k in r.files) {
      r.files[k] = r.files[k]
        .split("@@STARTSCRIPT@@")
        .join("<scr" + "ipt")
        .split("@@ENDSCRIPT@@")
        .join("</scr" + "ipt>");
    }
    m.pl = "demo";
    m.id = 1000 + idx;
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
      size: new Blob([r.files[p]]).size,
    }));
  });
})();
export const DEMO_MSGS = {
  "pulse-ui": [
    "feat(tabs): navigation clavier complète (flèches + Home/End)",
    "fix(button): focus visible restauré sur Safari 18",
    "perf: shadow templates clonés une seule fois",
    "docs: guide de theming par tokens",
    "test: couverture a11y des roles ARIA",
    "chore: esbuild 0.24, vitest 2.1",
  ],
  tinyvec: [
    "perf: dot product SSE2 avec shuffle unique",
    "feat: cross product et quaternions de base",
    "fix: alignement 16 octets sur MSVC",
    "bench: harness chrono steady_clock",
    "test: fallback scalaire bit-à-bit",
    "docs: tableau de bench Ryzen actualisé",
  ],
  orbital: [
    "feat: preset vortex avec attraction amortie",
    "perf: swap-and-pop sans allocation par frame",
    "fix: dpr plafonné à 2 sur écrans 3x",
    "feat: traînes par fillRect semi-transparent",
    "docs: démo plein écran",
    "refactor: pool Float32Array unique",
  ],
  "forge-cli": [
    "feat: templates distants via git clone --depth 1",
    "fix: prompt par défaut sur stdin non-tty",
    "perf: démarrage 8 ms (strip + lto)",
    "feat: hooks post-génération",
    "docs: roadmap registre communautaire",
    "test: génération sur arborescence profonde",
  ],
  dataverve: [
    "feat: échelle log10 avec garde-fous",
    "fix: arrondi SVG déterministe entre plateformes",
    "feat: palette par défaut accessible",
    "docs: quickstart trois lignes",
    "test: bornes des échelles linéaires",
    "chore: ruff 0.6, hatchling",
  ],
  "relay-edge": [
    "feat: files bornées drop-oldest par client",
    "fix: fermeture propre des clients lents",
    "feat: endpoint /healthz",
    "perf: verrous par shard de topics",
    "docs: architecture du hub",
    "chore: go 1.23, websocket 1.8.11",
  ],
  "chroma-forge": [
    "feat: export :root CSS en un clic",
    "feat: curseur de chroma 0.02 → 0.32",
    "fix: gamut mapping sRGB clampé",
    "docs: pourquoi OKLCH plutôt que HSL",
    "refactor: conversion Ottosson isolée",
    "chore: svelte 5, vite 6",
  ],
  commitlog: [
    "feat: détection BREAKING CHANGE",
    "fix: scope optionnel dans la regex",
    "feat: regroupement par type avec emojis",
    "docs: types reconnus",
    "test: parseur sur 200 messages réels",
    "chore: node --test natif",
  ],
  "kernel-notes": [
    "note: rendu GPU-driven et mesh shaders",
    "note: allocateurs à arènes, mesures orbital",
    "note: SIMD sans pleurer",
    "note: pipeline de rendu en une page",
    "fix: coquilles et liens internes",
    "docs: index des notes",
  ],
  "nova-deploy": [
    "feat: rollback testé en dry-run",
    "fix: healthcheck avec max-time 2s",
    "feat: bascule atomique par symlink",
    "docs: garanties sans downtime",
    "refactor: ports par slot constants",
    "fix: nginx backup upstream",
  ],
  "pulse-ui-examples": [
    "feat: exemple dashboard tabs + dialog",
    "fix: version unpkg épinglée",
    "docs: recettes communautaires",
    "chore: sync pulse-ui 2.4",
    "feat: thème sombre par tokens",
    "docs: npx serve .",
  ],
  "sandbox-2019": [
    "archive: dernière sauvegarde 2019",
    "feat: value noise fait main",
    "feat: feux d artifice click burst",
    "fix: splice en boucle inverse",
    "docs: avertissement production",
    "init: premiers essais canvas",
  ],
};
export const DEMO_PEOPLE = [
  ["Lina Forge", DEMO_USER.avatar],
  ["Marc Dubois", initialsAvatar("Marc Dubois")],
  ["Awa Ndiaye", initialsAvatar("Awa Ndiaye")],
];
export function demoCommits(r) {
  if (r._commits) return r._commits;
  const rnd = mulberry32(hashStr(r.meta.name));
  const msgs = DEMO_MSGS[r.meta.name] || DEMO_MSGS["pulse-ui"];
  let t = new Date(r.meta.pushed).getTime();
  const out = msgs.slice(0, 7).map((msg, i) => {
    const who =
      rnd() < 0.72 ? DEMO_PEOPLE[0] : DEMO_PEOPLE[1 + Math.floor(rnd() * 2)];
    const sha = Array.from(
      { length: 40 },
      () => "0123456789abcdef"[Math.floor(rnd() * 16)],
    ).join("");
    const c = {
      sha,
      msg,
      author: who[0],
      avatar: who[1],
      date: new Date(t).toISOString(),
      url: null,
    };
    t -= (2 + Math.floor(rnd() * 8)) * 86400000;
    return c;
  });
  r._commits = out;
  return out;
}
