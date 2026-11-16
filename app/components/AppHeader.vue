<script setup lang="ts">
const store = usePostsStore()
const auth = useAuthStore()
const drawer = useState('drawer', () => false)
const tab = defineModel<string>('tab', { required: true })
const searching = ref(false)
const input = ref<HTMLInputElement>()

async function openSearch() { searching.value = true; await nextTick(); input.value?.focus() }
function closeSearch() { if (!store.query) searching.value = false }
function clear() { store.query = ''; searching.value = false }
</script>

<template>
  <header class="hdr">
    <div class="hdr-bar">
      <button class="avatar-btn" aria-label="Abrir menu" @click="drawer = true"><UserAvatar :name="auth.display" /></button>
      <Transition name="swap" mode="out-in">
        <div v-if="!searching" key="logo" class="hdr-mid">
          <!-- troque "logo" pela logo oficial; clicar nela volta para o início -->
          <NuxtLink to="/" class="logo" aria-label="Ir para o início">logo</NuxtLink>
          <button class="ico end" aria-label="Buscar" @click="openSearch"><Icon name="search" :size="30" /></button>
        </div>
        <div v-else key="search" class="hdr-mid search">
          <input ref="input" v-model="store.query" type="search" placeholder="Buscar dúvidas, tags ou pessoas"
                 aria-label="Buscar" @blur="closeSearch" @keyup.esc="clear">
          <Icon name="search" :size="26" />
        </div>
      </Transition>
    </div>
    <TabBar v-model="tab" class="around" :tabs="[{ id: 'foryou', label: 'para você' }, { id: 'following', label: 'seguindo' }]" />
  </header>
</template>
