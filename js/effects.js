// ANIMATIONS APRÈS RENDU
import { $ } from "./utils.js";
import { REDUCED } from "./utils.js";
import { fmtNum } from "./utils.js";

/* ============================== ANIMATIONS APRÈS RENDU ============================== */
export let IO = null;
export function observeReveals(root) {
  if (!IO) {
    IO = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            IO.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
  }
  (root || document)
    .querySelectorAll(".reveal:not(.in)")
    .forEach((el) => IO.observe(el));
}
export function postRender() {
  observeReveals($("stage"));
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      document.querySelectorAll(".dseg[data-da]").forEach((c) => {
        c.style.strokeDasharray = c.dataset.da;
      });
    }),
  );
  const nums = $("stage").querySelectorAll("[data-count]");
  nums.forEach((el) => {
    const target = +el.dataset.count || 0;
    if (REDUCED || target === 0) {
      el.textContent = fmtNum(target);
      return;
    }
    const t0 = performance.now(),
      dur = 850;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtNum(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
