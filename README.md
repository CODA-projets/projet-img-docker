# Projet Docker — Compendium d'Hyrule

Projet scolaire consistant à **conteneuriser une application web existante**, puis à produire deux images Docker autonomes : une pour le client, une pour l'API.

L'application est un petit site « Compendium d'Hyrule » en deux morceaux :

- **`client/`** — un site statique (un fichier HTML, du CSS, du JavaScript). Il n'affiche aucune donnée par lui-même : tout ce qu'il montre, il le demande à l'API. Il doit donc être servi par un serveur web.
- **`api/`** — un fichier `db.json` (12 jeux, 20 personnages, 18 objets), transformé en API par [json-server](https://www.npmjs.com/package/json-server), qui expose les routes `/jeux`, `/personnages` et `/objets`.

Le code de l'application était **fourni terminé** dans le cadre de l'exercice : aucune ligne n'était à écrire. Le travail consistait à le faire tourner dans Docker.

---

## Répartition du travail

Le code de l'application (`client/` hors Dockerfile, `api/db.json`) et le sujet (`LISEZMOI.md`) ont été fournis par l'équipe pédagogique.

**Théo Arcelin et Raphaël Parmentier** (camarades de classe) sont intervenus uniquement sur :

- `api/Dockerfile` et `client/Dockerfile` — la conteneurisation des deux morceaux ;
- `COMMANDES.md` — les commandes de build et de lancement des images ;
- `ANALYSE.md` — la partie d'analyse (conteneurs vs machines virtuelles) ;
- `captures/` — les captures d'écran du résultat.

---

## Conteneurisation

### API — `api/Dockerfile`

Image `node` (alpine) dans laquelle `json-server` est installé globalement. Le fichier `db.json` est copié dans l'image, et `json-server` est lancé au démarrage. L'API écoute sur le port **3000**.

### Client — `client/Dockerfile`

Image `nginx` (alpine) : les fichiers statiques du site sont copiés dans le répertoire servi par nginx. Le client écoute sur le port **80**, publié sur le **8080** de la machine hôte.

> **Détail important :** le JavaScript du site s'exécute dans le navigateur, pas dans un conteneur. Les deux conteneurs n'ont donc jamais besoin de communiquer entre eux : c'est le navigateur qui interroge chacun d'eux directement.

---

## Lancer le projet

Les commandes détaillées figurent dans [`COMMANDES.md`](COMMANDES.md). En résumé :

```bash
# Construire les images
docker build -t api-node ./api
docker build -t client-node ./client

# Lancer les conteneurs
docker run -d --name api-projet-node -p 3000:3000 api-node
docker run -d --name client-projet-node -p 8080:80 client-node
```

Le site est ensuite accessible à l'adresse **http://localhost:8080**.

### Vérifier que ça marche

1. Le site s'ouvre dans le navigateur.
2. La pastille en haut à droite est **verte** (l'API répond).
3. L'accueil affiche les compteurs **12**, **20** et **18**.
4. La fiche d'un jeu liste ses personnages et ses objets.

Des captures du résultat sont disponibles dans le dossier [`captures/`](captures/).

---

## Analyse

La partie d'analyse du sujet (dans quels cas privilégier un conteneur ou une machine virtuelle) est traitée dans [`ANALYSE.md`](ANALYSE.md).
