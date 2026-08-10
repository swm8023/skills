#!/usr/bin/env node
/**
 * Node re-implementation of generate_review.py --static (Python unavailable on this machine).
 * Scans a workspace for run dirs (containing outputs/), embeds data into viewer.html,
 * and writes a standalone HTML file.
 *
 * Usage: node generate_static_viewer.js <workspace> --skill-name <name> [--benchmark <benchmark.json>] --out <file.html>
 */
const fs = require("fs");
const path = require("path");

const METADATA_FILES = new Set(["transcript.md", "user_notes.md", "metrics.json"]);
const TEXT_EXTENSIONS = new Set([
  ".txt", ".md", ".json", ".csv", ".py", ".js", ".ts", ".tsx", ".jsx",
  ".yaml", ".yml", ".xml", ".html", ".css", ".sh", ".rb", ".go", ".rs",
  ".java", ".c", ".cpp", ".h", ".hpp", ".sql", ".r", ".toml",
]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"]);

function embedFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath);
  if (TEXT_EXTENSIONS.has(ext)) {
    let content;
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      content = "(Error reading file)";
    }
    return { name, type: "text", content };
  }
  if (IMAGE_EXTENSIONS.has(ext) || ext === ".pdf") {
    try {
      const b64 = fs.readFileSync(filePath).toString("base64");
      return { name, type: ext === ".pdf" ? "pdf" : "image", data_uri: `data:application/octet-stream;base64,${b64}` };
    } catch {
      return { name, type: "error", content: "(Error reading file)" };
    }
  }
  try {
    const b64 = fs.readFileSync(filePath).toString("base64");
    return { name, type: "binary", data_uri: `data:application/octet-stream;base64,${b64}` };
  } catch {
    return { name, type: "error", content: "(Error reading file)" };
  }
}

function buildRun(root, runDir) {
  let prompt = "";
  let evalId = null;
  for (const candidate of [path.join(runDir, "eval_metadata.json"), path.join(path.dirname(runDir), "eval_metadata.json")]) {
    if (fs.existsSync(candidate)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(candidate, "utf8"));
        prompt = metadata.prompt || "";
        evalId = metadata.eval_id ?? null;
      } catch { /* ignore */ }
      if (prompt) break;
    }
  }
  if (!prompt) prompt = "(No prompt found)";

  const runId = path.relative(root, runDir).split(path.sep).join("-");

  const outputsDir = path.join(runDir, "outputs");
  const outputFiles = [];
  for (const f of fs.readdirSync(outputsDir).sort()) {
    const fp = path.join(outputsDir, f);
    if (fs.statSync(fp).isFile() && !METADATA_FILES.has(f)) {
      outputFiles.push(embedFile(fp));
    }
  }

  let grading = null;
  for (const candidate of [path.join(runDir, "grading.json"), path.join(path.dirname(runDir), "grading.json")]) {
    if (fs.existsSync(candidate)) {
      try {
        grading = JSON.parse(fs.readFileSync(candidate, "utf8"));
      } catch { /* ignore */ }
      if (grading) break;
    }
  }

  return { id: runId, prompt, eval_id: evalId, outputs: outputFiles, grading };
}

function findRuns(workspace) {
  const runs = [];
  const SKIP = new Set(["node_modules", ".git", "__pycache__", "skill", "inputs"]);
  function walk(current) {
    const outputsDir = path.join(current, "outputs");
    if (fs.existsSync(outputsDir) && fs.statSync(outputsDir).isDirectory()) {
      runs.push(buildRun(workspace, current));
      return;
    }
    for (const child of fs.readdirSync(current).sort()) {
      const cp = path.join(current, child);
      if (fs.statSync(cp).isDirectory() && !SKIP.has(child)) walk(cp);
    }
  }
  walk(workspace);
  runs.sort((a, b) => (a.eval_id ?? Infinity) - (b.eval_id ?? Infinity) || a.id.localeCompare(b.id));
  return runs;
}

function main() {
  const args = process.argv.slice(2);
  const workspace = path.resolve(args[0]);
  const getOpt = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : null;
  };
  const skillName = getOpt("--skill-name") || path.basename(workspace).replace(/-workspace$/, "");
  const benchmarkPath = getOpt("--benchmark");
  const outPath = getOpt("--out");
  if (!outPath) {
    console.error("Missing --out <file.html>");
    process.exit(1);
  }

  const runs = findRuns(workspace);
  if (runs.length === 0) {
    console.error(`No runs found in ${workspace}`);
    process.exit(1);
  }

  let benchmark = null;
  if (benchmarkPath && fs.existsSync(benchmarkPath)) {
    benchmark = JSON.parse(fs.readFileSync(benchmarkPath, "utf8"));
  }

  const embedded = {
    skill_name: skillName,
    runs,
    previous_feedback: {},
    previous_outputs: {},
  };
  if (benchmark) embedded.benchmark = benchmark;

  const templatePath = path.join(__dirname, "viewer.html");
  const template = fs.readFileSync(templatePath, "utf8");
  const html = template.replace("/*__EMBEDDED_DATA__*/", `const EMBEDDED_DATA = ${JSON.stringify(embedded)};`);
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`Static viewer written to: ${outPath} (${runs.length} runs)`);
}

main();
