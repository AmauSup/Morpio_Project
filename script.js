const cells = Array.from(document.querySelectorAll('.cell'));
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const overlayBtn = document.getElementById('overlayBtn');

const inputX = document.getElementById('playerX');
const inputO = document.getElementById('playerO');
const startBtn = document.getElementById('startBtn');
const modeSelect = document.getElementById('mode');
const themeToggle = document.getElementById('themeToggle');

const turnLabel = document.getElementById('turnLabel');
const resetRoundBtn = document.getElementById('resetRound');
const resetAllBtn = document.getElementById('resetAll');

const nameX = document.getElementById('nameX');
const nameO = document.getElementById('nameO');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreDraw = document.getElementById('scoreDraw');

let board = Array(9).fill('');
let current = 'X';
let playing = false;
let scores = { X: 0, O: 0, D: 0 };
let mode = 'human'; 
let lastWinLine = null;

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let audioCtx;
function beep(type='move'){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = type === 'win' ? 880 : type === 'draw' ? 330 : 520;
    g.gain.value = 0.05;
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.08);
  }catch{}
}

function pname(mark){
  const n = (mark === 'X' ? inputX.value.trim() : inputO.value.trim());
  return n || (mark === 'X' ? 'Joueur X' : 'Joueur O');
}

function setTurnLabel(){
  turnLabel.textContent = playing ? `Au tour de ${pname(current)} (${current})` : 'Entrez les noms, choisissez un mode et cliquez sur Commencer';
}

function clearBoard(){
  board = Array(9).fill('');
  cells.forEach(c => { c.textContent = ''; c.dataset.mark = ''; c.classList.remove('win'); });
  lastWinLine = null;
}

function enableBoard(on){
  cells.forEach(c => c.disabled = !on);
}

function updateScoresUI(){
  scoreX.textContent = String(scores.X);
  scoreO.textContent = String(scores.O);
  scoreDraw.textContent = String(scores.D);
  nameX.textContent = pname('X');
  nameO.textContent = pname('O');
}

const KEY = 'morpion_v2';
function saveState(){
  const data = {
    names: { X: inputX.value, O: inputO.value },
    scores, theme: document.documentElement.getAttribute('data-theme'),
    mode
  };
  localStorage.setItem(KEY, JSON.stringify(data));
}

function loadState(){
  try{
    const data = JSON.parse(localStorage.getItem(KEY));
    if(!data) return;
    if(data.names){ inputX.value = data.names.X || ''; inputO.value = data.names.O || ''; }
    if(data.scores){ scores = data.scores; }
    if(data.mode){ mode = data.mode; modeSelect.value = mode; }
    if(data.theme){ document.documentElement.setAttribute('data-theme', data.theme); themeToggle.checked = (data.theme === 'light'); }
  }catch{}
  updateScoresUI();
}

function startGame(){
  playing = true;
  current = 'X';
  updateScoresUI();
  setTurnLabel();
  clearBoard();
  enableBoard(true);
  saveState();
  maybeAIMove(); 
}

function playAt(index){
  if(!playing) return;
  if(board[index]) return;
  board[index] = current;
  const cell = cells[index];
  cell.textContent = current;
  cell.dataset.mark = current;
  cell.style.transform = 'scale(1.08)';
  setTimeout(() => cell.style.transform = '', 80);
  beep('move');

  const line = getWinLine();
  if(line){
    finish(`${pname(current)} a gagné !`, current, line);
    return;
  }
  if(board.every(x => x)){
    finish(`Égalité !`, 'D');
    return;
  }
  current = current === 'X' ? 'O' : 'X';
  setTurnLabel();
  saveState();
  maybeAIMove();
}

function getWinLine(){
  for(const line of WINS){
    const [a,b,c]=line;
    if(board[a] && board[a]===board[b] && board[a]===board[c]) return line;
  }
  return null;
}

function finish(message, winner, line=null){
  playing = false;
  enableBoard(false);
  overlayText.textContent = message;
  overlay.classList.remove('hidden');
  if(line){
    lastWinLine = line;
    line.forEach(i => cells[i].classList.add('win'));
  }
  if(winner === 'X') scores.X++;
  else if(winner === 'O') scores.O++;
  else scores.D++;
  updateScoresUI();
  beep(winner === 'D' ? 'draw' : 'win');
  saveState();
}

function nextRound(){
  overlay.classList.add('hidden');
  playing = true;
  clearBoard();
  enableBoard(true);
  current = 'X';
  setTurnLabel();
  saveState();
  maybeAIMove();
}

function resetAll(){
  scores = { X:0, O:0, D:0 };
  updateScoresUI();
  inputX.value = '';
  inputO.value = '';
  turnLabel.textContent = 'Entrez les noms, choisissez un mode et cliquez sur Commencer';
  clearBoard();
  enableBoard(false);
  overlay.classList.add('hidden');
  saveState();
}

function maybeAIMove(){
  if(!playing) return;
  if(mode === 'human') return;
  if(current !== 'O') return; 
  setTimeout(() => {
    if(mode === 'easy') aiEasy();
    else if(mode === 'impossible') aiImpossible();
  }, 160);
}

function aiEasy(){
  const move = findWinningMove('O') ?? findWinningMove('X') ?? randomEmpty();
  if(move != null) playAt(move);
}

function aiImpossible(){
  const move = bestMove('O');
  if(move != null) playAt(move);
}

function findWinningMove(mark){
  for(const line of WINS){
    const [a,b,c]=line;
    const vals = [board[a],board[b],board[c]];
    if(vals.filter(v=>v===mark).length===2 && vals.includes('')) return [a,b,c][vals.indexOf('')];
  }
  return null;
}

function randomEmpty(){
  const empties = board.map((v,i)=>v?null:i).filter(v=>v!=null);
  if(!empties.length) return null;
  return empties[Math.floor(Math.random()*empties.length)];
}

function bestMove(aiMark){
  const humanMark = aiMark === 'O' ? 'X' : 'O';
  let bestScore = -Infinity, move=null;
  for(let i=0;i<9;i++){
    if(board[i]) continue;
    board[i]=aiMark;
    const score = minimax(false, aiMark, humanMark);
    board[i]='';
    if(score>bestScore){ bestScore=score; move=i; }
  }
  return move;
}

function minimax(isAITurn, aiMark, humanMark){
  const winner = evaluateWinner();
  if(winner === aiMark) return 10;
  if(winner === humanMark) return -10;
  if(board.every(x=>x)) return 0;
  let best = isAITurn ? -Infinity : Infinity;
  const mark = isAITurn ? aiMark : humanMark;
  for(let i=0;i<9;i++){
    if(board[i]) continue;
    board[i]=mark;
    const score = minimax(!isAITurn, aiMark, humanMark);
    board[i]='';
    best = isAITurn ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function evaluateWinner(){
  for(const [a,b,c] of WINS){
    if(board[a] && board[a]===board[b] && board[a]===board[c]) return board[a];
  }
  return null;
}

function setTheme(light){
  document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
  themeToggle.checked = light;
  saveState();
}

let focusIndex = 0;
function focusCell(i){
  focusIndex = (i+9)%9;
  cells[focusIndex].focus();
}

document.addEventListener('keydown', (e)=>{
  const k = e.key;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter',' '].includes(k)) e.preventDefault();
  const row = Math.floor(focusIndex/3), col = focusIndex%3;
  if(k==='ArrowLeft')  focusCell(row*3 + (col+2)%3);
  if(k==='ArrowRight') focusCell(row*3 + (col+1)%3);
  if(k==='ArrowUp')    focusCell(((row+2)%3)*3 + col);
  if(k==='ArrowDown')  focusCell(((row+1)%3)*3 + col);
  if(k==='Enter' || k===' ') playAt(focusIndex);
});

cells.forEach(c => c.addEventListener('click', e => playAt(Number(e.currentTarget.dataset.index))));
overlayBtn.addEventListener('click', nextRound);
startBtn.addEventListener('click', startGame);
resetRoundBtn.addEventListener('click', nextRound);
resetAllBtn.addEventListener('click', resetAll);
modeSelect.addEventListener('change', ()=>{ mode = modeSelect.value; saveState(); });
[inputX, inputO].forEach(el => el.addEventListener('input', ()=>{ updateScoresUI(); saveState(); }));
themeToggle.addEventListener('change', ()=> setTheme(themeToggle.checked));

enableBoard(false);
loadState();
setTurnLabel();
focusCell(0);
