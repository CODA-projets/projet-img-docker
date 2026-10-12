# Compendium d'Hyrule

Une petite application web en deux morceaux. **Le code est terminé** : vous n'avez pas une ligne à écrire. Votre travail, c'est de la faire tourner.

---

## Ce qu'il y a dans l'archive

```
client/          le site : un seul fichier HTML, du CSS, du JavaScript
  index.html
  style.css
  app.js
api/
  db.json        les données : 12 jeux, 20 personnages, 18 objets
```

**Le client ne contient aucune donnée.** Tout ce qu'il affiche, il va le demander à l'API au moment où vous cliquez. Si l'API ne répond pas, le site s'affiche quand même, mais vide, avec un message qui vous dit quoi vérifier.

---

## Les deux morceaux, et ce dont ils ont besoin

### Le client

Des fichiers statiques. Rien à installer, rien à compiler. Il lui faut simplement **un serveur web qui les serve**.

### L'API

`db.json` n'est pas un serveur, c'est un fichier. Pour en faire une API, on utilise **json-server**, qui lit le fichier et expose automatiquement trois adresses :

```
/jeux
/personnages
/objets
```

json-server s'installe avec npm. Il lui faut donc **un environnement Node**.

Sa documentation officielle est ici, et elle contient tout ce dont vous aurez besoin : les options, le port, l'adresse d'écoute.

```
https://www.npmjs.com/package/json-server
```

---

## Comment le client parle à l'API

Tout en haut de `client/app.js`, il y a une ligne, et une seule, qui dit où joindre l'API :

```js
const API_BASE = "http://localhost:3000";
```

**Cette ligne est déjà juste. Vous n'avez rien à y changer.** Si le site reste vide, le problème est du côté de l'API, pas ici.

**Attention à un détail qui compte :** ce JavaScript s'exécute dans **votre navigateur**, pas dans un conteneur. L'adresse écrite ici doit donc être une adresse que *votre navigateur* sait joindre. C'est aussi pour ça que vos deux conteneurs n'ont jamais besoin de se parler entre eux : c'est le navigateur qui s'adresse à chacun des deux.

---

## Les adresses du site

Le site utilise un routage par ancre : une seule page HTML, et l'adresse après le `#` décide de ce qui s'affiche.

| Adresse | Ce qu'elle montre |
|---|---|
| `#/` | accueil et compteurs |
| `#/jeux` | la liste des jeux |
| `#/jeux/5` | la fiche d'un jeu, avec ses personnages et ses objets |
| `#/personnages` | la liste, avec filtre par race |
| `#/personnages/8` | une fiche de personnage |
| `#/objets` | la liste, avec filtre par type |

En haut à droite, une pastille indique en permanence si l'API répond.

---

## Comment savoir que vous avez réussi

1. Le site s'ouvre dans votre navigateur.
2. La pastille en haut à droite est **verte**.
3. L'accueil affiche **12**, **20** et **18**.
4. Vous cliquez sur un jeu, et sa fiche liste les personnages et objets qui lui sont rattachés.

Si la pastille est rouge, la page vous indique les quatre causes possibles, dans l'ordre où il faut les vérifier. Lisez-les : la réponse est presque toujours la quatrième.

---

## Ce que vous ne trouverez pas ici

Les commandes. C'est l'exercice.

---

## Attention : ce n'est que la moitié du travail

Faire tourner le site, c'est l'étape 3 sur 4. Le sujet vous demande ensuite d'en
faire **deux images qui se suffisent à elles-mêmes**, puis de répondre à une
partie d'analyse. Reportez-vous à la feuille de sujet pour la liste complète de
ce qui est attendu, le format du rendu et la date limite.
