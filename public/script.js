const wrapper = document.querySelector('.wrapper');
const m = 8;
const board = new Array(m * m);

init();

function init() {
  for (let i = 0; i < m * m; i++) {
    wrapper.innerHTML += `<div class='square'><span class='s-${i}'></span></div>`;
  }

  document.querySelectorAll('.square').forEach(square => {
    square.addEventListener('click', event => {

        console.log(event.target.classList[0].replace('s-', ''));
    
      square.childNodes[0].classList.add('black');
    });
  });
}
