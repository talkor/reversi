const wrapper = document.querySelector('.wrapper');
const playerField = document.querySelector('.player-field')
const m = 8;
const board = [];
const initialPos = [27, 28, 36, 35];
let player1 = true;

init();

function init() {
  renderBoard();
  setPlayerField();
  setSquareClickListener();
  setInitialPos();
  setGameClock();
}

function renderBoard() {
  for (let i = 0; i < m * m; i++) {
    wrapper.innerHTML += `<div class='square'><span class='s-${i}'></span></div>`;
    board.push({
      id: i,
      isBlack: false,
      isSet: false
    });
  }
}

function setSquareClickListener() {
  document.querySelectorAll('.square').forEach(square => {
    square.addEventListener('click', event => {
      console.log(event.target.classList[0].replace('s-', ''));
      square.childNodes[0].classList.remove('black');
      square.childNodes[0].classList.remove('white');
      square.childNodes[0].classList.add(player1 ? 'black' : 'white');
      player1 = !player1;
      
      playerField.innerHTML = player1 ? 'Player 1' : 'Player 2';
    });
  });
}

function setPlayerField() {
  playerField.innerHTML = 'Player 1';
}

function setInitialPos() {
  let addedClass;
  initialPos.forEach(squarePos => {
    addedClass = addedClass === 'white' ? 'black' : 'white';
    document.querySelector(`.square .s-${squarePos}`).classList.add(addedClass);
  });
}

function setGameClock() {
  let minutes = document.querySelector('.minutes');
  let seconds = document.querySelector('.seconds');
  let totalSeconds = 0;
 
  setInterval(() => {
    totalSeconds++;
    minutes.innerHTML = (parseInt(totalSeconds / 60)).toString().padStart(2, '0');
    seconds.innerHTML = (totalSeconds % 60).toString().padStart(2, '0');;
  }, 1000);
}