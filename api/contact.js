// Fonction serverless Vercel : reçoit le formulaire de contact et envoie l'email
// via l'API Resend. Contrairement à un service tiers type FormSubmit, cette route
// reste sur le domaine devanture-web.fr : elle n'est donc pas visée par les
// bloqueurs de pub qui bloquent les formulaires pointant vers des domaines tiers.
//
// Nécessite la variable d'environnement RESEND_API_KEY sur Vercel (Project
// Settings > Environment Variables), obtenue gratuitement sur https://resend.com.

const DEST_EMAIL = "gaspard.proacount@gmail.com";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { nom, metier, telephone, message, _honey } = req.body || {};

  // Piège à spam : un bot remplit ce champ caché, un humain ne le voit jamais.
  if (_honey) {
    res.status(200).json({ success: true });
    return;
  }

  if (!nom || !metier || !message) {
    res.status(400).json({ error: "Champs requis manquants" });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY manquante dans les variables d'environnement Vercel");
    res.status(500).json({ error: "Configuration serveur incomplète" });
    return;
  }

  var escapeHtml = function (str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var html =
    "<table>" +
    "<tr><td><strong>Nom</strong></td><td>" + escapeHtml(nom) + "</td></tr>" +
    "<tr><td><strong>Métier</strong></td><td>" + escapeHtml(metier) + "</td></tr>" +
    "<tr><td><strong>Téléphone</strong></td><td>" + escapeHtml(telephone || "—") + "</td></tr>" +
    "<tr><td><strong>Message</strong></td><td>" + escapeHtml(message).replace(/\n/g, "<br>") + "</td></tr>" +
    "</table>";

  try {
    var resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Devanture <onboarding@resend.dev>",
        to: [DEST_EMAIL],
        subject: "Nouvelle demande de contact — Devanture",
        html: html,
      }),
    });

    if (!resendRes.ok) {
      var errBody = await resendRes.text();
      console.error("Erreur Resend:", resendRes.status, errBody);
      res.status(502).json({ error: "Échec de l'envoi" });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur envoi contact:", err);
    res.status(500).json({ error: "Échec de l'envoi" });
  }
};
