const wrapper = document.querySelector('.wrapper');
const playerField = document.querySelector('.player-field')
const m = 10;
const initialPos = [{ x: 4, y:4 }, { x: 5, y: 4 }, { x: 5, y: 5 }, {x: 4, y: 5 }];
let player1 = true;

init();

function init() {
  renderBoard();
  initPlayerField();
  setInitialPos();
  setSquareClickListener();
  initGameClock();
  checkLegalMove(player1);
}

function renderBoard() {
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      wrapper.innerHTML += `<div class='square' data-x="${i}" data-y="${j}"><span></span></div>`;
    }
  }
}

function setSquareClickListener() {
  const colors = ['black', 'white'];

  document.querySelectorAll('.square').forEach(square => {
    square.addEventListener('click', event => {
      colors.forEach(color => {
        if (square.classList.contains(`legal-${color}`)) {
          square.classList.remove(`legal-${color}`);
          square.classList.add(`${color}`);
          swapSquares(player1, square.dataset.x, square.dataset.y);
          prepateNextTurn();
        }
      });
    });
  });
}

function prepateNextTurn() {
  player1 = !player1;
  playerField.innerHTML = player1 ? 'Player 1 (Black)' : 'Player 2 (White)';

  clearLegalMoves();
  checkLegalMove(player1);
}

function clearLegalMoves() {
  document.querySelectorAll('.legal-white, .legal-black').forEach(square => {
    if (square.classList.contains('legal-white')) square.classList.remove('legal-white');
    if (square.classList.contains('legal-black')) square.classList.remove('legal-black');
  });
}

function initPlayerField() {
  playerField.innerHTML = `Player 1 (Black)`;
}

function setInitialPos() {
  let addedClass;
  initialPos.forEach(pos => {
    addedClass = addedClass === 'white' ? 'black' : 'white';
    document.querySelector(`.square[data-x="${pos.x}"][data-y="${pos.y}"]`).classList.add(addedClass);
  });
}

function initGameClock() {
  let minutes = document.querySelector('.minutes');
  let seconds = document.querySelector('.seconds');
  let totalSeconds = 0;
 
  setInterval(() => {
    totalSeconds++;
    minutes.innerHTML = (parseInt(totalSeconds / 60)).toString().padStart(2, '0');
    seconds.innerHTML = (totalSeconds % 60).toString().padStart(2, '0');;
  }, 1000);
}

function swapSquares(player, x, y) {
  const swappedColor = player ? 'white' : 'black';
  const newColor = player ? 'black' : 'white';

  const newSquares = [];

  const row = document.querySelectorAll(`.square.${swappedColor}[data-x="${x}"]`);
  const col = document.querySelectorAll(`.square.${swappedColor}[data-y="${y}"]`);
  
  if (row !== undefined && row.length !== 0) newSquares.push(row);
  if (col !== undefined && col.length !== 0) newSquares.push(col);
    // newSquares.push(document.querySelectorAll(`.square.black[data-x="${x}"][data-y="${y}"]`));

  for (let i = 0; i < newSquares.length; i++) {
    newSquares[i][0].classList.remove(swappedColor);
    newSquares[i][0].classList.add(newColor);
  }
}

function checkLegalMove(player){
  const currentColor = player ? 'black' : 'white';
  const oppositeColor = player ? 'white' : 'black';

  document.querySelectorAll('.black, .white').forEach(square => {
    let element;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          element = document.querySelector(`.square:not(.black):not(.white)[data-x="${parseInt(square.dataset.x) + i}"][data-y="${parseInt(square.dataset.y) + j}"]`);
          if (element != null)
            element.classList.add(`legal-${currentColor}`);
        }
      }
  })
}