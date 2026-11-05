// Fetches the Substack RSS feed and writes it to a static JSON file that
// the site reads at runtime. Run manually (`npm run fetch:substack`) or on
// a schedule via CI — fetching here, server-side, avoids the CORS wall
// Substack's feed hits when requested straight from the browser.

const fs = require("fs");
const path = require("path");

const FEED_URL = process.env.SUBSTACK_FEED_URL || "https://selfbrainedbyjakob.substack.com/feed";
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

function extract(block, tag) {
  const cdata = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  if (cdata) return decodeEntities(cdata[1]).trim();
  const plain = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return plain ? decodeEntities(plain[1]).trim() : "";
}

function excerptFrom(description, contentEncoded) {
  if (description) return description;
  const text = stripTags(decodeEntities(contentEncoded));
  return text.length > 220 ? `${text.slice(0, 217).trim()}…` : text;
}

async function main() {
  const res = await fetch(FEED_URL, {
    headers: {
      "User-Agent": "wennerqvist-portfolio-substack-fetcher/1.0 (+https://wennerqvist.org)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  if (!res.ok) throw new Error(`Substack feed request failed: ${res.status}`);
  const xml = await res.text();

  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const posts = items.slice(0, MAX_POSTS).map((block) => {
    const contentMatch = block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
    const image = block.match(/<enclosure[^>]*url="([^"]+)"/);
    return {
      title: extract(block, "title"),
      link: extract(block, "link"),
      pubDate: extract(block, "pubDate"),
      excerpt: excerptFrom(extract(block, "description"), contentMatch ? contentMatch[1] : ""),
      image: image ? image[1] : null,
    };
  });

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
