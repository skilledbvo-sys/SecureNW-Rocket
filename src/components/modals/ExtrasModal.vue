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
      <div class="extras-head">
        <h3>Extras</h3>
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
