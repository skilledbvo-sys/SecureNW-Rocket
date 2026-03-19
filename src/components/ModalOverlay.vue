<template>
  <div
    class="modal-overlay"
    id="modal-overlay"
    :class="{ active: isActive }"
    @click="closeActiveModal"
  ></div>
</template>

<script setup>
import { computed } from "vue";
import { useModals } from "../composables/useModals";

const { activeModalId, closeModal } = useModals();
const isActive = computed(() => !!activeModalId.value);

const closeActiveModal = () => {
  closeModal();
};
</script>
