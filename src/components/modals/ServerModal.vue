<template>
  <div
    class="server-modal"
    id="server-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="server-modal-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Seleccionar servidor"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>
      <div class="server-modal-top">
        <div style="display:flex;align-items:center">
          <span class="modal-header-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
          <h3>Seleccionar servidor</h3>
        </div>
        <button class="close-modal-btn" type="button" @click="close">
          Cerrar
        </button>
      </div>
      <div class="server-modal-body">
        <button
          class="server-auto-toggle"
          type="button"
          role="switch"
          :aria-checked="autoServerMode.toString()"
          @click="toggleAutoServer"
        >
          <span class="server-auto-text">
            <strong>Automático</strong>
            <span id="server-auto-status">{{ autoServerMode ? "Activado" : "Desactivado" }}</span>
          </span>
          <span
            class="route-toggle"
            id="server-auto-indicator"
            :class="{ active: autoServerMode }"
            aria-hidden="true"
          ></span>
        </button>
        <div
          class="server-auto-note"
          id="server-auto-note"
          v-if="autoServerMode"
        >
          Modo automático activado. La app elegirá y probará los servidores
          por sí sola antes de conectar.
        </div>
        <div class="server-tools" id="server-tools-wrap" v-if="!autoServerMode">
          <input
            class="server-search"
            id="server-search-input"
            type="text"
            placeholder="Buscar servidor..."
            v-model="search"
          />
          <button
            class="server-refresh-btn"
            type="button"
            id="refresh-servers-btn"
            @click="refresh"
          >
            Actualizar
          </button>
        </div>
        <div class="server-list-wrap" id="server-list-wrap">
          <div class="server-list">
            <!-- Loading state -->
            <button v-if="serverState.categories.length === 0" class="server-option active" type="button" disabled>
              <span><i class="dot"></i>Cargando servidores de la app...</span>
              <span class="ping">...</span>
            </button>

            <!-- Back to categories -->
            <button 
              v-if="!search.trim() && serverState.selectedCategoryId" 
              type="button" 
              class="server-back-icon-btn" 
              @click="setSelectedCategory(null)"
              aria-label="Volver a categorías"
            >
              <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
              <span>Volver a categorías</span>
            </button>

            <!-- Categories view -->
            <template v-if="!search.trim() && !serverState.selectedCategoryId">
              <button 
                v-for="cat in serverState.categories" 
                :key="cat.id"
                type="button" 
                class="server-category-option" 
                @click="setSelectedCategory(cat.id)"
              >
                <span><i class="dot"></i>{{ cat.name || "Categoría" }}</span>
                <span class="ping">{{ cat.items.length }}</span>
              </button>
            </template>

            <!-- Servers view (filtered by search or category) -->
            <template v-else>
              <div v-for="catGroup in filteredServers" :key="catGroup.category.id">
                <div v-if="search.trim()" class="server-category-label">{{ catGroup.category.name || "Categoría" }}</div>
                <button 
                  v-for="item in catGroup.items" 
                  :key="item.id"
                  type="button" 
                  class="server-option"
                  :class="{ active: Number(item.id) === Number(serverState.selectedConfigId) }"
                  @click="handleSelect(item.id)"
                >
                  <span>
                    <span class="server-icon-shell">
                      <img v-if="isImageUrl(item.icon)" loading="lazy" :src="item.icon" :alt="item.name || 'Servidor'" />
                      <span v-else class="server-icon-text">{{ item.icon || getInitials(item.name) }}</span>
                    </span>
                    {{ item.name || "Servidor" }}
                    <span class="server-meta">{{ item.categoryName || "Categoría" }}</span>
                  </span>
                  <span class="ping">{{ getModeLabel(item.mode) }}</span>
                </button>
              </div>
            </template>
            
            <div v-if="filteredServers.length === 0 && serverState.categories.length > 0" class="server-empty">
              Ningún servidor disponible en este momento.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useModals } from "../../composables/useModals";
import { useServers, loadConfigs } from "../../services/servers";
import { normalizeSearch, getInitials } from "../../composables/useUtils";

const { activeModalId, closeModal } = useModals();
const {
  serverState,
  autoServerMode,
  setAutoServerMode,
  selectServerById,
  setSelectedCategory,
  getModeLabel,
} = useServers();

const isOpen = computed(() => activeModalId.value === "server");
const search = ref("");

const close = () => {
  closeModal();
};

const refresh = () => {
  loadConfigs();
};

const toggleAutoServer = () => {
  setAutoServerMode(!autoServerMode.value);
};

const handleSelect = (id) => {
  selectServerById(id);
  close();
};

const isImageUrl = (icon) => {
  return /^(data:image\/|https?:\/\/|\/|\.(png|jpe?g|gif|svg|webp|avif))/.test(icon);
};

const filteredServers = computed(() => {
  const query = normalizeSearch(search.value);
  const visibleCategories = [];

  serverState.categories.forEach((category) => {
    const items = category.items.filter((item) => {
      if (!query) return true;
      return [item.name, item.description, item.mode, item.categoryName].some(
        (value) => normalizeSearch(value).indexOf(query) >= 0,
      );
    });
    if (!items.length) return;
    visibleCategories.push({ category, items });
  });

  if (!query && serverState.selectedCategoryId) {
    return visibleCategories.filter(
      ({ category }) => Number(category.id) === Number(serverState.selectedCategoryId)
    );
  }

  return visibleCategories;
});

watch(search, (value) => {
  if (value && value.trim()) {
    setSelectedCategory(null);
  }
});

watch(isOpen, (open) => {
  if (open) {
    search.value = "";
    setSelectedCategory(null);
  }
});
</script>
