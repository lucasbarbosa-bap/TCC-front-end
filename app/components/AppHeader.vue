<script setup lang="ts">
const store = usePostsStore()
const auth = useAuthStore()
const drawer = useState('drawer', () => false)
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
          <!-- o livro é a logo provisória: clicar nele volta para o início -->
          <NuxtLink to="/" class="ico" aria-label="Ir para o início"><Icon name="book" :size="42" /></NuxtLink>
          <button class="ico end" aria-label="Buscar" @click="openSearch"><Icon name="search" :size="38" /></button>
        </div>
        <div v-else key="search" class="hdr-mid search">
          <input ref="input" v-model="store.query" type="search" placeholder="Buscar dúvidas, tags ou pessoas" aria-label="Buscar" @blur="closeSearch" @keyup.esc="clear">
          <Icon name="search" :size="26" />
        </div>
      </Transition>
    </div>
    <div class="zig" />
  </header>
</template>
