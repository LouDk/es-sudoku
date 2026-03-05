import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk@0.12.0";

// --- Routes ---
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "GET" && url.pathname === "/") {
    return new Response(HTML_PAGE, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new Response("Not Found", { status: 404 });
}

// --- HTML Page ---
const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bunny Sudoku</title>
<style>
  :root {
    --bunny-dark: #022F58;
    --bunny-orange: #FD8D32;
    --bunny-coral: #FF7854;
    --bunny-white: #FFFFFF;
    --bunny-light: #F4F6F8;
    --bunny-mid: #E2E8F0;
    --cell-size: 44px;
    --grid-gap: 1px;
    --box-gap: 3px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bunny-light);
    color: var(--bunny-dark);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 16px;
  }

  header {
    text-align: center;
    margin-bottom: 16px;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  .logo svg { width: 36px; height: 36px; }

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--bunny-dark);
  }

  h1 span { color: var(--bunny-orange); }

  .subtitle {
    font-size: 13px;
    color: #6B7B8D;
    margin-top: 2px;
  }

  .controls {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .controls button {
    padding: 8px 18px;
    border: 2px solid var(--bunny-mid);
    border-radius: 8px;
    background: var(--bunny-white);
    color: var(--bunny-dark);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .controls button:hover {
    border-color: var(--bunny-orange);
    color: var(--bunny-orange);
  }

  .controls button.active {
    background: var(--bunny-orange);
    border-color: var(--bunny-orange);
    color: var(--bunny-white);
  }

  .info-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 420px;
    margin-bottom: 10px;
    padding: 0 4px;
  }

  .timer {
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--bunny-dark);
  }

  .mistakes {
    font-size: 14px;
    color: #6B7B8D;
    font-weight: 600;
  }

  .mistakes .count { color: var(--bunny-coral); }

  .board {
    display: grid;
    grid-template-columns: repeat(9, var(--cell-size));
    grid-template-rows: repeat(9, var(--cell-size));
    gap: var(--grid-gap);
    background: var(--bunny-dark);
    border: 3px solid var(--bunny-dark);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 14px;
  }

  .cell {
    width: var(--cell-size);
    height: var(--cell-size);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    background: var(--bunny-white);
    cursor: pointer;
    position: relative;
    user-select: none;
    transition: background 0.1s;
  }

  .cell.given {
    color: var(--bunny-dark);
    font-weight: 800;
  }

  .cell.user {
    color: var(--bunny-orange);
  }

  .cell.selected {
    background: #FFF3E8;
  }

  .cell.highlighted {
    background: #F0F4FA;
  }

  .cell.same-value {
    background: #FFE8D6;
  }

  .cell.selected.same-value {
    background: #FFD9BC;
  }

  .cell.error {
    color: var(--bunny-coral);
    background: #FFF0ED;
  }

  .cell.selected.error {
    background: #FFE0DA;
  }

  /* Box borders */
  .cell.box-right { border-right: 2px solid var(--bunny-dark); }
  .cell.box-bottom { border-bottom: 2px solid var(--bunny-dark); }

  .notes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0; left: 0;
  }

  .notes span {
    font-size: 10px;
    font-weight: 600;
    color: #8899AA;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .numpad {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 6px;
    margin-bottom: 10px;
    max-width: 420px;
    width: 100%;
  }

  .numpad button {
    aspect-ratio: 1;
    max-width: 44px;
    border: none;
    border-radius: 8px;
    background: var(--bunny-white);
    color: var(--bunny-dark);
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(2,47,88,0.1);
    transition: all 0.1s;
    width: 100%;
  }

  .numpad button:hover {
    background: var(--bunny-orange);
    color: var(--bunny-white);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(253,141,50,0.3);
  }

  .numpad button.completed {
    opacity: 0.3;
    pointer-events: none;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .actions button {
    padding: 8px 16px;
    border: 2px solid var(--bunny-mid);
    border-radius: 8px;
    background: var(--bunny-white);
    color: var(--bunny-dark);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .actions button:hover {
    border-color: var(--bunny-orange);
    color: var(--bunny-orange);
  }

  .actions button.notes-active {
    background: var(--bunny-orange);
    border-color: var(--bunny-orange);
    color: var(--bunny-white);
  }

  .modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(2,47,88,0.5);
    z-index: 100;
    align-items: center;
    justify-content: center;
  }

  .modal-overlay.show { display: flex; }

  .modal {
    background: var(--bunny-white);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    max-width: 340px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(2,47,88,0.3);
  }

  .modal h2 {
    font-size: 24px;
    color: var(--bunny-dark);
    margin-bottom: 8px;
  }

  .modal .stats {
    color: #6B7B8D;
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .modal button {
    padding: 12px 32px;
    background: var(--bunny-orange);
    color: var(--bunny-white);
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }

  .modal button:hover { background: var(--bunny-coral); }

  footer {
    margin-top: auto;
    padding-top: 16px;
    text-align: center;
    font-size: 12px;
    color: #8899AA;
  }

  footer a {
    color: var(--bunny-orange);
    text-decoration: none;
    font-weight: 600;
  }

  @media (max-width: 440px) {
    :root { --cell-size: 38px; }
    h1 { font-size: 22px; }
    .numpad button { font-size: 17px; }
  }

  @media (max-width: 370px) {
    :root { --cell-size: 34px; }
  }
</style>
</head>
<body>

<header>
  <div class="logo">
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#FD8D32"/>
      <ellipse cx="13" cy="8" rx="3.5" ry="8" fill="#FF7854" transform="rotate(-10 13 8)"/>
      <ellipse cx="23" cy="8" rx="3.5" ry="8" fill="#FF7854" transform="rotate(10 23 8)"/>
      <circle cx="18" cy="20" r="9" fill="white"/>
      <circle cx="14.5" cy="18.5" r="2" fill="#022F58"/>
      <circle cx="21.5" cy="18.5" r="2" fill="#022F58"/>
      <ellipse cx="18" cy="22.5" rx="2" ry="1.2" fill="#FD8D32"/>
    </svg>
    <h1>Bunny <span>Sudoku</span></h1>
  </div>
  <div class="subtitle">Powered by Bunny Edge Scripting</div>
</header>

<div class="controls" id="difficulty">
  <button data-diff="easy">Easy</button>
  <button data-diff="medium" class="active">Medium</button>
  <button data-diff="hard">Hard</button>
</div>

<div class="info-bar">
  <div class="mistakes">Mistakes: <span class="count" id="mistakes">0</span>/3</div>
  <div class="timer" id="timer">00:00</div>
</div>

<div class="board" id="board"></div>

<div class="numpad" id="numpad"></div>

<div class="actions">
  <button id="btn-undo">&#x21A9; Undo</button>
  <button id="btn-erase">&#x232B; Erase</button>
  <button id="btn-notes">&#x270E; Notes</button>
  <button id="btn-hint">&#x1F4A1; Hint</button>
  <button id="btn-new">&#x21BB; New</button>
</div>

<div class="modal-overlay" id="modal">
  <div class="modal">
    <h2 id="modal-title">Congratulations!</h2>
    <div class="stats" id="modal-stats"></div>
    <button id="modal-btn">New Game</button>
  </div>
</div>

<footer>
  Built with <a href="https://bunny.net" target="_blank">bunny.net</a> Edge Scripting
</footer>

<script>
(function() {
  // --- Sudoku Generator ---
  function createEmpty() {
    return Array.from({length:81}, () => 0);
  }

  function getRow(i) { return Math.floor(i / 9); }
  function getCol(i) { return i % 9; }
  function getBox(i) { return Math.floor(getRow(i)/3)*3 + Math.floor(getCol(i)/3); }

  function candidates(board, idx) {
    const used = new Set();
    const r = getRow(idx), c = getCol(idx), b = getBox(idx);
    for (let i = 0; i < 81; i++) {
      if (board[i] && (getRow(i)===r || getCol(i)===c || getBox(i)===b)) {
        used.add(board[i]);
      }
    }
    const out = [];
    for (let n = 1; n <= 9; n++) if (!used.has(n)) out.push(n);
    return out;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function solve(board) {
    const b = [...board];
    const stack = [];
    for (let i = 0; i < 81; i++) if (b[i] === 0) stack.push(i);
    let si = 0;
    while (si < stack.length) {
      const idx = stack[si];
      let found = false;
      const start = b[idx] + 1;
      b[idx] = 0;
      for (let n = start; n <= 9; n++) {
        if (candidates(b, idx).includes(n)) {
          b[idx] = n;
          found = true;
          break;
        }
      }
      if (found) { si++; } else { b[idx] = 0; si--; if (si < 0) return null; }
    }
    return b;
  }

  function generate() {
    const board = createEmpty();
    // Fill diagonal boxes randomly for a seed
    for (let box = 0; box < 3; box++) {
      const nums = shuffle([1,2,3,4,5,6,7,8,9]);
      for (let i = 0; i < 9; i++) {
        const r = box*3 + Math.floor(i/3);
        const c = box*3 + (i%3);
        board[r*9+c] = nums[i];
      }
    }
    return solve(board);
  }

  function makePuzzle(solution, clueCount) {
    const puzzle = [...solution];
    const indices = shuffle(Array.from({length:81}, (_,i) => i));
    let removed = 0;
    const target = 81 - clueCount;
    for (const idx of indices) {
      if (removed >= target) break;
      const val = puzzle[idx];
      puzzle[idx] = 0;
      removed++;
    }
    return puzzle;
  }

  // --- Game State ---
  const DIFFICULTIES = { easy: 42, medium: 32, hard: 25 };
  let solution = [];
  let puzzle = [];
  let board = [];
  let notes = Array.from({length:81}, () => new Set());
  let selectedIdx = -1;
  let notesMode = false;
  let mistakes = 0;
  let maxMistakes = 3;
  let history = [];
  let timerSec = 0;
  let timerInterval = null;
  let gameOver = false;
  let difficulty = 'medium';
  let hintsUsed = 0;

  // --- DOM ---
  const boardEl = document.getElementById('board');
  const numpadEl = document.getElementById('numpad');
  const timerEl = document.getElementById('timer');
  const mistakesEl = document.getElementById('mistakes');
  const modalEl = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalStats = document.getElementById('modal-stats');
  const modalBtn = document.getElementById('modal-btn');

  // Build board cells
  const cells = [];
  for (let i = 0; i < 81; i++) {
    const div = document.createElement('div');
    div.className = 'cell';
    div.dataset.idx = i;
    const r = getRow(i), c = getCol(i);
    if (c % 3 === 2 && c < 8) div.classList.add('box-right');
    if (r % 3 === 2 && r < 8) div.classList.add('box-bottom');
    div.addEventListener('click', () => selectCell(i));
    boardEl.appendChild(div);
    cells.push(div);
  }

  // Build numpad
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.textContent = n;
    btn.dataset.num = n;
    btn.addEventListener('click', () => enterNumber(n));
    numpadEl.appendChild(btn);
  }

  // Difficulty buttons
  document.querySelectorAll('#difficulty button').forEach(btn => {
    btn.addEventListener('click', () => {
      difficulty = btn.dataset.diff;
      document.querySelectorAll('#difficulty button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      newGame();
    });
  });

  // Action buttons
  document.getElementById('btn-undo').addEventListener('click', undo);
  document.getElementById('btn-erase').addEventListener('click', erase);
  document.getElementById('btn-notes').addEventListener('click', toggleNotes);
  document.getElementById('btn-hint').addEventListener('click', hint);
  document.getElementById('btn-new').addEventListener('click', newGame);
  modalBtn.addEventListener('click', () => { modalEl.classList.remove('show'); newGame(); });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    const n = parseInt(e.key);
    if (n >= 1 && n <= 9) { enterNumber(n); return; }
    if (e.key === 'Backspace' || e.key === 'Delete') { erase(); return; }
    if (e.key === 'n' || e.key === 'N') { toggleNotes(); return; }
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { undo(); return; }
    // Arrow keys
    if (selectedIdx >= 0) {
      let ni = selectedIdx;
      if (e.key === 'ArrowUp' && getRow(ni) > 0) ni -= 9;
      else if (e.key === 'ArrowDown' && getRow(ni) < 8) ni += 9;
      else if (e.key === 'ArrowLeft' && getCol(ni) > 0) ni -= 1;
      else if (e.key === 'ArrowRight' && getCol(ni) < 8) ni += 1;
      if (ni !== selectedIdx) { selectCell(ni); e.preventDefault(); }
    }
  });

  function newGame() {
    solution = generate();
    puzzle = makePuzzle(solution, DIFFICULTIES[difficulty]);
    board = [...puzzle];
    notes = Array.from({length:81}, () => new Set());
    selectedIdx = -1;
    notesMode = false;
    mistakes = 0;
    history = [];
    gameOver = false;
    hintsUsed = 0;
    timerSec = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!gameOver) { timerSec++; renderTimer(); }
    }, 1000);
    document.getElementById('btn-notes').classList.remove('notes-active');
    render();
  }

  function selectCell(idx) {
    if (gameOver) return;
    selectedIdx = idx;
    render();
  }

  function enterNumber(n) {
    if (gameOver || selectedIdx < 0 || puzzle[selectedIdx] !== 0) return;

    if (notesMode) {
      const prev = new Set(notes[selectedIdx]);
      if (notes[selectedIdx].has(n)) notes[selectedIdx].delete(n);
      else notes[selectedIdx].add(n);
      history.push({type:'note', idx: selectedIdx, prev, next: new Set(notes[selectedIdx])});
      render();
      return;
    }

    const prevVal = board[selectedIdx];
    const prevNotes = new Set(notes[selectedIdx]);
    board[selectedIdx] = n;
    notes[selectedIdx] = new Set();

    if (n !== solution[selectedIdx]) {
      mistakes++;
      mistakesEl.textContent = mistakes;
      history.push({type:'value', idx: selectedIdx, prev: prevVal, next: n, prevNotes, error: true});
      if (mistakes >= maxMistakes) {
        gameOver = true;
        clearInterval(timerInterval);
        render();
        showModal(false);
        return;
      }
    } else {
      // Remove this number from notes in same row/col/box
      const r = getRow(selectedIdx), c = getCol(selectedIdx), b = getBox(selectedIdx);
      for (let i = 0; i < 81; i++) {
        if (getRow(i)===r || getCol(i)===c || getBox(i)===b) {
          notes[i].delete(n);
        }
      }
      history.push({type:'value', idx: selectedIdx, prev: prevVal, next: n, prevNotes});
    }

    render();
    checkWin();
  }

  function erase() {
    if (gameOver || selectedIdx < 0 || puzzle[selectedIdx] !== 0) return;
    if (board[selectedIdx] !== 0) {
      const prev = board[selectedIdx];
      board[selectedIdx] = 0;
      history.push({type:'erase', idx: selectedIdx, prev, prevNotes: new Set(notes[selectedIdx])});
    } else if (notes[selectedIdx].size > 0) {
      const prev = new Set(notes[selectedIdx]);
      notes[selectedIdx] = new Set();
      history.push({type:'notesClear', idx: selectedIdx, prev});
    }
    render();
  }

  function undo() {
    if (gameOver || history.length === 0) return;
    const action = history.pop();
    if (action.type === 'value' || action.type === 'erase') {
      board[action.idx] = action.prev;
      if (action.prevNotes) notes[action.idx] = action.prevNotes;
      if (action.error) { mistakes--; mistakesEl.textContent = mistakes; }
    } else if (action.type === 'note') {
      notes[action.idx] = action.prev;
    } else if (action.type === 'notesClear') {
      notes[action.idx] = action.prev;
    }
    render();
  }

  function toggleNotes() {
    notesMode = !notesMode;
    document.getElementById('btn-notes').classList.toggle('notes-active', notesMode);
  }

  function hint() {
    if (gameOver) return;
    // Find empty cells
    const empty = [];
    for (let i = 0; i < 81; i++) {
      if (board[i] === 0 || board[i] !== solution[i]) empty.push(i);
    }
    if (empty.length === 0) return;
    const idx = empty[Math.floor(Math.random() * empty.length)];
    const prev = board[idx];
    board[idx] = solution[idx];
    notes[idx] = new Set();
    hintsUsed++;
    selectedIdx = idx;
    history.push({type:'value', idx, prev, next: solution[idx], prevNotes: new Set()});
    render();
    checkWin();
  }

  function checkWin() {
    for (let i = 0; i < 81; i++) {
      if (board[i] !== solution[i]) return;
    }
    gameOver = true;
    clearInterval(timerInterval);
    render();
    setTimeout(() => showModal(true), 400);
  }

  function showModal(won) {
    modalTitle.textContent = won ? 'Congratulations!' : 'Game Over';
    const mins = Math.floor(timerSec / 60);
    const secs = timerSec % 60;
    const time = mins + ':' + String(secs).padStart(2, '0');
    if (won) {
      modalStats.innerHTML =
        'Difficulty: <strong>' + difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + '</strong><br>' +
        'Time: <strong>' + time + '</strong><br>' +
        'Mistakes: <strong>' + mistakes + '</strong><br>' +
        'Hints used: <strong>' + hintsUsed + '</strong>';
    } else {
      modalStats.innerHTML =
        'Too many mistakes!<br>The puzzle has been revealed.<br>' +
        'Time: <strong>' + time + '</strong>';
      // Reveal solution
      for (let i = 0; i < 81; i++) board[i] = solution[i];
      render();
    }
    modalEl.classList.add('show');
  }

  function renderTimer() {
    const m = Math.floor(timerSec / 60);
    const s = timerSec % 60;
    timerEl.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }

  function render() {
    const selVal = selectedIdx >= 0 ? board[selectedIdx] : 0;
    const selRow = selectedIdx >= 0 ? getRow(selectedIdx) : -1;
    const selCol = selectedIdx >= 0 ? getCol(selectedIdx) : -1;
    const selBox = selectedIdx >= 0 ? getBox(selectedIdx) : -1;

    // Count completed numbers for numpad
    const counts = new Array(10).fill(0);
    for (let i = 0; i < 81; i++) {
      if (board[i] > 0 && board[i] === solution[i]) counts[board[i]]++;
    }

    for (let i = 0; i < 81; i++) {
      const cell = cells[i];
      const isGiven = puzzle[i] !== 0;
      const val = board[i];
      const r = getRow(i), c = getCol(i), b = getBox(i);

      // Reset classes
      cell.className = 'cell';
      if (c % 3 === 2 && c < 8) cell.classList.add('box-right');
      if (r % 3 === 2 && r < 8) cell.classList.add('box-bottom');

      if (isGiven) {
        cell.classList.add('given');
      } else if (val !== 0) {
        cell.classList.add('user');
      }

      // Highlighting
      if (i === selectedIdx) {
        cell.classList.add('selected');
      } else if (selectedIdx >= 0 && (r === selRow || c === selCol || b === selBox)) {
        cell.classList.add('highlighted');
      }

      // Same value highlight
      if (val !== 0 && selVal !== 0 && val === selVal && i !== selectedIdx) {
        cell.classList.add('same-value');
      }

      // Error highlight
      if (!isGiven && val !== 0 && val !== solution[i]) {
        cell.classList.add('error');
      }

      // Render content
      if (val !== 0) {
        cell.textContent = val;
      } else if (notes[i].size > 0) {
        cell.textContent = '';
        const notesDiv = document.createElement('div');
        notesDiv.className = 'notes';
        for (let n = 1; n <= 9; n++) {
          const span = document.createElement('span');
          span.textContent = notes[i].has(n) ? n : '';
          notesDiv.appendChild(span);
        }
        cell.appendChild(notesDiv);
      } else {
        cell.textContent = '';
      }
    }

    // Update numpad
    numpadEl.querySelectorAll('button').forEach(btn => {
      const n = parseInt(btn.dataset.num);
      btn.classList.toggle('completed', counts[n] >= 9);
    });

    mistakesEl.textContent = mistakes;
    renderTimer();
  }

  // --- Start ---
  newGame();
})();
</script>
</body>
</html>`;

// --- Server ---
console.log("Starting Sudoku server...");
const listener = BunnySDK.net.tcp.unstable_new();
console.log("Listening on:", BunnySDK.net.tcp.toString(listener));

BunnySDK.net.http.serve(
  async (req: Request) => {
    console.log(`[INFO]: ${req.method} ${new URL(req.url).pathname}`);
    return handleRequest(req);
  },
);
