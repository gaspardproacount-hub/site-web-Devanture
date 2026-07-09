// Devanture — Sites web pour commerces
// JavaScript vanilla partagé par toutes les pages : menu mobile, FAQ, fade-in au scroll.

document.addEventListener("DOMContentLoaded", function () {
  // ---------- Menu burger (mobile) ----------
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Ferme le menu quand on clique sur un lien (utile en navigation mobile)
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- FAQ accordéon ----------
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");

    if (!question || !answer) return;

    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      // Ferme les autres questions du même bloc FAQ
      var faqList = item.closest(".faq-list");
      if (faqList) {
        faqList.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove("is-open");
            openItem.querySelector(".faq-answer").style.maxHeight = null;
            openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          }
        });
      }

      item.classList.toggle("is-open", !isOpen);
      question.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : null;
    });
  });

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Reveal en cascade : délai progressif par grille ----------
  document.querySelectorAll(".card-grid, .feature-grid, .steps, .gallery-grid, .cross-links").forEach(function (grid) {
    Array.prototype.forEach.call(grid.children, function (child, index) {
      if (child.classList.contains("fade-in")) {
        child.style.transitionDelay = index * 80 + "ms";
      }
    });
  });

  // ---------- Fade-in discret au scroll ----------
  var fadeEls = document.querySelectorAll(".fade-in");

  if ("IntersectionObserver" in window && fadeEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Navigateur sans support : on affiche directement le contenu
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // ---------- Lueur qui suit le curseur, sur toute la page ----------
  var spotlight = document.querySelector(".global-spotlight");

  if (spotlight && !prefersReducedMotion) {
    document.addEventListener("pointermove", function (e) {
      var x = (e.clientX / window.innerWidth) * 100;
      var y = (e.clientY / window.innerHeight) * 100;
      spotlight.style.setProperty("--spot-x", x + "%");
      spotlight.style.setProperty("--spot-y", y + "%");
      spotlight.classList.add("is-active");
    });

    document.documentElement.addEventListener("mouseleave", function () {
      spotlight.classList.remove("is-active");
    });
  }

  // ---------- Hero : léger parallax au scroll ----------
  var hero = document.querySelector(".hero");
  var heroContainer = hero ? hero.querySelector(".container") : null;

  if (hero && heroContainer && !prefersReducedMotion) {
    var parallaxTicking = false;

    function applyHeroParallax() {
      var heroHeight = hero.offsetHeight;
      var progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      heroContainer.style.transform = "translateY(" + progress * -30 + "px)";
      heroContainer.style.opacity = 1 - progress * 0.4;
      parallaxTicking = false;
    }

    window.addEventListener("scroll", function () {
      if (!parallaxTicking) {
        window.requestAnimationFrame(applyHeroParallax);
        parallaxTicking = true;
      }
    });

    applyHeroParallax();
  }

  // ---------- Compteur animé du tarif ----------
  var priceEls = document.querySelectorAll(".price-value");

  if (priceEls.length) {
    priceEls.forEach(function (el) {
      var target = parseInt(el.dataset.target, 10) || 0;

      if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        el.textContent = target;
        return;
      }

      var priceObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            priceObserver.unobserve(el);

            var duration = 900;
            var startTime = null;

            function step(timestamp) {
              if (startTime === null) startTime = timestamp;
              var elapsed = timestamp - startTime;
              var progress = Math.min(elapsed / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(eased * target);
              if (progress < 1) window.requestAnimationFrame(step);
            }

            window.requestAnimationFrame(step);
          });
        },
        { threshold: 0.5 }
      );

      priceObserver.observe(el);
    });
  }

  // ---------- Année dans le footer ----------
  var yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
