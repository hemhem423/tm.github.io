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

        /* ---- Active nav via IntersectionObserver on main scroll ---- */
        const secEls = main.querySelectorAll("[id]");
        const navLnks = document.querySelectorAll(
          ".sidebar__nav-item[data-sec]",
        );
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                navLnks.forEach((n) =>
                  n.classList.toggle(
                    "is-active",
                    n.dataset.sec === e.target.id,
                  ),
                );
              }
            });
          },
          { root: main, threshold: 0.35 },
        );
        secEls.forEach((s) => io.observe(s));

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
     設定
  ---------------------------------------------------------- */
  const CONFIG = {
    baseRotate:    2.35,   // 初期傾き (deg)
    tiltRange:     6,      // マウス追従の最大傾き (deg)
    rotateXRange:  8,      // X軸方向の最大傾き (deg)
    easeIn:        'transform 0.08s linear',
    easeOut:       'transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    scrollReveal:  true,   // スクロール時のclip-path展開を使うか
  };

  /* ----------------------------------------------------------
     ユーティリティ
  ---------------------------------------------------------- */
  const lerp = (a, b, t) => a + (b - a) * t;

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  /* ----------------------------------------------------------
     プロフィールカード: マウス追従傾き
  ---------------------------------------------------------- */
  function initCardTilt() {
    const stage = document.getElementById('js-top-profile');
    const card  = document.getElementById('js-top-card');
    if (!stage || !card) return;

    let isInside   = false;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let rafId = null;

    /* マウスが乗ったとき */
    stage.addEventListener('mouseenter', () => {
      isInside = true;
      card.style.transition = CONFIG.easeIn;
      startRaf();
    });

    /* マウス移動 */
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const nx   = (e.clientX - rect.left)  / rect.width  - 0.5; // -0.5 〜 0.5
      const ny   = (e.clientY - rect.top)   / rect.height - 0.5;

      targetRotY = clamp(nx * CONFIG.tiltRange,    -CONFIG.tiltRange,    CONFIG.tiltRange);
      targetRotX = clamp(-ny * CONFIG.rotateXRange, -CONFIG.rotateXRange, CONFIG.rotateXRange);
    });

    /* マウスが外れたとき */
    stage.addEventListener('mouseleave', () => {
      isInside    = false;
      targetRotX  = 0;
      targetRotY  = 0;
      card.style.transition = CONFIG.easeOut;
    });

    /* RAF ループ: lerp で滑らかに追従 */
    function startRaf() {
      if (rafId) return;
      function tick() {
        currentRotX = lerp(currentRotX, targetRotX, 0.15);
        currentRotY = lerp(currentRotY, targetRotY, 0.15);

        const rotate   = CONFIG.baseRotate + currentRotY * 0.4;
        const rotateX  = currentRotX.toFixed(4);
        const rotateY  = currentRotY.toFixed(4);

        card.style.transform =
          `rotate(${rotate.toFixed(4)}deg) `
          + `rotateX(${rotateX}deg) `
          + `rotateY(${rotateY}deg)`;

        /* 収束判定: 外にいて値が小さければ止める */
        const dist = Math.abs(currentRotX) + Math.abs(currentRotY);
        if (!isInside && dist < 0.01) {
          card.style.transform = `rotate(${CONFIG.baseRotate}deg)`;
          rafId = null;
          return;
        }
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }
  }

  /* ----------------------------------------------------------
     スクロール時: clip-path でステージが展開するアニメーション
     (doisena.jp の「inset(0px 0% round 20px)」を再現)
  ---------------------------------------------------------- */
  function initStageReveal() {
    if (!CONFIG.scrollReveal) return;

    const stage = document.getElementById('js-top-profile');
    if (!stage) return;

    /* 初期値: 両サイドが閉じている */
    stage.style.clipPath = 'inset(0px 8% round 20px)';
    stage.style.transition = 'none';

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          /* 展開アニメーション */
          requestAnimationFrame(() => {
            stage.style.transition =
              'clip-path 1.0s cubic-bezier(0.16, 1, 0.3, 1)';
            stage.style.clipPath = 'inset(0px 0% round 20px)';
          });

          io.unobserve(stage);
        });
      },
      {
        /* main-wrap がスクロールコンテナの場合、root を指定 */
        root:      document.getElementById('js-main') || null,
        threshold: 0.2,
      }
    );
    io.observe(stage);
  }

  /* ----------------------------------------------------------
     カード: スクロール連動の subtle 浮遊感
     (stageが画面に入るにつれカードが少し上にスライド)
  ---------------------------------------------------------- */
  function initCardParallax() {
    const stage = document.getElementById('js-top-profile');
    const card  = document.getElementById('js-top-card');
    if (!stage || !card) return;

    const scroller = document.getElementById('js-main') || window;

    function onScroll() {
      const rect     = stage.getBoundingClientRect();
      const vpH      = window.innerHeight;
      /* stage中心のビューポート内位置 -1〜1 */
      const progress = 1 - (rect.top + rect.height / 2) / vpH;
      const clampedP = clamp(progress, 0, 1);

      /* マウス操作中は干渉しない */
      if (stage.matches(':hover')) return;

      const translateY = lerp(3.5, 0, clampedP); // 3.5% → 0%
      /* 元コードの style="transform: translate(0%, 3.08%)" を再現 */
      card.style.transform =
        `translateY(${translateY.toFixed(3)}%) rotate(${CONFIG.baseRotate}deg)`;
    }

    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 初期化
  }

  /* ----------------------------------------------------------
     ホバー: アバター画像の切り替え
     .hover img.is-current を順番に切り替え
  ---------------------------------------------------------- */
  function initAvatarHover() {
    const figure = document.querySelector('.top-profile__foward > figure');
    if (!figure) return;

    const hoverImgs = figure.querySelectorAll('.hover img');
    if (!hoverImgs.length) return;

    let current = 0;
    let intervalId = null;

    figure.addEventListener('mouseenter', () => {
      hoverImgs.forEach((img) => img.classList.remove('is-current'));
      current = 0;
      hoverImgs[current]?.classList.add('is-current');

      intervalId = setInterval(() => {
        hoverImgs[current]?.classList.remove('is-current');
        current = (current + 1) % hoverImgs.length;
        hoverImgs[current]?.classList.add('is-current');
      }, 220);
    });

    figure.addEventListener('mouseleave', () => {
      clearInterval(intervalId);
      hoverImgs.forEach((img) => img.classList.remove('is-current'));
    });
  }

  /* ----------------------------------------------------------
     SVGテキスト: "PROFILE" アウトライン描画アニメーション
     (svg-text text の stroke-dashoffset をアニメーション)
  ---------------------------------------------------------- */
  function initProfileTextDraw() {
    const svgText = document.querySelector('.top-profile__hd .svg-text text');
    if (!svgText) return;

    /* 文字の総パス長を取得して設定 */
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
            `stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s,
             fill 0.4s ease 1.4s`;
          svgText.style.strokeDashoffset = '0';
          svgText.style.fill             = 'none'; /* アウトラインのまま */
          io.unobserve(svgText);
        });
      },
      {
        root:      document.getElementById('js-main') || null,
        threshold: 0.5,
      }
    );
    io.observe(svgText);
  }

  /* ----------------------------------------------------------
     フォールバック: SVGが使えない場合の -webkit-text-stroke 版
     .top-profile__hd-text があれば同様に描画アニメーション
  ---------------------------------------------------------- */
  function initFallbackHdReveal() {
    const hd = document.querySelector('.top-profile__hd-text');
    if (!hd) return;

    hd.style.opacity   = '0';
    hd.style.transform = 'translateY(20px)';
    hd.style.transition = 'none';

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          hd.style.transition = 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s';
          hd.style.opacity    = '1';
          hd.style.transform  = 'translateY(0)';
          io.unobserve(hd);
        });
      },
      {
        root:      document.getElementById('js-main') || null,
        threshold: 0.3,
      }
    );
    io.observe(hd);
  }

  /* ----------------------------------------------------------
     エントリーポイント
  ---------------------------------------------------------- */
  function init() {
    initStageReveal();
    initCardTilt();
    initCardParallax();
    initAvatarHover();
    initProfileTextDraw();
    initFallbackHdReveal();
  }

  /* DOM読み込み済みなら即実行、そうでなければ待機 */
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