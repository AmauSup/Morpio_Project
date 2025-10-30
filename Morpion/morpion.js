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
let historiqueManches = [];
let dernierGagnantSymbole = null;

window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("scores"));
  if (saved) scores = saved;
  majScore();
};

function init() {
  taille = parseInt(document.getElementById("grille").value);
  mode = document.getElementById("mode").value;
  manchesTotales = parseInt(document.getElementById("manches").value);
  variante = document.getElementById("variante").value;
  nbJoueurs = parseInt(document.getElementById("nb_joueurs").value);
  statut_jeu = 1;
  grille = Array(taille * taille).fill("");
  generateGrid();
  const symboles = ["X", "O", "V", "D", "🤖"];
  joueurs = [];
  for (let i = 1; i <= nbJoueurs; i++) {
    const nomInput = document.getElementById("j" + i);
    const nom = nomInput ? nomInput.value || "Joueur " + i : "Joueur " + i;
    joueurs.push({ nom, symbole: symboles[i - 1], pionsPoses: [] });
  }
  if (mode === "pve") {
    joueurs.push({ nom: "Ordi", symbole: "🤖", pionsPoses: [] });
  }
  maxPions = taille;
  tour = Math.floor(Math.random() * joueurs.length);
  dernierGagnantSymbole = null;
  majScore();
  if (mode === "pve" && joueurs[tour].symbole === "🤖") {
    document.getElementById("txt_joueur").innerText = "L'ordinateur commence 🤖";
    setTimeout(ia_jouer, 700);
  } else {
    document.getElementById("txt_joueur").innerText = "À " + joueurs[tour].nom + " de jouer !";
  }
  if (mancheActuelle === 1) historiqueManches = [];
}

function generateGrid() {
  const div = document.getElementById("grille_jeu");
  div.innerHTML = "";
  const tailleInput = parseInt(document.getElementById("grille").value);
  taille = isNaN(tailleInput) || tailleInput < 3 ? 3 : tailleInput;
  div.style.display = "grid";
  div.style.overflow = "visible";
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
    const symbolesDisponibles = joueurs.map(j => j.symbole);
    const choix = prompt(`${joueur.nom}, choisis ton symbole parmi : ${symbolesDisponibles.join(", ")}`, symbolesDisponibles[0]);
    if (!choix || !symbolesDisponibles.includes(choix.toUpperCase())) {
      alert("Choix invalide !");
      return;
    }
    symbole = choix.toUpperCase();
  }
  if (variante === "merelle" && joueur.pionsPoses.length >= maxPions) {
    const indexARetirer = joueur.pionsPoses.shift();
    grille[indexARetirer] = "";
    document.getElementById(`case${indexARetirer}`).innerText = "";
  }
  grille[index] = symbole;
  document.getElementById(`case${index}`).innerText = symbole;
  joueur.pionsPoses.push(index);
  const victoire = verifierVictoire(symbole);
  if (victoire) {
    statut_jeu = 3;
    if (variante === "sauvage") {
      dernierGagnantSymbole = joueur.symbole;
      document.getElementById("txt_joueur").innerText = `🔥 ${joueur.nom} complète une ligne ! Il remporte la manche !`;
    } else {
      dernierGagnantSymbole = symbole;
      document.getElementById("txt_joueur").innerText = `🏆 Victoire de ${joueur.nom} (${symbole}) !`;
    }
    finManche();
    return;
  }
  if (!grille.includes("")) {
    statut_jeu = 2;
    document.getElementById("txt_joueur").innerText = "Égalité !";
    finManche();
    return;
  }
  tour = (tour + 1) % joueurs.length;
  const suivant = joueurs[tour];
  if (mode === "pve" && suivant.symbole === "🤖") {
    setTimeout(ia_jouer, 400);
  } else {
    document.getElementById("txt_joueur").innerText = `À ${suivant.nom} de jouer !`;
  }
}

function verifierVictoire(symbole) {
  const lignes = [];
  for (let i = 0; i < taille; i++) {
    lignes.push(grille.slice(i * taille, (i + 1) * taille));
  }
  if (variante !== "sauvage") {
    if (lignes.some(row => row.every(c => c === symbole))) return true;
    for (let i = 0; i < taille; i++) {
      const col = lignes.map(row => row[i]);
      if (col.every(c => c === symbole)) return true;
    }
    if (lignes.map((r, i) => r[i]).every(c => c === symbole)) return true;
    if (lignes.map((r, i) => r[taille - 1 - i]).every(c => c === symbole)) return true;
    return false;
  }
  const estLignePleine = arr => arr.every(c => c !== "");
  const estColonnePleine = i => lignes.every(row => row[i] !== "");
  if (lignes.some(row => estLignePleine(row))) return true;
  for (let i = 0; i < taille; i++) {
    if (estColonnePleine(i)) return true;
  }
  if (lignes.map((r, i) => r[i]).every(c => c !== "")) return true;
  if (lignes.map((r, i) => r[taille - 1 - i]).every(c => c !== "")) return true;
  return false;
}

function ia_jouer() {
  const libres = grille.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);
  if (libres.length === 0) return;
  let choix;
  let symboleIA = "🤖";
  if (variante === "sauvage") {
    const symbolesPossibles = joueurs.map(j => j.symbole).filter(s => s !== "🤖");
    symboleIA = ia_choisirSymboleOptimal(symbolesPossibles);
  }
  if (taille === 3) {
    choix = minimax(grille.slice(), symboleIA).index;
  } else if (taille <= 5) {
    choix = ia_heuristique_sauvage(symboleIA);
  } else {
    choix = ia_simple();
  }
  if (choix === undefined || choix === null) {
    const libres = grille.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);
    choix = libres[Math.floor(Math.random() * libres.length)];
  }
  grille[choix] = symboleIA;
  document.getElementById(`case${choix}`).innerText = symboleIA;
  const victoire = verifierVictoire(symboleIA);
  if (victoire) {
    statut_jeu = 3;
    dernierGagnantSymbole = symboleIA;
    document.getElementById("txt_joueur").innerText = `🏆 Victoire de l'ordinateur 🤖 !`;
    finManche();
    return;
  }
  if (!grille.includes("")) {
    statut_jeu = 2;
    document.getElementById("txt_joueur").innerText = "Égalité !";
    finManche();
    return;
  }
  tour = (tour + 1) % joueurs.length;
  document.getElementById("txt_joueur").innerText = `À ${joueurs[tour].nom} de jouer !`;
}

function ia_choisirSymboleOptimal(symbolesDisponibles) {
  let meilleurSymbole = symbolesDisponibles[0];
  let meilleurScore = -Infinity;
  for (const sym of symbolesDisponibles) {
    let score = 0;
    for (let i = 0; i < grille.length; i++) {
      if (grille[i] === "") {
        grille[i] = sym;
        if (verifierVictoire(sym)) {
          score += 10;
        } else {
          const nbOcc = grille.filter(c => c === sym).length;
          score += nbOcc;
        }
        grille[i] = "";
      }
    }
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleurSymbole = sym;
    }
  }
  console.log(`🤖 L'IA a choisi le symbole ${meilleurSymbole} (score ${meilleurScore})`);
  return meilleurSymbole;
}

function ia_heuristique_sauvage(symboleIA) {
  const adversaires = joueurs.filter(j => j.symbole !== symboleIA && j.symbole !== "🤖").map(j => j.symbole);
  let meilleurScore = -Infinity;
  let meilleurIndex = null;
  for (let i = 0; i < grille.length; i++) {
    if (grille[i] !== "") continue;
    grille[i] = symboleIA;
    if (verifierVictoire(symboleIA)) {
      grille[i] = "";
      return i;
    }
    grille[i] = "";
    for (const adv of adversaires) {
      grille[i] = adv;
      if (verifierVictoire(adv)) {
        grille[i] = "";
        return i;
      }
      grille[i] = "";
    }
    const score = ia_evaluerPosition(i, symboleIA);
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleurIndex = i;
    }
  }
  return meilleurIndex;
}

function ia_heuristique() {
  const ordiSym = "🤖";
  const adversaires = joueurs.filter(j => j.symbole !== ordiSym).map(j => j.symbole);
  let meilleurScore = -Infinity;
  let meilleurIndex = null;
  for (let i = 0; i < grille.length; i++) {
    if (grille[i] !== "") continue;
    grille[i] = ordiSym;
    if (verifierVictoire(ordiSym)) {
      grille[i] = "";
      return i;
    }
    grille[i] = "";
    for (const adv of adversaires) {
      grille[i] = adv;
      if (verifierVictoire(adv)) {
        grille[i] = "";
        return i;
      }
      grille[i] = "";
    }
    const score = ia_evaluerPosition(i, ordiSym);
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleurIndex = i;
    }
  }
  return meilleurIndex;
}

function ia_simple() {
  const ordiSym = "🤖";
  const adversaires = joueurs.filter(j => j.symbole !== ordiSym).map(j => j.symbole);
  const lignesPossibles = [];
  for (let i = 0; i < grille.length; i++) {
    if (grille[i] !== "") continue;
    let score = 0;
    const voisins = ia_voisins(i);
    for (const v of voisins) {
      if (grille[v] === ordiSym) score += 2;
      if (adversaires.includes(grille[v])) score += 1;
    }
    lignesPossibles.push({ index: i, score });
  }
  lignesPossibles.sort((a, b) => b.score - a.score);
  return lignesPossibles.length > 0 ? lignesPossibles[0].index : null;
}

function ia_evaluerPosition(i, symbole) {
  let score = 0;
  const row = Math.floor(i / taille);
  const col = i % taille;
  const centre = Math.floor(taille / 2);
  const distanceCentre = Math.abs(row - centre) + Math.abs(col - centre);
  score += (taille - distanceCentre);
  const voisins = ia_voisins(i);
  voisins.forEach(v => {
    if (grille[v] === symbole) score += 3;
  });
  return score;
}

function ia_voisins(index) {
  const voisins = [];
  const row = Math.floor(index / taille);
  const col = index % taille;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < taille && nc >= 0 && nc < taille) {
        voisins.push(nr * taille + nc);
      }
    }
  }
  return voisins;
}

function minimax(board, joueurActuel) {
  const ordiSym = "🤖";
  const humainSym = joueurs.find(j => j.symbole !== "🤖")?.symbole || "X";
  const libres = board.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);
  if (verifierVictoireIA(board, humainSym)) return { score: -10 };
  if (verifierVictoireIA(board, ordiSym)) return { score: 10 };
  if (libres.length === 0) return { score: 0 };
  const coups = [];
  for (const i of libres) {
    const move = { index: i };
    board[i] = joueurActuel;
    if (joueurActuel === ordiSym) {
      move.score = minimax(board, humainSym).score;
    } else {
      move.score = minimax(board, ordiSym).score;
    }
    board[i] = "";
    coups.push(move);
  }
  if (joueurActuel === ordiSym) {
    let bestScore = -Infinity, bestMove;
    coups.forEach((c, idx) => {
      if (c.score > bestScore) {
        bestScore = c.score;
        bestMove = idx;
      }
    });
    return coups[bestMove];
  } else {
    let bestScore = Infinity, bestMove;
    coups.forEach((c, idx) => {
      if (c.score < bestScore) {
        bestScore = c.score;
        bestMove = idx;
      }
    });
    return coups[bestMove];
  }
}

function verifierVictoireIA(b, s) {
  const combinaisons = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return combinaisons.some(c => c.every(i => b[i] === s));
}

function finManche() {
  if (manchesTotales === 3) {
    if (variante === "misere") {
      const perdant = joueurs.find(j => j.symbole === (dernierGagnantSymbole || joueurs[tour].symbole));
      const gagnants = joueurs.filter(j => j !== perdant);
      gagnants.forEach(g => {
        historiqueManches.push({ symbole: g.symbole, nom: g.nom + " (victoire par misère)" });
      });
    } else if (dernierGagnantSymbole) {
      const gagnant = joueurs.find(j => j.symbole === dernierGagnantSymbole);
      historiqueManches.push({ symbole: dernierGagnantSymbole, nom: gagnant ? gagnant.nom : "Inconnu" });
    } else {
      historiqueManches.push({ symbole: "🤝", nom: "Égalité" });
    }
    if (mancheActuelle < 3) {
      mancheActuelle++;
      document.getElementById("txt_joueur").innerText = `Manche ${mancheActuelle}/3... Préparez-vous !`;
      setTimeout(init, 1500);
      return;
    } else {
      let compteur = {};
      for (const manche of historiqueManches) {
        if (manche.symbole && manche.symbole !== "🤝") {
          compteur[manche.symbole] = (compteur[manche.symbole] || 0) + 1;
        }
      }
      let gagnantGlobalSymbole = null;
      let max = 0;
      for (const s in compteur) {
        if (compteur[s] > max) {
          max = compteur[s];
          gagnantGlobalSymbole = s;
        }
      }
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
      majScore();
      mancheActuelle = 1;
      historiqueManches = [];
      dernierGagnantSymbole = null;
      setTimeout(init, 4000);
      return;
    }
  }
  if (manchesTotales === 1) {
    if (variante === "misere") {
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

function creerRecapitulatifManches() {
  let recap = "<u>Récapitulatif des manches :</u><br>";
  historiqueManches.forEach((m, i) => {
    recap += `Manche ${i + 1}: ${m.nom} (${m.symbole})<br>`;
  });
  return recap;
}

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
