const cells = document.querySelectorAll('.cell')

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
    alert(message)
    gameIsPlayable = false
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

    combs.some(comb => {
        const[a,b,c] = comb
        return board[a] && board[a] == board[b] && board[a] == board[c]
    })
}

function initGame(){
    cells.forEach(cell => cell.addEventListener('click', handleClick ))
}

initGame()