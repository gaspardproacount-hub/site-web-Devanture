# Gabarit Decap CMS — à copier dans chaque nouveau site client

Ce dossier n'est **pas actif** sur le site Devanture (pas de vrai catalogue à
éditer ici). C'est un gabarit à copier tel quel dans le repo GitHub de chaque
futur site client, puis à adapter.

## Le principe (pourquoi ça marche sans build)

1. Le client édite son catalogue/sa carte dans une interface web (`/admin`),
   sans toucher au code.
2. Decap CMS committe le changement dans le repo GitHub, dans un simple
   fichier JSON (`content/catalogue.json`).
3. Vercel redéploie automatiquement le site à chaque push sur `main` — le
   nouveau JSON est servi comme n'importe quel autre fichier statique.
4. Une poignée de JS (`render-example.js`) va chercher ce JSON au chargement
   de la page et affiche chaque produit/plat dans le HTML.

Résultat : le client modifie son contenu, le site se met à jour tout seul,
sans build ni serveur de base de données — cohérent avec des sites 100 %
HTML/CSS/JS statiques comme ceux de Devanture.

## Étapes pour un nouveau site client

1. **Copier** `index.html` et `config.yml` de ce dossier vers `admin/` à la
   racine du repo du client.
2. Dans `admin/config.yml` : remplacer `repo:` par le vrai `owner/repo`
   GitHub du client, garder ou adapter la collection (catalogue boutique ou
   carte resto — un exemple de chaque est fourni, commenté).
3. **Copier** `content/catalogue.json` (ou l'adapter en `content/menu.json`
   pour un resto) à la racine du repo client, avec le vrai contenu de départ.
4. **Copier** `render-example.js` à la racine du repo client, l'adapter au
   HTML/CSS réel du site (classes, structure des cartes, champs affichés).
5. Dans la page du site qui doit afficher le catalogue/la carte, ajouter :
   ```html
   <div id="catalogue-liste"></div>
   <script src="render-example.js"></script>
   ```
6. Vérifier que `api/auth.js` et `api/callback.js` (provider OAuth partagé)
   sont bien accessibles sur `https://www.devanture-web.fr/api` — rien à
   redéployer, c'est déjà en place une fois pour toutes.
7. Donner au client l'accès à `https://<site-du-client>/admin` (voir
   plus bas "Accès client").

## Accès client (client non technique, ne connaît pas GitHub)

Le client n'a pas de compte GitHub et n'a pas à en créer un lui-même, ni à
comprendre ce que c'est. Marche à suivre, à faire une fois par client :

1. **Créer un compte GitHub dédié à ce client** (une seule fois, à sa
   création) — un simple compte GitHub gratuit, avec un email au choix
   (celui du client, ou une adresse dédiée type `client-nom@...`) et un mot
   de passe simple que tu notes de ton côté.
2. **Ajouter ce compte comme collaborateur** sur le repo GitHub de ce
   client **uniquement** (Settings → Collaborators sur son repo) — jamais
   sur le repo d'un autre client, pour garder les accès bien séparés.
3. **Se connecter une fois** avec ce compte, dans le navigateur du client
   (sur son ordinateur/téléphone, en rendez-vous ou par écran partagé) :
   ouvrir `https://<son-site>/admin`, cliquer "Login with GitHub", entrer
   l'email/mot de passe créés à l'étape 1. GitHub garde ensuite la session
   ouverte dans ce navigateur pendant plusieurs mois.
4. **Transmettre au client uniquement le lien** `https://<son-site>/admin`
   (à mettre en favori) — il n'aura plus jamais besoin de retaper d'identifiants
   ni de savoir que GitHub existe : il clique le lien, l'interface d'édition
   s'ouvre directement.

Si la session GitHub venait à expirer (rare), il suffit de se reconnecter une
fois avec les identifiants notés à l'étape 1 — le client peut aussi te
solliciter pour ça plutôt que de gérer un mot de passe GitHub lui-même.

Dans tous les cas, ce compte dédié n'a accès (en écriture) qu'au repo de ce
client précis : impossible pour lui de voir ou modifier le contenu d'un
autre client, même par erreur.

## Ce qui est à faire une seule fois (déjà fait)

- Le provider OAuth partagé (`/api/auth.js` + `/api/callback.js`, à la
  racine du repo site-web-Devanture) et son app OAuth GitHub associée.

## Ce qui est à refaire pour chaque nouveau client

- Étapes 1 à 7 ci-dessus.
