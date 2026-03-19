<template>
  <div
    class="auto-auth-error-modal"
    id="auto-auth-error-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="auto-result-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Error de autenticación"
    >
      <div class="auto-result-icon error" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
          <path
            d="M10.3 3.4 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0z"
          />
        </svg>
      </div>
      <h3 class="auto-result-title">Error de autenticación</h3>
      <p class="auto-result-sub" id="auto-auth-error-text">{{ autoAuthErrorText }}</p>
      <div class="auto-result-actions">
        <button class="close-modal-btn" type="button" @click="close">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { autoAuthErrorText } from "../../services/autoAuthError";

const { activeModalId, closeModal } = useModals();
const isOpen = computed(() => activeModalId.value === "auto-auth-error");

const close = () => {
  closeModal();
};

watch(
  () => activeModalId.value,
  (id) => {
    if (id === "auto-auth-error") {
      // nothing extra to do
    }
  },
);
</script>
