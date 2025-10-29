const cells = document.querySelectorAll('.cell')
const overlay = document.querySelector('.overlay')

let board = Array(9).fill("")
let gameIsPlayable = true 
let currentPlayer = "X"

function handleClick(event){
    const index = event.target.dataset.index
    if(board[index] !== "" || !gameIsPlayable) return
    board[index] = currentPlayer
    event.target.textContent = currentPlayer

    if(CheckForWin()){
        showResult('Le joueur ${currentPlayer} a gagné')
    }
    else if(!board.includes("")){
        showResult("Match nul")
    }
    else currentPlayer = currentPlayer == "X" ? "O" : "X"
}

function showResult(message){
    overlay.style.display = "flex"
    overlay.querySelector('h1').textContent = message
    gameIsPlayable = false
}

function resetGame(){
    overlay.style.display = "none"
    board = Array(9).fill("")
    gameIsPlayable = true
    cells.forEach(cells => cells.textContent = "")
}

function CheckForWin(){
    const combs = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6],
    ]

   return combs.some(comb => {
        const[a,b,c] = comb
        return board[a] && board[a] == board[b] && board[a] == board[c]
    })
}

function initGame(){
    cells.forEach(cell => cell.addEventListener('click', handleClick ))
    overlay.querySelector('button').addEventListener('click', resetGame)
}

initGame()