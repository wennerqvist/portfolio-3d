/* Builds public/assets/wla-redesign.png: the WLA site screenshot composited
   into a minimal MacBook-style laptop frame on the portfolio's dark background.
   Run: node scripts/wla-mockup.js [--crop-only]  (crop-only saves just the
   cropped page content to a temp file for visual inspection). */

const sharp = require("sharp");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "assets", "wla-screenshot.png");
const OUT = path.join(__dirname, "..", "public", "assets", "wla-redesign.png");
const CROP_PREVIEW = path.join(__dirname, "wla-crop-preview.png");

// Region of the 1920x1080 desktop screenshot that is actual page content
// (strips Chrome tabs/toolbar/bookmarks at the top and the taskbar below).
const PAGE = { left: 0, top: 176, width: 1920, height: 842 };

// Horizontal window of the page shown on the laptop display (16:9).
// Chosen so the hero headline, the "Available this semester" panel and
// the person in the hero photo all stay inside the frame.
const VIEW_LEFT = 100;

// Final canvas
const W = 1600;
const H = 1000;

async function main() {
  const cropOnly = process.argv.includes("--crop-only");

  if (cropOnly) {
    await sharp(SRC).extract(PAGE).toFile(CROP_PREVIEW);
    console.log("wrote", CROP_PREVIEW);
    return;
  }

  // Display area: 16:9, centered horizontally
  const dispW = 1120;
  const dispH = dispW * (9 / 16); // 630
  const dispX = (W - dispW) / 2; // 240
  const dispY = 140;

  // Bezel around the display
  const bez = 16;
  const bezX = dispX - bez;
  const bezY = dispY - bez;
  const bezW = dispW + bez * 2;
  const bezH = dispH + bez * 2;
  const bezBottom = bezY + bezH;

  // Base bar (the "keyboard deck" seen edge-on)
  const baseW = bezW + 240;
  const baseX = (W - baseW) / 2;
  const baseH = 26;
  const notchW = 190;
  const notchH = 11;

  // Source window: 16:9 slice of the page content, full height
  const viewH = PAGE.height;
  const viewW = Math.round(viewH * (16 / 9)); // 1497
  const screen = await sharp(SRC)
    .extract({ left: VIEW_LEFT, top: PAGE.top, width: viewW, height: viewH })
    .resize(dispW, Math.round(dispH))
    .png()
    .toBuffer();

  const frame = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2b2b2e"/>
        <stop offset="1" stop-color="#151517"/>
      </linearGradient>
      <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a3a3e"/>
        <stop offset="0.5" stop-color="#232326"/>
        <stop offset="1" stop-color="#111113"/>
      </linearGradient>
      <filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter>
      <filter id="blur12"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>

    <rect width="${W}" height="${H}" fill="#0a0a0a"/>

    <!-- soft shadow pooled under the laptop -->
    <ellipse cx="${W / 2}" cy="${bezBottom + baseH + 42}" rx="${baseW * 0.52}" ry="34"
             fill="#000" opacity="0.75" filter="url(#blur30)"/>
    <ellipse cx="${W / 2}" cy="${bezBottom + baseH + 18}" rx="${baseW * 0.38}" ry="14"
             fill="#000" opacity="0.8" filter="url(#blur12)"/>

    <!-- screen bezel -->
    <rect x="${bezX}" y="${bezY}" width="${bezW}" height="${bezH}" rx="22"
          fill="url(#bezel)" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
    <!-- display cutout backing (screen edge) -->
    <rect x="${dispX - 2}" y="${dispY - 2}" width="${dispW + 4}" height="${dispH + 4}" rx="6"
          fill="#000"/>

    <!-- base / deck -->
    <path d="M ${baseX} ${bezBottom}
             H ${baseX + baseW}
             V ${bezBottom + baseH - 12}
             Q ${baseX + baseW} ${bezBottom + baseH} ${baseX + baseW - 22} ${bezBottom + baseH}
             H ${baseX + 22}
             Q ${baseX} ${bezBottom + baseH} ${baseX} ${bezBottom + baseH - 12}
             Z"
          fill="url(#base)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <!-- thumb notch -->
    <rect x="${(W - notchW) / 2}" y="${bezBottom}" width="${notchW}" height="${notchH}"
          rx="${notchH / 2}" fill="#0c0c0e"/>
    <!-- hinge shadow line where lid meets deck -->
    <rect x="${bezX + 8}" y="${bezBottom - 2}" width="${bezW - 16}" height="3"
          fill="#000" opacity="0.5"/>
  </svg>`;

  await sharp(Buffer.from(frame))
    .composite([{ input: screen, left: dispX, top: dispY }])
    .png()
    .toFile(OUT);
  console.log("wrote", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
