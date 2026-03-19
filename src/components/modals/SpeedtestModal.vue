<template>
  <div
    class="speedtest-modal"
    id="speedtest-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="speedtest-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Speedtest"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>
      <div class="speedtest-head">
        <div style="display:flex;align-items:center">
          <span class="modal-header-icon"><svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
          <h3>Speedtest</h3>
        </div>
        <button class="close-modal-btn" type="button" @click="close">
          Cerrar
        </button>
      </div>
      <div class="speedtest-grid">
        <div class="speedtest-item">
          <div class="label">Download</div>
          <div class="value" id="speedtest-download">{{ speedtestDownload }}</div>
        </div>
        <div class="speedtest-item">
          <div class="label">Upload</div>
          <div class="value" id="speedtest-upload">{{ speedtestUpload }}</div>
        </div>
        <div class="speedtest-item">
          <div class="label">Ping</div>
          <div class="value" id="speedtest-ping">{{ speedtestPing }}</div>
        </div>
        <div class="speedtest-item">
          <div class="label">Jitter</div>
          <div class="value" id="speedtest-jitter">{{ speedtestJitter }}</div>
        </div>
      </div>
      <div class="speedtest-chart">
        <div class="speedometer">
          <svg viewBox="0 0 320 180" aria-label="Velocímetro de velocidad">
            <defs>
              <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #8b6eff; stop-opacity: 1" />
                <stop offset="50%" style="stop-color: #6da9ff; stop-opacity: 1" />
                <stop offset="100%" style="stop-color: #8b6eff; stop-opacity: 1" />
              </linearGradient>
            </defs>
            <!-- Track exterior -->
            <path class="speedometer-track" d="M30 160 A130 130 0 0 1 290 160"></path>
            <!-- Accent interior -->
            <path class="speedometer-accent" d="M48 160 A112 112 0 0 1 272 160"></path>

            <!-- 
              Tick marks y Labels manuales para precisión total
              Centro del arco: (160, 160)
            -->
            <!-- Tick marks en el arco (radio 112) -->
            <line x1="48" y1="160" x2="60" y2="160" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="80.8" y1="80.8" x2="89.2" y2="89.2" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="160" y1="48" x2="160" y2="60" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="239.2" y1="80.8" x2="230.8" y2="89.2" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="272" y1="160" x2="260" y2="160" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>

            <!-- Labels (radio 95 del centro 160,160) -->
            <text x="65"  y="164" text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">0</text>
            <text x="93"  y="97"  text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">25</text>
            <text x="160" y="62"  text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">50</text>
            <text x="227" y="97"  text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">75</text>
            <text x="255" y="164" text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">100</text>
          </svg>

          <div
            class="speedometer-needle"
            id="speedtest-needle"
            :style="{ transform: `translate(-50%, 0) rotate(${speedtestNeedleAngle}deg)` }"
          ></div>
          <div class="speedometer-center"></div>
        </div>

        <div class="speedometer-value" id="speedometer-value">
          {{ speedtestCurrentSpeed }}<span>Mbps</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { useSpeedtest } from "../../services/speedtest";

const { activeModalId, closeModal } = useModals();
const {
  speedtestDownload,
  speedtestUpload,
  speedtestPing,
  speedtestJitter,
  speedtestTime,
  runSpeedtest,
  speedtestNeedleAngle,
  speedtestCurrentSpeed,
  speedtestIsRunning,
} = useSpeedtest();

const isOpen = computed(() => activeModalId.value === "speedtest");

const close = () => {
  closeModal();
};

/* Auto-start test when modal opens */
watch(isOpen, (opened) => {
  if (opened) {
    runSpeedtest();
  }
});

</script>
