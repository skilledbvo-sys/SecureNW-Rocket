<template>
  <div
    class="credentials-modal"
    id="credentials-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="credentials-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Credenciales"
    >
      <div class="credentials-head">
        <h3>Credenciales</h3>
        <button class="close-modal-btn" type="button" @click="close">
          Cerrar
        </button>
      </div>
      <div class="credentials-form">
        <div class="credentials-group" id="username-group" :class="{ hidden: usernameHidden }">
          <label class="credentials-label" for="username-field">Usuario</label>
          <input
            class="credentials-input"
            id="username-field"
            type="text"
            autocomplete="username"
            v-model="username"
            :disabled="disabled"
          />
        </div>
        <div class="credentials-group" id="password-group" :class="{ hidden: passwordHidden }">
          <label class="credentials-label" for="password-field">Contraseña</label>
          <div class="credentials-input-wrap">
            <input
              class="credentials-input"
              id="password-field"
              :type="passwordVisible ? 'text' : 'password'"
              autocomplete="current-password"
              v-model="password"
              :disabled="disabled"
            />
            <button
              class="credentials-toggle"
              type="button"
              id="toggle-password-visibility"
              :aria-label="passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="togglePasswordVisibility"
              :disabled="disabled"
            >
              <span v-html="passwordVisible ? PASSWORD_EYE_OFF_SVG : PASSWORD_EYE_OPEN_SVG" />
            </button>
          </div>
        </div>
        <div class="credentials-group" id="uuid-group" :class="{ hidden: uuidHidden }">
          <label class="credentials-label" for="uuid-field">UUID</label>
          <input
            class="credentials-input"
            id="uuid-field"
            type="text"
            autocomplete="off"
            v-model="uuid"
            :disabled="disabled"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { useCredentials } from "../../services/credentials";
import { useVpn } from "../../services/vpn";

const { activeModalId, closeModal } = useModals();
const { username, password, uuid, usernameGroupHidden, passwordGroupHidden, uuidGroupHidden, loadCredentialFields, persistCredentialFields } = useCredentials();
const { isConnected, isConnecting } = useVpn();

const isOpen = computed(() => activeModalId.value === "credentials");
const passwordVisible = ref(false);

const passwordHidden = computed(() => passwordGroupHidden.value);
const usernameHidden = computed(() => usernameGroupHidden.value);
const uuidHidden = computed(() => uuidGroupHidden.value);

const disabled = computed(() => isConnected.value || isConnecting.value);

const close = () => {
  closeModal();
};

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

watch([username, password, uuid], () => {
  persistCredentialFields();
});

watch(isOpen, (open) => {
  if (open) {
    loadCredentialFields();
  }
});

const PASSWORD_EYE_OPEN_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.1 12a10.8 10.8 0 0 1 19.8 0 10.8 10.8 0 0 1-19.8 0z"/><circle cx="12" cy="12" r="3"/></svg>';
const PASSWORD_EYE_OFF_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3 21 21"/><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4"/><path d="M9.9 5.1A10.8 10.8 0 0 1 21.9 12"/><path d="M6.3 6.3A10.9 10.9 0 0 0 2.1 12a10.8 10.8 0 0 0 14.2 6.6"/></svg>';
</script>
