// Devanture — Sites web pour commerces
// JavaScript vanilla partagé par toutes les pages : menu mobile, FAQ, fade-in au scroll.
// anime.js est chargé via un import ES dynamique (voir plus bas). Si l'import échoue
// (CDN bloqué, hors-ligne...), le reste du site continue de fonctionner normalement :
// les grilles et le titre d'accueil gardent leur comportement statique/fade-in classique.

var animeAnimate = null;
var animeStagger = null;
var animeSplitText = null;

var animeReady = import("animejs")
  .then(function (mod) {
    animeAnimate = mod.animate;
    animeStagger = mod.stagger;
    animeSplitText = mod.splitText;
  })
  .catch(function () {
    // anime.js indisponible : animeAnimate reste null, les filets de sécurité prennent le relais.
  });

// Pages sur lesquelles le titre d'accueil animé (splitText) ne doit PAS s'appliquer.
var HERO_SPLIT_EXCLUDED_PAGES = ["", "index.html", "contact.html", "merci.html"];

function isHeroSplitPage() {
  var file = location.pathname.split("/").pop();
  if (HERO_SPLIT_EXCLUDED_PAGES.indexOf(file) !== -1) return false;
  if (file.indexOf("demo-") === 0) return false;
  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // ---------- Cartes "spotlight" : lueur qui suit le curseur (inspiré de bklit-ui / kokonutui) ----------
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion) {
    document.querySelectorAll(".metier-card, .feature-card, .cross-link-card, .step, .pricing-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - rect.top) / rect.height) * 100 + "%");
      });
    });
  }

  // ---------- Boutons "aimant" : particules attirées au survol (inspiré de kokonutui) ----------
  if (!prefersReducedMotion) {
    document.querySelectorAll(".btn-primary:not(.btn-magnet)").forEach(function (btn) {
      btn.classList.add("btn-magnet");

      var label = document.createElement("span");
      label.className = "btn-magnet-label";
      while (btn.firstChild) {
        label.appendChild(btn.firstChild);
      }

      var particles = document.createElement("span");
      particles.className = "btn-magnet-particles";
      particles.setAttribute("aria-hidden", "true");
      for (var i = 0; i < 10; i++) {
        var particle = document.createElement("span");
        particle.className = "btn-magnet-particle";
        var angle = Math.random() * Math.PI * 2;
        var distance = 24 + Math.random() * 34;
        particle.style.setProperty("--px", Math.cos(angle) * distance + "px");
        particle.style.setProperty("--py", Math.sin(angle) * distance + "px");
        particles.appendChild(particle);
      }

      btn.appendChild(particles);
      btn.appendChild(label);
    });
  }

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
  var fadeObserver = null;

  if ("IntersectionObserver" in window && fadeEls.length) {
    fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeEls.forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    // Navigateur sans support : on affiche directement le contenu
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // ---------- Anime.js (progressive enhancement, une fois l'import résolu) ----------
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    animeReady.then(function () {
      if (!animeAnimate) return;

      // Entrée en cascade des grilles : remplace le fade-in classique pour les
      // éléments pas encore révélés (les autres gardent leur fade-in déjà joué).
      document.querySelectorAll(".card-grid, .feature-grid, .steps, .gallery-grid, .cross-links").forEach(function (grid) {
        var items = Array.prototype.slice.call(grid.children).filter(function (item) {
          return !item.classList.contains("is-visible");
        });
        if (!items.length) return;

        items.forEach(function (item) {
          if (fadeObserver) fadeObserver.unobserve(item);
          item.classList.remove("fade-in", "is-visible");
        });

        var gridObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              animeAnimate(items, {
                opacity: [0, 1],
                translateY: [28, 0],
                scale: [0.94, 1],
                delay: animeStagger(80),
                duration: 700,
                ease: "outExpo",
              });
              gridObserver.disconnect();
            });
          },
          { threshold: 0.2 }
        );
        gridObserver.observe(grid);
      });

      // Titre d'accueil : caractères qui rebondissent en boucle (splitText),
      // sur toutes les pages sauf l'accueil et la page contact.
      if (animeSplitText && isHeroSplitPage()) {
        var heroTitle = document.querySelector(".hero h1");
        if (heroTitle) {
          var split = animeSplitText(heroTitle, { words: false, chars: true });
          animeAnimate(split.chars, {
            y: [
              { to: "-2.75rem", ease: "outExpo", duration: 600 },
              { to: 0, ease: "outBounce", duration: 800, delay: 100 },
            ],
            rotate: { from: "-1turn", delay: 0 },
            delay: animeStagger(50),
            ease: "inOutCirc",
            loopDelay: 1000,
            loop: true,
          });
        }
      }
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
