import * as THREE from "three";
import { projects as PROJECTS } from "./projects.js";

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
/*  Project cards (canvas-composited textures fed by projects.js)      */
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

// Word-wraps text onto the canvas; the last allowed line is ellipsized.
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text).split(" ");
  let line = "";
  let lineCount = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      if (lineCount === maxLines - 1) {
        while (line && ctx.measureText(`${line}...`).width > maxWidth) {
          line = line.slice(0, -1);
        }
        ctx.fillText(`${line}...`, x, y);
        return;
      }
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
      lineCount++;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function createCardTexture(project, index) {
  const { title, description, category } = project;
  const w = 512;
  const h = 640;
  const pad = 22; // transparent margin that holds the drop shadow
  const hue = (project.id * 57) % 360; // stable tint while the image loads
  const ctx = Object.assign(document.createElement("canvas"), {
    width: w,
    height: h,
  }).getContext("2d");

  const imgX = pad + 18;
  const imgY = pad + 18;
  const imgW = w - (pad + 18) * 2;
  const imgH = h * 0.5;

  // The whole card is drawn twice: once immediately with a gradient
  // placeholder, and again once the project image has loaded.
  function draw(image) {
    ctx.clearRect(0, 0, w, h);

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

    // Image area, clipped to rounded corners
    ctx.save();
    roundedRectPath(ctx, imgX, imgY, imgW, imgH, 16);
    ctx.clip();

    if (image) {
      // Cover-fit: fill the slot, cropping whatever overflows
      const scale = Math.max(imgW / image.width, imgH / image.height);
      const dw = image.width * scale;
      const dh = image.height * scale;
      ctx.drawImage(image, imgX + (imgW - dw) / 2, imgY + (imgH - dh) / 2, dw, dh);
    } else {
      // Duotone gradient placeholder (also the fallback if loading fails)
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
    ctx.font = "700 52px Helvetica, Arial, sans-serif";
    ctx.fillText(title.toUpperCase(), textX, imgY + imgH + 64);

    // Description, wrapped to at most three lines
    ctx.fillStyle = "rgba(242, 242, 240, 0.55)";
    ctx.font = "400 21px Helvetica, Arial, sans-serif";
    wrapText(ctx, description, textX, imgY + imgH + 100, w - textX * 2, 29, 3);

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
  }

  draw(null);

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Swap the placeholder for the real project image once it arrives
  if (project.imageUrl) {
    const image = new Image();
    image.crossOrigin = "anonymous"; // required for WebGL to read the pixels
    image.onload = () => {
      draw(image);
      texture.needsUpdate = true;
    };
    image.src = project.imageUrl;
  }

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
  card.userData.baseQuaternion = card.quaternion.clone();
  card.userData.project = project;
  card.userData.index = i;

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
  if (dragging || detailsOpen) return;
  raycaster.setFromCamera(pointerNDC, camera);
  const hit = raycaster.intersectObjects(cards)[0];
  const target = hit ? hit.object : null;
  if (target === hoveredCard) return;
  if (hoveredCard) setHover(hoveredCard, false);
  if (target) setHover(target, true);
  hoveredCard = target;
  canvas.style.cursor = target ? "pointer" : "grab";
}

/* ------------------------------------------------------------------ */
/*  Project details overlay — clicking a card flies it to the center   */
/*  of the screen, the gallery falls away, and the DOM overlay takes   */
/*  over. "Back" plays the whole sequence in reverse.                  */
/* ------------------------------------------------------------------ */

const detailsEl = document.getElementById("details");
const detailsImage = document.getElementById("details-image");
const detailsTitle = document.getElementById("details-title");
const detailsDescription = document.getElementById("details-description");
const detailsTags = document.getElementById("details-tags");
const detailsIndexEl = document.getElementById("details-index");
const detailsLink = document.getElementById("details-link");

let detailsOpen = false;
let transitioning = false;
let activeCard = null;

// Resting opacities to restore when the gallery returns
const GALLERY_OPACITY = {
  dome: dome.material.opacity,
  innerDome: innerDome.material.opacity,
  particles: particles.material.opacity,
};

function populateDetails(project, index) {
  detailsImage.src = project.imageUrl;
  detailsImage.alt = project.title;
  detailsTitle.textContent = project.title;
  detailsDescription.textContent = project.description;
  detailsIndexEl.textContent = String(index + 1).padStart(2, "0");

  detailsTags.innerHTML = "";
  project.category.split(" ").forEach((word) => {
    const tag = document.createElement("span");
    tag.className = "details-tag";
    tag.textContent = word.toUpperCase();
    detailsTags.appendChild(tag);
  });

  detailsLink.style.display = project.link ? "" : "none";
  if (project.link) detailsLink.href = project.link;
}

function openDetails(card) {
  if (detailsOpen || transitioning) return;
  detailsOpen = true;
  transitioning = true;
  activeCard = card;

  populateDetails(card.userData.project, card.userData.index);

  if (hoveredCard) {
    if (hoveredCard !== card) setHover(hoveredCard, false);
    hoveredCard = null;
  }
  // Stop any hover tweens on the clicked card — their overwrite mode
  // would otherwise kill the fly-to-center animation below.
  gsap.killTweensOf([card.position, card.scale, card.material.color]);
  canvas.style.cursor = "grab";

  // Move the card into scene space so it can fly to the camera without
  // being dragged along by the rotating world group.
  scene.attach(card);
  const startQ = card.quaternion.clone();
  const endQ = new THREE.Quaternion(); // identity = squarely facing the camera
  const spin = { t: 0 };

  const tl = gsap.timeline({ onComplete: () => (transitioning = false) });

  // The clicked card flies from the dome wall to the center of the screen
  tl.to(card.position, { x: 0, y: 0, z: -3.4, duration: 0.9, ease: "power3.inOut" }, 0);
  tl.to(spin, {
    t: 1,
    duration: 0.9,
    ease: "power3.inOut",
    onUpdate: () => card.quaternion.slerpQuaternions(startQ, endQ, spin.t),
  }, 0);
  tl.to(card.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.9, ease: "power3.inOut" }, 0);

  // The rest of the gallery falls away
  tl.to(cards.filter((c) => c !== card).map((c) => c.material), { opacity: 0, duration: 0.5, ease: "power2.out" }, 0);
  tl.to([dome.material, innerDome.material, particles.material], { opacity: 0, duration: 0.5 }, 0);
  tl.to([".ui-hero", ".ui-footer"], { opacity: 0, duration: 0.45 }, 0);

  // Hand off to the DOM overlay
  tl.add(() => detailsEl.classList.add("open"), 0.5);
  tl.fromTo(detailsEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.5);
  tl.fromTo(
    [".details-back", ".details-media", ".details-content > *"],
    { y: 26, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: "power3.out" },
    0.62
  );
  tl.to(card.material, { opacity: 0, duration: 0.35 }, 0.75);
}

function closeDetails() {
  if (!detailsOpen || transitioning || !activeCard) return;
  transitioning = true;
  const card = activeCard;

  // Back into the world group; from here "home" is a fixed local spot
  // on the dome wall, however far the dome has rotated meanwhile.
  world.attach(card);
  const startQ = card.quaternion.clone();
  const endQ = card.userData.baseQuaternion;
  const spin = { t: 0 };
  const base = card.userData.basePosition;

  const tl = gsap.timeline({
    onComplete: () => {
      transitioning = false;
      detailsOpen = false;
      activeCard = null;
    },
  });

  // The overlay slips away
  tl.to([".details-back", ".details-media", ".details-content > *"], { opacity: 0, y: 18, duration: 0.35, stagger: 0.03, ease: "power2.in" }, 0);
  tl.to(detailsEl, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0.15);
  tl.add(() => detailsEl.classList.remove("open"), 0.55);

  // The card flies back to its spot on the dome wall
  tl.to(card.material, { opacity: 1, duration: 0.3 }, 0.35);
  tl.to(card.position, { x: base.x, y: base.y, z: base.z, duration: 0.9, ease: "power3.inOut" }, 0.35);
  tl.to(spin, {
    t: 1,
    duration: 0.9,
    ease: "power3.inOut",
    onUpdate: () => card.quaternion.slerpQuaternions(startQ, endQ, spin.t),
  }, 0.35);
  tl.to(card.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "power3.inOut" }, 0.35);

  // And the gallery returns
  tl.to(cards.filter((c) => c !== card).map((c) => c.material), { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.55);
  tl.to(dome.material, { opacity: GALLERY_OPACITY.dome, duration: 0.5 }, 0.55);
  tl.to(innerDome.material, { opacity: GALLERY_OPACITY.innerDome, duration: 0.5 }, 0.55);
  tl.to(particles.material, { opacity: GALLERY_OPACITY.particles, duration: 0.5 }, 0.55);
  tl.to([".ui-hero", ".ui-footer"], { opacity: 1, duration: 0.45 }, 0.6);
}

document.getElementById("details-back").addEventListener("click", closeDetails);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDetails();
});

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

let downPointer = null; // where the pointer went down, to tell clicks from drags

canvas.addEventListener("pointerdown", (e) => {
  if (detailsOpen) return;
  dragging = true;
  canvas.classList.add("dragging");
  lastPointer = { x: e.clientX, y: e.clientY };
  downPointer = { x: e.clientX, y: e.clientY };
  dragVelocityY = 0;
  canvas.setPointerCapture(e.pointerId);
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
canvas.addEventListener("pointerup", (e) => {
  endDrag();

  // A click (not a drag) on a card opens its details page
  if (detailsOpen || !downPointer) return;
  const moved = Math.hypot(e.clientX - downPointer.x, e.clientY - downPointer.y);
  downPointer = null;
  if (moved > 6) return;
  pointerNDC.set(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(pointerNDC, camera);
  const hit = raycaster.intersectObjects(cards)[0];
  if (hit) openDetails(hit.object);
});
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
  if (detailsOpen) return;
  targetY += delta * 0.0022;
  rotateY(targetY);
});

/* ------------------------------------------------------------------ */
/*  Active card counter — which card is in front of the viewer         */
/* ------------------------------------------------------------------ */

const indexEl = document.getElementById("active-index");
document.getElementById("project-total").textContent = String(PROJECTS.length).padStart(2, "0");
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
  if (!dragging && !detailsOpen) targetY += 0.00002 * deltaTime;
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
