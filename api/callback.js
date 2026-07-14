// Fonction serverless Vercel : callback OAuth GitHub pour Decap CMS.
// Échange le code reçu de GitHub contre un access_token, puis le renvoie à la
// popup ouverte par Decap CMS via postMessage — c'est exactement le protocole
// attendu par le backend "github" de Decap (handshake "authorizing:github" puis
// "authorization:github:success:{...}").
//
// Nécessite OAUTH_GITHUB_CLIENT_ID et OAUTH_GITHUB_CLIENT_SECRET (voir api/auth.js).

module.exports = async function handler(req, res) {
  const { code, state, error, error_description } = req.query || {};

  if (error) {
    res.status(400).send(renderMessagePage("error", error_description || error));
    return;
  }

  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).send("Configuration serveur incomplète : variables OAUTH_GITHUB_* manquantes.");
    return;
  }

  // Vérifie le state contre le cookie posé par auth.js (protection CSRF).
  const cookies = parseCookies(req.headers.cookie || "");
  if (!state || !cookies.decap_oauth_state || state !== cookies.decap_oauth_state) {
    res.status(400).send(renderMessagePage("error", "État OAuth invalide, merci de relancer la connexion."));
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      res
        .status(400)
        .send(renderMessagePage("error", tokenData.error_description || "Échec de l'échange du code OAuth."));
      return;
    }

    res.setHeader("Set-Cookie", "decap_oauth_state=; Path=/; Max-Age=0");
    res.status(200).send(renderMessagePage("success", tokenData.access_token));
  } catch (err) {
    console.error("Erreur callback OAuth GitHub:", err);
    res.status(500).send(renderMessagePage("error", "Erreur serveur pendant l'échange OAuth."));
  }
};

function parseCookies(header) {
  const out = {};
  header.split(";").forEach(function (pair) {
    var idx = pair.indexOf("=");
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

function renderMessagePage(status, payload) {
  var message =
    status === "success"
      ? "authorization:github:success:" + JSON.stringify({ token: payload, provider: "github" })
      : "authorization:github:error:" + JSON.stringify({ message: payload });

  return (
    "<!DOCTYPE html><html><body>" +
    "<script>" +
    "(function() {" +
    "function receiveMessage(e) {" +
    "  window.opener.postMessage(" +
    JSON.stringify(message) +
    ", e.origin);" +
    "  window.removeEventListener('message', receiveMessage, false);" +
    "}" +
    "window.addEventListener('message', receiveMessage, false);" +
    "window.opener.postMessage('authorizing:github', '*');" +
    "})();" +
    "</script>" +
    "</body></html>"
  );
}
