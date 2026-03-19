<template>
  <div
    class="hotspot-modal"
    id="hotspot-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="hotspot-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Hotspot"
    >
      <div class="hotspot-head">
        <h3>Hotspot</h3>
        <button class="close-modal-btn" type="button" @click="close">
          Cerrar
        </button>
      </div>
      <div class="hotspot-card">
        <svg
          class="hotspot-wifi"
          id="hotspot-wifi-icon"
          viewBox="0 0 120 80"
          aria-hidden="true"
          :class="{ live: isRunning }"
        >
          <path
            class="wave wave-3"
            d="M16 34c12-11 28-17 44-17s32 6 44 17"
            stroke="currentColor"
            stroke-width="6"
            stroke-linecap="round"
            fill="none"
          />
          <path
            class="wave wave-2"
            d="M29 47c8-8 19-12 31-12s23 4 31 12"
            stroke="currentColor"
            stroke-width="6"
            stroke-linecap="round"
            fill="none"
          />
          <path
            class="wave wave-1"
            d="M44 60c4-4 10-6 16-6s12 2 16 6"
            stroke="currentColor"
            stroke-width="6"
            stroke-linecap="round"
            fill="none"
          />
          <circle cx="60" cy="69" r="5" fill="currentColor" />
        </svg>
        <p class="hotspot-state-title" id="hotspot-state-title">
          {{ titleText }}
        </p>
        <p class="hotspot-state-sub" id="hotspot-state-sub">
          {{ subtitleText }}
        </p>
        <button
          class="hotspot-toggle-btn"
          type="button"
          id="hotspot-toggle-btn"
          :class="{ active: isRunning }"
          @click="toggleHotspot"
        >
          {{ isRunning ? "Desactivar hotspot" : "Activar hotspot" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { hotSpotState, refreshHotSpotState, startRouting, stopRouting } from "../../services/hotspot";

const { activeModalId, closeModal } = useModals();
const isOpen = computed(() => activeModalId.value === "hotspot");
const isRunning = computed(() => hotSpotState.value === "RUNNING");

const titleText = computed(() =>
  isRunning.value ? "Hotspot ativado" : "Hotspot desativado",
);

const subtitleText = computed(() =>
  isRunning.value
    ? "Sua rede está compartilhando internet agora."
    : "Ative para compartilhar sua conexão VPN com outros dispositivos.",
);

const close = () => {
  closeModal();
};

const toggleHotspot = () => {
  refreshHotSpotState();
  if (isRunning.value) {
    stopRouting();
  } else {
    startRouting();
  }
  [220, 900, 1600].forEach((delay) => {
    window.setTimeout(refreshHotSpotState, delay);
  });
};

watch(isOpen, (open) => {
  if (open) {
    refreshHotSpotState();
  }
});
</script>
