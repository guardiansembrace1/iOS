/**
 * Generates public/bible/<slug>.json from the `kjv` npm package.
 *
 *   npm run build:bible
 *
 * The King James Version is public domain, so the text ships inside the app
 * and the reader works with no network at all. One file per book keeps each
 * fetch small — the largest is Psalms at ~230KB, most are far smaller.
 *
 * Run this once after cloning; the output is committed so a fresh checkout
 * does not need the generator to build.
 */
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "bible");

// Book name in the source data -> the slug we serve it under.
// "Solomon's Song" is the source's name for Song of Solomon.
const SLUGS = {
  "Solomon's Song": "song-of-solomon",
};

function toSlug(sourceName) {
  if (SLUGS[sourceName]) return SLUGS[sourceName];
  return sourceName.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");
}

const REF = /^(.*) (\d+):(\d+)$/;

/** Revelation is written last, so its presence means a previous run finished. */
async function alreadyBuilt() {
  try {
    await access(join(outDir, "revelation.json"));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!process.argv.includes("--force") && (await alreadyBuilt())) {
    console.log("public/bible/ is already built — skipping. Use --force to rebuild.");
    return;
  }

  const versesPath = require.resolve("kjv/json/verses-1769.json");
  const verses = JSON.parse(await readFile(versesPath, "utf8"));

  // Preserve canonical order by relying on the source's key order.
  const books = new Map();
  for (const [ref, text] of Object.entries(verses)) {
    const match = REF.exec(ref);
    if (!match) throw new Error(`Could not parse reference: ${ref}`);
    const [, name, chapter, verse] = match;

    if (!books.has(name)) books.set(name, new Map());
    const chapters = books.get(name);
    const n = Number(chapter);
    if (!chapters.has(n)) chapters.set(n, []);
    chapters.get(n)[Number(verse) - 1] = text;
  }

  await mkdir(outDir, { recursive: true });

  let totalBytes = 0;
  let totalVerses = 0;
  let totalChapters = 0;

  for (const [name, chapterMap] of books) {
    const count = Math.max(...chapterMap.keys());
    const chapters = [];
    for (let i = 1; i <= count; i++) {
      const chapter = chapterMap.get(i);
      if (!chapter) throw new Error(`${name} is missing chapter ${i}`);
      if (chapter.some((v) => v === undefined)) {
        throw new Error(`${name} ${i} has a gap in its verse numbering`);
      }
      chapters.push(chapter);
      totalVerses += chapter.length;
    }
    totalChapters += chapters.length;

    const payload = JSON.stringify({ name, chapters });
    totalBytes += Buffer.byteLength(payload);
    await writeFile(join(outDir, `${toSlug(name)}.json`), payload, "utf8");
  }

  console.log(
    `Wrote ${books.size} books, ${totalChapters} chapters, ${totalVerses} verses ` +
      `(${(totalBytes / 1024 / 1024).toFixed(2)} MB) to public/bible/`
  );

  if (books.size !== 66 || totalChapters !== 1189 || totalVerses !== 31102) {
    throw new Error(
      "Unexpected totals — the KJV should be 66 books, 1189 chapters, 31102 verses."
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
