<template>
  <section class="connect-panel" id="connect-panel" :class="connectPanelClass">
    <div class="active-time">
      <span class="label">Conexión activa</span>
      <span class="value" id="active-time-value">{{ activeTime }}</span>
      <button
        class="server-picker-btn"
        type="button"
        id="open-server-modal"
        @click="openServerModal"
      >
        <span class="flag" id="selected-flag">{{ selectedFlag }}</span>
        <span id="selected-location">{{ selectedLocation }}</span>
      </button>
    </div>

    <!-- TV Mode Specific Controls -->
    <div class="tv-controls" v-if="isTvMode">
      <div class="tv-inputs">
        <div class="tv-input-group">
          <label>Usuario</label>
          <input 
            type="text" 
            v-model="username" 
            placeholder="Username" 
            ref="userInput"
            @keydown="handleInputKey"
          />
        </div>
        <div class="tv-input-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="Password" 
            ref="passInput"
            @keydown="handleInputKey"
          />
        </div>
      </div>
      
      <TVServerCarousel 
        ref="carouselRef"
        v-if="isTvMode"
        @nav-up="focusInputs"
        @nav-down="focusConnect"
      />
    </div>

    <div class="connect-core">
      <button
        class="connect-trigger"
        aria-label="Conectar VPN"
        id="power-btn"
        :aria-pressed="isConnected.toString()"
        type="button"
        @click="handleConnectAction"
      >
        <div id="rocket-host" class="rocket-host" aria-hidden="true" />
      </button>
    </div>

    <div class="connect-status" id="connect-status">
      {{ connectStatus }}
    </div>

    <button 
      class="tv-connect-trigger" 
      @click="handleConnectAction" 
      v-if="isTvMode"
      ref="connectBtn"
      @keydown.up.prevent="focusCarousel"
    >
      {{ isConnected ? 'DESCONECTAR' : 'CONECTAR' }}
    </button>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useModals } from "../composables/useModals";
import { useVpn } from "../services/vpn";
import { useServers } from "../services/servers";
import { useCredentials } from "../services/credentials";
import TVServerCarousel from "./TVServerCarousel.vue";

const { openModal } = useModals();
const {
  connectStatus,
  activeTime,
  connectPanelClass,
  isConnected,
  handleConnectAction,
} = useVpn();
const { selectedFlag, selectedLocation } = useServers();
const { username, password } = useCredentials();

const isTvMode = ref(false);
const userInput = ref(null);
const passInput = ref(null);
const carouselRef = ref(null);
const connectBtn = ref(null);

const checkOrientation = () => {
  const isLandscape = window.innerHeight < window.innerWidth;
  if (!isTvMode.value && isLandscape) {
    // Entering TV mode
    setTimeout(() => {
      focusInputs();
    }, 100);
  }
  isTvMode.value = isLandscape;
};

const focusInputs = () => {
  if (userInput.value) userInput.value.focus();
};

const focusCarousel = () => {
  if (carouselRef.value) carouselRef.value.focusFirst();
};

const focusConnect = () => {
  if (connectBtn.value) connectBtn.value.focus();
};

const handleInputKey = (e) => {
  if (e.key === "ArrowRight") {
    if (e.target === userInput.value) passInput.value.focus();
  } else if (e.key === "ArrowLeft") {
    if (e.target === passInput.value) userInput.value.focus();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    focusCarousel();
  }
};

import { onMounted, onBeforeUnmount, ref } from "vue";
onMounted(() => {
  checkOrientation();
  window.addEventListener("resize", checkOrientation);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkOrientation);
});

const openServerModal = () => {
  openModal("server");
};
</script>
