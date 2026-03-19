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
          <svg viewBox="0 0 320 190" aria-label="Velocímetro de velocidad">
            <path class="speedometer-track" d="M30 160 A130 130 0 0 1 290 160"></path>
            <path class="speedometer-accent" d="M48 160 A112 112 0 0 1 272 160"></path>
          </svg>
          <div class="speedometer-needle" id="speedtest-needle" :style="{ transform: `translate(-50%, 0) rotate(${speedtestNeedleAngle}deg)` }"></div>
          <div class="speedometer-center"></div>
          <div class="speedometer-scale" aria-hidden="true">
            <span style="left: 9%; top: 83%">0</span>
            <span style="left: 28%; top: 57%">25</span>
            <span style="left: 50%; top: 49%">50</span>
            <span style="left: 72%; top: 57%">75</span>
            <span style="left: 91%; top: 83%">100+</span>
          </div>
        </div>
        <div class="speedometer-value" id="speedometer-value">
          {{ speedtestCurrentSpeed }}<span>Mbps</span>
        </div>
        <div class="speedtest-sub" id="speedtest-time">{{ speedtestTime }}</div>
      </div>
      <div class="speedtest-actions">
        <button
          class="speedtest-btn primary"
          type="button"
          id="run-speedtest"
          @click="runTest"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
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
} = useSpeedtest();

const isOpen = computed(() => activeModalId.value === "speedtest");

const close = () => {
  closeModal();
};

const runTest = async () => {
  await runSpeedtest();
};

const buttonText = computed(() =>
  speedtestTime.value.startsWith("Status: iniciando")
    ? "Probando..."
    : "Ejecutar prueba",
);

</script>
