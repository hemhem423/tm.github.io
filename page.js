

 
      (() => {
        "use strict";

        const loader = document.getElementById("js-loader");
        const sidebar = document.getElementById("js-sidebar");
        const main = document.getElementById("js-main");

        window.addEventListener("load", () => {
          setTimeout(() => {
            loader.classList.add("is-hidden");
            setTimeout(() => {
              loader.style.display = "none";
              if (window.innerWidth > 1100) sidebar.classList.add("is-visible");
              main.classList.add("is-visible");
            }, 900);
          }, 600);
        });

        /* Mobile toggle */
        const toggle = document.getElementById("js-toggle");
        toggle.addEventListener("click", (e) => {
          e.stopPropagation();
          sidebar.classList.toggle("is-mobile-open");
        });
        main.addEventListener("click", () =>
          sidebar.classList.remove("is-mobile-open"),
        );

        window.addEventListener("resize", () => {
          if (window.innerWidth > 1100) {
            sidebar.classList.add("is-visible");
            sidebar.classList.remove("is-mobile-open");
          } else {
            sidebar.classList.remove("is-visible");
          }
        });

        /* Scroll Reveal */
        const reveals = main.querySelectorAll(".js-reveal");
        const revIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              const siblings =
                e.target.parentElement.querySelectorAll(".js-reveal");
              let delay = 0;
              siblings.forEach((el, i) => {
                if (el === e.target) delay = i * 100;
              });
              setTimeout(() => e.target.classList.add("is-visible"), delay);
              revIO.unobserve(e.target);
            });
          },
          { root: main, threshold: 0.1 },
        );
        reveals.forEach((el) => revIO.observe(el));

        /* Custom cursor */
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
          document.querySelectorAll("a,button,.skill-card").forEach((el) => {
            el.addEventListener("mouseenter", () =>
              ring.classList.add("is-hovered"),
            );
            el.addEventListener("mouseleave", () =>
              ring.classList.remove("is-hovered"),
            );
          });
        }
             /* ----------------------------------------------------------------
           Filter
        ---------------------------------------------------------------- */
        const filterBtns = document.querySelectorAll(".works-filter__btn");
        const workItems = document.querySelectorAll(".work-item");
        const countEl = document.getElementById("js-visible-count");

        function updateCount() {
          const visible = [...workItems].filter(
            (i) => !i.classList.contains("is-hidden"),
          ).length;
          if (countEl) countEl.textContent = visible;
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

        /* ----------------------------------------------------------------
           Lightbox
        ---------------------------------------------------------------- */
        const lb = document.getElementById("js-lb");
        const lbClose = document.getElementById("js-lb-close");
        const lbImg = document.getElementById("js-lb-img");
        const lbNum = document.getElementById("js-lb-num");
        const lbCat = document.getElementById("js-lb-cat");
        const lbTitle = document.getElementById("js-lb-title");
        const lbDesc = document.getElementById("js-lb-desc");
        const lbTagsEl = document.getElementById("js-lb-tags");
        const lbLink = document.getElementById("js-lb-link");
        const lbPrev = document.getElementById("js-lb-prev");
        const lbNext = document.getElementById("js-lb-next");

        /* 表示中のアイテムインデックス */
        let currentIndex = 0;

        /* 可視アイテムの配列を返す */
        function getVisibleItems() {
          return [...workItems].filter(
            (i) => !i.classList.contains("is-hidden"),
          );
        }

        function openLightbox(item) {
          const items = getVisibleItems();
          currentIndex = items.indexOf(item);
          renderLightbox(items, currentIndex);
          lb.classList.add("is-open");
          document.body.style.overflow = "hidden";
        }

        function renderLightbox(items, idx) {
          const item = items[idx];
          const total = items.length;

          lbImg.src = item.dataset.img || "";
          lbImg.alt = item.dataset.title || "";
          lbCat.textContent = item.dataset.cat || "";
          lbTitle.textContent = item.dataset.title || "";
          lbDesc.textContent = item.dataset.desc || "";
          lbLink.href = item.dataset.url || "#";
          lbNum.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

          /* Tags */
          lbTagsEl.innerHTML = "";
          (item.dataset.tags || "").split(",").forEach((tag) => {
            if (!tag.trim()) return;
            const span = document.createElement("span");
            span.className = "lb-info__tag";
            span.textContent = tag.trim();
            lbTagsEl.appendChild(span);
          });

          /* Arrow visibility */
          lbPrev.style.display = idx > 0 ? "flex" : "none";
          lbNext.style.display = idx < total - 1 ? "flex" : "none";
        }

        function closeLightbox() {
          lb.classList.remove("is-open");
          document.body.style.overflow = "";
        }

        /* Open on work item click */
        workItems.forEach((item) => {
          item.addEventListener("click", () => {
            if (item.classList.contains("is-hidden")) return;
            openLightbox(item);
          });
        });

        /* Close */
        lbClose.addEventListener("click", closeLightbox);
        lb.addEventListener("click", (e) => {
          if (e.target === lb) closeLightbox();
        });

        /* Prev / Next */
        lbPrev.addEventListener("click", (e) => {
          e.stopPropagation();
          const items = getVisibleItems();
          if (currentIndex > 0) {
            currentIndex--;
            renderLightbox(items, currentIndex);
          }
        });
        lbNext.addEventListener("click", (e) => {
          e.stopPropagation();
          const items = getVisibleItems();
          if (currentIndex < items.length - 1) {
            currentIndex++;
            renderLightbox(items, currentIndex);
          }
        });

        /* Keyboard navigation */
        document.addEventListener("keydown", (e) => {
          if (!lb.classList.contains("is-open")) return;
          const items = getVisibleItems();
          if (e.key === "Escape") closeLightbox();
          if (e.key === "ArrowLeft" && currentIndex > 0) {
            currentIndex--;
            renderLightbox(items, currentIndex);
          }
          if (e.key === "ArrowRight" && currentIndex < items.length - 1) {
            currentIndex++;
            renderLightbox(items, currentIndex);
          }
        });

        /* Touch / swipe */
        let touchStartX = 0;
        lb.addEventListener(
          "touchstart",
          (e) => {
            touchStartX = e.touches[0].clientX;
          },
          { passive: true },
        );
        lb.addEventListener(
          "touchend",
          (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            const items = getVisibleItems();
            if (Math.abs(diff) < 40) return;
            if (diff > 0 && currentIndex < items.length - 1) {
              currentIndex++;
              renderLightbox(items, currentIndex);
            }
            if (diff < 0 && currentIndex > 0) {
              currentIndex--;
              renderLightbox(items, currentIndex);
            }
          },
          { passive: true },
        );
      })();
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
