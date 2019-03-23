const gridWrapper = document.querySelector('.grid-wrapper');
const playerField = document.querySelector('.player-field')
const m = 10;
const initialPos = [{ x: 4, y:4 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 4, y: 5 }];
let player1 = true;
let turnTimestamp = 0;
let clockInterval;
let tutorialMode = false;
let aiMode = false;

let statsA;
let statsB;

const offsets = [
  { x:  0, y:  1 }, 
  { x:  0, y: -1 }, 
  { x:  1, y:  0 }, 
  { x: -1, y:  0 }, 
  { x:  1, y:  1 }, 
  { x: -1, y: -1 }, 
  { x:  1, y: -1 }, 
  { x: -1, y:  1 }, 
];

init();

function init() {
  renderBoard();
  initPlayerField();
  setInitialPos();
  setSquareClickListener();
  initGameClock();
  initStats();
  initSkipButton();
  initResignButton();
  initResetButton();
  initAIButton();
  initTutorialModeCheckbox();
  checkLegalMove(player1);
}

function statsObj(totalTurnsDuration, totalAvgTime) {
  this.score = 2;
  this.turns = 0;
  this.turnsDuration = [];
  this.totalTurnsDuration = totalTurnsDuration;
  this.avgTime = '0.0';
  this.totalAvgTime = totalAvgTime;
  this.onlyTwo = 1;
}

function initStats(options) {
  if (options && options.continuing) {
    statsA = new statsObj(statsA.totalTurnsDuration, statsA.totalAvgTime);
    statsB = new statsObj(statsB.totalTurnsDuration, statsB.totalAvgTime);
  } else {
    statsA = new statsObj([], '0.0');
    statsB = new statsObj([], '0.0'); 
  }

  // Init turn time for the first turn
  turnTimestamp = new Date().getTime();

  updateStatsOnDOM();
}

function initSkipButton() {
  document.querySelector('.skip').addEventListener('click', () => {
    prepateNextTurn();
  });
}

function initResignButton() {
  document.querySelector('.resign').addEventListener('click', () => {
    gameOver(!player1);
  });
}

function initAIButton() {
  document.querySelector('.ai').addEventListener('click', () => {
    toggleAIMode();
  });
}

function initTutorialModeCheckbox() {
  document.querySelector('.tutorial-mode input').addEventListener('change', function() {
    if (this.checked) {
      tutorialMode = true;
    } else {
      tutorialMode = false;
    }
  });
}

function initResetButton() {
  document.querySelector('.reset').addEventListener('click', () => {
    const elementToClear = document.querySelectorAll('.square');
    for (let i = 0; i < elementToClear.length; i++) {
      elementToClear[i].classList.remove('black');
      elementToClear[i].classList.remove('white');
      elementToClear[i].classList.remove('legal-black');
      elementToClear[i].classList.remove('legal-white');
    }

    player1 = true;
    gameOn();
    initGameClock();
    initPlayerField();
    setInitialPos();
    initStats({ continuing: true });
    checkLegalMove(player1);
    document.querySelector('.winner').classList.remove('white-text');
  });
}

function updateStatsOnDOM() {
  const players = ['a', 'b'];
  let statsObj;

  players.forEach(player => {
    statsObj = player === 'a' ? statsA : statsB;
    document.querySelector(`.stats-${player} .score`).innerHTML = statsObj.score;
    document.querySelector(`.stats-${player} .turns`).innerHTML = statsObj.turns;
    document.querySelector(`.stats-${player} .avg-time`).innerHTML = `${statsObj.avgTime}s`;
    document.querySelector(`.stats-${player} .total-avg-time`).innerHTML = `${statsObj.totalAvgTime}s`;
    document.querySelector(`.stats-${player} .only-two`).innerHTML = statsObj.onlyTwo; 
  });
}

function updateStats() {
  currentPlayerStats = player1 ? statsA: statsB;
  
  // Update turn number
  currentPlayerStats.turns++;

  // Update average turn time
  calculateTurnTime(currentPlayerStats);

  // Calculate score and onlyTwo
  calculateScore();

  updateStatsOnDOM();
}

function toggleAIMode() {
  aiMode = !aiMode;
  if (aiMode) {
    document.querySelector('.stats-b > h3').innerHTML = 'Computer';
    document.querySelector('.ai').innerHTML = '1-1 Mode';
  } else {
    document.querySelector('.stats-b > h3').innerHTML = 'Player 2';
    document.querySelector('.ai').innerHTML = 'AI Mode';
  }
}

function calculateScore() {
  const numBlackCircles = document.querySelectorAll('.black').length;
  const numWhiteCircles = document.querySelectorAll('.white').length;

  statsA.score = numBlackCircles;
  statsB.score = numWhiteCircles;

  if (numBlackCircles === 2) { statsA.onlyTwo++ };
  if (numWhiteCircles === 2) { statsB.onlyTwo++ };
}

function calculateTurnTime(currentPlayerStats) {
  const nowTimestamp = new Date().getTime();
  const elapsedTurnTime = ((nowTimestamp - turnTimestamp) / 1000).toFixed(1);
  currentPlayerStats.turnsDuration.push(elapsedTurnTime);
  currentPlayerStats.totalTurnsDuration.push(elapsedTurnTime);
  currentPlayerStats.avgTime = calculateAvgTurnTime(currentPlayerStats);
  currentPlayerStats.totalAvgTime = calculateTotalAvgTurnTime(currentPlayerStats);
  turnTimestamp = new Date().getTime();
}

function calculateAvgTurnTime(currentPlayerStats) {
  let sum = 0;

  currentPlayerStats.turnsDuration.forEach(turn => {
    sum += parseInt(turn, 10);
  });

  return (sum / currentPlayerStats.turnsDuration.length).toFixed(1);
}

function calculateTotalAvgTurnTime(currentPlayerStats) {
  let sum = 0;

  currentPlayerStats.totalTurnsDuration.forEach(turn => {
    sum += parseInt(turn, 10);
  });

  return (sum / currentPlayerStats.totalTurnsDuration.length).toFixed(1);
}

function renderBoard() {
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      gridWrapper.innerHTML += `<div class='square' data-x="${i}" data-y="${j}"><span></span></div>`;
    }
  }
}

function makeAITurn() {
  const allLegalMoves = document.querySelectorAll('.legal-white');
  const legalMovesValue = [];

  for (let i = 0; i < allLegalMoves.length; i++) {
    legalMovesValue.push({ value: aiModeFindBestMove(allLegalMoves[i].dataset.x, allLegalMoves[i].dataset.y), selector: allLegalMoves[i] });
  }
  
  // Find max
  let max = 0;
  let selector;

  for (let i = 0; i < legalMovesValue.length; i++) {
    if (legalMovesValue[i].value > max) {
      max = legalMovesValue[i].value;
      selector = legalMovesValue[i].selector;
    }
  }

  setTimeout(() => {
    selector.classList.remove(`legal-white`);
    selector.classList.add('white');

    swapSquares(false, selector.dataset.x, selector.dataset.y);
    updateStats();
    prepateNextTurn();
    checkGameOver();
  }, 500);
  
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
          updateStats();
          prepateNextTurn();
          checkGameOver();
        }
      });
    });

    square.addEventListener('mouseover', event => {
      colors.forEach(color => {
        if (tutorialMode && square.classList.contains(`legal-${color}`)) {
          tutorialModeCheck(player1, square.dataset.x, square.dataset.y);
        }
      });
    });

    square.addEventListener('mouseleave', event => {
        if (tutorialMode) {
          clearTutorialHints();
        }
    });
  });
}

function checkGameOver() {
  const numSquares = document.querySelectorAll('.square:not(.black):not(.white)');

  if (numSquares.length === 0) {
    return gameOver(statsA.score > statsB.score ? player1 : !player1);
  }

  if (statsA.score === 0) {
    return gameOver(false);
  }

  if (statsB.score === 0) {
    return gameOver(true);
  }

  if (aiMode && !player1) { makeAITurn() };
}

function prepateNextTurn() {
  player1 = !player1;

  if (player1) {
    playerField.innerHTML = 'Player 1';
    playerField.classList.remove('white-text');
  } else {
    if (aiMode) {
      playerField.innerHTML = 'Computer';
    } else {
      playerField.innerHTML = 'Player 2';
    }
    playerField.classList.add('white-text');
  }

  if (tutorialMode) clearTutorialHints();
  clearLegalMoves();
  checkLegalMove(player1);
}

function clearTutorialHints() {
  document.querySelectorAll(`.square span`).forEach(square => {
    square.innerHTML = '';
    square.classList.remove('hint');

  });
}

function clearLegalMoves() {
  document.querySelectorAll('.legal-white, .legal-black').forEach(square => {
    square.classList.remove('legal-white');
    square.classList.remove('legal-black');
  });
}

function initPlayerField() {
  playerField.classList.remove('white-text');
  playerField.innerHTML = 'Player 1';
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

  clockInterval = setInterval(() => {
    totalSeconds++;
    minutes.innerHTML = (parseInt(totalSeconds / 60)).toString().padStart(2, '0');
    seconds.innerHTML = (totalSeconds % 60).toString().padStart(2, '0');;
  }, 1000);
}

function tutorialModeCheck(player, srcX, srcY) {
  const newColor = player ? 'black' : 'white';

  const squaresToSwap = [];

  for (let i = 0; i < offsets.length; i++) {
    let possibleSwaps = [];
    let x = parseInt(srcX, 10) + offsets[i].x;
    let y = parseInt(srcY, 10) + offsets[i].y; 

    while (square = document.querySelector(`.square.black[data-x="${x}"][data-y="${y}"], .square.white[data-x="${x}"][data-y="${y}"]`)) {
      if (square.classList.contains(newColor)) {
        squaresToSwap.push(...possibleSwaps);
        break;
      } else {
        possibleSwaps.push(square);
      }
  
      x = parseInt(x, 10) + offsets[i].x;
      y = parseInt(y, 10) + offsets[i].y;
    }
  }

  const hintSquare = document.querySelector(`.square[data-x="${srcX}"][data-y="${srcY}"] span`);

  if (hintSquare) {
    hintSquare.innerHTML = squaresToSwap.length;
    hintSquare.classList.add('hint');
  }
}

function aiModeFindBestMove(srcX, srcY) {
  const squaresToSwap = [];

  for (let i = 0; i < offsets.length; i++) {
    let possibleSwaps = [];
    let x = parseInt(srcX, 10) + offsets[i].x;
    let y = parseInt(srcY, 10) + offsets[i].y; 

    while (square = document.querySelector(`.square.black[data-x="${x}"][data-y="${y}"], .square.white[data-x="${x}"][data-y="${y}"]`)) {
      if (square.classList.contains('white')) {
        squaresToSwap.push(...possibleSwaps);
        break;
      } else {
        possibleSwaps.push(square);
      }
  
      x = parseInt(x, 10) + offsets[i].x;
      y = parseInt(y, 10) + offsets[i].y;
    }
  }

  return squaresToSwap.length;
}

function swapSquares(player, srcX, srcY) {
  const swappedColor = player ? 'white' : 'black';
  const newColor = player ? 'black' : 'white';

  const squaresToSwap = [];

  for (let i = 0; i < offsets.length; i++) {
    let possibleSwaps = [];
    let x = parseInt(srcX, 10) + offsets[i].x;
    let y = parseInt(srcY, 10) + offsets[i].y; 

    while (square = document.querySelector(`.square.black[data-x="${x}"][data-y="${y}"], .square.white[data-x="${x}"][data-y="${y}"]`)) {
      if (square.classList.contains(newColor)) {
        squaresToSwap.push(...possibleSwaps);
        break;
      } else {
        possibleSwaps.push(square);
      }
  
      x = parseInt(x, 10) + offsets[i].x;
      y = parseInt(y, 10) + offsets[i].y;
    }
  }

  for (let i = 0; i < squaresToSwap.length; i++) {
    squaresToSwap[i].classList.remove(swappedColor);
    squaresToSwap[i].classList.add(newColor);
  }
}

function findEdgeSquare(color, x, y, offsetX, offsetY) {
  x = parseInt(x, 10) + offsetX;
  y = parseInt(y, 10) + offsetY;

  while (square = document.querySelector(`.square[data-x="${x}"][data-y="${y}"]`)) {
    if (square.classList.contains(color)) {
      return square;
    }

    x = parseInt(x, 10) + offsetX;
    y = parseInt(y, 10) + offsetY;
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

function zeroizeClock() {
  document.querySelector('.minutes').innerHTML = '00';
  document.querySelector('.seconds').innerHTML = '00';
}

function gameOver(player) {
  clearInterval(clockInterval);
  zeroizeClock();

  if (!player) document.querySelector('.winner').classList.add('white-text');
  document.querySelector('.game-on').style.display = 'none';
  document.querySelector('.game-over').style.display = 'block';

  let winningPlayer;

  if (aiMode) {
    winningPlayer = player ? 'Player 1' : 'Computer';
  } else {
    winningPlayer = player ? 'Player 1' : 'Player 2';
  }

  document.querySelector('.winner').innerHTML = `${winningPlayer} wins!`;
  clearLegalMoves();
}

function gameOn() {
  document.querySelector('.game-on').style.display = 'block';
  document.querySelector('.game-over').style.display = 'none';
  playerField.classList.remove('white-text');
}
