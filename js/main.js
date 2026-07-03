(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var body = document.body;

  /* ---- Mobile nav toggle ---- */
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.querySelectorAll(".main-nav .nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Header color: cream at the very top, black as soon as the page
     scrolls at all. No per-section logic — the yellow header state is
     gone entirely. ---- */
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("header--inverted", window.scrollY > 0);
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  });
  window.addEventListener("resize", updateHeader);
  updateHeader();

  /* ---- Reveal-on-scroll for cards and headings ---- */
  var revealTargets = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---- Hero showcase: browser mockup that auto-scrolls through
     placeholder screenshots, then crossfades to the next one. Skipped
     entirely under prefers-reduced-motion (first slide stays static). ---- */
  var showcase = document.querySelector(".showcase");

  if (showcase && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var slides = Array.prototype.slice.call(showcase.querySelectorAll(".showcase-slide"));
    var viewport = showcase.querySelector(".showcase-viewport");
    var SCROLL_MS = 5000;
    var PAUSE_MS = 500;
    var CROSSFADE_MS = 700;
    var index = 0;

    var wait = function (ms) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    };

    var scrollImage = function (img) {
      return new Promise(function (resolve) {
        var vpWidth = viewport.getBoundingClientRect().width;
        var vpHeight = viewport.getBoundingClientRect().height;
        var naturalW = img.naturalWidth || 1000;
        var naturalH = img.naturalHeight || 2600;
        var scale = vpWidth / naturalW;
        var renderedH = naturalH * scale;
        var distance = Math.max(0, renderedH - vpHeight);

        img.style.transition = "none";
        img.style.transform = "translateY(0)";

        if (distance < 4) {
          setTimeout(resolve, SCROLL_MS * 0.4);
          return;
        }

        // Force a reflow so the transition below starts from translateY(0)
        // instead of jumping straight to the end position.
        void img.offsetHeight;

        window.requestAnimationFrame(function () {
          img.style.transition = "transform " + SCROLL_MS + "ms cubic-bezier(0.45, 0, 0.55, 1)";
          img.style.transform = "translateY(-" + distance + "px)";
        });

        setTimeout(resolve, SCROLL_MS);
      });
    };

    var BLANK_DWELL_MS = 2400;

    var advance = function (current, next) {
      return wait(PAUSE_MS).then(function () {
        current.classList.remove("is-active");
        next.classList.add("is-active");
        var nextImg = next.querySelector(".showcase-shot");
        if (nextImg) {
          nextImg.style.transition = "none";
          nextImg.style.transform = "translateY(0)";
        }
        return wait(CROSSFADE_MS);
      });
    };

    var playNext = function () {
      var current = slides[index];
      var nextIndex = (index + 1) % slides.length;
      var next = slides[nextIndex];
      var img = current.querySelector(".showcase-shot");

      // Blank slide (e.g. a "coming soon" placeholder): no image to
      // scroll, just hold on it briefly before crossfading onward.
      if (!img) {
        wait(BLANK_DWELL_MS)
          .then(function () {
            return advance(current, next);
          })
          .then(function () {
            index = nextIndex;
            playNext();
          });
        return;
      }

      var run = function () {
        scrollImage(img)
          .then(function () {
            return advance(current, next);
          })
          .then(function () {
            index = nextIndex;
            playNext();
          });
      };

      if (img.complete) {
        run();
      } else {
        img.addEventListener("load", run, { once: true });
      }
    };

    if (slides.length > 1) {
      playNext();
    }
  }
})();
