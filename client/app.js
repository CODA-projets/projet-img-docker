/* ============================================================
   Compendium d'Hyrule, client statique
   ------------------------------------------------------------
   Ce fichier ne contient AUCUNE donnée.
   Tout est demandé à l'API au moment de l'affichage.

   >>> LA SEULE LIGNE QUE VOUS AUREZ À MODIFIER <<<
   ============================================================ */

const API_BASE = "http://localhost:3000";

/* ============================================================ */

const app = document.getElementById("app");

/* ---------- accès à l'API ---------- */

async function api(chemin) {
  const url = API_BASE + chemin;
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error(`L'API a répondu ${reponse.status} pour ${url}`);
  return reponse.json();
}

function majSceau(ok) {
  const sceau = document.getElementById("sceau");
  sceau.classList.toggle("ok", ok);
  sceau.classList.toggle("ko", !ok);
  document.getElementById("sceau-texte").textContent = ok ? "sceau intact" : "sceau brisé";
}

/* ---------- marques gravées ----------
   Huit marques inventées, au trait droit, comme gravées au ciseau.
   Chaque entrée reçoit toujours la même, d'après son identifiant.      */

const MARQUES = [
  "M8 1v18M8 6l6-5M8 6L2 1",
  "M8 1v18M2 6h12M3 14h10",
  "M8 1v18M2 10l6-6 6 6",
  "M2 1l6 9-6 9M14 1l-6 9 6 9",
  "M8 1v18M8 5l6 4-6 4",
  "M2 3h12M8 3v14M3 17h10",
  "M8 1l6 9-6 9-6-9z M8 5v10",
  "M2 1v18M14 1v18M2 7l12 6",
];

const marque = (id) =>
  `<svg class="rune" viewBox="0 0 16 20" aria-hidden="true"><path d="${
    MARQUES[Math.abs(parseInt(id, 10) || 0) % MARQUES.length]
  }"/></svg>`;

/* ---------- utilitaires ---------- */

const echappe = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const unique = (tableau) => [...new Set(tableau)].sort((a, b) => a.localeCompare(b, "fr"));

/* Une ligne de registre : l'année ou la qualité en marge, l'entrée au centre. */
function entree(lien, id, marginal, nom, mentions, glose) {
  return `
    <a class="entree" href="${lien}">
      <span class="marge">${echappe(marginal)}</span>
      <span class="entree-corps">
        <span class="entree-nom">${marque(id)}${echappe(nom)}${
          mentions ? `<em>${echappe(mentions)}</em>` : ""
        }</span>
        <p class="entree-glose">${echappe(glose)}</p>
      </span>
    </a>`;
}

const registre = (lignes) => `<div class="registre">${lignes.join("")}</div>`;

/* ---------- pages ---------- */

async function accueil() {
  const [jeux, personnages, objets] = await Promise.all([
    api("/jeux"),
    api("/personnages"),
    api("/objets"),
  ]);

  const derniers = [...jeux].sort((a, b) => b.annee - a.annee).slice(0, 3);

  app.innerHTML = `
    <h1 class="titre-page">Compendium d'Hyrule</h1>
    <p class="exergue">Trois registres, tenus à jour depuis mille neuf cent quatre-vingt-six.</p>

    <div class="denombrement">
      <div><b>${jeux.length}</b><span>volumes</span></div>
      <div><b>${personnages.length}</b><span>gens</span></div>
      <div><b>${objets.length}</b><span>objets</span></div>
    </div>

    <h2 class="intertitre">Derniers volumes portés au registre</h2>
    ${registre(derniers.map((j) => entree(`#/jeux/${j.id}`, j.id, j.annee, j.titre, j.console, j.resume)))}`;
}

async function listeJeux() {
  const jeux = await api("/jeux?_sort=annee");

  app.innerHTML = `
    <h1 class="titre-page">Registre des volumes</h1>
    <p class="exergue">Douze épisodes, portés par ordre de parution.</p>
    ${registre(jeux.map((j) => entree(`#/jeux/${j.id}`, j.id, j.annee, j.titre, j.console, j.resume)))}`;
}

async function detailJeu(id) {
  const [jeu, gens, objets] = await Promise.all([
    api(`/jeux/${id}`),
    api(`/personnages?jeuId=${id}`),
    api(`/objets?jeuId=${id}`),
  ]);

  app.innerHTML = `
    <a class="retour" href="#/jeux">← revenir au registre</a>

    <article class="feuillet">
      <h1 class="rubrique">${echappe(jeu.titre)}</h1>
      <p class="marginalia">${echappe(jeu.annee)}, ${echappe(jeu.console)}</p>
      <p class="corps">${echappe(jeu.resume)}</p>
    </article>

    ${gens.length ? `<h2 class="intertitre">Gens qui y paraissent</h2>
      ${registre(gens.map((p) => entree(`#/personnages/${p.id}`, p.id, p.race, p.nom, p.role, p.description)))}` : ""}

    ${objets.length ? `<h2 class="intertitre">Objets recensés</h2>
      ${registre(objets.map((o) => entree(`#/objets/${o.id}`, o.id, o.type, o.nom, "", o.description)))}` : ""}`;
}

async function listePersonnages(filtre) {
  const tous = await api("/personnages");
  const races = unique(tous.map((p) => p.race));
  const visibles = filtre ? tous.filter((p) => p.race === filtre) : tous;

  app.innerHTML = `
    <h1 class="titre-page">Registre des gens</h1>
    <p class="exergue">${visibles.length} fiche${visibles.length > 1 ? "s" : ""} au feuillet${filtre ? `, maison ${echappe(filtre)}` : ""}.</p>

    <div class="filtres">
      <button data-race="">toutes maisons</button>
      ${races.map((r) => `<button data-race="${echappe(r)}">${echappe(r)}</button>`).join("")}
    </div>

    ${registre(visibles.map((p) => entree(`#/personnages/${p.id}`, p.id, p.race, p.nom, p.role, p.description)))}`;

  brancherFiltres("race", filtre, "/personnages");
}

async function detailPersonnage(id) {
  const personnage = await api(`/personnages/${id}`);
  const jeu = await api(`/jeux/${personnage.jeuId}`);

  app.innerHTML = `
    <a class="retour" href="#/personnages">← revenir au registre</a>

    <article class="feuillet">
      <h1 class="rubrique">${echappe(personnage.nom)}</h1>
      <p class="marginalia">${echappe(personnage.race)}, ${echappe(personnage.role).toLowerCase()}</p>
      <p class="corps">${echappe(personnage.description)}</p>
    </article>

    <h2 class="intertitre">Paraît dans</h2>
    ${registre([entree(`#/jeux/${jeu.id}`, jeu.id, jeu.annee, jeu.titre, jeu.console, jeu.resume)])}`;
}

async function listeObjets(filtre) {
  const tous = await api("/objets");
  const types = unique(tous.map((o) => o.type));
  const visibles = filtre ? tous.filter((o) => o.type === filtre) : tous;

  app.innerHTML = `
    <h1 class="titre-page">Registre des objets</h1>
    <p class="exergue">${visibles.length} pièce${visibles.length > 1 ? "s" : ""} inventoriée${visibles.length > 1 ? "s" : ""}${filtre ? `, catégorie ${echappe(filtre).toLowerCase()}` : ""}.</p>

    <div class="filtres">
      <button data-type="">toutes catégories</button>
      ${types.map((t) => `<button data-type="${echappe(t)}">${echappe(t)}</button>`).join("")}
    </div>

    ${registre(visibles.map((o) => entree(`#/objets/${o.id}`, o.id, o.type, o.nom, "", o.description)))}`;

  brancherFiltres("type", filtre, "/objets");
}

async function detailObjet(id) {
  const objet = await api(`/objets/${id}`);
  const jeu = await api(`/jeux/${objet.jeuId}`);

  app.innerHTML = `
    <a class="retour" href="#/objets">← revenir au registre</a>

    <article class="feuillet">
      <h1 class="rubrique">${echappe(objet.nom)}</h1>
      <p class="marginalia">${echappe(objet.type)}</p>
      <p class="corps">${echappe(objet.description)}</p>
    </article>

    <h2 class="intertitre">Paraît dans</h2>
    ${registre([entree(`#/jeux/${jeu.id}`, jeu.id, jeu.annee, jeu.titre, jeu.console, jeu.resume)])}`;
}

function brancherFiltres(cle, actif, base) {
  app.querySelectorAll(".filtres button").forEach((bouton) => {
    const valeur = bouton.dataset[cle];
    if (valeur === (actif || "")) bouton.classList.add("actif");
    bouton.onclick = () => {
      location.hash = valeur ? `${base}?${cle}=${encodeURIComponent(valeur)}` : base;
    };
  });
}

function introuvable() {
  app.innerHTML = `
    <h1 class="titre-page">Feuillet manquant</h1>
    <p class="exergue">Cette page n'a jamais été reliée au volume. <a href="#/">Revenir à la première</a>.</p>`;
}

/* ---------- avis d'erreur : il sert de guide de dépannage ---------- */

function avisErreur(erreur) {
  app.innerHTML = `
    <div class="avis">
      <h2>Le scribe n'a rien reçu</h2>
      <p>Le feuillet s'est bien déplié : vous le lisez. Mais l'API n'a pas répondu, donc il n'y a rien à recopier dessus.</p>
      <p>Adresse appelée : <code>${echappe(API_BASE)}</code></p>
      <pre>${echappe(erreur.message)}</pre>

      <h2 style="font-size:21px;margin-top:26px">Quatre causes, dans cet ordre</h2>
      <ol>
        <li>Le conteneur de l'API ne tourne pas. <code>docker ps -a</code></li>
        <li>Il tourne, mais il a échoué au démarrage. <code>docker logs &lt;nom&gt;</code></li>
        <li>Il tourne, mais son port n'est pas publié vers votre machine.</li>
        <li>Le port est publié, et pourtant rien ne passe : le service n'écoute que sur <code>localhost</code> <em>à l'intérieur</em> du conteneur. Personne ne peut l'atteindre du dehors.</li>
      </ol>
      <p class="post-scriptum">La quatrième est la bonne quatre fois sur cinq.</p>
    </div>`;
}

/* ---------- routeur ---------- */

const routes = [
  [/^\/?$/, accueil],
  [/^\/jeux$/, listeJeux],
  [/^\/jeux\/(\d+)$/, detailJeu],
  [/^\/personnages$/, listePersonnages],
  [/^\/personnages\/(\d+)$/, detailPersonnage],
  [/^\/objets$/, listeObjets],
  [/^\/objets\/(\d+)$/, detailObjet],
];

async function router() {
  const brut = location.hash.slice(1) || "/";
  const [chemin, requete] = brut.split("?");
  const parametres = new URLSearchParams(requete || "");

  document.querySelectorAll("[data-nav]").forEach((lien) => {
    lien.classList.toggle("actif", lien.dataset.nav === chemin);
  });

  app.innerHTML = `<p class="chargement">On déplie le feuillet…</p>`;

  for (const [motif, vue] of routes) {
    const trouve = chemin.match(motif);
    if (!trouve) continue;

    try {
      if (vue === listePersonnages) await vue(parametres.get("race"));
      else if (vue === listeObjets) await vue(parametres.get("type"));
      else await vue(trouve[1]);
      majSceau(true);
    } catch (erreur) {
      majSceau(false);
      avisErreur(erreur);
    }
    window.scrollTo(0, 0);
    return;
  }

  introuvable();
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
