<template>
  <div
    class="support-modal"
    id="support-modal"
    :class="{ open: isOpen }"
    :aria-hidden="(!isOpen).toString()"
  >
    <div
      class="support-sheet modal-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Soporte"
    >
      <div class="support-head">
        <div class="support-head-info">
          <h3>Soporte Técnico</h3>
          <span class="support-subtitle">Asistente Virtual</span>
        </div>
        <div class="support-head-actions">
          <button class="icon-btn" @click="clearHistory" title="Limpiar historial">
            <!-- Trash icon -->
            <svg viewBox="0 0 24 24" class="icon-svg"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
          <button class="close-modal-btn" type="button" @click="close">
            Cerrar
          </button>
        </div>
      </div>
      
      <div class="support-messages" ref="scrollRef">
        <div
          v-for="msg in processedMessages"
          :key="msg.id"
          class="chat-bubble"
          :class="{
            'chat-user': msg.role === 'user',
            'chat-assistant': msg.role === 'assistant',
            'chat-pending': msg.status === 'pending',
            'chat-error': msg.status === 'error'
          }"
        >
          <template v-if="msg.role === 'assistant'">
            <span v-html="renderMarkdown(msg.cleanText)" v-if="msg.cleanText"></span>
            <div class="chat-actions" v-if="msg.links && msg.links.length > 0">
              <a
                v-for="link in msg.links"
                :key="link.url"
                class="chat-link-btn"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ link.label }}
              </a>
            </div>
          </template>
          <template v-else>
            {{ msg.text }}
          </template>
        </div>
      </div>

      <div class="support-footer">
        <input
          type="text"
          class="support-input"
          placeholder="Escribe tu mensaje..."
          v-model="input"
          @keydown.enter="handleSend"
          :disabled="isSending"
        />
        <button
          class="support-send-btn"
          @click="handleSend"
          :disabled="isSending || !input.trim()"
        >
          <!-- Send icon -->
          <svg viewBox="0 0 24 24" class="icon-svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useModals } from '../../composables/useModals';
import { groqSend } from '../../services/groq';
import { GROQ_API_KEY, GROQ_MODEL, SYSTEM_PROMPT } from '../../services/ai-support';

const { activeModalId, closeModal } = useModals();
const isOpen = computed(() => activeModalId.value === 'support');

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const STORAGE_KEY = 'support_chat_history';
const MAX_STORED_MESSAGES = 100;

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveHistory = (msgs) => {
  try {
    const toStore = msgs.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {}
};

const messages = ref(loadHistory());
const input = ref('');
const isSending = ref(false);
const scrollRef = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
    }
  });
};

const ALLOWED_ORIGINS = ['shop.jhservices.com.ar', 'wa.me', 't.me'];

const isAllowedUrl = (url) => {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_ORIGINS.some((o) => hostname === o || hostname.endsWith('.' + o));
  } catch {
    return false;
  }
};

const processMessageText = (text) => {
  const links = [];
  const cleanText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    if (isAllowedUrl(url)) {
      links.push({ label, url });
      return '';
    }
    return label;
  }).replace(/\n{2,}/g, '\n').trim();
  return { cleanText, links };
};

const renderMarkdown = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*\*(.+?)\*\*\*/gs, '<strong><em>$1</em></strong>')
    .replace(/___(.+?)___/gs, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>')
    .replace(/__(.+?)__/gs, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/gs, '<em>$1</em>')
    .replace(/_(.+?)_/gs, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};

// Process existing messages so we don't have to re-compute on every render
const processedMessages = computed(() => {
  return messages.value.map(msg => {
    if (msg.role === 'assistant') {
      const { cleanText, links } = processMessageText(msg.text);
      return { ...msg, cleanText, links };
    }
    return msg;
  });
});

watch(isOpen, (newVal) => {
  if (newVal) {
    if (messages.value.length === 0) {
      messages.value.push({
        id: createId(),
        role: 'assistant',
        text: '¡Hola! Soy el soporte de Secure Lite. ¿En qué puedo ayudarte?',
      });
    }
    scrollToBottom();
  }
});

watch(messages, (newMsgs) => {
  saveHistory(newMsgs);
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  // Always ensure at least one message
  if (messages.value.length === 0) {
    messages.value.push({
      id: createId(),
      role: 'assistant',
      text: '¡Hola! Soy el soporte de Secure Lite. ¿En qué puedo ayudarte?',
    });
  }
});

const close = () => {
  closeModal();
};

const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  messages.value = [{
    id: createId(),
    role: 'assistant',
    text: '¡Hola! Soy el soporte de Secure Lite. ¿En qué puedo ayudarte?',
  }];
};

const handleSend = () => {
  const trimmed = input.value.trim();
  if (!trimmed || isSending.value) return;

  if (!GROQ_API_KEY) {
    alert("No hay API Key configurada para Groq.");
    return;
  }

  const userMessage = { id: createId(), role: 'user', text: trimmed };
  const assistantMessage = {
    id: createId(),
    role: 'assistant',
    text: 'Escribiendo...',
    status: 'pending',
  };

  messages.value.push(userMessage, assistantMessage);
  input.value = '';
  isSending.value = true;

  const payload = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.value.filter(m => m.id !== assistantMessage.id).map(m => ({ role: m.role, content: m.text })),
  ];

  groqSend({ apiKey: GROQ_API_KEY, model: GROQ_MODEL }, payload, {
    onSuccess(reply) {
      const msgTarget = messages.value.find(m => m.id === assistantMessage.id);
      if (msgTarget) {
        msgTarget.text = reply;
        msgTarget.status = undefined;
      }
      isSending.value = false;
    },
    onError(msg) {
      const msgTarget = messages.value.find(m => m.id === assistantMessage.id);
      if (msgTarget) {
        msgTarget.text = msg;
        msgTarget.status = 'error';
      }
      isSending.value = false;
    },
    onTimeout() {
      const msgTarget = messages.value.find(m => m.id === assistantMessage.id);
      if (msgTarget) {
        msgTarget.text = 'Tiempo de espera agotado.';
        msgTarget.status = 'error';
      }
      isSending.value = false;
    }
  });
};
</script>
