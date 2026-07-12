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
  var animeAvailable = typeof anime !== "undefined" && "IntersectionObserver" in window;

  // ---------- Entrée en cascade des grilles (anime.js) : opacité + montée + zoom léger ----------
  // Remplace le simple fade-in CSS pour les grilles de cartes ; le fade-in CSS reste
  // le filet de sécurité pour tout le reste (et si anime.js n'a pas pu charger).
  if (animeAvailable && !prefersReducedMotion) {
    document.querySelectorAll(".card-grid, .feature-grid, .steps, .gallery-grid, .cross-links").forEach(function (grid) {
      var items = Array.prototype.slice.call(grid.children);
      if (!items.length) return;

      items.forEach(function (item) {
        item.classList.remove("fade-in", "is-visible");
      });

      var gridObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            anime.animate(items, {
              opacity: [0, 1],
              translateY: [28, 0],
              scale: [0.94, 1],
              delay: anime.stagger(80),
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
  }

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

  // ---------- Traînée de souris "brume" : suit le curseur et s'efface en 3s ----------
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion) {
    var trailCanvas = document.createElement("canvas");
    trailCanvas.setAttribute("aria-hidden", "true");
    Object.assign(trailCanvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "9999",
    });
    document.body.appendChild(trailCanvas);

    var trailCtx = trailCanvas.getContext("2d");
    var trailDpr = Math.min(window.devicePixelRatio || 1, 2);
    var trailColorHex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#5B3DF0";
    var TRAIL_LIFETIME = 1000;
    var trailPoints = [];
    var trailLastX = null;
    var trailLastY = null;
    var trailLoopRunning = false;

    function hexToRgba(hex, alpha) {
      var h = hex.replace("#", "");
      if (h.length === 3) {
        h = h.replace(/(.)/g, "$1$1");
      }
      var r = parseInt(h.substring(0, 2), 16);
      var g = parseInt(h.substring(2, 4), 16);
      var b = parseInt(h.substring(4, 6), 16);
      return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    }

    function resizeTrailCanvas() {
      trailCanvas.width = window.innerWidth * trailDpr;
      trailCanvas.height = window.innerHeight * trailDpr;
      trailCtx.setTransform(trailDpr, 0, 0, trailDpr, 0, 0);
    }
    resizeTrailCanvas();
    window.addEventListener("resize", resizeTrailCanvas);

    function renderTrail() {
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      var now = performance.now();

      trailPoints = trailPoints.filter(function (p) {
        return now - p.time < TRAIL_LIFETIME;
      });

      trailPoints.forEach(function (p) {
        var progress = (now - p.time) / TRAIL_LIFETIME;
        var alpha = (1 - progress) * 0.35;
        var radius = 10 + progress * 26;

        var gradient = trailCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        gradient.addColorStop(0, hexToRgba(trailColorHex, alpha));
        gradient.addColorStop(1, hexToRgba(trailColorHex, 0));

        trailCtx.fillStyle = gradient;
        trailCtx.beginPath();
        trailCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        trailCtx.fill();
      });

      if (trailPoints.length) {
        requestAnimationFrame(renderTrail);
      } else {
        trailLoopRunning = false;
      }
    }

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;

      if (trailLastX !== null) {
        var dx = e.clientX - trailLastX;
        var dy = e.clientY - trailLastY;
        if (dx * dx + dy * dy < 16) return;
      }
      trailLastX = e.clientX;
      trailLastY = e.clientY;

      trailPoints.push({ x: e.clientX, y: e.clientY, time: performance.now() });
      if (trailPoints.length > 220) trailPoints.shift();

      if (!trailLoopRunning) {
        trailLoopRunning = true;
        requestAnimationFrame(renderTrail);
      }
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
