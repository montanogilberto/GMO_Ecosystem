// Checks that every en.json under src/ has an es.json next to it with exactly
// the same keys and list lengths, so no text is missing in either language.
// Runs before every build (npm run build) and on its own: npm run check:i18n
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../src", import.meta.url).pathname;
const errors = [];

function compare(a, b, where) {
  if (Array.isArray(a) !== Array.isArray(b) || typeof a !== typeof b) {
    errors.push(`${where}: different type in en.json and es.json`);
  } else if (Array.isArray(a)) {
    if (a.length !== b.length) errors.push(`${where}: ${a.length} items in en.json, ${b.length} in es.json`);
    a.forEach((v, i) => i < b.length && compare(v, b[i], `${where}[${i}]`));
  } else if (a && typeof a === "object") {
    for (const k of Object.keys(a)) k in b ? compare(a[k], b[k], `${where}.${k}`) : errors.push(`${where}.${k}: missing in es.json`);
    for (const k of Object.keys(b)) if (!(k in a)) errors.push(`${where}.${k}: missing in en.json`);
  } else if (typeof a === "string" && !a.trim() !== !b.trim()) {
    errors.push(`${where}: empty in one language only`);
  }
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name === "en.json") {
      const es = join(dir, "es.json");
      const where = relative(root, dir);
      if (!existsSync(es)) { errors.push(`${where}: missing es.json`); continue; }
      compare(JSON.parse(readFileSync(path, "utf8")), JSON.parse(readFileSync(es, "utf8")), where);
    }
  }
}

walk(root);
if (errors.length) {
  console.error(`Text differs between languages:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("i18n: English and Spanish texts match.");
