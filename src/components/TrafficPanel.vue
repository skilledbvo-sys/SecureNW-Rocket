<template>
  <section class="traffic-panel" id="traffic-panel" :class="{ active: isConnected }">
    <div class="traffic-values">
      <div class="traffic-value-card download">
        <div class="label">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
          </svg>
        </div>
        <div class="value" id="download-value">{{ download }}</div>
      </div>
      <div class="traffic-value-card">
        <div class="label">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 15a8 8 0 1 1 16 0M12 11l5-3M12 15h.01M8 15h.01M16 15h.01"
            />
          </svg>
        </div>
        <div class="value" id="live-ping-value">{{ ping }}</div>
      </div>
      <div class="traffic-value-card upload">
        <div class="label">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20V8M17 13l-5-5-5 5M5 4h14" />
          </svg>
        </div>
        <div class="value" id="upload-value">{{ upload }}</div>
      </div>
    </div>

    <div class="traffic-total-monitor">
      <div class="traffic-total-top">
        <span class="traffic-total-label">Tráfico total usado</span>
        <span class="traffic-total-value" id="total-used-value"
          >{{ totalUsed }}</span
        >
      </div>
      <div class="traffic-total-split">
        <div class="traffic-total-item">
          Descarga acumulada<strong id="total-down-value">{{ totalDown }}</strong>
        </div>
        <div class="traffic-total-item">
          Subida acumulada<strong id="total-up-value">{{ totalUp }}</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRuntime } from "../services/runtime";
import { useVpn } from "../services/vpn";

const { download, upload, ping, totalDown, totalUp, totalUsed } = useRuntime();
const { isConnected } = useVpn();
</script>
