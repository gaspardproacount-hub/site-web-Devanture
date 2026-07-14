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

## Accès client

Le client se rend sur `https://<son-site>/admin`, clique sur "Login with
GitHub", et doit avoir un compte GitHub avec accès en écriture à son propre
repo (soit en tant que collaborateur, soit un compte dédié créé pour lui).
Une fois connecté, il voit uniquement l'interface définie dans `config.yml`
(ex. "Catalogue produits") — pas le code, pas les autres fichiers du repo.

## Ce qui est à faire une seule fois (déjà fait)

- Le provider OAuth partagé (`/api/auth.js` + `/api/callback.js`, à la
  racine du repo site-web-Devanture) et son app OAuth GitHub associée.

## Ce qui est à refaire pour chaque nouveau client

- Étapes 1 à 7 ci-dessus.
