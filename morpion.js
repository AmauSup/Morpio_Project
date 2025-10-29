let tour = 0 
let joueur1_nom = "Joueur 1"
let joueur2_nom = "Joueur 2"
let statut_jeu = 0
function init() {
 

    tour = 0
    document.getElementById("txt_joueur").innerHTML = "A " + joueur1_nom + " de jouer !";
    document.getElementById("bouton_jouer").innerHTML = "Recommencer";

    for (let i = 1; i < 10; i++) {
        document.getElementById("case" + i).innerHTML = ""; 
        document.getElementById("case" + i).style.color = "#FFFFFF"
    }

    statut_jeu = 1;
}



function Case(number) {

  

    let boutton = document.getElementById("case" + number);
    if (statut_jeu === 0) {
        null
    } else if (statut_jeu === 1) {

    if (boutton.innerText !== "X") {
        if (boutton.innerText !== "O") {
            if (tour === 0) {
            boutton.innerHTML = "X";
            document.getElementById("txt_joueur").innerHTML = "A " + joueur2_nom + " de jouer !";
            tour = 1;
            fin_jeu();
                } 
            else if (tour === 1) {
            boutton.innerHTML = "O";
            document.getElementById("txt_joueur").innerHTML = "A " + joueur1_nom + " de jouer !";
            tour = 0;
            fin_jeu();
                }
            }
        }
    }
}

function fin_jeu() {

   
    const jeu = [] 
    for (let i = 1; i < 10; i++) {
        jeu.push(document.getElementById("case" + i).innerText)
    }

    console.log(jeu);
    egalite(jeu);
        
    if 
    (jeu[0] == "X" && jeu[1] == "X" && jeu[2] == "X") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur1_nom + " !" 
    } 
    else if  (jeu[0] == "O" && jeu[1] == "O" && jeu[2] == "O")
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur2_nom + " !" 
    } 

    else if (jeu[3] == "X" && jeu[4] == "X" && jeu[5] == "X") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur1_nom + " !" 
    
    }  
    else if  (jeu[3] == "O" && jeu[4] == "O" && jeu[5] == "O") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur2_nom + " !" 
    
    }   

    else if (jeu[6] == "X" && jeu[7] == "X" && jeu[8] == "X") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur1_nom + " !" 
    
    }     
    else if (jeu[6] == "O" && jeu[7] == "O" && jeu[8] == "O")
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur2_nom + " !" 
    
    }     
    else if (jeu[1] == "X" && jeu[4] == "X" && jeu[7] == "X") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur1_nom + " !" 
    
    }    
    else if (jeu[1] == "O" && jeu[4] == "O" && jeu[7] == "O") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur2_nom + " !" 
    
    }   
    else if (jeu[0] == "X" && jeu[3] == "X" && jeu[6] == "X")
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur1_nom + " !" 
    
    }  
    else if (jeu[0] == "O" && jeu[3] == "O" && jeu[6] == "O") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur2_nom + " !" 
    
    }  
    else if (jeu[2] == "X" && jeu[5] == "X" && jeu[8] == "X") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur1_nom + " !" 
    }   
    else if (jeu[2] == "O" && jeu[5] == "O" && jeu[8] == "O") 
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur2_nom + " !" 
    }   
    else if (jeu[0] == "X" && jeu[4] == "X" && jeu[8] == "X")
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur1_nom + " !" 
    
    }    
    else if (jeu[0] == "O" && jeu[4] == "O" && jeu[8] == "O")
    {
        statut_jeu = 3;
        console.log(statut_jeu);
        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur2_nom + " !" 
    
    }  
    else if (jeu[2] == "X" && jeu[4] == "X" && jeu[6] == "X")
    {
        statut_jeu = 3;
        console.log(statut_jeu);

        document.getElementById("txt_joueur").innerHTML = "Victoire de " + joueur1_nom + " !" 
    }   
    else if (jeu[2] == "O" && jeu[4] == "O" && jeu[6] == "O")
    {
        statut_jeu = 3;
        console.log(statut_jeu);

        document.getElementById("txt_joueur").innerHTML = "Victoire de "  + joueur2_nom + " !" 
    }   

    if (statut_jeu === 3) { 
        for (let i = 1; i < 10; i++) {
            if (document.getElementById("case" + i).innerText === "X") {
            document.getElementById("case" + i).style.color = "#11998e";
            document.getElementById("case" + i).style.borderColor = "#FFFFFF"; 
            }
            else if (document.getElementById("case" + i).innerText === "O") {
                document.getElementById("case" + i).style.color = "#38ef7d";
                document.getElementById("case" + i).style.borderColor = "#FFFFFF"
            }
        }        
    }
}



function egalite(jeu) {


    if (!jeu.includes('')) {
    document.getElementById("txt_joueur").innerHTML = "Egalité";
    statut_jeu = 2;
    }
}



function noms_joueurs() {

 

    joueur1_nom = document.getElementById("j1").value;
    if (document.getElementById("j1").value === "") { 
        joueur1_nom = "Joueur 1"
    }

    joueur2_nom = document.getElementById("j2").value;
    if (document.getElementById("j2").value === "") { 
        joueur2_nom = "Joueur 2"
    }
}
