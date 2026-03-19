import { reactive, ref } from "vue";
import { safeStorageGet, safeStorageSet } from "../composables/useStorage";
import { normalizeText, normalizeSearch, escapeHtml, getInitials } from "../composables/useUtils";
import { hasBridge, sdk } from "../composables/useSdk";
import { useModals } from "../composables/useModals";
import { useCredentials } from "./credentials";

const STORAGE_KEYS = {
  selectedConfigId: "mistervpn:selected-config-id",
  autoServerMode: "mistervpn:auto-server-mode",
  autoServerSuccessHistory: "mistervpn:auto-server-success-history",
};

const AUTO_SERVER_CONNECT_TIMEOUT_MS = 12000;
const AUTO_SERVER_VERIFY_TIME_MS = 5000;
const AUTO_SERVER_VERIFY_INTERVAL_MS = 500;

const serverState = reactive({
  categories: [],
  configIndex: new Map(),
  selectedConfigId: null,
  selectedMode: "",
  selectedCategoryId: null,
  autoServerMode: false,
  autoTesting: {
    active: false,
    queue: [],
    index: 0,
    timeoutId: null,
    checkTimerId: null,
    cleanupTimerId: null,
  },
});

const selectedFlag = ref("C");
const selectedLocation = ref("Elige una configuración");

const rebuildConfigIndex = () => {
  serverState.configIndex = new Map();
  serverState.categories.forEach((category) => {
    category.items.forEach((item) => {
      serverState.configIndex.set(Number(item.id), item);
    });
  });
};

const buildCategories = (rawCategories) =>
  (rawCategories || [])
    .slice()
    .sort((a, b) => Number(a.sorter || 0) - Number(b.sorter || 0))
    .map((category) => ({
      id: Number(category.id),
      name: normalizeText(category.name),
      sorter: Number(category.sorter || 0),
      items: (category.items || [])
        .slice()
        .sort((l, r) => Number(l.sorter || 0) - Number(r.sorter || 0))
        .map((item) => ({
          id: Number(item.id),
          name: normalizeText(item.name),
          description: normalizeText(item.description),
          mode: normalizeText(item.mode),
          sorter: Number(item.sorter || 0),
          icon: normalizeText(item.icon),
          categoryId: Number(category.id),
          categoryName: normalizeText(category.name),
        })),
    }));

const getServerById = (id) => {
  const numericId = Number(id);
  return Number.isFinite(numericId)
    ? serverState.configIndex.get(numericId) || null
    : null;
};

const getSelectedServer = () =>
  getServerById(serverState.selectedConfigId);

const getModeLabel = (mode) => {
  const raw = normalizeText(mode).toUpperCase();
  if (!raw) {
    return "N/D";
  }
  const tlsMatch = raw.match(/TLSV1\.[A-Z0-9]+/);
  if (tlsMatch) {
    return tlsMatch[0];
  }
  if (raw === "SSH_DIRECT" || raw.endsWith("_DIRECT")) {
    return "DIRECT";
  }
  if (raw === "SSH_PROXY" || raw.endsWith("_PROXY")) {
    return "PROXY";
  }
  if (raw.indexOf("V2RAY") >= 0) {
    return "V2RAY";
  }
  return raw.replace(/^SSH_/, "").replace(/_/g, " ");
};

const renderSelectedServer = (server) => {
  if (!server) {
    selectedFlag.value = "C";
    selectedLocation.value = "Elige una configuración";
    return;
  }
  selectedFlag.value = getInitials(server.name);
  selectedLocation.value = server.name || "Servidor";
};

const setSelectedServer = (server, options = {}) => {
  if (!server) {
    return;
  }
  serverState.selectedConfigId = Number(server.id);
  serverState.selectedMode = normalizeText(server.mode);
  serverState.selectedCategoryId = Number(server.categoryId) || null;
  safeStorageSet(STORAGE_KEYS.selectedConfigId, serverState.selectedConfigId);

  if (options.syncNative !== false && hasBridge("DtSetConfig")) {
    sdk.config.setConfig(serverState.selectedConfigId);
  }

  renderSelectedServer(server);
};

const getBridgeSelectedServer = () => {
  if (!hasBridge("DtGetDefaultConfig")) {
    return null;
  }
  const defaultConfig = sdk.config.getDefaultConfig();
  return defaultConfig && defaultConfig.id
    ? getServerById(defaultConfig.id)
    : null;
};

const syncSelectionFromBridge = (savedId) => {
  const selected =
    savedId > 0
      ? getServerById(savedId) || getBridgeSelectedServer()
      : null;
  if (!selected) {
    serverState.selectedConfigId = null;
    serverState.selectedMode = "";
    serverState.selectedCategoryId = null;
    safeStorageSet(STORAGE_KEYS.selectedConfigId, "");
    renderSelectedServer(null);
    return;
  }
  setSelectedServer(selected, {
    syncNative: false,
    silentToast: true,
  });
};

const loadConfigs = () => {
  try {
    if (!hasBridge("DtGetConfigs")) {
      serverState.categories = [];
      serverState.selectedCategoryId = null;
      rebuildConfigIndex();
      renderSelectedServer(null);
      return false;
    }
    const categories = sdk.config.getConfigs();
    if (!Array.isArray(categories) || !categories.length) {
      serverState.categories = [];
      serverState.selectedCategoryId = null;
      rebuildConfigIndex();
      renderSelectedServer(null);
      return false;
    }
    serverState.categories = buildCategories(categories);
    rebuildConfigIndex();
    const savedId = Number(safeStorageGet(STORAGE_KEYS.selectedConfigId) || 0);
    syncSelectionFromBridge(savedId);
    return true;
  } catch (err) {
    console.error("Error loading configs:", err);
    return false;
  }
};

const setAutoServerMode = (enabled, options = {}) => {
  const normalized = !!enabled;
  if (!normalized && serverState.autoTesting.active) {
    stopAutoServerTesting();
  }
  serverState.autoServerMode = normalized;
  safeStorageSet(STORAGE_KEYS.autoServerMode, normalized ? "1" : "");
};

const clearAutoServerTimers = () => {
  const autoState = serverState.autoTesting;
  window.clearTimeout(autoState.timeoutId);
  window.clearInterval(autoState.checkTimerId);
  window.clearInterval(autoState.cleanupTimerId);
  autoState.timeoutId = null;
  autoState.checkTimerId = null;
  autoState.cleanupTimerId = null;
};

const stopAutoServerTesting = () => {
  clearAutoServerTimers();
  serverState.autoTesting.active = false;
  serverState.autoTesting.queue = [];
  serverState.autoTesting.index = 0;
  
  const { activeModalId, closeModal } = useModals();
  if (activeModalId.value === "auto-connect") {
    closeModal();
  }
  
  renderSelectedServer(getServerById(serverState.selectedConfigId));
};

const saveAutoServerSuccess = (serverId) => {
  if (!serverId) return;
  let history = [];
  try {
    history = JSON.parse(safeStorageGet(STORAGE_KEYS.autoServerSuccessHistory) || "[]");
  } catch (error) {
    history = [];
  }
  const cleanHistory = Array.isArray(history) 
    ? history.filter((id) => Number(id) !== Number(serverId)) 
    : [];
  cleanHistory.unshift(Number(serverId));
  safeStorageSet(STORAGE_KEYS.autoServerSuccessHistory, JSON.stringify(cleanHistory.slice(0, 6)));
};

const getAllServers = () => {
  const result = [];
  serverState.categories.forEach((category) => {
    category.items.forEach((item) => {
      result.push(item);
    });
  });
  return result;
};

const buildAutoServerQueue = () => {
  const allServers = getAllServers();
  const queue = [];
  const addedIds = new Set();
  const addServer = (server) => {
    if (!server || addedIds.has(Number(server.id))) {
      return;
    }
    queue.push(server);
    addedIds.add(Number(server.id));
  };

  const selectedServer = getServerById(serverState.selectedConfigId);
  addServer(selectedServer);

  let successHistory = [];
  try {
    successHistory = JSON.parse(safeStorageGet(STORAGE_KEYS.autoServerSuccessHistory) || "[]");
  } catch (error) {
    successHistory = [];
  }
  if (Array.isArray(successHistory)) {
    successHistory.forEach((id) => addServer(getServerById(id)));
  }

  if (hasBridge("DtGetNetworkName")) {
    const carrierName = normalizeText(sdk.main.getNetworkName()).toLowerCase().split(" ")[0];
    if (carrierName && !carrierName.includes("wifi")) {
      allServers.forEach((server) => {
        if (normalizeText(server.name).toLowerCase().includes(carrierName)) {
          addServer(server);
        }
      });
    }
  }

  allServers.forEach(addServer);
  return queue;
};

const verifyAutoServerTraffic = (onSuccess, onFailure) => {
  if (!hasBridge("DtGetNetworkDownloadBytes")) {
    onSuccess();
    return;
  }
  const initialDownload = Number(sdk.android.getNetworkDownloadBytes()) || 0;
  let elapsed = 0;
  const timerId = window.setInterval(() => {
    elapsed += AUTO_SERVER_VERIFY_INTERVAL_MS;
    const currentDownload = Number(sdk.android.getNetworkDownloadBytes()) || 0;
    if (currentDownload > initialDownload) {
      window.clearInterval(timerId);
      onSuccess();
      return;
    }
    if (elapsed >= AUTO_SERVER_VERIFY_TIME_MS) {
      window.clearInterval(timerId);
      onFailure();
    }
  }, AUTO_SERVER_VERIFY_INTERVAL_MS);
};

const advanceAutoServerQueue = () => {
  const autoState = serverState.autoTesting;
  autoState.index += 1;
  if (!autoState.active) return;

  if (!hasBridge("DtExecuteVpnStop")) {
    runNextAutoServer();
    return;
  }
  
  sdk.main.stopVpn();
  let elapsed = 0;
  autoState.cleanupTimerId = window.setInterval(() => {
    elapsed += 200;
    if (!autoState.active) {
      window.clearInterval(autoState.cleanupTimerId);
      autoState.cleanupTimerId = null;
      return;
    }
    
    // We need getBridgeVpnState from vpn service, but avoiding circular dependency.
    // For now we can check the SDK directly if we normalize it.
    const rawState = sdk.main.getVpnState();
    const normalized = rawState ? rawState.trim().toUpperCase() : "";
    
    if (normalized === "DISCONNECTED" || elapsed >= 3000) {
      window.clearInterval(autoState.cleanupTimerId);
      autoState.cleanupTimerId = null;
      runNextAutoServer();
    }
  }, 200);
};

const runNextAutoServer = () => {
  const autoState = serverState.autoTesting;
  if (!autoState.active) return;

  if (autoState.index >= autoState.queue.length) {
    stopAutoServerTesting();
    // ConnectStatus is in vpn service, we'll update it there via reactive state if needed.
    return;
  }

  const server = autoState.queue[autoState.index];
  if (!server || !hasBridge("DtSetConfig") || !hasBridge("DtExecuteVpnStart")) {
    autoState.index += 1;
    runNextAutoServer();
    return;
  }

  const { openModal } = useModals();
  openModal("auto-connect");

  sdk.config.setConfig(server.id);
  serverState.selectedMode = normalizeText(server.mode);
  
  // Syncing credentials to bridge should be handled in handleConnectAction in vpn.js 
  // or here if we want to be fully autonomous.
  const { syncCredentialFieldsToBridge } = useCredentials();
  syncCredentialFieldsToBridge();

  renderSelectedServer(server);

  window.setTimeout(() => {
    if (!autoState.active) return;
    sdk.main.startVpn();
  }, 100);

  autoState.timeoutId = window.setTimeout(() => {
    if (!autoState.active) return;
    clearAutoServerTimers();
    advanceAutoServerQueue();
  }, AUTO_SERVER_CONNECT_TIMEOUT_MS);

  autoState.checkTimerId = window.setInterval(() => {
    if (!autoState.active) {
      clearAutoServerTimers();
      return;
    }
    
    const rawState = sdk.main.getVpnState();
    const currentState = rawState ? rawState.trim().toUpperCase() : "";

    if (currentState === "CONNECTED") {
      clearAutoServerTimers();
      verifyAutoServerTraffic(
        () => {
          saveAutoServerSuccess(server.id);
          stopAutoServerTesting();
          setSelectedServer(server, {
            syncNative: false,
            silentToast: true
          });
        },
        () => {
          advanceAutoServerQueue();
        }
      );
      return;
    }
    if (currentState === "AUTH_FAILED") {
      clearAutoServerTimers();
      advanceAutoServerQueue();
      return;
    }
    if (currentState === "NO_NETWORK" || currentState.indexOf("FAIL") >= 0 || currentState.indexOf("ERROR") >= 0) {
      clearAutoServerTimers();
      advanceAutoServerQueue();
    }
  }, 500);
};

const startAutoServerTesting = () => {
  if (!hasBridge("DtExecuteVpnStart") || !hasBridge("DtSetConfig")) {
    return false;
  }
  const queue = buildAutoServerQueue();
  if (!queue.length) {
    return false;
  }
  clearAutoServerTimers();
  serverState.autoTesting.active = true;
  serverState.autoTesting.queue = queue;
  serverState.autoTesting.index = 0;
  
  const { openModal } = useModals();
  openModal("auto-connect");

  runNextAutoServer();
  return true;
};

import { computed } from "vue";

export const useServers = () => ({
  serverState,
  selectedFlag,
  selectedLocation,
  autoServerMode: computed(() => serverState.autoServerMode),
  setAutoServerMode,
  loadConfigs,
  setSelectedServer,
  getServerById,
  startAutoServerTesting,
  stopAutoServerTesting,
  setSelectedCategory: (categoryId) => {
    serverState.selectedCategoryId = categoryId;
  },
  selectServerById: (id) => {
    const server = getServerById(id);
    if (server) {
      setSelectedServer(server, { syncNative: true, silentToast: false });
    }
  },
  getModeLabel,
});

export { loadConfigs, setAutoServerMode, serverState, getModeLabel, startAutoServerTesting, stopAutoServerTesting };
