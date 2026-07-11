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

  // ---------- Hero : lueur qui suit le curseur ----------
  var hero = document.querySelector(".hero");
  var spotlight = hero ? hero.querySelector(".hero-spotlight") : null;

  if (hero && spotlight && !prefersReducedMotion) {
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty("--spot-x", x + "%");
      spotlight.style.setProperty("--spot-y", y + "%");
      spotlight.classList.add("is-active");
    });

    hero.addEventListener("pointerleave", function () {
      spotlight.classList.remove("is-active");
    });
  }

  // ---------- Hero vidéo (accueil) : curseur qui suit ----------
  var heroVideoSection = document.querySelector(".hero-video");
  var ring = heroVideoSection ? heroVideoSection.querySelector(".hero-cursor-ring") : null;
  var pill = heroVideoSection ? heroVideoSection.querySelector(".hero-cursor-pill") : null;

  if (heroVideoSection && ring && pill && !prefersReducedMotion) {
    var heroBtn = heroVideoSection.querySelector(".btn-primary");
    var mouseX = 0,
      mouseY = 0;
    var pillX = 0,
      pillY = 0;
    var scale = 0,
      targetScale = 0;
    var isHoveringBtn = false;

    function updateHeroCursor() {
      pillX += (mouseX - pillX) * 0.12;
      pillY += (mouseY - pillY) * 0.12;
      scale += (targetScale - scale) * 0.18;

      var ringScale = ring.classList.contains("is-expanded") ? 1.5 * scale : scale;

      pill.style.transform = "translate(" + pillX + "px, " + pillY + "px) translate(-50%, -50%) scale(" + scale + ")";
      ring.style.transform = "translate(" + mouseX + "px, " + mouseY + "px) translate(-50%, -50%) scale(" + ringScale + ")";

      window.requestAnimationFrame(updateHeroCursor);
    }

    heroVideoSection.addEventListener("pointermove", function (e) {
      var rect = heroVideoSection.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      if (!ring.classList.contains("is-active")) {
        pillX = mouseX;
        pillY = mouseY;
        ring.classList.add("is-active");
        pill.classList.add("is-active");
      }

      if (!isHoveringBtn) targetScale = 1;
    });

    heroVideoSection.addEventListener("pointerleave", function () {
      targetScale = 0;
      ring.classList.remove("is-active");
      pill.classList.remove("is-active");
    });

    if (heroBtn) {
      heroBtn.addEventListener("mouseenter", function () {
        isHoveringBtn = true;
        targetScale = 0;
        ring.classList.add("is-expanded");
      });
      heroBtn.addEventListener("mouseleave", function () {
        isHoveringBtn = false;
        targetScale = 1;
        ring.classList.remove("is-expanded");
      });
    }

    window.requestAnimationFrame(updateHeroCursor);
  }

  // ---------- Hero : léger parallax au scroll ----------
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

            var duration = 2600;
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

  // ---------- Formulaire de contact : envoi AJAX avec délai maîtrisé ----------
  var contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var statusEl = document.getElementById("form-status");
      var data = Object.fromEntries(new FormData(contactForm).entries());

      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours...";
      statusEl.className = "form-status";
      statusEl.textContent = "";

      var controller = new AbortController();
      var timeoutId = setTimeout(function () {
        controller.abort();
      }, 15000);

      fetch(contactForm.action, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      })
        .then(function (response) {
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error("Réponse serveur invalide");
          window.location.href = "merci.html";
        })
        .catch(function () {
          clearTimeout(timeoutId);
          submitBtn.disabled = false;
          submitBtn.textContent = "Envoyer ma demande";
          statusEl.className = "form-status is-error";
          statusEl.innerHTML =
            "L'envoi a échoué (connexion trop lente ou service temporairement indisponible). " +
            'Réessayez dans un instant, ou écrivez-moi directement à ' +
            '<a href="mailto:gaspard.proacount@gmail.com">gaspard.proacount@gmail.com</a>.';
        });
    });
  }

  // ---------- Année dans le footer ----------
  var yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
