<template>
  <section class="preconnect-card" id="preconnect-card" :class="{ hidden: isHidden }">
    <div class="preconnect-title">Detalles de conexión</div>
    <div class="preconnect-grid">
      <div class="preconnect-item">
        <div class="label">IP actual</div>
        <div class="value" id="detail-ip-value">{{ localIp }}</div>
      </div>
      <div class="preconnect-item">
        <div class="label">Red actual</div>
        <div class="value" id="detail-network-value">{{ networkName }}</div>
      </div>
      <div class="preconnect-item">
        <div class="label">Configuración</div>
        <div class="value" id="detail-config-value">{{ configVersion }}</div>
      </div>
      <div class="preconnect-item">
        <div class="label">App</div>
        <div class="value" id="detail-app-version-value">{{ appVersion }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useRuntime } from "../services/runtime";
import { useVpn } from "../services/vpn";

const { localIp, networkName, configVersion, appVersion } = useRuntime();
const { isConnected } = useVpn();

const isHidden = computed(() => isConnected.value);
</script>
