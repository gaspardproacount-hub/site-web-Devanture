// Le Basilic — outil de réservation fictif (page infos/réserver).
// Purement démonstratif : aucune requête réseau, juste un résumé affiché
// côté client pour donner l'impression d'une vraie prise de réservation.

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("lb-reservation-form");
  var confirmBox = document.getElementById("lb-booking-confirm");
  var summaryEl = document.getElementById("lb-booking-summary");
  var resetBtn = document.getElementById("lb-booking-reset");
  var dateInput = document.getElementById("lb-date");

  if (!form || !confirmBox || !summaryEl) return;

  // Empêche de choisir une date passée.
  if (dateInput) {
    dateInput.min = new Date().toISOString().slice(0, 10);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var date = document.getElementById("lb-date").value;
    var heure = document.getElementById("lb-heure").value;
    var convives = document.getElementById("lb-convives").value;
    var nom = document.getElementById("lb-nom").value;

    var dateFormatee = date
      ? new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : "";

    summaryEl.textContent =
      "Merci " + nom + " — table pour " + convives.toLowerCase() + " le " + dateFormatee + " à " + heure + ".";

    form.hidden = true;
    confirmBox.hidden = false;
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.hidden = false;
      confirmBox.hidden = true;
    });
  }
});
