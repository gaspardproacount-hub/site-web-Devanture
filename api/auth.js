// Fonction serverless Vercel : point de départ du flux OAuth GitHub pour Decap CMS.
// Provider partagé : n'importe quel site client Devanture peut pointer son
// admin/config.yml ici (base_url: "https://www.devanture-web.fr/api"), sans avoir
// à déployer son propre provider OAuth. Un seul jeu de variables d'environnement
// (sur ce projet Vercel) sert donc à tous les futurs sites clients.
//
// Nécessite les variables d'environnement OAUTH_GITHUB_CLIENT_ID et
// OAUTH_GITHUB_CLIENT_SECRET (voir api/callback.js) sur Vercel (Project Settings
// > Environment Variables), obtenues en créant une GitHub OAuth App — voir le
// message de fin de tâche pour la marche à suivre complète.

const crypto = require("crypto");

module.exports = function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    res.status(500).send("Configuration serveur incomplète : OAUTH_GITHUB_CLIENT_ID manquant.");
    return;
  }

  const state = crypto.randomBytes(16).toString("hex");
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const redirectUri = protocol + "://" + req.headers.host + "/api/callback";

  const authorizeUrl =
    "https://github.com/login/oauth/authorize?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "repo",
      state: state,
    }).toString();

  // Cookie signé par le temps (10 min), relu par callback.js pour vérifier le
  // state et se prémunir des attaques CSRF sur le flux OAuth.
  res.setHeader(
    "Set-Cookie",
    "decap_oauth_state=" + state + "; Path=/; HttpOnly; Max-Age=600; SameSite=Lax; Secure"
  );
  res.writeHead(302, { Location: authorizeUrl });
  res.end();
};
