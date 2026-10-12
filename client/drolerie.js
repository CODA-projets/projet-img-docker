/* ============================================================
   Drôlerie marginale
   ------------------------------------------------------------
   Dans les manuscrits médiévaux, les marges grouillent de petites
   créatures qui se poursuivent. Celle-ci se réveille au Konami code.

      ↑ ↑ ↓ ↓ ← → ← → B A

   Le copiste ramasse les rubis. Les grotesques le poursuivent.
   Les fées le rendent intouchable, le temps de quelques lignes.
   ============================================================ */

(() => {
  "use strict";

  const SEQUENCE = [
    "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
    "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a",
  ];

  /* ---------- le labyrinthe : 19 colonnes sur 21 lignes ---------- */

  const PLAN = [
    "###################",
    "#........#........#",
    "#o##.###.#.###.##o#",
    "#.................#",
    "#.##.#.#####.#.##.#",
    "#....#...#...#....#",
    "####.### # ###.####",
    "####.#   G   #.####",
    "####.# ##=## #.####",
    "    .  #GGG#  .    ",
    "####.# ##### #.####",
    "####.#       #.####",
    "####.# ##### #.####",
    "#........#........#",
    "#.##.###.#.###.##.#",
    "#o.#....P......#.o#",
    "##.#.#.#####.#.#.##",
    "#....#...#...#....#",
    "#.######.#.######.#",
    "#.................#",
    "###################",
  ];

  const COLS = PLAN[0].length;
  const LIGNES = PLAN.length;
  const CASE = 16;

  /* ---------- palette, reprise du codex ---------- */

  const C = {
    velin:   "#e9ddbf",
    mur:     "#2b2017",
    murOmbre:"#5a4733",
    rubis:   "#9b2d22",
    or:      "#a8812f",
    copiste: "#2b2017",
    fee:     "#4b6a57",
    peur:    "#9c8a6e",
    texte:   "#2b2017",
  };

  /* ---------- sprites, 8 × 8, dessinés ici même ---------- */

  const P_ = null;
  const sprite = (lignes, cles) =>
    lignes.map((l) => [...l].map((c) => (c === "." ? P_ : cles[c])));

  const COPISTE = {
    bas: sprite([
      "..####..",
      ".#++++#.",
      ".#+oo+#.",
      ".######.",
      "..####..",
      ".#.##.#.",
      ".#.##.#.",
      "..#..#..",
    ], { "#": C.copiste, "+": "#6d5c46", o: C.velin }),
    haut: sprite([
      "..####..",
      ".#++++#.",
      ".#++++#.",
      ".######.",
      "..####..",
      ".#.##.#.",
      ".#.##.#.",
      "..#..#..",
    ], { "#": C.copiste, "+": "#6d5c46" }),
  };

  const GROTESQUE = (teinte) =>
    sprite([
      "#......#",
      ".#....#.",
      "..####..",
      ".#+##+#.",
      "#+o##o+#",
      "#++++++#",
      "#+#++#+#",
      ".#.##.#.",
    ], { "#": teinte, "+": teinte, o: C.velin });

  const TEINTES = ["#9b2d22", "#4b6a57", "#7a5a2e", "#6d4a55"];
  const GROTESQUES = TEINTES.map(GROTESQUE);
  const APEURE = GROTESQUE(C.peur);

  function dessineSprite(ctx, s, x, y) {
    for (let j = 0; j < 8; j++)
      for (let i = 0; i < 8; i++) {
        const c = s[j][i];
        if (c) { ctx.fillStyle = c; ctx.fillRect(x + i * 2, y + j * 2, 2, 2); }
      }
  }

  /* ---------- cadence ----------
     La simulation tourne à pas fixe, indépendamment du rafraîchissement
     de l'écran. Un 144 Hz et un 60 Hz jouent exactement à la même vitesse. */

  const HZ = 60;                       // pas de simulation par seconde
  const PAS = 1000 / HZ;               // durée d'un pas, en millisecondes
  const RETARD_MAX = 250;              // au-delà, on ne rattrape pas (onglet en arrière-plan)

  // vitesses en CASES PAR SECONDE, converties en fraction de case par pas
  const V = {
    copiste:   8.5 / HZ,
    grotesque: 7.0 / HZ,               // un peu moins vif que le copiste
    ecart:     0.4 / HZ,               // chaque grotesque est légèrement plus rapide
    apeure:    4.0 / HZ,
  };
  const DUREE_FEE = 8 * HZ;            // huit secondes, quelle que soit la machine

  /* ---------- état ---------- */

  let ouvert = false, boucle = 0, ctx = null, couche = null;
  let dette = 0, horodatage = 0;
  let grille, copiste, grotesques, score, vies, invincible, gagne, perdu, tic;

  const estMur = (c, l) => {
    if (l < 0 || l >= LIGNES) return true;
    return "#=".includes(grille[l][(c + COLS) % COLS]);   // le couloir latéral fait le tour
  };

  function initialise() {
    grille = PLAN.map((l) => [...l]);
    score = 0; vies = 3; invincible = 0; gagne = false; perdu = false; tic = 0;
    grotesques = [];

    grille.forEach((ligne, l) =>
      ligne.forEach((c, i) => {
        if (c === "P") { copiste = { c: i, l, ac: i, al: l, dc: 0, dl: 0, p: 0, haut: false }; grille[l][i] = "."; }
        if (c === "G") { grotesques.push({ c: i, l, ac: i, al: l, dc: 0, dl: -1, p: 0, dep: { c: i, l }, i: grotesques.length }); grille[l][i] = " "; }
      })
    );
  }

  function replace() {
    copiste.dc = copiste.dl = 0; copiste.p = 0; souhait = null;
    grille.forEach((ligne, l) => ligne.forEach((c, i) => {
      if (PLAN[l][i] === "P") { copiste.c = copiste.ac = i; copiste.l = copiste.al = l; }
    }));
    grotesques.forEach((g) => {
      g.c = g.ac = g.dep.c; g.l = g.al = g.dep.l; g.dc = 0; g.dl = -1; g.p = 0;
    });
    invincible = 0;
  }

  /* ---------- déplacements ---------- */

  const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
  let souhait = null;

  function avance(e, vitesse) {
    if (!e.dc && !e.dl) return false;
    e.p += vitesse;
    if (e.p < 1) return false;
    e.p -= 1;                                    // on garde le reste, rien ne se perd
    const nc = e.c + e.dc, nl = e.l + e.dl;
    if (estMur(nc, nl)) { e.dc = e.dl = 0; e.p = 0; return false; }
    e.ac = e.c; e.al = e.l;                      // case précédente, pour détecter les croisements
    e.c = (nc + COLS) % COLS;                    // le couloir latéral fait le tour
    e.l = nl;
    return true;
  }

  function bougeCopiste() {
    if (souhait && !estMur(copiste.c + souhait[0], copiste.l + souhait[1])) {
      copiste.dc = souhait[0]; copiste.dl = souhait[1]; souhait = null;
    }
    if (copiste.dl === -1) copiste.haut = true;
    if (copiste.dl === 1) copiste.haut = false;

    if (!avance(copiste, V.copiste)) return;

    const sous = grille[copiste.l][copiste.c];
    if (sous === ".") { grille[copiste.l][copiste.c] = " "; score += 10; }
    if (sous === "o") { grille[copiste.l][copiste.c] = " "; score += 50; invincible = DUREE_FEE; }
    if (!grille.some((ligne) => ligne.some((c) => c === "." || c === "o"))) gagne = true;
  }

  function bougeGrotesque(g) {
    const vitesse = invincible > 0 ? V.apeure : V.grotesque + g.i * V.ecart;
    const nouvelleCase = avance(g, vitesse);

    // on ne rechoisit qu'en entrant dans une case, ou si on est à l'arrêt
    if (!nouvelleCase && (g.dc || g.dl)) return;

    const options = DIRS.filter(([dc, dl]) =>
      !estMur(g.c + dc, g.l + dl) && !(dc === -g.dc && dl === -g.dl));
    if (!options.length) { g.dc = -g.dc; g.dl = -g.dl; return; }

    const fuit = invincible > 0;
    const vise = Math.random() < (fuit ? 0.55 : 0.72);
    if (vise) {
      options.sort((a, b) => {
        const d = (o) => Math.hypot(g.c + o[0] - copiste.c, g.l + o[1] - copiste.l);
        return fuit ? d(b) - d(a) : d(a) - d(b);
      });
      [g.dc, g.dl] = options[0];
    } else {
      [g.dc, g.dl] = options[(Math.random() * options.length) | 0];
    }
  }

  function collisions() {
    grotesques.forEach((g) => {
      const memeCase = g.c === copiste.c && g.l === copiste.l;
      const croisement = g.c === copiste.ac && g.l === copiste.al
                      && g.ac === copiste.c && g.al === copiste.l;
      if (!memeCase && !croisement) return;
      if (invincible > 0) {
        score += 200;
        g.c = g.ac = g.dep.c; g.l = g.al = g.dep.l; g.dc = 0; g.dl = -1; g.p = 0;
      } else if (--vies <= 0) {
        perdu = true;
      } else {
        replace();
      }
    });
  }

  /* ---------- rendu ---------- */

  function dessine() {
    ctx.fillStyle = C.velin;
    ctx.fillRect(0, 0, COLS * CASE, LIGNES * CASE + 28);

    for (let l = 0; l < LIGNES; l++)
      for (let c = 0; c < COLS; c++) {
        const x = c * CASE, y = l * CASE, t = grille[l][c];
        if (t === "#" || t === "=") {
          ctx.fillStyle = t === "=" ? C.or : C.mur;
          ctx.fillRect(x + 2, y + 2, CASE - 4, CASE - 4);
          ctx.fillStyle = C.murOmbre;
          ctx.fillRect(x + 2, y + CASE - 4, CASE - 4, 2);
        } else if (t === ".") {
          ctx.fillStyle = C.rubis;
          ctx.fillRect(x + 7, y + 6, 2, 4);
          ctx.fillRect(x + 6, y + 7, 4, 2);
        } else if (t === "o") {
          const b = 2 + Math.sin(tic / 9) * 1.4;
          ctx.fillStyle = C.fee;
          ctx.fillRect(x + 8 - b, y + 8 - b, b * 2, b * 2);
          ctx.fillStyle = C.or;
          ctx.fillRect(x + 7, y + 7, 2, 2);
        }
      }

    grotesques.forEach((g, i) => {
      const clignote = invincible > 0 && invincible < 120 && (tic >> 3) % 2;
      dessineSprite(ctx, invincible > 0 && !clignote ? APEURE : GROTESQUES[i % 4],
        g.c * CASE, g.l * CASE);
    });

    dessineSprite(ctx, copiste.haut ? COPISTE.haut : COPISTE.bas, copiste.c * CASE, copiste.l * CASE);

    // bandeau
    ctx.fillStyle = C.texte;
    ctx.font = "11px ui-monospace, Menlo, Consolas, monospace";
    ctx.fillText(`rubis ${score}`, 4, LIGNES * CASE + 18);
    for (let v = 0; v < Math.max(0, vies); v++) {
      const vx = COLS * CASE - 12 - v * 13, vy = LIGNES * CASE + 14;
      ctx.fillStyle = C.rubis;
      ctx.fillRect(vx + 3, vy - 4, 2, 8);
      ctx.fillRect(vx + 1, vy - 2, 6, 4);
      ctx.fillRect(vx, vy - 1, 8, 2);
    }
    ctx.fillStyle = C.texte;
    if (invincible > 0) {
      ctx.fillStyle = C.fee;
      ctx.fillText("fée", COLS * CASE / 2 - 10, LIGNES * CASE + 18);
    }

    if (gagne || perdu) {
      ctx.fillStyle = "rgba(233,221,191,.9)";
      ctx.fillRect(0, LIGNES * CASE / 2 - 30, COLS * CASE, 60);
      ctx.fillStyle = gagne ? C.fee : C.rubis;
      ctx.font = "15px Georgia, serif";
      const msg = gagne ? "La marge est nettoyée." : "La marge vous a repris.";
      ctx.fillText(msg, (COLS * CASE - ctx.measureText(msg).width) / 2, LIGNES * CASE / 2 - 4);
      ctx.fillStyle = C.texte;
      ctx.font = "11px ui-monospace, Menlo, Consolas, monospace";
      const sub = "R pour recommencer · Échap pour refermer";
      ctx.fillText(sub, (COLS * CASE - ctx.measureText(sub).width) / 2, LIGNES * CASE / 2 + 16);
    }
  }

  function simule() {
    tic++;
    if (gagne || perdu) return;
    if (invincible > 0) invincible--;
    bougeCopiste();
    grotesques.forEach(bougeGrotesque);
    collisions();
  }

  function tour(maintenant) {
    boucle = requestAnimationFrame(tour);

    if (!horodatage) { horodatage = maintenant; dessine(); return; }
    let ecoule = maintenant - horodatage;
    horodatage = maintenant;
    if (ecoule > RETARD_MAX) ecoule = RETARD_MAX;   // onglet revenu au premier plan

    dette += ecoule;
    let gardeFou = 0;
    while (dette >= PAS && gardeFou++ < 8) { simule(); dette -= PAS; }
    if (dette > PAS) dette = 0;                      // machine trop lente : on saute, on n'accumule pas

    dessine();
  }

  /* ---------- ouverture et fermeture ---------- */

  const TOUCHES = {
    ArrowRight:[1,0], ArrowLeft:[-1,0], ArrowDown:[0,1], ArrowUp:[0,-1],
    d:[1,0], q:[-1,0], s:[0,1], z:[0,-1],
  };

  function auClavier(e) {
    const t = TOUCHES[e.key];
    if (t) { souhait = t; e.preventDefault(); return; }
    if (e.key === "Escape") ferme();
    if (e.key.toLowerCase() === "r" && (gagne || perdu)) initialise();
  }

  function ouvre() {
    if (ouvert) return;
    ouvert = true;

    couche = document.createElement("div");
    couche.className = "drolerie";
    couche.innerHTML = `
      <div class="drolerie-cadre">
        <p class="drolerie-titre">Drôlerie marginale</p>
        <canvas width="${COLS * CASE}" height="${LIGNES * CASE + 28}"></canvas>
        <p class="drolerie-pied">flèches ou ZQSD · les fées rendent intouchable · Échap pour refermer</p>
      </div>`;
    document.body.appendChild(couche);

    const canvas = couche.querySelector("canvas");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    initialise();
    dette = 0; horodatage = 0;
    addEventListener("keydown", auClavier);
    couche.addEventListener("click", (e) => { if (e.target === couche) ferme(); });
    boucle = requestAnimationFrame(tour);
  }

  function ferme() {
    if (!ouvert) return;
    ouvert = false;
    cancelAnimationFrame(boucle);
    removeEventListener("keydown", auClavier);
    couche.remove();
    couche = null;
  }

  /* ---------- la séquence ---------- */

  let avancement = 0;
  addEventListener("keydown", (e) => {
    if (ouvert) return;
    const attendu = SEQUENCE[avancement];
    const touche = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    avancement = touche === attendu ? avancement + 1 : (touche === SEQUENCE[0] ? 1 : 0);
    if (avancement === SEQUENCE.length) { avancement = 0; ouvre(); }
  });
})();
