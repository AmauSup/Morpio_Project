// === Sélecteurs
const gridSel  = document.getElementById('grid');
const modeSel  = document.getElementById('mode');
const namesBox = document.getElementById('names');
const inputX   = document.getElementById('nameX');
const inputO   = document.getElementById('nameO');
const logoXSel = document.getElementById('logoX');
const logoOSel = document.getElementById('logoO');

const pillX = document.getElementById('pillX');
const pillO = document.getElementById('pillO');
const statusEl = document.getElementById('status');

const boardEl = document.getElementById('board');
const replayBtn = document.getElementById('replay');

// === État
let cells = [];
let board = [];
let size = 3;          // côté du plateau (2, 3, 4…)
let winLen = 3;        // alignement nécessaire (2, 3, 4…)
let LINES = [];        // lignes gagnantes dynamiques
let turn = 'X';
let playing = true;

let names = { X: 'X', O: 'O' };
let logos = { X: '❌', O: '⭕️' };
let mode  = 'medium'; // easy | medium | impossible | friend

// === Helpers
const emptyIdx = (b)=>b.map((v,i)=>v===''?i:null).filter(i=>i!==null);
const winFor   = (b,p)=>LINES.some(l=>l.every(i=>b[i]===p));
const draw     = (b)=>emptyIdx(b).length===0;

// Génère toutes les lignes gagnantes pour un carré size×size et une longueur winLen
function computeLines(size, winLen){
  const lines = [];
  // horizontales
  for(let r=0; r<size; r++){
    for(let c=0; c<=size-winLen; c++){
      const line=[]; for(let k=0;k<winLen;k++) line.push(r*size + (c+k));
      lines.push(line);
    }
  }
  // verticales
  for(let c=0;c<size;c++){
    for(let r=0;r<=size-winLen;r++){
      const line=[]; for(let k=0;k<winLen;k++) line.push((r+k)*size + c);
      lines.push(line);
    }
  }
  // diagonales ↘︎
  for(let r=0;r<=size-winLen;r++){
    for(let c=0;c<=size-winLen;c++){
      const line=[]; for(let k=0;k<winLen;k++) line.push((r+k)*size + (c+k));
      lines.push(line);
    }
  }
  // diagonales ↙︎
  for(let r=0;r<=size-winLen;r++){
    for(let c=winLen-1;c<size;c++){
      const line=[]; for(let k=0;k<winLen;k++) line.push((r+k)*size + (c-k));
      lines.push(line);
    }
  }
  return lines;
}

// Construit visuellement le plateau (et gère disponibilité IA)
function buildBoard(totalCells){
  size   = Math.round(Math.sqrt(totalCells));
  winLen = size;

  board  = Array(size*size).fill('');
  LINES  = computeLines(size, winLen);

  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  for(let i=0;i<board.length;i++){
    const btn = document.createElement('button');
    btn.className = 'cell';
    btn.dataset.i = i;
    btn.addEventListener('click', ()=>humanPlay(i));
    boardEl.appendChild(btn);
  }
  cells = [...document.querySelectorAll('.cell')];

  // IA uniquement en 3×3
  const aiAvailable = (size === 3);
  modeSel.disabled = !aiAvailable;
  if(!aiAvailable && mode !== 'friend'){
    mode = 'friend';
    modeSel.value = 'friend';
    info(`IA désactivée en ${size}×${size} – mode “Contre un joueur”.`);
  } else if (aiAvailable) {
    // si on revient en 3×3, reprendre la valeur du select
    mode = modeSel.value;
  }

  turn = 'X';
  playing = true;
  setStatus();
}

// Met à jour les badges / statut
function setStatus(msg){
  pillX.textContent = `${logos.X} ${names.X || 'X'}`;
  pillO.textContent = `${logos.O} ${names.O || 'O'}`;
  statusEl.textContent = msg ?? `C’est à ${names[turn] || turn} de jouer.`;
}
function info(m){ statusEl.textContent = m; setTimeout(()=>setStatus(), 1400); }

// Fin de manche
function endRound(msg, winLine){
  playing = false;
  statusEl.textContent = msg;
  if(winLine){ winLine.forEach(idx => cells[idx].classList.add('win')); }
  cells.forEach(c=>c.disabled=true);
}

function place(i,player){
  board[i]=player;
  cells[i].textContent = player==='X' ? logos.X : logos.O;
}

// === IA ===
// Facile : aléatoire
const aiEasy = (b)=>{const e=emptyIdx(b); return e[Math.floor(Math.random()*e.length)]};

// Moyen 3×3 : gagne > bloque > centre > coin opposé > coin > côté
function aiMedium(b){
  if(size !== 3) return aiEasy(b);
  const e = emptyIdx(b);
  // 1) gagner
  for(const i of e){ const t=b.slice(); t[i]='O'; if(winFor(t,'O')) return i; }
  // 2) bloquer X
  for(const i of e){ const t=b.slice(); t[i]='X'; if(winFor(t,'X')) return i; }
  // 3) centre
  if(b[4]==='') return 4;
  // 4) coin opposé si X occupe
  const opp = {0:8,2:6,6:2,8:0};
  for(const c of [0,2,6,8]) if(b[c]==='X' && b[opp[c]]==='') return opp[c];
  // 5) coin libre
  for(const c of [0,2,6,8]) if(b[c]==='') return c;
  // 6) côté libre
  for(const s of [1,3,5,7]) if(b[s]==='') return s;
  return aiEasy(b);
}

// Impossible (minimax) pour 3×3
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
  let bestIdx=0, bestScore=(player==='O')?-Infinity:Infinity;
  moves.forEach((m,idx)=>{
    if(player==='O' && m.score>bestScore){bestScore=m.score;bestIdx=idx;}
    if(player!=='O' && m.score<bestScore){bestScore=m.score;bestIdx=idx;}
  });
  return moves[bestIdx];
}

// Tour de l'IA (joue O)
function aiPlay(){
  if(!playing) return;

  let mv;
  if(size !== 3 || mode === 'friend'){ // sécurité
    mv = aiEasy(board);
  } else if (mode === 'easy') {
    mv = aiEasy(board);
  } else if (mode === 'medium') {
    mv = aiMedium(board);
  } else {
    mv = aiImpossible(board);
  }

  place(mv,'O');

  const winLineO = LINES.find(l=>l.every(idx=>board[idx]==='O'));
  if(winLineO){ endRound(`${names['O']||'O'} a gagné !`, winLineO); return; }
  if(draw(board)){ endRound('Match nul.'); return; }

  turn = 'X';
  setStatus();
}

function humanPlay(i){
  if(!playing || board[i] !== '') return;

  place(i,turn);

  const winLine = LINES.find(l=>l.every(idx=>board[idx]===turn));
  if(winLine){ endRound(`${names[turn]||turn} a gagné !`, winLine); return; }
  if(draw(board)){ endRound('Match nul.'); return; }

  // Passe au tour suivant
  turn = (turn==='X' ? 'O' : 'X');
  setStatus();

  // L'IA joue automatiquement quand c'est O et qu'on n'est pas en "friend"
  if (turn === 'O' && mode !== 'friend' && size === 3) {
    setTimeout(aiPlay, 260);
  }
}

function resetBoard(){
  buildBoard(Number(gridSel.value));
  cells.forEach(c=>{ c.disabled=false; c.classList.remove('win'); });
}

// === Évènements (noms + logos + taille + mode)
inputX.addEventListener('input', ()=>{ names.X = inputX.value.trim() || 'X'; setStatus(); });
inputO.addEventListener('input', ()=>{ names.O = inputO.value.trim() || 'O'; setStatus(); });
logoXSel.addEventListener('change', ()=>{ logos.X = logoXSel.value; setStatus(); });
logoOSel.addEventListener('change', ()=>{ logos.O = logoOSel.value; setStatus(); });

gridSel.addEventListener('change', resetBoard);
modeSel.addEventListener('change', ()=>{ mode = modeSel.value; setStatus(); });
replayBtn.addEventListener('click', resetBoard);

// === Init
mode = modeSel.value; // lit la valeur du select
buildBoard(Number(gridSel.value));
setStatus();
