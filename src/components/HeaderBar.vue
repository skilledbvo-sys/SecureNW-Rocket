<template>
  <div class="header">
    <div
      class="status-logo status-logo--header"
      :style="{
        '--vpn-grad': colors.grad,
        '--vpn-glow': colors.glow,
        '--vpn-glow-mid': colors.glowMid,
        '--vpn-anim': colors.anim,
      }"
    >
      <div class="status-logo__brand">
        <span class="status-logo__text">Secure</span>
        <div class="status-logo__vpn-block">
          <span class="status-logo__vpn">
            <span class="status-logo__vpn-text">VPN</span>
          </span>
        </div>
      </div>
    </div>

    <button
      class="profile-btn"
      type="button"
      aria-label="Credenciais"
      @click="openCredentialsModal"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useModals } from "../composables/useModals";
import { vpnState } from "../services/vpn";

const { openModal } = useModals();

const openCredentialsModal = () => {
  openModal("credentials");
};

const colors = computed(() => {
  switch (vpnState.value) {
    case 'CONNECTED':
      return {
        grad: 'linear-gradient(165deg,#6ee7b7 0%,#34d399 20%,#10b981 40%,#059669 60%,#047857 80%,#065f46 100%)',
        glow: 'rgba(16,185,129,.85)',
        glowMid: 'rgba(16,185,129,.5)',
        anim: 'connected-glow 2.5s ease-in-out infinite',
      };
    case 'CONNECTING':
    case 'STOPPING':
    case 'RECONNECTING':
    case 'AUTH':
      return {
        grad: 'linear-gradient(165deg,#9ca3af 0%,#8891a0 20%,#6b7280 40%,#5a6270 60%,#4b5563 80%,#3f4654 100%)',
        glow: 'rgba(107,114,128,.7)',
        glowMid: 'rgba(107,114,128,.4)',
        anim: 'connecting-pulse 1.5s ease-in-out infinite',
      };
    case 'AUTH_FAILED':
    case 'NO_NETWORK':
    case 'FAILED':
      return {
        grad: 'linear-gradient(165deg,#fbbf24 0%,#f59e0b 20%,#f97316 40%,#ea580c 60%,#dc2626 80%,#c81e2a 100%)',
        glow: 'rgba(245,158,11,.8)',
        glowMid: 'rgba(245,158,11,.5)',
        anim: 'none',
      };
    default: // DISCONNECTED
      return {
        grad: 'linear-gradient(165deg,#f87171 0%,#ef4444 20%,#dc2626 40%,#b91c1c 60%,#991b1b 80%,#7f1d1d 100%)',
        glow: 'rgba(239,68,68,.8)',
        glowMid: 'rgba(239,68,68,.5)',
        anim: 'none',
      };
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap');

@keyframes metallic-shine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes connected-glow {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(16, 185, 129, 0.4)); }
  50% { filter: brightness(1.12) drop-shadow(0 0 18px rgba(16, 185, 129, 0.7)); }
}

@keyframes connecting-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-logo {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  user-select: none;
  overflow: visible;
}

.status-logo--header {
  font-size: 26px;
}

.status-logo__brand {
  display: flex;
  align-items: baseline;
  line-height: 1.05;
  position: relative;
  overflow: visible;
  padding-top: 0.12em;
  padding-bottom: 0.08em;
  padding-left: 0.1em;
  padding-right: 0.1em;
  z-index: 2;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.65)) drop-shadow(-1px -1px 0 rgba(255, 255, 255, 0.15));
}

.status-logo__text {
  position: relative;
  z-index: 3;
  font-family: 'Black Han Sans', Impact, sans-serif;
  font-weight: 900;
  font-size: 1em;
  letter-spacing: -0.03em;
  line-height: 1;
  align-self: baseline;
  background: linear-gradient(165deg, #ffffff 0%, #e8e8e8 18%, #b0b0b0 35%, #ffffff 50%, #d8d8d8 62%, #909090 75%, #d0d0d0 88%, #ffffff 100%);
  background-size: 220% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: metallic-shine 3s ease-in-out infinite;
  filter: brightness(1.05);
}

.status-logo__lightning {
  width: 0.75em;
  height: 0.75em;
  margin-left: -0.18em;
  margin-right: 0.06em;
  display: inline-block;
  align-self: baseline;
  filter: drop-shadow(1px 3px 4px rgba(0, 0, 0, 0.8));
}

.status-logo__vpn-block {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: flex-start;
  line-height: 1;
  align-self: baseline;
  margin-left: -0.25em;
  margin-top: -0.45em;
}

.status-logo__vpn {
  font-family: 'Black Han Sans', Impact, sans-serif;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #fff;
  padding: 0.14em 0.6em 0.14em 0.8em;
  position: relative;
  z-index: 1;
  line-height: 1;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 6px rgba(0, 0, 0, 0.6), 1px 1px 3px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-logo__vpn-text {
  display: inline-block;
  transform: translate(0.05em, 0.05em);
}

.status-logo__vpn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--vpn-grad);
  clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
  box-shadow: 0 6px 20px var(--vpn-glow), 0 2px 8px var(--vpn-glow-mid), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  z-index: -1;
  transition: background 0.4s ease, box-shadow 0.4s ease;
  animation: var(--vpn-anim);
}

.status-logo__vpn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.12) 60%, rgba(255, 255, 255, 0) 100%);
  clip-path: polygon(10% 0%, 100% 0%, 94% 100%, 4% 100%);
  pointer-events: none;
  z-index: 2;
}

@media (max-width: 360px) {
  .status-logo--header {
    font-size: 22px;
  }
}
</style>
