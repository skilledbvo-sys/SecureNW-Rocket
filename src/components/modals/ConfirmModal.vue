<template>
  <div
    class="confirm-modal"
    id="confirm-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="confirm-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar limpieza"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>
      <div class="extras-head">
        <div style="display:flex;align-items:center">
          <span class="modal-header-icon" style="background:rgba(255,94,125,0.12);box-shadow:0 0 14px rgba(255,94,125,0.18);color:#ff7c98"><svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span>
          <h3>Limpiar aplicación</h3>
        </div>
        <button class="close-modal-btn" type="button" @click="close">
          Cerrar
        </button>
      </div>
      <div class="confirm-text">
        Esto limpiará los datos locales y cerrará la aplicación.
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn" type="button" @click="close">
          Cancelar
        </button>
        <button class="confirm-btn danger" type="button" @click="confirmClean">
          Limpiar y cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useModals } from "../../composables/useModals";
import { executeCleanAppAction } from "../../services/extras";

const { activeModalId, closeModal } = useModals();
const isOpen = computed(() => activeModalId.value === "confirm");

const close = () => {
  closeModal();
};

const confirmClean = () => {
  closeModal();
  executeCleanAppAction();
};
</script>
