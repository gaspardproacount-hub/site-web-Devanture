// Maison Verveine — logique JS partagée par les 3 pages de la démo.
// Smooth scroll (Lenis), reveals + parallax (GSAP ScrollTrigger), tilt 3D, barre de progression.
// Se dégrade proprement si Lenis/GSAP ne chargent pas (CDN indisponible) : le contenu reste
// visible normalement, sans animation.

document.addEventListener("DOMContentLoaded", function () {
  // ---------- Barre de progression de scroll ----------
  var fill = document.getElementById("mv-scroll-fill");
  if (fill) {
    var updateScrollProgress = function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      fill.style.height = Math.min(Math.max(progress, 0), 100) + "%";
    };
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHoverPrecise = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---------- Tilt 3D au survol (cartes boutique, tuiles collection, bento) ----------
  if (!reduceMotion && canHoverPrecise) {
    document.querySelectorAll(".mv-tilt-card, .mv-collection-tile--photo, .mv-bento-tile").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (py * -10) + "deg) rotateY(" + (px * 10) + "deg) scale3d(1.02, 1.02, 1.02)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  // ---------- Smooth scroll (Lenis) + reveals/parallax (GSAP ScrollTrigger) ----------
  if (reduceMotion || typeof gsap === "undefined" || typeof Lenis === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Fade + léger slide vers le haut à l'entrée dans le viewport
  gsap.utils.toArray(".gsap-reveal").forEach(function (el) {
    gsap.from(el, {
      opacity: 0,
      y: 28,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  gsap.utils.toArray(".gsap-reveal-group").forEach(function (group) {
    var items = group.querySelectorAll(".gsap-reveal-item");
    if (!items.length) return;
    gsap.from(items, {
      opacity: 0,
      y: 26,
      duration: 0.7,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: { trigger: group, start: "top 85%" },
    });
  });

  // Parallax doux sur les images plein cadre (désactivé sous 900px)
  ScrollTrigger.matchMedia({
    "(min-width: 900px)": function () {
      gsap.utils.toArray(".mv-parallax img").forEach(function (img) {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest(".mv-quote-band, .mv-banner"),
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    },
  });
});
