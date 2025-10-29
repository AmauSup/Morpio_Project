let joueur1_nom = "Joueur 1";
let joueur2_nom = "Joueur 2";
let tour = 0;
let statut_jeu = 0;
let taille = 3;
let grille = [];
let scores = { X: 0, O: 0 };
let mode = "pvp";
let manchesTotales = 1;
let mancheActuelle = 1;
let victoiresManche = { X: 0, O: 0 };

// Charger les scores depuis localStorage
window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("scores"));
  if (saved) scores = saved;
  majScore();
};

// === Initialisation du jeu ===
function init() {
    taille = parseInt(document.getElementById("grille").value);
    mode = document.getElementById("mode").value;
    manchesTotales = parseInt(document.getElementById("manches").value);
    statut_jeu = 1;
    grille = Array(taille * taille).fill("");
    generateGrid();
  
    // 🎲 Tirage au sort du joueur qui commence (0 = X / 1 = O)
    tour = Math.floor(Math.random() * 2);
  
    // Si mode PvE, et que l’ordi doit commencer
    if (mode === "pve" && tour === 1) {
      document.getElementById("txt_joueur").innerText = "L'ordinateur commence 🤖";
      // petit délai pour le réalisme avant que l’ordi joue
      setTimeout(ia_jouer, 700);
    } else {
      document.getElementById("txt_joueur").innerText =
        "À " + (tour === 0 ? joueur1_nom : joueur2_nom) + " de jouer !";
    }
  }
  

// === Génération de la grille ===
function generateGrid() {
  const div = document.getElementById("grille_jeu");
  div.innerHTML = "";
  div.style.display = "grid";
  div.style.gridTemplateColumns = `repeat(${taille}, 100px)`;
  div.style.gridTemplateRows = `repeat(${taille}, 100px)`;
  div.style.gap = "5px";

  for (let i = 0; i < taille * taille; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `case${i}`;
    cell.onclick = () => jouer(i);
    div.appendChild(cell);
  }
}

function noms_joueurs() {
  joueur1_nom = document.getElementById("j1").value || "Joueur 1";
  joueur2_nom = document.getElementById("j2").value || "Joueur 2";
  majScore();
}

function majScore() {
  document.getElementById("scoreX").innerText = `${joueur1_nom} : ${scores["X"]}`;
  document.getElementById("scoreO").innerText = `${joueur2_nom} : ${scores["O"]}`;
  localStorage.setItem("scores", JSON.stringify(scores));
}

function jouer(index) {
    if (statut_jeu !== 1 || grille[index]) return;
  
    const symbole = tour === 0 ? "X" : "O";
    grille[index] = symbole;
    document.getElementById(`case${index}`).innerText = symbole;
  
    if (verifierVictoire(symbole)) {
      statut_jeu = 3;
      victoiresManche[symbole]++;
  
      // ✅ Détermine le bon nom du gagnant
      let gagnantNom = "";
      if (mode === "pve") {
        // En PvE : X = Joueur, O = Ordinateur
        gagnantNom = symbole === "X" ? joueur1_nom : "Ordinateur";
      } else {
        // En PvP : X = Joueur 1, O = Joueur 2
        gagnantNom = symbole === "X" ? joueur1_nom : joueur2_nom;
      }
  
      document.getElementById("txt_joueur").innerText = `🏆 Victoire de ${gagnantNom} !`;
  
      finManche(symbole);
      return;
    }
  
    if (!grille.includes("")) {
      document.getElementById("txt_joueur").innerText = "Égalité !";
      statut_jeu = 2;
      finManche(symbole);
      return;
    }
  
    tour = 1 - tour;
  
    if (mode === "pve" && tour === 1) {
      setTimeout(ia_jouer, 300);
    } else {
      const prochainNom =
        (mode === "pve" && tour === 1) ? "Ordinateur" :
        (tour === 0 ? joueur1_nom : joueur2_nom);
      document.getElementById("txt_joueur").innerText = "À " + prochainNom + " de jouer !";
    }
  }
  

// === Vérifie victoire dynamique pour n’importe quelle taille ===
function verifierVictoire(symbole) {
  const lignes = [];
  for (let i = 0; i < taille; i++) lignes.push(grille.slice(i * taille, (i + 1) * taille));

  for (let i = 0; i < taille; i++) {
    const col = lignes.map(row => row[i]);
    if (col.every(c => c === symbole)) return true;
  }

  if (lignes.some(row => row.every(c => c === symbole))) return true;
  if (lignes.map((r, i) => r[i]).every(c => c === symbole)) return true;
  if (lignes.map((r, i) => r[taille - 1 - i]).every(c => c === symbole)) return true;
  return false;
}

// === IA dynamique pour toute taille (stratégie simple + minimax 3x3) ===
function ia_jouer() {
  if (taille === 3) {
    const bestMove = minimax(grille, "O").index;
    jouer(bestMove);
  } else {
    // IA simplifiée pour 4x4 et 5x5 (choix aléatoire d’une case libre)
    const libres = grille.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);
    const choix = libres[Math.floor(Math.random() * libres.length)];
    jouer(choix);
  }
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);

  if (verifierVictoireIA(newBoard, "X")) return { score: -10 };
  if (verifierVictoireIA(newBoard, "O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    move.score = (player === "O") ? minimax(newBoard, "X").score : minimax(newBoard, "O").score;

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

function verifierVictoireIA(b, s) {
  const combinaisons = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return combinaisons.some(c => c.every(i => b[i] === s));
}

// === Gestion du mode "Best of 3" + comptage correct des points ===
function finManche(symboleGagnant = null) {
    let gagnant = "";
  
    // Si c'était une seule manche (hors best of 3)
    if (manchesTotales === 1) {
      if (statut_jeu === 3 && symboleGagnant) {
        gagnant = symboleGagnant;
      }
    } else {
      // Mode Best of 3
      if (mancheActuelle < manchesTotales) {
        mancheActuelle++;
        setTimeout(init, 1000);
        return;
      } else {
        if (victoiresManche.X > victoiresManche.O) gagnant = "X";
        else if (victoiresManche.O > victoiresManche.X) gagnant = "O";
      }
    }
  
    if (gagnant) {
      scores[gagnant]++;
  
      // 🧠 Détermine quel nom afficher selon le mode et le symbole
      let gagnantNom = "";
      if (mode === "pve") {
        gagnantNom = gagnant === "X" ? joueur1_nom : "Ordinateur";
      } else {
        gagnantNom = gagnant === "X" ? joueur1_nom : joueur2_nom;
      }
  
      document.getElementById("txt_joueur").innerText =
        `🏆 ${gagnantNom} remporte ${manchesTotales === 3 ? "le Best of 3" : "la manche"} !`;
    } else if (statut_jeu === 2) {
      document.getElementById("txt_joueur").innerText = "Égalité parfaite 🤝";
    }
  
    majScore();
  
    // Reset pour la suite
    victoiresManche = { X: 0, O: 0 };
    mancheActuelle = 1;
  
    // Nouvelle manche après un délai
    setTimeout(init, 2000);
  }
  
  

// === Recharger la page complètement et tout réinitialiser ===
function rechargerPage() {
    // Efface les scores sauvegardés
    localStorage.removeItem("scores");
  
    // Réinitialise les variables
    scores = { X: 0, O: 0 };
    victoiresManche = { X: 0, O: 0 };
    mancheActuelle = 1;
  
    // Vide les zones de texte des pseudos
    const inputJ1 = document.getElementById("j1");
    const inputJ2 = document.getElementById("j2");
    if (inputJ1) inputJ1.value = "";
    if (inputJ2) inputJ2.value = "";
  
    // Remet les noms par défaut
    joueur1_nom = "Joueur 1";
    joueur2_nom = "Joueur 2";
  
    // Met à jour le texte du titre
    document.getElementById("txt_joueur").innerText = "À Joueur 1 de jouer !";
  
    // Recharge complètement la page
    window.location.reload();
  }
  
  
