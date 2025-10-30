// Éléments
const modeSel = document.getElementById('mode');
const namesBox = document.getElementById('names');
const inputX = document.getElementById('nameX');
const inputO = document.getElementById('nameO');

const pillX = document.getElementById('pillX');
const pillO = document.getElementById('pillO');
const statusEl = document.getElementById('status');

const cells = [...document.querySelectorAll('.cell')];
const replayBtn = document.getElementById('replay');

// État
let board = Array(9).fill('');
let turn = 'X';
let playing = true;
let mode = 'medium'; // easy | medium | impossible | friend
let names = { X: 'X', O: 'O' };

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Helpers
const emptyIdx = (b)=>b.map((v,i)=>v===''?i:null).filter(i=>i!==null);
const winFor = (b,p)=>LINES.some(l=>l.every(i=>b[i]===p));
const draw = (b)=>emptyIdx(b).length===0;

// Base
function resetBoard(){
  board = Array(9).fill('');
  turn = 'X';
  playing = true;
  statusEl.textContent = `C’est à ${names[turn]} de jouer.`;
  cells.forEach(c=>{c.textContent=''; c.disabled=false;});
}

function setFriendUI(){
  const friend = (mode === 'friend');
  namesBox.style.display = friend ? 'flex' : 'none';
  if(!friend){
    names = { X:'X', O:'O' };
    pillX.textContent = names.X;
    pillO.textContent = names.O;
    statusEl.textContent = `C’est à ${names[turn]} de jouer.`;
  }
}

function endRound(msg){
  playing = false;
  statusEl.textContent = msg;
  cells.forEach(c=>c.disabled=true);
}

function place(i,p){
  board[i]=p;
  cells[i].textContent=p;
}

function humanPlay(i){
  if(!playing || board[i] !== '') return;
  place(i,turn);

  if(winFor(board,turn)) { endRound(`${names[turn]} a gagné !`); return; }
  if(draw(board)) { endRound(`Match nul !`); return; }

  turn = (turn==='X' ? 'O' : 'X');
  statusEl.textContent = `C’est à ${names[turn]} de jouer.`;

  if(mode!=='friend' && turn==='O'){
    setTimeout(aiPlay,280);
  }
}

// IA
function aiPlay(){
  if(!playing) return;
  let mv;
  if(mode==='easy') mv = aiEasy(board);
  else if(mode==='medium') mv = aiMedium(board);
  else mv = aiImpossible(board);

  place(mv,'O');

  if(winFor(board,'O')) { endRound(`${names['O']} a gagné !`); return; }
  if(draw(board)) { endRound(`Match nul !`); return; }

  turn = 'X';
  statusEl.textContent = `C’est à ${names[turn]} de jouer.`;
}
const aiEasy = (b)=>{const e=emptyIdx(b); return e[Math.floor(Math.random()*e.length)]};
function aiMedium(b){
  for(const i of emptyIdx(b)){ const t=b.slice(); t[i]='O'; if(winFor(t,'O')) return i; }
  for(const i of emptyIdx(b)){ const t=b.slice(); t[i]='X'; if(winFor(t,'X')) return i; }
  return aiEasy(b);
}
function aiImpossible(b){ return minimax(b,'O').index; }
function minimax(b,player){
  if(winFor(b,'X')) return {score:-10};
  if(winFor(b,'O')) return {score:10};
  const e = emptyIdx(b);
  if(e.length===0) return {score:0};

  const moves=[];
  for(const i of e){
    const move={index:i};
    b[i]=player;
    move.score = minimax(b, player==='O'?'X':'O').score;
    b[i]='';
    moves.push(move);
  }
  let bestIdx = 0, bestScore = (player==='O') ? -Infinity : Infinity;
  moves.forEach((m,idx)=>{
    if(player==='O' && m.score>bestScore){bestScore=m.score;bestIdx=idx;}
    if(player!=='O' && m.score<bestScore){bestScore=m.score;bestIdx=idx;}
  });
  return moves[bestIdx];
}

// Évènements
cells.forEach((btn,i)=>btn.addEventListener('click',()=>humanPlay(i)));
replayBtn.addEventListener('click', resetBoard);

modeSel.addEventListener('change', ()=>{
  mode = modeSel.value;
  setFriendUI();
  resetBoard();
});

inputX.addEventListener('input', ()=>{
  names.X = inputX.value.trim() || 'X';
  pillX.textContent = names.X;
  statusEl.textContent = `C’est à ${names[turn]} de jouer.`;
});
inputO.addEventListener('input', ()=>{
  names.O = inputO.value.trim() || 'O';
  pillO.textContent = names.O;
  statusEl.textContent = `C’est à ${names[turn]} de jouer.`;
});

// Init
setFriendUI();
resetBoard();
