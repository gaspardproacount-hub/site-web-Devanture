// Exemple minimal : va chercher content/catalogue.json et affiche chaque
// produit disponible dans <div id="catalogue-liste"></div>. À adapter au
// HTML/CSS réel du site client (ou dupliquer pour un menu, avec categorie
// etc.) — c'est la pièce qui fait que modifier le contenu depuis /admin met
// vraiment à jour ce que les visiteurs voient sur la page, sans build ni
// serveur : juste un fetch() d'un fichier JSON statique.
document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("catalogue-liste");
  if (!container) return;

  fetch("content/catalogue.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      (data.produits || []).forEach(function (produit) {
        if (produit.disponible === false) return;

        var card = document.createElement("div");
        card.className = "produit-card";
        card.innerHTML =
          (produit.photo ? '<img src="' + produit.photo + '" alt="' + produit.title + '">' : "") +
          "<h3>" + produit.title + "</h3>" +
          '<p class="prix">' + Number(produit.prix).toFixed(2) + " €</p>" +
          (produit.description ? "<p>" + produit.description + "</p>" : "");
        container.appendChild(card);
      });
    })
    .catch(function (err) {
      console.error("Erreur chargement catalogue:", err);
    });
});
