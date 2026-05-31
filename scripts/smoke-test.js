const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

const requiredFiles = [
  "app/index.html",
  "app/storage.js",
  "app/app.js",
  "app/styles.css",
  "START_HERE.html",
  "USER_GUIDE_NONTECHNICAL.md"
];

const requiredText = [
  "Buyer Portal",
  "Admin Workspace",
  "Impossible File Scan",
  "Rescue Now",
  "Approval Sprint",
  "Rebuild First",
  "Protect & Refer",
  "Export Partner Packet",
  "Handoff Status",
  "Outcome Tracking",
  "Audit Logs"
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message) {
  console.error(`Smoke test failed: ${message}`);
  process.exit(1);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`${file} is missing`);
}

const combined = [read("app/index.html"), read("app/app.js"), read("app/storage.js"), read("app/styles.css")].join("\n");
for (const text of requiredText) {
  if (!combined.includes(text)) fail(`Required text is missing: ${text}`);
}

try {
  new vm.Script(read("app/storage.js"), { filename: "storage.js" });
  new vm.Script(read("app/app.js"), { filename: "app.js" });
} catch (error) {
  fail(`JavaScript parse error: ${error.message}`);
}

console.log("Smoke test passed.");
