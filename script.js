const gridWrapper = document.querySelector('.grid-wrapper');
const playerField = document.querySelector('.player-field');
const gameOnDiv = document.querySelector('.game-on');
const gameOverDiv = document.querySelector('.game-over');
const winnderField = document.querySelector('.winner');

const m = 10;

let player1 = true;
let turnTimestamp = 0;
let clockInterval;
let tutorialMode = false;
let aiMode = false;

let stats1;
let stats2;

init();

function init() {
  renderBoard();
  initPlayerField();
  setInitialPosition();
  setSquareListeners();

  // Init stats and clock
  initGameClock();
  initStats();

  // Init buttons
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

function renderBoard() {
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      gridWrapper.innerHTML += `<div class='square' data-x="${i}" data-y="${j}"><span></span></div>`;
    }
  }
}

function initStats(options) {
  if (options && options.continuing) {
    stats1 = new statsObj(stats1.totalTurnsDuration, stats1.totalAvgTime);
    stats2 = new statsObj(stats2.totalTurnsDuration, stats2.totalAvgTime);
  } else {
    stats1 = new statsObj([], '0.0');
    stats2 = new statsObj([], '0.0'); 
  }

  // Init turn time for the first turn
  turnTimestamp = new Date().getTime();

  renderStats();
}

function initPlayerField() {
  playerField.classList.remove('white-text');
  playerField.innerHTML = 'Player 1';
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
    tutorialMode = this.checked;
  });
}

function initResetButton() {
  document.querySelector('.reset').addEventListener('click', () => {

    // Clear 'black', 'white' and 'legal-' classes
    document.querySelectorAll('.square').forEach((element) => {
      element.classList.remove('black');
      element.classList.remove('white');
      element.classList.remove('legal-black');
      element.classList.remove('legal-white');
    });

    player1 = true;
    gameOn();
    initGameClock();
    initPlayerField();
    setInitialPosition();
    initStats({ continuing: true });
    checkLegalMove(player1);
    winnderField.classList.remove('white-text');
  });
}

function renderStats() {
  const players = [1, 2];
  let statsObj;

  players.forEach(player => {
    statsObj = player === 1 ? stats1 : stats2;
    document.querySelector(`.stats-${player} .score`).innerHTML = statsObj.score;
    document.querySelector(`.stats-${player} .turns`).innerHTML = statsObj.turns;
    document.querySelector(`.stats-${player} .avg-time`).innerHTML = `${statsObj.avgTime}s`;
    document.querySelector(`.stats-${player} .total-avg-time`).innerHTML = `${statsObj.totalAvgTime}s`;
    document.querySelector(`.stats-${player} .only-two`).innerHTML = statsObj.onlyTwo; 
  });
}

function updateStats() {
  currentPlayerStats = player1 ? stats1 : stats2;
  currentPlayerStats.turns++; // Update turn number

  calculateTurnTime(currentPlayerStats); // Update average turn time
  calculateScore(); // Calculate score and onlyTwo
  renderStats();
}

function toggleAIMode() {
  aiMode = !aiMode;
  if (aiMode) {
    document.querySelector('.stats-2 > h3').innerHTML = 'Computer';
    document.querySelector('.ai').innerHTML = '1-1 Mode';
  } else {
    document.querySelector('.stats-2 > h3').innerHTML = 'Player 2';
    document.querySelector('.ai').innerHTML = 'AI Mode';
  }
}

function calculateScore() {
  stats1.score = document.querySelectorAll('.black').length;;
  stats2.score = document.querySelectorAll('.white').length;;

  if (stats1.score === 2) { stats1.onlyTwo++ };
  if (stats2.score === 2) { stats2.onlyTwo++ };
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

function makeAITurn() {
  const allLegalMoves = document.querySelectorAll('.legal-white');
  const legalMovesValue = [];

  allLegalMoves.forEach(move => {
    legalMovesValue.push({ value: aiModeFindBestMove(move.dataset.x, move.dataset.y), selector: move });
  });
    
  // Find max
  let max = 0;
  let selector;

  legalMovesValue.forEach((move, i) => {
    if (i === 0) {
      selector = move.selector;
    }
    if (move.value > max) {
      max = move.value;
      selector = move.selector;
    }
  });

  setTimeout(() => {
    selector.classList.remove(`legal-white`);
    selector.classList.add('white');

    swapSquares(false, selector.dataset.x, selector.dataset.y);
    updateStats();
    prepateNextTurn();
    checkGameOver();
  }, 500);
}

function setSquareListeners() {
  const colors = ['black', 'white'];

  document.querySelectorAll('.square').forEach(square => {
    square.addEventListener('click', () => {
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

    // OnMouseOver show hints when tutorial mode is on
    square.addEventListener('mouseover', () => {
      colors.forEach(color => {
        if (tutorialMode && square.classList.contains(`legal-${color}`)) {
          tutorialModeCheck(player1, square.dataset.x, square.dataset.y);
        }
      });
    });

    // OnMouseLeave hide hints when tutorial mode is on
    square.addEventListener('mouseleave', () => {
        if (tutorialMode) {
          clearTutorialHints();
        }
    });
  });
}

function checkGameOver() {
  const numSquares = document.querySelectorAll('.square:not(.black):not(.white)');

  if (numSquares.length === 0) {
    return gameOver(stats1.score > stats2.score ? player1 : !player1);
  }

  if (stats1.score === 0) { return gameOver(false); }
  if (stats2.score === 0) { return gameOver(true); }
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

  if (tutorialMode) {
    clearTutorialHints();
  }
    
  clearLegalMoves();
  checkLegalMove(player1)
}

function clearTutorialHints() {
  document.querySelectorAll(`.square span`).forEach(square => {
    square.innerHTML = ''
    square.classList.remove('hint')
  });
}

function clearLegalMoves() {
  document.querySelectorAll('.legal-white, .legal-black').forEach(square => {
    square.classList.remove('legal-white');
    square.classList.remove('legal-black');
  });
}

function setInitialPosition() {
  let addedClass;

  initialPos.forEach(pos => {
    addedClass = addedClass === 'white' ? 'black' : 'white';
    document.querySelector(`.square[data-x="${pos.x}"][data-y="${pos.y}"]`).classList.add(addedClass);
  });
}

function initGameClock() {
  let totalSeconds = 0;
  let minutes = document.querySelector('.minutes');
  let seconds = document.querySelector('.seconds');

  clockInterval = setInterval(() => {
    totalSeconds++;
    minutes.innerHTML = (parseInt(totalSeconds / 60)).toString().padStart(2, '0');
    seconds.innerHTML = (totalSeconds % 60).toString().padStart(2, '0');;
  }, 1000);
}

function checkPossibleSwaps(srcX, srcY, newColor) {
  let squaresToSwap = [];

  offsets.forEach((offset) => {
    let possibleSwaps = [];
    let x = parseInt(srcX, 10) + offset.x;
    let y = parseInt(srcY, 10) + offset.y; 

    while (square = document.querySelector(`.square.black[data-x="${x}"][data-y="${y}"], .square.white[data-x="${x}"][data-y="${y}"]`)) {
      if (square.classList.contains(newColor)) {
        squaresToSwap.push(...possibleSwaps);
        break;
      } else {
        possibleSwaps.push(square);
      }
  
      x += offset.x;
      y += offset.y;
    }
  });

  return squaresToSwap;
}

function tutorialModeCheck(player, srcX, srcY) {
  const newColor = player ? 'black' : 'white';
  const squaresToSwap = checkPossibleSwaps(srcX, srcY, newColor);
  const hintSquare = document.querySelector(`.square[data-x="${srcX}"][data-y="${srcY}"] span`);

  if (hintSquare) {
    hintSquare.innerHTML = squaresToSwap.length + 1;
    hintSquare.classList.add('hint');
  }
}

function aiModeFindBestMove(srcX, srcY) {
  return checkPossibleSwaps(srcX, srcY, 'white').length;
}

function swapSquares(player, srcX, srcY) {
  const swappedColor = player ? 'white' : 'black';
  const newColor = player ? 'black' : 'white';

  const squaresToSwap = checkPossibleSwaps(srcX, srcY, newColor);

  squaresToSwap.forEach(square => {
    square.classList.remove(swappedColor);
    square.classList.add(newColor);
  });
}

function checkLegalMove(player){
  const currentColor = player ? 'black' : 'white';

  document.querySelectorAll('.black, .white').forEach(square => {
    let element;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        element = document.querySelector(`.square:not(.black):not(.white)[data-x="${parseInt(square.dataset.x) + i}"][data-y="${parseInt(square.dataset.y) + j}"]`);
        if (element != null)
          element.classList.add(`legal-${currentColor}`);
      }
    }
  });
}

function stopClock() {
  clearInterval(clockInterval);

  document.querySelector('.minutes').innerHTML = '00';
  document.querySelector('.seconds').innerHTML = '00';
}

function gameOver(player) {
  stopClock();

  if (!player) {
    winnderField.classList.add('white-text');
  }

  gameOnDiv.style.display = 'none';
  gameOverDiv.style.display = 'block';

  let winningPlayer;

  if (aiMode) {
    winningPlayer = player ? 'Player 1' : 'Computer';
  } else {
    winningPlayer = player ? 'Player 1' : 'Player 2';
  }

  winnderField.innerHTML = `${winningPlayer} wins!`;
  clearLegalMoves();
}

function gameOn() {
  gameOnDiv.style.display = 'block';
  gameOverDiv.style.display = 'none';
  playerField.classList.remove('white-text');
}
