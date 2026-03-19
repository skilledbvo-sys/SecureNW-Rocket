import { onMounted, onBeforeUnmount } from "vue";
import { applySystemInsets } from "./useSystemInsets";
import { loadConfigs } from "../services/servers";
import { loadCredentialFields, syncCredentialVisibility } from "../services/credentials";
import { setAutoServerMode } from "../services/servers";
import { scheduleRuntimePoll } from "../services/runtime";
import { mountRocketScene, observeRocketScale } from "./useRocketScene";
import { getBridgeVpnState, applyVpnState, setDisconnectedState } from "../services/vpn";
import { refreshLogs, logsDirty } from "../services/logs";
import { onSdkEvent } from "./useSdk";
import { safeStorageGet } from "./useStorage";

export const useAppInitialization = () => {
  const initApp = () => {
    onMounted(() => {
      applySystemInsets();
      window.addEventListener("resize", applySystemInsets);
      document.addEventListener("visibilitychange", () => {
        scheduleRuntimePoll(true);
      });

      loadCredentialFields();
      syncCredentialVisibility();
      setAutoServerMode(safeStorageGet("mistervpn:auto-server-mode") === "1", {
        silent: true,
      });
      loadConfigs();
      scheduleRuntimePoll(true);

      const rocketHost = document.getElementById("rocket-host");
      mountRocketScene(rocketHost).then((shadowRoot) => {
        observeRocketScale(rocketHost, shadowRoot);
      });

      setDisconnectedState();
      applyVpnState(getBridgeVpnState() || "DISCONNECTED");

      // SDK event bindings
      onSdkEvent("newDefaultConfig", () => loadConfigs());
      onSdkEvent("newConfigs", () => loadConfigs());
      onSdkEvent("configsUpdated", () => loadConfigs());
      onSdkEvent("appUpdated", () => loadConfigs());
      onSdkEvent("newLog", () => {
        logsDirty.value = true;
        refreshLogs(false);
      });
      onSdkEvent("vpnState", (event) => {
        applyVpnState(event.payload);
      });
      onSdkEvent("vpnStoppedSuccess", () => {
        applyVpnState(getBridgeVpnState() || "DISCONNECTED");
      });
      onSdkEvent("vpnStartedSuccess", () => {
        const currentState = getBridgeVpnState();
        if (currentState) {
          applyVpnState(currentState);
          return;
        }
        applyVpnState("CONNECTING");
      });

    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", applySystemInsets);
    });
  };

  return { initApp };
};
