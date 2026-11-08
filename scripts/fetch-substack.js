// Fetches the Substack RSS feed and writes it to a static JSON file that
// the site reads at runtime. Run manually (`npm run fetch:substack`) or on
// a schedule via CI.
//
// We go through the rss2json proxy (https://rss2json.com) rather than
// hitting Substack directly: Substack's Cloudflare front blocks requests
// from GitHub Actions' shared runner IP ranges with a 403, regardless of
// headers, since those ranges are commonly abused for scraping. Routing
// through a proxy whose own servers fetch the feed sidesteps that block.

const fs = require("fs");
const path = require("path");

const FEED_URL = process.env.SUBSTACK_FEED_URL || "https://selfbrainedbyjakob.substack.com/feed";
const RSS2JSON_API_KEY = process.env.SUBSTACK_RSS2JSON_API_KEY || "";
const OUTPUT_PATH = path.join(__dirname, "..", "public", "data", "substack-posts.json");
const MAX_POSTS = 12;

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(str) {
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X"
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function excerptFrom(description, content) {
  const text = stripTags(decodeEntities(description || content || ""));
  return text.length > 220 ? `${text.slice(0, 217).trim()}…` : text;
}

function imageFrom(item) {
  if (item.thumbnail) return item.thumbnail;
  if (item.enclosure && item.enclosure.link) return item.enclosure.link;
  const match = (item.content || "").match(/<img[^>]*src="([^"]+)"/);
  return match ? match[1] : null;
}

function toIsoDate(pubDate) {
  // rss2json normalizes dates to "YYYY-MM-DD HH:MM:SS" UTC, which isn't
  // reliably parsed by `new Date()` in every engine — make it explicit.
  const date = new Date(/^\d{4}-\d{2}-\d{2} /.test(pubDate) ? `${pubDate.replace(" ", "T")}Z` : pubDate);
  return Number.isNaN(date.getTime()) ? pubDate : date.toISOString();
}

async function main() {
  const proxyUrl = new URL("https://api.rss2json.com/v1/api.json");
  proxyUrl.searchParams.set("rss_url", FEED_URL);
  proxyUrl.searchParams.set("count", String(MAX_POSTS));
  if (RSS2JSON_API_KEY) proxyUrl.searchParams.set("api_key", RSS2JSON_API_KEY);

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Substack feed proxy request failed: ${res.status}`);
  const data = await res.json();
  if (data.status !== "ok") throw new Error(`Substack feed proxy error: ${data.message || data.status}`);

  const posts = (data.items || []).slice(0, MAX_POSTS).map((item) => ({
    title: decodeEntities(item.title || ""),
    link: item.link || "",
    pubDate: toIsoDate(item.pubDate || ""),
    excerpt: excerptFrom(item.description, item.content),
    image: imageFrom(item),
  }));

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ updatedAt: new Date().toISOString(), posts }, null, 2) + "\n"
  );
  console.log(`Wrote ${posts.length} post(s) to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
