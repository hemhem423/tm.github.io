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