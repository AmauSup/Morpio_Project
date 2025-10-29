const cases = document.querySelectorAll(".grille div");
const message = document.getElementById("message");

let joueur = "X";

cases.forEach(c => {
  c.addEventListener("click", () => {
    if (c.textContent === "") {
      c.textContent = joueur;
      if (verifierGagnant()) {
        message.textContent = `Le joueur ${joueur} a gagné !`;
        cases.forEach(c => c.style.pointerEvents = "none");
      } else {
        joueur = joueur === "X" ? "O" : "X";
      }
    }
  });
});

function verifierGagnant() {
  const lignes = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return lignes.some(l => 
    cases[l[0]].textContent &&
    cases[l[0]].textContent === cases[l[1]].textContent &&
    cases[l[1]].textContent === cases[l[2]].textContent
  );
}
