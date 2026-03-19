<template>
  <div
    class="checkuser-modal"
    id="checkuser-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="checkuser-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Datos del usuario"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>
      <div class="checkuser-head">
        <div style="display:flex;align-items:center">
          <span class="modal-header-icon"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
          <h3>Datos del usuario</h3>
        </div>
        <button class="close-modal-btn" type="button" @click="close">
          Cerrar
        </button>
      </div>
      <div class="checkuser-body" id="checkuser-modal-body">
        <div v-if="checkuserLoading" class="checkuser-loading">Verificando datos del usuario...</div>
        <div v-else-if="checkuserError" class="checkuser-loading">{{ checkuserError }}</div>
        <div v-else-if="userData">
          <div class="checkuser-success" v-if="userData.showConnected">
            <div class="checkuser-success-icon">
              <svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>
            </div>
            <p class="checkuser-success-title">Conectado con éxito</p>
            <p class="checkuser-success-sub">{{ userData.lastConnectedServerName }}</p>
          </div>
          <div class="checkuser-header">
            <div class="checkuser-avatar">{{ userData.avatarLetter }}</div>
            <div class="checkuser-details">
              <span class="checkuser-main-title">Datos de tu plan</span>
              <span class="checkuser-name">{{ userData.username }}</span>
            </div>
          </div>
          <div class="checkuser-info-grid">
            <div class="checkuser-info-box">
              <span class="checkuser-info-label">Expira en</span>
              <span class="checkuser-info-value">{{ userData.expDaysText }}</span>
            </div>
            <div class="checkuser-info-box">
              <span class="checkuser-info-label">Vencimiento</span>
              <span class="checkuser-info-value">{{ userData.expirationDate }}</span>
            </div>
            <div class="checkuser-info-box">
              <span class="checkuser-info-label">Conexiones</span>
              <span class="checkuser-info-value">{{ userData.connectionsText }}</span>
            </div>
            <div class="checkuser-info-box">
              <span class="checkuser-info-label">Estado</span>
              <span
                :class="['checkuser-info-value', userData.statusActive ? 'status-active' : 'status-inactive']"
              >
                {{ userData.statusText }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="checkuser-loading">No hay datos disponibles.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { useCheckuser } from "../../services/checkuser";
import { sdk, hasBridge } from "../../composables/useSdk";

const { activeModalId, closeModal } = useModals();
const { userData, checkuserLoading, checkuserError, startCheckuserResponseTimeout, getCachedCheckuserData, handleCheckuserModel } = useCheckuser();

const isOpen = computed(() => activeModalId.value === "checkuser");

const close = () => {
  closeModal();
};

const triggerCheckUser = () => {
  if (sdk && hasBridge("DtStartCheckUser")) {
    startCheckuserResponseTimeout();
    sdk.main.startCheckUser();
  } else {
    // try to load from cache if bridge is not available (simulator or missing)
    const cached = getCachedCheckuserData();
    if (cached) {
      handleCheckuserModel(cached);
    } else {
      // no bridge and no cache
    }
  }
};

watch(isOpen, (newVal) => {
  if (newVal) {
    triggerCheckUser();
  }
});
</script>
