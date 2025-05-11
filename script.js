const canvas = document.getElementById("artCanvas");
const ctx = canvas.getContext("2d");
const seedInput = document.getElementById("seedInput");

const TILE_SIZE = canvas.width / 2;
let animationState = null;
let intervalId = null;

seedInput.addEventListener("input", () => {
  startDrawing(seedInput.value.trim());
});

function startDrawing(seed) {
  clearInterval(intervalId);
  document.getElementById("saveButton").style.display = "none";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  animationState = createAnimationState(seed);
  drawNextStep();
  intervalId = setInterval(drawNextStep, 1);
}


function createAnimationState(seed) {
  const rng = new Math.seedrandom(seed);
  const baseHue = Math.floor(rng() * 360);

  const off = document.createElement("canvas");
  off.width = TILE_SIZE;
  off.height = TILE_SIZE;
  const offCtx = off.getContext("2d");

  offCtx.fillStyle = `hsl(${(baseHue + 180) % 360}, 30%, 10%)`;
  offCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  offCtx.strokeStyle = `hsl(${baseHue}, 100%, 70%)`; 
  offCtx.lineWidth = 4;
  offCtx.beginPath();
  offCtx.moveTo(0, TILE_SIZE);

  return {
    rng,
    baseHue,
    off,
    offCtx,
    x: rng() * canvas.width,
    y: rng() * canvas.height,

    hue: baseHue,  
    step: 0,
    maxSteps: 10000
  };
}

function drawNextStep() {
  const s = animationState;
  if (!s || s.step >= s.maxSteps) {
    clearInterval(intervalId);
    console.log("Drawing complete.");
    document.getElementById("saveButton").style.display = "inline-block";
    return;
  }

  const dx = (s.rng() - 0.5) * 40;
  const dy = (s.rng() - 0.5) * 40;

  s.x = Math.max(0, Math.min(canvas.width, s.x + dx));
  s.y = Math.max(0, Math.min(canvas.height, s.y + dy));

  s.hue = (s.hue + 1) % 360;

  console.log(`Step: ${s.step}, x: ${s.x}, y: ${s.y}, dx: ${dx}, dy: ${dy}, hue: ${s.hue}`);

  ctx.beginPath();
  ctx.arc(s.x, s.y, 5, 0, Math.PI * 2, false);
  ctx.fillStyle = `hsl(${s.hue}, 100%, 70%)`;
  ctx.fill();

  s.step++;
}


function renderTiles(original, baseHue) {
  console.log('Rendering tiles');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(original, 0, 0);
  drawTransformed(original, TILE_SIZE, 0, ctx => {
    ctx.translate(TILE_SIZE, 0);
    ctx.scale(-1, 1);
  });
  drawTransformed(original, 0, TILE_SIZE, ctx => {
    ctx.translate(0, TILE_SIZE);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-TILE_SIZE, 0);
  });
  drawTransformed(original, TILE_SIZE, TILE_SIZE, ctx => {
    ctx.translate(TILE_SIZE, TILE_SIZE);
    ctx.scale(1, -1);
    ctx.translate(0, -TILE_SIZE);
  });

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = `hsl(${(baseHue + 90) % 360}, 100%, 60%)`;
  ctx.fillRect(TILE_SIZE, TILE_SIZE, TILE_SIZE, TILE_SIZE);
  ctx.restore();

  document.getElementById("saveButton").style.display = "inline-block";
}

function drawTransformed(image, x, y, transformFn) {
  console.log(`Drawing transformed image at (${x}, ${y})`);
  ctx.save();
  ctx.translate(x, y);
  transformFn(ctx);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

startDrawing("default-seed");

document.getElementById("saveButton").addEventListener("click", () => {
  const link = document.createElement('a');
  link.download = `art_${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
});

