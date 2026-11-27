<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const chats = useChatsStore()
const { show } = useToast()
const id = computed(() => Number(route.params.id))
const chat = computed(() => chats.chats.find(c => c.id === id.value))
const msgs = computed(() => chats.messages[id.value] ?? [])
const text = ref('')
let timer: ReturnType<typeof setInterval> | undefined

function toBottom() { nextTick(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })) }

async function boot() {
  if (!auth.logged) return
  if (!chats.loaded) await chats.loadChats()
  await chats.loadMessages(id.value)
  toBottom()
  clearInterval(timer)
  // Atualiza a cada 5 segundos enquanto a conversa está aberta (depois dá para trocar por WebSocket).
  timer = setInterval(() => { if (!document.hidden) chats.loadMessages(id.value, true) }, 5000)
}
onMounted(boot)
watch(() => auth.logged, boot)
onBeforeUnmount(() => clearInterval(timer))
watch(() => msgs.value.length, toBottom)

async function send() {
  const t = text.value.trim()
  if (!t) return
  text.value = ''
  await chats.send(id.value, t)
}
</script>

<template>
  <div>
    <div v-if="!auth.logged" class="gate">
      <h1>Entre para ver suas conversas</h1>
      <button class="btn" @click="auth.askLogin = true"><span class="mk" />Entrar ou criar conta</button>
      <NuxtLink to="/" class="link-btn">Voltar ao início</NuxtLink>
    </div>

    <template v-else>
      <header>
        <div class="pagebar-row">
          <NuxtLink to="/chats" class="ico" aria-label="Voltar às conversas"><Icon name="back" :size="28" /></NuxtLink>
          <span class="pagebar-title">Voltar</span>
        </div>
        <div class="chat-head">
          <UserAvatar :name="chat?.user ?? 'Conversa'" />
          <strong>{{ chat?.user ?? 'Conversa' }}</strong>
          <span class="dots" aria-hidden="true"><i /><i /><i /></span>
        </div>
        <div class="zig" />
      </header>

      <p v-if="chats.demo" class="chat-note" role="status">Modo demonstração: as mensagens não são salvas.</p>
      <p v-if="chats.loaded && !chat" class="chat-note">Conversa não encontrada. <NuxtLink to="/chats" class="link-btn">Voltar</NuxtLink></p>

      <ul class="chat-msgs" aria-label="Mensagens" aria-live="polite">
        <li v-for="m in msgs" :key="m.id" class="chat-msg" :class="{ mine: m.mine }">{{ m.text }}<small>{{ m.at }}</small></li>
      </ul>
      <p v-if="chat && !msgs.length" class="chat-note">Nenhuma mensagem ainda. Diga oi!</p>

      <form class="chat-bar" @submit.prevent="send">
        <button type="button" aria-label="Anexar" @click="show('Em breve')"><Icon name="plus" :size="26" /></button>
        <input v-model="text" placeholder="Mensagem" aria-label="Mensagem" autocomplete="off" enterkeyhint="send">
        <button type="button" aria-label="Gravar áudio" @click="show('Em breve')"><Icon name="mic" :size="26" /></button>
      </form>
    </template>
  </div>
</template>
