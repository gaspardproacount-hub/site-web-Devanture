// Connexion en direct au CMS Devanture (Supabase) pour la démo Maison Verveine.
// Remplit les infos pratiques (horaires, adresse, téléphone, email) et le
// catalogue de produits à partir des données saisies dans le dashboard client.
// Si les 3 constantes ci-dessous ne sont pas renseignées, le site garde
// simplement son contenu de démonstration statique (aucune erreur visible).
//
// Mode édition (?cms_edit=1) : quand cette page est affichée dans l'aperçu du
// dashboard, des crayons ✎ apparaissent sur les éléments modifiables ; un clic
// prévient la fenêtre parente (le dashboard) pour qu'elle ouvre le bon champ.

(function () {
  const CMS_CONFIG = {
    supabaseUrl: "https://kekjsyqakhpuzxxeralm.supabase.co",
    supabaseAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtla2pzeXFha2hwdXp4eGVyYWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDgwNDAsImV4cCI6MjA5OTYyNDA0MH0.vZdboaaVCYThBNH4zXGrb8gEYXwzmk5uHCoPiLFXhUI",
    siteId: "45313b5d-95f5-4b29-b609-d2335d19b582",
  };

  const isConfigured =
    CMS_CONFIG.supabaseUrl.startsWith("https://") &&
    CMS_CONFIG.supabaseAnonKey.length > 20 &&
    CMS_CONFIG.siteId.length > 10;

  const editMode = new URLSearchParams(location.search).get("cms_edit") === "1";

  async function fetchFromCms(table, query) {
    const url = CMS_CONFIG.supabaseUrl + "/rest/v1/" + table + "?site_id=eq." + CMS_CONFIG.siteId + (query || "");
    try {
      const res = await fetch(url, {
        headers: {
          apikey: CMS_CONFIG.supabaseAnonKey,
          Authorization: "Bearer " + CMS_CONFIG.supabaseAnonKey,
        },
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async function applySiteSettings() {
    const rows = await fetchFromCms("site_settings", "&select=*");
    const settings = rows && rows[0];
    if (!settings) return;

    const addressEl = document.getElementById("mv-address");
    if (addressEl && settings.address) {
      addressEl.textContent = settings.address;
    }

    const phoneEl = document.getElementById("mv-phone-link");
    if (phoneEl && settings.phone) {
      phoneEl.textContent = settings.phone;
      phoneEl.href = "tel:" + settings.phone.replace(/[^\d+]/g, "");
    }

    const emailEl = document.getElementById("mv-email-link");
    if (emailEl && settings.email) {
      emailEl.textContent = settings.email;
      emailEl.href = "mailto:" + settings.email;
    }

    const hoursBody = document.getElementById("mv-hours-body");
    if (hoursBody && Array.isArray(settings.opening_hours) && settings.opening_hours.length) {
      hoursBody.innerHTML = "";
      settings.opening_hours.forEach(function (row) {
        const tr = document.createElement("tr");
        const tdJour = document.createElement("td");
        tdJour.textContent = row.jour;
        const tdHoraires = document.createElement("td");
        tdHoraires.textContent = row.horaires || "Fermé";
        tr.append(tdJour, tdHoraires);
        hoursBody.appendChild(tr);
      });
    }
  }

  function renderProductCard(product) {
    const card = document.createElement("article");
    card.className = "mv-product-card gsap-reveal-item";

    if (product.image_url) {
      const img = document.createElement("img");
      img.src = product.image_url;
      img.alt = product.name;
      img.loading = "lazy";
      card.appendChild(img);
    }

    const body = document.createElement("div");
    body.className = "mv-product-card-body";

    const header = document.createElement("div");
    header.className = "mv-product-card-header";

    const name = document.createElement("h3");
    name.textContent = product.name;
    header.appendChild(name);

    if (product.price != null) {
      const price = document.createElement("span");
      price.className = "mv-product-price";
      price.textContent = Number(product.price).toFixed(2) + " €";
      header.appendChild(price);
    }

    body.appendChild(header);

    if (product.description) {
      const desc = document.createElement("p");
      desc.textContent = product.description;
      body.appendChild(desc);
    }

    card.appendChild(body);

    if (editMode) {
      addPencil(card, function () {
        postToParent({ type: "edit-product", productId: product.id });
      });
    }

    return card;
  }

  function renderAddProductTile() {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "mv-product-card devanture-add-product";
    tile.textContent = "+ Ajouter un produit";
    tile.addEventListener("click", function () {
      postToParent({ type: "add-product" });
    });
    return tile;
  }

  async function applyProducts() {
    const grid = document.getElementById("mv-products-grid");
    const section = document.getElementById("mv-products-section");
    if (!grid || !section) return;

    const products = isConfigured ? await fetchFromCms("products", "&select=*&order=position.asc") : null;

    if (!products || !products.length) {
      if (!editMode) return;
      grid.innerHTML = "";
      grid.appendChild(renderAddProductTile());
      section.hidden = false;
      return;
    }

    grid.innerHTML = "";
    products.forEach(function (product) {
      grid.appendChild(renderProductCard(product));
    });
    if (editMode) {
      grid.appendChild(renderAddProductTile());
    }

    section.hidden = false;
  }

  // ---------- Mode édition : crayons cliquables reliés au dashboard ----------

  function postToParent(payload) {
    window.parent.postMessage(Object.assign({ source: "devanture-preview" }, payload), "*");
  }

  function injectEditStyles() {
    const style = document.createElement("style");
    style.textContent =
      ".devanture-edit-pencil{display:inline-flex;align-items:center;justify-content:center;" +
      "width:26px;height:26px;margin-left:8px;border-radius:999px;background:#111;color:#fff;" +
      "border:2px solid #fff;font-size:13px;line-height:1;cursor:pointer;" +
      "box-shadow:0 2px 6px rgba(0,0,0,.35);vertical-align:middle;}" +
      "article.mv-product-card{position:relative;}" +
      "article.mv-product-card .devanture-edit-pencil{position:absolute;top:10px;right:10px;margin-left:0;}" +
      ".devanture-add-product{display:flex;align-items:center;justify-content:center;min-height:160px;" +
      "border:2px dashed rgba(17,17,17,.35);border-radius:12px;font-weight:600;color:#111;" +
      "background:rgba(17,17,17,.03);cursor:pointer;}";
    document.head.appendChild(style);
  }

  function addPencil(targetEl, onClick) {
    if (!targetEl) return;
    const pencil = document.createElement("button");
    pencil.type = "button";
    pencil.className = "devanture-edit-pencil";
    pencil.setAttribute("aria-label", "Modifier");
    pencil.textContent = "✎";
    pencil.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });
    targetEl.appendChild(pencil);
  }

  function enableInfoFieldPencils() {
    const addressEl = document.getElementById("mv-address");
    addPencil(addressEl, function () {
      postToParent({ type: "edit-info-field", field: "address" });
    });

    const phoneEl = document.getElementById("mv-phone-link");
    addPencil(phoneEl && phoneEl.parentElement, function () {
      postToParent({ type: "edit-info-field", field: "phone" });
    });

    const emailEl = document.getElementById("mv-email-link");
    addPencil(emailEl && emailEl.parentElement, function () {
      postToParent({ type: "edit-info-field", field: "email" });
    });

    const hoursCard = document.getElementById("mv-hours-card");
    addPencil(hoursCard && hoursCard.querySelector("h3"), function () {
      postToParent({ type: "edit-info-field", field: "horaires" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (editMode) {
      injectEditStyles();
      enableInfoFieldPencils();
    }
    applySiteSettings();
    applyProducts();
  });
})();
