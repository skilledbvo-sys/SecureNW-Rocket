<template>
  <nav class="bottom-tabs" aria-label="Navegación">
    <button class="tab-btn" type="button" data-tab="logs" @click="onTabClick('logs')">
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14M5 10h14M5 15h9M5 19h9" />
      </svg>
      Logs
    </button>
    <button class="tab-btn" type="button" data-tab="refresh" @click="onTabClick('refresh')">
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5" />
      </svg>
      Actualizar
    </button>
    <button
      class="tab-btn center-home active"
      type="button"
      data-tab="home"
      @click="onTabClick('home')"
    >
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5M6.5 9.5V21h11V9.5" />
      </svg>
      Inicio
    </button>
    <button class="tab-btn" type="button" data-tab="speedtest" @click="onTabClick('speedtest')">
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 15a8 8 0 0 1 16 0" />
        <path d="M12 14.5l4.5-5.5" />
        <circle cx="7.4" cy="15.5" r="1" />
        <circle cx="12" cy="15.5" r="1" />
        <circle cx="16.6" cy="15.5" r="1" />
      </svg>
      Speedtest
    </button>
    <button class="tab-btn" type="button" data-tab="extras" @click="onTabClick('extras')">
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Extras
    </button>
  </nav>
</template>

<script setup>
import { ref } from "vue";
import { useModals } from "../composables/useModals";
import { handleUpdateAction } from "../services/extras";
import { runSpeedtest } from "../services/speedtest";

const { openModal } = useModals();

const activeTab = ref("home");

const onTabClick = (tab) => {
  activeTab.value = tab;

  if (tab === "logs") {
    openModal("logs");
    return;
  }
  if (tab === "refresh") {
    handleUpdateAction();
    return;
  }
  if (tab === "speedtest") {
    openModal("speedtest");
    runSpeedtest();
    return;
  }
  if (tab === "extras") {
    openModal("extras");
    return;
  }
};
</script>
