import * as THREE from "three";
import { projects as PROJECTS, TAG_COLORS } from "./projects.js";

function toSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")    // strip combining diacritics (é → e)
    .replace(/[øØ]/g, "o")              // Nordic chars NFD doesn't decompose
    .replace(/[åÅ]/g, "a")
    .replace(/[æÆ]/g, "ae")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DOME_RADIUS = 8; // the wire dome around the viewer
const CARD_DISTANCE = 5.0; // cards float on the dome's inner wall

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
    const year = String(project.year || 2026);
    ctx.fillText(year, imgX + imgW - 18 - ctx.measureText(year).width, imgY + 34);
    ctx.restore();

    // Title — shrink to fit the card width; names still too long at the
    // minimum size wrap onto a second line (and trade one description line)
    const textX = pad + 20;
    const titleMaxW = w - textX * 2;
    ctx.fillStyle = "#f2f2f0";
    let titleSize = 52;
    ctx.font = `700 ${titleSize}px Helvetica, Arial, sans-serif`;
    while (titleSize > 34 && ctx.measureText(title.toUpperCase()).width > titleMaxW) {
      titleSize -= 2;
      ctx.font = `700 ${titleSize}px Helvetica, Arial, sans-serif`;
    }

    let descY = imgY + imgH + 100;
    let descMaxLines = 3;
    if (ctx.measureText(title.toUpperCase()).width > titleMaxW) {
      ctx.font = "700 30px Helvetica, Arial, sans-serif";
      wrapText(ctx, title.toUpperCase(), textX, imgY + imgH + 56, titleMaxW, 36, 2);
      descY = imgY + imgH + 126;
      descMaxLines = 2;
    } else {
      ctx.fillText(title.toUpperCase(), textX, imgY + imgH + 64);
    }

    // Description, wrapped to at most three lines
    ctx.fillStyle = "rgba(242, 242, 240, 0.55)";
    ctx.font = "400 21px Helvetica, Arial, sans-serif";
    wrapText(ctx, description, textX, descY, w - textX * 2, 29, descMaxLines);

    // Tag pills, phantom.land style
    let pillX = textX;
    const pillY = h - pad - 58;
    (project.tags || []).forEach((tag) => {
      const label = tag.toUpperCase();
      const color = TAG_COLORS[tag] || "#ffffff";
      ctx.font = "500 18px 'Courier New', monospace";
      const tw = ctx.measureText(label).width;
      roundedRectPath(ctx, pillX, pillY, tw + 28, 34, 17);
      ctx.fillStyle = hexToRgba(color, 0.2);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(color, 0.7);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
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
  if (dragging || detailsOpen || currentPage !== "work") return;
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
const detailsHeroBanner = document.getElementById("details-hero-banner");
const detailsBannerImage = document.getElementById("details-banner-image");
const detailsStatsStrip = document.getElementById("details-stats-strip");
const detailsImage = document.getElementById("details-image");
const detailsTitle = document.getElementById("details-title");
const detailsDescription = document.getElementById("details-description");
const detailsTags = document.getElementById("details-tags");
const detailsIndexEl = document.getElementById("details-index");
const detailsYearEl = document.getElementById("details-year");
const detailsAward = document.getElementById("details-award");
const detailsLink = document.getElementById("details-link");
const detailsCaseSection = document.getElementById("details-case-section");
const detailsCaseLabel = document.getElementById("details-case-label");
const detailsCase = document.getElementById("details-case");
const detailsKpiSection = document.getElementById("details-kpi-section");
const detailsKpiLabel = document.getElementById("details-kpi-label");
const detailsKpis = document.getElementById("details-kpis");
const detailsVideoSection = document.getElementById("details-video-section");
const detailsVideo = document.getElementById("details-video");
const detailsPdfSection = document.getElementById("details-pdf-section");
const detailsPdfContainer = document.getElementById("details-pdf");
const detailsPdfStatus = document.getElementById("details-pdf-status");
const detailsPdfOpen = document.getElementById("details-pdf-open");
const detailsPublisher = document.getElementById("details-publisher");
const detailsPublisherLogo = document.getElementById("details-publisher-logo");
const detailsPublisherName = document.getElementById("details-publisher-name");
const detailsGallerySection = document.getElementById("details-gallery-section");
const detailsGallery = document.getElementById("details-gallery");
const detailsReviewsSection = document.getElementById("details-reviews-section");
const detailsReviews = document.getElementById("details-reviews");
const detailsReviewsMore = document.getElementById("details-reviews-more");
const detailsSpotifySection = document.getElementById("details-spotify-section");
const detailsSpotify = document.getElementById("details-spotify");
const detailsPlayerStats = document.getElementById("details-player-stats");
const detailsStatsList = document.getElementById("details-stats-list");
const detailsVideoLabel = document.getElementById("details-video-label");

/* --- Case study: light markup from plain text. Blank lines separate
       blocks; "Label:" (with optional inline text) becomes a heading,
       "- " lines become bullets, everything else a paragraph. --- */

function renderCaseStudy(text, sectionImages) {
  detailsCase.innerHTML = "";
  text.trim().split(/\n\s*\n/).forEach((block) => {
    let lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const headingMatch = lines[0].match(/^([^:]+):\s*(.*)$/);
    let headingText = null;
    if (headingMatch) {
      headingText = headingMatch[1];
      lines = headingMatch[2] ? [headingMatch[2], ...lines.slice(1)] : lines.slice(1);
    }

    const images = headingText && sectionImages && sectionImages[headingText];
    let textContainer;

    if (images) {
      const card = document.createElement("div");
      card.className = "exp-card";
      const imgCol = document.createElement("div");
      imgCol.className = "exp-images";
      images.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = headingText;
        img.loading = "lazy";
        const isPng = src.toLowerCase().endsWith(".png");
        img.className = isPng ? "exp-img exp-img--logo" : "exp-img";
        img.style.objectFit = isPng ? "contain" : "cover";
        if (src.includes("npu-first-game-back")) img.style.objectPosition = "center bottom";
        imgCol.appendChild(img);
      });
      textContainer = document.createElement("div");
      textContainer.className = "exp-text";
      card.append(imgCol, textContainer);
      detailsCase.appendChild(card);
    } else {
      textContainer = detailsCase;
    }

    if (headingText) {
      const h = document.createElement("h4");
      h.textContent = headingText;
      textContainer.appendChild(h);
    }

    const paragraphs = lines.filter((l) => !l.startsWith("- "));
    if (paragraphs.length) {
      const p = document.createElement("p");
      p.textContent = paragraphs.join(" ");
      textContainer.appendChild(p);
    }

    const bullets = lines.filter((l) => l.startsWith("- "));
    if (bullets.length) {
      const ul = document.createElement("ul");
      bullets.forEach((b) => {
        const li = document.createElement("li");
        li.textContent = b.slice(2);
        ul.appendChild(li);
      });
      textContainer.appendChild(ul);
    }
  });
}

/* --- Slide-deck viewer: PDF.js is loaded from CDN on first use, and
       each page is rendered to a canvas inside a scrollable column --- */

let pdfJsPromise = null;
function loadPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      };
      script.onerror = () => {
        pdfJsPromise = null;
        reject(new Error("Failed to load PDF.js"));
      };
      document.head.appendChild(script);
    });
  }
  return pdfJsPromise;
}

let renderedPdfUrl = null; // rendered canvases are kept across open/close
let pdfRenderToken = 0; // invalidates an in-flight render when a new one starts

async function renderPdf(url) {
  if (renderedPdfUrl === url) return;
  const token = ++pdfRenderToken;
  renderedPdfUrl = url;
  detailsPdfContainer.querySelectorAll("canvas").forEach((c) => c.remove());
  detailsPdfStatus.hidden = false;
  detailsPdfStatus.textContent = "Loading deck…";

  try {
    const pdfjs = await loadPdfJs();
    const doc = await pdfjs.getDocument(url).promise;
    if (token !== pdfRenderToken) return;

    // The overlay may still be display:none here, so the slide width is
    // derived from the layout constants instead of measured from the DOM
    // (.details-body caps at 1120px, minus overlay + viewer padding).
    const cssWidth = Math.max(320, Math.min(1120, window.innerWidth - 80) - 32);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      if (token !== pdfRenderToken) return;
      const viewport = page.getViewport({
        scale: (cssWidth / page.getViewport({ scale: 1 }).width) * dpr,
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      detailsPdfContainer.appendChild(canvas);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      if (token !== pdfRenderToken) return;
      detailsPdfStatus.hidden = true; // first page is enough to hide the loader
    }
  } catch (err) {
    if (token !== pdfRenderToken) return;
    renderedPdfUrl = null;
    detailsPdfStatus.hidden = false;
    detailsPdfStatus.innerHTML =
      `Couldn't load the deck — <a href="${url}" target="_blank" rel="noopener">open the PDF directly</a>`;
  }
}

let detailsOpen = false;
let transitioning = false;
let activeCard = null;
let detailsTl = null; // live open/close timeline, killable by page navigation

// The overlay gets its own Lenis instance so long case studies / decks
// scroll with the same easing as the gallery. The window Lenis still
// receives wheel events over the overlay, but its scroll handler
// ignores them while the details are open.
const detailsLenis = new Lenis({
  wrapper: detailsEl,
  content: detailsEl.querySelector(".details-body"),
  lerp: 0.09,
  smoothWheel: true,
});

// Resting opacities to restore when the gallery returns
const GALLERY_OPACITY = {
  dome: dome.material.opacity,
  innerDome: innerDome.material.opacity,
  particles: particles.material.opacity,
};

function populateDetails(project, index) {
  const isBanner = project.heroLayout === "banner";
  detailsEl.classList.toggle("football-layout", isBanner);

  detailsHeroBanner.hidden = true;
  detailsBannerImage.src = "";
  detailsImage.closest(".details-media").hidden = !project.imageUrl;
  detailsImage.src = project.imageUrl || "";
  detailsImage.alt = project.title;
  detailsTitle.textContent = project.title;
  // Single very long words (e.g. "WorldLangAmerica") can't wrap and would
  // overflow the column at the default title size
  const longestWord = Math.max(...project.title.split(/\s+/).map((w) => w.length));
  detailsTitle.classList.toggle("long-title", longestWord > 12);
  detailsDescription.textContent = project.description;
  detailsIndexEl.textContent = String(index + 1).padStart(2, "0");
  detailsYearEl.textContent = String(project.year || 2026);

  detailsAward.hidden = !project.award;
  detailsAward.textContent = project.award ? `★ ${project.award}` : "";

  detailsTags.innerHTML = "";
  (project.tags || []).forEach((tag) => {
    const el = document.createElement("span");
    el.className = "details-tag";
    el.textContent = tag.toUpperCase();
    const color = TAG_COLORS[tag] || "#ffffff";
    el.style.backgroundColor = hexToRgba(color, 0.15);
    el.style.borderColor = hexToRgba(color, 0.5);
    el.style.color = color;
    detailsTags.appendChild(el);
  });

  const hasStats = Boolean(project.stats && project.stats.length);
  // Banner projects use the horizontal stats strip; others use the side card
  detailsPlayerStats.hidden = !hasStats || isBanner;
  detailsStatsStrip.hidden = !(isBanner && hasStats);
  if (hasStats) {
    if (isBanner) {
      detailsStatsStrip.innerHTML = "";
      project.stats.forEach(({ label, value }) => {
        const item = document.createElement("div");
        item.className = "details-stats-item";
        const val = document.createElement("div");
        val.className = "details-stats-val";
        val.textContent = value;
        const lbl = document.createElement("div");
        lbl.className = "details-stats-lbl";
        lbl.textContent = label;
        item.append(val, lbl);
        detailsStatsStrip.appendChild(item);
      });
    } else {
      detailsStatsList.innerHTML = "";
      project.stats.forEach(({ label, value }) => {
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value;
        detailsStatsList.append(dt, dd);
      });
    }
  }

  // Hide "Visit project" when it would only duplicate the embedded video
  const linkIsEmbedded =
    project.link && project.youtubeId && project.link.includes(project.youtubeId);
  detailsLink.style.display = project.link && !linkIsEmbedded ? "" : "none";
  if (project.link) detailsLink.href = project.link;
  detailsLink.textContent = `${project.linkLabel || "Visit project"} ↗`;
  detailsLink.classList.toggle("primary", Boolean(project.linkLabel));

  detailsPublisher.hidden = !project.publisherLogo;
  if (project.publisherLogo) {
    detailsPublisherLogo.src = project.publisherLogo;
    detailsPublisherName.textContent = project.publisherName || "";
  }

  detailsLenis.scrollTo(0, { immediate: true, force: true });

  // Optional long-form case study + media embeds
  detailsCaseSection.hidden = !project.fullDescription;
  if (project.fullDescription) {
    detailsCaseLabel.textContent = project.caseLabel || "Case Study";
    renderCaseStudy(project.fullDescription, project.sectionImages);
  }

  const hasKpis = Boolean(project.kpis && project.kpis.length);
  detailsKpiSection.hidden = !hasKpis;
  if (hasKpis) {
    detailsKpiLabel.textContent = project.kpiLabel || "Results";
    detailsKpis.innerHTML = "";
    project.kpis.forEach(({ value, label }) => {
      const card = document.createElement("div");
      card.className = "kpi-card";
      const v = document.createElement("span");
      v.className = "kpi-value";
      v.textContent = value;
      const l = document.createElement("span");
      l.className = "kpi-label";
      l.textContent = label;
      card.append(v, l);
      detailsKpis.appendChild(card);
    });
  }

  detailsVideoSection.hidden = !project.youtubeId;
  detailsVideoLabel.textContent = project.videoLabel || "Campaign Film";
  detailsVideo.src = project.youtubeId
    ? `https://www.youtube-nocookie.com/embed/${project.youtubeId}?rel=0`
    : "";

  detailsSpotifySection.hidden = project.type !== "spotify";
  detailsSpotify.src = project.type === "spotify"
    ? `https://open.spotify.com/embed/episode/${project.episodeId}/video?utm_source=generator&t=430`
    : "";

  detailsPdfSection.hidden = !project.pdfUrl;
  if (project.pdfUrl) {
    detailsPdfOpen.href = project.pdfUrl;
    renderPdf(project.pdfUrl);
  }

  const hasGallery = Boolean(project.gallery && project.gallery.length);
  detailsGallerySection.hidden = !hasGallery;
  if (hasGallery) {
    detailsGallery.innerHTML = "";
    project.gallery.forEach(({ label, images }) => {
      const group = document.createElement("div");
      group.className = "gallery-group";
      const h = document.createElement("h3");
      h.className = "extra-label";
      h.textContent = label;
      const grid = document.createElement("div");
      grid.className = "gallery-grid";
      images.forEach((src) => {
        const item = document.createElement("div");
        item.className = "gallery-item";
        const img = document.createElement("img");
        img.src = src;
        img.alt = label;
        img.loading = "lazy";
        item.appendChild(img);
        grid.appendChild(item);
      });
      group.append(h, grid);
      detailsGallery.appendChild(group);
    });
  }

  const hasReviews = Boolean(project.reviews && project.reviews.length);
  detailsReviewsSection.hidden = !hasReviews;
  if (hasReviews) {
    detailsReviews.innerHTML = "";
    project.reviews.forEach(({ stars, quote, author }) => {
      const card = document.createElement("figure");
      card.className = "review-card";
      if (stars) {
        const s = document.createElement("div");
        s.className = "review-stars";
        s.textContent = "★".repeat(stars) + "☆".repeat(Math.max(0, 5 - stars));
        s.setAttribute("aria-label", `${stars} out of 5 stars`);
        card.appendChild(s);
      }
      const q = document.createElement("blockquote");
      q.textContent = quote;
      card.appendChild(q);
      if (author) {
        const cap = document.createElement("figcaption");
        cap.textContent = `— ${author}`;
        card.appendChild(cap);
      }
      detailsReviews.appendChild(card);
    });
    detailsReviewsMore.hidden = !project.reviewsLink;
    if (project.reviewsLink) detailsReviewsMore.href = project.reviewsLink;
  }
}

function openDetails(card) {
  if (detailsOpen || transitioning) return;
  detailsOpen = true;
  transitioning = true;
  activeCard = card;
  history.replaceState(null, "", `#${toSlug(card.userData.project.title)}`);

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

  const tl = (detailsTl = gsap.timeline({ onComplete: () => (transitioning = false) }));

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

  // Hand off to the DOM overlay (scroll reset must happen after the
  // overlay is display:block, or the browser drops it)
  tl.add(() => {
    detailsEl.classList.add("open");
    detailsLenis.scrollTo(0, { immediate: true, force: true });
  }, 0.5);
  tl.fromTo(detailsEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.5);
  tl.fromTo(
    [".details-back", ".details-media", ".details-content > *", ".details-extra"],
    { y: 26, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: "power3.out" },
    0.62
  );
  tl.to(card.material, { opacity: 0, duration: 0.35 }, 0.75);
}

function closeDetails() {
  if (!detailsOpen || transitioning || !activeCard) return;
  transitioning = true;
  history.replaceState(null, "", "#work");
  const card = activeCard;

  // Back into the world group; from here "home" is a fixed local spot
  // on the dome wall, however far the dome has rotated meanwhile.
  world.attach(card);
  const startQ = card.quaternion.clone();
  const endQ = card.userData.baseQuaternion;
  const spin = { t: 0 };
  const base = card.userData.basePosition;

  const tl = (detailsTl = gsap.timeline({
    onComplete: () => {
      transitioning = false;
      detailsOpen = false;
      activeCard = null;
    },
  }));

  // The overlay slips away (campaign film and podcast player stop)
  detailsVideo.src = "";
  detailsSpotify.src = "";
  tl.to([".details-back", ".details-media", ".details-content > *", ".details-extra"], { opacity: 0, y: 18, duration: 0.35, stagger: 0.03, ease: "power2.in" }, 0);
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

// Debug helper: open a project's details from the console, e.g. __openProject(6)
window.__openProject = (i) => cards[i] && openDetails(cards[i]);

document.getElementById("details-back").addEventListener("click", closeDetails);
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (detailsOpen) closeDetails();
  else if (currentPage !== "work") goToPage("work");
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

// Touch devices drag the globe directly; scroll-driven rotation is desktop-only
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
if (isCoarsePointer) {
  document.querySelector(".hint").textContent = "Drag to explore";
}

// --- Drag ---
const DRAG_SENSITIVITY = 0.95; // full screen-width swipe ≈ a third of a turn
let dragging = false;
let lastPointer = { x: 0, y: 0 };
let dragVelocityY = 0; // smoothed, so a single jittery event can't spike inertia
let dragIsTouch = false;

let downPointer = null; // where the pointer went down, to tell clicks from drags

canvas.addEventListener("pointerdown", (e) => {
  if (detailsOpen || currentPage !== "work") return;
  dragging = true;
  dragIsTouch = e.pointerType === "touch";
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
  // Finger flicks report higher per-event velocities than mouse drags,
  // so touch gets a gentler multiplier to avoid overshooting.
  targetY += dragVelocityY * (dragIsTouch ? 8 : 14);
  rotateY(targetY);
};
canvas.addEventListener("pointerup", (e) => {
  endDrag();

  // A click (not a drag) on a card opens its details page
  if (detailsOpen || currentPage !== "work" || !downPointer) return;
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
  // Touch devices rotate by dragging the canvas; stray scroll events
  // (e.g. mobile address-bar resizes) must not spin the globe.
  if (isCoarsePointer || detailsOpen || currentPage !== "work") return;
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
// Deep-linking to #about / #contact skips the gallery UI intro — those
// tweens would otherwise fade the hero/footer back in over the page.
// A project slug hash (e.g. #orsted-campaign) also skips the work intro
// and opens that project's overlay after a brief settle delay.
const START_HASH = location.hash.replace("#", "");
const START_PAGE = ["about", "contact"].includes(START_HASH) ? START_HASH : "work";
const START_PROJECT = START_PAGE === "work"
  ? cards.find(c => toSlug(c.userData.project.title) === START_HASH) || null
  : null;

if (START_PAGE === "work" && !START_PROJECT) {
  gsap.from(".ui-hero h1", { yPercent: 40, opacity: 0, duration: 1.2, ease: "power3.out", delay: 0.3 });
  gsap.from(".subtitle, .ui-footer, .ui-header", { opacity: 0, duration: 1, delay: 0.8 });
} else {
  gsap.set([".ui-hero", ".ui-footer"], { opacity: 0 });
  gsap.from(".ui-header", { opacity: 0, duration: 1, delay: 0.3 });
}

/* ------------------------------------------------------------------ */
/*  Contact page extras — click-to-copy email, live clock, and the     */
/*  letter-split heading that goToPage animates in                     */
/* ------------------------------------------------------------------ */

const contactEmail = document.getElementById("contact-email");
const copyNote = document.getElementById("copy-note");
let copyNoteTimer = null;

contactEmail.addEventListener("click", (e) => {
  e.preventDefault(); // copy instead of launching a mail client
  const address = contactEmail.textContent.trim();
  const acknowledge = () => {
    copyNote.classList.add("show");
    clearTimeout(copyNoteTimer);
    copyNoteTimer = setTimeout(() => copyNote.classList.remove("show"), 2000);
  };
  const copyViaTextarea = () => {
    const ta = document.createElement("textarea");
    ta.value = address;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(address).catch(copyViaTextarea).then(acknowledge);
  } else {
    copyViaTextarea();
    acknowledge();
  }
});

const contactClock = document.getElementById("contact-clock");
const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Stockholm",
});

function updateContactClock() {
  const time = clockFormat.format(new Date());
  const hour = Number(time.split(":")[0]);
  const late = hour >= 22 || hour < 7;
  contactClock.textContent =
    `Gothenburg, Sweden — ${time} CET` + (late ? " (so I might reply tomorrow)" : "");
}
updateContactClock();
setInterval(updateContactClock, 60_000);

// Wrap each letter of "Let's Talk" in a span so the heading can stagger
// in; the <br> between the words is left untouched.
document.querySelectorAll("#page-contact .page-title").forEach((title) => {
  [...title.childNodes].forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const frag = document.createDocumentFragment();
    for (const ch of node.textContent) {
      if (!ch.trim()) {
        frag.append(ch);
        continue;
      }
      const span = document.createElement("span");
      span.className = "title-letter";
      span.textContent = ch;
      frag.append(span);
    }
    node.replaceWith(frag);
  });
});

/* ------------------------------------------------------------------ */
/*  Page navigation — WORK (gallery) / ABOUT / CONTACT                 */
/*  The gallery never unmounts: leaving WORK fades the cards out and   */
/*  dims the dome, which keeps drifting behind the DOM pages.          */
/* ------------------------------------------------------------------ */

const PAGES = {
  about: document.getElementById("page-about"),
  contact: document.getElementById("page-contact"),
};
const navLinks = document.querySelectorAll("[data-page]");

let currentPage = "work";
let pageTl = null;

// Dome/particle opacities while a DOM page is in front of them
const PAGE_DIM = { dome: 0.03, innerDome: 0.012, particles: 0.12 };

// If the user navigates while the project details overlay is open (or
// mid-flight), snap everything back to rest — the page transition
// takes over from a clean state.
function resetDetailsInstant() {
  if (!detailsOpen && !transitioning) return;
  if (detailsTl) detailsTl.kill();
  if (activeCard) {
    world.attach(activeCard);
    activeCard.position.copy(activeCard.userData.basePosition);
    activeCard.quaternion.copy(activeCard.userData.baseQuaternion);
    activeCard.scale.setScalar(1);
  }
  cards.forEach((c) => {
    c.material.opacity = 1;
    c.material.color.setScalar(0.847);
  });
  detailsEl.classList.remove("open");
  gsap.set(detailsEl, { clearProps: "opacity" });
  detailsVideo.src = "";
  detailsSpotify.src = "";
  detailsOpen = false;
  transitioning = false;
  activeCard = null;
}

function goToPage(name) {
  if (name === currentPage) return;
  resetDetailsInstant();
  if (pageTl) pageTl.kill();

  const from = currentPage;
  currentPage = name;
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.page === name));
  history.replaceState(null, "", `#${name}`);

  // A killed mid-flight transition can leave a third page half-mounted;
  // anything that isn't the page we're leaving gets unmounted outright.
  Object.entries(PAGES).forEach(([key, el]) => {
    if (key !== from) {
      el.classList.remove("open");
      gsap.set(el, { clearProps: "opacity" });
    }
  });

  if (hoveredCard) {
    setHover(hoveredCard, false);
    hoveredCard = null;
    canvas.style.cursor = "grab";
  }

  const tl = (pageTl = gsap.timeline());

  // -- Outgoing --
  if (from === "work") {
    tl.to(cards.map((c) => c.material), { opacity: 0, duration: 0.45, ease: "power2.out" }, 0);
    tl.to(dome.material, { opacity: PAGE_DIM.dome, duration: 0.6 }, 0);
    tl.to(innerDome.material, { opacity: PAGE_DIM.innerDome, duration: 0.6 }, 0);
    tl.to(particles.material, { opacity: PAGE_DIM.particles, duration: 0.6 }, 0);
    tl.to([".ui-hero", ".ui-footer"], { opacity: 0, duration: 0.4, ease: "power2.out" }, 0);
  } else {
    const el = PAGES[from];
    tl.to(el.querySelectorAll(".page-inner > *"), { y: -18, opacity: 0, duration: 0.3, stagger: 0.03, ease: "power2.in" }, 0);
    tl.to(el, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.12);
    tl.add(() => el.classList.remove("open"), 0.45);
  }

  // -- Incoming --
  if (name === "work") {
    tl.to(cards.map((c) => c.material), { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.4);
    tl.to(dome.material, { opacity: GALLERY_OPACITY.dome, duration: 0.6 }, 0.4);
    tl.to(innerDome.material, { opacity: GALLERY_OPACITY.innerDome, duration: 0.6 }, 0.4);
    tl.to(particles.material, { opacity: GALLERY_OPACITY.particles, duration: 0.6 }, 0.4);
    tl.to([".ui-hero", ".ui-footer"], { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.5);
  } else {
    const el = PAGES[name];
    const start = from === "work" ? 0.3 : 0.45;
    tl.add(() => el.classList.add("open"), start);
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, start);
    tl.fromTo(
      el.querySelectorAll(".page-inner > *"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" },
      start + 0.1
    );
    if (name === "contact") {
      tl.fromTo(
        "#page-contact .title-letter",
        { y: "0.6em", opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: "power3.out" },
        start + 0.15
      );
    }
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    goToPage(link.dataset.page);
  });
});

// Deep link: opening the site at #about or #contact lands on that page;
// a project slug opens that project's overlay after the scene settles.
if (START_PAGE !== "work") goToPage(START_PAGE);
if (START_PROJECT) gsap.delayedCall(0.5, () => openDetails(START_PROJECT));

// Hash-only navigation (browser back/forward, or typing a hash) also
// switches pages or opens projects; goToPage no-ops when already there.
window.addEventListener("hashchange", () => {
  const hash = location.hash.replace("#", "");
  if (hash in PAGES) {
    goToPage(hash);
  } else {
    const card = cards.find(c => toSlug(c.userData.project.title) === hash);
    if (card) {
      if (currentPage !== "work") goToPage("work");
      openDetails(card);
    } else {
      goToPage("work");
    }
  }
});

/* ------------------------------------------------------------------ */
/*  Render loop (GSAP ticker drives Lenis + Three)                     */
/* ------------------------------------------------------------------ */

gsap.ticker.add((time, deltaTime) => {
  lenis.raf(time * 1000);
  detailsLenis.raf(time * 1000);

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

/* ------------------------------------------------------------------ */
/*  Chess easter egg — a knight in the corner opens a mate-in-one.     */
/*  Ladder mate: the b7 rook seals the 7th rank, so Ra1–a8 is mate.    */
/* ------------------------------------------------------------------ */

const chessEgg = document.getElementById("chess-egg");
const chessModal = document.getElementById("chess-modal");
const chessPanel = document.getElementById("chess-panel");
const chessBoardEl = document.getElementById("chess-board");
const chessStatus = document.getElementById("chess-status");
const chessHintBtn = document.getElementById("chess-hint");
const chessWin = document.getElementById("chess-win");
const chessCloseBtn = document.getElementById("chess-close");

const CHESS_START = { a1: "wR", b7: "wR", g1: "wK", g8: "bK" };
const CHESS_WINNING = { from: "a1", to: "a8" };
const CHESS_GLYPHS = { R: "♜", K: "♚" };
const CHESS_FILES = "abcdefgh";
const CHESS_DEFAULT_STATUS = "Click a white piece, then a square.";

let chessPosition = {};
let chessSelected = null;
let chessSolved = false;

function renderChessBoard() {
  chessBoardEl.innerHTML = "";
  for (let rank = 8; rank >= 1; rank--) {
    for (let f = 0; f < 8; f++) {
      const sq = CHESS_FILES[f] + rank;
      const cell = document.createElement("button");
      cell.type = "button";
      // a1 is a dark square: dark when file + rank is even (1-based file)
      cell.className = "chess-sq " + ((f + 1 + rank) % 2 === 0 ? "dark" : "light");
      cell.dataset.sq = sq;
      const piece = chessPosition[sq];
      if (piece) {
        cell.textContent = CHESS_GLYPHS[piece[1]];
        cell.classList.add(piece[0] === "w" ? "white-piece" : "black-piece");
        if (piece[0] === "w" && !chessSolved) cell.classList.add("selectable");
      }
      if (sq === chessSelected) cell.classList.add("selected");
      cell.addEventListener("click", () => onChessSquare(sq));
      chessBoardEl.appendChild(cell);
    }
  }
}

function onChessSquare(sq) {
  if (chessSolved) return;
  const piece = chessPosition[sq];

  if (piece && piece[0] === "w") {
    chessSelected = chessSelected === sq ? null : sq;
    chessStatus.textContent = chessSelected
      ? `${piece[1] === "R" ? "Rook" : "King"} on ${sq} — now pick its square.`
      : CHESS_DEFAULT_STATUS;
    renderChessBoard();
    return;
  }

  if (!chessSelected) {
    chessStatus.textContent = "Pick up a white piece first.";
    return;
  }

  if (chessSelected === CHESS_WINNING.from && sq === CHESS_WINNING.to) {
    chessCheckmate();
  } else {
    chessWrongMove();
  }
}

function chessWrongMove() {
  chessSelected = null;
  renderChessBoard();
  chessStatus.textContent = "Not quite — the king slips away. Try again.";
  chessBoardEl.classList.remove("shake");
  void chessBoardEl.offsetWidth; // restart the animation
  chessBoardEl.classList.add("shake");
  setTimeout(() => chessBoardEl.classList.remove("shake"), 450);
}

function chessCheckmate() {
  chessSolved = true;
  chessSelected = null;
  delete chessPosition[CHESS_WINNING.from];
  chessPosition[CHESS_WINNING.to] = "wR";
  renderChessBoard();
  chessBoardEl.querySelector('[data-sq="g8"]').classList.add("mated");
  chessPanel.classList.add("solved");
  chessWin.hidden = false;
  gsap.fromTo(
    chessBoardEl,
    { scale: 1 },
    { scale: 1.03, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.inOut" }
  );
  gsap.fromTo(
    chessWin,
    { y: 14, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, delay: 0.3, ease: "power3.out" }
  );
}

function resetChess() {
  chessPosition = { ...CHESS_START };
  chessSelected = null;
  chessSolved = false;
  chessPanel.classList.remove("solved");
  chessWin.hidden = true;
  chessStatus.textContent = CHESS_DEFAULT_STATUS;
  renderChessBoard();
}

function closeChess() {
  chessModal.classList.remove("open");
}

let chessOpenedAt = 0;
chessEgg.addEventListener("click", () => {
  resetChess();
  chessModal.classList.add("open");
  chessOpenedAt = performance.now();
});
chessCloseBtn.addEventListener("click", closeChess);
chessModal.addEventListener("click", (e) => {
  // The grace period swallows the tail of the opening click landing on
  // the backdrop that appeared under the cursor mid-gesture
  if (e.target === chessModal && performance.now() - chessOpenedAt > 300) closeChess();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && chessModal.classList.contains("open")) closeChess();
});

chessHintBtn.addEventListener("click", () => {
  chessStatus.textContent = "That a1 rook has a clear road north. All the way.";
  const cell = chessBoardEl.querySelector('[data-sq="a1"]');
  if (cell) cell.classList.add("glow");
  setTimeout(() => cell && cell.classList.remove("glow"), 1700);
});

// The CTA carries data-page="contact", so the nav handler above already
// routes it — this listener only dismisses the modal on the way out.
chessWin.querySelector(".chess-cta").addEventListener("click", closeChess);
