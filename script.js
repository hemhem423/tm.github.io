(() => {
  "use strict";

  /* ============================================================
     ユーティリティ
  ============================================================ */
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  /* ============================================================
     要素取得
  ============================================================ */
  const loader  = document.getElementById("js-loader");
  const sidebar = document.getElementById("js-sidebar");
  const main    = document.getElementById("js-main");

  /* ============================================================
     ローダー
     ※ index.js のみ「1時間キャッシュ」ロジックを持つため両方に対応
  ============================================================ */
  const LOADER_KEY = "tondama_loader_last";
  const ONE_HOUR   = 24 * 60 * 60 * 1000;
  const last       = Number(localStorage.getItem(LOADER_KEY) || 0);
  const skipLoader = Date.now() - last < ONE_HOUR;

  function showLayout() {
    if (window.innerWidth > 1100) sidebar.classList.add("is-visible");
    main.classList.add("is-visible");
  }

  if (loader) {
    if (skipLoader) {
      loader.style.display = "none";
      showLayout();
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => {
          loader.classList.add("is-hidden");
          setTimeout(() => {
            loader.style.display = "none";
            showLayout();
            localStorage.setItem(LOADER_KEY, String(Date.now()));
          }, 900);
        }, 600);
      });
    }
  }

  /* ============================================================
     リサイズ対応 (works ページ側のみにあった処理)
  ============================================================ */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
      sidebar.classList.add("is-visible");
      sidebar.classList.remove("is-mobile-open");
    } else {
      sidebar.classList.remove("is-visible");
    }
  });

  /* ============================================================
     モバイル ナビトグル
  ============================================================ */
  const toggle = document.getElementById("js-toggle");
  if (toggle) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("is-mobile-open");
    });
  }
  if (main) {
    main.addEventListener("click", () =>
      sidebar.classList.remove("is-mobile-open"),
    );
  }

  /* ============================================================
     Scroll Reveal
  ============================================================ */
  if (main) {
    const reveals = main.querySelectorAll(".js-reveal");
    const revIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const siblings = e.target.parentElement.querySelectorAll(".js-reveal");
          let delay = 0;
          siblings.forEach((el, i) => {
            if (el === e.target) delay = i * 90;
          });
          setTimeout(() => e.target.classList.add("is-visible"), delay);
          revIO.unobserve(e.target);
        });
      },
      { root: main, threshold: 0.1 },
    );
    reveals.forEach((el) => revIO.observe(el));
  }

  /* ============================================================
     カードチルト (hero グリッド用)
  ============================================================ */
  if (main) {
    main.querySelectorAll(".js-wc").forEach((c) => {
      c.addEventListener("mousemove", (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        c.style.transform = `translateY(-6px) rotate(${x * 2.5}deg) rotateX(${-y * 2.5}deg)`;
      });
      c.addEventListener("mouseleave", () => (c.style.transform = ""));
    });
  }

  /* ============================================================
     カテゴリフィルター (index / hero グリッド用)
  ============================================================ */
  const cats    = document.querySelectorAll(".hero__cat");
  const cells   = document.querySelectorAll(".hero__cell");
  const countEl = document.getElementById("js-count");

  cats.forEach((cat) => {
    cat.addEventListener("click", () => {
      cats.forEach((c) => c.classList.remove("is-active"));
      cat.classList.add("is-active");
      const f = cat.dataset.filter;
      cells.forEach((cell) => {
        const match = f === "all" || cell.dataset.cat === f;
        cell.style.opacity       = match ? "1"    : "0.22";
        cell.style.pointerEvents = match ? "auto" : "none";
      });
      if (countEl) countEl.textContent = f === "all" ? "All" : f;
    });
  });

  /* ============================================================
     カスタムカーソル
  ============================================================ */
  const dot  = document.getElementById("js-cdot");
  const ring = document.getElementById("js-cring");
  if (dot && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top  = my + "px";
    });
    const loop = () => {
      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      ring.style.left = rx + "px";
      ring.style.top  = ry + "px";
      requestAnimationFrame(loop);
    };
    loop();
    document
      .querySelectorAll("a,button,.hero__cell,.js-wc,.hero__cat,.si,.skill-card")
      .forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("is-hovered"));
        el.addEventListener("mouseleave", () => ring.classList.remove("is-hovered"));
      });
  }

  /* ============================================================
     Works フィルター (works ページ用)
  ============================================================ */
  const filterBtns   = document.querySelectorAll(".works-filter__btn");
  const workItems    = document.querySelectorAll(".work-item");
  const visibleCount = document.getElementById("js-visible-count");

  function updateCount() {
    if (!visibleCount) return;
    visibleCount.textContent = [...workItems].filter(
      (i) => !i.classList.contains("is-hidden"),
    ).length;
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      workItems.forEach((item) => {
        const match = f === "all" || item.dataset.cat === f;
        item.classList.toggle("is-hidden", !match);
      });
      updateCount();
    });
  });

  /* ============================================================
     ライトボックス (works ページ用)
  ============================================================ */
  const lb        = document.getElementById("js-lb");
  const lbClose   = document.getElementById("js-lb-close");
  const lbImg     = document.getElementById("js-lb-img");
  const lbNum     = document.getElementById("js-lb-num");
  const lbCat     = document.getElementById("js-lb-cat");
  const lbTitle   = document.getElementById("js-lb-title");
  const lbDesc    = document.getElementById("js-lb-desc");
  const lbTagsEl  = document.getElementById("js-lb-tags");
  const lbLink    = document.getElementById("js-lb-link");
  const lbPrev    = document.getElementById("js-lb-prev");
  const lbNext    = document.getElementById("js-lb-next");

  let currentIndex = 0;

  function getVisibleItems() {
    return [...workItems].filter((i) => !i.classList.contains("is-hidden"));
  }

  function renderLightbox(items, idx) {
    const item  = items[idx];
    const total = items.length;
    lbImg.src           = item.dataset.img   || "";
    lbImg.alt           = item.dataset.title || "";
    lbCat.textContent   = item.dataset.cat   || "";
    lbTitle.textContent = item.dataset.title || "";
    lbDesc.textContent  = item.dataset.desc  || "";
    lbLink.href         = item.dataset.url   || "#";
    lbNum.textContent   = `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

    lbTagsEl.innerHTML = "";
    (item.dataset.tags || "").split(",").forEach((tag) => {
      if (!tag.trim()) return;
      const span = document.createElement("span");
      span.className   = "lb-info__tag";
      span.textContent = tag.trim();
      lbTagsEl.appendChild(span);
    });

    lbPrev.style.display = idx > 0              ? "flex" : "none";
    lbNext.style.display = idx < total - 1      ? "flex" : "none";
  }

  function openLightbox(item) {
    const items  = getVisibleItems();
    currentIndex = items.indexOf(item);
    renderLightbox(items, currentIndex);
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (lb) {
    workItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (!item.classList.contains("is-hidden")) openLightbox(item);
      });
    });

    lbClose.addEventListener("click", closeLightbox);
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });

    lbPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      const items = getVisibleItems();
      if (currentIndex > 0) { currentIndex--; renderLightbox(items, currentIndex); }
    });
    lbNext.addEventListener("click", (e) => {
      e.stopPropagation();
      const items = getVisibleItems();
      if (currentIndex < items.length - 1) { currentIndex++; renderLightbox(items, currentIndex); }
    });

    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      const items = getVisibleItems();
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft"  && currentIndex > 0)              { currentIndex--; renderLightbox(items, currentIndex); }
      if (e.key === "ArrowRight" && currentIndex < items.length - 1) { currentIndex++; renderLightbox(items, currentIndex); }
    });

    let touchStartX = 0;
    lb.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend",   (e) => {
      const diff  = touchStartX - e.changedTouches[0].clientX;
      const items = getVisibleItems();
      if (Math.abs(diff) < 40) return;
      if (diff > 0 && currentIndex < items.length - 1) { currentIndex++; renderLightbox(items, currentIndex); }
      if (diff < 0 && currentIndex > 0)                { currentIndex--; renderLightbox(items, currentIndex); }
    }, { passive: true });
  }

  /* ============================================================
     プロフィールカード (about / top ページ用)
  ============================================================ */
  (() => {
    const CONFIG = {
      baseRotate:   2.35,
      tiltRange:    12,
      rotateXRange: 14,
      lerpSpeed:    0.1,
      easeIn:  "transform 0.06s linear",
      easeOut: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      scrollReveal: true,
    };

    /* ── カードチルト + グレア + バッジ視差 ── */
    function initCardTilt() {
      const stage = document.getElementById("js-top-profile");
      const card  = document.getElementById("js-top-card");
      if (!stage || !card) return;

      let isInside = false;
      let targetRotX = 0, targetRotY = 0;
      let curRotX    = 0, curRotY    = 0;
      let targetGx   = 50, targetGy  = 50;
      let curGx      = 50, curGy     = 50;
      let rafId      = null;

      const badges = card.querySelectorAll(".top-profile__name .job");

      stage.addEventListener("mouseenter", () => {
        isInside = true;
        card.style.transition = CONFIG.easeIn;
        badges.forEach((b) => (b.style.transition = "transform 0.5s ease, color 0.3s ease"));
        startRaf();
      });

      stage.addEventListener("mousemove", (e) => {
        const rect = stage.getBoundingClientRect();
        const nx   = (e.clientX - rect.left)  / rect.width  - 0.5;
        const ny   = (e.clientY - rect.top)   / rect.height - 0.5;

        targetRotY = clamp(nx  *  CONFIG.tiltRange,    -CONFIG.tiltRange,    CONFIG.tiltRange);
        targetRotX = clamp(-ny *  CONFIG.rotateXRange, -CONFIG.rotateXRange, CONFIG.rotateXRange);

        const cardRect = card.getBoundingClientRect();
        targetGx = clamp(((e.clientX - cardRect.left) / cardRect.width)  * 100, 0, 100);
        targetGy = clamp(((e.clientY - cardRect.top)  / cardRect.height) * 100, 0, 100);

        badges.forEach((b) => {
          b.style.transform = `translate(${-nx * 6}px, ${-ny * 4}px)`;
        });
      });

      stage.addEventListener("mouseleave", () => {
        isInside   = false;
        targetRotX = targetRotY = 0;
        targetGx   = targetGy  = 50;
        card.style.transition = CONFIG.easeOut;
        badges.forEach((b) => (b.style.transform = "translate(0,0)"));
      });

      function startRaf() {
        if (rafId) return;
        function tick() {
          curRotX = lerp(curRotX, targetRotX, CONFIG.lerpSpeed);
          curRotY = lerp(curRotY, targetRotY, CONFIG.lerpSpeed);
          curGx   = lerp(curGx,   targetGx,   0.08);
          curGy   = lerp(curGy,   targetGy,   0.08);

          const rotate = CONFIG.baseRotate + curRotY * 0.35;
          card.style.transform =
            `rotate(${rotate.toFixed(4)}deg) ` +
            `rotateX(${curRotX.toFixed(4)}deg) ` +
            `rotateY(${curRotY.toFixed(4)}deg)`;
          card.style.setProperty("--gx", `${curGx.toFixed(2)}%`);
          card.style.setProperty("--gy", `${curGy.toFixed(2)}%`);

          const dist =
            Math.abs(curRotX) + Math.abs(curRotY) +
            Math.abs(curGx - 50) + Math.abs(curGy - 50);
          if (!isInside && dist < 0.1) {
            card.style.transform = `rotate(${CONFIG.baseRotate}deg)`;
            card.style.setProperty("--gx", "50%");
            card.style.setProperty("--gy", "50%");
            rafId = null;
            return;
          }
          rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
      }
    }

    /* ── スクロールで clip-path 展開 + カード scale イン ── */
    function initStageReveal() {
      if (!CONFIG.scrollReveal) return;
      const stage = document.getElementById("js-top-profile");
      const card  = document.getElementById("js-top-card");
      if (!stage) return;

      stage.style.clipPath  = "inset(0px 10% round 20px)";
      stage.style.transition = "none";
      if (card) {
        card.style.opacity   = "0";
        card.style.transform = `rotate(${CONFIG.baseRotate}deg) scale(0.92)`;
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            requestAnimationFrame(() => {
              stage.style.transition = "clip-path 1.0s cubic-bezier(0.16, 1, 0.3, 1)";
              stage.style.clipPath   = "inset(0px 0% round 20px)";
              if (card) {
                setTimeout(() => {
                  card.style.transition =
                    "opacity 0.7s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)";
                  card.style.opacity   = "1";
                  card.style.transform = `rotate(${CONFIG.baseRotate}deg) scale(1)`;
                  setTimeout(() => { card.style.transition = CONFIG.easeOut; }, 900);
                }, 300);
              }
            });
            io.unobserve(stage);
          });
        },
        { root: document.getElementById("js-main") || null, threshold: 0.15 },
      );
      io.observe(stage);
    }

    /* ── スクロール視差: カードが少し浮き上がる ── */
    function initCardParallax() {
      const stage    = document.getElementById("js-top-profile");
      const card     = document.getElementById("js-top-card");
      if (!stage || !card) return;

      const scroller = document.getElementById("js-main") || window;
      function onScroll() {
        if (stage.matches(":hover")) return;
        const rect     = stage.getBoundingClientRect();
        const vpH      = window.innerHeight;
        const progress = clamp(1 - (rect.top + rect.height / 2) / vpH, 0, 1);
        const ty       = lerp(4.5, 0, progress);
        card.style.transform =
          `translateY(${ty.toFixed(3)}%) rotate(${CONFIG.baseRotate}deg)`;
      }
      scroller.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* ── SVG "profile" 文字: 描画アニメーション ── */
    function initProfileTextDraw() {
      const svgText = document.querySelector(".top-profile__hd .svg-text text");
      if (!svgText) return;
      try {
        const length = svgText.getTotalLength?.() ?? 800;
        svgText.style.strokeDasharray  = length;
        svgText.style.strokeDashoffset = length;
        svgText.style.fill       = "none";
        svgText.style.transition = "none";

        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              svgText.style.transition =
                "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s";
              svgText.style.strokeDashoffset = "0";
              io.unobserve(svgText);
            });
          },
          { root: document.getElementById("js-main") || null, threshold: 0.5 },
        );
        io.observe(svgText);
      } catch (_) { /* SVGText 非対応環境はスキップ */ }
    }

    function init() {
      initStageReveal();
      initCardTilt();
      initCardParallax();
      initProfileTextDraw();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();

  /* ============================================================
     NEWS アコーディオン (全ページ共通)
  ============================================================ */
  document.querySelectorAll(".news__btn").forEach((btn) => {
    const body = btn.nextElementSibling;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        body.style.height = "";
        body.style.setProperty("--body-h", body.scrollHeight + "px");
        body.classList.remove("is-open");
        body.classList.add("is-closing");
        btn.setAttribute("aria-expanded", "false");

        body.addEventListener("animationend", () => {
          body.classList.remove("is-closing");
          body.style.removeProperty("--body-h");
          body.setAttribute("hidden", "");
        }, { once: true });
      } else {
        body.removeAttribute("hidden");
        const h = body.scrollHeight;
        body.style.setProperty("--body-h", h + "px");
        body.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");

        body.addEventListener("animationend", () => {
          body.classList.remove("is-open");
          body.style.height = "auto";
        }, { once: true });
      }
    });
  });

  /* ============================================================
     コンタクトフォーム (index ページ用)
  ============================================================ */
  const form = document.getElementById("js-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector(".cf__submit");
      btn.textContent = "送信中...";
      btn.disabled    = true;
      setTimeout(() => {
        btn.textContent       = "✓ 送信完了！ありがとうございます";
        btn.style.background  = "var(--color-turquoise)";
        btn.style.color       = "var(--color-ink)";
        form.reset();
        setTimeout(() => {
          btn.textContent      = "送信する →";
          btn.style.background = "";
          btn.style.color      = "";
          btn.disabled         = false;
        }, 4000);
      }, 1200);
    });
  }
})();