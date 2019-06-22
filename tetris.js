const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const nextPieceCanvas = document.getElementById("next-piece");
const ctx = nextPieceCanvas.getContext("2d");

ctx.scale(20, 20);
context.scale(20, 20);

function createArena(w, h) {
  const arena = [];
  while (h--) {
    arena.push(new Array(w).fill(0));
  }
  return arena;
}

function createPiece(type) {
  if (type === "I") {
    return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
  } else if (type === "L") {
    return [[0, 2, 0], [0, 2, 0], [0, 2, 2]];
  } else if (type === "J") {
    return [[0, 3, 0], [0, 3, 0], [3, 3, 0]];
  } else if (type === "O") {
    return [[4, 4], [4, 4]];
  } else if (type === "Z") {
    return [[5, 5, 0], [0, 5, 5], [0, 0, 0]];
  } else if (type === "S") {
    return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
  } else if (type === "T") {
    return [[0, 7, 0], [7, 7, 7], [0, 0, 0]];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
  drawNextMatrix(player.upcomingBlocks[0], { x: 2.5, y: 2 });
}

function drawNextMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerBlock();
    clearBlocks();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(offset) {
  player.pos.x += offset;
  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
}

function playerBlock() {
  const pieces = "TJLOSZI";
  while (player.upcomingBlocks.length < 3) {
    player.upcomingBlocks.push(
      createPiece(pieces[(pieces.length * Math.random()) | 0])
    );
  }
  player.matrix = player.upcomingBlocks.shift();

  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  if (collide(arena, player)) {
    resetGame();
    document.getElementById("start").disabled = false;
    gameOverModal();
  }
}

let overlay = document.getElementById("body");
let modal = document.getElementsByClassName("modal");
let header = document.getElementById("exampleModalCenterTitle");
let body = document.getElementsByClassName("modal-body");
let modalDiv = document.getElementById("exampleModalCenter");

function gameOverModal() {
  overlay.classList.add("modal-open");
  modal[0].style.display = "block";
  header.innerText = "Game Over";
  modalDiv.setAttribute("aria-hidden", "false");
  modalDiv.classList.add("show");
  body[0].innerText = "Play Again?";
}

function resetModal() {
  overlay.classList.remove("modal-open");
  modal[0].style.display = "none";
  modalDiv.setAttribute("aria-hidden", "true");
  modalDiv.classList.remove("show");
  header.innerText = "How To Play";
  body[0].innerText = "";

  let p1 = document.createElement("p");
  let p2 = document.createElement("p");
  let p3 = document.createElement("p");

  p1.innerText = "- Use the arrow keys to move left or right.";
  p2.innerText = "- Press down to speed up descent.";
  p3.innerText = "- Rotate left or right by pressing 'q' or 'w'.";

  body[0].appendChild(p1);
  body[0].appendChild(p2);
  body[0].appendChild(p3);
}

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  resetModal();
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  resetModal();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modalDiv) {
    resetModal();
  }
};

function resetGame() {
  arena.forEach(row => row.fill(0));
  player.matrix = null;
  player.score = 0;
  player.level = 0;
  dropInterval = 1000;
  updateScore();
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let levelSize = 100;
let levelSpeedIncrease = 100;
let paused = false;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval && !paused) {
    playerDrop();
  }

  lastTime = time;

  draw();

  requestAnimationFrame(update);
}

function updateScore() {
  if (player.score >= levelSize) {
    player.level++;

    levelSize += 100;
    level++;
    dropInterval -= levelSpeedIncrease;
  }
  document.getElementById("score").innerText = player.score;
  document.getElementById("level").innerText = player.level;
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  };
  this.stop = function() {
    this.sound.pause();
  };
}

let sounds;
let whoosh;
let hold = document.getElementById("hold");
function start() {
  playerBlock();
  updateScore();
  update();
  document.getElementById("start").disabled = true;

  sounds = new sound("./sounds/block-rotate.mp3");
  whoosh = new sound("./sounds/line-removal4.mp3");
}

function clearBlocks() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);

    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;

    rowCount *= 2;
    whoosh.play();
  }
}

function pause() {
  paused = true;
}

function resume() {
  paused = false;
  update();
}

function reset() {
  this.resetGame();

  document.getElementById("start").disabled = false;
}

document.addEventListener("keydown", event => {
  if (event.keyCode === 37) {
    playerMove(-1);
  } else if (event.keyCode === 39) {
    playerMove(1);
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    sounds.play();
    playerRotate(-1);
  } else if (event.keyCode === 87) {
    sounds.play();
    playerRotate(1);
  }
});

document.addEventListener("click", event => {
  let start = document.getElementById("start");
  let pause = document.getElementById("pause");
  let resume = document.getElementById("resume");
  let reset = document.getElementById("reset");
  let music = document.getElementById("music");
  let bgMusic = document.getElementById("bg-music");

  if (event.target === start) {
    this.start();
    bgMusic.play();
  } else if (event.target === pause) {
    this.pause();
    pause.innerText = "Resume";
    pause.id = "resume";
    bgMusic.pause();
  } else if (event.target === resume) {
    resume.innerText = "Pause";
    resume.id = "pause";
    this.resume();
    bgMusic.play();
  } else if (event.target === reset) {
    this.reset();
    bgMusic.play();
    if (paused === true) {
      resume.innerText = "Pause";
      resume.id = "pause";
    }

    this.resume();
  } else if (event.target === music) {
    if (music.innerText === "Music Off") {
      bgMusic.pause();
      music.innerText = "Music On";
    } else {
      music.innerText = "Music Off";
      bgMusic.play();
    }
  }
});

const colors = [
  null,
  "purple",
  "yellow",
  "pink",
  "blue",
  "aqua",
  "green",
  "red"
];

const arena = createArena(12, 20);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  upcomingBlocks: [],
  score: 0,
  level: 0
};
