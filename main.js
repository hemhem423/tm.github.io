      (() => {
        "use strict";

        /* ---- Loader ---- */
        const loader = document.getElementById("js-loader");
        const sidebar = document.getElementById("js-sidebar");
        const main = document.getElementById("js-main");

        window.addEventListener("load", () => {
          setTimeout(() => {
            loader.classList.add("is-hidden");
            setTimeout(() => {
              loader.style.display = "none";
              sidebar.classList.add("is-visible");
              main.classList.add("is-visible");
            }, 900);
          }, 600);
        });

        /* ---- Mobile toggle ---- */
        const toggle = document.getElementById("js-toggle");
        toggle.addEventListener("click", () =>
          sidebar.classList.toggle("is-mobile-open"),
        );
        main.addEventListener("click", () =>
          sidebar.classList.remove("is-mobile-open"),
        );

        

        /* ---- Scroll Reveal ---- */
        const reveals = main.querySelectorAll(".js-reveal");
        const revIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              const siblings =
                e.target.parentElement.querySelectorAll(".js-reveal");
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

        /* ---- Card tilt ---- */
        main.querySelectorAll(".js-wc").forEach((c) => {
          c.addEventListener("mousemove", (e) => {
            const r = c.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            c.style.transform = `translateY(-6px) rotate(${x * 2.5}deg) rotateX(${-y * 2.5}deg)`;
          });
          c.addEventListener("mouseleave", () => (c.style.transform = ""));
        });

        /* ---- Category filter ---- */
        const cats = document.querySelectorAll(".hero__cat");
        const cells = document.querySelectorAll(".hero__cell");
        const countEl = document.getElementById("js-count");

        cats.forEach((cat) => {
          cat.addEventListener("click", () => {
            cats.forEach((c) => c.classList.remove("is-active"));
            cat.classList.add("is-active");
            const f = cat.dataset.filter;
            cells.forEach((cell) => {
              const match = f === "all" || cell.dataset.cat === f;
              cell.style.opacity = match ? "1" : "0.22";
              cell.style.pointerEvents = match ? "auto" : "none";
            });
            if (countEl) countEl.textContent = f === "all" ? "All" : f;
          });
        });

        /* ---- Custom cursor ---- */
        const dot = document.getElementById("js-cdot");
        const ring = document.getElementById("js-cring");
        if (dot && ring) {
          let mx = 0,
            my = 0,
            rx = 0,
            ry = 0;
          document.addEventListener("mousemove", (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.left = mx + "px";
            dot.style.top = my + "px";
          });
          const lerp = (a, b, t) => a + (b - a) * t;
          const loop = () => {
            rx = lerp(rx, mx, 0.12);
            ry = lerp(ry, my, 0.12);
            ring.style.left = rx + "px";
            ring.style.top = ry + "px";
            requestAnimationFrame(loop);
          };
          loop();
          document
            .querySelectorAll("a,button,.hero__cell,.js-wc,.hero__cat,.si")
            .forEach((el) => {
              el.addEventListener("mouseenter", () =>
                ring.classList.add("is-hovered"),
              );
              el.addEventListener("mouseleave", () =>
                ring.classList.remove("is-hovered"),
              );
            });
        }
/**
 * about-card.js
 * doisena.jp 参考: プロフィールカードのインタラクション
 *
 * 依存: なし (Vanilla JS)
 * 呼び出し: DOMContentLoaded 後に initProfileCard() を実行するか、
 *           <script defer> で読み込む
 */


(() => {
  'use strict';
 
  /* ----------------------------------------------------------
     設定: 数値を大きくして動きをリッチに
  ---------------------------------------------------------- */
  const CONFIG = {
    baseRotate:   2.35,   // 初期傾き (deg)
    tiltRange:    12,     // ← 6→12 : 横方向の最大傾き
    rotateXRange: 14,     // ← 8→14 : 縦方向の最大傾き
    lerpSpeed:    0.1,    // ← 0.15→0.10 : 追従を少し遅く(慣性感)
    easeIn:       'transform 0.06s linear',
    easeOut:      'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    scrollReveal: true,
  };
 
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
 
  /* ----------------------------------------------------------
     【強化】カード傾き + グレア追従 + バッジ浮遊
  ---------------------------------------------------------- */
  function initCardTilt() {
    const stage  = document.getElementById('js-top-profile');
    const card   = document.getElementById('js-top-card');
    if (!stage || !card) return;
 
    let isInside = false;
    let targetRotX = 0, targetRotY = 0;
    let curRotX    = 0, curRotY    = 0;
    let targetGx   = 50, targetGy  = 50;  // グレア中心 %
    let curGx      = 50, curGy     = 50;
    let rafId      = null;
 
    /* ── タグ要素: 浮遊するバッジ的な存在として扱う ── */
    const badges = card.querySelectorAll('.top-profile__name .job');
 
    stage.addEventListener('mouseenter', () => {
      isInside = true;
      card.style.transition = CONFIG.easeIn;
      badges.forEach(b => b.style.transition = 'transform 0.5s ease, color 0.3s ease');
      startRaf();
    });
 
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const nx = (e.clientX - rect.left)  / rect.width  - 0.5;  // -0.5〜0.5
      const ny = (e.clientY - rect.top)   / rect.height - 0.5;
 
      targetRotY = clamp(nx *  CONFIG.tiltRange,     -CONFIG.tiltRange,     CONFIG.tiltRange);
      targetRotX = clamp(-ny * CONFIG.rotateXRange,  -CONFIG.rotateXRange,  CONFIG.rotateXRange);
 
      /* グレア: マウス位置をパーセントで */
      const cardRect = card.getBoundingClientRect();
      targetGx = clamp(((e.clientX - cardRect.left) / cardRect.width)  * 100, 0, 100);
      targetGy = clamp(((e.clientY - cardRect.top)  / cardRect.height) * 100, 0, 100);
 
      /* バッジを逆方向にわずかに動かす (視差) */
      badges.forEach(b => {
        b.style.transform = `translate(${-nx * 6}px, ${-ny * 4}px)`;
      });
    });
 
    stage.addEventListener('mouseleave', () => {
      isInside   = false;
      targetRotX = 0;
      targetRotY = 0;
      targetGx   = 50;
      targetGy   = 50;
      card.style.transition = CONFIG.easeOut;
      badges.forEach(b => {
        b.style.transform = 'translate(0,0)';
      });
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
          `rotate(${rotate.toFixed(4)}deg) `
          + `rotateX(${curRotX.toFixed(4)}deg) `
          + `rotateY(${curRotY.toFixed(4)}deg)`;
 
        /* CSS変数でグレア位置を更新 */
        card.style.setProperty('--gx', `${curGx.toFixed(2)}%`);
        card.style.setProperty('--gy', `${curGy.toFixed(2)}%`);
 
        /* 収束判定 */
        const dist = Math.abs(curRotX) + Math.abs(curRotY)
                   + Math.abs(curGx - 50) + Math.abs(curGy - 50);
        if (!isInside && dist < 0.1) {
          card.style.transform = `rotate(${CONFIG.baseRotate}deg)`;
          card.style.setProperty('--gx', '50%');
          card.style.setProperty('--gy', '50%');
          rafId = null;
          return;
        }
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }
  }
 
  /* ----------------------------------------------------------
     【強化】スクロールで clip-path 展開 + カード scale イン
  ---------------------------------------------------------- */
  function initStageReveal() {
    if (!CONFIG.scrollReveal) return;
    const stage = document.getElementById('js-top-profile');
    const card  = document.getElementById('js-top-card');
    if (!stage) return;
 
    /* 初期状態: 両サイドを縮める + カードを少し小さく */
    stage.style.clipPath  = 'inset(0px 10% round 20px)';
    stage.style.transition = 'none';
    if (card) {
      card.style.opacity   = '0';
      card.style.transform = `rotate(${CONFIG.baseRotate}deg) scale(0.92)`;
    }
 
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
 
          /* Step1: ステージを広げる */
          requestAnimationFrame(() => {
            stage.style.transition =
              'clip-path 1.0s cubic-bezier(0.16, 1, 0.3, 1)';
            stage.style.clipPath = 'inset(0px 0% round 20px)';
 
            /* Step2: 少し遅れてカードをフェードスケールイン */
            if (card) {
              setTimeout(() => {
                card.style.transition =
                  'opacity 0.7s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.opacity   = '1';
                card.style.transform = `rotate(${CONFIG.baseRotate}deg) scale(1)`;
 
                /* アニメ完了後に transition をリセット (JS制御に戻す) */
                setTimeout(() => {
                  card.style.transition = CONFIG.easeOut;
                }, 900);
              }, 300);
            }
          });
 
          io.unobserve(stage);
        });
      },
      {
        root:      document.getElementById('js-main') || null,
        threshold: 0.15,
      }
    );
    io.observe(stage);
  }
 
  /* ----------------------------------------------------------
     スクロール視差: カードが少し浮き上がる
  ---------------------------------------------------------- */
  function initCardParallax() {
    const stage    = document.getElementById('js-top-profile');
    const card     = document.getElementById('js-top-card');
    if (!stage || !card) return;
 
    const scroller = document.getElementById('js-main') || window;
 
    function onScroll() {
      if (stage.matches(':hover')) return;
      const rect     = stage.getBoundingClientRect();
      const vpH      = window.innerHeight;
      const progress = clamp(1 - (rect.top + rect.height / 2) / vpH, 0, 1);
      const ty       = lerp(4.5, 0, progress);
      card.style.transform =
        `translateY(${ty.toFixed(3)}%) rotate(${CONFIG.baseRotate}deg)`;
    }
 
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
 
  /* ----------------------------------------------------------
     SVG "profile" 文字: 描画アニメーション
  ---------------------------------------------------------- */
  function initProfileTextDraw() {
    const svgText = document.querySelector('.top-profile__hd .svg-text text');
    if (!svgText) return;
 
    try {
      const length = svgText.getTotalLength?.() ?? 800;
      svgText.style.strokeDasharray  = length;
      svgText.style.strokeDashoffset = length;
      svgText.style.fill             = 'none';
      svgText.style.transition       = 'none';
 
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            svgText.style.transition =
              'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s';
            svgText.style.strokeDashoffset = '0';
            io.unobserve(svgText);
          });
        },
        { root: document.getElementById('js-main') || null, threshold: 0.5 }
      );
      io.observe(svgText);
    } catch (_) { /* SVGText が使えない環境はスキップ */ }
  }
 

 /* ============================================================
   NEWS アコーディオン
============================================================ */
document.querySelectorAll('.news__btn').forEach((btn) => {
  const body = btn.nextElementSibling;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      // --- 閉じる ---
      // ★ インラインの height:auto を先にクリアしてからアニメーション開始
      body.style.height = '';
      body.style.setProperty('--body-h', body.scrollHeight + 'px');
      body.classList.remove('is-open');
      body.classList.add('is-closing');
      btn.setAttribute('aria-expanded', 'false');

      body.addEventListener('animationend', () => {
        body.classList.remove('is-closing');
        body.style.removeProperty('--body-h');
        body.setAttribute('hidden', '');
      }, { once: true });

    } else {
      // --- 開く ---
      body.removeAttribute('hidden');
      const h = body.scrollHeight;
      body.style.setProperty('--body-h', h + 'px');
      body.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');

      body.addEventListener('animationend', () => {
        body.classList.remove('is-open');
        body.style.height = 'auto';
      }, { once: true });
    }
  });
});
  /* ----------------------------------------------------------
     エントリーポイント
  ---------------------------------------------------------- */
  function init() {
    initStageReveal();   // clip-path展開 + カードスケールイン
    initCardTilt();      // マウス追従傾き + グレア + バッジ視差
    initCardParallax();  // スクロール視差
    initProfileTextDraw(); // SVG文字描画
  }
 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
        /* ---- Contact form ---- */
        const form = document.getElementById("js-form");
        if (form) {
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = form.querySelector(".cf__submit");
            btn.textContent = "送信中...";
            btn.disabled = true;
            setTimeout(() => {
              btn.textContent = "✓ 送信完了！ありがとうございます";
              btn.style.background = "var(--color-turquoise)";
              btn.style.color = "var(--color-ink)";
              form.reset();
              setTimeout(() => {
                btn.textContent = "送信する →";
                btn.style.background = "";
                btn.style.color = "";
                btn.disabled = false;
              }, 4000);
            }, 1200);
          });
        }
      })();