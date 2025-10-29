// Morpion très basique – logique courte et simple

const cells = document.querySelectorAll(".cell");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");

// Plateau (9 cases) vide au départ
let board = ["", "", "", "", "", "", "", "", ""];
// Joueur courant
let current = "X";
// True si la partie est terminée
let gameOver = false;

// Combinaisons gagnantes (indices des cases)
const wins = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
  [0, 4, 8], [2, 4, 6]             // diagonales
];

// Au clic sur une case
cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const i = Number(cell.dataset.index);
    // Si case déjà jouée ou partie finie, on ignore
    if (board[i] !== "" || gameOver) return;

    // On place le symbole
    board[i] = current;
    cell.textContent = current;
    cell.disabled = true;

    // On vérifie victoire ou nul
    if (checkWin(current)) {
      statusEl.textContent = `Victoire : ${current} !`;
      gameOver = true;
      disableAll();
    } else if (board.every((v) => v !== "")) {
      statusEl.textContent = "Match nul 😶";
      gameOver = true;
    } else {
      // On change de joueur
      current = current === "X" ? "O" : "X";
      statusEl.textContent = `Tour : ${current}`;
    }
  });
});

// Vérifie si le joueur p a gagné
function checkWin(p) {
  return wins.some(([a, b, c]) => board[a] === p && board[b] === p && board[c] === p);
}

// Désactive toutes les cases (après victoire)
function disableAll() {
  cells.forEach((c) => (c.disabled = true));
}

// Bouton "Recommencer"
resetBtn.addEventListener("click", () => {
  board = ["", "", "", "", "", "", "", "", ""];
  current = "X";
  gameOver = false;
  statusEl.textContent = "Tour : X";
  cells.forEach((c) => {
    c.textContent = "";
    c.disabled = false;
  });
});
