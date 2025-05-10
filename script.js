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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  animationState = createAnimationState(seed);
  drawNextStep(); // draw first step immediately
  intervalId = setInterval(drawNextStep, 1); // draw a new step every 1 second
}

function createAnimationState(seed) {
  const rng = new Math.seedrandom(seed);
  const baseHue = Math.floor(rng() * 360);

  const off = document.createElement("canvas");
  off.width = TILE_SIZE;
  off.height = TILE_SIZE;
  const offCtx = off.getContext("2d");

  // Set a high contrast background and stroke color
  offCtx.fillStyle = `hsl(${(baseHue + 180) % 360}, 30%, 10%)`;  // Dark background
  offCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  offCtx.strokeStyle = `hsl(${baseHue}, 100%, 70%)`;  // Line color (bright, visible)
  offCtx.lineWidth = 4;  // Increased line width for better visibility
  offCtx.beginPath();
  offCtx.moveTo(0, TILE_SIZE);

  return {
    rng,
    baseHue,
    off,
    offCtx,
    x: Math.random() * canvas.width, // Start at a random position on the canvas
    y: Math.random() * canvas.height,
    hue: baseHue,  // Store the initial hue
    step: 0,
    maxSteps: 10000
  };
}

function drawNextStep() {
  const s = animationState;
  if (!s || s.step >= s.maxSteps) {
    clearInterval(intervalId);
    renderTiles(s.off, s.hue);
    return;
  }

  const dx = (s.rng() - 0.5) * 40;  // Random x movement
  const dy = (s.rng() - 0.5) * 40;  // Random y movement (up and down)

  // Update position with free movement within the canvas
  s.x = Math.max(0, Math.min(canvas.width, s.x + dx));
  s.y = Math.max(0, Math.min(canvas.height, s.y + dy));

  // Change color by modifying the hue slightly every step
  s.hue = (s.hue + 1) % 360;  // Change hue by 1 degree, wrapping around at 360

  // Log the current state for debugging
  console.log(`Step: ${s.step}, x: ${s.x}, y: ${s.y}, dx: ${dx}, dy: ${dy}, hue: ${s.hue}`);

  // Use circles to show movement at each step
  ctx.beginPath();
  ctx.arc(s.x, s.y, 5, 0, Math.PI * 2, false);  // Draw circle for each step
  ctx.fillStyle = `hsl(${s.hue}, 100%, 70%)`; // Circle color changes with hue
  ctx.fill();  // Fill the circle at the current position

  s.step++;  // Increment step
}

function renderTiles(original, baseHue) {
  console.log('Rendering tiles');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Top-left: original
  ctx.drawImage(original, 0, 0);

  // Top-right: flipped horizontally
  drawTransformed(original, TILE_SIZE, 0, ctx => {
    ctx.translate(TILE_SIZE, 0);
    ctx.scale(-1, 1);
  });

  // Bottom-left: rotated 90°
  drawTransformed(original, 0, TILE_SIZE, ctx => {
    ctx.translate(0, TILE_SIZE);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-TILE_SIZE, 0);
  });

  // Bottom-right: mirrored vertically + color overlay
  drawTransformed(original, TILE_SIZE, TILE_SIZE, ctx => {
    ctx.translate(TILE_SIZE, TILE_SIZE);
    ctx.scale(1, -1);
    ctx.translate(0, -TILE_SIZE);
  });

  // Add a subtle color overlay to the bottom-right
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = `hsl(${(baseHue + 90) % 360}, 100%, 60%)`; // Color overlay (lighter)
  ctx.fillRect(TILE_SIZE, TILE_SIZE, TILE_SIZE, TILE_SIZE);  // Bottom-right tile overlay
  ctx.restore();
}

function drawTransformed(image, x, y, transformFn) {
  console.log(`Drawing transformed image at (${x}, ${y})`);
  ctx.save();
  ctx.translate(x, y);
  transformFn(ctx);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

// Initial draw
startDrawing("default-seed");
