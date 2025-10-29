// Sélecteurs
const formSection = document.getElementById("formulaire");
const formJoueurs = document.getElementById("formJoueurs");
const jeuSection = document.getElementById("jeu");
const grille = document.getElementById("grille");
const cases = [...document.querySelectorAll(".case")];

const affX = document.getElementById("affX");
const affO = document.getElementById("affO");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");

const tourEl = document.getElementById("tour");
const message = document.getElementById("message");
const btnRound = document.getElementById("btnRound");
const btnReset = document.getElementById("btnReset");
const btnNouveaux = document.getElementById("btnNouveaux");

// État du jeu
let joueurs = {
  X: { nom: "", score: 0 },
  O: { nom: "", score: 0 }
};
let joueur = "X";
let board = Array(9).fill("");
let partieEnCours = false;

// Combinaisons gagnantes
const lignes = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// --- Fonctions ---
function majScoreboard() {
  affX.textContent = joueurs.X.nom;
  affO.textContent = joueurs.O.nom;
  scoreXEl.textContent = joueurs.X.score;
  scoreOEl.textContent = joueurs.O.score;
}

function majTour() {
  tourEl.textContent = partieEnCours
    ? `Au tour de ${joueurs[joueur].nom} (${joueur})`
    : "";
}

function viderGrille() {
  board = Array(9).fill("");
  cases.forEach(c => (c.textContent = ""));
  message.textContent = "";
  joueur = "X";
  partieEnCours = true;
  majTour();
}

function aGagne(sym) {
  return lignes.some(l =>
    board[l[0]] === sym &&
    board[l[1]] === sym &&
    board[l[2]] === sym
  );
}

function estNul() {
  return board.every(c => c !== "");
}

// --- Jeu principal ---
cases.forEach(c => {
  c.addEventListener("click", () => {
    if (!partieEnCours) return;
    const i = Number(c.dataset.i);
    if (board[i] !== "") return;

    board[i] = joueur;
    c.textContent = joueur;

    if (aGagne(joueur)) {
      joueurs[joueur].score++;
      majScoreboard();
      message.textContent = `${joueurs[joueur].nom} a gagné !`;
      partieEnCours = false;
      return;
    }

    if (estNul()) {
      message.textContent = "Match nul !";
      partieEnCours = false;
      return;
    }

    joueur = joueur === "X" ? "O" : "X";
    majTour();
  });
});

// --- Formulaire ---
formJoueurs.addEventListener("submit", (e) => {
  e.preventDefault();
  const nomX = document.getElementById("nomX").value.trim();
  const nomO = document.getElementById("nomO").value.trim();

  if (!nomX || !nomO) {
    alert("Merci d’entrer les deux noms !");
    return;
  }

  joueurs.X.nom = nomX;
  joueurs.O.nom = nomO;

  majScoreboard();
  viderGrille();

  formSection.classList.add("hidden");
  jeuSection.classList.remove("hidden");
});

// --- Boutons du jeu ---
btnRound.addEventListener("click", viderGrille);

btnReset.addEventListener("click", () => {
  joueurs.X.score = 0;
  joueurs.O.score = 0;
  majScoreboard();
  viderGrille();
});

btnNouveaux.addEventListener("click", () => {
  formSection.classList.remove("hidden");
  jeuSection.classList.add("hidden");
  joueurs.X.score = 0;
  joueurs.O.score = 0;
  document.getElementById("nomX").value = "";
  document.getElementById("nomO").value = "";
});
