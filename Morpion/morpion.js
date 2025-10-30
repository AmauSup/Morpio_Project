let joueur1_nom = "Joueur 1";
let joueur2_nom = "Joueur 2";
let joueur3_nom = "Joueur 3";
let joueur4_nom = "Joueur 4";
let joueurs = [];
let tour = 0;
let statut_jeu = 0;
let taille = 3;
let grille = [];
let scores = { X: 0, O: 0, V: 0, D: 0 };
let mode = "pvp";
let manchesTotales = 1;
let mancheActuelle = 1;
let variante = "classique";
let nbJoueurs = 2;
let maxPions = 3;

// historique des gagnants de chaque manche pour Best of 3
let historiqueManches = [];

// gagnant de la manche en cours (symbole, genre "X" ou "O")
let dernierGagnantSymbole = null;

// Charger les scores depuis localStorage
window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("scores"));
  if (saved) scores = saved;
  majScore();
};

// === Initialisation du jeu ===
function init() {
  if (!manchesTotales) manchesTotales = 1;
  if (!nbJoueurs) nbJoueurs = 2;

  taille = parseInt(document.getElementById("grille").value);
  mode = document.getElementById("mode").value;
  manchesTotales = parseInt(document.getElementById("manches").value);
  variante = document.getElementById("variante").value;
  nbJoueurs = parseInt(document.getElementById("nb_joueurs").value);
  statut_jeu = 1;
  grille = Array(taille * taille).fill("");
  generateGrid();

  const symboles = ["X", "O", "V", "D"];
  joueurs = [];
  for (let i = 1; i <= nbJoueurs; i++) {
    const nomInput = document.getElementById("j" + i);
    const nom = nomInput ? nomInput.value || "Joueur " + i : "Joueur " + i;
    joueurs.push({
      nom,
      symbole: symboles[i - 1],
      pionsPoses: []
    });
  }

  maxPions = taille;

  // tirage au sort du premier joueur
  tour = Math.floor(Math.random() * joueurs.length);

  // reset du gagnant courant
  dernierGagnantSymbole = null;

  // si c'est l'ordi qui commence
  if (mode === "pve" && nbJoueurs === 2 && tour === 1) {
    document.getElementById("txt_joueur").innerText = "L'ordinateur commence 🤖";
    setTimeout(ia_jouer, 700);
  } else {
    document.getElementById("txt_joueur").innerText =
      "À " + joueurs[tour].nom + " de jouer !";
  }

  // reset de la série de best-of-3 seulement si on démarre une nouvelle série
  if (mancheActuelle === 1) {
    historiqueManches = [];
  }
}

function generateGrid() {
  const div = document.getElementById("grille_jeu");
  div.innerHTML = "";

  const tailleInput = parseInt(document.getElementById("grille").value);
  taille = isNaN(tailleInput) || tailleInput < 3 ? 3 : tailleInput;

  div.style.display = "grid";
  div.style.overflow = "visible";

  // Taille max (plafond) pour l’affichage horizontal
  const TAILLE_PLATEAU_PX = 800;
  const cellSize = Math.floor(TAILLE_PLATEAU_PX / taille);

  div.style.gridTemplateColumns = `repeat(${taille}, ${cellSize}px)`;
  div.style.gridTemplateRows = `repeat(${taille}, ${cellSize}px)`;
  div.style.gap = "4px";

  for (let i = 0; i < taille * taille; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `case${i}`;
    cell.onclick = () => jouer(i);
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
    cell.style.fontSize = `${cellSize * 0.6}px`;
    div.appendChild(cell);
  }

  // centrage horizontal (pas vertical)
  div.parentElement.style.justifyContent = "center";
  div.parentElement.style.alignItems = "flex-start";
}




function noms_joueurs() {
  joueur1_nom = document.getElementById("j1")?.value || "Joueur 1";
  joueur2_nom = document.getElementById("j2")?.value || "Joueur 2";
  joueur3_nom = document.getElementById("j3")?.value || "Joueur 3";
  joueur4_nom = document.getElementById("j4")?.value || "Joueur 4";
  majScore();
}

function majScore() {
  const scoreDiv = document.getElementById("scoreboard");
  scoreDiv.innerHTML = "";
  joueurs.forEach(j => {
    const span = document.createElement("span");
    span.innerText = `${j.nom} (${j.symbole}) : ${scores[j.symbole] || 0}`;
    scoreDiv.appendChild(span);
  });
  localStorage.setItem("scores", JSON.stringify(scores));
}

function jouer(index) {
  if (statut_jeu !== 1 || grille[index]) return;

  const joueur = joueurs[tour];
  let symbole = joueur.symbole;

  if (variante === "sauvage") {
    // Crée une liste dynamique des symboles disponibles selon le nombre de joueurs
    const symbolesDisponibles = ["X", "O", "V", "D"].slice(0, nbJoueurs);
  
    // Propose tous les symboles disponibles
    const choix = prompt(
      `${joueur.nom}, choisis ton symbole parmi : ${symbolesDisponibles.join(", ")}`,
      symbolesDisponibles[0]
    );
  
    if (!choix || !symbolesDisponibles.includes(choix.toUpperCase())) {
      alert("Choix invalide !");
      return;
    }
  
    symbole = choix.toUpperCase();
  }
  

  // Variante "Mérelle" : on supprime l'ancien pion si le joueur en a déjà trop
  if (variante === "merelle" && joueur.pionsPoses.length >= maxPions) {
    const indexARetirer = joueur.pionsPoses.shift();
    grille[indexARetirer] = "";
    document.getElementById(`case${indexARetirer}`).innerText = "";
  }

  // on place le symbole
  grille[index] = symbole;
  document.getElementById(`case${index}`).innerText = symbole;
  joueur.pionsPoses.push(index);

  // on calcule victoire
  const victoire = verifierVictoire(symbole);

  if (victoire) {
    statut_jeu = 3;
  
    if (variante === "misere") {
      // En misère : celui qui aligne perd
      const perdant = joueur;
      document.getElementById("txt_joueur").innerText =
        `😈 ${perdant.nom} a perdu (il a aligné ses symboles) !`;
  
      // Tous les autres joueurs gagnent 1 point
      joueurs.forEach(j => {
        if (j.symbole !== perdant.symbole) {
          scores[j.symbole] = (scores[j.symbole] || 0) + 1;
        }
      });
  
      majScore();
      dernierGagnantSymbole = null; // aucun "vainqueur", mais les points sont attribués
    } else {
      // Victoire classique, sauvage, ou mérelle
      dernierGagnantSymbole = symbole;
      document.getElementById("txt_joueur").innerText =
        `🏆 Victoire de ${joueur.nom} !`;
    }
  
    finManche();
    return;
  }
  

  // égalité
  if (!grille.includes("")) {
    statut_jeu = 2;
    dernierGagnantSymbole = null; // égalité => pas de gagnant
    document.getElementById("txt_joueur").innerText = "Égalité !";
    finManche();
    return;
  }

  // sinon tour suivant
  tour = (tour + 1) % joueurs.length;

  if (mode === "pve" && joueurs.length === 2 && tour === 1) {
    setTimeout(ia_jouer, 400);
  } else {
    document.getElementById("txt_joueur").innerText =
      "À " + joueurs[tour].nom + " de jouer !";
  }
}

// === Vérifie victoire dynamique pour n’importe quelle taille ===
function verifierVictoire(symbole) {
  const lignes = [];
  for (let i = 0; i < taille; i++) {
    lignes.push(grille.slice(i * taille, (i + 1) * taille));
  }

  // lignes
  if (lignes.some(row => row.every(c => c === symbole))) return true;

  // colonnes
  for (let i = 0; i < taille; i++) {
    const col = lignes.map(row => row[i]);
    if (col.every(c => c === symbole)) return true;
  }

  // diagonale principale
  if (lignes.map((r, i) => r[i]).every(c => c === symbole)) return true;

  // diagonale secondaire
  if (lignes.map((r, i) => r[taille - 1 - i]).every(c => c === symbole)) return true;

  return false;
}

// === IA dynamique pour toute taille (stratégie simple + minimax 3x3) ===
function ia_jouer() {
  if (taille === 3) {
    const bestMove = minimax(grille, "O").index;
    jouer(bestMove);
  } else {
    const libres = grille
      .map((v, i) => (v === "" ? i : null))
      .filter(i => i !== null);
    const choix = libres[Math.floor(Math.random() * libres.length)];
    jouer(choix);
  }
}

function minimax(newBoard, player) {
  const availSpots = newBoard
    .map((v, i) => (v === "" ? i : null))
    .filter(v => v !== null);

  if (verifierVictoireIA(newBoard, "X")) return { score: -10 };
  if (verifierVictoireIA(newBoard, "O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    move.score =
      player === "O"
        ? minimax(newBoard, "X").score
        : minimax(newBoard, "O").score;

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

// utilisé uniquement par l'IA minimax classique 3x3
function verifierVictoireIA(b, s) {
  const combinaisons = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return combinaisons.some(c => c.every(i => b[i] === s));
}

// === FIN DE MANCHE : gestion du Best of 3 pour toutes les variantes ===
function finManche() {
  // --- 🧾 Gestion Best of 3 ---
  if (manchesTotales === 3) {

    // === 🟢 Enregistrement du résultat de la manche selon la variante ===
    if (variante === "misere") {
      // En misère : celui qui aligne perd → les autres gagnent la manche
      const perdant = joueurs.find(j => j.symbole === (dernierGagnantSymbole || joueurs[tour].symbole));
      const gagnants = joueurs.filter(j => j !== perdant);
      gagnants.forEach(g => {
        historiqueManches.push({ symbole: g.symbole, nom: g.nom + " (victoire par misère)" });
      });
    } 
    else if (dernierGagnantSymbole) {
      // Pour toutes les autres variantes, on ajoute le gagnant normal
      const gagnant = joueurs.find(j => j.symbole === dernierGagnantSymbole);
      historiqueManches.push({
        symbole: dernierGagnantSymbole,
        nom: gagnant ? gagnant.nom : "Inconnu"
      });
    } 
    else {
      // Égalité
      historiqueManches.push({ symbole: "🤝", nom: "Égalité" });
    }

    // === 🟡 Passage à la manche suivante ou fin du BO3 ===
    if (mancheActuelle < 3) {
      mancheActuelle++;
      document.getElementById("txt_joueur").innerText =
        `Manche ${mancheActuelle}/3... Préparez-vous !`;
      setTimeout(init, 1500);
      return;
    }

    // === 🔴 Fin du Best of 3 ===
    else {
      // On compte les victoires (chaque symbole)
      let compteur = {};
      for (const manche of historiqueManches) {
        if (manche.symbole && manche.symbole !== "🤝") {
          compteur[manche.symbole] = (compteur[manche.symbole] || 0) + 1;
        }
      }

      // Trouver le symbole majoritaire
      let gagnantGlobalSymbole = null;
      let max = 0;
      for (const s in compteur) {
        if (compteur[s] > max) {
          max = compteur[s];
          gagnantGlobalSymbole = s;
        }
      }

      // === 🏆 Attribution du point global (1 point pour le vainqueur final) ===
      if (gagnantGlobalSymbole) {
        const joueurGagnant = joueurs.find(j => j.symbole === gagnantGlobalSymbole);
        const nomGagnant = joueurGagnant ? joueurGagnant.nom : "Inconnu";
        scores[gagnantGlobalSymbole] = (scores[gagnantGlobalSymbole] || 0) + 1;

        document.getElementById("txt_joueur").innerHTML =
          `🏆 <strong>${nomGagnant}</strong> remporte le <strong>Best of 3 (${variante})</strong> !<br><br>` +
          creerRecapitulatifManches();
      } else {
        document.getElementById("txt_joueur").innerHTML =
          `🤝 Aucune victoire décisive dans ce Best of 3 (${variante}).<br><br>` +
          creerRecapitulatifManches();
      }

      // Mise à jour du score + reset pour nouvelle série
      majScore();
      mancheActuelle = 1;
      historiqueManches = [];
      dernierGagnantSymbole = null;

      setTimeout(init, 4000);
      return;
    }
  }

  // --- 🎯 MODE 1 MANCHE ---
  if (manchesTotales === 1) {
    if (variante === "misere") {
      // En misère : le perdant ne marque pas, les autres oui
      const perdant = joueurs.find(j => j.symbole === (dernierGagnantSymbole || joueurs[tour].symbole));
      const gagnants = joueurs.filter(j => j !== perdant);
      gagnants.forEach(g => {
        scores[g.symbole] = (scores[g.symbole] || 0) + 1;
      });
    } else if (dernierGagnantSymbole) {
      scores[dernierGagnantSymbole] = (scores[dernierGagnantSymbole] || 0) + 1;
    }

    majScore();
    mancheActuelle = 1;
    historiqueManches = [];
    dernierGagnantSymbole = null;
    setTimeout(init, 2000);
    return;
  }
}

// === Crée un texte HTML récapitulatif du Best of 3 ===
function creerRecapitulatifManches() {
  let recap = "<u>Récapitulatif des manches :</u><br>";
  historiqueManches.forEach((m, i) => {
    recap += `Manche ${i + 1}: ${m.nom} (${m.symbole})<br>`;
  });
  return recap;
}


// === Recharger la page complètement et tout réinitialiser ===
function rechargerPage() {
  localStorage.removeItem("scores");
  scores = { X: 0, O: 0, V: 0, D: 0 };
  mancheActuelle = 1;
  historiqueManches = [];
  dernierGagnantSymbole = null;

  ["j1", "j2", "j3", "j4"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });

  joueur1_nom = "Joueur 1";
  joueur2_nom = "Joueur 2";
  joueur3_nom = "Joueur 3";
  joueur4_nom = "Joueur 4";

  document.getElementById("txt_joueur").innerText = "À Joueur 1 de jouer !";

  window.location.reload();
}
