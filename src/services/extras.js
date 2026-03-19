import { sdk, hasBridge } from "../composables/useSdk";
import { useModals } from "../composables/useModals";
import { safeStorageSet } from "../composables/useStorage";

export const handleUpdateAction = () => {
  if (!sdk || !hasBridge("DtStartAppUpdate")) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Actualización no disponible";
    return;
  }
  sdk.main.startAppUpdate();
  const connectStatus = document.getElementById("connect-status");
  if (connectStatus) connectStatus.textContent = "Actualización iniciada";
};

const listStorageKeys = {
  username: "mistervpn:username",
  password: "mistervpn:password",
  uuid: "mistervpn:uuid",
  selectedConfigId: "mistervpn:selected-config-id",
  autoServerMode: "mistervpn:auto-server-mode",
  autoServerSuccessHistory: "mistervpn:auto-server-success-history",
  lastUserData: "mistervpn:last-user-data",
};

export const handleBatteryAction = () => {
  if (!sdk || !hasBridge("DtIgnoreBatteryOptimizations")) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Ajuste de batería no disponible";
    return;
  }
  sdk.app.ignoreBatteryOptimizations();
  const connectStatus = document.getElementById("connect-status");
  if (connectStatus) connectStatus.textContent = "Ajuste de batería solicitado";
};

export const handleApnAction = () => {
  if (!sdk || !hasBridge("DtStartApnActivity")) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Editor de APN no disponible";
    return;
  }
  sdk.app.startApnActivity();
};

export const handleNetworkAction = () => {
  if (!sdk || !hasBridge("DtStartRadioInfoActivity")) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Configuración de red no disponible";
    return;
  }
  sdk.app.startRadioInfoActivity();
};

export const handleRoutingAction = () => {
  const { openModal } = useModals();
  openModal("hotspot");
};

export const executeCleanAppAction = () => {
  const canClean = sdk && hasBridge("DtCleanApp");
  const canClose = sdk && hasBridge("DtCloseApp");
  if (!canClean && !canClose) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Limpieza de la aplicación no disponible";
    return;
  }
  Object.values(listStorageKeys).forEach((storageKey) => {
    safeStorageSet(storageKey, "");
  });
  const usernameField = document.getElementById("username-field");
  const passwordField = document.getElementById("password-field");
  const uuidField = document.getElementById("uuid-field");
  if (usernameField) usernameField.value = "";
  if (passwordField) passwordField.value = "";
  if (uuidField) uuidField.value = "";
  if (hasBridge("DtExecuteVpnStop")) {
    try {
      sdk.main.stopVpn();
    } catch (e) {
      // ignore
    }
  }
  window.setTimeout(() => {
    if (canClean) {
      sdk.app.cleanApp();
    }
    if (canClose) {
      sdk.android.closeApp();
      return;
    }
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Aplicación limpia";
  }, 180);
};

export const handleCleanAppAction = executeCleanAppAction;
