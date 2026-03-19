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
      <div class="extras-head">
        <h3>Limpiar aplicación</h3>
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
