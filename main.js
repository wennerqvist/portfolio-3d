import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Project data                                                       */
/* ------------------------------------------------------------------ */

const PROJECTS = [
  { title: "Nebula", category: "Interactive Installation", hue: 14 },
  { title: "Drift", category: "WebGL Experience", hue: 210 },
  { title: "Mono", category: "Brand Identity", hue: 45 },
  { title: "Pulse", category: "Audio Visualizer", hue: 280 },
  { title: "Terra", category: "Data Visualization", hue: 150 },
  { title: "Echo", category: "Motion Design", hue: 340 },
];

const DOME_RADIUS = 8; // the wire dome around the viewer
const CARD_DISTANCE = 6.5; // cards float on the dome's inner wall

/* ------------------------------------------------------------------ */
/*  Scene setup — camera sits at the CENTER of the dome                */
/* ------------------------------------------------------------------ */

const canvas = document.getElementById("webgl");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a0a0a, 6, 15);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* ------------------------------------------------------------------ */
/*  Wire dome + particles (seen from the inside)                       */
/* ------------------------------------------------------------------ */

const world = new THREE.Group();
scene.add(world);

// Geodesic wire dome enclosing the camera
const dome = new THREE.LineSegments(
  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(DOME_RADIUS, 3)),
  new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.06,
  })
);
world.add(dome);

// A second, closer wire layer for parallax depth
const innerDome = new THREE.LineSegments(
  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(DOME_RADIUS * 1.35, 2)),
  new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.025,
  })
);
world.add(innerDome);

// Fine dust floating between the camera and the dome wall
const particleCount = 800;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const dir = new THREE.Vector3()
    .randomDirection()
    .multiplyScalar(2 + Math.random() * (DOME_RADIUS - 2));
  particlePositions.set([dir.x, dir.y, dir.z], i * 3);
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);
const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
  })
);
world.add(particles);

/* ------------------------------------------------------------------ */
/*  Project cards (canvas-drawn textures, no external images)          */
/* ------------------------------------------------------------------ */

function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function createCardTexture({ title, category, hue }, index) {
  const w = 512;
  const h = 640;
  const pad = 22; // transparent margin that holds the drop shadow
  const ctx = Object.assign(document.createElement("canvas"), {
    width: w,
    height: h,
  }).getContext("2d");

  // Card body: rounded, floating on a soft shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  roundedRectPath(ctx, pad, pad, w - pad * 2, h - pad * 2, 26);
  ctx.fillStyle = "#161616";
  ctx.fill();
  ctx.restore();

  // Hairline border
  roundedRectPath(ctx, pad, pad, w - pad * 2, h - pad * 2, 26);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // "Image" area: duotone gradient, clipped to rounded corners
  const imgX = pad + 18;
  const imgY = pad + 18;
  const imgW = w - (pad + 18) * 2;
  const imgH = h * 0.52;
  ctx.save();
  roundedRectPath(ctx, imgX, imgY, imgW, imgH, 16);
  ctx.clip();

  const gradient = ctx.createLinearGradient(imgX, imgY, imgX + imgW, imgY + imgH);
  gradient.addColorStop(0, `hsl(${hue}, 68%, 52%)`);
  gradient.addColorStop(1, `hsl(${(hue + 40) % 360}, 55%, 15%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(imgX, imgY, imgW, imgH);

  // Subtle grain
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    ctx.fillRect(imgX + Math.random() * imgW, imgY + Math.random() * imgH, 1.5, 1.5);
  }

  // Dark overlay fading up from the bottom, for meta readability
  const overlay = ctx.createLinearGradient(0, imgY + imgH * 0.45, 0, imgY + imgH);
  overlay.addColorStop(0, "rgba(10, 10, 10, 0)");
  overlay.addColorStop(1, "rgba(10, 10, 10, 0.72)");
  ctx.fillStyle = overlay;
  ctx.fillRect(imgX, imgY, imgW, imgH);

  // Meta on the image: index (top-left) and year (top-right)
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "500 22px 'Courier New', monospace";
  ctx.fillText(String(index + 1).padStart(2, "0"), imgX + 18, imgY + 34);
  const year = "2026";
  ctx.fillText(year, imgX + imgW - 18 - ctx.measureText(year).width, imgY + 34);
  ctx.restore();

  // Title
  const textX = pad + 20;
  ctx.fillStyle = "#f2f2f0";
  ctx.font = "700 58px Helvetica, Arial, sans-serif";
  ctx.fillText(title.toUpperCase(), textX, imgY + imgH + 78);

  // Category, spaced-out caps
  ctx.fillStyle = "rgba(242, 242, 240, 0.4)";
  ctx.font = "400 21px Helvetica, Arial, sans-serif";
  ctx.fillText(category.toUpperCase().split("").join(" "), textX, imgY + imgH + 116);

  // Tag pills, phantom.land style
  let pillX = textX;
  const pillY = h - pad - 58;
  category.split(" ").slice(0, 2).forEach((word) => {
    const label = word.toUpperCase();
    ctx.font = "500 18px 'Courier New', monospace";
    const tw = ctx.measureText(label).width;
    roundedRectPath(ctx, pillX, pillY, tw + 28, 34, 17);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(242, 242, 240, 0.6)";
    ctx.fillText(label, pillX + 14, pillY + 23);
    pillX += tw + 40;
  });

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const cards = [];
PROJECTS.forEach((project, i) => {
  const material = new THREE.MeshBasicMaterial({
    map: createCardTexture(project, i),
    transparent: true,
    color: 0xd8d8d8, // slightly dimmed at rest; hover brightens to full white
  });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(3, 3.75), material);

  // Ring around the viewer, staggered up/down like a wall grid.
  // Card 0 starts directly in front of the camera (-Z).
  const angle = (i / PROJECTS.length) * Math.PI * 2;
  const y = (i % 2 === 0 ? 1 : -1) * 1.4;
  card.position.set(
    Math.sin(angle) * CARD_DISTANCE,
    y,
    -Math.cos(angle) * CARD_DISTANCE
  );
  card.lookAt(0, 0, 0); // face the viewer at the center
  card.userData.basePosition = card.position.clone();

  world.add(card);
  cards.push(card);
});

/* ------------------------------------------------------------------ */
/*  Hover: card scales up, brightens, and floats toward the viewer     */
/* ------------------------------------------------------------------ */

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let hoveredCard = null;

function setHover(card, active) {
  const base = card.userData.basePosition;
  gsap.to(card.scale, {
    x: active ? 1.07 : 1,
    y: active ? 1.07 : 1,
    z: active ? 1.07 : 1,
    duration: 0.5,
    ease: "power3.out",
    overwrite: "auto",
  });
  // Lift slightly off the wall, toward the center
  gsap.to(card.position, {
    x: base.x * (active ? 0.94 : 1),
    y: base.y * (active ? 0.94 : 1),
    z: base.z * (active ? 0.94 : 1),
    duration: 0.5,
    ease: "power3.out",
    overwrite: "auto",
  });
  // Glow: brighten the texture tint
  gsap.to(card.material.color, {
    r: active ? 1.35 : 0.847,
    g: active ? 1.35 : 0.847,
    b: active ? 1.35 : 0.847,
    duration: 0.5,
    ease: "power3.out",
    overwrite: "auto",
  });
}

canvas.addEventListener("pointermove", (e) => {
  pointerNDC.set(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
});

function updateHover() {
  if (dragging) return;
  raycaster.setFromCamera(pointerNDC, camera);
  const hit = raycaster.intersectObjects(cards)[0];
  const target = hit ? hit.object : null;
  if (target === hoveredCard) return;
  if (hoveredCard) setHover(hoveredCard, false);
  if (target) setHover(target, true);
  hoveredCard = target;
}

/* ------------------------------------------------------------------ */
/*  Rotation: drag + Lenis scroll, eased through GSAP                  */
/*  Dragging pulls the dome wall with the cursor — like turning        */
/*  your head while standing inside.                                   */
/* ------------------------------------------------------------------ */

const rotation = { x: 0, y: 0 };
// quickTo gives every rotation change the same smooth GSAP easing
const rotateY = gsap.quickTo(rotation, "y", { duration: 1.4, ease: "power3.out" });
const rotateX = gsap.quickTo(rotation, "x", { duration: 1.4, ease: "power3.out" });

let targetY = 0;
let targetX = 0;
const X_LIMIT = Math.PI / 4;

// --- Drag ---
const DRAG_SENSITIVITY = 0.95; // full screen-width swipe ≈ a third of a turn
let dragging = false;
let lastPointer = { x: 0, y: 0 };
let dragVelocityY = 0; // smoothed, so a single jittery event can't spike inertia

canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  canvas.classList.add("dragging");
  canvas.setPointerCapture(e.pointerId);
  lastPointer = { x: e.clientX, y: e.clientY };
  dragVelocityY = 0;
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = (e.clientX - lastPointer.x) / window.innerWidth;
  const dy = (e.clientY - lastPointer.y) / window.innerHeight;
  lastPointer = { x: e.clientX, y: e.clientY };

  // Inverted vs. an exterior view: the wall follows the cursor
  const stepY = -dx * Math.PI * DRAG_SENSITIVITY;
  targetY += stepY;
  targetX = THREE.MathUtils.clamp(targetX - dy * Math.PI * 0.55, -X_LIMIT, X_LIMIT);

  // Exponential moving average of the release velocity
  dragVelocityY = dragVelocityY * 0.7 + stepY * 0.3;

  rotateY(targetY);
  rotateX(targetX);
});

const endDrag = () => {
  if (!dragging) return;
  dragging = false;
  canvas.classList.remove("dragging");

  // Momentum: the release velocity carries the view onward, and the
  // long power3 ease in rotateY lets it glide smoothly to a stop.
  targetY += dragVelocityY * 14;
  rotateY(targetY);
};
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

// --- Lenis: wheel / touch scrolling pans the view with smooth easing ---
const lenis = new Lenis({
  infinite: true,
  lerp: 0.09,
  smoothWheel: true,
});

let lastScroll = 0;
lenis.on("scroll", ({ scroll }) => {
  const delta = scroll - lastScroll;
  lastScroll = scroll;
  targetY += delta * 0.0022;
  rotateY(targetY);
});

/* ------------------------------------------------------------------ */
/*  Active card counter — which card is in front of the viewer         */
/* ------------------------------------------------------------------ */

const indexEl = document.getElementById("active-index");
const viewDirection = new THREE.Vector3(0, 0, -1); // camera looks down -Z
const worldPos = new THREE.Vector3();
let currentIndex = -1;

function updateActiveCard() {
  let best = -Infinity;
  let bestIndex = 0;
  cards.forEach((card, i) => {
    card.getWorldPosition(worldPos);
    const facing = worldPos.normalize().dot(viewDirection);
    if (facing > best) {
      best = facing;
      bestIndex = i;
    }
  });
  if (bestIndex !== currentIndex) {
    currentIndex = bestIndex;
    indexEl.textContent = String(bestIndex + 1).padStart(2, "0");
  }
}

/* ------------------------------------------------------------------ */
/*  Intro animation — the dome "opens up" around you                   */
/* ------------------------------------------------------------------ */

const fovTween = { fov: 95 };
gsap.to(fovTween, {
  fov: 60,
  duration: 1.8,
  ease: "power3.out",
  onUpdate: () => {
    camera.fov = fovTween.fov;
    camera.updateProjectionMatrix();
  },
});
gsap.from(".ui-hero h1", { yPercent: 40, opacity: 0, duration: 1.2, ease: "power3.out", delay: 0.3 });
gsap.from(".subtitle, .ui-footer, .ui-header", { opacity: 0, duration: 1, delay: 0.8 });

/* ------------------------------------------------------------------ */
/*  Render loop (GSAP ticker drives Lenis + Three)                     */
/* ------------------------------------------------------------------ */

gsap.ticker.add((time, deltaTime) => {
  lenis.raf(time * 1000);

  // Slow idle pan so the scene never feels static (time-based, so the
  // speed is identical at any frame rate)
  if (!dragging) targetY += 0.00002 * deltaTime;
  rotateY(targetY);

  world.rotation.y = rotation.y;
  world.rotation.x = rotation.x;

  // The inner wire layer drifts slightly for parallax
  innerDome.rotation.y = -rotation.y * 0.15;

  updateHover();
  updateActiveCard();
  renderer.render(scene, camera);
});
gsap.ticker.lagSmoothing(0);

/* ------------------------------------------------------------------ */
/*  Resize                                                             */
/* ------------------------------------------------------------------ */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
