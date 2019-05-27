const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

ctx.scale(20, 20);

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === "I") {
    return [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]];
  } else if (type === "L") {
    return [[0, 2, 0], [0, 2, 0], [0, 2, 2]];
  } else if (type === "J") {
    return [[0, 3, 0], [0, 3, 0], [3, 3, 0]];
  } else if (type === "O") {
    return [[4, 4], [4, 4]];
  } else if (type === "Z") {
    return [[5, 5, 0], [0, 5, 0], [0, 5, 5]];
  } else if (type === "S") {
    return [[0, 6, 6], [0, 6, 0], [6, 6, 0]];
  } else if (type == "T") {
    return [[7, 7, 7], [0, 7, 0], [0, 7, 0]];
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

const arena = createMatrix(22, 30);

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

const player = {
  pos: { x: 5, y: 3 },
  matrix: null
};

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
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
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;

  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(offset) {
  player.pos.x += offset;

  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
}

function playerReset() {
  const pieces = "TJLOSZI";
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
  }
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

let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;

  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  lastTime = time;
  draw();

  requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
  if (e.keyCode === 37) {
    playerMove(-1);
  } else if (e.keyCode === 39) {
    playerMove(1);
  } else if (e.keyCode === 40) {
    playerDrop();
  } else if (e.keyCode === 65) {
    playerRotate(-1);
  } else if (e.keyCode === 83) {
    playerRotate(1);
  }
});

const colors = [
  null,
  "blue",
  "purple",
  "red",
  "yellow",
  "aqua",
  "pink",
  "white"
];

playerReset();
update();
