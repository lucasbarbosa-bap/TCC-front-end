<script setup lang="ts">
const auth = useAuthStore()
const chats = useChatsStore()
const adding = ref(false)
const name = ref('')
const busy = ref(false)

function boot() { if (auth.logged) chats.loadChats() }
onMounted(boot)
watch(() => auth.logged, boot)

async function start() {
  const u = name.value.trim()
  if (!u || busy.value) return
  busy.value = true
  const chat = await chats.start(u)
  busy.value = false
  if (chat) { adding.value = false; name.value = ''; navigateTo(`/chats/${chat.id}`) }
}
</script>

<template>
  <div>
    <PageBar title="Chats" />
    <div v-if="!auth.logged" class="gate">
      <h1>Entre para ver suas conversas</h1>
      <p>Crie uma conta ou entre para conversar com outros estudantes.</p>
      <button class="btn" @click="auth.askLogin = true"><span class="mk" />Entrar ou criar conta</button>
    </div>

    <template v-else>
      <h1 class="chats-title">Chats</h1>
      <p v-if="chats.demo" class="chat-note" role="status">Modo demonstração: o back-end ainda não tem conversas.</p>
      <p v-else-if="chats.loading && !chats.loaded" class="chat-note" role="status">Carregando conversas… O servidor pode levar até 1 minuto para acordar.</p>
      <p v-else-if="chats.error" class="chat-note" role="alert">{{ chats.error }} <button @click="chats.loadChats()">Tentar de novo</button></p>

      <ul class="chat-list">
        <li v-for="c in chats.chats" :key="c.id">
          <NuxtLink :to="`/chats/${c.id}`" class="chat-row"><UserAvatar :name="c.user" /><span>{{ c.user }}</span></NuxtLink>
        </li>
      </ul>
      <p v-if="chats.loaded && !chats.chats.length" class="chat-note">Você ainda não tem conversas. Toque no balão para começar uma.</p>

      <button class="fab chat" aria-label="Nova conversa" @click="adding = true"><Icon name="chatplus" :size="56" /></button>

      <BaseSheet :open="adding" label="Nova conversa" @close="adding = false">
        <form style="display:grid;gap:14px;justify-items:center" @submit.prevent="start">
          <h2>Nova conversa</h2>
          <label class="field" style="width:100%">Usuario<input v-model="name" autocomplete="off" placeholder="nome de usuário"></label>
          <div class="row2">
            <button type="button" class="btn" @click="adding = false"><span class="mk" />Cancelar</button>
            <button type="submit" class="btn" :disabled="busy"><span class="mk" />{{ busy ? 'Iniciando…' : 'Iniciar' }}</button>
          </div>
        </form>
      </BaseSheet>
    </template>
  </div>
</template>
