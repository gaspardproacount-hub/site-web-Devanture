// Connexion en direct au CMS Devanture (Supabase) pour la démo Maison Verveine.
// Remplit les infos pratiques (horaires, adresse, téléphone, email) et le
// catalogue de produits à partir des données saisies dans le dashboard client.
// Si les 3 constantes ci-dessous ne sont pas renseignées, le site garde
// simplement son contenu de démonstration statique (aucune erreur visible).

(function () {
  const CMS_CONFIG = {
    supabaseUrl: "VOTRE_SUPABASE_URL",
    supabaseAnonKey: "VOTRE_SUPABASE_ANON_KEY",
    siteId: "VOTRE_SITE_ID",
  };

  const isConfigured =
    CMS_CONFIG.supabaseUrl.startsWith("https://") &&
    CMS_CONFIG.supabaseAnonKey.length > 20 &&
    CMS_CONFIG.siteId.length > 10;

  if (!isConfigured) return;

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

  async function applyProducts() {
    const grid = document.getElementById("mv-products-grid");
    const section = document.getElementById("mv-products-section");
    if (!grid || !section) return;

    const products = await fetchFromCms("products", "&select=*&order=position.asc");
    if (!products || !products.length) return;

    grid.innerHTML = "";
    products.forEach(function (product) {
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
      grid.appendChild(card);
    });

    section.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    applySiteSettings();
    applyProducts();
  });
})();
