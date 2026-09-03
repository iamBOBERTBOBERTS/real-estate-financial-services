const stages = [
  "All",
  "New Intake",
  "Consent Needed",
  "File Review",
  "Missing Documents",
  "Path Assigned",
  "DPA/Program Screening",
  "Lender Match Ready",
  "Submitted to Partner",
  "Approved",
  "Paused: Build Plan",
  "Ineligible: Future Review",
  "Closed/Lost"
];

// Dynamic template values are escaped by safeHtml before reaching innerHTML.
// The interceptor is a second boundary that removes active or network-capable
// elements and executable attributes from every template write.
const safeHtmlBrand = Symbol("safeHtml");

function safeHtml(strings, ...values) {
  let markup = strings[0];
  values.forEach((value, index) => {
    markup += safeHtmlValue(value) + strings[index + 1];
  });
  return Object.freeze({
    [safeHtmlBrand]: true,
    toString: () => markup
  });
}

function safeHtmlValue(value) {
  if (value?.[safeHtmlBrand]) return String(value);
  if (Array.isArray(value)) return value.map(safeHtmlValue).join("");
  return escapeHtml(value);
}

const nativeInnerHtml = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
const blockedTemplateTags = new Set([
  "BASE",
  "AUDIO",
  "EMBED",
  "FORM",
  "IFRAME",
  "IMG",
  "LINK",
  "MATH",
  "META",
  "OBJECT",
  "SCRIPT",
  "SOURCE",
  "STYLE",
  "SVG",
  "TRACK",
  "VIDEO"
]);
const urlAttributes = new Set(["action", "formaction", "href", "poster", "src", "xlink:href"]);

function sanitizedTemplateFragment(markup) {
  const template = document.createElement("template");
  nativeInnerHtml.set.call(template, String(markup));

  template.content.querySelectorAll("*").forEach((element) => {
    if (blockedTemplateTags.has(element.tagName)) {
      element.remove();
      return;
    }

    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" || name === "nonce") {
        element.removeAttribute(attribute.name);
        return;
      }
      if (name === "style" && !(element.classList.contains("score-ring") && /^--score:\d{1,3}$/.test(attribute.value))) {
        element.removeAttribute(attribute.name);
        return;
      }
      if (urlAttributes.has(name)) {
        try {
          const url = new URL(attribute.value, window.location.origin);
          if (url.origin !== window.location.origin || !["http:", "https:"].includes(url.protocol)) {
            element.removeAttribute(attribute.name);
          }
        } catch {
          element.removeAttribute(attribute.name);
        }
      }
    });
  });

  return template.content;
}

if (nativeInnerHtml?.get && nativeInnerHtml?.set) {
  Object.defineProperty(Element.prototype, "innerHTML", {
    configurable: true,
    enumerable: nativeInnerHtml.enumerable,
    get() {
      return nativeInnerHtml.get.call(this);
    },
    set(markup) {
      this.replaceChildren(sanitizedTemplateFragment(markup).cloneNode(true));
    }
  });
}

const paths = [
  "All",
  "DPA Stack Path",
  "Manual Underwrite Path",
  "Income Rescue Path",
  "Credit Comeback Path",
  "Debt Strategy Path",
  "Alternative Product Path",
  "Property Rescue Path",
  "Pause and Build Path"
];

const handoffStatuses = [
  "Not sent yet",
  "Ready to send",
  "Sent to lender",
  "Sent to DPA partner",
  "Sent to housing counselor",
  "Sent to realtor/builder",
  "In review",
  "More info requested",
  "Paused",
  "Closed / completed"
];

const outcomeStatuses = [
  "No outcome yet",
  "Buyer not responsive",
  "Needs documents",
  "Needs credit sprint",
  "Needs DTI sprint",
  "Needs cash-to-close plan",
  "Needs DPA review",
  "Needs different lender lane",
  "Sent to lender review",
  "Sent to counselor/nonprofit",
  "Preapproval reported",
  "Denied again",
  "Approved elsewhere",
  "Under contract",
  "Closed",
  "Not safe to proceed",
  "Lost / stopped working"
];

const outcomeSources = ["Buyer", "Lender", "Realtor", "Builder", "Counselor", "Internal user"];

const workedReasons = [
  "",
  "Correct lender lane",
  "DPA found",
  "Documents cleaned up",
  "DTI improved",
  "Credit improved",
  "Income packaged correctly",
  "VA/USDA/FHA route worked",
  "Portfolio/non-QM route worked",
  "Other"
];

const failedReasons = [
  "",
  "Credit",
  "DTI",
  "Cash",
  "Income",
  "Employment",
  "Documents",
  "Property",
  "Buyer stopped responding",
  "Affordability concern",
  "Unknown"
];

const workViews = [
  "All active files",
  "Ready to Send",
  "Sent - Needs Follow-Up",
  "More Info Requested",
  "Outcome Needed",
  "Approval Sprint",
  "Rebuild First",
  "Protect & Refer",
  "Won / Closed",
  "Lost / Not Ready"
];

const baseTasks = [
  "Confirm signed consent",
  "Collect denial letter or lender issue summary",
  "Collect income and asset documents",
  "Assign primary approval path",
  "Prepare lender/program routing package"
];

const blockerLabels = {
  CREDIT: "Credit",
  DTI: "Debt ratio",
  CASH: "Cash to close",
  INCOME: "Income",
  EMPLOYMENT: "Job history",
  DOCUMENTS: "Documents",
  PROPERTY: "Property",
  PROGRAM_MISMATCH: "Program mismatch",
  DPA_NEEDED: "Down payment help",
  UNKNOWN: "Unknown"
};

const baseDocuments = [
  "Photo ID",
  "Paystubs or income proof",
  "W-2s or tax returns",
  "Bank statements",
  "Written denial letter",
  "AUS findings",
  "Rent or mortgage history",
  "Explanation letters"
];

const defaultLenders = [
  {
    name: "Community Bank Portfolio Desk",
    type: "Portfolio lender",
    states: "AZ, OR",
    fit: ["Manual Underwrite Path", "Alternative Product Path"],
    lanes: ["Portfolio / Community Bank", "Manual Review"],
    score: "620-659",
    dti: "Medium",
    manual: "Yes",
    dpa: "Limited",
    selfEmployed: "Medium"
  },
  {
    name: "DPA Friendly Broker Channel",
    type: "Mortgage broker",
    states: "AZ",
    fit: ["DPA Stack Path", "Manual Underwrite Path"],
    lanes: ["DPA First", "Manual Review"],
    score: "580-619",
    dti: "High",
    manual: "Yes",
    dpa: "Yes",
    selfEmployed: "Medium"
  },
  {
    name: "Non-QM Income Lab",
    type: "Non-QM lender",
    states: "National",
    fit: ["Income Rescue Path", "Alternative Product Path"],
    lanes: ["Self-Employed / Bank Statement", "Non-QM / Alternative Product"],
    score: "660+",
    dti: "Medium",
    manual: "No",
    dpa: "No",
    selfEmployed: "High"
  },
  {
    name: "Housing Assistance Agency",
    type: "Housing agency",
    states: "AZ",
    fit: ["DPA Stack Path", "Credit Comeback Path"],
    lanes: ["Housing Counseling / Nonprofit", "DPA First"],
    score: "N/A",
    dti: "N/A",
    manual: "N/A",
    dpa: "Yes",
    selfEmployed: "N/A"
  }
];

const userRoles = ["Owner", "Admin", "File Analyst", "Partner", "Lender", "Counselor", "Read Only"];

const rolePermissions = {
  Owner: { viewBuyers: true, editScans: true, exportPackets: true, manageLenders: true, manageUsers: true, viewAudit: true, notesOnly: false },
  Admin: { viewBuyers: true, editScans: true, exportPackets: true, manageLenders: true, manageUsers: "Limited", viewAudit: true, notesOnly: false },
  "File Analyst": { viewBuyers: true, editScans: true, exportPackets: true, manageLenders: false, manageUsers: false, viewAudit: "Limited", notesOnly: false },
  Partner: { viewBuyers: "Limited", editScans: false, exportPackets: false, manageLenders: false, manageUsers: false, viewAudit: false, notesOnly: false },
  Lender: { viewBuyers: "Limited", editScans: false, exportPackets: false, manageLenders: false, manageUsers: false, viewAudit: false, notesOnly: false },
  Counselor: { viewBuyers: "Limited", editScans: "Notes only", exportPackets: false, manageLenders: false, manageUsers: false, viewAudit: false, notesOnly: true },
  "Read Only": { viewBuyers: "Limited", editScans: false, exportPackets: false, manageLenders: false, manageUsers: false, viewAudit: false, notesOnly: false }
};

const visibilityLevels = ["None", "Basic status only", "Hard-file summary", "Full partner packet"];

function uid() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `file-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const sampleBorrowers = [
  {
    id: uid(),
    name: "Maya Rodriguez",
    email: "maya@example.com",
    phone: "555-0182",
    state: "AZ",
    partner: "North Valley Realty",
    owner: "Desk",
    stage: "DPA/Program Screening",
    obstacle: "Cash-to-close shortage",
    creditBand: 640,
    dti: 43,
    cash: "none",
    incomeType: "W-2",
    consent: "Signed",
    nextAction: "Screen state and local DPA options",
    targetPrice: "335000",
    programInterest: "DPA / Grant",
    notes: "Strong rental history, limited savings, first-time buyer.",
    timeline: "30 days",
    creditRange: "620-659",
    monthlyIncome: "6200",
    monthlyDebt: "2100",
    cashAmount: "3500",
    housingPayment: "1850",
    firstTimeBuyer: "Yes",
    mainProblems: ["Not enough cash to close", "VA/USDA/FHA/DPA not checked"],
    availableDocs: ["Paystubs", "W-2s/tax returns", "Bank statements", "ID", "Rent history proof"],
    handoff: {
      status: "Sent to DPA partner",
      partnerName: "Housing Assistance Agency",
      contactPerson: "Program Intake",
      dateSent: "2026-05-20",
      nextFollowUp: "2026-06-03",
      notes: "Asked for DPA eligibility screen."
    },
    outcome: {
      status: "More info requested",
      date: "2026-05-22",
      source: "Counselor",
      workedReason: "",
      failedReason: "Documents",
      notes: "Needs household income proof.",
      nextAction: "Collect household income proof",
      nextFollowUp: "2026-06-03"
    }
  },
  {
    id: uid(),
    name: "Caleb Morgan",
    email: "caleb@example.com",
    phone: "555-0194",
    state: "AZ",
    partner: "Veteran Home Team",
    owner: "Desk",
    stage: "Submitted to Partner",
    obstacle: "Cash-to-close shortage",
    creditBand: 660,
    dti: 41,
    cash: "none",
    incomeType: "W-2",
    consent: "Signed",
    nextAction: "Confirm VA eligibility and residual income review",
    targetPrice: "390000",
    programInterest: "VA",
    notes: "Veteran buyer with limited savings.",
    timeline: "Now",
    creditRange: "660-699",
    monthlyIncome: "7100",
    monthlyDebt: "2500",
    cashAmount: "1000",
    housingPayment: "2100",
    veteranEligible: "Yes",
    mainProblems: ["Not enough cash to close", "VA/USDA/FHA/DPA not checked"],
    availableDocs: ["Paystubs", "W-2s/tax returns", "Bank statements", "ID"],
    handoff: {
      status: "Sent to lender",
      partnerName: "VA Specialist Candidate",
      contactPerson: "Scenario Desk",
      dateSent: "2026-05-24",
      nextFollowUp: "2026-06-01",
      notes: "Sent anonymized VA scenario."
    },
    outcome: {
      status: "Sent to lender review",
      date: "2026-05-24",
      source: "Internal user",
      workedReason: "VA/USDA/FHA route worked",
      failedReason: "",
      notes: "Awaiting scenario response.",
      nextAction: "Follow up with VA scenario desk",
      nextFollowUp: "2026-06-01"
    }
  },
  {
    id: uid(),
    name: "Evan Brooks",
    email: "evan@example.com",
    phone: "555-0164",
    state: "OR",
    partner: "Summit Homes",
    owner: "Desk",
    stage: "Missing Documents",
    obstacle: "Self-employed income",
    creditBand: 680,
    dti: 50,
    cash: "ready",
    incomeType: "Self-employed",
    consent: "Signed",
    nextAction: "Collect tax returns and 12 months bank statements",
    targetPrice: "485000",
    programInterest: "Non-QM",
    notes: "AUS denial due to tax return losses; bank deposits look stronger.",
    timeline: "90 days",
    creditRange: "660-699",
    monthlyIncome: "9600",
    monthlyDebt: "4200",
    cashAmount: "22000",
    housingPayment: "2800",
    mainProblems: ["Self-employed income problem", "Income could not be verified", "Missing documents"],
    availableDocs: ["ID", "Bank statements"],
    handoff: {
      status: "Ready to send",
      partnerName: "Non-QM Income Lab",
      contactPerson: "Scenario Desk",
      dateSent: "",
      nextFollowUp: "2026-06-04",
      notes: "Ready after bank statements are complete."
    },
    outcome: {
      status: "No outcome yet",
      date: "",
      source: "Internal user",
      workedReason: "",
      failedReason: "",
      notes: "",
      nextAction: "Finish income packet",
      nextFollowUp: "2026-06-04"
    }
  },
  {
    id: uid(),
    name: "Tara Wilson",
    email: "tara@example.com",
    phone: "555-0128",
    state: "AZ",
    partner: "Mesa Buyer Team",
    owner: "Desk",
    stage: "Path Assigned",
    obstacle: "High DTI",
    creditBand: 600,
    dti: 57,
    cash: "short",
    incomeType: "1099 / Gig",
    consent: "Sent",
    nextAction: "Model debt payoff sequence",
    targetPrice: "310000",
    programInterest: "FHA",
    notes: "Auto loan and revolving balances are driving DTI.",
    timeline: "90 days",
    creditRange: "580-619",
    monthlyIncome: "4800",
    monthlyDebt: "2700",
    cashAmount: "6000",
    housingPayment: "1600",
    mainProblems: ["Too much debt / DTI too high", "Credit score too low"],
    availableDocs: ["Paystubs", "ID"],
    handoff: {
      status: "Paused",
      partnerName: "",
      contactPerson: "",
      dateSent: "",
      nextFollowUp: "2026-06-10",
      notes: "Needs DTI sprint before handoff."
    },
    outcome: {
      status: "Needs DTI sprint",
      date: "2026-05-27",
      source: "Internal user",
      workedReason: "",
      failedReason: "DTI",
      notes: "Debt sequence needed.",
      nextAction: "Model payoff and lower purchase range",
      nextFollowUp: "2026-06-10"
    }
  },
  {
    id: uid(),
    name: "Riley Stone",
    email: "riley@example.com",
    phone: "555-0158",
    state: "AZ",
    partner: "Direct",
    owner: "Desk",
    stage: "Paused: Build Plan",
    obstacle: "Prior denial",
    creditBand: 560,
    dti: 65,
    cash: "none",
    incomeType: "Unknown",
    consent: "Signed",
    nextAction: "Protect and refer before lender review",
    targetPrice: "300000",
    programInterest: "FHA",
    notes: "No stable income reported and affordability concern.",
    timeline: "6+ months",
    creditRange: "Under 580",
    monthlyIncome: "",
    monthlyDebt: "2400",
    cashAmount: "0",
    housingPayment: "1500",
    mainProblems: ["Not sure"],
    availableDocs: ["ID"],
    protectionFlags: ["No stable income", "Affordability concern"],
    handoff: {
      status: "Sent to housing counselor",
      partnerName: "Housing Assistance Agency",
      contactPerson: "Counseling Intake",
      dateSent: "2026-05-25",
      nextFollowUp: "2026-06-08",
      notes: "Referred for counseling before lender review."
    },
    outcome: {
      status: "Not safe to proceed",
      date: "2026-05-25",
      source: "Counselor",
      workedReason: "",
      failedReason: "Affordability concern",
      notes: "Needs stability plan before any financing conversation.",
      nextAction: "Follow up after counseling",
      nextFollowUp: "2026-06-08"
    }
  }
];

let lenders = storage.getLenders(defaultLenders).map((lender) => ({ id: lender.id || uid(), ...lender }));
storage.saveLenders(lenders);
let borrowers = loadBorrowers();
let currentUser = storage.getCurrentUser();
let activeView = "command";
let selectedFileId = borrowers[0]?.id || "";
let pendingImports = [];
let pendingPacketAction = "";

const viewTitles = {
  command: "Home",
  import: "Add Many Leads",
  intake: "Add One Buyer",
  diagnosis: "Review Buyer",
  queue: "Work Files",
  lenders: "Find Lenders",
  partners: "Partner Pipeline",
  consent: "Permissions",
  audit: "Audit Logs"
};

function loadBorrowers() {
  const records = storage.getBuyers(sampleBorrowers);
  return records.map(ensureFileState);
}

function saveBorrowers() {
  storage.saveBuyers(borrowers);
}

function ensureFileState(file) {
  file.scan ||= buildScanResult(file);
  file.handoff ||= defaultHandoff(file);
  file.outcome ||= defaultOutcome(file);
  file.consentDetails ||= defaultConsentDetails(file);
  file.visibility ||= defaultVisibility(file);
  const path = pathFor(file);
  file.tasks ||= taskDefaults(path, file.scan).map((label) => ({ id: uid(), label, done: false }));
  file.documents ||= documentDefaults(path).map((label) => ({ id: uid(), label, done: false }));
  file.activity ||= [
    {
      id: uid(),
      at: new Date().toISOString(),
      note: "File created in ApprovalPath OS."
    }
  ];
  return file;
}

function defaultConsentDetails(file) {
  const signed = file.consent === "Signed";
  return {
    dataProcessing: signed,
    contactPermission: signed,
    shareWithLender: signed,
    shareWithRealtorBuilder: signed,
    shareWithCounselor: signed,
    packetExportAllowed: signed,
    lastUpdatedAt: signed ? todayISO() : "",
    notes: signed ? "Migrated from signed permission status." : ""
  };
}

function defaultVisibility() {
  return {
    level: "None",
    sharedWith: "",
    notes: "",
    updatedAt: ""
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function defaultHandoff(file) {
  return {
    status: file.consent === "Signed" ? "Ready to send" : "Not sent yet",
    partnerName: "",
    contactPerson: "",
    dateSent: "",
    nextFollowUp: "",
    notes: ""
  };
}

function defaultOutcome(file) {
  return {
    status: "No outcome yet",
    date: "",
    source: "Internal user",
    workedReason: "",
    failedReason: "",
    notes: "",
    nextAction: file.nextAction || "",
    nextFollowUp: ""
  };
}

function taskDefaults(path, scan = null) {
  const pathTasks = {
    "DPA Stack Path": ["Screen DPA eligibility", "Model seller/lender credit", "Confirm gift/reserve options"],
    "Manual Underwrite Path": ["Build compensating-factor memo", "Collect rental history", "Draft explanation letters"],
    "Income Rescue Path": ["Reconcile tax returns", "Collect bank statements", "Check alternative-doc product fit"],
    "Credit Comeback Path": ["Identify credit blockers", "Confirm timing rules", "Route to qualified credit/budget partner"],
    "Debt Strategy Path": ["Model debt payoff sequence", "Recalculate DTI", "Set purchase price guardrail"],
    "Alternative Product Path": ["Identify non-QM fit", "Check reserve requirements", "Confirm pricing tolerance"],
    "Property Rescue Path": ["Identify collateral issue", "Find property-compatible lender", "Define repair/condition path"],
    "Pause and Build Path": ["Set build-plan milestones", "Schedule 30-day check-in", "Define re-entry criteria"]
  };
  const scanTasks = scan?.tasks || [];
  return uniqueList([...baseTasks, ...(pathTasks[path] || []), ...scanTasks]);
}

function documentDefaults(path) {
  const pathDocs = {
    "DPA Stack Path": ["DPA application", "Household income proof", "Homebuyer education certificate"],
    "Manual Underwrite Path": ["12-month rent history", "Compensating-factor memo", "Reserves proof"],
    "Income Rescue Path": ["Year-to-date P&L", "Business bank statements", "Business license or CPA letter"],
    "Credit Comeback Path": ["Credit report summary", "Derogatory account documentation", "Budget plan"],
    "Debt Strategy Path": ["Debt payoff proof", "Updated liability statement"],
    "Alternative Product Path": ["12-24 month bank statements", "Asset statements", "Non-QM scenario sheet"],
    "Property Rescue Path": ["Purchase contract", "Inspection notes", "Repair bid or condition photos"]
  };
  return [...baseDocuments, ...(pathDocs[path] || [])];
}

function calculateScore(file) {
  const credit = file.creditBand >= 680 ? 2 : file.creditBand >= 640 ? 7 : file.creditBand >= 600 ? 12 : file.creditBand >= 560 ? 17 : 20;
  const capacity = file.dti <= 35 ? 2 : file.dti <= 43 ? 7 : file.dti <= 50 ? 12 : file.dti <= 57 ? 17 : 20;
  const capital = file.cash === "ready" ? 2 : file.cash === "short" ? 12 : 20;
  const collateral = file.obstacle === "Property issue" ? 13 : 3;
  const docs = ["Self-employed income", "Documentation gap", "Prior denial"].includes(file.obstacle) ? 12 : 5;
  const compliance = file.consent === "Revoked" ? 10 : 2;
  return { credit, capacity, capital, collateral, docs, compliance, total: credit + capacity + capital + collateral + docs + compliance };
}

function buildScanResult(file) {
  const problems = Array.isArray(file.mainProblems) ? file.mainProblems : [];
  const docs = Array.isArray(file.availableDocs) ? file.availableDocs : [];
  const flags = Array.isArray(file.protectionFlags) ? file.protectionFlags : [];
  const creditRange = file.creditRange || creditRangeFromBand(file.creditBand);
  const creditBand = creditBandFromRange(creditRange);
  const monthlyIncome = numberValue(file.monthlyIncome);
  const monthlyDebt = numberValue(file.monthlyDebt);
  const dtiEstimate = monthlyIncome > 0 ? Math.round((monthlyDebt / monthlyIncome) * 100) : Number(file.dti || 50);
  const cashAmount = numberValue(file.cashAmount);
  const primaryBlocker = classifyPrimaryBlocker(file, problems, creditBand, dtiEstimate, cashAmount, docs, flags);
  const secondaryBlockers = classifySecondaryBlockers(file, problems, primaryBlocker, creditBand, dtiEstimate, cashAmount, docs, flags);
  const rescueTier = classifyRescueTier(file, primaryBlocker, secondaryBlockers, creditBand, dtiEstimate, cashAmount, docs, flags);
  const dpaNeeded = primaryBlocker === "CASH" || secondaryBlockers.includes("CASH") || secondaryBlockers.includes("DPA_NEEDED") || problems.includes("Not enough cash to close");
  const lenderReadyStatus = lenderReadyFromTier(rescueTier, docs);
  const recommendedNextMove = recommendedMove(primaryBlocker, rescueTier, dpaNeeded);
  return {
    rescueTier,
    primaryBlocker,
    secondaryBlockers,
    timeline: file.timeline || "Unknown",
    cashAvailable: cashAmount ? `$${cashAmount.toLocaleString()}` : file.cash || "Unknown",
    creditRange,
    incomeType: file.incomeType || "Unknown",
    dpaNeeded: dpaNeeded ? "Possible" : "No",
    lenderReadyStatus,
    recommendedNextMove,
    tasks: tasksForBlocker(primaryBlocker, secondaryBlockers, rescueTier),
    dtiEstimate,
    availableDocs: docs,
    protectionFlags: flags
  };
}

function classifyPrimaryBlocker(file, problems, creditBand, dtiEstimate, cashAmount, docs, flags) {
  if (flags.length) return "UNKNOWN";
  if (problems.includes("Credit score too low") || creditBand < 580) return "CREDIT";
  if (problems.includes("Too much debt / DTI too high") || dtiEstimate >= 55) return "DTI";
  if (problems.includes("Not enough cash to close") || (file.cashAmount !== undefined && cashAmount < 3000) || file.cash === "none") return "CASH";
  if (problems.includes("Income could not be verified")) return "INCOME";
  if (problems.includes("Self-employed income problem")) return "INCOME";
  if (problems.includes("Job history problem")) return "EMPLOYMENT";
  if (problems.includes("Property/appraisal problem")) return "PROPERTY";
  if (problems.includes("Missing documents") || docs.length < 3) return "DOCUMENTS";
  if (problems.includes("VA/USDA/FHA/DPA not checked")) return "PROGRAM_MISMATCH";
  return blockerFromObstacle(file.obstacle);
}

function classifySecondaryBlockers(file, problems, primary, creditBand, dtiEstimate, cashAmount, docs) {
  const blockers = [];
  if (creditBand < 620) blockers.push("CREDIT");
  if (dtiEstimate >= 50) blockers.push("DTI");
  if ((file.cashAmount !== undefined && cashAmount < 10000) || file.cash === "short" || file.cash === "none") blockers.push("CASH", "DPA_NEEDED");
  if (["Self-employed", "1099 / Gig", "Mixed income", "Unknown"].includes(file.incomeType)) blockers.push("INCOME");
  if (problems.includes("Job history problem")) blockers.push("EMPLOYMENT");
  if (problems.includes("Property/appraisal problem")) blockers.push("PROPERTY");
  if (docs.length < 4 || problems.includes("Missing documents")) blockers.push("DOCUMENTS");
  if (problems.includes("VA/USDA/FHA/DPA not checked")) blockers.push("PROGRAM_MISMATCH");
  return uniqueList(blockers.filter((blocker) => blocker !== primary)).slice(0, 5);
}

function classifyRescueTier(file, primary, secondary, creditBand, dtiEstimate, cashAmount, docs, flags) {
  const hasIncome = numberValue(file.monthlyIncome) > 0 || !["Unknown", ""].includes(file.incomeType || "");
  const timelineFast = ["Now", "30 days"].includes(file.timeline);
  const fixableProblems = ["DOCUMENTS", "PROGRAM_MISMATCH", "DPA_NEEDED"];
  const noStableIncome = flags.includes("No stable income") || file.incomeType === "Unknown";
  const extremeRisk = flags.length || noStableIncome || dtiEstimate >= 70 || (!cashAmount && primary === "CASH" && creditBand < 580);

  if (extremeRisk) return "Protect & Refer";
  if (hasIncome && timelineFast && (fixableProblems.includes(primary) || secondary.some((blocker) => fixableProblems.includes(blocker)) || cashAmount >= 5000)) {
    return "Rescue Now";
  }
  if (hasIncome && creditBand >= 580 && creditBand < 620) return "Approval Sprint";
  if (hasIncome && (dtiEstimate >= 50 || primary === "INCOME" || primary === "DTI" || primary === "CASH" || docs.length < 4)) return "Approval Sprint";
  if (creditBand < 580 || (file.cashAmount !== undefined && cashAmount < 3000) || !hasIncome) return "Rebuild First";
  return "Approval Sprint";
}

function lenderReadyFromTier(tier, docs) {
  if (tier === "Protect & Refer") return "Refer first";
  if (tier === "Rebuild First") return "Needs sprint";
  if (docs.length < 4) return "Needs documents";
  if (tier === "Rescue Now") return "Ready for review";
  return "Needs sprint";
}

function recommendedMove(primary, tier, dpaNeeded) {
  if (tier === "Protect & Refer") return "Protect the buyer first. Route to counseling, nonprofit, or qualified help before lender review.";
  if (primary === "CASH" || dpaNeeded) return "Run DPA screen before sending to lender.";
  if (primary === "INCOME") return "Collect income documents before lender review.";
  if (primary === "DTI") return "Estimate current DTI and identify debts that could change the file.";
  if (primary === "CREDIT") return "Collect current score estimate and route to credit-readiness review without promising credit repair.";
  if (primary === "DOCUMENTS") return "Complete the missing document checklist before lender review.";
  if (primary === "PROGRAM_MISMATCH") return "Check FHA, VA, USDA, DPA, portfolio, non-QM, and local credit union paths.";
  return "Complete the file checklist, then choose the best lender lane.";
}

function tasksForBlocker(primary, secondary, tier) {
  const blockers = uniqueList([primary, ...secondary]);
  const tasks = [];
  blockers.forEach((blocker) => {
    if (blocker === "CREDIT") tasks.push("Collect current credit score estimate", "Identify recent late payments, collections, or high utilization", "Do not promise credit repair");
    if (blocker === "DTI") tasks.push("Estimate current debt-to-income ratio", "Identify debts that could be paid down", "Check whether all income was counted", "Consider lower price point or different program");
    if (blocker === "CASH" || blocker === "DPA_NEEDED") tasks.push("Run DPA screen", "Check seller-credit possibility", "Check lender-credit possibility", "Ask about gift funds", "Check VA/USDA if eligible");
    if (blocker === "INCOME") tasks.push("Collect paystubs, W-2s, tax returns, 1099s, and bank statements", "Mark complex income if self-employed or variable", "Consider portfolio or non-QM review category if needed");
    if (blocker === "EMPLOYMENT") tasks.push("Document job history and gaps", "Confirm start dates and income stability");
    if (blocker === "DOCUMENTS") tasks.push("Generate missing document checklist", "Mark file not lender-ready until documents are confirmed");
    if (blocker === "PROPERTY") tasks.push("Collect property details and appraisal or inspection concerns", "Check property-compatible lender path");
    if (blocker === "PROGRAM_MISMATCH") tasks.push("Check FHA", "Check VA", "Check USDA", "Check DPA", "Check portfolio/non-QM", "Check local credit union/community bank path");
  });
  if (tier === "Protect & Refer") tasks.unshift("Do not push into lender review until risk is resolved");
  return uniqueList(tasks).slice(0, 12);
}

function blockerFromObstacle(obstacle) {
  if (obstacle === "Low credit score") return "CREDIT";
  if (obstacle === "High DTI") return "DTI";
  if (obstacle === "Cash-to-close shortage") return "CASH";
  if (obstacle === "Self-employed income") return "INCOME";
  if (obstacle === "Property issue") return "PROPERTY";
  if (obstacle === "Documentation gap") return "DOCUMENTS";
  if (obstacle === "Manual underwriting needed" || obstacle === "Prior denial") return "PROGRAM_MISMATCH";
  return "UNKNOWN";
}

function creditBandFromRange(range) {
  if (range === "700+") return 720;
  if (range === "660-699") return 680;
  if (range === "620-659") return 640;
  if (range === "580-619") return 600;
  return 560;
}

function creditRangeFromBand(band) {
  const score = Number(band || 600);
  if (score >= 700) return "700+";
  if (score >= 660) return "660-699";
  if (score >= 620) return "620-659";
  if (score >= 580) return "580-619";
  return "Under 580";
}

function numberValue(value) {
  return Number(String(value || "").replace(/[^0-9.]/g, "")) || 0;
}

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

function statusFor(score) {
  if (score <= 25) return "Likely Ready Now";
  if (score <= 50) return "Needs Better Lender Fit";
  if (score <= 70) return "Needs Conditions Cleared";
  if (score <= 85) return "Needs Build Plan";
  return "Not Ready Yet";
}

function pathFor(file) {
  const scan = file.scan || null;
  if (scan?.primaryBlocker === "CASH" || scan?.secondaryBlockers?.includes("DPA_NEEDED")) return "DPA Stack Path";
  if (scan?.primaryBlocker === "DTI") return "Debt Strategy Path";
  if (scan?.primaryBlocker === "CREDIT") return "Credit Comeback Path";
  if (scan?.primaryBlocker === "INCOME" || scan?.primaryBlocker === "EMPLOYMENT") return "Income Rescue Path";
  if (scan?.primaryBlocker === "PROPERTY") return "Property Rescue Path";
  if (scan?.primaryBlocker === "PROGRAM_MISMATCH") return "Manual Underwrite Path";
  if (scan?.rescueTier === "Protect & Refer") return "Pause and Build Path";
  const obstacle = file.obstacle;
  if (obstacle === "Cash-to-close shortage") return "DPA Stack Path";
  if (obstacle === "Manual underwriting needed" || obstacle === "Prior denial") return "Manual Underwrite Path";
  if (obstacle === "Self-employed income") return "Income Rescue Path";
  if (obstacle === "Low credit score") return "Credit Comeback Path";
  if (obstacle === "High DTI") return "Debt Strategy Path";
  if (obstacle === "Property issue") return "Property Rescue Path";
  if (file.programInterest === "Non-QM" || file.programInterest === "Portfolio") return "Alternative Product Path";
  return "Pause and Build Path";
}

function pillClass(value) {
  if (["Approved", "Signed", "Likely Ready Now", "Rescue Now"].includes(value)) return "green";
  if (["Needs Build Plan", "Sent", "Paused: Build Plan", "Approval Sprint", "Rebuild First"].includes(value)) return "amber";
  if (["Not Ready Yet", "Revoked", "Ineligible: Future Review", "Protect & Refer"].includes(value)) return "red";
  if (value.includes("Better Lender") || value.includes("Path")) return "blue";
  return "purple";
}

function can(permission) {
  return Boolean(rolePermissions[currentUser.role]?.[permission]);
}

function isInternalRole() {
  return ["Owner", "Admin", "File Analyst"].includes(currentUser.role);
}

function visibleBorrowers() {
  if (isInternalRole()) return borrowers;
  return borrowers.filter((file) => visibilityRank(file.visibility?.level) > 0 && hasAnyShareConsent(file));
}

function visibilityRank(level = "None") {
  return visibilityLevels.indexOf(level);
}

function hasAnyShareConsent(file) {
  const consent = file.consentDetails || defaultConsentDetails(file);
  return consent.shareWithLender || consent.shareWithRealtorBuilder || consent.shareWithCounselor || consent.packetExportAllowed;
}

function selectedBuyerList() {
  return visibleBorrowers();
}

function audit(actionType, entityType, entityId, buyerName, summary, beforeValue = null, afterValue = null) {
  storage.addAuditLog({
    actorName: currentUser.name || "Demo User",
    actorRole: currentUser.role || "Owner",
    actionType,
    entityType,
    entityId,
    buyerName: buyerName || "",
    summary,
    beforeValue,
    afterValue
  });
}

function permissionMessage() {
  return "Buyer permission is required before sharing or exporting this file. Update permissions before continuing.";
}

function requiredConsentForHandoff(status) {
  if (status === "Sent to lender" || status === "Sent to DPA partner") return "shareWithLender";
  if (status === "Sent to housing counselor") return "shareWithCounselor";
  if (status === "Sent to realtor/builder") return "shareWithRealtorBuilder";
  return "";
}

function hasConsent(file, key) {
  return Boolean((file.consentDetails || defaultConsentDetails(file))[key]);
}

function setupNavigation() {
  document.getElementById("buyerPortalMode").addEventListener("click", () => setAppMode("buyer"));
  document.getElementById("adminWorkspaceMode").addEventListener("click", () => setAppMode("admin"));
  document.querySelectorAll("[data-portal-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.portalScroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-view], [data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => {
      setAppMode("admin");
      setView(button.dataset.view || button.dataset.viewShortcut);
    });
  });
  const roleSelect = document.getElementById("currentRoleSelect");
  roleSelect.replaceChildren(...userRoles.map((role) => new Option(role, role)));
  roleSelect.value = currentUser.role || "Owner";
  roleSelect.addEventListener("change", () => {
    const before = { ...currentUser };
    currentUser = { name: `Demo ${roleSelect.value}`, role: roleSelect.value };
    storage.setCurrentUser(currentUser);
    audit("Role changed", "User", currentUser.name, "", `Switched demo role to ${currentUser.role}.`, before, currentUser);
    render();
  });
}

function setAppMode(mode) {
  const buyerMode = mode === "buyer";
  document.getElementById("buyerPortal").hidden = !buyerMode;
  document.getElementById("adminApp").hidden = buyerMode;
  document.getElementById("buyerPortalMode").classList.toggle("active", buyerMode);
  document.getElementById("adminWorkspaceMode").classList.toggle("active", !buyerMode);
}

function setView(view) {
  activeView = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
  document.getElementById("viewTitle").textContent = viewTitles[view];
  render();
}

function populateFilters() {
  const stageFilter = document.getElementById("stageFilter");
  const pathFilter = document.getElementById("pathFilter");
  const queueStage = document.getElementById("queueStage");
  const workQueueFilter = document.getElementById("workQueueFilter");
  const handoffStatus = document.getElementById("handoffStatus");
  const outcomeStatus = document.getElementById("outcomeStatus");
  const outcomeSource = document.getElementById("outcomeSource");
  const outcomeWorkedReason = document.getElementById("outcomeWorkedReason");
  const outcomeFailedReason = document.getElementById("outcomeFailedReason");
  stageFilter.replaceChildren(...stages.map((stage) => new Option(stage, stage)));
  pathFilter.replaceChildren(...paths.map((path) => new Option(path, path)));
  queueStage.replaceChildren(...stages.filter((stage) => stage !== "All").map((stage) => new Option(stage, stage)));
  workQueueFilter.replaceChildren(...workViews.map((view) => new Option(view, view)));
  handoffStatus.replaceChildren(...handoffStatuses.map((status) => new Option(status, status)));
  outcomeStatus.replaceChildren(...outcomeStatuses.map((status) => new Option(status, status)));
  outcomeSource.replaceChildren(...outcomeSources.map((source) => new Option(source, source)));
  outcomeWorkedReason.replaceChildren(...workedReasons.map((reason) => new Option(reason, reason)));
  outcomeFailedReason.replaceChildren(...failedReasons.map((reason) => new Option(reason, reason)));
  stageFilter.addEventListener("change", renderCommand);
  pathFilter.addEventListener("change", renderCommand);
  workQueueFilter.addEventListener("change", renderWorkQueue);
  document.getElementById("searchInput").addEventListener("input", renderCommand);
  document.getElementById("lenderFitFilter").addEventListener("change", renderLenders);
  ["auditBuyerFilter", "auditActionFilter", "auditActorFilter", "auditRoleFilter", "auditDateFilter"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderAuditLogs);
    document.getElementById(id)?.addEventListener("change", renderAuditLogs);
  });
}

function render() {
  renderBuyerPortal();
  renderCommand();
  renderImportPreview();
  renderDiagnosis();
  renderQueue();
  renderWorkQueue();
  renderLenders();
  renderPartners();
  renderConsent();
  renderAuditLogs();
  applyRolePermissions();
}

function renderBuyerPortal() {
  const file = borrowers[0];
  if (!file) return;
  const scan = file.scan || buildScanResult(file);
  const followUp = file.outcome?.nextFollowUp || file.handoff?.nextFollowUp || "Not set yet";
  document.getElementById("portalHeroTier").textContent = scan.rescueTier;
  document.getElementById("portalHeroMove").textContent = scan.recommendedNextMove;
  document.getElementById("portalHeroFollowUp").textContent = followUp === "Not set yet" ? "Pending" : followUp;
  document.getElementById("portalBuyerName").textContent = file.name || "Buyer file";
  document.getElementById("portalStageBadge").textContent = file.stage || "In review";
  document.getElementById("portalRescueTier").textContent = scan.rescueTier;
  document.getElementById("portalPrimaryBlocker").textContent = blockerLabels[scan.primaryBlocker] || scan.primaryBlocker;
  document.getElementById("portalNextAction").textContent = file.nextAction || scan.recommendedNextMove;
  document.getElementById("portalNextFollowUp").textContent = followUp;
}

function renderImportPreview() {
  const summary = document.getElementById("importSummary");
  const button = document.getElementById("commitLeadImportBtn");
  if (!summary || !button) return;
  button.disabled = pendingImports.length === 0;
  summary.replaceChildren();
  if (pendingImports.length) {
    const snapshot = document.createElement("div");
    snapshot.className = "snapshot";
    [["Checked", pendingImports.length], ["New Leads", pendingImports.filter((lead) => !isDuplicateLead(lead)).length]].forEach(([label, value]) => {
      const item = document.createElement("div");
      const title = document.createElement("span");
      const count = document.createElement("strong");
      title.textContent = String(label);
      count.textContent = String(value);
      item.append(title, count);
      snapshot.append(item);
    });
    summary.append(snapshot);
  } else {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No leads checked yet. Choose a CSV or JSON file, then click Check the Leads.";
    summary.append(empty);
  }

  const table = document.getElementById("importPreviewTable");
  table.replaceChildren();
  if (pendingImports.length) {
    pendingImports.slice(0, 100).forEach((lead) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      const name = document.createElement("div");
      const duplicate = document.createElement("span");
      name.className = "borrower-name";
      duplicate.className = "muted";
      name.append(document.createTextNode(lead.name || "Unnamed Lead"));
      duplicate.textContent = isDuplicateLead(lead) ? "Possible duplicate" : "New file";
      name.append(duplicate);
      nameCell.append(name);
      const values = [lead.email || lead.phone || "No contact", lead.obstacle || "Prior denial", lead.importSource || "Uploaded file"];
      row.append(nameCell, ...values.map((value) => {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        return cell;
      }));
      table.append(row);
    });
  } else {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    const empty = document.createElement("div");
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    cell.colSpan = 4;
    empty.className = "empty-state";
    title.textContent = "Nothing to preview yet.";
    detail.textContent = "After you check a lead file, the first 100 leads will appear here.";
    empty.append(title, detail);
    cell.append(empty);
    row.append(cell);
    table.append(row);
  }
}

function renderCommand() {
  const rows = filteredBorrowers();
  const visible = visibleBorrowers();
  const metrics = [
    ["Buyer Files", visible.length],
    ["Permission Signed", visible.filter((file) => file.consent === "Signed").length],
    ["Average Difficulty", Math.round(visible.reduce((sum, file) => sum + calculateScore(file).total, 0) / visible.length) || 0],
    ["Ready for Lender", visible.filter((file) => ["Lender Match Ready", "Submitted to Partner", "Approved"].includes(file.stage)).length]
  ];

  document.getElementById("metricGrid").innerHTML = safeHtml`${metrics
    .map(([label, value]) => safeHtml`<div class="metric"><span>${label}</span><strong>${value}</strong></div>`)}`;

  document.getElementById("borrowerTable").innerHTML = rows.length ? safeHtml`${rows
    .map((file) => {
      const score = calculateScore(file).total;
      const status = statusFor(score);
      const path = pathFor(file);
      return safeHtml`
        <tr>
          <td><div class="borrower-name">${file.name}<span class="muted">${file.partner || "Direct"} · ${file.state || "NA"}</span></div></td>
          <td><span class="pill ${pillClass(file.stage)}">${file.stage}</span></td>
          <td><strong>${score}</strong></td>
          <td><span class="pill ${pillClass(status)}">${status}</span></td>
          <td>${path}</td>
          <td>${file.nextAction || "Assign next action"}</td>
          <td>${file.owner || "Desk"}</td>
          <td><button class="small-btn" type="button" data-open-file="${file.id}">Open File</button></td>
        </tr>
      `;
    })}` : safeHtml`
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <strong>No buyers match this view.</strong>
            <span>Add a buyer, upload a lead list, or clear the filters.</span>
          </div>
        </td>
      </tr>
    `;

  document.querySelectorAll("[data-open-file]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedFileId = button.dataset.openFile;
      setView("queue");
    });
  });
  renderDashboard();
}

function renderDashboard() {
  const pipeline = document.getElementById("pipelineSnapshot");
  const blockers = document.getElementById("topBlockers");
  const lanes = document.getElementById("topLenderLanes");
  if (!pipeline || !blockers || !lanes) return;

  const visible = visibleBorrowers();
  const active = visible.filter((file) => !["Closed/Lost"].includes(file.stage));
  const dueFollowUps = visible.filter((file) => {
    const followUp = file.outcome?.nextFollowUp || file.handoff?.nextFollowUp;
    return followUp && followUp <= todayISO() && !isWonOrClosed(file) && !isLostOrNotReady(file);
  });
  const pipelineMetrics = [
    ["Active Files", active.length],
    ["Ready to Send", visible.filter((file) => file.handoff?.status === "Ready to send").length],
    ["Sent / In Review", visible.filter((file) => isSentOrInReview(file)).length],
    ["Follow-Ups Due", dueFollowUps.length],
    ["More Info", visible.filter((file) => isMoreInfoRequested(file)).length],
    ["Won / Closed", visible.filter((file) => isWonOrClosed(file)).length],
    ["Protect & Refer", visible.filter((file) => file.scan?.rescueTier === "Protect & Refer").length],
    ["Outcome Needed", visible.filter((file) => needsOutcome(file)).length]
  ];

  pipeline.innerHTML = miniMetrics(pipelineMetrics);
  blockers.innerHTML = miniMetrics(topCounts(visible.map((file) => blockerLabels[file.scan?.primaryBlocker] || "Unknown")).slice(0, 6));
  lanes.innerHTML = miniMetrics(topCounts(visible.map((file) => lenderLaneFor(file))).slice(0, 6));
}

function miniMetrics(items) {
  return items.length ? safeHtml`${items
    .map(([label, value]) => safeHtml`<div class="mini-metric"><span>${label}</span><strong>${value}</strong></div>`)}`
    : safeHtml`<p class="muted">No data yet.</p>`;
}

function topCounts(values) {
  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function filteredBorrowers() {
  const stage = document.getElementById("stageFilter").value || "All";
  const path = document.getElementById("pathFilter").value || "All";
  const search = (document.getElementById("searchInput").value || "").toLowerCase();
  return visibleBorrowers().filter((file) => {
    const matchesStage = stage === "All" || file.stage === stage;
    const matchesPath = path === "All" || pathFor(file) === path;
    const haystack = `${file.name} ${file.partner} ${file.obstacle} ${file.nextAction}`.toLowerCase();
    return matchesStage && matchesPath && haystack.includes(search);
  });
}

function handleIntake() {
  document.getElementById("intakeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const validation = validateBuyerForm(form);
    if (!validation.ok) {
      window.alert(validation.message);
      return;
    }
    const file = Object.fromEntries(form.entries());
    file.id = uid();
    file.phone = formatPhone(file.phone);
    file.mainProblems = form.getAll("mainProblems");
    file.availableDocs = form.getAll("availableDocs");
    file.protectionFlags = form.getAll("protectionFlags");
    file.creditBand = creditBandFromRange(file.creditRange);
    file.dti = file.monthlyIncome ? Math.round((numberValue(file.monthlyDebt) / numberValue(file.monthlyIncome)) * 100) || 50 : 50;
    file.cash = normalizeCash(file.cashAmount);
    file.obstacle = obstacleFromScanProblems(file.mainProblems);
    file.scan = buildScanResult(file);
    file.consentDetails = defaultConsentDetails(file);
    file.visibility = defaultVisibility(file);
    file.nextAction = file.nextAction === "Complete file review" ? file.scan.recommendedNextMove : file.nextAction;
    borrowers.unshift(ensureFileState(file));
    selectedFileId = file.id;
    saveBorrowers();
    audit("Buyer created", "Buyer", file.id, file.name, `Created buyer file for ${file.name}.`, null, file);
    audit("Impossible Scan completed", "Buyer", file.id, file.name, `Completed initial scan. Tier: ${file.scan.rescueTier}.`, null, file.scan);
    event.currentTarget.reset();
    setView("queue");
  });
}

function handlePortalIntake() {
  document.getElementById("portalStartForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("portalSubmitNote").textContent = "Please enter an email that looks like name@example.com.";
      return;
    }
    if (phone && phone.replace(/\D/g, "").length < 7) {
      document.getElementById("portalSubmitNote").textContent = "Please enter a phone number with at least 7 digits, or leave it blank.";
      return;
    }
    const problem = form.get("problem") || "Not sure";
    const file = ensureFileState({
      id: uid(),
      name: form.get("name") || "Portal Buyer",
      email,
      phone: formatPhone(phone),
      targetCity: form.get("targetCity") || "",
      state: "",
      partner: "Buyer Portal",
      owner: "Desk",
      stage: "New Intake",
      obstacle: obstacleFromScanProblems([problem]),
      creditRange: "620-659",
      creditBand: 640,
      dti: 50,
      cash: "short",
      incomeType: "Unknown",
      consent: "Not Sent",
      timeline: form.get("timeline") || "Now",
      mainProblems: [problem],
      availableDocs: [],
      protectionFlags: [],
      nextAction: "Internal team review from buyer portal intake",
      programInterest: "FHA",
      notes: form.get("notes") || "Submitted from buyer portal."
    });
    file.scan = buildScanResult(file);
    borrowers.unshift(file);
    selectedFileId = file.id;
    saveBorrowers();
    audit("Buyer created", "Buyer", file.id, file.name, `Buyer portal intake created for ${file.name}.`, null, file);
    audit("Impossible Scan completed", "Buyer", file.id, file.name, `Portal intake scan created. Tier: ${file.scan.rescueTier}.`, null, file.scan);
    event.currentTarget.reset();
    document.getElementById("portalSubmitNote").textContent = "Received. Your file is now in the admin workspace for review.";
    render();
  });
}

function validateBuyerForm(form) {
  const requiredNumbers = [
    ["monthlyIncome", "Please enter estimated monthly income as a number. Use 0 if unknown."],
    ["monthlyDebt", "Please enter estimated monthly debt as a number. Use 0 if unknown."],
    ["cashAmount", "Please enter estimated cash available as a number. Use 0 if unknown."],
    ["targetPrice", "Please enter target purchase price as a number. Use 0 if unknown."]
  ];
  for (const [name, message] of requiredNumbers) {
    const value = String(form.get(name) || "").trim();
    if (value && !isNumericEstimate(value)) return { ok: false, message };
  }
  const email = String(form.get("email") || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Please enter an email that looks like name@example.com." };
  const phone = String(form.get("phone") || "").trim();
  if (phone && phone.replace(/\D/g, "").length < 7) return { ok: false, message: "Please enter a phone number with at least 7 digits, or leave it blank." };
  if (!form.get("timeline")) return { ok: false, message: "Please choose a timeline." };
  if (!form.getAll("mainProblems").length) return { ok: false, message: "Please select at least one main problem for the Impossible File Scan." };
  return { ok: true, message: "" };
}

function isNumericEstimate(value) {
  return /^[$,\s]*\d+(\.\d+)?[$,\s]*$/.test(String(value || "").trim());
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value || "";
}

function obstacleFromScanProblems(problems) {
  if (problems.includes("Credit score too low")) return "Low credit score";
  if (problems.includes("Too much debt / DTI too high")) return "High DTI";
  if (problems.includes("Not enough cash to close")) return "Cash-to-close shortage";
  if (problems.includes("Self-employed income problem")) return "Self-employed income";
  if (problems.includes("Income could not be verified")) return "Self-employed income";
  if (problems.includes("Property/appraisal problem")) return "Property issue";
  if (problems.includes("Missing documents")) return "Documentation gap";
  if (problems.includes("VA/USDA/FHA/DPA not checked")) return "Manual underwriting needed";
  return "Prior denial";
}

function setupLeadImport() {
  document.getElementById("parseLeadFilesBtn").addEventListener("click", async () => {
    const input = document.getElementById("leadFileInput");
    const files = [...input.files]
      .filter((file) => /\.(csv|json)$/i.test(file.name) && file.size <= 2 * 1024 * 1024)
      .slice(0, 5);
    const parsed = [];

    for (const file of files) {
      const text = await file.text();
      const source = file.webkitRelativePath || file.name;
      if (/\.json$/i.test(file.name)) {
        parsed.push(...parseJsonLeads(text, source).slice(0, 500 - parsed.length));
      } else {
        parsed.push(...parseCsvLeads(text, source).slice(0, 500 - parsed.length));
      }
      if (parsed.length >= 500) break;
    }

    pendingImports = parsed.map(normalizeLead).filter((lead) => lead.name || lead.email || lead.phone);
    renderImportPreview();
  });

  document.getElementById("commitLeadImportBtn").addEventListener("click", () => {
    const imports = pendingImports
      .filter((lead) => !isDuplicateLead(lead))
      .map((lead) => ensureFileState({
        id: uid(),
        name: lead.name || "Unnamed Lead",
        email: lead.email || "",
        phone: lead.phone || "",
        state: lead.state || "",
        partner: lead.partner || lead.source || "Lead Import",
        owner: lead.owner || "Desk",
        stage: lead.consent === "Signed" ? "File Review" : "Consent Needed",
        obstacle: lead.obstacle || "Prior denial",
        creditBand: Number(lead.creditBand || 600),
        dti: Number(lead.dti || 50),
        cash: lead.cash || "short",
        incomeType: lead.incomeType || "Mixed income",
        consent: lead.consent || "Not Sent",
        nextAction: lead.nextAction || "Request consent and complete intake",
        targetPrice: lead.targetPrice || "",
        programInterest: lead.programInterest || "FHA",
        notes: lead.notes || `Imported from ${lead.importSource || "lead compile"}.`
      }));

    borrowers = [...imports, ...borrowers];
    selectedFileId = imports[0]?.id || selectedFileId;
    pendingImports = [];
    saveBorrowers();
    audit("Data imported", "Buyer", "", "", `Imported ${imports.length} buyer lead file${imports.length === 1 ? "" : "s"}.`, null, { count: imports.length });
    setView("command");
  });
}

function parseJsonLeads(text, source) {
  try {
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : data.leads || data.borrowers || data.records || [data];
    return rows.map((row) => ({ ...row, importSource: source }));
  } catch {
    return [];
  }
}

function parseCsvLeads(text, source) {
  const rows = parseCsv(text);
  return rows.map((row) => ({ ...row, importSource: source }));
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
  const fullName = pick("name", "full_name", "borrower", "lead_name") || [first, last].filter(Boolean).join(" ");
  const obstacle = pick("obstacle", "denial_reason", "denialreason", "issue", "status_reason") || inferObstacle(row);

  return {
    name: fullName,
    email: pick("email", "email_address", "borrower_email"),
    phone: formatPhone(pick("phone", "mobile", "cell", "borrower_phone")),
    state: pick("state", "target_state", "property_state"),
    partner: pick("partner", "agent", "realtor", "builder", "source_partner"),
    source: pick("source", "lead_source"),
    owner: pick("owner", "assigned_to"),
    obstacle,
    creditBand: pick("credit_score", "creditscore", "fico", "middle_score"),
    dti: pick("dti", "debt_to_income", "debttoincome"),
    cash: normalizeCash(pick("cash", "cash_available", "down_payment", "funds_available")),
    incomeType: normalizeIncome(pick("income_type", "employment_type", "employment")),
    consent: normalizeConsent(pick("consent", "authorization", "consent_status")),
    nextAction: pick("next_action", "nextaction"),
    targetPrice: pick("target_price", "purchase_price", "price"),
    programInterest: pick("program", "loan_type", "product_interest"),
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
  const number = Number(text.replace(/[^0-9.]/g, ""));
  if (number) {
    if (number >= 15000) return "ready";
    if (number <= 3000) return "none";
    return "short";
  }
  if (text.includes("none") || text.includes("zero") || text.includes("little")) return "none";
  if (text.includes("short")) return "short";
  if (text.includes("ready") || text.includes("enough")) return "ready";
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

function isDuplicateLead(lead) {
  return borrowers.some((file) => {
    const sameEmail = lead.email && file.email && lead.email.toLowerCase() === file.email.toLowerCase();
    const samePhone = lead.phone && file.phone && lead.phone.replace(/\D/g, "") === file.phone.replace(/\D/g, "");
    const sameName = lead.name && file.name && lead.name.toLowerCase() === file.name.toLowerCase();
    return sameEmail || samePhone || sameName;
  });
}

function renderDiagnosis() {
  const select = document.getElementById("diagnosisSelect");
  const list = selectedBuyerList();
  const selected = selectedFileId || select.value || list[0]?.id;
  select.replaceChildren(...list.map((file) => new Option(file.name, file.id)));
  select.value = selected && list.some((file) => file.id === selected) ? selected : list[0]?.id;
  select.onchange = () => {
    selectedFileId = select.value;
    renderDiagnosis();
  };

  const file = list.find((item) => item.id === select.value) || list[0];
  if (!file) {
    document.getElementById("diagnosisSummary").innerHTML = `<div class="empty-state"><strong>No visible buyer files.</strong><span>Your current role can only see shared files.</span></div>`;
    document.getElementById("approvalPlan").innerHTML = "";
    return;
  }
  selectedFileId = file.id;
  const score = calculateScore(file);
  const status = statusFor(score.total);
  const path = pathFor(file);
  file.scan = buildScanResult(file);
  const scan = file.scan;
  fillEditScanForm(file);
  fillHandoffForm(file);
  fillOutcomeForm(file);
  fillVisibilityForm(file);
  renderLearningSnapshot(file);

  document.getElementById("diagnosisSummary").innerHTML = safeHtml`
    ${hardFileReviewCard(file, scan)}
    <div class="score-ring" style="--score:${score.total}"><span>${score.total}</span></div>
    <div class="tag-row">
      <span class="pill ${pillClass(status)}">${status}</span>
      <span class="pill blue">${path}</span>
      <span class="pill ${pillClass(file.consent)}">${file.consent}</span>
    </div>
    <div class="breakdown">
      ${breakdownRow("Credit", score.credit, 20)}
      ${breakdownRow("Capacity / DTI", score.capacity, 20)}
      ${breakdownRow("Capital", score.capital, 20)}
      ${breakdownRow("Collateral", score.collateral, 15)}
      ${breakdownRow("Documentation", score.docs, 15)}
      ${breakdownRow("Compliance", score.compliance, 10)}
    </div>
  `;

  const limitedLevel = !isInternalRole() ? file.visibility?.level : "Full partner packet";
  document.getElementById("approvalPlan").innerHTML = visibilityRank(limitedLevel) < 2 ? safeHtml`
    <div class="empty-state">
      <strong>Limited view</strong>
      <span>This role can see basic status only for this shared file.</span>
    </div>
  ` : safeHtml`
    <div class="tag-row">
      <span class="pill blue">${file.obstacle}</span>
      <span class="pill">${file.programInterest}</span>
      <span class="pill ${pillClass(scan.rescueTier)}">${scan.rescueTier}</span>
    </div>
    <div class="next-move-box">
      <strong>Recommended Next Move</strong>
      <p>${scan.recommendedNextMove}</p>
    </div>
    <div class="plan-list">
      ${planItem("Now", immediateAction(file))}
      ${planItem("30 Days", thirtyDayAction(file))}
      ${planItem("60 Days", sixtyDayAction(file))}
      ${planItem("90 Days", ninetyDayAction(file))}
      ${planItem("Routing", routingAction(path))}
    </div>
  `;
  if (visibilityRank(limitedLevel) >= 2) renderLenderMatch(file);
  else document.getElementById("lenderMatchPanel").innerHTML = `<div class="empty-state"><strong>Limited view</strong><span>Lender lane details are hidden for this role.</span></div>`;
}

function fillHandoffForm(file) {
  const form = document.getElementById("handoffForm");
  if (!form) return;
  file.handoff ||= defaultHandoff(file);
  setFormValue(form, "status", file.handoff.status || "Not sent yet");
  setFormValue(form, "partnerName", file.handoff.partnerName || "");
  setFormValue(form, "contactPerson", file.handoff.contactPerson || "");
  setFormValue(form, "dateSent", file.handoff.dateSent || "");
  setFormValue(form, "nextFollowUp", file.handoff.nextFollowUp || "");
  setFormValue(form, "notes", file.handoff.notes || "");
  document.getElementById("handoffPermissionConfirm").checked = false;
}

function fillOutcomeForm(file) {
  const form = document.getElementById("outcomeForm");
  if (!form) return;
  file.outcome ||= defaultOutcome(file);
  setFormValue(form, "status", file.outcome.status || "No outcome yet");
  setFormValue(form, "date", file.outcome.date || "");
  setFormValue(form, "source", file.outcome.source || "Internal user");
  setFormValue(form, "workedReason", file.outcome.workedReason || "");
  setFormValue(form, "failedReason", file.outcome.failedReason || "");
  setFormValue(form, "nextFollowUp", file.outcome.nextFollowUp || "");
  setFormValue(form, "notes", file.outcome.notes || "");
  setFormValue(form, "nextAction", file.outcome.nextAction || file.nextAction || "");
}

function fillVisibilityForm(file) {
  const form = document.getElementById("visibilityForm");
  if (!form) return;
  file.visibility ||= defaultVisibility(file);
  setFormValue(form, "level", file.visibility.level || "None");
  setFormValue(form, "sharedWith", file.visibility.sharedWith || "");
  setFormValue(form, "notes", file.visibility.notes || "");
}

function hardFileReviewCard(file, scan) {
  const secondary = scan.secondaryBlockers.length
    ? scan.secondaryBlockers.map((blocker) => blockerLabels[blocker] || blocker).join(", ")
    : "None identified yet";
  return safeHtml`
    <section class="hard-review">
      <div>
        <p class="eyebrow">Hard-File Review</p>
        <h4>${scan.rescueTier}</h4>
      </div>
      <dl class="review-grid">
        <div><dt>Primary Blocker</dt><dd>${blockerLabels[scan.primaryBlocker] || scan.primaryBlocker}</dd></div>
        <div><dt>Secondary Blockers</dt><dd>${secondary}</dd></div>
        <div><dt>Buyer Timeline</dt><dd>${scan.timeline}</dd></div>
        <div><dt>Cash Available</dt><dd>${scan.cashAvailable}</dd></div>
        <div><dt>Credit Range</dt><dd>${scan.creditRange}</dd></div>
        <div><dt>Income Type</dt><dd>${scan.incomeType}</dd></div>
        <div><dt>DPA Needed?</dt><dd>${scan.dpaNeeded}</dd></div>
        <div><dt>Lender-Ready Status</dt><dd>${scan.lenderReadyStatus}</dd></div>
      </dl>
    </section>
  `;
}

function fillEditScanForm(file) {
  const form = document.getElementById("editScanForm");
  if (!form) return;
  setFormValue(form, "timeline", file.timeline || "Now");
  setFormValue(form, "creditRange", file.creditRange || creditRangeFromBand(file.creditBand));
  setFormValue(form, "monthlyIncome", file.monthlyIncome || "");
  setFormValue(form, "monthlyDebt", file.monthlyDebt || "");
  setFormValue(form, "cashAmount", file.cashAmount || "");
  setFormValue(form, "incomeType", file.incomeType || "W-2");
  setCheckedValues(form, "mainProblems", file.mainProblems || []);
  setCheckedValues(form, "availableDocs", file.availableDocs || []);
  setCheckedValues(form, "protectionFlags", file.protectionFlags || []);
}

function setFormValue(form, name, value) {
  const field = form.elements[name];
  if (field) field.value = value;
}

function setCheckedValues(form, name, values) {
  form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function setupEditScanForm() {
  document.getElementById("editScanForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("editScans")) {
      window.alert("Your current role cannot edit scan answers.");
      return;
    }
    const file = activeFile();
    if (!file) return;
    const form = new FormData(event.currentTarget);
    const validation = validateBuyerForm(form);
    if (!validation.ok) {
      window.alert(validation.message);
      return;
    }
    const beforeScan = { ...(file.scan || {}) };
    const beforePath = pathFor(file);
    file.timeline = form.get("timeline");
    file.creditRange = form.get("creditRange");
    file.monthlyIncome = form.get("monthlyIncome");
    file.monthlyDebt = form.get("monthlyDebt");
    file.cashAmount = form.get("cashAmount");
    file.incomeType = form.get("incomeType");
    file.mainProblems = form.getAll("mainProblems");
    file.availableDocs = form.getAll("availableDocs");
    file.protectionFlags = form.getAll("protectionFlags");
    file.creditBand = creditBandFromRange(file.creditRange);
    file.dti = file.monthlyIncome ? Math.round((numberValue(file.monthlyDebt) / numberValue(file.monthlyIncome)) * 100) || 50 : file.dti || 50;
    file.cash = normalizeCash(file.cashAmount);
    file.obstacle = obstacleFromScanProblems(file.mainProblems);
    file.scan = buildScanResult(file);
    file.nextAction = file.scan.recommendedNextMove;
    file.tasks = taskDefaults(pathFor(file), file.scan).map((label) => ({ id: uid(), label, done: false }));
    file.documents = documentDefaults(pathFor(file)).map((label) => ({ id: uid(), label, done: false }));
    file.activity.push({
      id: uid(),
      at: new Date().toISOString(),
      note: `Updated Impossible File Scan. New tier: ${file.scan.rescueTier}.`
    });
    saveBorrowers();
    audit("Scan answers edited", "Buyer", file.id, file.name, `Updated scan answers for ${file.name}.`, beforeScan, file.scan);
    if (beforeScan.rescueTier !== file.scan.rescueTier) audit("Rescue tier recalculated", "Buyer", file.id, file.name, `Rescue tier changed from ${beforeScan.rescueTier || "unknown"} to ${file.scan.rescueTier}.`, beforeScan.rescueTier, file.scan.rescueTier);
    if (beforeScan.primaryBlocker !== file.scan.primaryBlocker) audit("Primary blocker changed", "Buyer", file.id, file.name, `Primary blocker changed to ${blockerLabels[file.scan.primaryBlocker] || file.scan.primaryBlocker}.`, beforeScan.primaryBlocker, file.scan.primaryBlocker);
    if (beforePath !== pathFor(file)) audit("Recommended route changed", "Buyer", file.id, file.name, `Recommended route changed to ${pathFor(file)}.`, beforePath, pathFor(file));
    render();
  });
}

function lenderLaneFor(file) {
  const scan = file.scan || buildScanResult(file);
  if (scan.rescueTier === "Protect & Refer") return "Housing Counseling / Nonprofit";
  if (scan.primaryBlocker === "CASH" || scan.secondaryBlockers.includes("DPA_NEEDED")) return "DPA First";
  if (scan.primaryBlocker === "INCOME" && ["Self-employed", "1099 / Gig", "Mixed income"].includes(file.incomeType)) return "Self-Employed / Bank Statement";
  if (scan.primaryBlocker === "DTI" || scan.primaryBlocker === "PROGRAM_MISMATCH") return "Manual Review";
  if (scan.primaryBlocker === "CREDIT" && scan.rescueTier === "Rebuild First") return "Housing Counseling / Nonprofit";
  if (scan.primaryBlocker === "PROPERTY") return "Property Specialty";
  if (file.programInterest === "Non-QM") return "Non-QM / Alternative Product";
  if (file.programInterest === "VA") return "VA Specialist";
  if (file.programInterest === "USDA") return "USDA Specialist";
  return "Portfolio / Community Bank";
}

function lenderMatchFor(file) {
  const lane = lenderLaneFor(file);
  const scan = file.scan || buildScanResult(file);
  const matched = lenders.filter((lender) => lender.lanes?.includes(lane) || lender.fit.includes(pathFor(file)));
  const nextQuestion = {
    "DPA First": "Can this buyer use DPA, seller credit, lender credit, gift funds, VA, or USDA before lender review?",
    "Manual Review": "Would a manual review consider this file, and what compensating factors are required?",
    "Self-Employed / Bank Statement": "Can the income be reviewed through tax returns, bank statements, P&L, or another lawful documentation path?",
    "Housing Counseling / Nonprofit": "Should this buyer be protected and referred before any lender submission?",
    "Property Specialty": "Does the property type or condition require a specialty lender or repair path?",
    "Non-QM / Alternative Product": "Is there an alternative product path, and is the cost suitable for the buyer?",
    "VA Specialist": "Is the buyer VA eligible, and does residual income or no-down-payment path improve the file?",
    "USDA Specialist": "Is the property area and household profile USDA eligible?",
    "Portfolio / Community Bank": "Would a relationship lender or local credit union review this file outside a standard agency box?"
  }[lane] || "Which lender lane should review this file first?";
  return { lane, matched, nextQuestion, scan };
}

function renderLenderMatch(file) {
  const panel = document.getElementById("lenderMatchPanel");
  if (!panel) return;
  const match = lenderMatchFor(file);
  panel.innerHTML = safeHtml`
    <div class="lane-card">
      <p class="eyebrow">Recommended lender lane</p>
      <h4>${match.lane}</h4>
      <p>${match.nextQuestion}</p>
      <div class="tag-row">
        <span class="pill ${pillClass(match.scan.rescueTier)}">${match.scan.rescueTier}</span>
        <span class="pill blue">${blockerLabels[match.scan.primaryBlocker] || match.scan.primaryBlocker}</span>
        <span class="pill">${match.scan.lenderReadyStatus}</span>
      </div>
    </div>
    <div class="matched-lenders">
      ${match.matched.length ? match.matched.map((lender) => safeHtml`
        <article class="mini-lender-card">
          <strong>${lender.name}</strong>
          <span>${lender.type} · ${lender.states}</span>
          <small>${lender.fit.join(", ")}</small>
        </article>
      `) : safeHtml`
        <div class="empty-state">
          <strong>No lender in this lane yet.</strong>
          <span>Add one to the lender matrix before routing this file.</span>
        </div>
      `}
    </div>
  `;
}

function renderQueue() {
  const select = document.getElementById("queueSelect");
  const list = selectedBuyerList();
  if (!selectedFileId && list[0]) selectedFileId = list[0].id;
  const previous = selectedFileId;
  select.replaceChildren(...list.map((file) => new Option(file.name, file.id)));
  select.value = list.some((file) => file.id === previous) ? previous : list[0]?.id || "";
  selectedFileId = select.value;
  select.onchange = () => {
    selectedFileId = select.value;
    renderQueue();
  };

  const file = activeFile();
  const queueSnapshot = document.getElementById("queueSnapshot");
  if (!file) {
    const empty = document.createElement("p");
    empty.textContent = "No buyer files yet.";
    queueSnapshot.replaceChildren(empty);
    return;
  }

  const score = calculateScore(file).total;
  const status = statusFor(score);
  const path = pathFor(file);
  document.getElementById("queueStage").value = file.stage || "New Intake";
  document.getElementById("queueNextAction").value = file.nextAction || "";
  document.getElementById("queueOwner").value = file.owner || "";

  const snapshot = document.createElement("div");
  snapshot.className = "snapshot";
  [["Score", score], ["Readiness", status], ["Best Route", path], ["Permission", file.consent || "Not Sent"]].forEach(([label, value]) => {
    const item = document.createElement("div");
    const title = document.createElement("span");
    const detail = document.createElement("strong");
    title.textContent = String(label);
    detail.textContent = String(value);
    item.append(title, detail);
    snapshot.append(item);
  });
  const notes = document.createElement("p");
  notes.className = "muted";
  notes.textContent = file.notes || "No notes on this file yet.";
  queueSnapshot.replaceChildren(snapshot, notes);

  document.getElementById("taskList").innerHTML = safeHtml`${file.tasks
    .map((task) => checkRow(task, "task"))}`;
  document.getElementById("documentList").innerHTML = safeHtml`${file.documents
    .map((doc) => checkRow(doc, "document"))}`;
  document.getElementById("activityList").innerHTML = safeHtml`${[...file.activity]
    .reverse()
    .map((item) => safeHtml`
      <div class="activity-item">
        <strong>${formatDate(item.at)}</strong>
        <p>${item.note}</p>
      </div>
    `)}`;

  document.querySelectorAll("[data-check-type]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const current = activeFile();
      const collection = checkbox.dataset.checkType === "task" ? current.tasks : current.documents;
      const item = collection.find((entry) => entry.id === checkbox.dataset.checkId);
      item.done = checkbox.checked;
      current.activity.push({
        id: uid(),
        at: new Date().toISOString(),
        note: `${item.done ? "Completed" : "Reopened"} ${checkbox.dataset.checkType}: ${item.label}`
      });
      saveBorrowers();
      render();
    });
  });
}

function renderWorkQueue() {
  const table = document.getElementById("workQueueTable");
  const filter = document.getElementById("workQueueFilter")?.value || "All active files";
  if (!table) return;
  const rows = visibleBorrowers().filter((file) => matchesWorkView(file, filter));

  table.innerHTML = rows.length ? safeHtml`${rows
    .map((file) => {
      const scan = file.scan || buildScanResult(file);
      const handoff = file.handoff || defaultHandoff(file);
      const outcome = file.outcome || defaultOutcome(file);
      const followUp = outcome.nextFollowUp || handoff.nextFollowUp || "";
      const nextAction = outcome.nextAction || file.nextAction || scan.recommendedNextMove;
      return safeHtml`
        <tr>
          <td><div class="borrower-name">${file.name}<span class="muted">${file.partner || "Direct"} · ${file.state || "NA"}</span></div></td>
          <td><span class="pill ${pillClass(scan.rescueTier)}">${scan.rescueTier}</span></td>
          <td>${blockerLabels[scan.primaryBlocker] || scan.primaryBlocker}</td>
          <td>${lenderLaneFor(file)}</td>
          <td><span class="pill ${handoffPillClass(handoff.status)}">${handoff.status}</span><span class="muted">${handoff.partnerName || ""}</span></td>
          <td><span class="pill ${outcomePillClass(outcome.status)}">${outcome.status}</span></td>
          <td>${followUp || "None set"}</td>
          <td>${nextAction}</td>
          <td>
            <div class="quick-action-stack">
              <button class="small-btn" type="button" data-open-review="${file.id}">Open Review</button>
              <button class="small-btn" type="button" data-update-outcome="${file.id}">Update Outcome</button>
              <button class="small-btn" type="button" data-set-followup="${file.id}">Set Follow-Up</button>
              <button class="small-btn" type="button" data-export-packet="${file.id}">Export Packet</button>
            </div>
          </td>
        </tr>
      `;
    })}` : safeHtml`
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <strong>No files match this work view.</strong>
            <span>Try another view or add more buyer files.</span>
          </div>
        </td>
      </tr>
    `;

  table.querySelectorAll("[data-open-review], [data-update-outcome]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedFileId = button.dataset.openReview || button.dataset.updateOutcome;
      setView("diagnosis");
    });
  });

  table.querySelectorAll("[data-set-followup]").forEach((button) => {
    button.addEventListener("click", () => {
      const file = borrowers.find((item) => item.id === button.dataset.setFollowup);
      if (!file) return;
      file.handoff ||= defaultHandoff(file);
      file.outcome ||= defaultOutcome(file);
      const date = addDaysISO(7);
      file.handoff.nextFollowUp = file.handoff.nextFollowUp || date;
      file.outcome.nextFollowUp = date;
      file.activity.push({ id: uid(), at: new Date().toISOString(), note: `Set follow-up for ${date}.` });
      saveBorrowers();
      render();
    });
  });

  table.querySelectorAll("[data-export-packet]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedFileId = button.dataset.exportPacket;
      showPacketSafety("export");
    });
  });
}

function matchesWorkView(file, view) {
  if (view === "Ready to Send") return file.handoff?.status === "Ready to send";
  if (view === "Sent - Needs Follow-Up") return isSentOrInReview(file) && Boolean(file.handoff?.nextFollowUp || file.outcome?.nextFollowUp);
  if (view === "More Info Requested") return isMoreInfoRequested(file);
  if (view === "Outcome Needed") return needsOutcome(file);
  if (view === "Approval Sprint") return file.scan?.rescueTier === "Approval Sprint";
  if (view === "Rebuild First") return file.scan?.rescueTier === "Rebuild First";
  if (view === "Protect & Refer") return file.scan?.rescueTier === "Protect & Refer";
  if (view === "Won / Closed") return isWonOrClosed(file);
  if (view === "Lost / Not Ready") return isLostOrNotReady(file);
  return !isWonOrClosed(file) && !isLostOrNotReady(file);
}

function isSentOrInReview(file) {
  return Boolean(file.handoff?.status?.startsWith("Sent")) || file.handoff?.status === "In review";
}

function isMoreInfoRequested(file) {
  return file.handoff?.status === "More info requested" || file.outcome?.status === "Needs documents";
}

function needsOutcome(file) {
  return file.outcome?.status === "No outcome yet" && file.handoff?.status !== "Not sent yet";
}

function isWonOrClosed(file) {
  return ["Preapproval reported", "Approved elsewhere", "Under contract", "Closed"].includes(file.outcome?.status) || file.handoff?.status === "Closed / completed";
}

function isLostOrNotReady(file) {
  return ["Denied again", "Not safe to proceed", "Lost / stopped working"].includes(file.outcome?.status);
}

function handoffPillClass(status = "") {
  if (status === "Ready to send" || status === "Closed / completed") return "green";
  if (status.startsWith("Sent") || status === "In review") return "blue";
  if (status === "More info requested" || status === "Paused") return "amber";
  return "purple";
}

function outcomePillClass(status = "") {
  if (["Preapproval reported", "Approved elsewhere", "Under contract", "Closed"].includes(status)) return "green";
  if (["Denied again", "Not safe to proceed", "Lost / stopped working"].includes(status)) return "red";
  if (status !== "No outcome yet") return "amber";
  return "purple";
}

function activeFile() {
  return borrowers.find((file) => file.id === selectedFileId) || borrowers[0];
}

function checkRow(item, type) {
  return safeHtml`
    <label class="check-row">
      <input type="checkbox" ${item.done ? "checked" : ""} data-check-type="${type}" data-check-id="${item.id}">
      <span>${item.label}</span>
    </label>
  `;
}

function formatDate(value) {
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function setupQueueControls() {
  document.getElementById("saveQueueBtn").addEventListener("click", () => {
    if (!can("editScans")) {
      window.alert("Your current role cannot edit this file.");
      return;
    }
    const file = activeFile();
    if (!file) return;
    file.stage = document.getElementById("queueStage").value;
    file.nextAction = document.getElementById("queueNextAction").value;
    file.owner = document.getElementById("queueOwner").value;
    file.activity.push({
      id: uid(),
      at: new Date().toISOString(),
      note: `Updated stage to ${file.stage}.`
    });
    saveBorrowers();
    audit("Buyer edited", "Buyer", file.id, file.name, `Updated stage to ${file.stage}.`, null, { stage: file.stage, nextAction: file.nextAction });
    render();
  });

  document.getElementById("markLenderReadyBtn").addEventListener("click", () => {
    if (!can("editScans")) {
      window.alert("Your current role cannot mark lender readiness.");
      return;
    }
    const file = activeFile();
    if (!file) return;
    file.stage = "Lender Match Ready";
    file.nextAction = `Prepare file for ${routingAction(pathFor(file))}`;
    file.activity.push({
      id: uid(),
      at: new Date().toISOString(),
      note: "Marked ready for lender review."
    });
    saveBorrowers();
    audit("Lender match marked", "Buyer", file.id, file.name, "Marked file ready for lender review.", null, { stage: file.stage, lane: lenderLaneFor(file) });
    render();
  });

  document.getElementById("noteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const noteInput = document.getElementById("noteInput");
    const note = noteInput.value.trim();
    const file = activeFile();
    if (!note || !file) return;
    file.activity.push({ id: uid(), at: new Date().toISOString(), note });
    noteInput.value = "";
    saveBorrowers();
    render();
  });
}

function setupHandoffOutcomeForms() {
  document.getElementById("handoffForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("editScans")) {
      window.alert("Your current role cannot edit handoff status.");
      return;
    }
    const file = activeFile();
    if (!file) return;
    const form = new FormData(event.currentTarget);
    const nextStatus = form.get("status");
    const requiredConsent = requiredConsentForHandoff(nextStatus);
    if (requiredConsent && !hasConsent(file, requiredConsent)) {
      window.alert(permissionMessage());
      return;
    }
    const wasSent = Boolean(file.handoff?.status?.startsWith("Sent"));
    const isNewSent = String(nextStatus).startsWith("Sent") && !wasSent;
    if (isNewSent && !document.getElementById("handoffPermissionConfirm").checked) {
      window.alert("Please confirm buyer permission before marking this file sent.");
      return;
    }
    const before = { ...(file.handoff || {}) };
    file.handoff = {
      status: nextStatus,
      partnerName: form.get("partnerName"),
      contactPerson: form.get("contactPerson"),
      dateSent: form.get("dateSent"),
      nextFollowUp: form.get("nextFollowUp"),
      notes: form.get("notes")
    };
    if (String(nextStatus).startsWith("Sent") && !file.handoff.dateSent) file.handoff.dateSent = todayISO();
    file.activity.push({ id: uid(), at: new Date().toISOString(), note: `Updated handoff status to ${file.handoff.status}.` });
    saveBorrowers();
    audit("Handoff status changed", "Buyer", file.id, file.name, `Handoff status changed to ${file.handoff.status}.`, before, file.handoff);
    render();
  });

  document.querySelectorAll("[data-handoff-quick]").forEach((button) => {
    button.addEventListener("click", () => {
      const file = activeFile();
      if (!file) return;
      const nextStatus = button.dataset.handoffQuick;
      if (!can("editScans")) {
        window.alert("Your current role cannot edit handoff status.");
        return;
      }
      const requiredConsent = requiredConsentForHandoff(nextStatus);
      if (requiredConsent && !hasConsent(file, requiredConsent)) {
        window.alert(permissionMessage());
        return;
      }
      if (nextStatus.startsWith("Sent") && !document.getElementById("handoffPermissionConfirm").checked) {
        window.alert("Please confirm buyer permission before marking this file sent.");
        return;
      }
      file.handoff ||= defaultHandoff(file);
      const before = { ...file.handoff };
      file.handoff.status = nextStatus;
      if (nextStatus.startsWith("Sent")) {
        file.handoff.dateSent ||= todayISO();
        file.stage = "Submitted to Partner";
      }
      if (nextStatus === "Ready to send") file.stage = "Lender Match Ready";
      if (nextStatus === "More info requested") file.outcome = { ...(file.outcome || defaultOutcome(file)), status: "Needs documents" };
      file.activity.push({ id: uid(), at: new Date().toISOString(), note: `Marked handoff: ${nextStatus}.` });
      saveBorrowers();
      audit("Handoff status changed", "Buyer", file.id, file.name, `Marked handoff: ${nextStatus}.`, before, file.handoff);
      render();
    });
  });

  document.getElementById("outcomeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("editScans")) {
      window.alert("Your current role cannot edit outcomes.");
      return;
    }
    const file = activeFile();
    if (!file) return;
    const form = new FormData(event.currentTarget);
    const before = { ...(file.outcome || {}) };
    file.outcome = {
      status: form.get("status"),
      date: form.get("date"),
      source: form.get("source"),
      workedReason: form.get("workedReason"),
      failedReason: form.get("failedReason"),
      notes: form.get("notes"),
      nextAction: form.get("nextAction"),
      nextFollowUp: form.get("nextFollowUp")
    };
    if (file.outcome.status !== "No outcome yet" && !file.outcome.date) file.outcome.date = todayISO();
    if (file.outcome.nextAction) file.nextAction = file.outcome.nextAction;
    if (file.outcome.status === "Closed") {
      file.stage = "Approved";
      file.handoff = { ...(file.handoff || defaultHandoff(file)), status: "Closed / completed" };
    }
    if (isLostOrNotReady(file)) file.stage = "Closed/Lost";
    file.activity.push({ id: uid(), at: new Date().toISOString(), note: `Updated outcome: ${file.outcome.status}.` });
    saveBorrowers();
    audit("Outcome changed", "Buyer", file.id, file.name, `Outcome changed to ${file.outcome.status}.`, before, file.outcome);
    render();
  });

  document.getElementById("visibilityForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isInternalRole()) {
      window.alert("Your current role cannot change partner visibility.");
      return;
    }
    const file = activeFile();
    if (!file) return;
    const form = new FormData(event.currentTarget);
    const level = form.get("level");
    if (visibilityRank(level) > 0 && !hasAnyShareConsent(file)) {
      window.alert(permissionMessage());
      return;
    }
    const before = { ...(file.visibility || {}) };
    file.visibility = {
      level,
      sharedWith: form.get("sharedWith"),
      notes: form.get("notes"),
      updatedAt: new Date().toISOString()
    };
    file.activity.push({ id: uid(), at: new Date().toISOString(), note: `Updated partner visibility to ${file.visibility.level}.` });
    saveBorrowers();
    audit("Partner visibility changed", "Buyer", file.id, file.name, `Partner visibility changed to ${file.visibility.level}.`, before, file.visibility);
    render();
  });
}

function breakdownRow(label, value, max) {
  return safeHtml`<div class="breakdown-row"><span>${label}</span><strong>${value}/${max}</strong></div>`;
}

function planItem(label, value) {
  return safeHtml`<div class="plan-item"><strong>${label}</strong><span>${value}</span></div>`;
}

function immediateAction(file) {
  if (file.scan?.rescueTier === "Protect & Refer") return "Protect and refer before lender review.";
  if (file.scan?.recommendedNextMove) return file.scan.recommendedNextMove;
  if (file.consent !== "Signed") return "Secure signed consent before sharing or routing.";
  if (file.obstacle === "Documentation gap") return "Collect missing documents and written denial/AUS findings.";
  if (file.obstacle === "Cash-to-close shortage") return "Screen DPA, seller credit, lender credit, and gift options.";
  return file.nextAction || "Complete full file review.";
}

function thirtyDayAction(file) {
  if (file.obstacle === "High DTI") return "Model payoff sequence and lower payment scenarios.";
  if (file.obstacle === "Self-employed income") return "Reconcile tax returns, deposits, and alternative-doc options.";
  if (file.obstacle === "Low credit score") return "Triage tradelines, utilization, and timing rules with qualified partner.";
  return "Complete document package and path assignment.";
}

function sixtyDayAction(file) {
  if (file.cash === "none") return "Confirm assistance eligibility and reserve-building milestone.";
  if (file.dti > 50) return "Verify debt action impact and reassess purchase target.";
  return "Prepare lender/program submission package.";
}

function ninetyDayAction(file) {
  if (calculateScore(file).total > 70) return "Re-score fundability and decide submit, pause, or long-path plan.";
  return "Submit to best-fit partner or convert to active preapproval path.";
}

function routingAction(path) {
  const matches = lenders.filter((lender) => lender.fit.includes(path)).map((lender) => lender.name);
  return matches.length ? matches.join(", ") : "Add partner coverage for this path.";
}

function renderLenders() {
  const filter = document.getElementById("lenderFitFilter").value || "All";
  const rows = lenders.filter((lender) => filter === "All" || lender.fit.includes(filter));
  document.getElementById("lenderGrid").innerHTML = safeHtml`${rows
    .map((lender) => safeHtml`
      <article class="lender-card">
        <h3>${lender.name}</h3>
        <p class="muted">${lender.type} · ${lender.states}</p>
        <div class="tag-row">${lender.fit.map((fit) => safeHtml`<span class="pill blue">${fit}</span>`)}</div>
        <div class="tag-row">${(lender.lanes || []).map((lane) => safeHtml`<span class="pill green">${lane}</span>`)}</div>
        <p><strong>Score:</strong> ${lender.score}</p>
        <p><strong>DTI:</strong> ${lender.dti} · <strong>Manual:</strong> ${lender.manual}</p>
        <p><strong>DPA:</strong> ${lender.dpa} · <strong>Self-employed:</strong> ${lender.selfEmployed}</p>
        ${lenderPerformanceCard(lender)}
      </article>
    `)}`;
}

function lenderPerformanceCard(lender) {
  const sent = borrowers.filter((file) => file.handoff?.partnerName === lender.name);
  const laneMatches = borrowers.filter((file) => lender.lanes?.includes(lenderLaneFor(file)));
  const positives = sent.filter((file) => isWonOrClosed(file)).length;
  const deniedAgain = sent.filter((file) => file.outcome?.status === "Denied again").length;
  const moreInfo = sent.filter((file) => isMoreInfoRequested(file)).length;
  const blockerMatches = topCounts(laneMatches.map((file) => blockerLabels[file.scan?.primaryBlocker] || "Unknown"))
    .slice(0, 3)
    .map(([blocker, count]) => `${blocker} (${count})`)
    .join(", ") || "No pattern yet";
  return safeHtml`
    <div class="performance-box">
      <strong>Performance Notes</strong>
      <div class="performance-grid">
        <span>Files sent</span><b>${sent.length}</b>
        <span>Positive outcomes</span><b>${positives}</b>
        <span>Denied again</span><b>${deniedAgain}</b>
        <span>More info requested</span><b>${moreInfo}</b>
      </div>
      <p><strong>Best blocker matches:</strong> ${blockerMatches}</p>
      <p class="muted">Keep using outcome notes to learn where this partner is strongest.</p>
    </div>
  `;
}

function renderPartners() {
  const grouped = borrowers.reduce((acc, file) => {
    const key = file.partner || "Direct";
    acc[key] ||= [];
    acc[key].push(file);
    return acc;
  }, {});

  document.getElementById("partnerGrid").innerHTML = safeHtml`${Object.entries(grouped)
    .map(([partner, files]) => {
      const avg = Math.round(files.reduce((sum, file) => sum + calculateScore(file).total, 0) / files.length);
      const ready = files.filter((file) => statusFor(calculateScore(file).total).includes("Fundable")).length;
      return safeHtml`
        <article class="partner-card">
          <h3>${partner}</h3>
          <p class="muted">${files.length} active files</p>
          <div class="tag-row">
            <span class="pill blue">Avg ${avg}</span>
            <span class="pill green">${ready} fundable</span>
          </div>
          <p><strong>Next:</strong> ${files[0].nextAction || "Review pipeline"}</p>
        </article>
      `;
    })}`;
}

function renderConsent() {
  const select = document.getElementById("consentBuyerSelect");
  if (select) {
    const list = selectedBuyerList();
    const previous = select.value || selectedFileId || list[0]?.id;
    select.replaceChildren(...list.map((file) => new Option(file.name, file.id)));
    select.value = list.some((file) => file.id === previous) ? previous : list[0]?.id || "";
    select.onchange = () => {
      fillConsentDetailForm(borrowers.find((file) => file.id === select.value));
    };
    fillConsentDetailForm(borrowers.find((file) => file.id === select.value));
  }

  document.getElementById("consentTable").innerHTML = safeHtml`${visibleBorrowers()
    .map((file) => safeHtml`
      <tr>
        <td><div class="borrower-name">${file.name}<span class="muted">${file.email || "No email"}</span></div></td>
        <td><span class="pill ${pillClass(file.consent)}">${file.consent}</span></td>
        <td>${file.consentDetails?.shareWithRealtorBuilder ? "Ready" : "Pending"}</td>
        <td>${hasAnyShareConsent(file) ? "Authorized by selected permissions" : "Hold"}</td>
        <td><button class="small-btn" type="button" data-consent-id="${file.id}">${file.consent === "Signed" ? "Revoke" : "Mark Signed"}</button></td>
      </tr>
    `)}`;

  document.querySelectorAll("[data-consent-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const file = borrowers.find((item) => item.id === button.dataset.consentId);
      const before = { consent: file.consent, consentDetails: file.consentDetails };
      file.consent = file.consent === "Signed" ? "Revoked" : "Signed";
      file.consentDetails = file.consent === "Signed" ? {
        dataProcessing: true,
        contactPermission: true,
        shareWithLender: true,
        shareWithRealtorBuilder: true,
        shareWithCounselor: true,
        packetExportAllowed: true,
        lastUpdatedAt: todayISO(),
        notes: "Marked from Permissions table."
      } : {
        ...defaultConsentDetails(file),
        dataProcessing: false,
        contactPermission: false,
        shareWithLender: false,
        shareWithRealtorBuilder: false,
        shareWithCounselor: false,
        packetExportAllowed: false,
        lastUpdatedAt: todayISO(),
        notes: "Permission revoked."
      };
      saveBorrowers();
      audit("Consent changed", "Buyer", file.id, file.name, `Consent changed to ${file.consent}.`, before, { consent: file.consent, consentDetails: file.consentDetails });
      render();
    });
  });
}

function fillConsentDetailForm(file) {
  const form = document.getElementById("consentDetailForm");
  if (!form || !file) return;
  const consent = file.consentDetails || defaultConsentDetails(file);
  ["dataProcessing", "contactPermission", "shareWithLender", "shareWithRealtorBuilder", "shareWithCounselor", "packetExportAllowed"].forEach((name) => {
    form.elements[name].checked = Boolean(consent[name]);
  });
  form.elements.notes.value = consent.notes || "";
}

function setupConsentDetailForm() {
  document.getElementById("consentDetailForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isInternalRole()) {
      window.alert("Your current role cannot change permissions.");
      return;
    }
    const selectedConsentBuyerId = document.getElementById("consentBuyerSelect").value;
    const file = borrowers.find((item) => item.id === selectedConsentBuyerId);
    if (!file) return;
    const form = event.currentTarget;
    const before = { ...(file.consentDetails || {}) };
    file.consentDetails = {
      dataProcessing: form.elements.dataProcessing.checked,
      contactPermission: form.elements.contactPermission.checked,
      shareWithLender: form.elements.shareWithLender.checked,
      shareWithRealtorBuilder: form.elements.shareWithRealtorBuilder.checked,
      shareWithCounselor: form.elements.shareWithCounselor.checked,
      packetExportAllowed: form.elements.packetExportAllowed.checked,
      lastUpdatedAt: todayISO(),
      notes: form.elements.notes.value
    };
    file.consent = hasAnyShareConsent(file) ? "Signed" : "Not Sent";
    file.activity.push({ id: uid(), at: new Date().toISOString(), note: "Updated structured consent permissions." });
    saveBorrowers();
    audit("Consent changed", "Buyer", file.id, file.name, "Updated structured consent permissions.", before, file.consentDetails);
    render();
  });
}

function renderLearningSnapshot(file) {
  const target = document.getElementById("learningSnapshot");
  if (!target) return;
  const scan = file.scan || buildScanResult(file);
  const outcome = file.outcome || defaultOutcome(file);
  const lane = lenderLaneFor(file);
  const lessons = [];

  if (scan.rescueTier === "Protect & Refer") {
    lessons.push("This file should stay protected until the safety concern is resolved or a qualified counseling/nonprofit partner gives guidance.");
  }
  if (scan.primaryBlocker === "CASH") {
    lessons.push("Cash-to-close files need DPA, seller credit, lender credit, gift funds, VA, or USDA checked before a lender handoff.");
  }
  if (scan.primaryBlocker === "INCOME") {
    lessons.push(`Income files should be packaged for the ${lane} lane with clear proof of how income is being counted.`);
  }
  if (scan.primaryBlocker === "DTI") {
    lessons.push("High-DTI files need a payment and debt sequence before another review.");
  }
  if (scan.primaryBlocker === "DOCUMENTS" || outcome.status === "Needs documents") {
    lessons.push("Document gaps create repeat delays. Do not send again until the missing item list is clear.");
  }
  if (outcome.status === "Denied again") {
    lessons.push("A repeated denial means the route or package likely needs to change before the next handoff.");
  }
  if (isWonOrClosed(file)) {
    lessons.push("This file should be used as a pattern: compare the blocker, lender lane, and reason it worked with future similar buyers.");
  }
  if (!lessons.length) {
    lessons.push("No pattern yet. Save handoff and outcome notes after the next partner response.");
  }

  target.innerHTML = safeHtml`
    <div class="learning-card">
      <p class="eyebrow">Learning Snapshot</p>
      <ul>${uniqueList(lessons).map((lesson) => safeHtml`<li>${lesson}</li>`)}</ul>
    </div>
  `;
}

function setupPacketActions() {
  document.getElementById("exportPacketBtn").addEventListener("click", () => showPacketSafety("export"));
  document.getElementById("copyPacketBtn").addEventListener("click", () => showPacketSafety("copy"));
  document.getElementById("printPacketBtn").addEventListener("click", () => showPacketSafety("print"));
  document.getElementById("cancelPacketBtn").addEventListener("click", closePacketModal);
  document.getElementById("confirmPacketBtn").addEventListener("click", async () => {
    const file = activeFile();
    const confirm = document.getElementById("packetPermissionConfirm");
    if (!file || !confirm.checked) {
      window.alert("Please confirm the packet safety checklist first.");
      return;
    }
    if (pendingPacketAction === "copy") {
      await copyPacketText(file);
      audit("Packet copied", "Buyer", file.id, file.name, `Copied partner packet for ${file.name}.`);
    } else {
      openPacketWindow(file, pendingPacketAction);
      audit(pendingPacketAction === "print" ? "Packet printed" : "Partner packet exported", "Buyer", file.id, file.name, `${pendingPacketAction === "print" ? "Printed" : "Exported"} partner packet for ${file.name}.`);
    }
    file.activity.push({ id: uid(), at: new Date().toISOString(), note: `Prepared partner packet for ${pendingPacketAction}.` });
    saveBorrowers();
    closePacketModal();
    render();
  });
}

function showPacketSafety(action) {
  const file = activeFile();
  if (!file) return;
  if (!can("exportPackets")) {
    window.alert("Your current role cannot export partner packets.");
    return;
  }
  if (!hasConsent(file, "packetExportAllowed")) {
    window.alert(permissionMessage());
    return;
  }
  pendingPacketAction = action;
  const modal = document.getElementById("packetModal");
  const confirm = document.getElementById("packetPermissionConfirm");
  const warning = document.getElementById("packetWarningText");
  confirm.checked = false;
  const protectText = file.scan?.rescueTier === "Protect & Refer"
    ? safeHtml`<strong>Extra caution:</strong> this file is marked Protect & Refer. Do not route it as lender-ready. Share only with the proper counseling, nonprofit, or qualified professional after permission is confirmed.`
    : "Confirm this packet is being shared only for routing or review with permission from the buyer.";
  warning.innerHTML = safeHtml`
    <p>${protectText}</p>
    <p>Do not include SSN, full credit reports, bank account numbers, sensitive IDs, or private account details. Do not promise approval or make formal eligibility statements. Licensed mortgage professionals must discuss loan terms and formal eligibility.</p>
  `;
  modal.hidden = false;
}

function closePacketModal() {
  document.getElementById("packetModal").hidden = true;
  pendingPacketAction = "";
}

async function copyPacketText(file) {
  const text = buildPacketMarkdown(file);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function openPacketWindow(file, action) {
  const packetWindow = window.open("", "_blank");
  if (!packetWindow) {
    window.alert("The packet window was blocked. Please allow popups for this local tool.");
    return;
  }
  packetWindow.document.write(buildPacketHtml(file));
  packetWindow.document.close();
  packetWindow.focus();
  if (action === "print") packetWindow.print();
}

function buildPacketMarkdown(file) {
  const scan = file.scan || buildScanResult(file);
  const handoff = file.handoff || defaultHandoff(file);
  const outcome = file.outcome || defaultOutcome(file);
  const match = lenderMatchFor(file);
  const completedDocs = (file.documents || []).filter((doc) => doc.done).map((doc) => doc.label);
  const openDocs = (file.documents || []).filter((doc) => !doc.done).map((doc) => doc.label);
  const completedTasks = (file.tasks || []).filter((task) => task.done).map((task) => task.label);
  const openTasks = (file.tasks || []).filter((task) => !task.done).map((task) => task.label);

  return [
    "# Partner Packet",
    "",
    `Prepared date: ${todayISO()}`,
    `Prepared by: ${file.owner || "ApprovalPath Desk"}`,
    "",
    "## Buyer Summary",
    `Buyer: ${file.name}`,
    `Location: ${[file.targetCity, file.county, file.state].filter(Boolean).join(", ") || file.state || "Not provided"}`,
    `Target price: ${moneyText(file.targetPrice)}`,
    `Timeline: ${scan.timeline}`,
    `Plain notes: ${file.notes || "None added"}`,
    "",
    "## Consent",
    `Permission status: ${file.consent || "Not Sent"}`,
    "Confirm permission before sharing outside the business.",
    "",
    "## Impossible File Scan",
    `Rescue tier: ${scan.rescueTier}`,
    `Primary blocker: ${blockerLabels[scan.primaryBlocker] || scan.primaryBlocker}`,
    `Secondary blockers: ${scan.secondaryBlockers.map((blocker) => blockerLabels[blocker] || blocker).join(", ") || "None identified yet"}`,
    `Lender-ready status: ${scan.lenderReadyStatus}`,
    `Recommended next move: ${scan.recommendedNextMove}`,
    "",
    "## Financial Snapshot",
    `Credit range: ${scan.creditRange}`,
    `Income type: ${scan.incomeType}`,
    `Monthly income: ${moneyText(file.monthlyIncome)}`,
    `Monthly debt estimate: ${moneyText(file.monthlyDebt)}`,
    `Estimated DTI: ${scan.dtiEstimate || file.dti || "Unknown"}%`,
    `Cash available: ${scan.cashAvailable}`,
    `Current rent / housing payment: ${moneyText(file.housingPayment)}`,
    `DPA needed: ${scan.dpaNeeded}`,
    "",
    "## Lender Routing",
    `Recommended lane: ${match.lane}`,
    `Routing question: ${match.nextQuestion}`,
    `Handoff status: ${handoff.status}`,
    `Partner / lender: ${handoff.partnerName || "Not selected"}`,
    `Next follow-up: ${handoff.nextFollowUp || outcome.nextFollowUp || "Not set"}`,
    "",
    "## Documents",
    `Already checked: ${completedDocs.join(", ") || scan.availableDocs.join(", ") || "None marked"}`,
    `Still needed: ${openDocs.join(", ") || "None marked"}`,
    "",
    "## Tasks",
    `Completed: ${completedTasks.join(", ") || "None marked"}`,
    `Open: ${openTasks.join(", ") || "None marked"}`,
    "",
    "## Compliance Reminder",
    "This packet is for organization and routing. It is not a loan approval, qualification decision, credit decision, or promise of financing. Do not include SSN, full credit reports, bank account numbers, sensitive IDs, or private account details. Loan terms and eligibility must be discussed by properly licensed mortgage professionals."
  ].join("\n");
}

function buildPacketHtml(file) {
  const text = buildPacketMarkdown(file);
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Partner Packet - ${escapeHtml(file.name)}</title>
        <style>
          body { color: #17212b; font-family: Arial, sans-serif; line-height: 1.45; margin: 32px; }
          pre { white-space: pre-wrap; font: inherit; }
          @media print { body { margin: 18mm; } }
        </style>
      </head>
      <body><pre>${escapeHtml(text)}</pre></body>
    </html>
  `;
}

function moneyText(value) {
  const number = numberValue(value);
  return number ? `$${number.toLocaleString()}` : "Not provided";
}

function escapeHtml(value) {
  return String(value === undefined || value === null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupSeedButton() {
  document.getElementById("seedBtn").addEventListener("click", () => {
    borrowers = sampleBorrowers.map((file) => ensureFileState({ ...file, id: uid(), tasks: undefined, documents: undefined, activity: undefined }));
    selectedFileId = borrowers[0]?.id || "";
    saveBorrowers();
    audit("Data imported", "Demo", "", "", "Reset local demo buyer data.");
    render();
  });
}

function setupBackupControls() {
  document.getElementById("exportBackupBtn").addEventListener("click", () => {
    if (!can("viewAudit")) {
      window.alert("Only Owner or Admin roles can export full backups.");
      return;
    }
    const ok = window.confirm("This backup may contain sensitive buyer information. Store it securely and do not email it without permission.");
    if (!ok) return;
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `impossible-file-backup-${todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    audit("Data exported", "Backup", "", "", "Exported full local JSON backup.");
  });

  document.getElementById("importBackupBtn").addEventListener("click", async () => {
    if (!can("viewAudit")) {
      window.alert("Only Owner or Admin roles can import full backups.");
      return;
    }
    const input = document.getElementById("backupFileInput");
    const file = input.files[0];
    if (!file) {
      window.alert("Choose a backup JSON file first.");
      return;
    }
    if (file.size > storage.maxImportBytes) {
      window.alert("That backup file is too large to import safely.");
      return;
    }
    const mode = document.getElementById("backupImportMode").value;
    const ok = window.confirm("Importing a backup may replace or merge existing data. Make sure you trust this file.");
    if (!ok) return;
    try {
      const data = JSON.parse(await file.text());
      storage.importAll(data, mode);
    } catch {
      window.alert("That backup file could not be read. Please choose a valid JSON backup.");
      return;
    }
    borrowers = loadBorrowers();
    lenders = storage.getLenders(defaultLenders);
    selectedFileId = borrowers[0]?.id || "";
    try {
      audit("Data imported", "Backup", "", "", `Imported backup with ${mode} mode.`);
    } catch {
      window.alert("The backup was imported, but its audit entry could not be saved because local storage is full.");
    }
    render();
  });
}

function renderAuditLogs() {
  const table = document.getElementById("auditTable");
  if (!table) return;
  if (!can("viewAudit") || currentUser.role === "File Analyst") {
    table.innerHTML = `<tr><td colspan="5"><div class="empty-state"><strong>Audit logs hidden.</strong><span>Only Owner and Admin roles can view the full audit log.</span></div></td></tr>`;
    return;
  }
  const buyer = (document.getElementById("auditBuyerFilter").value || "").toLowerCase();
  const action = (document.getElementById("auditActionFilter").value || "").toLowerCase();
  const actor = (document.getElementById("auditActorFilter").value || "").toLowerCase();
  const role = document.getElementById("auditRoleFilter").value || "All";
  const date = document.getElementById("auditDateFilter").value || "";
  const rows = storage.getAuditLogs().filter((log) => {
    const matchesBuyer = !buyer || String(log.buyerName || "").toLowerCase().includes(buyer);
    const matchesAction = !action || String(log.actionType || "").toLowerCase().includes(action);
    const matchesActor = !actor || String(log.actorName || "").toLowerCase().includes(actor);
    const matchesRole = role === "All" || log.actorRole === role;
    const matchesDate = !date || String(log.timestamp || "").startsWith(date);
    return matchesBuyer && matchesAction && matchesActor && matchesRole && matchesDate;
  });
  table.innerHTML = rows.length ? safeHtml`${rows.map((log) => safeHtml`
    <tr>
      <td>${formatDate(log.timestamp)}</td>
      <td><div class="borrower-name">${log.actorName}<span class="muted">${log.actorRole}</span></div></td>
      <td>${log.actionType}</td>
      <td>${log.buyerName || "Not buyer-specific"}</td>
      <td>${log.summary}</td>
    </tr>
  `)}` : safeHtml`<tr><td colspan="5"><div class="empty-state"><strong>No audit logs match.</strong><span>Clear filters or create a sensitive action.</span></div></td></tr>`;
}

function applyRolePermissions() {
  document.getElementById("currentRoleSelect").value = currentUser.role || "Owner";
  document.querySelector('[data-view="audit"]').hidden = !can("viewAudit") || currentUser.role === "File Analyst";
  document.getElementById("exportPacketBtn").disabled = !can("exportPackets");
  document.getElementById("copyPacketBtn").disabled = !can("exportPackets");
  document.getElementById("printPacketBtn").disabled = !can("exportPackets");
  document.getElementById("lenderFitFilter").disabled = !can("manageLenders") && !isInternalRole();
  document.querySelectorAll("#editScanForm input, #editScanForm select, #editScanForm button, #handoffForm input, #handoffForm select, #handoffForm textarea, #handoffForm button, #outcomeForm input, #outcomeForm select, #outcomeForm textarea, #outcomeForm button, #visibilityForm input, #visibilityForm select, #visibilityForm textarea, #visibilityForm button").forEach((control) => {
    control.disabled = !can("editScans") || can("editScans") === "Notes only";
  });
  document.querySelectorAll("#exportBackupBtn, #importBackupBtn").forEach((button) => {
    button.disabled = !can("viewAudit") || currentUser.role === "File Analyst";
  });
}

function setupExportButton() {
  document.getElementById("exportBtn").addEventListener("click", () => {
    if (!isInternalRole()) {
      window.alert("Your current role cannot download reports.");
      return;
    }
    const headers = [
      "name",
      "email",
      "phone",
      "state",
      "partner",
      "stage",
      "score",
      "status",
      "path",
      "obstacle",
      "incomeType",
      "creditBand",
      "dti",
      "cash",
      "consent",
      "nextAction",
      "owner"
    ];
    const rows = borrowers.map((file) => {
      const score = calculateScore(file).total;
      const values = {
        ...file,
        score,
        status: statusFor(score),
        path: pathFor(file)
      };
      return headers.map((header) => csvCell(values[header])).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `approvalpath-files-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    audit("Data exported", "Report", "", "", "Downloaded buyer workflow CSV report.");
  });
}

function csvCell(value) {
  const text = value === undefined || value === null ? "" : String(value);
  const spreadsheetSafe = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${spreadsheetSafe.replaceAll('"', '""')}"`;
}

setupNavigation();
populateFilters();
handlePortalIntake();
handleIntake();
setupLeadImport();
setupQueueControls();
setupEditScanForm();
setupHandoffOutcomeForms();
setupConsentDetailForm();
setupBackupControls();
setupSeedButton();
setupExportButton();
setupPacketActions();
render();
