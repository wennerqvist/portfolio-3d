/* Renders scripts/wla-scene.html in headless Chrome and captures the 1120x700
   scene at 1.43x device scale -> public/assets/wla-redesign.png (1602x1001).
   Requires the static server: npx http-server -p 8123, and puppeteer-core. */

const puppeteer = require("puppeteer-core");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "assets", "wla-redesign.png");

(async () => {
  const browser = await puppeteer.launch({ channel: "chrome", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1120, height: 700, deviceScaleFactor: 1.43 });
  await page.goto("http://localhost:8123/scripts/wla-scene.html", {
    waitUntil: "networkidle0",
  });
  await page.screenshot({
    path: OUT,
    clip: { x: 0, y: 0, width: 1120, height: 700 },
  });
  await browser.close();
  console.log("wrote", OUT);
})();
