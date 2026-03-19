<template>
  <div
    class="auto-connect-modal"
    id="auto-connect-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="auto-connect-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Conexión automática"
    >
      <div class="auto-connect-head">
        <h3>Conexión automática</h3>
      </div>
      <div class="auto-connect-loading">
        <div class="auto-connect-spinner-row">
          <span class="auto-connect-spinner" aria-hidden="true"></span>
          <span>Probando servidores disponibles...</span>
        </div>
        <div class="auto-connect-current" id="auto-connect-current">
          Actual: {{ currentServerName }}
        </div>
      </div>
      <div class="auto-connect-grid">
        <div class="auto-connect-box">
          <span class="auto-connect-label">Total servidores</span>
          <span class="auto-connect-value" id="auto-connect-total">{{ totalServers }}</span>
        </div>
        <div class="auto-connect-box">
          <span class="auto-connect-label">Total probados</span>
          <span class="auto-connect-value" id="auto-connect-tested">{{ testedServers }}</span>
        </div>
      </div>
      <div class="auto-connect-progress">
        <div
          class="auto-connect-progress-fill"
          id="auto-connect-progress-fill"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { useServers } from "../../services/servers";

const { activeModalId } = useModals();
const { serverState } = useServers();

const isOpen = computed(() => activeModalId.value === "auto-connect");

const totalServers = computed(() => serverState.autoTesting.queue.length);
const testedServers = computed(() => Math.min(serverState.autoTesting.index, totalServers.value));

const currentServerName = computed(() => {
  const index = serverState.autoTesting.index;
  const server = serverState.autoTesting.queue[index];
  return server?.name || "preparando...";
});

const progress = computed(() => {
  const total = totalServers.value;
  if (!total) return 0;
  return Math.min(100, (testedServers.value / total) * 100);
});

watch(
  () => serverState.autoTesting.queue,
  () => {
    // just trigger recomputation
  },
);
</script>
