<template>
  <div
    class="extras-modal"
    id="extras-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="extras-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Extras"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>
      <div class="extras-head">
        <div style="display:flex;align-items:center">
          <span class="modal-header-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
          <h3>Extras</h3>
        </div>
        <button class="close-modal-btn" type="button" @click="close">
          Cerrar
        </button>
      </div>
      <div class="extras-list">
        <button class="extras-action" type="button" @click="handleBattery">
          <span>Optimizar batería</span>
        </button>
        <button class="extras-action" type="button" @click="handleApn">
          <span>Editar APN</span>
        </button>
        <button class="extras-action" type="button" @click="handleNetwork">
          <span>Configuración de red</span>
        </button>
        <button class="extras-action" type="button" @click="handleRouting">
          <span>
            Hotspot
            <span class="extras-meta" id="extras-routing-status">{{ routingStatus }}</span>
          </span>
        </button>
        <button class="extras-action" type="button" @click="handleHelp">
          <span>Ayuda / Soporte</span>
        </button>
        <button class="extras-action" type="button" @click="handleClean">
          <span>Limpiar aplicación</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useModals } from "../../composables/useModals";
import { handleBatteryAction, handleApnAction, handleNetworkAction, handleRoutingAction, handleCleanAppAction } from "../../services/extras";

const { activeModalId, closeModal, openModal } = useModals();
const isOpen = computed(() => activeModalId.value === "extras");
const routingStatus = ref("Desativado");

const close = () => {
  closeModal();
};

const handleBattery = () => {
  handleBatteryAction();
  close();
};

const handleApn = () => {
  handleApnAction();
  close();
};

const handleNetwork = () => {
  handleNetworkAction();
  close();
};

const handleRouting = () => {
  handleRoutingAction();
};

const handleHelp = () => {
  openModal('support');
};

const handleClean = () => {
  close();
  handleCleanAppAction();
};
</script>
