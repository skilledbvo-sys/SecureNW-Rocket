<template>
  <div
    class="logs-modal"
    id="logs-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div class="logs-sheet" role="dialog" aria-modal="true" aria-label="Logs">
      <div class="logs-head">
        <h3>Logs</h3>
        <div class="logs-actions">
          <button class="close-modal-btn" type="button" @click="handleClear">
            Limpiar
          </button>
          <button class="close-modal-btn" type="button" @click="close">
            Cerrar
          </button>
        </div>
      </div>
      <div class="logs-content" ref="scrollRef">
        <div v-for="(line, index) in logLines" :key="index" class="log-line" v-html="line"></div>
        <div v-if="logLines.length === 0" class="logs-empty">Sin logs disponibles</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, nextTick, onMounted } from "vue";
import { useModals } from "../../composables/useModals";
import { logLines, refreshLogs, clearLogs } from "../../services/logs";

const { activeModalId, closeModal } = useModals();
const isOpen = computed(() => activeModalId.value === "logs");
const scrollRef = ref(null);

const close = () => {
  closeModal();
};

const handleClear = () => {
  clearLogs();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
    }
  });
};

watch(isOpen, (newVal) => {
  if (newVal) {
    refreshLogs();
    scrollToBottom();
  }
});

watch(logLines, () => {
  if (isOpen.value) {
    scrollToBottom();
  }
}, { deep: true });

onMounted(() => {
  if (isOpen.value) {
    refreshLogs();
    scrollToBottom();
  }
});

// Expose open state to global for service trigger
window.isLogsModalOpen = () => isOpen.value;
</script>
