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
    const records = read(keys.buyers, null) || read(keys.oldBuyers, fallback);
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

  function importAll(data, mode = "merge") {
    if (mode === "replace") {
      saveBuyers(data.buyers || []);
      saveLenders(data.lenders || []);
      savePartners(data.partners || []);
      saveAssistancePrograms(data.assistancePrograms || []);
      write(keys.auditLogs, data.auditLogs || []);
      saveSettings(data.settings || {});
      if (data.currentUser) setCurrentUser(data.currentUser);
      return exportAll();
    }

    const mergeById = (current, incoming) => {
      const map = new Map(current.map((item) => [item.id || item.name, item]));
      incoming.forEach((item) => map.set(item.id || item.name, { ...map.get(item.id || item.name), ...item }));
      return [...map.values()];
    };

    saveBuyers(mergeById(getBuyers([]), data.buyers || []));
    saveLenders(mergeById(getLenders([]), data.lenders || []));
    savePartners(mergeById(getPartners([]), data.partners || []));
    saveAssistancePrograms(mergeById(getAssistancePrograms([]), data.assistancePrograms || []));
    write(keys.auditLogs, mergeById(getAuditLogs(), data.auditLogs || []));
    saveSettings({ ...getSettings(), ...(data.settings || {}) });
    return exportAll();
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
    importAll
  };
})();
