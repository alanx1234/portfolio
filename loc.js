// scripts/loc.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFiles(dir, all = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(full, all);
    } else {
      all.push(full);
    }
  }
  return all;
}

function guessType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".html") return "html";
  if (ext === ".css") return "css";
  if (ext === ".js") return "js";
  if (ext === ".svelte") return "svelte"; // will mix inside
  return "other";
}

function mixTypes(lines) {
  const cycle = ["html", "js", "css", "svelte"];
  return lines.map((line, i) => cycle[i % cycle.length]);
}

function processFile(file) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");

  const fileType = guessType(file);
  let types = [];

  if (fileType === "svelte") {
    types = mixTypes(lines); // mixed colors inside a svelte file
  } else {
    types = lines.map(() => fileType); // same type
  }

  return lines.map((line, i) => ({
    file: file.replace(/\\/g, "/"),
    line: i + 1,
    depth: file.split("/").length - 1,
    length: line.length,
    type: types[i],
    date: "2024-01-01",
    time: "00:00",
    timezone: "Z",
    datetime: new Date().toISOString(),
  }));
}

function main() {
  const root = path.join(__dirname, ".");
  const files = getFiles(root);

  let rows = [];
  for (const file of files) {
    if (!file.match(/\.(html|css|js|svelte)$/)) continue;
    rows.push(...processFile(file));
  }

  const csv =
    "file,line,depth,length,type,date,time,timezone,datetime\n" +
    rows
      .map((r) =>
        [
          r.file,
          r.line,
          r.depth,
          r.length,
          r.type,
          r.date,
          r.time,
          r.timezone,
          r.datetime,
        ].join(",")
      )
      .join("\n");

  fs.writeFileSync(path.join(root, "loc.csv"), csv);
  console.log("Done: loc.csv created with mixed types");
}

main();
