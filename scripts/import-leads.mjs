import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const inputDir = join(root, "imports", "incoming");
const outputJson = join(root, "data", "normalized_leads.json");
const outputCsv = join(root, "data", "normalized_leads.csv");

const files = await listLeadFiles(inputDir);
const records = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  const ext = extname(file).toLowerCase();
  const parsed = ext === ".json" ? parseJson(text) : parseCsv(text);
  records.push(...parsed.map((row) => normalizeLead({ ...row, importSource: file.replace(root, "") })));
}

const deduped = dedupe(records).filter((lead) => lead.name || lead.email || lead.phone);
await mkdir(join(root, "data"), { recursive: true });
await writeFile(outputJson, JSON.stringify(deduped, null, 2));
await writeFile(outputCsv, toCsv(deduped));

console.log(`Read ${files.length} files.`);
console.log(`Wrote ${deduped.length} normalized leads to:`);
console.log(`- ${outputJson}`);
console.log(`- ${outputCsv}`);

async function listLeadFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listLeadFiles(path));
    } else if (/\.(csv|json)$/i.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

function parseJson(text) {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
    return data.leads || data.borrowers || data.records || [data];
  } catch {
    return [];
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);

  const headers = rows.shift()?.map((value) => value.trim()) || [];
  return rows.map((values) =>
    headers.reduce((record, header, index) => {
      record[header] = values[index]?.trim() || "";
      return record;
    }, {})
  );
}

function normalizeLead(row) {
  const pick = (...keys) => {
    const normalized = Object.entries(row).reduce((acc, [key, value]) => {
      acc[key.toLowerCase().replace(/[^a-z0-9]/g, "")] = value;
      return acc;
    }, {});
    for (const key of keys) {
      const value = normalized[key.toLowerCase().replace(/[^a-z0-9]/g, "")];
      if (value !== undefined && value !== "") return String(value).trim();
    }
    return "";
  };

  const first = pick("first_name", "firstname", "first");
  const last = pick("last_name", "lastname", "last");
  const name = pick("name", "full_name", "borrower", "lead_name") || [first, last].filter(Boolean).join(" ");

  return {
    name,
    email: pick("email", "email_address", "borrower_email"),
    phone: pick("phone", "mobile", "cell", "borrower_phone"),
    state: pick("state", "target_state", "property_state"),
    partner: pick("partner", "agent", "realtor", "builder", "source_partner"),
    source: pick("source", "lead_source"),
    obstacle: pick("obstacle", "denial_reason", "denialreason", "issue", "status_reason") || inferObstacle(row),
    creditBand: pick("credit_score", "creditscore", "fico", "middle_score") || "600",
    dti: pick("dti", "debt_to_income", "debttoincome") || "50",
    cash: normalizeCash(pick("cash", "cash_available", "down_payment", "funds_available")),
    incomeType: normalizeIncome(pick("income_type", "employment_type", "employment")),
    consent: normalizeConsent(pick("consent", "authorization", "consent_status")),
    nextAction: pick("next_action", "nextaction") || "Request consent and complete intake",
    targetPrice: pick("target_price", "purchase_price", "price"),
    programInterest: pick("program", "loan_type", "product_interest") || "FHA",
    notes: pick("notes", "comments", "description"),
    importSource: row.importSource
  };
}

function inferObstacle(row) {
  const text = Object.values(row).join(" ").toLowerCase();
  if (text.includes("dti") || text.includes("debt")) return "High DTI";
  if (text.includes("credit") || text.includes("fico") || text.includes("score")) return "Low credit score";
  if (text.includes("self") || text.includes("1099") || text.includes("gig")) return "Self-employed income";
  if (text.includes("cash") || text.includes("down payment") || text.includes("closing")) return "Cash-to-close shortage";
  if (text.includes("property") || text.includes("appraisal")) return "Property issue";
  return "Prior denial";
}

function normalizeCash(value) {
  const text = String(value || "").toLowerCase();
  if (!text) return "short";
  if (text.includes("none") || text.includes("little")) return "none";
  if (text.includes("short")) return "short";
  if (text.includes("ready") || text.includes("enough")) return "ready";
  const number = Number(text.replace(/[^0-9.]/g, ""));
  if (number >= 15000) return "ready";
  if (number <= 3000) return "none";
  return "short";
}

function normalizeIncome(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("self")) return "Self-employed";
  if (text.includes("1099") || text.includes("gig")) return "1099 / Gig";
  if (text.includes("retire") || text.includes("fixed")) return "Retired / fixed income";
  if (text.includes("mixed")) return "Mixed income";
  return "W-2";
}

function normalizeConsent(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("sign") || text === "yes" || text === "true") return "Signed";
  if (text.includes("sent")) return "Sent";
  if (text.includes("revok")) return "Revoked";
  return "Not Sent";
}

function dedupe(records) {
  const seen = new Set();
  return records.filter((record) => {
    const key = record.email?.toLowerCase() || record.phone?.replace(/\D/g, "") || record.name?.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toCsv(records) {
  const headers = [
    "name",
    "email",
    "phone",
    "state",
    "partner",
    "source",
    "obstacle",
    "creditBand",
    "dti",
    "cash",
    "incomeType",
    "consent",
    "nextAction",
    "targetPrice",
    "programInterest",
    "notes",
    "importSource"
  ];
  return [
    headers.join(","),
    ...records.map((record) => headers.map((header) => csvCell(record[header])).join(","))
  ].join("\n");
}

function csvCell(value) {
  const text = value === undefined || value === null ? "" : String(value);
  const spreadsheetSafe = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${spreadsheetSafe.replaceAll('"', '""')}"`;
}
