<template>
  <main class="phone">
    <div class="content">
      <HeaderBar />
      <ConnectPanel />
      <div class="bottom-zone">
        <PreconnectCard />
        <TrafficPanel />
      </div>
    </div>

    <BottomTabs />
  </main>

  <ModalOverlay />

  <ModalManager />
</template>

<script setup>
import HeaderBar from "./components/HeaderBar.vue";
import ConnectPanel from "./components/ConnectPanel.vue";
import PreconnectCard from "./components/PreconnectCard.vue";
import TrafficPanel from "./components/TrafficPanel.vue";
import BottomTabs from "./components/BottomTabs.vue";
import ModalOverlay from "./components/ModalOverlay.vue";
import ModalManager from "./components/ModalManager.vue";

// Initialize the app (listeners, sdk events, load defaults) once.
import { useAppInitialization } from "./composables/useAppInitialization";

const { initApp } = useAppInitialization();
initApp();
</script>
