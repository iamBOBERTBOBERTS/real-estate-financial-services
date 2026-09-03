const storage = (() => {
  const keys = {
    buyers: "approvalPathBuyers",
    oldBuyers: "approvalPathBorrowers",
    lenders: "approvalPathLenders",
    partners: "approvalPathPartners",
    assistancePrograms: "approvalPathAssistancePrograms",
    auditLogs: "approvalPathAuditLogs",
    currentUser: "approvalPathCurrentUser",
    settings: "approvalPathSettings"
  };

  const backupLimits = Object.freeze({
    maxBytes: 4 * 1024 * 1024,
    maxNestedArrayItems: 250,
    maxObjectKeys: 100,
    maxDepth: 8,
    maxStringLength: 20000,
    collections: Object.freeze({
      buyers: 2000,
      lenders: 500,
      partners: 500,
      assistancePrograms: 500,
      auditLogs: 2000
    })
  });

  const backupKeys = new Set([
    "version",
    "exportedAt",
    "buyers",
    "lenders",
    "partners",
    "assistancePrograms",
    "auditLogs",
    "currentUser",
    "settings"
  ]);
  const forbiddenKeys = new Set(["__proto__", "constructor", "prototype"]);
  const userRoles = new Set(["Owner", "Admin", "File Analyst", "Partner", "Lender", "Counselor", "Read Only"]);

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function getBuyers(fallback = []) {
    const current = read(keys.buyers, null);
    if (current !== null) return current;
    const records = read(keys.oldBuyers, fallback);
    write(keys.buyers, records);
    return records;
  }

  function saveBuyers(buyers) {
    return write(keys.buyers, buyers);
  }

  function saveBuyer(buyer) {
    const buyers = getBuyers([]);
    const index = buyers.findIndex((item) => item.id === buyer.id);
    if (index >= 0) buyers[index] = buyer;
    else buyers.unshift(buyer);
    return saveBuyers(buyers);
  }

  function updateBuyer(buyerId, updates) {
    const buyers = getBuyers([]);
    const next = buyers.map((buyer) => buyer.id === buyerId ? { ...buyer, ...updates } : buyer);
    return saveBuyers(next);
  }

  function deleteBuyer(buyerId) {
    return saveBuyers(getBuyers([]).filter((buyer) => buyer.id !== buyerId));
  }

  function getLenders(fallback = []) {
    return read(keys.lenders, fallback);
  }

  function saveLenders(lenders) {
    return write(keys.lenders, lenders);
  }

  function saveLender(lender) {
    const lenders = getLenders([]);
    const index = lenders.findIndex((item) => item.id === lender.id || item.name === lender.name);
    if (index >= 0) lenders[index] = lender;
    else lenders.push(lender);
    return saveLenders(lenders);
  }

  function updateLender(lenderId, updates) {
    const next = getLenders([]).map((lender) => lender.id === lenderId || lender.name === lenderId ? { ...lender, ...updates } : lender);
    return saveLenders(next);
  }

  function getPartners(fallback = []) {
    return read(keys.partners, fallback);
  }

  function savePartners(partners) {
    return write(keys.partners, partners);
  }

  function savePartner(partner) {
    const partners = getPartners([]);
    const index = partners.findIndex((item) => item.id === partner.id || item.name === partner.name);
    if (index >= 0) partners[index] = partner;
    else partners.push(partner);
    return savePartners(partners);
  }

  function getAssistancePrograms(fallback = []) {
    return read(keys.assistancePrograms, fallback);
  }

  function saveAssistancePrograms(programs) {
    return write(keys.assistancePrograms, programs);
  }

  function getAuditLogs() {
    return read(keys.auditLogs, []);
  }

  function addAuditLog(entry) {
    const logs = getAuditLogs();
    const record = {
      id: entry.id || `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      ...entry
    };
    logs.unshift(record);
    write(keys.auditLogs, logs.slice(0, 2000));
    return record;
  }

  function getCurrentUser() {
    return read(keys.currentUser, { name: "Demo Owner", role: "Owner" });
  }

  function setCurrentUser(user) {
    return write(keys.currentUser, user);
  }

  function getSettings() {
    return read(keys.settings, {});
  }

  function saveSettings(settings) {
    return write(keys.settings, settings);
  }

  function exportAll() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      buyers: getBuyers([]),
      lenders: getLenders([]),
      partners: getPartners([]),
      assistancePrograms: getAssistancePrograms([]),
      auditLogs: getAuditLogs(),
      currentUser: getCurrentUser(),
      settings: getSettings()
    };
  }

  function isPlainObject(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function assertValid(condition, message) {
    if (!condition) throw new TypeError(`Invalid backup: ${message}`);
  }

  function validateString(value, path, { required = false } = {}) {
    if (value === undefined && !required) return;
    assertValid(typeof value === "string", `${path} must be a string`);
    assertValid(!required || value.trim().length > 0, `${path} cannot be empty`);
    assertValid(value.length <= backupLimits.maxStringLength, `${path} is too long`);
  }

  function validateStringArray(value, path) {
    assertValid(Array.isArray(value), `${path} must be an array`);
    assertValid(value.length <= backupLimits.maxNestedArrayItems, `${path} has too many items`);
    value.forEach((item, index) => validateString(item, `${path}[${index}]`, { required: true }));
  }

  function validateOptionalNumber(value, path) {
    if (value === undefined) return;
    assertValid(typeof value === "number" && Number.isFinite(value), `${path} must be a finite number`);
  }

  function validateJsonValue(value, path, depth = 0) {
    assertValid(depth <= backupLimits.maxDepth, `${path} is nested too deeply`);
    if (value === null || typeof value === "boolean") return;
    if (typeof value === "string") {
      validateString(value, path);
      return;
    }
    if (typeof value === "number") {
      assertValid(Number.isFinite(value), `${path} must contain a finite number`);
      return;
    }
    if (Array.isArray(value)) {
      assertValid(value.length <= backupLimits.maxNestedArrayItems, `${path} has too many items`);
      value.forEach((item, index) => validateJsonValue(item, `${path}[${index}]`, depth + 1));
      return;
    }
    assertValid(isPlainObject(value), `${path} must contain JSON data only`);
    const entries = Object.entries(value);
    assertValid(entries.length <= backupLimits.maxObjectKeys, `${path} has too many fields`);
    entries.forEach(([key, item]) => {
      assertValid(!forbiddenKeys.has(key), `${path}.${key} is not allowed`);
      validateJsonValue(item, `${path}.${key}`, depth + 1);
    });
  }

  function validateOptionalObject(value, path) {
    if (value === undefined) return;
    assertValid(isPlainObject(value), `${path} must be an object`);
    validateJsonValue(value, path);
  }

  function validateBuyer(buyer, path) {
    assertValid(isPlainObject(buyer), `${path} must be an object`);
    validateJsonValue(buyer, path);
    validateString(buyer.id, `${path}.id`, { required: true });
    validateString(buyer.name, `${path}.name`, { required: true });
    validateString(buyer.stage, `${path}.stage`, { required: true });
    validateString(buyer.consent, `${path}.consent`, { required: true });
    [
      "email", "phone", "state", "partner", "owner", "stage", "obstacle", "cash", "incomeType", "consent",
      "nextAction", "targetPrice", "programInterest", "notes", "timeline", "creditRange", "monthlyIncome",
      "monthlyDebt", "cashAmount", "housingPayment", "targetCity", "county"
    ].forEach((field) => validateString(buyer[field], `${path}.${field}`));
    ["creditBand", "dti"].forEach((field) => validateOptionalNumber(buyer[field], `${path}.${field}`));

    ["mainProblems", "availableDocs", "protectionFlags"].forEach((field) => {
      if (buyer[field] !== undefined) validateStringArray(buyer[field], `${path}.${field}`);
    });
    ["handoff", "outcome", "consentDetails", "visibility", "scan"].forEach((field) => {
      validateOptionalObject(buyer[field], `${path}.${field}`);
    });
    if (buyer.handoff !== undefined) {
      ["status", "partnerName", "contactPerson", "dateSent", "nextFollowUp", "notes"].forEach((field) => {
        validateString(buyer.handoff[field], `${path}.handoff.${field}`);
      });
    }
    if (buyer.outcome !== undefined) {
      ["status", "date", "source", "workedReason", "failedReason", "notes", "nextAction", "nextFollowUp"].forEach((field) => {
        validateString(buyer.outcome[field], `${path}.outcome.${field}`);
      });
    }
    if (buyer.consentDetails !== undefined) {
      ["dataProcessing", "contactPermission", "shareWithLender", "shareWithRealtorBuilder", "shareWithCounselor", "packetExportAllowed"].forEach((field) => {
        if (buyer.consentDetails[field] !== undefined) {
          assertValid(typeof buyer.consentDetails[field] === "boolean", `${path}.consentDetails.${field} must be a boolean`);
        }
      });
      ["lastUpdatedAt", "notes"].forEach((field) => {
        validateString(buyer.consentDetails[field], `${path}.consentDetails.${field}`);
      });
    }
    if (buyer.visibility !== undefined) {
      ["level", "sharedWith", "notes", "updatedAt"].forEach((field) => {
        validateString(buyer.visibility[field], `${path}.visibility.${field}`);
      });
    }
    ["tasks", "documents"].forEach((field) => {
      if (buyer[field] === undefined) return;
      assertValid(Array.isArray(buyer[field]), `${path}.${field} must be an array`);
      assertValid(buyer[field].length <= backupLimits.maxNestedArrayItems, `${path}.${field} has too many items`);
      buyer[field].forEach((item, index) => {
        const itemPath = `${path}.${field}[${index}]`;
        assertValid(isPlainObject(item), `${itemPath} must be an object`);
        validateString(item.id, `${itemPath}.id`, { required: true });
        validateString(item.label, `${itemPath}.label`, { required: true });
        assertValid(typeof item.done === "boolean", `${itemPath}.done must be a boolean`);
      });
    });
    if (buyer.activity !== undefined) {
      assertValid(Array.isArray(buyer.activity), `${path}.activity must be an array`);
      assertValid(buyer.activity.length <= backupLimits.maxNestedArrayItems, `${path}.activity has too many items`);
      buyer.activity.forEach((item, index) => {
        const itemPath = `${path}.activity[${index}]`;
        assertValid(isPlainObject(item), `${itemPath} must be an object`);
        validateString(item.id, `${itemPath}.id`, { required: true });
        validateString(item.at, `${itemPath}.at`, { required: true });
        validateString(item.note, `${itemPath}.note`, { required: true });
      });
    }
    if (buyer.scan !== undefined) {
      ["secondaryBlockers", "availableDocs"].forEach((field) => {
        validateStringArray(buyer.scan[field], `${path}.scan.${field}`);
      });
      ["tasks", "protectionFlags"].forEach((field) => {
        if (buyer.scan[field] !== undefined) validateStringArray(buyer.scan[field], `${path}.scan.${field}`);
      });
      [
        "rescueTier", "primaryBlocker", "timeline", "cashAvailable", "creditRange", "incomeType", "dpaNeeded",
        "lenderReadyStatus", "recommendedNextMove"
      ].forEach((field) => validateString(buyer.scan[field], `${path}.scan.${field}`, { required: true }));
      validateOptionalNumber(buyer.scan.dtiEstimate, `${path}.scan.dtiEstimate`);
    }
  }

  function validateLender(lender, path) {
    assertValid(isPlainObject(lender), `${path} must be an object`);
    validateJsonValue(lender, path);
    validateString(lender.id, `${path}.id`, { required: true });
    validateString(lender.name, `${path}.name`, { required: true });
    validateStringArray(lender.fit, `${path}.fit`);
    if (lender.lanes !== undefined) validateStringArray(lender.lanes, `${path}.lanes`);
  }

  function validateNamedRecord(record, path) {
    assertValid(isPlainObject(record), `${path} must be an object`);
    validateJsonValue(record, path);
    const identity = typeof record.id === "string" && record.id.trim() ? record.id : record.name;
    validateString(identity, `${path}.id or name`, { required: true });
  }

  function validateAuditLog(log, path) {
    assertValid(isPlainObject(log), `${path} must be an object`);
    validateJsonValue(log, path);
    validateString(log.id, `${path}.id`, { required: true });
    validateString(log.timestamp, `${path}.timestamp`, { required: true });
  }

  function validateCollection(data, name, validateItem) {
    const collection = data[name];
    assertValid(Array.isArray(collection), `${name} must be an array`);
    assertValid(collection.length <= backupLimits.collections[name], `${name} has too many records`);
    const identities = new Set();
    collection.forEach((item, index) => {
      validateItem(item, `${name}[${index}]`);
      const identity = item.id || item.name;
      assertValid(!identities.has(identity), `${name}[${index}] has a duplicate id or name`);
      identities.add(identity);
    });
  }

  function validateBackup(data) {
    assertValid(isPlainObject(data), "root must be an object");
    Object.keys(data).forEach((key) => assertValid(backupKeys.has(key), `${key} is not a supported field`));
    assertValid(data.version === 1, "version must be 1");
    validateString(data.exportedAt, "exportedAt", { required: true });
    validateCollection(data, "buyers", validateBuyer);
    validateCollection(data, "lenders", validateLender);
    validateCollection(data, "partners", validateNamedRecord);
    validateCollection(data, "assistancePrograms", validateNamedRecord);
    validateCollection(data, "auditLogs", validateAuditLog);
    assertValid(isPlainObject(data.currentUser), "currentUser must be an object");
    validateJsonValue(data.currentUser, "currentUser");
    validateString(data.currentUser.name, "currentUser.name", { required: true });
    assertValid(userRoles.has(data.currentUser.role), "currentUser.role is not supported");
    assertValid(isPlainObject(data.settings), "settings must be an object");
    validateJsonValue(data.settings, "settings");

    const serialized = JSON.stringify(data);
    assertValid(new TextEncoder().encode(serialized).byteLength <= backupLimits.maxBytes, "file is too large");
    return JSON.parse(serialized);
  }

  function mergeById(current, incoming) {
    const map = new Map(current.map((item) => [item.id || item.name, item]));
    incoming.forEach((item) => map.set(item.id || item.name, { ...map.get(item.id || item.name), ...item }));
    return [...map.values()];
  }

  function stateAsBackup(state) {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      ...state
    };
  }

  function commitState(state) {
    const entries = [
      [keys.buyers, state.buyers],
      [keys.lenders, state.lenders],
      [keys.partners, state.partners],
      [keys.assistancePrograms, state.assistancePrograms],
      [keys.auditLogs, state.auditLogs],
      [keys.currentUser, state.currentUser],
      [keys.settings, state.settings]
    ].map(([key, value]) => [key, JSON.stringify(value)]);
    const previous = entries.map(([key]) => [key, localStorage.getItem(key)]);

    try {
      entries.forEach(([key, value]) => localStorage.setItem(key, value));
    } catch (error) {
      entries.forEach(([key]) => localStorage.removeItem(key));
      try {
        previous.forEach(([key, value]) => {
          if (value !== null) localStorage.setItem(key, value);
        });
      } catch (rollbackError) {
        throw new Error("Backup import failed and local storage rollback could not be completed.", { cause: rollbackError });
      }
      throw error;
    }
  }

  function importAll(data, mode = "merge") {
    assertValid(mode === "merge" || mode === "replace", "import mode is not supported");
    const incoming = validateBackup(data);
    let state;

    if (mode === "replace") {
      state = {
        buyers: incoming.buyers,
        lenders: incoming.lenders,
        partners: incoming.partners,
        assistancePrograms: incoming.assistancePrograms,
        auditLogs: incoming.auditLogs,
        currentUser: incoming.currentUser,
        settings: incoming.settings
      };
    } else {
      const current = validateBackup(exportAll());
      state = {
        buyers: mergeById(current.buyers, incoming.buyers),
        lenders: mergeById(current.lenders, incoming.lenders),
        partners: mergeById(current.partners, incoming.partners),
        assistancePrograms: mergeById(current.assistancePrograms, incoming.assistancePrograms),
        auditLogs: mergeById(current.auditLogs, incoming.auditLogs),
        currentUser: current.currentUser,
        settings: { ...current.settings, ...incoming.settings }
      };
    }

    const validatedState = validateBackup(stateAsBackup(state));
    commitState(validatedState);
    return stateAsBackup(state);
  }

  return {
    getBuyers,
    saveBuyers,
    saveBuyer,
    updateBuyer,
    deleteBuyer,
    getLenders,
    saveLenders,
    saveLender,
    updateLender,
    getPartners,
    savePartners,
    savePartner,
    getAssistancePrograms,
    saveAssistancePrograms,
    getAuditLogs,
    addAuditLog,
    getCurrentUser,
    setCurrentUser,
    getSettings,
    saveSettings,
    exportAll,
    importAll,
    maxImportBytes: backupLimits.maxBytes
  };
})();
